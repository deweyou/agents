---
name: git-delivery
description: >
  Manage Dewey's git delivery workflow. Use this skill at the start of a coding
  session or before editing files for a new task to inspect the current branch,
  protect dirty work, fetch the primary branch, and pass a pre-edit base gate.
  Also use when the user says "提交吧", "commit it", "ship it", "开 PR",
  "push", or asks to finish work, so the agent treats it as a full delivery intent
  unless the user narrows the scope: memory check, verification, intentional
  staging, commit, base-branch conflict check, rebase when safe, push, PR creation
  or exact blocker reporting, and CI follow-up. When CI polling finds a clear
  failure, automatically inspect, fix, verify, commit, and push the repair; stop
  and ask Dewey when the failure is ambiguous, risky, or has multiple reasonable
  solutions. After completing work with local changes, ask whether to submit,
  push, and open a PR unless the user already requested delivery or opted out.
  Before creating a new commit on a branch with CI polling, pause the previous
  CI follow-up automation so stale checks do not report on superseded commits.
  Always protect dirty work: never discard, overwrite, or stage unrelated files.
---

# Git Delivery

Run the repository delivery flow without making the user spell out every git step.

When invoked, make the safety and delivery decisions explicit. Reviewers need to
see the branch choice, dirty-work protection, intended staging boundary, PR
creation or blocker, base-branch conflict/rebase status, and CI repair decision.

## Start Of Work

Use this section when beginning a new implementation task.

### Pre-Edit Base Gate

Before editing any file for a new task, run this gate. This applies when the user
asks to implement, fix, refactor, create a skill, update CLI behavior, or make any
code or asset change, even if the request arrives after a long design discussion.

1. Check `git status --short --branch` and the current branch.
2. Identify the primary branch, usually `main`.
3. Fetch the latest remote primary branch, for example `git fetch origin <primary>`.
4. If the worktree is detached, create a task branch before editing. Use the
   `codex/` prefix unless the user requested another branch name.
5. If the worktree is clean and the user did not explicitly say "continue here",
   "use this branch", or similar, start from the fetched baseline:
   - create a new task branch from `origin/<primary>` for new implementation work;
   - or rebase the current task branch onto `origin/<primary>` before editing when
     it is already a task branch.
   In routing or planning output, explicitly say
   `prework_decision=start_from_fetched_baseline`.
6. If the current branch is behind `origin/<primary>` and the worktree is clean,
   rebase before editing. If the branch has local commits and the rebase would be
   risky, stop and report the blocker.
7. If there is dirty work, do not switch, rebase, or create a new branch over it.
   Report `dirty_work=blocks_base_sync` unless the user explicitly told you to
   continue in the current worktree.

Do not postpone this gate until commit or PR time. If the gate cannot complete,
say exactly what blocked it before touching files.

Always report the pre-edit gate:

- `prework_base`: fetched baseline and whether HEAD is based on it.
- `prework_branch`: current branch, created branch, rebased branch, or detached
  branch fixed.
- `prework_dirty_work`: none, protected, or blocks base sync.
- `prework_decision`: safe to edit, continuing by explicit user instruction, or
  blocked.

If the user says "continue here", "use this branch", or similar, stay on the
current branch and state that choice. If the user explicitly asks for parallel
work, prefer a separate worktree or explicit new branch instead of moving the
existing worktree away from an active task. Do not discard or overwrite existing
user changes. If local changes block a safe branch creation, rebase, or worktree
setup, stop and ask how to handle them.

Always report the dirty-work decision:

- `dirty_work`: none, protected, or blocks branch creation/worktree setup
- `unrelated_files`: left untouched and unstaged
- `base_sync`: fetched primary branch, already current, or blocked with reason
- `branch_action`: stayed, created branch, created worktree, or blocked with reason

## Finish Work

Use this section when the user asks to commit, push, open a PR, or ship the work.

### Completion Prompt

Use this when a task is complete, verification has run or the blocker is known,
and local changes from the current task remain uncommitted.

If the user has not already requested commit, push, or PR, and has not opted out
with phrases like "先别提交", "不要提交", "只改代码", or "我自己提交", ask before
the final handoff:

```text
要我现在提交、push 并开 PR 吗？
```

