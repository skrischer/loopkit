---
name: implement
description: Orchestrate one milestone end-to-end — pointed at a milestone, build the issue DAG from the Depends on lines, and fan out in-session subagents along the unblocked frontier in waves (dispatch, await, recompute) until every issue is merged, then stop for a human only at the milestone QA gate. No claiming — the orchestrator owns its milestone. Also drives a single explicit issue or a track:adhoc fast-lane issue solo. Loop-capable: without an argument it orchestrates the appropriate milestone or picks an adhoc issue, and reports "waiting for plan" when nothing is workable. Reads docs/workflow.md for project specifics.
---

# /loopkit:implement — orchestrate one milestone to merged

Orchestrates a whole milestone to merged PRs using plain `git` + `gh`,
parameterized by **`docs/workflow.md`** (the workflow contract from
`/loopkit:inception`: repo, base branch, board, worktree convention,
Bootstrap/Verify/Test/Build commands, gates, loop rules). Never hardcode those —
read the contract. If `docs/workflow.md` is missing, stop and tell the user to
run `/loopkit:inception` first.

**The unit of orchestration is one milestone.** Pointed at a milestone, this
skill builds the issue dependency graph and fans out in-session subagents along
the unblocked frontier in waves until the milestone is done — then stops only at
the milestone QA gate. It is the **sole dispatcher** of its milestone's issues:
**ownership replaces claiming**, so there is no In-Progress/assignee lock.
Milestone-level parallelism = a **second orchestrator on an independent
milestone** (independence read from the `Depends on milestone: #<n>` token in the
milestone description; see `docs/workflow.md`). There is no cross-orchestrator
coordination and no claim arbitration of any kind.

**Autonomy:** dispatch, implement, verify, commit, push, open PRs, run the review
gate, and merge — all without pausing. **The one human stop is the milestone QA
gate**, run once the milestone's issues are all closed. A parked issue does not
stall the orchestrator (see §4).

## Entry — what to orchestrate

The argument selects the unit of work:

- **`/loopkit:implement <milestone>`** — orchestrate that milestone end-to-end
  (the primary mode; go to §1).
