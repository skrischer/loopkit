# Spec: design-phase — optional, tool-agnostic design step anchored to the spec

> Created: 2026-06-19

For UI work, delivering or generating a design alongside the spec and reviewing
it before code lifts quality. loopkit has no place for this today: design either
happens ad-hoc during implementation or not at all. This spec adds an **optional,
tool-agnostic design step** — produced-from-spec or delivered, then reviewed at
the **existing** spec-acceptance gate (no third human gate) — whose medium and
project rules live in a `docs/design.md` contract (the `docs/workflow.md`
sibling), with the design's durable form kept in GitHub. It is optional: only
UI-surface changes use it.

## Outcome

- [ ] An **optional** design step exists for UI-surface changes: a design is
      produced-from-spec OR delivered by the human, then reviewed BEFORE
      implementation — reviewed at the **existing spec-acceptance gate**, never a
      third human gate. Non-UI changes skip it entirely.
- [ ] The design step is **tool-agnostic**: the medium (Paper MCP / Figma /
      Superdesign / v0 / Claude artifacts) and the project's design rules live in
      a project `docs/design.md` contract; the skill/loop carries no tool
      specifics (grep-verifiable, the `docs/workflow.md` pattern).
- [ ] The design's **durable form lives in GitHub** — a tokens file / export /
      screenshot / link referenced from the spec or issue. The external tool is
      the editor, never a second source of truth.
- [ ] `docs/design.md` has a **template** in `skills/inception/templates/` and
      `/loopkit:inception` **optionally** produces it (a UI-surface project gets
      it; a non-UI project records `none`) — mirroring how inception produces
      `docs/workflow.md`.
- [ ] The **foundation reflects the phase**: `docs/vision.md` scope includes the
      optional design phase; `docs/constitution.md` states the design review
      folds into the spec-acceptance gate (two gates intact) plus the
      design.md/tokens-as-state rules; `docs/architecture.md` maps the new
      component and the design flow.
- [ ] `/loopkit:plan` and `/loopkit:implement` are **design-aware**: plan marks a
      spec/issue as having UI surface and points at `docs/design.md`; implement
      consumes the referenced design artifact for those issues.

## Scope

### In scope

- The design-step **mechanism** (grundform resolved at the gate — see Prior
  decisions): a new optional `/loopkit:design` skill OR a mode of `/loopkit:plan`.
- `docs/design.md` **contract** + its template + optional production by inception.
- **Foundation amendments**: vision scope, constitution (gate-fold + design-phase
  principle + design.md/tokens rules), architecture (component + flow).
- **Design-awareness wiring** in `/loopkit:plan` and `/loopkit:implement`.

### Out of scope

- Shipping or mandating a specific design tool / MCP — the project picks it in
  `docs/design.md`; loopkit only orchestrates when/how design enters the loop.
- A design-token build pipeline (Style Dictionary, Tokens Studio sync, etc.) —
  the project's concern, named in `docs/design.md`, not loopkit's.
- Making design mandatory, or adding a third human gate.
- Spec-as-source / bidirectional code<->spec or code<->design generation
  (constitution don't; Tessl's territory).

## Constraints

- Constitution **"Exactly two human gates"** — the design review folds INTO the
  spec-acceptance gate; this spec must not introduce a third. Reference, do not
  restate.
- Constitution **"GitHub-only durable state"** — the design's durable form is in
  GitHub (spec/issue); the tool is an editor, not a second source of truth.
- Constitution **"Proportional ceremony"** — design is optional, triggered only
  by UI surface; a non-UI change carries no design artifact.
- Constitution **"Reuse native primitives"** — production/review wrap Paper MCP
  and the design skills (critique / paper-reviewer / wcag-auditor /
  design-system-checker); no reimplementation.
- Constitution **"Subscription auth only, no headless"** — design tooling runs
  in-session.
- Constitution **"Skills read `docs/workflow.md`, never hardcode specifics"** —
  `docs/design.md` is the sibling contract; the design mechanism stays tool-free.

## Prior art

