---
name: plan
description: Drive a single planning cycle end-to-end — survey readiness, sort open decisions into precedent/constraint/genuinely-open, draft a spec (the local single source of truth) including human prerequisites, review it via the in-session Agent tool, stop ONCE at the spec-acceptance gate (open decisions + prerequisites handover), merge autonomously (the merge is acceptance), then create the GitHub milestone, issues with dependencies, board entries, and update the roadmap. Loop-capable: without an argument it reports the roadmap's unplanned phases and asks the human which to plan (it does not auto-pick), and reports "fully planned" when none remains. Reads docs/workflow.md for project specifics.
---

# /loopkit:plan — drive one planning cycle to a merged spec + issues

Orchestrates the readiness -> merged spec -> milestone + issues + board cycle.
Specs are the **local single source of truth**; milestones and issues are
created on GitHub from them. The argument is the scope to plan
(`/loopkit:plan dashboard-kpis`) — or empty, in loop mode: then the cycle
reports the roadmap's unplanned phases and asks the human which one to plan
(it never auto-picks the unit of work).

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

- Scope comes from the argument — the human passes it explicitly
  (`/loopkit:plan dashboard-kpis`). `docs/roadmap.md` is the queue of sequenced
  phases (it carries no current-focus or status marker); orient on it first.
- **No argument:** list the phases that have no merged spec with a milestone
  and issues yet, then ASK the human which one to plan (`AskUserQuestion` /
  in-session question). Never auto-advance to "the next phase without a Spec
  link" — the human names the unit of work.
- **Loop terminal state:** if every roadmap phase already has a merged spec
  with a milestone and issues, report "roadmap fully planned — waiting for new
  phases" in one line and end the cycle. Loop-mode iterates **roadmap phases
  only**; a living-spec milestone (step 7a) is never a roadmap phase, so it is
  excluded from this set and the terminal state is unaffected by it.
- **Track (the proportional dial, see `docs/workflow.md`):** decide which of
  the contract's three tracks this scope uses before drafting. Most planning is
  **full-spec** (a finite phase: spec + milestone that closes). When the human
  asks to open an **ongoing theme** that accretes work over time rather than a
  finite phase, plan the **living-spec** track (step 7a): same spec + milestone
  cycle, but the milestone stays open. A living-spec is **human-initiated** —
  never inferred from the roadmap, never auto-planned in loop mode. The
  `track:adhoc` fast-lane carries no spec or milestone and is not a plan cycle
  (the human files it directly; `/loopkit:implement` picks it up).
- Survey existing specs, open issues and milestones:
  ```
  gh api repos/:owner/:repo/milestones --jq '.[]|"\(.number) \(.title) [\(.state)] open=\(.open_issues)"'
  gh issue list --state open
  ```
- If a merged spec already covers the scope (with a milestone and issues),
  there is nothing to plan — point at `/loopkit:implement`. A spec still in an
  open PR is in review, not accepted: do not start a second plan against it.
  Exception: a living-spec milestone (step 7a) is meant to be re-run with the
  same scope to accrete more issues — there, "already covered" is expected, so
  skip straight to step 7a's issue-creation, do not short-circuit.

## 2. Resolve decisions before writing

Sort every open design question into three buckets — most "open" questions are
not actually open:

1. **Precedent-decided** — backed by reference implementations in
   `docs/prior-art.md`. Consult it for the scope unconditionally; adopt and
   record in the spec.
2. **Constraint-determined** — derivable from this codebase, `docs/constitution.md`,
   or `CLAUDE.md`. Decide it and record the rationale.
3. **Genuinely open** — neither precedent nor constraint settles it. These are
   the only ones that block acceptance; they are resolved at the
   spec-acceptance gate (step 6), not guessed now.

> Check bucket 2 against the codebase and constitution before declaring anything
> "open" — most "open" decisions turn out to be already determined.

## 3. Draft the spec

- From `templates/spec-template.md` (next to this skill) into
  `docs/specs/spec-<scope>.md`. Bound the scope tightly. Put settled decisions
  in **Prior decisions** with rationale; mark each genuinely-open point
  explicitly (e.g. an `OPEN — resolved at the spec-acceptance gate` row).
- Fill the **Prior art** section: consult `docs/prior-art.md` for this scope and
  link the relevant entries by concern-heading so `/loopkit:implement` can reach
  them — or record `none relevant` explicitly when it has nothing for the scope.
  This section is a real planning output, checked at the spec-acceptance review
  (step 6).
- Fill **Human prerequisites** completely: every secret, external
  provisioning, dashboard config, or account only a human can provide for this
  milestone — or `none` explicitly. The implement loop depends on this being
  exhaustive: anything missed becomes a parked issue mid-loop.
- **No step list inside the spec** — steps live as issues. The `Outcome` list
  is done-criteria, not a progress mirror. Everything in `docs/` is written in
  English.

## 4. Anticipate implementer questions (pre-mortem — NOT a new gate)

A pre-mortem over the drafted spec — clarification belongs to planning, so the
spec must leave zero open questions for the implementer (`docs/constitution.md`).
This is a **sub-step that feeds the existing acceptance gate (step 6)**, never a
second human stop.

- Ask **"what would an implementer ask while building this?"** Walk the spec's
  outcomes and verification as if implementing them: name every fork, ambiguous
  contract, or unstated default a subagent would hit mid-build.
- **Resolve each from `docs/vision.md`, `docs/constitution.md`, and
  `docs/prior-art.md`** (the same precedent/constraint inputs as step 2, named
  explicitly). When one of these settles the question, bake the answer into the
  spec — a **Prior decisions** row plus a **Decision log** entry — so the
  implementer never has to ask.
