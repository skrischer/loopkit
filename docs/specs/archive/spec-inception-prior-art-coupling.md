# Spec: inception-prior-art-coupling — every plannable phase backed by prior art

> Created: 2026-06-19

`/loopkit:inception` couples prior art and the roadmap in **one direction only**:
Step 2 says prior art "may spawn roadmap items", but nothing pulls prior art for
new roadmap phases. So extending the roadmap (Step 6) — especially on a brownfield
`--here` gap-closure run — silently leaves the new phases with no prior-art
concern, and `/loopkit:plan` then seeds their specs from nothing. This spec makes
the coupling **bidirectional**: every plannable roadmap phase must be backed by at
least one prior-art concern (or an explicit greenfield note), enforced in Step 2,
Step 6, the brownfield rule, and the Close-out readiness checklist — with a light
phase<->concern tag convention so `/loopkit:plan` can resolve "prior art for phase
N" deterministically.

## Outcome

- [ ] `skills/inception/SKILL.md` Step 2 states the coupling as **bidirectional**:
      prior art may spawn roadmap items AND every plannable roadmap phase must be
      backed by >=1 prior-art concern (or an explicit "greenfield — no prior art"
      note), because `/loopkit:plan` seeds specs from prior art.
- [ ] Step 6 (roadmap) runs a **prior-art pass**: after deriving/extending the
      phase list, for any phase concern not already covered in `docs/prior-art.md`
      it runs Step 2's research (same research-mode choice) and adds a per-concern
      entry, indexed by concern and tagged with the phase it feeds.
- [ ] The **brownfield rule** states that adding or extending a roadmap phase
      opens a prior-art gap for that phase's concern — close BOTH, not just the
      roadmap (the gap that the Rack dogfooding run hit).
- [ ] The **Close-out readiness checklist** includes: every roadmap phase has
      prior-art coverage to seed its spec (or an explicit greenfield note) — so
      both greenfield and brownfield runs catch the miss automatically.
- [ ] A light **phase<->concern tag convention** is codified: prior-art concern
      headers carry a `(Phase N)` / `(feature: <slug>)` tag naming the phase they
      feed, mirrored in `skills/inception/templates/prior-art.md`.

## Scope

### In scope

- `skills/inception/SKILL.md` — Step 2 (dual rule), Step 6 (prior-art pass),
  the brownfield rule paragraph, the Close-out readiness checklist, and a
  reference to the tag convention.
- `skills/inception/templates/prior-art.md` — show the `(Phase N)` /
  `(feature: <slug>)` concern-header tag so target projects inherit it.

### Out of scope

- `skills/plan/SKILL.md` — already consults `docs/prior-art.md` and records
  `none relevant` explicitly (its Prior-art section). The gap is purely
  inception not pulling prior art when it grows the roadmap; plan needs no change.
- Backfilling prior art for already-shipped loopkit phases (P1–P6,
  tooling-preflight) — closed milestones; this spec changes the process, not history.
- Mandating a specific research depth — Step 6 reuses Step 2's existing
  research-mode ask (deep-research / websearch / none); it does not add a new one.

## Constraints

- Constitution: "Prior art is consulted and linked — `/plan` checks
  `docs/prior-art.md` per spec and links the relevant entries." This spec closes
  the upstream half: inception must ensure the entries EXIST per phase before
  `/plan` runs. Reference, do not restate.
- Constitution: "One character per foundation artifact … no content duplicated
  across them" and skill prose "terse, imperative, gate-marked, no duplication
  across the three skills." The dual rule lives in inception's Step 2/6; do not
  copy it into plan/implement.
- Constitution: "Proportional ceremony." The greenfield-escape ("no prior art"
  note) keeps the rule from forcing research onto phases that genuinely have no
  prior art — the rule mandates coverage-or-an-explicit-note, never busywork.
- The change is skill/template prose only — no code, no new dependency, no state.

## Prior art

