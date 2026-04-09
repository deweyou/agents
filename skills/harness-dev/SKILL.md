---
name: harness-dev
description: "Spec-driven feature development workflow for frontend projects. Runs the full pipeline: specify → plan → tasks → implement → archive. Reads project constitution from knowledge/constitution.md and accumulates learnings after each feature. Use when the user says \"build feature X\", \"implement Y\", \"develop Z\", \"/harness-dev <description>\", or wants to start a new feature using the spec-driven workflow. Requires harness-init to have been run first."
version: 2.0.0
---

# Harness Dev

Spec-driven development workflow for frontend projects. Orchestrates the full pipeline from natural language description to implementation, then archives learnings back to the knowledge base.

Each step delegates to a detailed step file in `.claude/skills/harness-dev/steps/`. Read and execute those files at the appropriate point — do not improvise step logic inline.

## Prerequisites

`knowledge/.scripts/` must exist. If not, tell the user to run `/harness-init` first.

```bash
ls knowledge/.scripts/bash/create-new-feature.sh 2>/dev/null || echo "MISSING"
```

If MISSING:
> "Run `/harness-init` first to set up the harness-dev environment."
> Stop.

## Usage

```
/harness-dev <feature description>
```

---

## Workflow

Receive `$ARGUMENTS` as the feature description. Each checkpoint — pause and wait for user confirmation before proceeding.

---

### Step 1 — Create feature directory

Run:
```bash
bash knowledge/.scripts/bash/create-new-feature.sh --json --number "$(date '+%Y%m%d')" "$ARGUMENTS"
```

Parse the JSON output to get `BRANCH_NAME`, `SPEC_FILE`, `FEATURE_NUM`.

The script:
- Creates a git branch named `YYYYMMDD-feature-name`
- Creates `knowledge/specs/YYYYMMDD-feature-name/` with a blank `spec.md` from template

Show the user:
```
Feature directory created: knowledge/specs/BRANCH_NAME/
Branch: BRANCH_NAME
```

---

### Step 2 — Specify

Read `.claude/skills/harness-dev/steps/specify.md` and execute the full Outline described in that file. The feature description is: `$ARGUMENTS`

After completion, show the user a summary:
- Number of user stories and their priorities
- Key functional requirements
- Any NEEDS CLARIFICATION items resolved

**Checkpoint 1/5:**
> **Spec generated.**
> Please confirm: is the user story scope accurate? Anything missing or to cut?
> Reply "continue" or tell me what to adjust.

Wait for user confirmation before proceeding.

---

### Step 3 — Clarify (optional)

Ask:
> Do you want to clarify any ambiguous points in the spec first? (Reply "skip" to proceed)

- "skip" → go to Step 4
- Otherwise → read `.claude/skills/harness-dev/steps/clarify.md` and execute the full Outline; then continue to Step 4

---

### Step 4 — Plan

Read `.claude/skills/harness-dev/steps/plan.md` and execute the full Outline described in that file.

After completion, show the user key decisions:
- Tech stack confirmed
- Architecture approach
- Constitution check results (pass/fail per principle)

**Checkpoint 2/5:**
> **Plan generated.**
> Please confirm: are the technical approach and architecture decisions sound? These are costly to change later — review carefully.
> Reply "continue" or tell me what to adjust.

Wait for user confirmation.

---

### Step 5 — Tasks + Analyze

Read `.claude/skills/harness-dev/steps/tasks.md` and execute the full Outline described in that file.

After tasks.md is generated, immediately read `.claude/skills/harness-dev/steps/analyze.md` and execute the full Outline. This performs a cross-artifact consistency check against spec.md, plan.md, and tasks.md.

Show task count and any consistency risks found.

**Checkpoint 3/5:**
> **Tasks generated, consistency analysis complete.**
> N tasks across M phases. Address any flagged risks before proceeding.
> Reply "continue" to start implementation.

Wait for user confirmation.

---

### Step 6 — Implement

Read `.claude/skills/harness-dev/steps/implement.md` and execute the full Outline described in that file.

After all tasks complete:
> **Checkpoint 4/5: All tasks complete, build passing.**
> Ready for final review? Reply "continue" to run the checklist.

---

### Step 7 — Checklist

Read `.claude/skills/harness-dev/steps/checklist.md` and execute the full Outline described in that file.

Show the checklist and ask the user to review.

**Checkpoint 5/5:**
> **Checklist generated.**
> Complete the checklist items, then reply "archive" to trigger the archive step.

---

### Step 8 — Archive

Read `.claude/skills/harness-dev/steps/archive.md` and execute the full workflow described in that file.

---

## Notes

- Any checkpoint: if user requests changes, re-run the corresponding step (don't skip)
- If build/test commands are consistently failing, surface the issue clearly — don't silently skip
- The archive step is the most important for long-term value — don't skip it even if the user seems done
- Step files live at `.claude/skills/harness-dev/steps/` — always read them fresh, do not improvise their content from memory
