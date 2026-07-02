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
- [ ] loopkit **dogfoods** the broadened phase: the loopkit-interpretation diagram
      is committed **in this spec PR** (`docs/design/loopkit-interpretation.svg`)
      as this concept-design spec's own clarifying artifact, and loopkit adopts its
      own `docs/design.md` (`kind: concept`, medium: committed SVG) referencing it.

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
  `/loopkit:roadmap` — folding it here would violate proportional scope. NOTE the
  interaction: `skills/design/SKILL.md` still hard-bails when `docs/design.md` is
  missing, and broadening the trigger routes more (concept-design) projects to a
  "a diagram would clarify" moment without a contract — sharpening the value of
  that deferred retrofit/bootstrap phase, but not resolved here.
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
| loopkit's **own** `docs/design.md` picks `kind: concept`, medium **committed SVG**; the interpretation SVG is committed **in this spec PR** (`docs/design/loopkit-interpretation.svg`) as this spec's own clarifying design artifact | the operator chose SVG empirically for loopkit (richer layout than Mermaid for the "Skills im Detail" cards); committing it in the spec PR makes it reviewable at the gate and reachable by every future worktree (dogfood: the design rides in the spec package) | 2026-07-02 |
| `docs/design.md` template gains a top-level `kind: ui \| concept \| both` field; the UI-token YAML front-matter is kept but a "How to fill" note prunes it on fill — for `kind: concept`, delete the color/type/spacing/radii/shadow blocks and fill a **Diagram medium** section (medium = Mermaid \| committed SVG \| exported image; where diagrams live) instead | YAML front-matter cannot be conditional, so the switch is prune-on-fill in ONE template; pinning the representation here lets the template author and the inception-filling prose (same issue, I3) converge | 2026-07-02 |
| Foundation edits (vision/constitution/architecture) ship in THIS spec PR, ratified at the gate — NOT an implement issue | constitution corollary (roadmap-iteration #10): foundation edits belong to planning. This phase is the first to apply it | 2026-07-02 |
| Milestone-level: `Depends on milestone: none` (independent) | #11 (prior-art-elevation) **closed** while this was planned; its vision+constitution edits are already on `main` (merged in #112), so the foundation-spine merge-race is gone and the milestone is independent | 2026-07-02 |
| The durable medium "renders in the review surface" means the GitHub **file view / rich diff** and a local file explorer — for a committed SVG, NOT the raw PR text diff (which shows XML). Mermaid renders inline in markdown; SVG needs the file/rich view. The roadmap row's "renders inline in the PR" is imprecise and is corrected in the Step-8 roadmap update | honest reconciliation of the prior-art (Mermaid renders in-review; SVG diffs noisily) ↔ operator SVG choice; the constitution keeps both valid | 2026-07-02 |
| CONFIRM at the gate — the SVG-vs-Mermaid framing (agnostic constitution + loopkit picks SVG, with the render-surface caveat above) and the loopkit-`design.md` dogfood scope | these touch operator intent / the prior-art verdict — surfaced for confirmation, not guessed. (#11 serialization is moot: #11 is closed.) | 2026-07-02 |

## Tracking

- Milestone: design-in-the-loop. Milestone-level: `Depends on milestone: none`
  (#11 closed; its foundation-spine edits are already on `main`).
- Issues (created after this spec merges). The foundation edits **and** the
  clarifying SVG are in the spec PR, so the issues are only the skill/template/
  contract changes; they touch **disjoint files** — the parallel frontier is
  I1, I2, I3 (all `Depends on: none`), then I4 after I3:
  - **I1 — Broaden the per-change design trigger**: `skills/design/SKILL.md` (the
    trigger becomes "UI surface OR a visualisation would materially clarify a
    decision"; the deliver-or-produce loop generalizes to a non-UI concept
    diagram) + `skills/plan/SKILL.md` (Step 3, the per-change invocation site).
    `Depends on:` none.
  - **I2 — Weave design into the sparring**: `skills/shared/iteration-steps.md`
    (the challenge/harvest may sketch an exploratory visualisation) +
    `skills/roadmap/SKILL.md` (Step 1 names it; no new gate; the durable artifact
    is deferred to `/plan`). `Depends on:` none. (Disjoint from I1.)
  - **I3 — Generalize the design contract (template + its inception filling
    step)**: `skills/inception/templates/design.md` (the prune-on-fill `kind`
    switch pinned in Prior decisions) + `skills/inception/SKILL.md` (Step 7b: the
    project-level design-surface decision broadens to "UI or recurring
    decision-clarifying visualisations", and the filling prose sets `kind` /
    prunes UI tokens for `concept`). Template + the prose that fills it live in
    ONE issue so they converge. `Depends on:` none. (Disjoint.)
  - **I4 — Dogfood loopkit's design contract**: create `docs/design.md`
    (`kind: concept`, medium committed SVG) referencing the already-committed
    `docs/design/loopkit-interpretation.svg`. `Depends on:` I3 (follows the
    generalized template). The SVG itself is committed in the spec PR, so I4 only
    authors the contract that points at it.

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
- [ ] `skills/inception/templates/design.md` has the top-level `kind: ui | concept
      | both` field + the prune-on-fill "How to fill" note; concept path names a
      diagram medium + location. `skills/inception/SKILL.md` Step 7b sets `kind`
      and broadens the project-level design-surface decision.
- [ ] `docs/design/loopkit-interpretation.svg` is tracked in the repo (committed in
      the spec PR; no longer untracked) — verifiable now.
- [ ] `docs/design.md` exists (`kind: concept`, medium committed SVG) and
      references `docs/design/loopkit-interpretation.svg` (I4).

**Manual-attended (dry end-to-end read at the QA gate):**

- [ ] A non-UI concept change (e.g. this very spec) reads cleanly end-to-end:
      an exploratory diagram may be sketched during sparring → a durable committed
      diagram is produced in `/plan` → reviewed AT spec-acceptance → consumed by
      `/implement` — with the medium named only in `docs/design.md`, no second stop.
- [ ] A change that needs no visualisation reads as skipping design entirely
      (proportionality holds).
- [ ] The committed interpretation SVG renders in the GitHub **file view / rich
      diff** + a local file explorer (NOT the raw PR text diff, which shows XML) —
      confirming committed SVG is a valid durable medium for loopkit.
- [ ] The Step-8 roadmap update corrects the `design-in-the-loop` row's imprecise
      "renders inline in the PR" to the accurate render-surface (file/rich view).

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Broadened trigger erodes proportionality (design on everything) | trigger is "a visualisation would *materially* clarify a decision" — still optional; Verification asserts a no-visual change skips design |
| Weaving design into sparring adds a covert third gate | sparring is a dialog; the durable artifact is produced+reviewed in `/plan` at spec-acceptance; two-gates Verification item |
| Constitution hardcodes a medium (breaks tool-agnosticism) | constitution names Mermaid/SVG as examples only; grep item asserts the design mechanism carries no mandated medium literal |
| Foundation-doc merge race with #11 (shared vision/constitution spine) | Moot — #11 closed; its edits merged (#112) before this spec's foundation edits were authored, and those target the disjoint **design** sections. `Depends on milestone: none` |
| SVG chosen where Mermaid would render better in the PR diff | constitution keeps both valid; loopkit picks SVG for its richer layout; the prior-art caution is recorded so a future project can choose Mermaid |
| Scope creep into the Flowmate coverage findings | explicit out-of-scope; routed to a separate `/loopkit:roadmap` phase |

## Decision log

- 2026-07-02: Drafted from the "Non-UI concept design + the durable diagram
  medium" prior-art concern and the roadmap row. Reconciled the prior-art
  (Mermaid-default) ↔ operator (committed-SVG) tension by keeping the constitution
  medium-agnostic and letting loopkit's own `docs/design.md` pick SVG. Foundation
  edits placed in the spec PR per the roadmap-iteration corollary (first phase to
  apply it).
- 2026-07-02: Spec review (PR #115) REQUEST_CHANGES resolved before the gate:
  (B1) the foundation edits (vision/constitution/architecture) were actually
  authored onto the spec branch — not just described — so the gate ratifies the
  diff, not a promise; (B2/NB5) the interpretation SVG is committed into the spec
  PR at `docs/design/loopkit-interpretation.svg` (reachable by future worktrees,
  reviewed at the gate, dogfooding "the design rides in the spec package"), so I4
  only authors the contract; (NB1) #11 closed mid-planning — its edits are on
  `main` (#112), so the milestone edge is `none` and the merge-race is moot;
  (NB3/NB6) inception Step 7b moved into I3 with the template so the `kind` switch
  representation converges, and the switch is pinned prune-on-fill in Prior
  decisions; (NB2) the "renders in the review surface" wording is made precise
  (SVG = file/rich view, not the raw diff) and the roadmap row's imprecise claim
  is slated for correction at Step 8; (NB7) a cross-ref to the deferred
  coverage/retrofit phase added. Remaining gate items: the SVG-vs-Mermaid framing
  and the dogfood scope.
- 2026-07-02: Spec-acceptance gate — re-review APPROVE, no remaining blockers.
  Operator decisions: (1) loopkit's own `docs/design.md` medium = **committed
  SVG** (confirmed with the corrected render facts on the table — SVG renders in
  the file/rich view, not the raw PR diff; chosen for its richer layout, the
  constitution staying medium-agnostic); (2) dogfood scope confirmed (loopkit
  adopts its own design contract, I4). Human prerequisites: none. Spec accepted.
