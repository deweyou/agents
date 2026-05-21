---
name: git-delivery
description: >
  Manage the git delivery workflow. Use this skill at the start of a coding
  session or before editing files for a new task to inspect the current branch,
  protect dirty work, fetch the primary branch, and pass a pre-edit base gate.
  Also use when the user says "提交吧", "commit it", "ship it", "开 PR",
  "push", or asks to finish work, so the agent treats it as a full delivery intent
  unless the user narrows the scope: memory check, verification, intentional
  staging, commit, base-branch conflict check, rebase when safe, push, PR creation
  or exact blocker reporting, and CI follow-up. For CI follow-up, always include
  an immediate first check after about 10 seconds, visible workflow/job/step
  status, rough ETA when possible, and a short active polling plan such as a
  1-minute heartbeat/reminder for fresh PR CI. When CI polling finds a clear
  failure, automatically inspect, fix, verify, commit, and push the repair; stop
  and ask the user when the failure is ambiguous, risky, or has multiple reasonable
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

Do not silently commit, push, or open a PR without confirmation. If the user
confirms, run the full Finish Work delivery path. If the user declines, leave files
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

- If the user says **"提交吧"** or **"提交一下"** without explicitly narrowing
  scope, treat it as complete delivery: commit → base check/rebase → push → PR.
  This is the local default convention for "submit this work", not a
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
12. Only after push succeeds and a PR or pushed branch head exists, start CI
    follow-up: wait about 10 seconds for the first CI check, inspect visible
    workflow/job/step status, then create/update a short polling automation when
    supported.
13. Summarize the problem, solution, and verification in the PR body.

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

Do not start CI polling before the delivery commit is created and pushed. The
order is: pause stale CI polling before commit, commit, base check/rebase,
verification after rebase when needed, push, create or update PR, confirm the new
head, then start CI initial check and follow-up polling.

When GitHub CLI is needed, resolve it robustly before declaring it unavailable:
try `gh` from `PATH`, then common local install paths such as
`/opt/homebrew/bin/gh` on Apple Silicon macOS. If a fallback path works, use it
and report `github_cli=found_at_<path>`. Only report `github_cli=unavailable`
after checking these common locations.

In routing or planning output, do not compress this to "poll CI". Explicitly
state:

- `ci_followup_start`: after push succeeds and PR/new head exists; never before
  commit or push.
- `ci_followup_action`: create, update, or resume a follow-up
  automation/reminder after push when the environment supports it; otherwise say
  unavailable and fall back to a manual check.
- `ci_initial_check`: wait about 10 seconds after push or PR creation, then check
  once immediately. Use the words "about 10 seconds" or "10s" in the plan.
- `ci_visible_status`: workflow/run/job/step/status details that will be read
  when available.
- `ci_eta`: rough remaining-time estimate from current metadata or recent similar
  runs, or `unknown`.
- `ci_poll_interval`: create or update a follow-up automation/reminder when the
  environment supports it; use about 1 minute for active fresh PR CI, then slow
  down or stop after pass/fail/blocker.
- `ci_poll_stop`: terminal CI states must stop the follow-up. When CI passes,
  clearly fails for an ambiguous/blocked reason, or requires the user's decision,
  report the final status and pause/delete the automation so it does not keep
  running forever. The next action summary must include `ci_poll_stop`.
- `ci_repair_boundary`: inspect logs first; auto-repair only clear low-risk
  failures; report `ci_failure`, `repair_commit`, `verification`, `push`, and
  `ci_poll` status. Use these exact fields in the plan and next action summary.

- Do an immediate first CI check after push before relying on a background
  automation: wait about 10 seconds, then inspect the PR/check run status once.
  If the provider exposes workflow runs, jobs, or steps, report which workflow is
  queued/running/passed/failed and the current job or step when available.
- Estimate remaining CI time when possible from current run metadata and recent
  comparable runs. Say the estimate is rough when history is unavailable. For
  fast lint/typecheck jobs, prefer a near-term follow-up instead of a long
  default delay.
- Create a follow-up automation or reminder to check CI when the environment
  supports it. Prefer a short interval such as 1 minute for active PR CI
  immediately after a new push; slow down or stop polling once CI passes, clearly
  fails, or becomes blocked by permissions, secrets, or an external system.
- CI follow-up automations are temporary. They must end themselves on terminal
  states: passed, failed-but-ambiguous, blocked, cancelled, or no matching run
  after a reasonable provider delay. On terminal state, report the final workflow,
  job, step, status, elapsed time when available, and `ci_poll_stop`, then pause
  or delete the automation.
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
  In routing or planning output, repeat these report fields explicitly so the
  repair handoff cannot collapse into "report conclusion."
- When the CI failure is from a previous commit on the same delivery branch,
  include the repair in a new follow-up commit unless amending is explicitly safer
  and the branch has not been shared.
- If the automation environment can continue polling after the repair push,
  continue watching until CI passes or another failure appears. Apply the same
  repair-or-stop decision to each new failure. Do not keep polling after the
  repaired head reaches a terminal state.

Stop and ask the user instead of guessing when any of these are true:

- The root cause is unclear after inspecting the logs and local reproduction.
- Several fixes are reasonable and the choice changes product behavior,
  architecture, public API, data model, migration shape, or user experience.
- The repair would require deleting or rewriting substantial code, changing
  unrelated files, or touching user-owned dirty work.
- The fix depends on secrets, permissions, deployment configuration, CI provider
  settings, billing, or another external system the user controls.
- Local verification cannot reproduce or confirm the failure and the proposed
  change would be speculative.
- The test expectation appears wrong, stale, or intentionally changed by the user.
- The branch or PR state is unsafe, such as a detached HEAD, missing remote,
  protected branch, failed force-with-lease, or unexpected divergence.

When stopping, give the user the exact blocker, the failing job or step, the relevant
file paths, and the concrete decision needed. If job, step, or file paths cannot
be known until CI is inspected, say they are `unknown_pending_ci_log_inspection`
and do not claim a repair. Do not continue by picking one of several plausible
fixes.

For ambiguous CI, report the blocker, plausible options, failing job/step if
known, and relevant files if known. If they are not known yet, say they must be
inspected before finalizing the blocker.

Always report the CI repair boundary:

- `ci_initial_check`: checked after about 10 seconds, skipped with reason, or
  unavailable
- `ci_poll`: automation/reminder created, interval, checked manually, or
  unavailable
- `ci_poll_stop`: paused/deleted on terminal status, still polling with reason, or
  unavailable
- `ci_eta`: rough estimated remaining time, unknown, or not applicable
- `ci_failure`: failing job and step, or none
- `ci_decision`: auto-repaired, still polling, passed, or stopped for the user
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
  the user when repair is ambiguous
