---
name: git-delivery
description: >
  Manage Dewey's git delivery workflow. Use this skill at the start of a coding
  session to sync from the primary branch and create a task branch unless the user
  explicitly says to continue on the current branch. Also use when the user says
  "提交吧", "commit it", "发一下", "ship it", "开 PR", "push", or asks to finish
  work, so the agent runs memory check, verification, intentional staging, commit,
  push, PR creation or exact blocker reporting, and CI follow-up. Always protect
  dirty work: never discard, overwrite, or stage unrelated files.
---

# Git Delivery

Run the repository delivery flow without making the user spell out every git step.

When invoked, make the safety and delivery decisions explicit. Reviewers need to
see the branch choice, dirty-work protection, intended staging boundary, PR
creation or blocker, and CI repair consent policy.

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

Always report the dirty-work decision:

- `dirty_work`: none, protected, or blocks branch switch
- `unrelated_files`: left untouched and unstaged
- `branch_action`: stayed, switched to primary, pulled primary, or created branch

## Finish Work

Use this section when the user asks to commit, push, open a PR, or ship the work.

1. Inspect `git status --short`.
2. Run `repo-memory` before committing when that skill is available.
3. Run relevant verification commands for the changed files.
4. Stage only intended files.
5. Commit with a concise conventional message when the repo uses conventional
   commits, otherwise match local history.
6. Push the branch.
7. Open a pull request using the repository's normal tool or hosting CLI. If a PR
   cannot be created, report the exact blocker, such as missing auth, missing remote,
   detached HEAD, no GitHub CLI, or no network.
8. Summarize the problem, solution, and verification in the PR body.

Never include unrelated dirty files in the commit. If unrelated changes exist, leave
them unstaged and call them out.

Always report the finish-work boundary:

- `repo_memory`: run, skipped with reason, or unavailable
- `verification`: commands run, or exact blocker
- `staging`: intended files only; unrelated files left unstaged
- `commit`: hash and message, or exact blocker
- `push`: destination, or exact blocker
- `pr`: URL, or exact blocker

## CI Follow-Up

After a PR is opened or a pushed branch has CI:

- Create a follow-up automation or reminder to check CI when the environment
  supports it.
- If CI fails, tell the user what failed and ask before starting any repair work.
- When subagents are available and the user approves, run CI repair in a separate
  branch or isolated workstream so the main delivery flow stays readable.

Never silently fix CI after a failure. The next action after a CI failure is:
"CI failed for <job>. Do you want me to start a separate repair pass?"

## Output

Report:

- branch used or created
- dirty-work protection and unrelated-file handling
- commit hash and message
- push destination
- PR URL when created, or exact PR blocker
- verification commands run
- CI follow-up status
- whether CI repair needs user approval
