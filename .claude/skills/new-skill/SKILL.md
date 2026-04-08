---
name: new-skill
version: 1.2.0
description: >
  Scaffold and create a new skill for this project using the skill-creator workflow,
  with project conventions automatically enforced. Use this skill whenever the user
  wants to add a new skill, build a skill from scratch, create a custom Claude skill,
  or says things like "make a new skill", "add a skill for X", "create a skill that does Y".
  Always use this skill — don't create skill files manually without it.
---

# new-skill

A guided workflow for adding new skills to this project. It wraps the `skill-creator`
process and enforces the three project conventions that apply to every skill created here.

## Project conventions (enforced by this skill)

Before writing a single line, confirm these three constraints are satisfied — they are
non-negotiable for every skill in this repo:

1. **Save location** — The finished skill directory must be placed under `./skills/`
   (project root), not anywhere else. Example: `skills/my-feature/SKILL.md`.

2. **Naming** — Skill directory names and the `name` frontmatter field must be
   **kebab-case** (all lowercase, words separated by hyphens). No underscores, no
   CamelCase. Good: `data-export`. Bad: `DataExport`, `data_export`.

3. **Version** — Every `SKILL.md` must include a `version` field in its YAML
   frontmatter. Start at `1.0.0` and follow semver. The version lives alongside
   `name` and `description`:

   ```yaml
   ---
   name: my-skill
   version: 1.0.0
   description: ...
   ---
   ```

## Workflow

Follow the full `skill-creator` process — this skill does not replace it, it sits on
top of it. The steps are:

### 1. Capture intent

Ask the user:
- What should this skill enable Claude to do?
- When should it trigger? (example user phrases)
- What does the output look like?
- Does it need test cases to verify correctness, or is the output subjective?

Derive a **kebab-case name** from the user's intent and confirm it with them before
proceeding. For example, if they say "a skill for summarizing PRs", suggest `pr-summary`.

### 2. Draft the SKILL.md

Write a draft at `skills/<kebab-name>/SKILL.md`. The frontmatter must include all
three required fields:

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

### 3. Test and iterate (via skill-creator)

Use the `skill-creator` eval loop:
- Write 2–3 realistic test prompts to `evals/evals.json`
- Spawn with-skill and without-skill subagent runs in the same turn
- Draft assertions while runs are in progress
- Generate the eval viewer for the user to review
- Improve the skill based on feedback; repeat until satisfied

### 4. Finalize and place

Once the user is happy with the skill:
- Ensure the directory is at `skills/<kebab-name>/` (move it if you drafted it elsewhere)
- Double-check: kebab-case name, version field present, saved under `./skills/`
- Announce the final path to the user

### 5. Create the skill README.md

Every skill directory gets its own `README.md` alongside `SKILL.md`. This file is for
humans browsing the repo — it explains what the skill does and how to install it.

Write `skills/<kebab-name>/README.md` using this template (fill in the blanks from
the skill's name, version, and description):

```markdown
# <skill-name>

> <One-sentence description of what the skill enables Claude to do.>

## What it does

<2–4 sentences describing the skill's capabilities, when it activates, and what the
output looks like. Be concrete — mention the kinds of tasks it handles.>

## When it triggers

<List the user phrases or contexts that cause Claude to invoke this skill. Mirror
the description field in SKILL.md, but written for a human reader.>

## Installation

```bash
npx skills add https://github.com/deweyou/skills --skill <kebab-name>
```

## Version

`<version>` — see [SKILL.md](./SKILL.md) for the changelog.
```

Keep it short. The README is a quick reference; the full instructions live in SKILL.md.

### 6. Update project docs

After placing the skill, update two files so the project stays self-documenting:

**CLAUDE.md** — add a brief entry for the new skill. It already has an "Adding a New Skill"
section; add a note about the new skill nearby, or create a "Skills" subsection if one
doesn't exist. One or two lines is enough — the skill's own SKILL.md is the authority.

**README.md** — find or create a "Skills" section and add the skill to a table:

```markdown
## Skills

| Skill | Version | Description |
|-------|---------|-------------|
| `skill-name` | `1.0.0` | One-line summary of what it does. |
```

If the table already exists, append a row. Keep descriptions to a single line —
accurate and direct, not promotional.

## Bumping the version

When **updating** an existing skill (not creating one from scratch), increment the
version field according to semver:

| Change | Bump |
|---|---|
| New feature / expanded behavior | minor (`1.0.0` → `1.1.0`) |
| Bug fix / small correction | patch (`1.0.0` → `1.0.1`) |
| Breaking change in behavior/interface | major (`1.0.0` → `2.0.0`) |

Always update the version when you touch a skill — it's how we know which version is deployed.

## Quick checklist before finishing

- [ ] Skill directory is under `skills/` (not `.claude/skills/` or anywhere else)
- [ ] Directory name is kebab-case
- [ ] `name` frontmatter matches directory name, also kebab-case
- [ ] `version` field is present in frontmatter (starts at `1.0.0`)
- [ ] `description` clearly describes when to trigger
- [ ] skill-creator eval loop was run and user approved the output
- [ ] `skills/<name>/README.md` created with description, triggers, and install command
- [ ] CLAUDE.md updated with an entry for the new skill
- [ ] README.md Skills table updated with skill name, version, and description
