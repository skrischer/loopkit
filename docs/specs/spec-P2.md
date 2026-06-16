# Spec: P2 — Drop roadmap current-focus + status; manual targeting

> Created: 2026-06-16

Remove the current-focus pointer (and any status markers) from the roadmap, and
make `/loopkit:plan` take its scope from the human, not from a roadmap pointer.

## Outcome

- [ ] The roadmap template carries no "Current focus" section and no status
      markers.
- [ ] `/loopkit:plan` step 1 takes scope from its argument, not from a roadmap
      current-focus pointer.
- [ ] `/loopkit:plan` step 7 no longer moves a current-focus pointer; it only
      fills the phase's Spec/Milestone links.
- [ ] `/loopkit:plan` with no argument does not auto-advance; it reports the
      unplanned phases and asks the human to name one.
- [ ] `/loopkit:inception` Step 6 no longer instructs writing a current-focus
      pointer into the roadmap.

## Scope

### In scope

- `skills/inception/templates/roadmap.md` — remove the `## Current focus`
  section and any status markers.
- `skills/plan/SKILL.md` — steps 1 and 7, the no-argument/loop behavior, and the
  frontmatter `description:` line (which still says it auto-plans the next phase).
- `skills/inception/SKILL.md` — Step 6 prose no longer instructs writing a
  current-focus pointer into the roadmap.

### Out of scope

- `/loopkit:implement`'s issue auto-pick stays (consumer autonomy); milestone
  targeting for implement is P5.
- Spec lifecycle (P1) — already handled.

## Constraints

- Constitution: "The roadmap carries no current-focus or status marker. The
  human passes scope to the loops explicitly." Reference, do not restate.
- loopkit's own `docs/roadmap.md` already omits current-focus — no change there;
  this phase fixes the TEMPLATE and the plan skill so new projects match.

## Human prerequisites

- none

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| `/loopkit:plan` scope = the argument the human passes; no roadmap pointer | Constitution: the human passes scope explicitly | 2026-06-16 |
| `/loopkit:plan` with no argument reports unplanned phases and asks — it does not auto-pick the next one | removing the current-focus pointer removes the auto-advance source; the human decides priority | 2026-06-16 |
| `/loopkit:implement` issue auto-pick is unchanged here | consumer autonomy stays; implement's milestone targeting is P5 | 2026-06-16 |

## Tracking

- Milestone: P2 (created once this spec is accepted)
- Issues: created from this spec.

## Verification

- [ ] `roadmap.md` template has no "## Current focus" heading and no status
      markers.
- [ ] `plan/SKILL.md` step 1 derives scope from the argument; step 7 fills links
      only (no pointer move).
- [ ] `plan/SKILL.md` no-argument path reports unplanned phases and asks, instead
      of planning "the next phase without a Spec link".
- [ ] `plan/SKILL.md` frontmatter `description:` no longer claims it auto-plans
      the next unplanned phase.
- [ ] `inception/SKILL.md` Step 6 no longer mentions a current-focus pointer.
- [ ] The roadmap template's `Specs ... carry only DRAFT/READY` line is left for
      P1, not touched here.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Other skill prose assumes a current-focus exists | covered by the plan/SKILL.md step-1/step-7 issue's grep check |

## Decision log

- 2026-06-16: Manual targeting; no-argument plan asks instead of auto-advancing
  (from the constitution).