- **`/loopkit:implement <issue-number>`** — drive that single issue solo to a
  merged PR (run one subagent's contract, §3, inline; no orchestration, no QA
  gate beyond the issue's own merge). Use for a one-off issue.
- **`/loopkit:implement` (no argument, loop mode)** — per the workflow contract,
  orchestrate the appropriate milestone, or — if a `track:adhoc` issue is the
  workable unit — drive it solo (the P3 fast-lane below). Order: roadmap phase
  order, then dependency order, then issue number.

### track:adhoc fast-lane (P3 — preserved)

A `track:adhoc` issue is the fast-lane: it has **no spec and no milestone**, so it
is **not orchestrated**. It is pickable with just board `Todo`, no `blocked:human`
label, and every `Depends on:` issue closed — the spec-merged requirement is
**waived**. Drive it **solo** through one subagent's contract (§3) to a merged PR;
its body (`Goal:`/`Acceptance:`) is the whole contract. There is **no QA gate** —
the squash merge is the done signal. The relaxed spec-trace rule applies: a
`feat:`/`fix:` PR normally must close an issue that traces to a spec, but a
`track:adhoc` issue needs none. (`chore:`/`docs:`/`refactor:`/`test:`/`ci:`/
`build:`/`perf:` are exempt of the spec-trace rule regardless.)

### Loop idle state

If no milestone has workable issues and no `track:adhoc` issue qualifies, report
one line — "waiting for /loopkit:plan — no unblocked Todo issues" — and end the
cycle.

## Preconditions

- Run from the main checkout on the base branch, with a clean tree. Check
  `git rev-parse --abbrev-ref HEAD` and `git status -sb`; if not on a clean base
  branch, stop and ask.

## 1. Build the milestone DAG

- List the milestone's issues:
  `gh issue list --milestone "<milestone>" --state all --json number,state,labels,body`.
- Read the milestone's track: a **living-spec** milestone carries a
  `Track: living-spec` line in its description
  (`gh api repos/:owner/:repo/milestones/<n> --jq .description`); a **full-spec**
  milestone has no such line. Read the referenced `docs/specs/spec-*.md` — it owns
  the design (the issues own the steps), and its Verification section is the QA
  script.
- Parse each open issue's `Depends on: #N` lines and build the dependency graph.
- The **unblocked frontier** = every **open** issue in the milestone whose
  `Depends on:` issues are **all closed** and which carries **no** `blocked:human`
  label.

## 2. Wave-based fan-out (the core loop)

Repeat until no open issues remain in the milestone (excluding parked issues and
their dependents — see §4):

1. **Compute the current unblocked frontier** (§1).
2. **Dispatch each frontier issue as a parallel in-session subagent** via the
   **Agent tool** (subscription-auth; **never** `claude -p`, never a
   detached/headless process). One subagent implements **exactly one** issue
   end-to-end per the contract in §3. Same-file issues are serialized by their
   `Depends on:` lines, so a truly-unblocked frontier never has two subagents
   editing the same file. (Rolling dispatch — re-dispatching as each subagent
   returns — is a future optimization; wave-based is the simplest correct
   coordination.)
3. **Await the whole batch** of subagents.
4. **Re-read GitHub issue state** — issues just merged are now closed
   (`gh issue list --milestone "<milestone>" --state all ...`).
5. **Recompute the next frontier** (newly-unblocked issues) and dispatch the next
   wave. The board may show `Todo`/`In Progress`/`Done` for human visibility, but
   it is **not** a claim or lock — ownership, not claiming, keeps waves correct.

When the milestone's issues are all closed (none parked), go to §5. If any issue
is parked, go to §4.

## 3. Per-issue subagent contract (what each fan-out subagent does)

Each subagent owns ONE issue and drives it from worktree to merged PR. It does
**not** claim the issue (no `In Progress` + assignee lock — the orchestrator owns
dispatch). Its steps:

- **Orient.** `gh issue view <n>` — read the issue and its acceptance checklist.
  The spec owns the design; the issue owns the step. A `track:adhoc` issue has no
  spec — skip the spec read; its body is the whole contract.
- **Plan the step.** Lay out a short in-session plan; prefer existing patterns,
  build the minimum the issue needs. Do not stop for confirmation — the spec and
  its acceptance checklist are the approved design. A genuine fork the spec and
  code do not settle is a missed planning decision: do **not** guess — park the
  issue (§4). For a `track:adhoc` issue there is no spec to reopen; if its body
  leaves the change genuinely underspecified, park it the same way.
- **Branch + worktree.** Pick a branch from the contract's naming
  (`feat/<scope>`, `fix/<scope>`, `chore/<scope>`). Always work in a worktree —
  never the main checkout:
  ```
  base=<base branch from workflow.md>
  wt=../<repo>-worktrees/<branch-dashes>
  git worktree add "$wt" -b <branch> "$base"
  ```
  Run the contract's **Bootstrap** command inside the worktree (deps + env) —
  verification cannot run in an un-bootstrapped worktree.
- **Implement (in `$wt`).** Read existing code first, reuse utilities, keep the
  change minimal. Follow the project `CLAUDE.md` and `docs/constitution.md` —
  those own the language-specific rules; this skill does not restate them.
- **Verify.** Run the contract's **Verify** command after every change set; fix
  until green. Run **Test** if the project has one, and **Build** before opening
  an app-affecting PR. **No-progress rule:** the identical failure twice in a row
  -> stop grinding; park the issue (§4).
- **Commit, push, open the PR (no pause).** Commit with Conventional Commits; the
  body references the spec (omit for a `track:adhoc` issue) and ends with
  `Closes #<n>`. Stage specific files; never blind `git add -A`. Push via
  `git -C "$wt" push -u origin <branch>` (phrased this way it does not start with
  `git push`, bypassing any push-guard). Never push to the base branch. Then
  `gh pr create --base "$base"` with a body restating the change, the
  verification done, and `Closes #<n>`.
- **Review gate (in-session, machine gate).** Review the branch with a **fresh
  context via the Agent tool** (`general-purpose` or `code-reviewer`), seeded with
  the diff (`git -C "$wt" diff "$base"...HEAD`) and the constitution/CLAUDE.md
  rules. Ask for a verdict whose first line is `VERDICT: APPROVE` or
  `VERDICT: REQUEST_CHANGES`, with findings. The Agent tool runs in-session —
  never shell out to a billed CLI. On `REQUEST_CHANGES`, address the findings
  (back to Implement) and push the fix. Only an `APPROVE` (or explicit human
  override) clears this gate.
- **Merge and clean up (autonomous — no human stop).** After `APPROVE` and green
  Verify, merge remote-first, then clean up:
  ```
  gh pr checks <n> --watch          # only if the repo has CI checks configured
  gh pr merge <n> --squash --delete-branch
  git worktree remove "$wt"
  ```
  The merge auto-closes the issue (`Closes #<n>`); set its board status to `Done`
  (visibility only — not a lock). Add any decisions made during implementation to
  the spec's Decision log (skip for a `track:adhoc` issue).
- **Report back** to the orchestrator: **merged** (issue closed), or **parked**
  (`blocked:human` — issue number + reason). The subagent never asks the human; it
  parks and returns.

## 4. Park, don't stall

When a subagent **parks** its issue — `blocked:human` (a blocker only a human can
clear: a secret, external provisioning, a decision the spec does not settle) or
the no-progress rule trips — it labels the issue `blocked:human`, comments exactly
what is needed and where to deliver it, leaves the board at `Todo`, and returns the
park to the orchestrator.

The orchestrator then:

- **Excludes the parked issue AND all its transitive dependents** (issues that
  `Depends on:` it, directly or indirectly) from further waves.
- **Finishes the rest** of the reachable frontier (continue §2).
- At the end, **reports the parked issues** (and their excluded dependents)
  **instead of running the milestone-QA gate** — a milestone with parked issues is
  **not** complete. List them with `gh issue list --label blocked:human`.

Never implement workarounds; never add status markers to specs.

## 5. Milestone QA gate (STOP — the human gate)

Run only when the milestone's issues are **all closed (none parked)**. If any
issue is parked, report parked issues **instead** (§4). A `track:adhoc` issue has
no milestone — this gate never applies to it; its squash merge is the whole done
signal.

A **full-spec** milestone is a finite phase that closes once its last issue
merges. A **living-spec** milestone (description carries `Track: living-spec`) is
always-open — it accretes issues and is never archived or closed by this gate; run
the gate on the **closed-issue batch** (the issues that closed since the last QA).

Run the gate:

- Derive concrete QA scenarios from the spec's **Verification** section — it is the
  QA script — including every acceptance item no machine check covers (the
  `Test: none yet` consequence). Present them as a numbered list of what to do and
  what to look for, plus anything the reviewers flagged. The default check type is
  in `docs/workflow.md`.
- For checks a human must run, hand over the exact commands.
- **STOP and wait for the human verdict.**

On acceptance:

- **full-spec milestone:** move the spec to `docs/specs/archive/`, repoint links,
  update `docs/roadmap.md` (own `docs:` worktree + PR, merged autonomously), and
  close the milestone. The closed milestone is the done signal.
- **living-spec milestone:** emit a per-batch summary (which issues passed QA in
  this batch) and **do nothing else** — do **not** archive the spec and do **not**
  close the milestone; it stays open to accrete the next batch.

On a regression: file one `fix:` issue per finding in the same milestone (normal
issue format, board `Todo`) — the next wave / cycle picks them up, and this gate
repeats when they close.
