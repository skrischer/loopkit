---
name: plan
description: Drive a single planning cycle end-to-end — survey readiness, sort open decisions into precedent/constraint/genuinely-open, draft a spec (the local single source of truth) including human prerequisites, review it via the in-session Agent tool, stop ONCE at the spec-acceptance gate (open decisions + prerequisites handover), flip it READY, merge autonomously, then create the GitHub milestone, issues with dependencies, board entries, and update the roadmap. Loop-capable: without an argument it plans the roadmap's next unplanned phase and reports "fully planned" when none remains. Reads docs/workflow.md for project specifics.
---

# /loopkit:plan — drive one planning cycle to a READY spec + issues

Orchestrates the readiness -> `READY` spec -> milestone + issues + board cycle.
Specs are the **local single source of truth**; milestones and issues are
created on GitHub from them. The argument is the scope to plan
(`/loopkit:plan dashboard-kpis`) — or empty, in loop mode: then the roadmap's
next unplanned phase is the unit of work.

This is the planning-side sibling to `/loopkit:implement`. Both read
**`docs/workflow.md`** (the workflow contract, produced by
`/loopkit:inception`) for the repo, base branch, board, commands, naming,
gates, and loop rules — never hardcode them. If `docs/workflow.md` is missing,
stop and tell the user to run `/loopkit:inception` first.

**Autonomy:** survey, draft the spec, open the PR, run the review, merge, and
create milestone/issues/board entries autonomously. **The one human stop is
the spec-acceptance gate** — the milestone gate: genuinely-open decisions
(AskUserQuestion, never guess) plus the human-prerequisites handover. On
blockers, park instead of dying (see If blocked).

## Preconditions

- A GitHub repo is required (the chain creates milestones and issues). Confirm
  with `gh repo view`; if there is none, stop.
