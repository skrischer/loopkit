---
name: plan
description: "Drive one planning cycle end-to-end — survey readiness, draft a spec (the local single source of truth) with any human prerequisites, review it via the in-session Agent tool, and stop once per phase at the spec-acceptance gate. Then, on the spec branch, fold in the milestone + roadmap link, merge once (the merge is acceptance), and create the issues (with dependencies) + board entries. Loop-capable: without an argument it reports the roadmap's unplanned phases and asks which to plan (never auto-picks), reporting \"fully planned\" when none remains. Multi-phase: name one phase or an ordered set, each driven as its own cycle in order. Reads docs/workflow.md for project specifics."
argument-hint: "[phase ...]"
---

# /loopkit:plan — drive one planning cycle to a merged spec + issues

> Truncation guard: if the end-of-skill line is missing from your copy of this skill, it was cut after a compaction — Read ${CLAUDE_SKILL_DIR}/SKILL.md in full before continuing (in a full-file Read, ${CLAUDE_SKILL_DIR} means the directory this SKILL.md sits in).

Orchestrates the readiness -> spec-acceptance gate -> merge -> issues + board
cycle. Specs are the local single source of truth; milestones and issues are created
on GitHub from them. The argument is the scope to plan (see Readiness).

This is the planning-side sibling to `/loopkit:implement`. Both read
`docs/workflow.md` (produced by `/loopkit:inception`) for the repo, base branch,
board, commands, naming, gates, and loop rules — never hardcode them. If it is
missing, stop and tell the user to run `/loopkit:inception` first.

Autonomy: survey, draft the spec, open the PR, run the review, then — after
acceptance — create the milestone, fold the roadmap link onto the spec branch,
merge, and create issues + board entries autonomously. The one human stop per
phase is the spec-acceptance gate: genuinely-open decisions (AskUserQuestion,
never guess) plus the human-prerequisites handover (a multi-phase run stops
once per phase). On blockers, park instead of dying (see If blocked).

## Preconditions

- Read `${CLAUDE_PLUGIN_ROOT}/skills/shared/preflight.md` first, once per run:
  scopes `repo` + `project`, clean base required.
