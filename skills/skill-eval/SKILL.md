---
name: skill-eval
description: >
  Repository-local skill evaluation workflow. Use this skill only when the user
  explicitly asks to generate skill eval cases, complete a skill's eval suite,
  run skill evals, test skill routing, or evaluate whether prompts trigger the
  right skill. It supports two actions: generate `<skill>/evals/evals.json`
  from a target `SKILL.md`, and run that eval set through `scripts/run.js`
  using a configurable agent CLI plus an LLM grader. Default to routing mode
  when running evals so the agent judges skill selection without executing the
  user's real task. Running evals calls LLMs and can cost money, so do not run
  evals unless the user explicitly asks for execution.
argument-hint: <generate | run> <skill-name> [--agent <cmd>] [--grader <cmd>]
user-invocable: true
allowed-tools: Bash, Read, Write, Edit
---

# skill-eval

Use this skill to maintain and run evaluation suites for repository skills.

It has two modes:

1. **Generate eval cases**: read a target skill's `SKILL.md`, identify its
   trigger boundaries and workflow constraints, then write
   `<skill>/evals/evals.json`.
2. **Run eval cases**: call `scripts/run.js` to execute each case with an agent
   CLI, collect transcripts, grade expectations with an LLM grader, and print a
   summary.

Running evals invokes LLMs. Generating or updating eval case files is cheap;
executing the eval runner is not.

## When To Use

Use this skill only when the user explicitly asks for skill eval work, for
example:

- "Write eval cases for the X skill"
- "Complete X's evals"
- "I want to test the X skill"
- "Run X's evals"
- "Test whether X routes correctly"
- "Evaluate X skill trigger accuracy"

Do not run evals just because a skill changed. In this repository, every new or
modified skill should receive an updated eval case file, but executing those
cases still requires an explicit user request because it spends LLM tokens.
If the user says a skill changed and asks to finish the task, treat that as a
request to update that skill's `evals/evals.json` when the behavior changed, but
not as permission to execute the LLM-backed eval runner.

## A. Generate Eval Cases

Generating `evals.json` is a creative task. Do not use the runner for this.

### Workflow

1. Read the target skill's `SKILL.md`, especially the YAML `description`,
   trigger language, decision tree, scripts, required clarifications, and
   forbidden actions.
2. Identify the trigger axes:
   - Which user prompts must trigger this skill?
   - Which similar prompts should route somewhere else?
   - Which prompts are ambiguous enough to require clarification?
   - Which workflow constraints must be visible after triggering?
   - Positive triggers, negative triggers, workflow constraints, and ambiguous
     prompts must all be named in routing/planning output for non-trivial skills.
   In routing or planning output for "complete missing evals" requests,
   explicitly say the update will cover positive triggers, negative triggers,
   workflow constraints, and ambiguous prompts when applicable.
3. If boundaries are unclear, ask the user. If the user already gave an explicit
   policy, derive cases from that policy.
4. Write `<skill_root>/evals/evals.json` using this schema:

```json
{
  "skill_name": "<skill-name>",
  "evals": [
    {
      "id": 1,
      "prompt": "<realistic user wording>",
      "expected_output": "<plain-language summary of the expected routing or behavior>",
      "expectations": [
        "Triggered the <skill-name> skill",
        "Did NOT trigger <other-skill>",
        "Asked the user to clarify X before doing Y"
      ]
    }
  ]
}
```

5. Cover at least these categories when the target skill is non-trivial:
   - Positive triggers: common prompts that should use the skill.
   - Negative triggers: nearby prompts that should not use the skill.
   - Workflow constraints: required clarifications, script choices, side-effect
     limits, or output rules.
   - Ambiguous prompts, when applicable.
6. Validate the JSON.
7. Tell the user that the eval set is ready. Do not suggest running it unless
   they asked to run evals.

### Case Quality

- Make each `prompt` sound like a real user request, not a test specification.
- Make each `expectations[]` item objectively gradable from a transcript.
- Prefer concrete expectations such as "Triggered the X skill", "Did NOT
  trigger Y", "Planned to call script Z with argument A", or "Asked for
  clarification before execution".
- Avoid subjective expectations such as "answered well" or "was helpful".
- Include negative cases. They are often more valuable than extra positive
  cases because they catch over-triggering.

## B. Run Eval Cases

### Command

```bash
node skills/skill-eval/scripts/run.js \
  --skill <skill-name> \
  --mode routing \
  [--agent auto|codex|claude|'<agent-cmd-template>'] \
  [--grader auto|codex|claude|'<grader-cmd-template>'] \
  [--case <id>] \
  [--out <dir>] \
  [--timeout <sec>] [--timeout-retry <sec>] [--no-timeout-retry]
```

