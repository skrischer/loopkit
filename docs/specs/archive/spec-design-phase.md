# Spec: design-phase — optional, tool-agnostic design step anchored to the spec

> Created: 2026-06-19

For UI work, delivering or generating a design alongside the spec and reviewing
it before code lifts quality. loopkit has no place for this today: design either
happens ad-hoc during implementation or not at all. This spec adds an **optional,
tool-agnostic design step that runs DURING planning**: for a UI-surface change
the design is delivered by the human or produced from the spec as part of the
planning cycle, becomes part of the spec package, and is reviewed **at the single
spec-acceptance gate** — so no third human gate is added. Its medium and project
rules live in a `docs/design.md` contract (the `docs/workflow.md` sibling); the
design's durable form is a file committed to the repo. It is optional: only
UI-surface changes use it.

## Outcome

- [ ] An **optional** design step runs **during the planning cycle** for
      UI-surface changes: the design is delivered by the human OR produced from
      the spec, becomes part of the spec package, and is reviewed AT the existing
      spec-acceptance gate — never a separate stop after it. Non-UI changes skip
      it entirely.
- [ ] The design step is **tool-agnostic**: the medium (Paper MCP / Figma /
      Superdesign / v0 / Claude artifacts) and the project's design rules live in
      a project `docs/design.md` contract; the mechanism carries no tool specifics
      (grep-verifiable, the `docs/workflow.md` pattern).
- [ ] The design's **durable form is a file committed to the repo** — a tokens
      file, an exported image, or a screenshot — referenced from the spec or
      issue. An external-tool URL (a Figma/v0 share link) is NOT a valid durable
      form: the tool is the editor, never the source of truth.
- [ ] `docs/design.md` has a **template** in `skills/inception/templates/` and
      `/loopkit:inception` **optionally** produces it (a UI-surface project gets
      it; a non-UI project records `none`) — mirroring how inception produces
      `docs/workflow.md`.
- [ ] The **foundation reflects the phase**: `docs/vision.md` scope includes the
      optional planning-time design phase; `docs/constitution.md` states the
      design is reviewed AT the spec-acceptance gate (two gates intact) plus the
      design.md / file-in-repo durable-state rules; `docs/architecture.md` maps
      the new component and the design flow.
- [ ] `/loopkit:plan` and `/loopkit:implement` are **design-aware**: plan marks a
      spec/issue as having UI surface and points at `docs/design.md`; implement
      consumes the referenced committed design artifact for those issues.

## Scope

### In scope

- The design-step **mechanism** (grundform resolved at the gate — see Prior
  decisions): a mode of `/loopkit:plan` OR a new optional `/loopkit:design` skill
  the planner invokes within the planning cycle.
- `docs/design.md` **contract** + its template + optional production by inception.
- **Foundation amendments**: vision scope, constitution (gate-fold + design-phase
  principle + design.md / file-in-repo durable-state rules), architecture
  (component + flow).
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

- Constitution **"Exactly two human gates"** — design is a planning-time activity
  reviewed AT the spec-acceptance gate (part of the spec package), so it adds no
  stop. The produce-from-spec path runs BEFORE that gate, inside the planning
  cycle — it must never become a post-acceptance, pre-implement stop. Reference,
  do not restate.
- Constitution **"GitHub-only durable state"** — the durable design form is a
  file committed to the repo (tokens / exported image / screenshot); an
  external-tool URL is not durable state. The tool is an editor, not a second
  source of truth. (grep-verifiable.)
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
  Tokens (the durable, repo-storable, vendor-neutral interchange = state) are the
  two **reuse** entries; spec-kit/Kiro (design-before-code reviewed — fold into
  the existing gate), Figma Dev Mode MCP + Code Connect (bidirectional handoff,
  tokens over screenshots), and Superdesign/v0 (generate->review->iterate inner
  loop) are **reference-only**. ADOPT/AVOID notes there map directly to the
  outcomes and constraints above.

## Human prerequisites

- none for planning. At USE time a project enabling the design phase provides its
  design tool/MCP and authors `docs/design.md` — but that is per-project config
  the contract captures, not a prerequisite for building this feature.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| `docs/design.md` is the agnostic contract (the `docs/workflow.md` sibling): names the tool, where designs live, the review path, the handoff format, the token location | Superdesign DESIGN.md precedent + the workflow.md pattern (skills read the contract, stay tool-free) | 2026-06-19 |
