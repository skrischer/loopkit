# Spec: P6 — Clarification belongs to planning

> Created: 2026-06-16

Make clarification a planning-time responsibility. `/loopkit:plan` gains an
explicit step that anticipates the questions an implementer would ask and
resolves them in the spec. `/loopkit:implement`, when a fork still reaches it,
escalates back to planning instead of parking the issue as a dead end.

## Outcome

- [ ] `/loopkit:plan` has an explicit "anticipate implementer questions" step
      before the spec-acceptance gate: a pre-mortem that asks "what would an
      implementer ask?" and resolves each from vision/constitution/prior-art (or
      surfaces it as a genuinely-open decision at the gate).
- [ ] `/loopkit:implement`, when an implementer/subagent hits a fork the spec and
      code do not settle, escalates it back to planning — it labels the issue
      `needs:planning` with the question and stops that issue, rather than
      parking it `blocked:human` as a dead end.
- [ ] `needs:planning` is distinguished from `blocked:human`: the former routes
      to the planner (re-run `/loopkit:plan` to resolve in the spec), the latter
      is for human prerequisites (secrets, external provisioning).

## Scope

### In scope

- `skills/plan/SKILL.md` — the question-anticipation step (a pre-mortem before
  the acceptance gate).
- `skills/implement/SKILL.md` — fork escalation to planning (`needs:planning`),
  distinct from `blocked:human`; update BOTH step 2 and the "If blocked" section.
- `skills/inception/templates/workflow.md` — the "unblocked" definition must also
  exclude an issue carrying `needs:planning` (sync loopkit's own
  `docs/workflow.md` too).

### Out of scope

- The orchestrator model (P5) and prior-art linking (P4) — relied upon, not
  changed.

## Constraints

- Constitution: "Clarification belongs to planning. The implementer never asks
  the human. ... A fork that reaches an implementer is a planning defect: the
  implementer escalates it back to the planner (reopen the spec), which resolves
  it at the spec-acceptance gate." Reference, do not restate.
- Builds on P4 (prior art is one of the inputs the anticipation step uses) and
  P5 (the orchestrator/subagent is the thing that escalates).

## Human prerequisites

- none

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Forks escalate via a `needs:planning` label (distinct from `blocked:human`) | the two have different destinations: planner vs human-prerequisite delivery | 2026-06-16 |
| Resolution path for `needs:planning` = the human re-runs `/loopkit:plan` on the spec, which resolves the fork and updates the spec; the issue then returns to the frontier | keeps clarification in the planning skill, where vision/constitution/prior-art are in context | 2026-06-16 |
| The anticipation step is a `/loopkit:plan` sub-step before the acceptance gate, not a new human gate | it feeds the existing gate; genuinely-open items it surfaces are resolved there | 2026-06-16 |
| This phase runs after P5 (and after P1, which also edits `plan/SKILL.md`) | shared skill files; serialized by the roadmap sequence | 2026-06-16 |

## Tracking

- Milestone: P6 (created once this spec is accepted)
- Issues: created from this spec. The first issue carries
  `Depends on: #<P5's last issue>` — serialize after P5 (shared skill files).

## Verification

- [ ] `plan/SKILL.md` has an explicit question-anticipation step before the
      acceptance gate, naming vision/constitution/prior-art as its inputs.
- [ ] `implement/SKILL.md` escalates a fork with `needs:planning` (not
      `blocked:human`) and stops that issue, leaving the rest of the frontier.
- [ ] `implement/SKILL.md` documents the `needs:planning` vs `blocked:human`
      distinction and the re-run-`/plan` resolution path — in BOTH step 2 and the
      "If blocked" section.
- [ ] The workflow template's (and loopkit's own `docs/workflow.md`) "unblocked"
      definition also excludes an issue carrying `needs:planning`.
- [ ] Behavioral (milestone-QA script): a deliberately-underspecified issue is
      escalated `needs:planning`, not guessed and not parked `blocked:human`.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| `needs:planning` becomes a catch-all that hides real prerequisites | the spec defines the split: design forks -> `needs:planning`; secrets/provisioning -> `blocked:human` |
| The anticipation step turns into unbounded speculation | it is scoped to questions resolvable from vision/constitution/prior-art; the rest go to the gate as genuinely-open |

## Decision log

- 2026-06-16: `needs:planning` escalation distinct from `blocked:human`;
  anticipation is a plan sub-step feeding the acceptance gate (from the
  constitution).