Do not silently commit, push, or open a PR without confirmation. If Dewey
confirms, run the full Finish Work delivery path. If Dewey declines, leave files
unstaged unless they were already intentionally staged, and report verification
plus remaining local changes. In routing or planning output, explicitly mention
both `if_confirmed=full_delivery_path` and
`if_declined=leave_changes_uncommitted_and_report_status`.

Do not ask this question when the user has already given a clear delivery intent;
in that case, continue through the requested delivery path.

### Delivery Intent

Treat these as delivery intents:

- "提交吧", "提交一下", "commit it", "commit this", "保存成提交"
- "push", "ship it", "发布这个分支"
- "开 PR", "提 PR", "create/open a PR", "提交并建 PR"
- "可以了", "收尾", "finish this", when code or asset changes are present

Default to the fullest safe delivery path implied by the request:

- If Dewey says **"提交吧"** or **"提交一下"** without explicitly narrowing
  scope, treat it as complete delivery: commit → base check/rebase → push → PR.
  This is Dewey's default local convention for "submit this work", not a
  commit-only request.
- If the user asks for **PR**, run commit → base check/rebase → push → PR.
- If the user asks for **push** and changes are uncommitted, run commit → base
  check/rebase → push. Do not stop after committing.
- If the user says **ship it**, treat it as commit → push → PR unless
  the repository has no remote or the user explicitly narrows the scope.
- Do not maintain a separate commit-only delivery path. If the user explicitly
  says not to submit, not to push, or not to open a PR, treat that as opting out
  of delivery and leave local changes uncommitted unless they clarify a different
  desired flow.

Do not ask "should I push/open a PR?" after a clear delivery intent such as
"提交吧" or "ship it". Continue through the requested delivery path and
report exact blockers only when a step cannot be completed safely.

1. Inspect `git status --short`.
2. Run `repo-memory` before committing when that skill is available.
3. Run relevant verification commands for the changed files.
4. Before creating a new commit, pause any existing CI follow-up automation for
   the same PR, branch, or thread. This prevents old polling jobs from reporting
   stale results after a new commit changes the head SHA. If no matching
   automation exists, report `ci_poll_pause=not_needed`; if automation support is
   unavailable, report `ci_poll_pause=unavailable`. This step applies before
   every new delivery commit, including follow-up commits that update an existing
   PR.
5. Stage only intended files.
6. Commit with a concise conventional message when the repo uses conventional
   commits, otherwise match local history.
7. Fetch the target merge branch, usually `origin/main`, and check whether the
   current branch can cleanly merge or rebase onto it.
8. If the branch is behind or would conflict with the target merge branch, rebase
   onto the target branch before pushing when the worktree is clean and the rebase
   is safe. Resolve straightforward conflicts when the intended result is clear.
   If conflicts are non-trivial, stop and report the conflicting files and exact
   blocker.
9. After any successful rebase or conflict resolution, re-run relevant verification
   before pushing. Always say `verification_after_rebase`: commands run, not needed,
   or blocked with reason.
10. Push the branch. Use `--force-with-lease` only after a rebase rewrote the branch
   and only for the task branch.
11. Open a pull request using the repository's normal tool or hosting CLI. If a PR
   cannot be created, report the exact blocker, such as missing auth, missing remote,
   detached HEAD, no GitHub CLI, or no network.
12. Summarize the problem, solution, and verification in the PR body.

Never include unrelated dirty files in the commit. If unrelated changes exist, leave
them unstaged and call them out.

## Base Branch Conflict Check

Before pushing or opening a PR, always check the branch against the intended merge
base:

1. Fetch the base branch.
2. Inspect whether the head branch is behind, diverged, or merge-conflicting.
3. Prefer `git rebase origin/<base>` for a clean task branch.
4. If the rebase conflicts, inspect the conflict files. Resolve only when the
   intended result is clear from the code and user request.
5. After resolving conflicts, continue the rebase, rerun verification, and push with
   `--force-with-lease`. The rebase workflow is not complete until
   `verification_after_rebase` has been run or an exact blocker is reported.
6. If conflict resolution is ambiguous, abort or pause safely and report the exact
   files plus the decision needed from the user.

In routing or planning output, explicitly say that conflict resolution is allowed
only for clear conflicts, otherwise report exact conflict files and blocker; also
say verification must run after any successful rebase before pushing.

Always report:

