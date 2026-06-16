# Spec: P3 — Proportional ceremony: living-spec milestone + track:adhoc fast-lane

> Created: 2026-06-16

Make planning weight scale with change size. Introduce three tracks, each change
uses exactly one: full-spec (a feature), a living-spec milestone (an ongoing
theme that never closes), and a `track:adhoc` fast-lane (a bug/QoL change with no
spec and no milestone).

## Outcome

- [ ] The workflow contract (template) defines the three tracks and the per-track
      issue conventions, including the `track:adhoc` label and how a `track:adhoc`
      issue is created (by the human, no spec, no milestone).
- [ ] `/loopkit:plan` can open a living-spec milestone: a spec + milestone that
      stays open and accretes issues over time, instead of one spec per closed
      phase.
- [ ] `/loopkit:implement` has a fast-lane: it picks `track:adhoc` issues that
      carry no spec and no milestone, implements, and merges. BOTH guards are
      relaxed for `track:adhoc`: the "feat/fix must trace to a spec" rule AND the
      unblocked/idle predicate that currently requires a spec on the default
      branch.
- [ ] `/loopkit:implement`'s milestone-QA gate, for a living-spec milestone, runs
      QA on the closed-issue batch but does NOT archive the spec or close the
      milestone — it stays open and emits a per-batch summary instead.

## Scope

### In scope

- `skills/inception/templates/workflow.md` — the three tracks + issue conventions
  (`track:adhoc`, living-spec).
- `skills/plan/SKILL.md` — opening and maintaining a living-spec milestone.
- `skills/implement/SKILL.md` — the `track:adhoc` fast-lane (relax the
  spec-trace rule) and the living-spec milestone handling at the QA gate.

### Out of scope

- The orchestrator model (P5) and milestone-level depends-on — separate phase.
- Prior-art linking (P4).

## Constraints

- Constitution: "Proportional ceremony. Three tracks, each change uses exactly
  one: full-spec, a living-spec milestone, a `track:adhoc` fast-lane (no spec,
  no milestone)." Reference, do not restate.
- Builds on P1 (the no-`DRAFT`/`READY` spec model): a living spec has no
  lifecycle header; its open milestone is the signal it is active.

## Human prerequisites

- none

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| `track:adhoc` = a label-marked issue with no spec and no milestone | the fast-lane must skip ceremony entirely; the board alone holds its state | 2026-06-16 |
| A living-spec milestone stays open and accretes issues; it is never archived by the QA gate | it represents an ongoing theme, not a finite phase | 2026-06-16 |
| The "feat/fix PR must trace to a spec" rule is relaxed only for `track:adhoc` | small fixes must not require a spec; everything else still traces | 2026-06-16 |
| This phase builds on P1 | a living spec relies on the no-lifecycle spec model | 2026-06-16 |
| Living-spec milestones are human-initiated, not roadmap phases; `/loopkit:plan` loop-mode iterates roadmap phases only and never auto-plans a living-spec, so its terminal state is unaffected | a living-spec is an ongoing theme the human opens explicitly (P2: human passes scope) | 2026-06-16 |
| Living-spec acceptance uses P1's model (merged spec + open milestone), no `DRAFT`/`READY` flip | P3 builds on P1, which already removed the lifecycle flip | 2026-06-16 |

## Tracking

- Milestone: P3 (created once this spec is accepted)
- Issues: created from this spec; the first depends on P1's completion.

## Verification

- [ ] The workflow template documents all three tracks and the `track:adhoc`
      convention (no spec, no milestone).
- [ ] `plan/SKILL.md` describes opening a living-spec milestone that stays open.
- [ ] `implement/SKILL.md` picks a `track:adhoc` issue with no spec/milestone and
      drives it to a merged PR without requiring a spec.
- [ ] `implement/SKILL.md` does not archive/close a living-spec milestone at the
      QA gate; the milestone stays open and the gate emits a per-batch summary.
- [ ] `implement/SKILL.md`'s unblocked/idle predicate no longer requires a spec
      for `track:adhoc` issues (they are pickable without one).
- [ ] The workflow template documents the per-track issue conventions and how a
      `track:adhoc` issue is created (human, no spec/milestone).

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| The fast-lane becomes a bypass for work that deserves a spec | the constitution scopes `track:adhoc` to bug/QoL; the human applies the label |
| Living-spec milestones never get reviewed | the QA gate still runs per closed issue batch, just without archiving |

## Decision log

- 2026-06-16: Three tracks; `track:adhoc` skips spec+milestone; living-spec
  milestone never archived (from the constitution).
