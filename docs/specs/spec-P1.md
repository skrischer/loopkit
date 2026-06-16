# Spec: P1 — Drop spec lifecycle state (DRAFT/READY)

> Created: 2026-06-16

Remove the DRAFT/READY lifecycle from specs. A spec's acceptance signal becomes
"merged on the default branch with a milestone and issues", not a header flag.

## Outcome

- [ ] Specs carry no `DRAFT`/`READY` (or any lifecycle) header.
- [ ] `/loopkit:plan` no longer flips `DRAFT`->`READY`; acceptance = merge +
      milestone/issues created.
- [ ] `/loopkit:plan`'s loop terminal state no longer checks for a `READY` spec;
      it checks that every roadmap phase has a merged spec with a milestone and
      issues.
- [ ] `/loopkit:implement` no longer guards on `READY`; it acts on a merged spec
      that has a milestone.
- [ ] The `docs/workflow.md` template's Status section reflects the no-lifecycle
      model.
- [ ] No remaining `DRAFT`/`READY` references across skills and templates.

## Scope

### In scope

- `skills/plan/templates/spec-template.md`, `skills/plan/SKILL.md`,
  `skills/implement/SKILL.md`, `skills/inception/templates/workflow.md`,
  `skills/inception/templates/roadmap.md`, and `skills/inception/SKILL.md`
  references.

### Out of scope

- Removing the roadmap current-focus (P2), proportional tracks (P3), the
  orchestrator model (P5) — separate phases.

## Constraints

- Constitution: "Specs carry no lifecycle state. Accepted = merged on the
  default branch with a milestone and issues." Reference, do not restate.

## Human prerequisites

- none

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Acceptance signal = merged spec on the default branch + a milestone with issues | Constitution principle; the board + milestone already hold live state — `DRAFT`/`READY` was redundant | 2026-06-16 |
| A spec in an open PR is "in review", not active; merge is acceptance | PR state already encodes this — no header needed | 2026-06-16 |
| `/loopkit:plan`'s loop terminal state becomes "every roadmap phase has a merged spec with a milestone and issues" | replaces the old "every phase has a READY spec" check | 2026-06-16 |
| `skills/inception/SKILL.md`'s "only specs carry DRAFT/READY" sentence is rephrased to drop the lifecycle claim | part of the no-lifecycle sweep; keep the surrounding roadmap-status guidance | 2026-06-16 |

## Tracking

- Milestone: P1 (created once this spec is accepted)
- Issues: created from this spec (one per implementable step).

## Verification

- [ ] `grep -rn 'DRAFT\|READY' skills/` returns no lifecycle uses (archived
      specs excepted).
- [ ] `plan/SKILL.md` step 5 has no `READY` flip; acceptance is defined as merge
      + milestone.
- [ ] `implement/SKILL.md` step 1 has no `READY` guard; it acts on a merged spec
      with a milestone.
- [ ] A read-through: a freshly drafted spec carries no status line.
- [ ] `skills/inception/SKILL.md` no longer claims "only specs carry
      DRAFT/READY"; the sentence is rephrased without the lifecycle term.
- [ ] `docs/roadmap.md`'s "no-DRAFT/READY spec model" prose is left unchanged —
      it is descriptive, not a lifecycle marker.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| A skill references `READY` implicitly (e.g. "never act on a DRAFT") | a dedicated grep-sweep issue closes the loop |

## Decision log

- 2026-06-16: Acceptance = merged spec + milestone (derived from the
  constitution).
