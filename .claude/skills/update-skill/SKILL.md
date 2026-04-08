---
name: update-skill
version: 1.0.0
description: >
  Update, improve, or fix an existing skill in the skills/ directory of this project.
  Use this skill whenever the user wants to modify, extend, refactor, or fix a bug in
  an existing skill — phrases like "update the X skill", "improve skills/foo", "fix a
  bug in my Y skill", "add a feature to skill Z", "the X skill isn't working right",
  or "change how skill W behaves". Always use this skill rather than editing skill
  files by hand.
---

# update-skill

A structured workflow for modifying an existing skill in this project. It covers:
reading the current skill, understanding what needs to change, running the
skill-creator iteration loop, bumping the version, and keeping project docs in sync.

## Step 1: Identify the skill

Ask the user for the skill they want to update if they haven't specified it. The skill
must live under `skills/` (project root). Common paths:

```
skills/my-feature/SKILL.md
skills/another-skill/SKILL.md
```

Read the current `SKILL.md` in full before doing anything else — you need to understand
the existing behavior, description, and version before deciding what to change.

## Step 2: Clarify the change

Ask the user what they want to change if it isn't already clear:

- What's wrong or missing with the current behavior?
- What should the updated skill do differently?
- Is this a bug fix, a new feature, or a behavioral change? (This determines how much
  to bump the version — see Step 4.)

Understanding the *why* behind the change is more important than the *what* — a clear
motivation helps you write better instructions that generalize well.

## Step 3: Make the changes (skill-creator loop)

Follow the `skill-creator` iteration workflow on the existing skill. Treat this as
"improving an existing skill" — not creating from scratch:

1. **Snapshot** the current skill before editing (so you can use it as a baseline):
   ```bash
   cp -r skills/<name> /tmp/<name>-snapshot/
   ```

2. **Edit** the skill. Apply only what's needed — don't rewrite sections that aren't
   related to the change. Explain the *why* in instructions rather than issuing blunt
   commands.

3. **Test**: write 2–3 test prompts that cover the changed behavior. Spawn with-skill
   and old-skill (snapshot) runs in the same turn. Grade and generate the eval viewer
   for the user to review.

4. **Iterate** based on feedback until the user is happy.

Keep naming unchanged — the skill's directory name and `name` frontmatter must stay
the same (kebab-case).

## Step 4: Bump the version

After the user approves the changes, update the `version` field in SKILL.md frontmatter
following semver:

| Type of change | Bump | Example |
|---|---|---|
| Bug fix / small correction | **patch** | `1.2.3` → `1.2.4` |
| New feature / expanded behavior | **minor** | `1.2.3` → `1.3.0` |
| Breaking change in interface or behavior | **major** | `1.2.3` → `2.0.0` |

Always bump — never leave the version unchanged after editing a skill.

## Step 5: Update project docs

After bumping the version, update two files:

### CLAUDE.md

CLAUDE.md documents high-level project conventions. Check whether the skill being
updated is mentioned there. If it is, update the relevant lines to reflect the new
behavior. If the skill is not mentioned but the change is significant enough that
other developers should know about it, add a brief entry under the appropriate
section (usually "Adding a New Skill" or a "Skills" subsection).

Keep CLAUDE.md entries short — one or two lines per skill is enough. The skill's own
SKILL.md is the authoritative reference; CLAUDE.md is just a signpost.

### README.md

README.md is the public-facing project overview. Check whether there is a "Skills"
section (or similar) that lists available skills. If it exists, update the entry for
this skill to reflect the new version and any changed description. If no such section
exists yet, add one using this format:

```markdown
## Skills

| Skill | Version | Description |
|-------|---------|-------------|
| `skill-name` | `1.2.0` | One-line summary of what it does. |
```

Add the updated skill to the table (or create the table if it doesn't exist). Keep
descriptions to one line — precise and honest, not marketing copy.

## Quick checklist before finishing

- [ ] Skill files are still under `skills/<name>/` (unchanged location)
- [ ] Directory name and `name` frontmatter are still kebab-case and unchanged
- [ ] `version` field has been bumped (patch / minor / major as appropriate)
- [ ] `description` frontmatter updated if behavior changed
- [ ] skill-creator eval loop was run and user approved the output
- [ ] CLAUDE.md updated if the skill is mentioned or should be mentioned there
- [ ] README.md Skills table updated with new version and description