- [Research-to-plan coupling — every plannable phase backed by prior art](../prior-art.md#research-to-plan-coupling--every-plannable-phase-backed-by-prior-art-feature-inception-prior-art-coupling)
  — the originating concern: the Rack dogfooding finding (the exact gap this
  spec fixes) plus dual-track agile (research gates entry to the plannable queue)
  and spec-kit's per-feature `research.md` (research as a first-class artifact
  gating the spec). ADOPT notes there map 1:1 to the five outcomes above.

## Human prerequisites

- none — a self-contained skill/template prose change; no secrets, accounts, or
  provisioning. (The feedback source `docs/feedback/2026-06-17-prior-art-roadmap-coupling.md`
  is already merged on `main`.)

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Dual rule wording: "every plannable roadmap phase must be backed by >=1 prior-art concern (or an explicit 'greenfield — no prior art' note), because `/loopkit:plan` seeds specs from prior art" — appended to Step 2's existing "prior art is not a passive document" line | feedback proposal #1; keeps the rule where the challenge already lives, no duplication | 2026-06-19 |
| Step 6 prior-art pass reuses Step 2's research-mode ask, runs only for phase concerns not already covered, and tags each new entry with the phase | feedback #2; avoids a second research mechanism; "gaps are fine" stays true for genuinely-greenfield phases via the note | 2026-06-19 |
| Brownfield rule gains: "adding or extending a roadmap phase opens a prior-art gap for that phase's concern — close both, not just the roadmap" | feedback #3; the "run ONLY the steps that close gaps" line is exactly what misled the Rack run | 2026-06-19 |
| Close-out checklist item (verbatim): `[ ] Every roadmap phase has prior-art coverage to seed its spec (or an explicit greenfield "no prior art" note)` | feedback #4; this is the automatic catch in both greenfield and brownfield | 2026-06-19 |
| Tag convention: prior-art concern `##` headers carry a trailing `(Phase N)` for roadmap P-numbers or `(feature: <slug>)` for Features-table rows; shown in the template | feedback #5; already de-facto used in loopkit's own `docs/prior-art.md`, so codifying is consistent and lets `/plan` resolve "prior art for phase N" | 2026-06-19 |
| Scope = inception SKILL.md + its prior-art template only; plan/implement untouched | plan already links prior art per spec (constitution) — the missing half is upstream, in inception | 2026-06-19 |
| Tag convention (proposal #5) SHIPS in this milestone — 2 issues, issue 2 `Depends on:` issue 1 | accepted at the spec-acceptance gate; the tags are already de-facto used in loopkit's own `docs/prior-art.md`, so codifying is consistent and lets `/plan` resolve "prior art for phase N" | 2026-06-19 |

### Pinned reference strings (issues copy these verbatim)

- Step 2 dual rule — append as a NEW sentence immediately after the existing
  "prior art is not a passive document." (keep that sentence's period; start the
  new one with "Conversely,"):
  "Conversely, every plannable roadmap phase must be backed by at least one
  prior-art concern (or an explicit `greenfield — no prior art` note), because
  `/loopkit:plan` seeds specs from prior art."
- Step 6 prior-art pass (new bullet appended after the phase-table bullet, before
  the north-star bullet):
  "Then run a prior-art pass: for any phase concern not already covered in
  `docs/prior-art.md`, run Step 2's research (same research-mode choice) and add
  a per-concern entry, indexed by concern and tagged with the phase it feeds — or
  record an explicit `greenfield — no prior art` note for that phase."
- Brownfield rule addition — append as a NEW sentence at the end of the brownfield
  paragraph, immediately after "surface conflicts at the artifact's gate.":
  "Adding or extending a roadmap phase opens a prior-art gap for that phase's
  concern — close both, not just the roadmap."
- Close-out checklist item: `[ ] Every roadmap phase has prior-art coverage to
  seed its spec (or an explicit greenfield "no prior art" note).`
- Tag convention — concern `##` header form `## <Concern> (Phase N)` or
  `## <Concern> (feature: <slug>)`. Template (`templates/prior-art.md`) line:
  change the example header `## <Concern>` to `## <Concern> (Phase N | feature: <slug>)`
  with a one-line note that the tag names the roadmap phase the concern feeds.

## Tracking

- Milestone: inception-prior-art-coupling (created once this spec is merged)
- Issues: created from this spec — both touch `skills/inception/SKILL.md`, so
  they serialize (issue 2 `Depends on:` issue 1). Milestone-level:
  `Depends on milestone: none` (independent; tooling-preflight is closed).
  If the gate DEFERS the tag convention, only issue 1 is created — no issue 2,
  no `Depends on:` edge.

Verify is `none yet`, so the QA gate splits into machine-checkable items
(read-through + grep) and manual-attended items (a smoke read of the changed skill).

**Machine-checkable (read-through / grep):**

- [ ] `inception/SKILL.md` Step 2 carries the bidirectional dual rule (the pinned
      sentence).
- [ ] `inception/SKILL.md` Step 6 carries the prior-art pass (the pinned bullet).
- [ ] The brownfield rule paragraph carries the pinned "opens a prior-art gap …
      close both" addition.
- [ ] The Close-out readiness checklist carries the pinned prior-art-coverage item.
- [ ] If the convention is in scope: `inception/SKILL.md` references the
      `(Phase N)` / `(feature: <slug>)` tag AND `templates/prior-art.md` shows it.
- [ ] grep: the pinned strings appear once, no drift between the dual rule's two
      mentions (Step 2 ↔ Close-out).

**Manual-attended (smoke read at the QA gate — no machine check covers these):**

- [ ] A dry read of inception's Step 6 makes clear: extend the roadmap -> the
      prior-art pass is non-optional follow-up (the Rack miss would now be caught).
- [ ] The greenfield escape reads as a genuine option, not busywork — a phase
      with no prior art is satisfied by the explicit note.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| The dual rule reads as forcing research onto every phase, re-introducing the ceremony loopkit rejects | the explicit `greenfield — no prior art` note is the escape; the rule mandates coverage-or-note, never mandatory research |
| Drift between the Step 2 statement and the Close-out checklist item | the pinned strings + a grep-consistency Verification item |
| Over-decomposition: two trivial issues on one file add serial overhead | keep it to two issues (coupling edits; optional convention) with a `Depends on:` edge; collapse to one if the gate defers the convention |

## Decision log

- 2026-06-19: Spec drafted from `docs/feedback/2026-06-17-prior-art-roadmap-coupling.md`;
  five outcomes map to the feedback's five proposals. Scope held to inception +
  its prior-art template (plan already links prior art per spec). One genuinely-open
  item: whether the optional tag convention (proposal #5) ships in this milestone.
- 2026-06-19: Spec-acceptance gate — tag convention (proposal #5) accepted INTO
  this milestone (2 issues). Human prerequisites: none. Review (PR #70) APPROVE
  with no blockers; four insertion-point findings folded into the pinned strings.
- 2026-06-19: Implemented via `/loopkit:implement` — #71 (PR #80) then #72
  (PR #81), serialized on `skills/inception/SKILL.md`. Two review notes resolved:
  dropped a Step 6 sentence not in the pinned string (#71); the template shows one
  tag form, not the combined `(Phase N | feature: <slug>)` pipe, since real
  entries carry exactly one tag (#72) — a deliberate deviation from the pinned
  template string, which would have propagated a wrong pattern to target projects.
- 2026-06-19: Milestone-QA — human gate WAIVED by the operator for this run.
  Machine-checkable Verification self-run green (all four pinned edits present;
  tag convention in SKILL.md + template; greenfield escape in both Step 2 and the
  Step 6 pass; no drift). Spec archived, milestone #8 closed.