- The base branch must have at least one commit — the spec PR worktree is
  branched from it (`git worktree add ... <base>`), which fails on an unborn
  branch. Check `git rev-parse --verify "<base>" 2>/dev/null`; if it fails,
  stop and ask the user to make the initial commit first
  (`/loopkit:inception`'s close-out offers this).
- Run from the main checkout on the base branch, with a clean tree. Check
  `git rev-parse --abbrev-ref HEAD` and `git status -sb`; if not on a clean
  base branch, stop and ask.

## 1. Readiness

- `docs/roadmap.md` is the queue — it names the sequenced phases and which is
  the current focus. Orient on it first; if the scope argument is empty, the
  next phase without a Spec link is what to plan.
- **Loop terminal state:** if every roadmap phase has a `READY` spec with
  milestone and issues, report "roadmap fully planned — waiting for new
  phases" in one line and end the cycle.
- Survey existing specs, open issues and milestones:
  ```
  gh api repos/:owner/:repo/milestones --jq '.[]|"\(.number) \(.title) [\(.state)] open=\(.open_issues)"'
  gh issue list --state open
  ```
- If a `READY` spec already covers the scope (with a milestone and issues),
  there is nothing to plan — point at `/loopkit:implement`. Never act against
  a `DRAFT`.

## 2. Resolve decisions before writing

Sort every open design question into three buckets — most "open" questions are
not actually open:

1. **Precedent-decided** — backed by reference implementations in
   `docs/prior-art.md` (if the project keeps one). Adopt and record in the spec.
2. **Constraint-determined** — derivable from this codebase, `docs/constitution.md`,
   or `CLAUDE.md`. Decide it and record the rationale.
3. **Genuinely open** — neither precedent nor constraint settles it. These are
   the only ones that block `READY`; they are resolved at the spec-acceptance
   gate (step 5), not guessed now.

> Check bucket 2 against the codebase and constitution before declaring anything
> "open" — most "open" decisions turn out to be already determined.

## 3. Draft the spec

- From `templates/spec-template.md` (next to this skill) into
  `docs/specs/spec-<scope>.md`. Bound the scope tightly. Put settled decisions
  in **Prior decisions** with rationale; mark each genuinely-open point
  explicitly (e.g. an `OPEN — resolved at the spec-acceptance gate` row).
- Fill **Human prerequisites** completely: every secret, external
  provisioning, dashboard config, or account only a human can provide for this
  milestone — or `none` explicitly. The implement loop depends on this being
  exhaustive: anything missed becomes a parked issue mid-loop.
- **No step list inside the spec** — steps live as issues. The `Outcome` list
  is done-criteria, not a progress mirror. Everything in `docs/` is written in
  English.

## 4. Worktree and PR

- Create a docs worktree off the base branch (paths/branch from `docs/workflow.md`):
  ```
  base=<base branch from workflow.md>
  wt=../<repo>-worktrees/docs-<scope>
  git worktree add "$wt" -b docs/<scope> "$base"
  ```
- Write the spec into the worktree, then operate **only** via `git -C "$wt"`,
  never `cd` — `git -C` targets the worktree's branch directly and sidesteps any
  push-guard on the main checkout.
  ```
  git -C "$wt" add docs/specs/spec-<scope>.md
  git -C "$wt" commit -m "docs(spec): ..."
  git -C "$wt" push -u origin docs/<scope>
  gh pr create --base "$base" --head docs/<scope> --title "docs(spec): ..." --body "..."
  ```
- A `docs:` spec PR closes no issue.

## 5. Review + spec-acceptance gate (STOP — the milestone gate)

- Review the spec with a **fresh context via the Agent tool**
  (`general-purpose` or `code-reviewer`), seeded with the PR diff and the
  decision docs (`docs/constitution.md`, `docs/prior-art.md`, any sibling spec
  it builds on). Ask for a verdict whose first line is `VERDICT: READY` or
  `VERDICT: NEEDS CHANGES`, with blocking vs non-blocking findings. The Agent
  tool runs in-session — never shell out to a billed CLI. Address the findings.
- **STOP — the cycle's one human gate:**
  - Resolve each genuinely-open decision via `AskUserQuestion` — do not guess.
    Bake the answer into the spec (Prior decisions row + Decision log entry).
  - Present the **Human prerequisites** for delivery: the human provides the
    keys/config or confirms them as in place NOW, so the milestone can later
    be implemented without interruption. Record delivered items as checked.
  - Ask the human to accept the spec.
- On acceptance: flip the header `DRAFT` -> `READY` **in the same PR**, commit,
  push, and merge autonomously — wait for green checks only if the repo has CI
  checks configured, then squash-merge, remove the worktree, and fast-forward
  the local base branch.
  ```
  gh pr merge <n> --squash --delete-branch
  git worktree remove "$wt"
  git checkout "$base" && git pull --ff-only
  ```

## 6. Milestone, issues, board (only AFTER the spec merges)

- The spec path must resolve on the **default branch**, so it must be merged
  first. Then create the milestone and one issue per implementable step:
  ```
  gh api repos/:owner/:repo/milestones -f title="<Milestone>" \
    -f description="Design: docs/specs/spec-<scope>.md\nHuman prerequisites: <delivered | summary>"
  gh issue create --title "[<scope>] <step>" --milestone "<Milestone>" \
    --body "Goal: ...\nAcceptance:\n- [ ] ...\nDepends on: #N\n\nSpec: docs/specs/spec-<scope>.md"
  ```
- One issue per step, each with a `Goal:` line and an `Acceptance:` checklist
  mirroring the spec's Verification.
- **Dependencies:** add a `Depends on: #N[, #M]` line wherever a step needs
  another issue first — including cross-milestone edges (e.g. this phase's
  first issue depends on the prior phase's last). The implement loop selects
  only unblocked issues; an issue without correct `Depends on` lines can be
  picked too early.
- Add every issue to the project board (the contract names it) with status
  `Todo`.

## 7. Roadmap (mandatory — closes the loop)

- Every plan cycle ends by updating `docs/roadmap.md`: fill the planned
  phase's **Spec** and **Milestone** links in the overview table, and move the
  **current-focus** pointer to the next phase. No status marker — the linked
  milestone is where status lives.
- Do this via its own `docs:` worktree + PR (step 4 again), **merged
  autonomously** — no gate. The `#NN` links only exist after step 6, which is
  why this is a separate PR from the spec. The cycle is not done until the
  roadmap reflects it.

## Close out

- When the spec's verification is fully met (the milestone's issues all close),
  `/loopkit:implement`'s milestone QA gate archives the spec and updates the
  roadmap. The closed milestone is the "done" signal — never add a status
  marker to a spec.

## If blocked — park, don't die

- A blocker only a human can clear: label the affected issue or milestone
  `blocked:human` and comment exactly what is needed and where to deliver it.
  Then continue with the next plannable phase if one exists; only when nothing
  is plannable, ask in-session and wait — an attended session waiting for
  input costs nothing.
- Never guess, never work around, never add status markers to specs.
