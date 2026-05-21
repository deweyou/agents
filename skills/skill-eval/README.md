# skill-eval

> Evaluation infrastructure for repository skills: generate eval cases, run
> agent CLI test cases, grade transcripts, and summarize routing accuracy.

## What it does

`skill-eval` helps maintain confidence that skills trigger at the right time and
follow their required workflows. It supports two actions:

1. Generate `<skill>/evals/evals.json` from a target `SKILL.md`.
2. Run that eval file through `scripts/run.js`, an agent CLI, and an LLM grader.

The default recommended execution mode is **routing mode**. Routing mode checks
whether a prompt should trigger a skill and what the agent would do next without
actually executing the user's task.

Running evals invokes LLMs. One case normally includes at least one call to the
agent under test and one call to the grader.

## When it triggers

Use this skill when the user explicitly asks to:

- write eval cases for a skill
- complete or update a skill's eval suite
- run a skill's evals
- test whether a skill routes correctly
- evaluate skill trigger accuracy

Do not run evals merely because a skill changed. This repository requires eval
case files to be updated after every skill addition or modification, but
executing those cases still requires an explicit user request because it spends
LLM tokens.

## Core Concepts

| Concept | Meaning |
|---|---|
| skill | The target capability directory, for example `skills/code-knowledge`. |
| evals.json | The eval suite, stored at `<skill>/evals/evals.json`. |
| case | One realistic user prompt plus expectations. |
| expectation | An objectively gradable assertion, such as skill triggered, skill rejected, clarification asked, or script planned. |
| agent | The agent CLI under test, usually `codex`, `claude`, or a custom command template. |
| grader | The LLM CLI that reads the transcript and returns PASS/FAIL JSON. |
| routing mode | Tests skill selection and planned actions without real side effects. |
| execute mode | Gives the raw prompt to the agent as a real task, which may run commands or edit files. |

## Eval File Format

```json
{
  "skill_name": "<skill-name>",
  "evals": [
    {
      "id": 1,
      "prompt": "<realistic user wording>",
      "expected_output": "<plain-language summary of the expected result>",
      "expectations": [
        "Triggered the <skill-name> skill",
        "Did NOT trigger <other-skill>",
        "Asked the user to clarify X before doing Y"
      ]
    }
  ]
}
```

`prompt` is the input sample. Write it the way a real user would ask.

`expected_output` is a human-readable case summary.

`expectations` are the grading assertions. They must be objectively checkable
from the transcript. Avoid subjective assertions such as "answered well".

Healthy eval suites include positive triggers, negative triggers, workflow
constraints, and ambiguous prompts when ambiguity is part of the skill boundary.

## Generating Evals

To generate or update cases:

1. Read the target skill's `SKILL.md`.
2. Identify trigger boundaries, nearby non-triggers, required clarifications,
   scripts, side-effect limits, and output rules.
3. Draft realistic prompts across positive, negative, workflow-constraint, and
   ambiguous categories.
4. Write `<skill>/evals/evals.json`.
5. Validate that the file is valid JSON.

Generating eval case files does not require running the LLM eval runner.

## Running Evals

Basic routing run:

```bash
node skills/skill-eval/scripts/run.js \
  --skill <skill-name> \
  --mode routing
```

Run one case:

```bash
node skills/skill-eval/scripts/run.js \
  --skill <skill-name> \
  --mode routing \
  --case 3
```

Use an explicit eval file:

```bash
node skills/skill-eval/scripts/run.js \
  --evals skills/<skill-name>/evals/evals.json \
  --mode routing
```

Keep temporary artifacts for debugging:

```bash
node skills/skill-eval/scripts/run.js \
  --skill <skill-name> \
  --mode routing \
  --keep-runs
```

The script's default `--mode` is `execute` for backward compatibility. Pass
`--mode routing` explicitly for normal trigger-accuracy checks.

## Options

| Option | Meaning |
|---|---|
| `--skill <name>` | Read `skills/<name>/evals/evals.json`. |
| `--evals <path>` | Use an explicit eval file path. |
| `--agent auto\|codex\|claude\|'<cmd>'` | Agent under test. Defaults to `auto`. |
| `--grader auto\|codex\|claude\|'<cmd>'` | Grader agent. Defaults to the same preset as `--agent`. |
| `--case <id>` | Run one case. |
| `--mode execute\|routing` | Execution mode. Prefer `routing` for skill trigger checks. |
| `--out <dir>` | Output directory. Defaults to a system temp directory. |
| `--keep-runs` | Keep artifacts unless the output is inside `<skill>/evals/runs/`. |
| `--timeout <sec>` | Per-call timeout. Default is 300 seconds. |
| `--timeout-retry <sec>` | Longer timeout for one timeout retry. Default is `2x --timeout`. |
| `--no-timeout-retry` | Disable timeout retry. |
| `--concurrency <n>` | Case concurrency. Default is 3. |
| `--no-retry-infra-fail` | Disable the serial retry pass for agent or grader process failures. |

