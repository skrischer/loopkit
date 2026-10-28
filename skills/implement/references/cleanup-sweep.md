# Cleanup sweep — clean what is safe, report the rest, never force

> Paths in this file are relative to this file.

The orchestrator runs this once per run, after the frontier empties — before the
milestone QA gate and before the escalate/park report. Per-issue subagents already
remove their own worktree (on merge, and on park/escalate, per the issue contract);
this sweep retires what the run still left behind. Bound it strictly to
loopkit's worktree-path convention (`../<repo>-worktrees/...`, per
`docs/workflow.md`) — never touch worktrees or branches outside it.

- **List the project's worktrees:** `git worktree list --porcelain`; consider
  only paths under `../<repo>-worktrees/`.
- **Remove each merged-or-gone worktree (clean only):** for a worktree whose
  branch's PR has merged or whose branch is gone, `git worktree remove "$wt"`.
- **Dirty worktree -> report, never force.** If a worktree has uncommitted
  changes, leave it and surface it in the report — never `git worktree remove
  --force` (the deny rules forbid destroying uncommitted work). The sweep reports
  what it could not clean rather than forcing it.
- **Prune:** `git worktree prune` to clear stale administrative entries.
- **Delete what `-d` can; report the rest.** For a local branch whose PR is merged,
  try `git branch -d <branch>` — safe delete only, never `-D` (a
  `.claude/settings.json` deny rule, per `CLAUDE.md`'s hard limits). `-d` accepts
  "merged into its upstream" — and a branch's upstream is its own remote ref
  (`origin/<branch>`, set by the contract's `push -u`), not the base — so while that ref
  resolves, the branch's tip is already at it, the test passes, and the branch
  deletes even though it was squash-merged. Once the ref is pruned, `-d` compares
  against HEAD instead — where a squash-merge is no ancestor — and refuses:
  `error: the branch '<b>' is not fully merged`. The discriminator is therefore the
  upstream ref's survival, not the merge. On a squash-merge repo that refusal is
  expected, not a failure to route around: report the branch and the reason, and
  leave it for the human. The merge path deletes the branch itself, so this sweep
  should normally meet only leftovers — a run that died
  between merge and delete, or a branch merged outside the loop. Leave remote
  branches to `--delete-branch` at merge.

Report any worktree or branch the sweep could not clean — a dirty worktree, or a
branch `-d` refused (typically a squash-merged branch whose upstream is gone: its PR
is merged, git just cannot prove it) — so the human can resolve it; nothing is
force-removed.
