---
name: implement
description: Drive a single issue through the full implementation cycle — select or receive an issue, claim it on the board, create a bootstrapped worktree, implement, verify, open the PR, pass the in-session agent review, merge autonomously, and stop for a human only at the milestone QA gate when the milestone's last issue closes. Loop-capable: without an argument it picks the next unblocked Todo issue and reports "waiting for plan" when nothing is workable. Reads docs/workflow.md for project specifics.
---

# /loopkit:implement — drive one issue from start to merged

Orchestrates the issue -> merged cycle using plain `git` + `gh`, parameterized
by **`docs/workflow.md`** (the workflow contract from `/loopkit:inception`:
repo, base branch, board, worktree convention, Bootstrap/Verify/Test/Build
commands, gates, loop rules). Never hardcode those — read the contract. If
`docs/workflow.md` is missing, stop and tell the user to run
`/loopkit:inception` first. The argument is an issue number
(`/loopkit:implement 42`) — or empty, in loop mode: then the next unblocked
issue is the unit of work.

**Autonomy:** select, claim, implement, verify, commit, push, open the PR, and
— after the machine gates pass — merge, all without pausing. **The one human
stop is the milestone QA gate**, when this issue was the milestone's last open
one. On human blockers, park the issue and move on (see If blocked).

## Preconditions

- Run from the main checkout on the base branch, with a clean tree. Check
  `git rev-parse --abbrev-ref HEAD` and `git status -sb`; if not on a clean base
  branch, stop and ask.

## 1. Select and orient

- With an argument: `gh issue view <n>` — read the issue and its acceptance
  checklist.
- Without an argument (loop mode), pick the next **unblocked** issue:
  - board status `Todo`, no `blocked:human` label, every `Depends on:` issue
    closed, and — for a spec-bound issue — its spec merged on the default branch
    with a milestone. A `track:adhoc` issue (the fast-lane; see
    `docs/workflow.md`) carries no spec and no milestone, so that requirement is
    waived: it is unblocked with just board `Todo`, no `blocked:human`, and all
    `Depends on:` closed.
  - order: roadmap phase order, then dependency order, then issue number.
  - **Loop idle state:** if no issue qualifies (no spec-bound issue with its spec
    merged, and no `track:adhoc` issue), report one line — "waiting for
    /loopkit:plan — no unblocked Todo issues" — and end the cycle.
- Read the referenced `docs/specs/spec-*.md`. It must be merged on the default
  branch with a milestone — that is the acceptance signal. The spec owns the
  design; the issue owns the step. **A `track:adhoc` issue has no spec** — skip
  this; its body (`Goal:`/`Acceptance:`) is the whole contract.
- A `feat:`/`fix:` PR must close an issue that traces to a spec, **unless the
  issue is `track:adhoc`** (the fast-lane needs no spec). `chore:`/`docs:`/
  `refactor:`/`test:`/`ci:`/`build:`/`perf:` are exempt regardless.

## 2. Plan the step

- Lay out a short in-session plan before coding; prefer existing patterns,
  build the minimum the issue needs. Do not stop for confirmation — the spec
  and its acceptance checklist are the approved design.
- A genuine fork the spec and code do not settle is a missed planning
  decision: do not guess and do not block the loop — park the issue
  (`blocked:human` + a comment stating the question) and move on. For a
  `track:adhoc` issue there is no spec to reopen — if its body leaves the change
  genuinely underspecified, park it `blocked:human` the same way for the human.

## 3. Claim, branch, worktree

- Claim the issue: set its board status to `In Progress` and assign yourself
  (`gh issue edit <n> --add-assignee @me`) — this is what keeps parallel
  sessions off the same issue.
- Pick a branch from the contract's naming: `feat/<scope>`, `fix/<scope>`,
  or `chore/<scope>`. Always work in a worktree — never the main checkout:
  ```
  base=<base branch from workflow.md>
  wt=../<repo>-worktrees/<branch-dashes>
  git worktree add "$wt" -b <branch> "$base"
  ```
- Run the contract's **Bootstrap** command inside the worktree (deps + env) —
  verification cannot run in an un-bootstrapped worktree.

## 4. Implement (in the worktree)

- Work in `$wt`. Read existing code first, reuse utilities, keep the change
  minimal. Follow the project `CLAUDE.md` and `docs/constitution.md` — those own
  the language-specific rules (forbidden patterns, boundaries, style); this
  skill does not restate them.

## 5. Verify