Custom command templates must include `{PROMPT_FILE}`:

```bash
node skills/skill-eval/scripts/run.js \
  --skill <skill-name> \
  --mode routing \
  --agent 'codex exec --ephemeral --sandbox read-only "$(cat {PROMPT_FILE})"'
```

## Agent Presets

`--agent auto` chooses a preset from the current harness environment. If the
harness cannot be detected, it falls back to `claude`.

Preset templates live in `references/`:

| Preset | Routing | Execute | Grader |
|---|---|---|---|
| `codex` | `codex exec --ephemeral --sandbox read-only ...` | `codex exec ...` | `codex exec --ephemeral --sandbox read-only ...` |
| `claude` | `claude --print ...` | `claude --print ...` | `claude --print ...` |

Do not add `--dangerously-bypass-approvals-and-sandbox` to Codex routing evals.
It increases the risk of accidental execution.

## Adding Another Code Agent

`scripts/run.js` receives agent behavior from `references/<name>.md`. A new code
agent can be added when it meets these requirements:

| # | Requirement | Why it matters |
|---:|---|---|
| 1 | Supports headless batch mode: receives a prompt, completes, and exits. | Otherwise the runner waits until timeout. |
| 2 | Can receive a prompt through an argument, stdin, or file using `{PROMPT_FILE}`. | The runner needs to inject each case prompt. |
| 3 | Writes useful output to stdout. | The grader needs a transcript. |
| 4 | Can constrain routing mode from real execution through sandboxing or strong prompt compliance. | Routing mode loses its safety advantage otherwise. |
| 5 | Exits cleanly after stdin closes. | The runner closes stdin for child CLIs. |
| 6 | Uses stable exit codes. | Infra-fail retries depend on success vs failure status. |

Recommended qualities:

| # | Recommendation | Benefit |
|---:|---|---|
| 7 | Stateless or ephemeral execution. | Repeated evals avoid local session drift. |
| 8 | Supports long prompts of at least 8K tokens. | Routing prompts embed the target `SKILL.md`. |
| 9 | Exposes an environment marker for auto-detection. | `--agent auto` can choose the preset. |
| 10 | As a grader, can output plain JSON without banners or Markdown. | Reduces JSON parse failures. |

To add a preset, create `references/<my-agent>.md` with fenced blocks named
`agent-routing`, `agent-execute`, and `grader`. Each block should contain one
command template with `{PROMPT_FILE}`.

## Outputs

Default run directory:

```text
<tmp>/skill-eval-runs/<skill>/<timestamp>/
├── case-1.prompt
├── case-1.transcript
├── case-1.grader-prompt
├── case-1.grader-output.txt
├── case-1.grading.json
└── grading.json
```

Without `--keep-runs`, the run directory is deleted after the summary. With
`--keep-runs`, it is retained unless it is inside `<skill>/evals/runs/`.

Never keep transcripts, grading JSON, or run artifacts under
`<skill>/evals/runs/`; the runner deletes that directory to avoid accidental
commits.

Exit codes:

| Code | Meaning |
|---:|---|
| 0 | All expectations passed. |
| 1 | At least one expectation failed. |
| 2 | Script, agent, or grader infrastructure failed. |

## Reporting

After a run, report a table like this:

| Case | Prompt | Result | Failure |
|---:|---|---:|---|
| 1 | Original user prompt | 2/3 | Brief reason for failed expectations; use `-` if all passed. |

Then summarize failure categories, timeout retries, and whether artifacts were
retained.

## Maintenance Notes

- Update this README after changing `scripts/run.js` options, defaults, or
  artifacts.
- Update the Agent Preset table after changing `references/*-agent.md`.
- Update the running and grading sections after changing grader behavior.
- Document new modes with their use cases, risks, and example commands.
- Update `detectAgentPreset()` when a new preset should work with `--agent auto`.
- Keep fallback and failure-classification documentation aligned with the runner.

## Installation

```bash
npx skills add <agents-repo-url> --skill skill-eval
```

## Source

This skill is maintained in `<agents-repo-url>` and indexed by
`agent asset CLI update`.