- [Design phase in the loop — optional, tool-agnostic design anchored to the spec](../prior-art.md#design-phase-in-the-loop--optional-tool-agnostic-design-anchored-to-the-spec-feature-design-phase)
  — Superdesign `DESIGN.md` (the `docs/design.md` precedent: YAML tokens + prose
  + Components + Do's/Don'ts, repo-versioned, agent-readable) and W3C Design
  Tokens (the durable, GitHub-storable, vendor-neutral interchange = state) are
  the two **reuse** entries; spec-kit/Kiro (design-before-code reviewed — fold
  into the existing gate), Figma Dev Mode MCP + Code Connect (bidirectional
  handoff, tokens over screenshots), and Superdesign/v0 (generate->review->iterate
  inner loop) are **reference-only**. ADOPT/AVOID notes there map directly to the
  outcomes and constraints above.

## Human prerequisites

- none for planning. At USE time a project enabling the design phase provides its
  design tool/MCP and authors `docs/design.md` — but that is per-project config
  the contract captures, not a prerequisite for building this feature.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| `docs/design.md` is the agnostic contract (the `docs/workflow.md` sibling): names the tool, where designs live, the review path, the handoff format, the token location | Superdesign DESIGN.md precedent + the workflow.md pattern (skills read the contract, stay tool-free) | 2026-06-19 |
| Design review folds into the existing spec-acceptance gate — no third human gate | constitution "exactly two human gates" | 2026-06-19 |
| Durable design state = tokens / export / screenshot / link in GitHub (spec or issue); the external tool is the editor | constitution "GitHub-only durable state" | 2026-06-19 |
| Design step is optional, triggered only by UI surface; non-UI changes skip it | constitution "proportional ceremony" | 2026-06-19 |
| Production/review reuse Paper MCP + the design skills; no reimplementation | constitution "reuse native primitives" | 2026-06-19 |
| Bidirectional: accept a delivered design OR generate from the spec — always ending in review | prior-art Figma MCP (bidirectional) + Superdesign/v0 (iterate loop) | 2026-06-19 |
| inception OPTIONALLY produces `docs/design.md` (UI-surface projects) exactly as it produces `docs/workflow.md`; `none` otherwise | proportionality + the workflow.md production pattern | 2026-06-19 |
| OPEN — **grundform**: a new optional `/loopkit:design` skill vs a mode of `/loopkit:plan`. Recommendation: a new skill (the DESIGN.md precedent treats design config as first-class; it separates design from spec-authoring; vision then goes 3->4 skills). The alternative keeps three skills but grows `/plan`. | resolved at the spec-acceptance gate — it sets whether vision adds a skill and whether issue C (below) exists | — |
| OPEN — confirm the **foundation amendments** (vision scope +design phase; constitution gate-fold + design.md/tokens rules; architecture component) ship in THIS milestone | resolved at the spec-acceptance gate | — |

## Tracking

- Milestone: design-phase. Milestone-level: `Depends on milestone: #8` —
  inception-prior-art-coupling also edits `skills/inception/SKILL.md`, and the
  design.md production step touches the same file, so they serialize.
- Issues: the final decomposition is set at the gate once grundform is chosen.
  Provisional set for grundform = **new skill** (issues touch largely disjoint
  files, so they parallelize after the foundation issue):
  - **A — Foundation amendments**: `docs/vision.md` (scope) +
    `docs/constitution.md` (design review folds into the acceptance gate; the
    optional/agnostic design-phase principle; design.md + tokens-as-state rules;
    two-gate invariant kept intact). `Depends on:` none.
  - **B — `docs/design.md` contract + template + optional inception production**:
    `skills/inception/templates/design.md` (new, DESIGN.md-structured) + a new
    optional step in `skills/inception/SKILL.md`. `Depends on:` A (+ cross-milestone #8).
  - **C — the `/loopkit:design` skill**: new `skills/design/SKILL.md` orchestrating
    produce-or-deliver -> review (folded into acceptance) -> GitHub handoff,
    reading `docs/design.md`. `Depends on:` A.
  - **D — architecture + design-awareness wiring**: `docs/architecture.md`
    (component + flow) + `/loopkit:plan` and `/loopkit:implement` UI-surface
    awareness. `Depends on:` A, C.

Verify is `none yet`, so the QA gate splits into machine-checkable (read-through
+ grep) and manual-attended (a dry end-to-end read) items.

**Machine-checkable (read-through / grep):**

- [ ] `docs/vision.md` scope names the optional design phase.
- [ ] `docs/constitution.md` still says exactly two human gates AND states the
      design review folds into spec-acceptance + the design.md/tokens-as-state rules.
- [ ] `docs/architecture.md` maps the design component and the design flow.
- [ ] `skills/inception/templates/design.md` exists with the DESIGN.md-style
      structure (tokens front-matter + prose + Components + Do's/Don'ts).
- [ ] The design mechanism (skill or plan-mode) references `docs/design.md` and
      hardcodes NO tool (grep: no `paper`/`figma`/`v0` literal in the skill).
- [ ] `/loopkit:plan` + `/loopkit:implement` reference `docs/design.md` for
      UI-surface work.

**Manual-attended (dry end-to-end read at the QA gate):**

- [ ] A UI change reads cleanly end-to-end: spec -> design produced/delivered ->
      reviewed AT the spec-acceptance gate -> implement consumes the GitHub-stored
      artifact — with the tool named only in `docs/design.md`.
- [ ] A non-UI change reads as skipping design entirely (proportionality holds).

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Scope creep into building a design tool / token pipeline | explicit out-of-scope; `docs/design.md` selects the tool, loopkit only orchestrates |
| Third-gate temptation (a separate design-acceptance stop) | fold into spec-acceptance; a Verification item asserts the constitution still says two gates |
| `docs/design.md` drifting from `docs/workflow.md`'s contract role | mirror the workflow.md contract structure; same production path in inception |
| Over-large milestone | post-foundation issues touch disjoint files (parallel frontier); if the gate picks plan-mode, issue C collapses into `/plan` and vision keeps three skills |

## Decision log

- 2026-06-19: Drafted from the inception pitch + the "Design phase in the loop"
  prior-art concern. Precedent/constraint decisions recorded above; grundform left
  OPEN with a new-skill recommendation, and the foundation amendments flagged —
  both resolved at the spec-acceptance gate, which also fixes the issue decomposition.
