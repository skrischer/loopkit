# Roadmap

> Living document: the catalogue of phases. The hand-off to `/plan`, which the
> human points at a phase; `/plan` then drafts its spec + issues and links them
> back here. No status markers and no current-focus pointer — the human chooses
> what to plan next; progress lives in the GitHub milestone each phase links to.

## Phase overview

| Phase | Name | Spec | Milestone |
|---|---|---|---|
| P1 | Drop spec lifecycle state (DRAFT/READY) | — | — |
| P2 | Drop roadmap current-focus + status; manual targeting | — | — |
| P3 | Proportional ceremony: living-spec milestone + `track:adhoc` fast-lane | — | — |
| P4 | Prior-art elevation: mandatory consult + linking; template challenge fields | — | — |
| P5 | `/implement` as milestone orchestrator; `/plan` emits milestone-level depends-on | — | — |
| P6 | Clarification belongs to planning: planner anticipates implementer questions; implementer escalates forks back | — | — |

A phase gets a Spec link once `/plan` drafts it, and a Milestone link once its
issues exist. The milestone (open/closed + issue progress) is where status lives.

## Dependencies & parallelization

The milestone-level `depends-on` principle, applied to loopkit itself:

- **P1, P2, P4 are largely independent** — parallelizable as separate milestones
  (independent orchestrators).
- **P3 builds on P1** (the proportional tracks assume the no-DRAFT/READY spec
  model).
- **P5 interacts with P3** (the fast-lane's dispatch is part of the orchestrator
  model) — sequence P5 alongside or after P3.
- **P6 complements P4** (planner exhaustiveness) and builds on the spec model
  (P1).
- The inception challenge lens (part of P4) is already bootstrapped in
  `skills/inception/SKILL.md`.

## North star

loopkit becomes the proportional loop — its own development driven by its own
loops, so every change to the tool flows through the same producer/orchestrator
cycle it ships.