- A GitHub repo is required. Confirm with `gh repo view`; if there is none, stop.
- The base branch must have at least one commit — the spec PR worktree is
  branched from it (`git worktree add ... <base>`), which fails on an unborn
  branch. Check `git rev-parse --verify "<base>" 2>/dev/null`; if it fails,
  stop and ask the user to make the initial commit first
  (`/loopkit:inception`'s close-out offers it).

## 1. Readiness

- Scope comes from the argument — the human passes it explicitly: one phase
  (`/loopkit:plan dashboard-kpis`) or an ordered set
  (`/loopkit:plan auth-core auth-ui`). `docs/roadmap.md` is the queue of
  sequenced phases (it carries no current-focus or status marker); orient on it
  first.
- Multi-phase run: when the human names a set, drive each phase as its own
  full cycle in the given order — this readiness step's already-covered check
  and track decision, then steps 2–6 and the acceptance mechanics (its own spec
  and gate, milestone + roadmap link, one merge, issues, board) — before
  starting the next. Never reorder the set or add a phase the human did not
  name. A phase's milestone-level edge may depend on a sibling phase planned
  earlier in the same run (the acceptance mechanics write it). A multi-phase run
  may exceed the loop's iteration ceiling (`docs/workflow.md`) — split it across
  runs when it would; each phase's cycle is independent, so a split loses
  nothing.
- No argument: list the phases that have no merged spec with a milestone
  and issues yet, then ask the human which one(s) to plan (`AskUserQuestion` /
  in-session question). Never auto-advance to the next phase without a Spec
  link — the human names the unit of work.
- Loop terminal state: if every roadmap phase already has a merged spec
  with a milestone and issues, report "roadmap fully planned — waiting for new
  phases" in one line and end the cycle. Loop-mode iterates roadmap phases
  only; a living-spec milestone is never one, so it does not affect this state.
- Track (the proportional dial, see `docs/workflow.md`): decide which of the
  contract's three tracks this scope uses before drafting. Most planning is
  full-spec (a finite phase: spec + milestone that closes). When the human asks
  to open an ongoing theme that accretes work rather than a finite phase, plan
  the living-spec track (same cycle, milestone stays open): Read
  `${CLAUDE_SKILL_DIR}/references/living-spec.md` then, and again when closing
  out or re-running a living-spec scope. A living-spec is human-initiated —
  never inferred from the roadmap, never auto-planned in loop mode. The
  `track:adhoc` fast-lane carries no spec or milestone and is not a plan cycle
  (the human files it; `/loopkit:implement` picks it up).
- Survey existing specs, open issues and milestones:
  ```
  gh api --paginate repos/:owner/:repo/milestones --jq '.[]|"\(.number) \(.title) [\(.state)] open=\(.open_issues)"'
  gh issue list --state open --limit 200
  ```
- If a merged spec already covers the scope (with a milestone and issues),
  there is nothing to plan — point at `/loopkit:implement`. A spec still in an
  open PR is in review, not accepted: do not start a second plan against it.
  Exception: a living-spec milestone is re-run with the same scope to accrete
  more issues — "already covered" is expected there, so go straight to issue
  creation in `living-spec.md`.

## 2. Resolve decisions before writing

Sort every open design question into three buckets. Check bucket 2 against the
codebase and constitution before declaring anything open — most "open" questions
turn out to be already determined:

1. Precedent-decided — backed by reference implementations in
   `docs/prior-art.md`. Consult it for the scope unconditionally; adopt and
   record in the spec. When a `docs/prior-art.md` verdict is too coarse to
   settle the decision and the entry is a clonable public repo (a code `Path:`,
   not an article), you are encouraged to check that source out and read the
   specific implementation — a read-only, ephemeral clone outside the repo
   (e.g. `../loopkit-priorart/<project>`), discarded when done. Record the
   finding (file/approach) in the spec's Prior decisions + Decision log; never
   commit the external code into this repo. Only when it hardens a real
   decision, not for every entry.
2. Constraint-determined — derivable from this codebase, `docs/constitution.md`,
   or `CLAUDE.md`. Decide it and record the rationale.
3. Genuinely open — neither precedent nor constraint settles it. These are
   the only ones that block acceptance; they are resolved at the
   spec-acceptance gate (step 6), not guessed now.

## 3. Draft the spec

- From `${CLAUDE_SKILL_DIR}/templates/spec-template.md` into
  `docs/specs/spec-<scope>.md`. Bound the scope tightly. Put settled decisions
  in Prior decisions with rationale; mark each genuinely-open point
  explicitly (e.g. an `OPEN — resolved at the spec-acceptance gate` row).
- Fill the Prior art section: consult `docs/prior-art.md` for this scope and
  link the relevant entries by concern-heading so `/loopkit:implement` can reach
  them — or record `none relevant` explicitly. The spec-acceptance review
  (step 6) checks this section.
- Fill Human prerequisites completely: every secret, external provisioning,
  dashboard config, or account only a human can provide for this milestone — or
  `none` explicitly. Anything missed becomes a parked issue mid-loop.
- No step list inside the spec — steps live as issues. The Outcome list is
  done-criteria, not a progress mirror. Everything in `docs/` is in English.
- Design surface (optional, by surface only): if this scope has UI surface
  or a visualisation would materially clarify a decision (flow / state /
  architecture / concept), invoke `/loopkit:design` from within this planning
  cycle (it reads `docs/design.md` for every tool specific) and reference its
  committed design artifact from the spec by repo path — the design travels in
  the spec package and is reviewed at the spec-acceptance gate (step 6), adding
  no new gate. The referenced artifact's presence is the design-surface signal
  the implementer reads — no separate label. A scope with neither surface skips
  this entirely (proportional ceremony). If `docs/design.md` is missing or records `none`, the
  project did not enable the design phase: note it and proceed without designing.

## 4. Anticipate implementer questions (pre-mortem — not a new gate)

A pre-mortem over the drafted spec — clarification belongs to planning, so the
spec must leave zero open questions for the implementer. This is a sub-step that
feeds the existing acceptance gate (step 6), never a second human stop.

- Ask "what would an implementer ask while building this?" Walk the spec's
  outcomes and verification as if implementing them: name every fork, ambiguous
  contract, or unstated default a subagent would hit mid-build.
- Resolve each from `docs/vision.md`, `docs/constitution.md`,
  `docs/architecture.md`, and `docs/prior-art.md`. When one settles the
  question, bake the answer into the spec — a Prior decisions row plus a
  Decision log entry — so the implementer never has to ask.
- What none of them settles becomes a genuinely-open item carried into the
  acceptance gate (step 6), marked in the spec as in step 3; do not guess.
- Scope it to questions those docs answer or that are genuinely open. A fork that still reaches an implementer is a
  planning defect this step exists to catch.

## 5. Worktree and PR

- Create a docs worktree off the base branch (paths from `docs/workflow.md`):
  ```
  base=<base branch from workflow.md>
  wt=../<repo>-worktrees/docs-<scope>
  git worktree add "$wt" -b docs/<scope> "$base"
  ```
- Write the spec into the worktree, then operate only via `git -C "$wt"`,
  never `cd`, so nothing lands on the main checkout.
  ```
  git -C "$wt" add docs/specs/spec-<scope>.md
  git -C "$wt" commit -m "docs(spec): ..."
  git -C "$wt" push -u origin docs/<scope>
  gh pr create --base "$base" --head docs/<scope> --title "docs(spec): ..." --body "..."
  ```
- A `docs:` spec PR closes no issue.

## 6. Review + spec-acceptance gate (STOP — the milestone gate)

- Review the spec with a fresh context via the Agent tool
  (`general-purpose`, which loads `CLAUDE.md`; a custom reviewer agent works
  only if it does not set `omitClaudeMd`), seeded with the PR diff and the
  decision docs (`docs/architecture.md`, `docs/prior-art.md`, any sibling spec
  it builds on). `docs/vision.md` and `docs/constitution.md` are not re-seeded:
  the project `CLAUDE.md` imports both, so the reviewer already has them.
  `docs/architecture.md` is seeded because `CLAUDE.md` does not auto-load it.
  Ask explicitly whether the spec contradicts `docs/vision.md`,
  `docs/constitution.md`, or `docs/architecture.md` (blocking if so). Verify every foundation-doc citation against the full
  source, never at face value: a spec citing one success criterion while passing
  over a line that answers the other way must be caught here.
  Ask for a verdict whose first line is `VERDICT: APPROVE` or
  `VERDICT: REQUEST_CHANGES`, with blocking vs non-blocking findings. The Agent
  tool runs in-session — never shell out to a billed CLI. The reviewer's model
  tier comes from `docs/workflow.md`'s optional role->tier field (`reviewer`;
  default `inherit`) — no literal model name lives here.
  The spec-acceptance review always stays top-tier, even though a spec PR is a
  docs-only diff: it is the planning-rigor checkpoint, so the cheaper
  no-source-change reviewer never applies to this gate.
  Address the findings and re-review, bounded by `docs/workflow.md`'s
  no-progress rule — a repeated failure stops and parks (see If blocked).
  The design artifact the spec references (step 3) is reviewed here with the
  rest of the spec — not a separate stop.
- **STOP — the cycle's one human gate:**
  - Resolve each genuinely-open decision via `AskUserQuestion` — do not guess.
    Bake the answer into the spec — a Prior decisions row + Decision log entry,
    committed onto the spec branch pre-merge (never to a branch the merge has
    already deleted).
  - Present the Human prerequisites: the human provides the keys/config or
    confirms them in place now, so the milestone can be implemented without
    interruption. Record delivered items as checked.
  - Ask the human to accept the spec.
- On acceptance, Read `${CLAUDE_SKILL_DIR}/references/acceptance.md` and run it.

## Close out

- When the milestone's issues all close, `/loopkit:implement`'s milestone QA
  gate archives the spec and updates the roadmap. The closed milestone is the
  "done" signal — never add a status marker to a spec.
- Exception: a living-spec milestone never closes out — see
  `${CLAUDE_SKILL_DIR}/references/living-spec.md`.

## If blocked — park, don't die

- A blocker only a human can clear: label the affected issue or milestone
  `blocked:human` and comment exactly what is needed and where to deliver it.
  Then continue with the next plannable phase if one exists; only when nothing
  is plannable, ask in-session and wait.
- Never guess, never work around, never add status markers to specs.

End of /loopkit:plan.