| Design runs DURING the planning cycle and is reviewed AT the spec-acceptance gate as part of the spec package — never a post-acceptance, pre-implement step | constitution "exactly two human gates"; a between-plan-and-implement placement would add a stop (review finding B2) | 2026-06-19 |
| Durable design state = a file committed to the repo (tokens / exported image / screenshot) referenced from the spec or issue; an external-tool URL is NOT a valid durable form | constitution "GitHub-only durable state" (grep-verifiable; review finding B3) | 2026-06-19 |
| Design step is optional, triggered only by UI surface; non-UI changes skip it | constitution "proportional ceremony" | 2026-06-19 |
| Production/review reuse Paper MCP + the design skills; no reimplementation | constitution "reuse native primitives" | 2026-06-19 |
| Bidirectional: accept a delivered design OR generate from the spec — always ending in review at the acceptance gate | prior-art Figma MCP (bidirectional) + Superdesign/v0 (iterate loop) | 2026-06-19 |
| inception OPTIONALLY produces `docs/design.md` (UI-surface projects) exactly as it produces `docs/workflow.md`; `none` otherwise | proportionality + the workflow.md production pattern | 2026-06-19 |
| **grundform** = a new optional `/loopkit:design` skill the planner invokes within the planning cycle, its output referenced by the spec before the spec-acceptance gate. Vision goes 3->4 skills; architecture gains a component; issue C is a new `skills/design/SKILL.md`. | chosen at the spec-acceptance gate; DESIGN.md-style first-class separation of design config, modular over growing `/plan` | 2026-06-19 |
| **Foundation amendments** (vision scope; constitution gate-fold + design.md/durable-state rules; architecture component) ship in THIS milestone (issue A) | confirmed at the spec-acceptance gate | 2026-06-19 |

## Tracking

- Milestone: design-phase. Milestone-level: `Depends on milestone: #8` —
  inception-prior-art-coupling also edits `skills/inception/SKILL.md`, and the
  design.md production step (issue B) touches the same file, so they serialize.
  The QA gate checks #8 is closed before issue B starts.
- Issues: decomposition for the chosen grundform (new `/loopkit:design` skill);
  issues touch largely disjoint files, so they parallelize after the foundation issue:
  - **A — Foundation amendments** (all three foundation docs, one logical change):
    `docs/vision.md` (scope: the optional planning-time design phase),
    `docs/constitution.md` (design reviewed AT the spec-acceptance gate; the
    optional/agnostic design-phase principle; the design.md + file-in-repo
    durable-state rules; the two-gate invariant kept intact and grep-checkable),
    and `docs/architecture.md` (the design component + the design flow). The
    vision skill-count and the architecture component row follow the grundform
    chosen at the gate. `Depends on:` none.
  - **B — `docs/design.md` contract + template + optional inception production**:
    `skills/inception/templates/design.md` (new, DESIGN.md-structured: YAML
    tokens + prose + Components + Do's/Don'ts) + a new optional production step in
    `skills/inception/SKILL.md`. `Depends on:` A (+ cross-milestone #8).
  - **C — the `/loopkit:design` skill**: a new `skills/design/SKILL.md` the
    planner invokes within the planning cycle, orchestrating deliver-or-produce
    -> iterate -> file-in-repo handoff, its output referenced by the spec before
    the acceptance gate; reads `docs/design.md`, hardcodes no tool. `Depends on:` A.
  - **D — design-awareness wiring**: `/loopkit:plan` invokes `/loopkit:design`
    for UI-surface scope and references its output in the spec; `/loopkit:implement`
    consumes the committed design artifact. `Depends on:` A, C.

Verify is `none yet`, so the QA gate splits into machine-checkable (read-through
+ grep) and manual-attended (a dry end-to-end read) items.

**Machine-checkable (read-through / grep):**

- [ ] `docs/vision.md` scope names the optional design phase.
- [ ] `docs/constitution.md` still says exactly two human gates AND states the
      design is reviewed at spec-acceptance + the design.md / file-in-repo
      durable-state rules.
- [ ] `docs/architecture.md` maps the design component and the design flow.
- [ ] `skills/inception/templates/design.md` exists AND follows the Superdesign
      DESIGN.md structure: YAML token front-matter + prose overview + Components
      + Do's/Don'ts.
- [ ] The design mechanism (skill or plan-mode) references `docs/design.md` and
      hardcodes NO tool (grep: no `paper`/`figma`/`v0` literal in the mechanism).
- [ ] `/loopkit:plan` + `/loopkit:implement` reference `docs/design.md` for
      UI-surface work.
- [ ] grep: no design durable-form is an external URL — committed files only.

**Manual-attended (dry end-to-end read at the QA gate):**

- [ ] A UI change reads cleanly end-to-end: spec + design produced/delivered ->
      reviewed AT the spec-acceptance gate -> implement consumes the committed
      artifact — with the tool named only in `docs/design.md`, no second stop.
- [ ] A non-UI change reads as skipping design entirely (proportionality holds).
- [ ] Milestone #8 is closed before issue B starts (cross-milestone serialization
      on `skills/inception/SKILL.md`).

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Scope creep into building a design tool / token pipeline | explicit out-of-scope; `docs/design.md` selects the tool, loopkit only orchestrates |
| Third-gate creep (a separate design-acceptance stop after planning) | design is planning-time, reviewed AT spec-acceptance; a Verification item asserts the constitution still says two gates |
| Durable form leaks to an external URL (breaks GitHub-only state) | durable form is a committed file only; grep Verification item + the pinned durable-state decision |
| `docs/design.md` drifting from `docs/workflow.md`'s contract role | mirror the workflow.md contract structure; same production path in inception |
| Cross-milestone dep on #8 delayed/re-scoped | A and C touch disjoint files and proceed regardless; only B (inception SKILL.md) waits; the QA gate checks #8 closed before B |
| Over-large milestone | post-foundation issues touch disjoint files (parallel frontier); if the gate picks plan-mode, C+D collapse into `/plan` and vision keeps three skills |

