# Spec: P4 — Prior-art elevation: mandatory consult + linking; template challenge fields

> Created: 2026-06-16

Make prior art an active input to planning, not a passive document. `/loopkit:plan`
must consult `docs/prior-art.md` per spec and link the relevant entries into the
spec so `/loopkit:implement` can reach them. The templates gain the challenge
fields (idea-harvest, USP/differentiation) that the inception challenge lens
already produces.

## Outcome

- [ ] The spec template has a "Prior art" section where `/loopkit:plan` links the
      relevant `docs/prior-art.md` entries for the scope.
- [ ] `/loopkit:plan` consults `docs/prior-art.md` for every spec and links the
      relevant entries into the spec's Prior art section (or records "none
      relevant").
- [ ] The prior-art template carries explicit idea-harvest fields (ADOPT /
      AVOID) per entry.
- [ ] The vision template has a USP / differentiation section, the home for the
      challenge lens's "what justifies this project" output.

## Scope

### In scope

- `skills/plan/templates/spec-template.md` — add a "Prior art" section placed
  after Constraints, whose placeholder tells the planner to list the relevant
  `docs/prior-art.md` entries by concern-heading, or "none relevant".
- `skills/plan/SKILL.md` — in step 2, remove the "if the project keeps one"
  qualifier (make consultation unconditional) and add: link the relevant entries
  into the spec's Prior art section at draft time, or record "none relevant".
- `skills/inception/templates/prior-art.md` — explicit ADOPT / AVOID harvest
  fields per entry.
- `skills/inception/templates/vision.md` — a single "USP / differentiation"
  section (the home for the challenge lens's existence/USP/differentiation
  output), cross-referencing the prior-art ADOPT/AVOID entries.

### Out of scope

- The inception Step 2 challenge lens — already bootstrapped in
  `skills/inception/SKILL.md`.
- Planner question-anticipation (P6).

## Constraints

- Constitution: "Prior art is consulted and linked. `/loopkit:plan` checks
  `docs/prior-art.md` per spec and links the relevant entries so `/loopkit:implement`
  can reach them." Reference, do not restate.
- The inception Step 2 challenge lens already defines the four lenses (existence,
  USP, differentiation, idea harvest) — the templates must give those outputs a
  home.

## Human prerequisites

- none

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| `/loopkit:plan` records "none relevant" explicitly when prior art has nothing for the scope | absence must be a conscious check, not silence | 2026-06-16 |
| Harvest fields are ADOPT / AVOID per entry, kept in the entry's Notes | matches the inception Step 2 wording already shipped | 2026-06-16 |
| USP / differentiation lives in the vision template (not the constitution) | it is intent (what/why), not a binding rule | 2026-06-16 |
| This phase runs after P3 | both edit `plan/SKILL.md`; serialize to avoid a conflict | 2026-06-16 |

## Tracking

- Milestone: P4 (created once this spec is accepted)
- Issues: created from this spec. The first issue must carry
  `Depends on: #<P3's last issue>` (the implement loop's unblocked check reads
  exactly that line) — P4 and P3 both edit `plan/SKILL.md`, so serialize them.

## Verification

- [ ] `spec-template.md` has a "Prior art" section with guidance to link
      `docs/prior-art.md` entries.
- [ ] `plan/SKILL.md` mandates consulting prior art per spec and linking the
      relevant entries (or "none relevant").
- [ ] `prior-art.md` template shows ADOPT / AVOID harvest fields per entry.
- [ ] `vision.md` template has a USP / differentiation section.
- [ ] Note: the prior-art-consult checks are human-eyeball, not machine-gated —
      verified at the spec-acceptance review, not by a command.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Prior-art linking becomes a rubber-stamp "none relevant" | the spec-acceptance review checks the link section against the scope |

## Decision log

- 2026-06-16: Prior art consulted + linked per spec; templates gain the
  challenge fields (from the constitution + the inception challenge lens).
