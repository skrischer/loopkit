# Spec: implement-frontier-exits

> Created: 2026-07-08

Close the orchestrator wave loop's undefined exit states so a dispatched issue
that resolves to none of merged / escalated / parked cannot re-dispatch forever,
and bind the review-retry loops to the contract's existing bounded-retry rule by
reference.

## Outcome

- [ ] `skills/implement/SKILL.md` defines every dispatched issue's resolution as
      exactly one terminal state (merged / escalated / parked); a dispatch that
      returns none — an issue left open with no label — is a **failed dispatch**:
      one retry, then auto-park `blocked:human` with a comment. No open, unlabeled
      issue can re-enter the unblocked frontier.
- [ ] The frontier is a **total function of issue state** — every open issue is
      exactly one of: unblocked, dependency-blocked, cross-milestone-blocked,
      parked, escalated. §2's frontier-empty **terminal branch routes on all of
      these**, not just the "all closed vs escalated/parked" binary it ships
      today: a frontier that empties with an issue still open and
      **cross-milestone-blocked** (its same-milestone `Depends on:` issues are
      closed, but a `Depends on:` issue in *another still-open milestone* is not)
      routes to the §4 report — never to a fourth undefined re-dispatch state. §4
      enumerates cross-milestone-blocked issues (**derived**, since they carry no
      label — an open issue whose same-milestone deps are closed but whose
      blocking `Depends on:` issue belongs to a different open milestone)
      alongside escalated (`needs:planning`) and parked (`blocked:human`).
