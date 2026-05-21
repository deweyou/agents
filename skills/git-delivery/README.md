# git-delivery

> Manage branch, commit, push, PR, and CI follow-up workflow.

## What it does

`git-delivery` handles the git lifecycle around development work. Before editing
files for a new task it checks the current branch, protects dirty work, fetches
the primary branch, and passes a pre-edit base gate so new work starts from the
right baseline whenever it is safe. At task finish it recognizes commit, push,
ship, and PR requests as delivery intents, then runs the complete requested path:
repo memory, verification, intentional staging, commit, base check or rebase,
push, PR creation, and CI follow-up. CI follow-up starts with an immediate check
and prefers lightweight in-session polling; temporary automation or reminders are
reserved for later follow-up when the session cannot reasonably keep watching.
When a completed task leaves local changes and the user has not asked for
delivery or opted out, it prompts for confirmation to submit, push, and open a
PR. Before making a new commit on a branch with CI polling, it pauses the
previous CI follow-up automation so old checks do not report on superseded
commits. When CI polling finds a clear failure, it automatically inspects logs,
repairs the issue, verifies, commits, pushes, and reports the result; it stops
and asks for a concrete decision when the root cause or right fix is ambiguous.

## When it triggers

- Starting a new coding task or implementation session
- Before editing files for a new task after planning or design discussion
- Preparing an explicit new task branch or parallel worktree
- "提交吧", "commit it", "发一下", "ship it"
- "开 PR", "push", "提交并建 PR"
- Completed work with local changes that needs a submit/push/PR confirmation
- After a PR is opened and CI needs monitoring or repair

## Installation

```bash
npx skills add <agents-repo-url> --skill git-delivery
```

## Source

This skill is maintained in `<agents-repo-url>` and indexed by `agent asset CLI update`.
