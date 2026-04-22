# AGENTS.md

This file documents the repository workflow for creating and updating skills.

## Overview

Use this guide whenever you need to add a new skill or modify an existing one in this
repository. It consolidates the conventions and maintenance steps that were previously
split between `/new-skill` and `/update-skill`.

## Repository Conventions

These rules apply to every skill in this repo — non-negotiable:

1. **Save location** — Skills must live under `./skills/` (project root), e.g. `skills/my-feature/SKILL.md`. Not `.claude/skills/` or anywhere else.

2. **Naming** — Directory names and the `name` frontmatter field must be **kebab-case**
   (all lowercase, words separated by hyphens). No underscores, no CamelCase.
   Good: `data-export`. Bad: `DataExport`, `data_export`.

3. **Version** — Every `SKILL.md` must include a `version` field in its YAML frontmatter.
   Start at `1.0.0` and follow semver:

   ```yaml
   ---
   name: my-skill
   version: 1.0.0
   description: ...
   ---
   ```

## Creating a New Skill

### 1. Capture intent

Ask the user:
- What should this skill enable Claude to do?
- When should it trigger? (example user phrases)
- What does the output look like?
- Does it need test cases to verify correctness, or is the output subjective?

Derive a **kebab-case name** from the user's intent and confirm it with them before
proceeding. For example, if they say "a skill for summarizing PRs", suggest `pr-summary`.

### 2. Draft the SKILL.md

Write a draft at `skills/<kebab-name>/SKILL.md`. The frontmatter must include:

```yaml
---
name: <kebab-name>
version: 1.0.0
description: >
  <What it does + when to trigger — be specific and slightly pushy so Claude
  actually uses it. List key trigger phrases.>
---
```

Then write the skill body: instructions, examples, output format, edge cases.

### 3. Test and iterate

Use the `skill-creator` eval loop:
- Write 2–3 realistic test prompts to `evals/evals.json`
- Spawn with-skill and without-skill subagent runs in the same turn
- Draft assertions while runs are in progress
- Generate the eval viewer for the user to review
- Improve the skill based on feedback; repeat until satisfied

### 4. Finalize and place

Once the user is happy with the skill:
- Ensure the directory is at `skills/<kebab-name>/` (move it if drafted elsewhere)
- Double-check: kebab-case name, version field present, saved under `./skills/`

### 5. Create the skill README.md

Every skill directory gets its own `README.md` alongside `SKILL.md`:

```markdown
# <skill-name>

> <One-sentence description of what the skill enables Claude to do.>

## What it does

<2–4 sentences describing the skill's capabilities, when it activates, and what the
output looks like.>

## When it triggers

<List the user phrases or contexts that cause Claude to invoke this skill.>

## Installation

\`\`\`bash
npx skills add https://github.com/deweyou/skills --skill <kebab-name>
\`\`\`

## Version

`<version>` — see [SKILL.md](./SKILL.md) for the changelog.
```

### 6. Update project docs

After placing the skill, update:

**README.md** — find or create a "Skills" section and add the skill to a table:

```markdown
## Skills

| Skill | Version | Description |
|-------|---------|-------------|
| `skill-name` | `1.0.0` | One-line summary of what it does. |
```

## Updating an Existing Skill

### 1. Identify the skill

The skill must live under `skills/`. Read the current `SKILL.md` in full before
doing anything else.

### 2. Clarify the change

Ask the user what they want to change:
- What's wrong or missing with the current behavior?
- What should the updated skill do differently?
- Is this a bug fix, a new feature, or a behavioral change?

### 3. Make the changes

1. **Snapshot** the current skill before editing (so you can use it as a baseline):
   ```bash
   cp -r skills/<name> /tmp/<name>-snapshot/
   ```
2. **Edit** the skill. Apply only what's needed — don't rewrite unrelated sections.
3. **Test**: write 2–3 test prompts that cover the changed behavior. Spawn with-skill
   and old-skill (snapshot) runs in the same turn. Grade and generate the eval viewer
   for the user to review.
4. **Iterate** based on feedback until the user is happy.

### 4. Bump the version

After the user approves the changes, update the `version` field following semver:

| Type of change | Bump | Example |
|---|---|---|
| Bug fix / small correction | **patch** | `1.2.3` → `1.2.4` |
| New feature / expanded behavior | **minor** | `1.2.3` → `1.3.0` |
| Breaking change in interface or behavior | **major** | `1.2.3` → `2.0.0` |

### 5. Update project docs

Update the README.md Skills table with the new version and any changed description.

## Quick Checklist

- [ ] Skill directory is under `skills/` (not `.claude/skills/` or elsewhere)
- [ ] Directory name is kebab-case
- [ ] `name` frontmatter matches directory name, also kebab-case
- [ ] `version` field is present in frontmatter (starts at `1.0.0`)
- [ ] `description` clearly describes when to trigger
- [ ] `skills/<name>/README.md` created with description, triggers, and install command
- [ ] README.md Skills table updated