You can also pass an eval file directly:

```bash
node .../run.js --evals <path/to/evals.json> --mode routing
```

### Options

| Option | Meaning |
|---|---|
| `--skill <name>` | Resolve `skills/<name>/evals/evals.json`. |
| `--evals <path>` | Use an explicit eval file path. |
| `--agent auto\|codex\|claude\|'<cmd>'` | Agent under test. Default is `auto`; custom commands must include `{PROMPT_FILE}`. |
| `--grader auto\|codex\|claude\|'<cmd>'` | Grader CLI. Defaults to the same preset as the agent. |
| `--case <id>` | Run one case. |
| `--mode routing\|execute` | `routing` judges skill selection without real execution; `execute` runs the prompt as a real task. |
| `--out <dir>` | Custom run directory. Defaults to a temporary directory. |
| `--keep-runs` | Keep run artifacts unless the output is inside `<skill>/evals/runs/`. |
| `--timeout <sec>` | Per-call timeout. Default is 300 seconds. |
| `--timeout-retry <sec>` | Retry timeout after one timeout. Default is `2x --timeout`. |
| `--no-timeout-retry` | Disable timeout retry. |
| `--concurrency <n>` | Number of cases to run concurrently. Default is 3. |
| `--no-retry-infra-fail` | Disable the serial retry pass for agent or grader process failures. |

### Agent Presets

```bash
--agent auto
--agent codex
--agent claude
--agent 'my-agent --input {PROMPT_FILE} --no-color'
```

Preset command templates live in:

- `references/codex-agent.md`
- `references/claude-code-agent.md`

Use `auto` unless the user explicitly asks for a specific harness. Do not ask
the user whether the current harness is Claude or Codex; the runner detects
that from environment markers.

When running evals for a skill, first use the existing
`skills/<skill>/evals/evals.json` file if it exists. If it does not exist, stop
and generate or ask to generate the eval file before running.

### Output

By default, runs are written under a system temp directory and deleted after the
summary:

```text
<tmp>/skill-eval-runs/<skill>/<timestamp>/
├── case-1.prompt
├── case-1.transcript
├── case-1.grader-prompt
├── case-1.grader-output.txt
├── case-1.grading.json
└── grading.json
```

Never retain eval artifacts under `<skill>/evals/runs/`. The runner deletes
that directory to prevent transcripts and grading output from being committed.
Use `--keep-runs` with the default temp directory or a repository-external
`--out` path when you need to inspect artifacts.

When the user asks to keep artifacts, explicitly state that artifacts must not be
kept under `<skill>/evals/runs/`; use a temp directory or repository-external
`--out` path with `--keep-runs`.

### Reporting

After running evals, report a table the user can paste into review:

| Case | Prompt | Result | Failure |
|---:|---|---:|---|
| 1 | Original user prompt | 2/3 | Brief reason for failed expectations; use `-` if all passed. |

Then summarize failure categories, timeout retries, and whether the run
directory was retained or deleted.

In routing or planning output for eval execution, explicitly promise this
case-level PASS/FAIL table and failure summary.

## Mode Selection

- **routing** is the default recommendation. It wraps the user's prompt in a
  routing-only task, embeds the target `SKILL.md`, and asks the agent to report
  `triggered_skills`, `rejected_skills`, `should_ask_clarification`,
  `planned_actions`, and evidence. It must not execute shell commands, perform
  downloads, launch apps, or modify files.
- **execute** sends the original prompt to the agent as a real task. Use it only
  when the user explicitly wants end-to-end behavior and accepts side effects.

Before executing a run, tell the user once that the run will invoke LLMs and may
cost money. Do not ask them to choose routine technical defaults such as agent
or grader preset.

## Grading Rules

- Skill routing and workflow compliance require an LLM grader; static grep is
  not enough.
- The grader is nondeterministic. A repeated run can differ slightly.
- Each case costs at least one agent call and one grader call.
- Agent CLI interfaces vary, so presets live in `references/`.
- Each case runs `agent -> grader` sequentially. Multiple cases may run
  concurrently.

## Optional Enforcement

Projects that want CI enforcement can add a hook or pre-push command that runs:

```bash
node .../run.js --skill <changed-skill> --mode routing
```

Because running evals is slow and token-expensive, prefer MR or pre-release
execution over every-commit execution unless the project explicitly chooses
that cost.