- **What neither precedent nor constraint settles becomes a genuinely-open
  item** carried into the acceptance gate (step 6), where `AskUserQuestion`
  resolves it — exactly like the genuinely-open bucket from step 2. Mark it in
  the spec (`OPEN — resolved at the spec-acceptance gate`); do not guess.
- Scope it to questions answerable from vision/constitution/prior-art or
  genuinely open — not unbounded speculation. A fork that still reaches an
  implementer is a planning defect this step exists to catch.

## 5. Worktree and PR

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

## 6. Review + spec-acceptance gate (STOP — the milestone gate)

- Review the spec with a **fresh context via the Agent tool**
  (`general-purpose` or `code-reviewer`), seeded with the PR diff and the
  decision docs (`docs/constitution.md`, `docs/prior-art.md`, any sibling spec
  it builds on). Ask for a verdict whose first line is `VERDICT: APPROVE` or
  `VERDICT: REQUEST_CHANGES`, with blocking vs non-blocking findings. The Agent
  tool runs in-session — never shell out to a billed CLI. Address the findings.
- **STOP — the cycle's one human gate:**
  - Resolve each genuinely-open decision via `AskUserQuestion` — do not guess.
    Bake the answer into the spec (Prior decisions row + Decision log entry).
  - Present the **Human prerequisites** for delivery: the human provides the
    keys/config or confirms them as in place NOW, so the milestone can later
    be implemented without interruption. Record delivered items as checked.
  - Ask the human to accept the spec.
- On acceptance: merge the spec PR autonomously — the merge **is** acceptance,
  the spec carries no lifecycle header to flip. Wait for green checks only if
  the repo has CI checks configured, then squash-merge, remove the worktree,
  and fast-forward the local base branch.
  ```
  gh pr merge <n> --squash --delete-branch
  git worktree remove "$wt"
  git checkout "$base" && git pull --ff-only
  ```

## 7. Milestone, issues, board (only AFTER the spec merges)

- The spec path must resolve on the **default branch**, so it must be merged
  first. Then create the milestone and one issue per implementable step:
  ```
  gh api repos/:owner/:repo/milestones -f title="<Milestone>" \
    -f description="Design: docs/specs/spec-<scope>.md\nHuman prerequisites: <delivered | summary>\nDepends on milestone: #<n>[, #<m>] | none"
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
- **Milestone-level depends-on:** record which milestones this one depends on as
  a parseable `Depends on milestone: #<n>[, #<m>]` line in the milestone
  description — e.g. a roadmap phase that must follow a prior phase, or a feature
  that builds on another milestone. When the milestone is independent (depends on
  no other), write `Depends on milestone: none`. `/loopkit:implement` and humans
  read this token to tell which milestones are independent and can run as
  parallel orchestrators.
- Add every issue to the project board (the contract names it) with status
  `Todo`.

## 7a. Living-spec milestone (only when the human opened an ongoing theme)

A living-spec is the same chain as step 7, with two differences — it is
**human-initiated** and its milestone **stays open**.

- **Acceptance is the P1 model** — exactly as step 6: a merged spec on the
  default branch + an open milestone. The spec carries no lifecycle header to
  flip; the **open milestone is the signal the theme is active**. Nothing about
  acceptance differs from full-spec.
- Create the milestone (step 7) and **leave it open**; do not plan an end state
  for it. **Mark it living-spec** so `/loopkit:implement` can tell the tracks
  apart at the QA gate: put a `Track: living-spec` line in the milestone
  description (a full-spec milestone has no such line). Seed it with the issues
  known now and **keep accreting** issues into the same open milestone as the
  theme grows — re-run this skill with the same scope to add more (the merged
  spec already covers them). Use `Depends on: #N` for ordering as usual.
- It is **not a roadmap phase:** skip step 8 — do not add it to the roadmap
  overview's phase table, and never fill a current-focus/status marker.
  Loop-mode never sees it (step 1), so the loop terminal state is unaffected.
- It is **never archived or closed by the QA gate.** Closing one of its issues
  archives nothing; the milestone and spec stay live. `/loopkit:implement`
  handles the QA-gate behavior (per-batch summary, no archive) — this skill's
  job is to open the milestone and keep accreting issues into it.

## 8. Roadmap (mandatory for full-spec — closes the loop; skip for living-spec, see 7a)

- Every plan cycle ends by updating `docs/roadmap.md`: fill the planned
  phase's **Spec** and **Milestone** links in the overview table. That is the
  only change — no current-focus pointer, no status marker. The linked
  milestone is where status lives.
- Do this via its own `docs:` worktree + PR (step 5 again), **merged
  autonomously** — no gate. The `#NN` links only exist after step 7, which is
  why this is a separate PR from the spec. The cycle is not done until the
  roadmap reflects it.

## Close out

- When the spec's verification is fully met (the milestone's issues all close),
  `/loopkit:implement`'s milestone QA gate archives the spec and updates the
  roadmap. The closed milestone is the "done" signal — never add a status
  marker to a spec.
- **Exception — a living-spec milestone (step 7a) never closes out:** its
  milestone stays open and accretes issues; the QA gate runs per closed-issue
  batch without archiving the spec or closing the milestone. There is no "done"
  signal for an ongoing theme.

## If blocked — park, don't die

- A blocker only a human can clear: label the affected issue or milestone
  `blocked:human` and comment exactly what is needed and where to deliver it.
  Then continue with the next plannable phase if one exists; only when nothing
  is plannable, ask in-session and wait — an attended session waiting for
  input costs nothing.
- Never guess, never work around, never add status markers to specs.