- Run the contract's **Verify** command after every change set; fix until
  green. Run **Test** if the project has one, and **Build** before opening an
  app-affecting PR.
- **No-progress rule:** the identical failure twice in a row -> stop grinding.
  Comment the failure state on the issue, park it (`blocked:human` if a human
  decision or input is needed), and end the cycle with a report.

## 6. Commit, push, open the PR (no pause)

- Commit with Conventional Commits. The body references the spec (omit for a
  `track:adhoc` issue, which has none) and ends with `Closes #<n>`. Stage
  specific files; never blind `git add -A`.
- Push via `git -C "$wt" push -u origin <branch>` — phrased this way it does not
  start with `git push`, bypassing any push-guard. Never push to the base branch.
- `gh pr create --base "$base"` with a body that restates the change, the
  verification done, and `Closes #<n>`.

## 7. Review gate (in-session, machine gate)

- Review the branch with a **fresh context via the Agent tool**
  (`general-purpose` or `code-reviewer`), seeded with the diff
  (`git -C "$wt" diff "$base"...HEAD`) and the constitution/CLAUDE.md rules. Ask
  for a verdict whose first line is `VERDICT: APPROVE` or
  `VERDICT: REQUEST_CHANGES`, with findings. The Agent tool runs in-session —
  never shell out to a billed CLI.
- On `REQUEST_CHANGES`, address the findings (back to step 4) and push the fix.
  Only an `APPROVE` (or explicit human override) clears this gate.

## 8. Merge and clean up (autonomous — no human stop)

- After `APPROVE` and green Verify, merge remote-first, then clean up:
  ```
  gh pr checks <n> --watch          # only if the repo has CI checks configured
  gh pr merge <n> --squash --delete-branch
  git worktree remove "$wt"
  git checkout "$base" && git pull --ff-only
  ```
- The merge auto-closes the issue (`Closes #<n>`); set its board status to
  `Done`.
- Add any decisions made during implementation to the spec's Decision log
  (skip for a `track:adhoc` issue — it has no spec).

## 9. Milestone QA gate (STOP — the human gate)

- A `track:adhoc` issue has no milestone — this gate does not apply; the squash
  merge in step 8 is the whole done signal.
- Tell the milestone's track apart: a **living-spec** milestone carries a
  `Track: living-spec` line in its milestone description (check with
  `gh api repos/:owner/:repo/milestones/<n> --jq .description`); a **full-spec**
  milestone has no such line. A full-spec milestone is a finite phase that
  closes once its last issue merges; a living-spec milestone is always-open —
  it accretes issues and is never archived or closed by this gate.
- Check the issue's milestone. If open issues remain on a **full-spec**
  milestone, the cycle is done — the next cycle picks the next issue. On a
  **living-spec** milestone there is no "last issue", so run the gate now on the
  **closed-issue batch** (the issues that closed since the last QA).
- Run the gate when this merge closed a **full-spec** milestone's **last** open
  issue, or for a **living-spec** milestone on the latest closed-issue batch:
  - Derive concrete QA scenarios from the spec's **Verification** section — it
    is the QA script — including every acceptance item no machine check covers
    (the `Test: none yet` consequence). Present them as a numbered list of
    what to do and what to look for, plus anything the reviewer flagged. The
    default check type is in `docs/workflow.md`.
  - For checks a human must run, hand over the exact commands.
  - **STOP and wait for the human verdict.**
- On acceptance of a **full-spec** milestone: move the spec to
  `docs/specs/archive/`, repoint links, update `docs/roadmap.md` (own `docs:`
  worktree + PR, merged autonomously), and close the milestone. The closed
  milestone is the done signal.
- On acceptance of a **living-spec** milestone: emit a per-batch summary
  (which issues passed QA in this batch) and **do nothing else** — do NOT
  archive the spec and do NOT close the milestone; it stays open to accrete the
  next batch.
- On a regression: file one `fix:` issue per finding in the same milestone
  (normal issue format, board `Todo`) — the loop picks them up, and this gate
  repeats when they close.

## If blocked — park, don't die

- A blocker only a human can clear (secret, external provisioning, a decision
  the spec does not settle): label the issue `blocked:human`, comment exactly
  what is needed and where to deliver it, set its board status back to `Todo`,
  and unassign yourself. Then pick the next unblocked issue (step 1).
- When every remaining issue is blocked, list them
  (`gh issue list --label blocked:human`) and ask in-session — there is
  nothing better to do, and an attended session waiting for input costs
  nothing.
- Never implement workarounds; never add status markers to specs.
