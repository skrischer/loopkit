# Spec: design-in-the-loop — broaden design from UI-only to "a visualisation clarifies the decision"

> Created: 2026-07-02

The design phase today triggers on **UI surface only** (`design-phase`, #9). But
a flow, a state machine, an architecture, or a mental model can be "designed"
too — drawn to settle a decision, exactly as the loopkit-interpretation diagram
did (no UI, yet a design artifact that drove alignment). This spec broadens the
optional design phase from "UI surface" to **"a visualisation would materially
clarify the decision"** (UI **or** concept/flow/architecture), weaves it into the
roadmap+plan **sparring** (no new gate — still reviewed at spec-acceptance), and
names a **tool-agnostic, git-committable durable medium** that renders in the
review surface. It stays optional and proportional; a change that neither renders
UI nor benefits from a diagram carries no design artifact. loopkit dogfoods the
result by adopting its own `docs/design.md` (medium: committed SVG).

## Outcome

- [ ] The design **trigger is broadened** from "UI surface" to **"the change has
      UI surface OR a visualisation would materially clarify a decision"**
      (flow / state / architecture / concept) — in `skills/design/SKILL.md`,
      `skills/plan/SKILL.md` (Step 3), and `skills/inception/SKILL.md` (Step 7b).
      Still optional; a change that needs neither skips design entirely
      (proportional ceremony intact, grep-verifiable).
- [ ] Design is **woven into the sparring**: `skills/shared/iteration-steps.md`
      and `skills/roadmap/SKILL.md` allow an **exploratory** visualisation during
      the prior-art challenge to sharpen an idea (the date-range-picker example) —
      **without** adding a gate. The **durable, reviewed** design artifact is
      still produced in the `/loopkit:plan` cycle and reviewed AT the
      spec-acceptance gate. Exactly two human gates remain (grep-verifiable).
- [ ] A **tool-agnostic durable medium** is named: the durable design form is a
      committed file that **renders in the review surface** — Mermaid (GitHub-
      native, diffs cleanly) **or** a committed SVG (richer layout) **or** an
      exported image, chosen per project in `docs/design.md`. The constitution
      states this as an agnostic requirement (examples, not a mandate); the design
      **mechanism hardcodes no medium** (grep-verifiable, the `docs/workflow.md`
      pattern).
- [ ] The `docs/design.md` **template generalizes** to non-UI concept design: a
      `kind: ui | concept | both` switch; UI-token front-matter present only for
      `ui`/`both`; for `concept` the contract names the diagram medium and where
      diagrams live, omitting UI tokens.
- [ ] The **foundation reflects the broadening** (authored in THIS spec PR,
      ratified at the spec-acceptance gate per the constitution corollary —
      NOT an implement issue): `docs/vision.md` scope (design triggers on
      visualisation-clarifies-decision, not UI-only); `docs/constitution.md` design
      principle (broadened trigger + the agnostic durable-medium requirement, two
      gates intact); `docs/architecture.md` (design woven into sparring; the design
      component covers non-UI concept design).
- [ ] loopkit **dogfoods** the broadened phase: it adopts its own
      `docs/design.md` (`kind: concept`, medium: committed SVG) and commits the
      loopkit-interpretation diagram as its first design artifact, referenced from
      the contract.

## Scope

### In scope

- **Broaden the trigger** at the three invocation sites (`skills/design`,
  `skills/plan` Step 3, `skills/inception` Step 7b) from UI-surface to
  visualisation-clarifies-decision.
- **Weave design into the sparring** (`skills/shared/iteration-steps.md`,
  `skills/roadmap`) as an exploratory step — no new gate.
- **Name the tool-agnostic durable medium** (renders in the review surface;
  Mermaid / committed SVG / exported image) in the constitution and generalize the
  `docs/design.md` template for non-UI concept design.
- **Foundation amendments** (vision scope, constitution design principle,
  architecture flow/component) — authored in THIS spec PR, ratified at the gate.
- **Dogfood**: loopkit's own `docs/design.md` + the committed interpretation SVG.

### Out of scope

- The **design-coverage findings** in
  `docs/feedback/2026-06-19-design-skill-retrofit.md` (retrofit path, batch mode,
  capability→surface coverage enforcement, state-variant enumeration, coverage
  review, `Design:`-line back-write). That is a **distinct axis** (design
  *completeness*, not the *trigger/medium*) and earns its own roadmap phase via
  `/loopkit:roadmap` — folding it here would violate proportional scope.
- Shipping or mandating a specific diagram tool — the project picks the medium in
  `docs/design.md`; loopkit orchestrates when/how design enters the loop
  (unchanged from `design-phase`).
- A diagram render/validation pipeline (e.g. a Mermaid CI validator) — a future
  add if iteration cost warrants; not this phase.
- Making design mandatory or adding a third human gate.
- Spec-as-source / bidirectional code<->design generation (constitution don't).

## Constraints

- Constitution **"Optional, tool-agnostic design phase"** — this spec *broadens
  its trigger* (UI → visualisation-clarifies-decision) and *names the durable
  medium agnostically*; it must keep the phase optional, the mechanism tool-free
  (reads `docs/design.md`), and the durable form a committed file. Reference, do
  not restate.
- Constitution **"Exactly two human gates"** — sparring is a **dialog, not a
  gate**; the design is reviewed AT spec-acceptance. Weaving design into sparring
  must add **no** stop; a Verification item asserts the constitution still says
  exactly two gates.
- Constitution **"GitHub-only durable state"** — the durable medium must render in
  loopkit's own state (the committed markdown / repo files); an external-tool URL
  is never the durable form.
- Constitution **"Foundation edits belong to planning"** (the corollary
  roadmap-iteration #10 added) — vision/constitution/architecture edits are
  authored in THIS spec PR and ratified at the spec-acceptance gate, never in
  `/loopkit:implement`. This phase is the first to apply the corollary.
- Constitution **"No content duplicated across foundation artifacts"** — the
  broadened principle lives once (constitution), the scope once (vision), the flow
  once (architecture).
- Architecture boundary **"the five skills do not know each other's internals"** —
  the sparring-design wiring flows only through `docs/` artifacts and
  `skills/shared/iteration-steps.md`, never a cross-skill internal reference.

## Prior art

- [Non-UI concept design + the durable diagram medium](../prior-art.md#non-ui-concept-design--the-durable-diagram-medium-feature-design-in-the-loop)
  — the core concern. **Mermaid** (reuse: GitHub-native, diffs cleanly, fragile
  syntax) and **C4** / **ADR-minus-lifecycle** (reference-only: the notation and
  the decision-artifact shape) directly settle the medium and the prose skeleton.
  NOTE the tension this spec resolves at the gate: the prior-art verdict makes
  **Mermaid** the recommended default and cautions against bespoke SVG as a
  default, whereas the roadmap row + operator chose **committed SVG for loopkit** —
  reconciled by keeping the constitution agnostic (both valid) and letting
  loopkit's own `docs/design.md` pick SVG.
- [Design phase in the loop — optional, tool-agnostic design anchored to the spec](../prior-art.md#design-phase-in-the-loop--optional-tool-agnostic-design-anchored-to-the-spec-feature-design-phase)
  — the base this builds on: Superdesign `DESIGN.md` (the `docs/design.md`
  precedent) and the deliver-or-produce → review-at-the-gate loop are unchanged;
  this phase only widens the trigger and the medium.

## Human prerequisites

- none. This is a skill-prose + foundation-doc + dogfood change; no secret,
  provisioning, or account is required.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Trigger broadens to "UI surface OR a visualisation would materially clarify a decision"; still optional, proportional | roadmap row; the interpretation diagram is the existence proof (non-UI, yet a design that drove alignment) | 2026-07-02 |
| Sparring may produce an **exploratory** visualisation to sharpen an idea, but commits **no** durable design artifact; the durable, reviewed artifact is produced in the `/loopkit:plan` cycle and reviewed at spec-acceptance | constitution "exactly two human gates" — sparring is a dialog, not a gate; the roadmap seed stays roadmap+prior-art only | 2026-07-02 |
| Constitution stays **medium-agnostic**: names Mermaid / committed SVG / exported image as *examples* of GitHub-native durable media (as it already names Paper/Figma/v0 for tools), not a mandate; the design mechanism hardcodes no medium | constitution "tool-agnostic design phase" (grep-verifiable); resolves the prior-art (Mermaid-default) ↔ operator (SVG) tension | 2026-07-02 |
| loopkit's **own** `docs/design.md` picks `kind: concept`, medium **committed SVG**; the interpretation SVG is committed as the first artifact | the operator chose SVG empirically for loopkit (richer layout than Mermaid for the "Skills im Detail" cards); dogfood | 2026-07-02 |
| `docs/design.md` template gains a `kind: ui \| concept \| both` switch; UI tokens only for ui/both; concept names the diagram medium + location, no UI tokens | "broaden from UI-only" requires a non-UI contract shape; the current template is UI-token-only | 2026-07-02 |
| Foundation edits (vision/constitution/architecture) ship in THIS spec PR, ratified at the gate — NOT an implement issue | constitution corollary (roadmap-iteration #10): foundation edits belong to planning | 2026-07-02 |
| Milestone-level: `Depends on milestone: #11` (prior-art-elevation) | both milestones edit the vision+constitution foundation spine; #11 is in-flight (issue #107 still edits vision/constitution) — serialize to avoid a foundation-doc merge race (roadmap's documented "shared spine" reality) | 2026-07-02 |
| CONFIRM at the gate — SVG-vs-Mermaid framing (agnostic constitution + loopkit picks SVG), the `#11` serialization, and the loopkit-`design.md` dogfood scope + SVG location | these three touch operator intent / the prior-art verdict — surfaced for confirmation, not guessed | 2026-07-02 |

## Tracking

- Milestone: design-in-the-loop. Milestone-level: `Depends on milestone: #11`
  (prior-art-elevation — shared vision+constitution spine, in-flight).
- Issues (created after this spec merges). The foundation edits are in the spec PR,
  so the issues are only the skill/template/dogfood changes; they touch **largely
  disjoint files** — the parallel frontier:
  - **I1 — Broaden the design trigger** across `skills/design/SKILL.md`,
    `skills/plan/SKILL.md` (Step 3), `skills/inception/SKILL.md` (Step 7b): the
    trigger becomes "UI surface OR a visualisation would materially clarify a
    decision"; the design skill's deliver-or-produce loop generalizes to a non-UI
    concept diagram. `Depends on:` none.
  - **I2 — Weave design into the sparring**: `skills/shared/iteration-steps.md`
    (the challenge/harvest may sketch an exploratory visualisation) +
    `skills/roadmap/SKILL.md` (Step 1 names it; no new gate; durable artifact
    deferred to `/plan`). `Depends on:` none. (Disjoint from I1.)
  - **I3 — Generalize the `docs/design.md` template**:
    `skills/inception/templates/design.md` gains the `kind` switch (ui/concept/
    both); concept names the diagram medium (Mermaid / committed SVG) + location,
    omits UI tokens. `Depends on:` none. (Disjoint.)
  - **I4 — Dogfood loopkit's design contract**: create `docs/design.md`
    (`kind: concept`, medium committed SVG) + commit the interpretation SVG into
    the repo (`docs/design/loopkit-interpretation.svg`) + reference it from the
    contract. `Depends on:` I3 (follows the generalized template), I1 (reflects the
    broadened trigger).

## Verification

Verify is `none yet`, so the QA gate splits into machine-checkable (read-through +
grep) and manual-attended (a dry end-to-end read) items.

**Machine-checkable (read-through / grep):**

- [ ] `skills/design/SKILL.md`, `skills/plan/SKILL.md`, `skills/inception/SKILL.md`
      trigger on "visualisation would clarify the decision" (not UI-surface only) —
      grep for the broadened phrasing at all three sites.
- [ ] `skills/shared/iteration-steps.md` + `skills/roadmap/SKILL.md` allow an
      exploratory design in the sparring AND state the durable artifact is produced
      in `/plan` — grep; no gate word added.
- [ ] The design **mechanism hardcodes no medium** — grep: no `mermaid`/`svg`/`png`
      literal as a mandated medium in `skills/design/SKILL.md` (examples in the
      constitution/template are fine; the skill reads `docs/design.md`).
- [ ] `docs/constitution.md` still says **exactly two human gates** AND states the
      broadened trigger + the agnostic durable-medium requirement.
- [ ] `docs/vision.md` scope names the broadened (not UI-only) design trigger.
- [ ] `docs/architecture.md` maps design-in-the-sparring + non-UI concept design.
- [ ] `skills/inception/templates/design.md` has the `kind: ui | concept | both`
      switch; UI tokens conditional; concept path names a diagram medium + location.
- [ ] `docs/design.md` exists (`kind: concept`, medium committed SVG) and
      references the committed interpretation SVG; the SVG file is tracked in the
      repo (no longer untracked).

**Manual-attended (dry end-to-end read at the QA gate):**

- [ ] A non-UI concept change (e.g. this very spec) reads cleanly end-to-end:
      an exploratory diagram may be sketched during sparring → a durable committed
      diagram is produced in `/plan` → reviewed AT spec-acceptance → consumed by
      `/implement` — with the medium named only in `docs/design.md`, no second stop.
- [ ] A change that needs no visualisation reads as skipping design entirely
      (proportionality holds).
- [ ] The committed interpretation SVG renders in the review surface (GitHub file
      view + a local file explorer), confirming committed SVG is a valid durable
      medium for loopkit.
- [ ] `#11` (prior-art-elevation) is closed before this milestone's implement runs
      (foundation-spine serialization).

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Broadened trigger erodes proportionality (design on everything) | trigger is "a visualisation would *materially* clarify a decision" — still optional; Verification asserts a no-visual change skips design |
| Weaving design into sparring adds a covert third gate | sparring is a dialog; the durable artifact is produced+reviewed in `/plan` at spec-acceptance; two-gates Verification item |
| Constitution hardcodes a medium (breaks tool-agnosticism) | constitution names Mermaid/SVG as examples only; grep item asserts the design mechanism carries no mandated medium literal |
| Foundation-doc merge race with #11 (shared vision/constitution spine) | `Depends on milestone: #11`; the spec-PR foundation edits target the **design** sections (disjoint from #11's prior-art sections), so low conflict risk even landing first |
| SVG chosen where Mermaid would render better in the PR diff | constitution keeps both valid; loopkit picks SVG for its richer layout; the prior-art caution is recorded so a future project can choose Mermaid |
| Scope creep into the Flowmate coverage findings | explicit out-of-scope; routed to a separate `/loopkit:roadmap` phase |

## Decision log

- 2026-07-02: Drafted from the "Non-UI concept design + the durable diagram
  medium" prior-art concern and the roadmap row. Reconciled the prior-art
  (Mermaid-default) ↔ operator (committed-SVG) tension by keeping the constitution
  medium-agnostic and letting loopkit's own `docs/design.md` pick SVG. Foundation
  edits placed in the spec PR per the roadmap-iteration corollary (first phase to
  apply it). Three items flagged for gate confirmation (SVG/Mermaid framing, #11
  serialization, dogfood scope + SVG location).