- `base_branch`: target branch checked
- `conflict_check`: clean, rebased, conflicted-resolved, or blocked
- `rebase`: not needed, completed, or blocked
- `conflict_files`: list of files, or `none`
- `verification_after_rebase`: commands run, not needed, or exact blocker

Always report the finish-work boundary:

- `repo_memory`: run, skipped with reason, or unavailable
- `verification`: commands run, or exact blocker
- `ci_poll_pause`: paused automation id, not needed, unavailable, or blocked
- `staging`: intended files only; unrelated files left unstaged
- `commit`: hash and message, or exact blocker
- `base_conflict_check`: base branch, result, rebase status, conflict files
- `verification_after_rebase`: commands run after rebase, not needed, or exact blocker
- `push`: destination, or exact blocker
- `pr`: URL, or exact blocker

## CI Follow-Up

After a PR is opened or a pushed branch has CI:

- Create a follow-up automation or reminder to check CI when the environment
  supports it.
- When CI polling finds a failure, inspect the failing job, failing step, and
  relevant logs before deciding whether to repair or stop.
- In routing or planning output, explicitly list the decision order: inspect
  failing job, inspect failing step, inspect logs, then decide whether the failure
  is clear or ambiguous.
- If the user already frames the CI failure as a choice between multiple plausible
  fixes, still inspect the failing job, step, logs, and relevant files first, then
  classify it as ambiguous unless that inspection proves there is only one safe
  repair.
- Automatically repair clear, low-risk failures. This includes deterministic
  lint, format, typecheck, unit test, snapshot, dependency-lock, or obvious
  compatibility failures where the intended fix follows directly from the code,
  test output, and user request.
- For an automatic repair, edit only the necessary files, run the smallest
  relevant verification first, then rerun the broader failed check when practical.
  Commit the repair with a concise conventional message, push the same branch,
  and report `ci_failure`, `repair_commit`, `verification`, `push`, and `ci_poll`
  status.
- When the CI failure is from a previous commit on the same delivery branch,
  include the repair in a new follow-up commit unless amending is explicitly safer
  and the branch has not been shared.
- If the automation environment can continue polling after the repair push,
  continue watching until CI passes or another failure appears. Apply the same
  repair-or-stop decision to each new failure.

Stop and ask Dewey instead of guessing when any of these are true:

- The root cause is unclear after inspecting the logs and local reproduction.
- Several fixes are reasonable and the choice changes product behavior,
  architecture, public API, data model, migration shape, or user experience.
- The repair would require deleting or rewriting substantial code, changing
  unrelated files, or touching user-owned dirty work.
- The fix depends on secrets, permissions, deployment configuration, CI provider
  settings, billing, or another external system Dewey controls.
- Local verification cannot reproduce or confirm the failure and the proposed
  change would be speculative.
- The test expectation appears wrong, stale, or intentionally changed by the user.
- The branch or PR state is unsafe, such as a detached HEAD, missing remote,
  protected branch, failed force-with-lease, or unexpected divergence.

When stopping, give Dewey the exact blocker, the failing job or step, the relevant
file paths, and the concrete decision needed. If job, step, or file paths cannot
be known until CI is inspected, say they are `unknown_pending_ci_log_inspection`
and do not claim a repair. Do not continue by picking one of several plausible
fixes.

For ambiguous CI, report the blocker, plausible options, failing job/step if
known, and relevant files if known. If they are not known yet, say they must be
inspected before finalizing the blocker.

Always report the CI repair boundary:

- `ci_poll`: automation/reminder created, checked manually, or unavailable
- `ci_failure`: failing job and step, or none
- `ci_decision`: auto-repaired, still polling, passed, or stopped for Dewey
- `ci_repair_commit`: hash and message, or not created
- `ci_repair_verification`: commands run, or exact blocker
- `ci_repair_push`: destination, or exact blocker

For follow-up commits on an existing PR, always report both `ci_poll_pause` for
the stale polling job and the new `ci_poll` plan for the updated head commit.

## Output

Report:

- branch used or created
- dirty-work protection and unrelated-file handling
- commit hash and message
- push destination
- PR URL when created, or exact PR blocker
- verification commands run
- CI follow-up status
- CI repair decision, repair commit, verification, push, or the exact question for
  Dewey when repair is ambiguous