## Decision log

- 2026-06-19: Drafted from the inception pitch + the "Design phase in the loop"
  prior-art concern. Precedent/constraint decisions recorded above; grundform left
  OPEN with a new-skill recommendation, and the foundation amendments flagged —
  both resolved at the spec-acceptance gate, which also fixes the issue decomposition.
- 2026-06-19: Spec review (PR #74) REQUEST_CHANGES resolved before re-review:
  design re-framed as a planning-time activity reviewed AT the spec-acceptance
  gate (B2 — the between-plan-and-implement placement would have added a third
  stop); durable form narrowed to a committed file, external URLs excluded (B3);
  grundform explicitly resolved at this gate and baked in before merge, not left
  open in the merged spec (B1); architecture amendment moved into issue A;
  design.md-structure and #8-closed checks added.
- 2026-06-19: Spec-acceptance gate — grundform chosen: a new optional
  `/loopkit:design` skill (vision 3->4 skills; architecture gains a component).
  Foundation amendments confirmed to ship in this milestone (issue A). Human
  prerequisites: none. Re-review APPROVE, no remaining blockers.
- 2026-06-19: Implemented via `/loopkit:implement` — #75 (foundation, PR #86),
  then the parallel frontier #76 (design.md contract + template + inception Step
  7b, PR #89) and #77 (the `/loopkit:design` skill, PR #88), then #78 (plan +
  implement design-awareness wiring, PR #90). Review fixes folded: stale "three
  skills" count corrected in constitution + architecture (#75); inception intro /
  description / gate-list surface the optional design.md (#76); manifest
  descriptions register `/design` + architecture "where new code goes" gains the
  design rows (#77); UI-surface signal + handoff-format wording clarified (#78).
  One review false-positive dismissed: a per-PR reviewer flagged "B and D missing"
  unaware the milestone is decomposed across PRs.
- 2026-06-19: Milestone-QA — human gate WAIVED by the operator for this run.
  Machine-checkable Verification self-run green (four skills incl. design; two
  human gates intact; design.md template has the DESIGN.md structure; the design
  skill + plan + implement reference docs/design.md with zero hardcoded tool
  literals; durable form = committed file, no external URL; no headless/API key).
  Spec archived, milestone #9 closed.