- [ ] `skills/implement/SKILL.md`'s review gate loop and `skills/plan/SKILL.md`'s
      step-6 review loop consult the workflow contract's bounded-retry rule (same
      failure twice -> stop) **by reference** — no restated or copied rule; the
      existing §3 Verify no-progress restatement ("the identical failure twice in
      a row") is converted to the same by-reference form for consistency.
- [ ] Verify passes; no new dependency, headless flag, scheduler, API key, or
      local state.

## Scope

### In scope

- `skills/implement/SKILL.md`: the wave loop (§2 dispatch/await/recompute **and
  its frontier-empty terminal branch**, which must route on all five frontier
  states), the frontier definition (§1), the escalate/park report (§4), and the
  per-issue review gate (§3) — the loop-correctness loci only.
- `skills/plan/SKILL.md`: step-6 review — the bounded-retry-by-reference addition
  only.

### Out of scope

- Worktree/branch collision and resume idempotency -> `implement-resume-safety`
  (the next phase on this shared file).
- Merge-conflict recovery and file-overlap prediction -> `implement-conflict-recovery`
  (deferred).
- Rolling dispatch (re-dispatch as each subagent returns) — the skill already
  names it a future optimization; not introduced here.
- No change to the happy path, the wave-based coordination model, or the two
  human gates.

## Constraints

- The bounded-retry rule lives once in `docs/workflow.md` (and the constitution's
  Bounded-retry principle); the skills reference it, never restate it
  (constitution: no duplication, one character per artifact).
- Proportional ceremony: change only the loop-correctness loci; no skill-wide
  rewrite. Terse/imperative prose; no cross-skill duplication.
- GitHub-only durable state; subscription-auth only (constitution).

## Prior art

- [Orchestrator loop exit states & bounded review retry](../prior-art.md#orchestrator-loop-exit-states--bounded-review-retry-feature-implement-frontier-exits)
  — the design substrate: **explicit terminal states per dispatched unit** with a
  defined default (failed dispatch: one retry, then auto-park `blocked:human`) when
  a subagent exit maps to none; **frontier membership as a total function** of
  issue state; the bounded-retry rule consulted **by reference** from
  `docs/workflow.md`, not restated. Sub-entries: *Claude Code agent teams* (ADOPT
  explicit terminal states; AVOID a frontier defined only by the happy path) and
  *claude-task-master DAG frontier filters* (ADOPT frontier as a total function of
  issue state).

## Human prerequisites

- none — skill-prose changes only; no secret, provisioning, or account.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Every subagent dispatch resolves to exactly one of merged / escalated / parked; a dispatch that returns none (issue still open, no label) is a **failed dispatch** | prior-art (agent-teams): explicit terminal states + a defined default remove the undefined exit that re-dispatches forever | 2026-07-08 |
| Failed-dispatch handling = **one retry, then auto-park `blocked:human`** with a comment | matches the existing no-progress bound (identical failure twice -> stop); the park surfaces the failure to the human without stalling the orchestrator | 2026-07-08 |
| The frontier is a **total function** of issue state (unblocked / dependency-blocked / cross-milestone-blocked / parked / escalated), and §2's terminal branch routes on all five — never on the all-closed-vs-escalated/parked binary alone | prior-art (task-master DAG frontier filters): membership is a queryable total set, not an emergent happy-path condition; the binary branch leaves a cross-milestone-blocked issue in a fourth undefined state | 2026-07-08 |
| Cross-milestone-blocked is **derived, not labelled**: an open issue whose same-milestone `Depends on:` are closed but whose blocking `Depends on:` issue is in another still-open milestone | consistent with `skills/plan/SKILL.md` step-7 cross-milestone `Depends on:` edges; no new label or durable marker is introduced (unlike `needs:planning`/`blocked:human`) | 2026-07-08 |
| The review-retry loops (implement §3, plan step-6) reference the contract's bounded-retry rule, never restate it | constitution no-duplication; the rule already exists at contract level in `docs/workflow.md` | 2026-07-08 |

## Tracking

- Milestone: created from this spec once it is merged
- Issues: created after merge (one issue — a single coherent loop-correctness fix
  touching `skills/implement/SKILL.md` + `skills/plan/SKILL.md`)

## Verification

- [ ] Verify passes (`bash scripts/verify.sh`).
- [ ] `skills/implement/SKILL.md` states that a dispatched issue returning no
      terminal state (open, unlabeled) is a failed dispatch — one retry, then
      auto-park `blocked:human` — and is thereby removed from the unblocked
      frontier (grep-verifiable: the terminal-state / failed-dispatch prose).
- [ ] §2's frontier-empty terminal branch routes a still-open
      **cross-milestone-blocked** issue to the §4 report (not to §5 "all closed"
      and not back into the re-dispatch frontier) — the binary "all closed vs
      escalated/parked" branch is gone.
- [ ] The §4 report enumerates cross-milestone-blocked issues — derived (open,
      same-milestone deps closed, a `Depends on:` issue in another open milestone),
      since they carry no label — alongside escalated (`needs:planning`) and
      parked (`blocked:human`).
- [ ] `skills/implement/SKILL.md` §3 review gate and `skills/plan/SKILL.md` step-6
      review both consult the workflow contract's bounded-retry rule by reference,
      and §3's Verify no-progress restatement is converted to the same
      by-reference form (no copied "same failure twice" restatement beyond the
      reference itself).
- [ ] No diff introduces local state, an API key, a headless flag, or a scheduler
      (config-surface guard).

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| The frontier taxonomy bloats the skill prose | keep it a terse enumeration; the taxonomy is descriptive, the only new mechanism is retry-then-park |
| A retry masks a real subagent bug as a park | the park comment records the failure and `blocked:human` surfaces it to the human — the failure is not swallowed |
| Bounded-retry-by-reference drifts from the contract | the skills point at `docs/workflow.md`; the rule has a single home, so there is nothing to drift |

## Decision log

- 2026-07-08: Drafted from the `implement-frontier-exits` roadmap seed (2026-07-02
  batch, 2026-07-08 Fable audit build-now). Design settled entirely by the
  prior-art anchor (explicit terminal states + total-function frontier +
  bounded-retry-by-reference) — no genuinely-open decision. Scoped to one issue: a
  single coherent correctness fix across the two shared skill files.
- 2026-07-08: Spec-acceptance review caught a third undefined exit state the first
  draft missed — a frontier that empties with a **cross-milestone-blocked** issue
  hit neither §2 branch. Added the §2-terminal-branch-routes-on-all-five-states
  outcome + the derived (label-less) cross-milestone-blocked definition. The
  fix's one-retry-before-park bookkeeping is **in-session/ephemeral** — the
  orchestrator's own wave-state memory, never a durable marker or local-state
  file (GitHub stays the only durable state). The §3 Verify no-progress
  restatement is folded into the same bounded-retry-by-reference change for
  consistency (removes the duplication the review-loop fix targets).
