---
name: git-delivery
description: >
  Manage Dewey's git delivery workflow. Use this skill at the start of a coding
  session to sync from the primary branch and create a task branch unless the user
  explicitly says to continue on the current branch. Also use when the user says
  "提交吧", "commit it", "发一下", "ship it", "开 PR", "push", or asks to finish
  work, so the agent runs memory check, commit, push, PR creation, and CI follow-up.
---

# Git Delivery

Run the repository delivery flow without making the user spell out every git step.

## Start Of Work

Use this section when beginning a new implementation task.

1. Check `git status --short` and the current branch.
2. Identify the primary branch, usually `main`.
3. Unless the user explicitly says to continue on the current branch, switch to the
   primary branch and pull the latest remote state.
4. Create a dedicated task branch with a descriptive name.
5. Do not discard or overwrite existing user changes. If local changes block a safe
   branch switch, stop and ask how to handle them.

If the user says "continue here", "use this branch", or similar, stay on the current
branch and state that choice.

## Finish Work

Use this section when the user asks to commit, push, open a PR, or ship the work.

1. Inspect `git status --short`.
2. Run `repo-memory` before committing when that skill is available.
3. Run relevant verification commands for the changed files.
4. Stage only intended files.
5. Commit with a concise conventional message when the repo uses conventional
   commits, otherwise match local history.
6. Push the branch.
7. Open a pull request using the repository's normal tool or hosting CLI.
8. Summarize the problem, solution, and verification in the PR body.

Never include unrelated dirty files in the commit. If unrelated changes exist, leave
them unstaged and call them out.

## CI Follow-Up

After a PR is opened or a pushed branch has CI:

- Create a follow-up automation or reminder to check CI when the environment
  supports it.
- If CI fails, tell the user what failed and ask whether to start a separate repair
  pass.
- When subagents are available and the user approves, run CI repair in a separate
  branch or isolated workstream so the main delivery flow stays readable.

## Output

Report:

- branch used or created
- commit hash and message
- push destination
- PR URL when created
- verification commands run
- CI follow-up status
