# AGENTS.md

This file documents the repository workflow for creating and updating skills.

## Overview

Use this guide whenever you need to add a new skill or modify an existing one in this
repository. It consolidates the conventions and maintenance steps that were previously
split between `/new-skill` and `/update-skill`.

## Managing Skills

### Repository conventions

These rules apply to every skill in this repo:

1. Skills live under `skills/<kebab-name>/`
2. Directory names and the `name` frontmatter field must be `kebab-case`
3. Every `SKILL.md` must include a semver `version` field
4. Every skill directory must include a `README.md` with description and install instructions

### Creating a new skill

When creating a skill:

1. Capture the intent
   Ask what the skill should do, when it should trigger, what output it should produce,
   and whether correctness needs explicit test cases.
2. Choose the name
   Derive a `kebab-case` skill name from the user's intent and confirm it before writing files.
3. Draft the skill
   Create `skills/<name>/SKILL.md` with frontmatter for `name`, `version`, and `description`.
   New skills start at `1.0.0`.
4. Test and iterate
   Use the `skill-creator` eval loop with realistic prompts, compare with-skill and
   without-skill behavior, and iterate until approved.
5. Finalize the directory
   Confirm the skill remains under `skills/<name>/`.
6. Create `README.md`
   Add `skills/<name>/README.md` describing what the skill does, when it triggers, and
   how to install it.
7. Update repo docs
   Update `README.md`'s Skills table and any high-signal project guidance that should
   reference the new skill.

### Updating an existing skill

When updating a skill:

1. Identify the skill
   The target must already live under `skills/<name>/`. Read its current `SKILL.md` in full first.
2. Clarify the change
   Determine whether the request is a bug fix, feature, or behavioral change.
3. Snapshot and edit
   Preserve a baseline copy if needed, then change only the relevant parts of the skill.
4. Test and iterate
   Run the `skill-creator` eval loop against the updated skill and the prior version,
   then refine until approved.
5. Bump the version
   Every edit requires a semver bump:

   | Change | Bump |
   |---|---|
   | Bug fix / small correction | patch |
   | New feature / expanded behavior | minor |
   | Breaking behavior/interface change | major |

6. Sync repo docs
   Update `README.md`'s Skills table and any project guidance that should reflect the change.

## Checklist

- Skill directory is under `skills/`
- Directory name and `name` frontmatter are `kebab-case`
- `version` exists and is correct for the change
- `description` states when the skill should trigger
- `README.md` exists alongside `SKILL.md`
- `skill-creator` evaluation was run before completion
- Relevant project docs were updated
