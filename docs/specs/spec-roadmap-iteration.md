# Spec: roadmap-iteration

> Created: 2026-07-02

Extract ongoing feature/phase planning out of the one-time `/loopkit:inception`
dialog into a new `/loopkit:roadmap` skill — a prior-art-driven idea-sparring loop
that seeds one or many roadmap phases (with their backing prior art) without
inception's loop-readiness sweep — and give `/loopkit:plan` a matching
multi-milestone loop so several seeded phases can be planned in one run.

## Outcome

- [ ] A new skill `skills/roadmap/SKILL.md` is invocable as `/loopkit:roadmap`
      and, from a raw idea, runs: prior-art discovery (research mode offered —
      websearch / deep / none, ASKED per idea) → sparring (challenge + sharpen) →
      seeds 1..n roadmap rows + their backing prior-art entries, with **no**
      loop-readiness sweep.
- [ ] `/loopkit:roadmap` performs the prior-art challenge, architecture-seed, and
      roadmap-seeding using inception's existing logic **without duplicating its
      prose** (DRY — mechanism per the resolved OPEN decision).
- [ ] `/loopkit:roadmap` may draft foundation-doc changes (vision / constitution /
      architecture) when an idea touches them; those changes land on the default
      branch only via the phase's `/loopkit:plan` cycle and are **ratified at the
      spec-acceptance gate** — never authored in `/loopkit:implement`.
- [ ] `/loopkit:plan` plans **one or many** phases in a single loop run,
      dependency-ordered via the existing milestone-level `Depends on` — the human
      still names the set (never auto-picked).
- [ ] Foundation docs reflect the new skill: `docs/vision.md` ("four → five loop
      skills"), `docs/constitution.md` (the roadmap skill + a
      "foundation edits belong to planning, never implement" principle),
      `docs/architecture.md` (5th component, the delegation, updated flows).
- [ ] The plugin manifest (`.claude-plugin/`) registers `/loopkit:roadmap`, and
      `docs/workflow.md`'s Loops section documents the roadmap loop.

## Scope

### In scope

- New `skills/roadmap/SKILL.md` (+ any template it needs) and its DRY reuse of
  inception's prior-art / architecture-seed / roadmap-seeding steps.
- The `/loopkit:plan` change: plan multiple phases/milestones per loop run.
- Foundation-doc edits for the new skill + the foundation-edits-belong-to-planning
  principle; plugin manifest registration; `docs/workflow.md` Loops update.

### Out of scope

- **Design in the sparring loop / non-UI design medium** — that is the
  `design-in-the-loop` phase (depends on this one). `/loopkit:roadmap` ships here
  without design wiring.
- **prior-art-elevation** (prior-art's weight in vision/constitution, the OSS
  source-checkout into `/loopkit:implement`) — separate phase.
- No change to `/loopkit:implement`'s one-milestone-per-orchestrator model;
  milestone parallelism stays "a second orchestrator on an independent milestone".

## Constraints

Reference `docs/constitution.md` rather than restating it.

- **No duplication across skills** — the roadmap skill reuses inception's steps,
  it does not copy them; project specifics stay in `docs/workflow.md`.
- **Reuse native primitives / proportional ceremony** — roadmap is the lighter
  iteration entry point; no readiness sweep, no new gate.
- **Exactly two human gates** — roadmap sparring is an interactive dialog, not a
  new gate; the only planning gate remains spec-acceptance (in `/loopkit:plan`).
- **Clarification belongs to planning** — hence foundation decisions are resolved
  in roadmap/plan, never discovered in implement.
- Skills are Markdown prose (no build step); Verify is `none yet`, so this scope
  is checked at the milestone-QA gate (review + a smoke run of each changed skill).

## Prior art

- [Bootstrap vs iteration — separate one-time inception from ongoing prior-art-driven planning](../prior-art.md#bootstrap-vs-iteration--separate-one-time-inception-from-ongoing-prior-art-driven-planning-feature-roadmap-iteration) — spec-kit's `/constitution` (once) vs `/specify`+`/plan` (iterative) is the direct precedent for splitting the one-time dialog from an iteration entry point; ADOPT the split, DIFFERENTIATE by centring prior-art research.
- [Research-to-plan coupling — every plannable phase backed by prior art](../prior-art.md#research-to-plan-coupling--every-plannable-phase-backed-by-prior-art-feature-inception-prior-art-coupling) — dual-track discovery feeds the delivery backlog; per-phase prior-art must back every seeded phase (the coupling `/loopkit:roadmap` must uphold when seeding 1..n phases).
- [Prior-art as the substrate for every artifact](../prior-art.md#prior-art-as-the-substrate-for-every-artifact--research--adoptavoid--sources-feature-prior-art-elevation) — context for why the iteration loop centres research; the elevation itself is a separate phase.

## Human prerequisites

- none — all changes are in-repo Markdown/JSON; no secrets, accounts, or external
  provisioning.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| New skill `/loopkit:roadmap`, delegating to inception's Steps 2/5/6 | Bootstrap ≠ iteration (spec-kit precedent); after inception a project is feature-complete, new features need discovery not re-bootstrap; DRY over a forked copy | 2026-07-02 |
| Scope = prior-art discovery + architecture-seed + roadmap-seeding; **no** readiness sweep; seeds 1..n phases per run | The readiness sweep is token ballast per iteration; the value is prior-art inspiration + adopt/avoid, injected per idea | 2026-07-02 |
| Research mode is ASKED per idea (websearch / deep / none) | Mirrors inception Step 2's "ASK, never assume"; the thick research is what the skill triggers per feature | 2026-07-02 |
| `/loopkit:roadmap` and `/loopkit:plan` are multi-milestone loops (1..n per run); human names the set, plan orders by milestone-level `Depends on` | Plan several seeded phases before handing to implement; still human-directed (never auto-picked) | 2026-07-02 |
| Foundation-doc edits belong to planning (roadmap drafts, `/loopkit:plan` commits + ratifies at spec-acceptance), never `/loopkit:implement` | "Clarification belongs to planning"; a foundation decision reaching implement is a planning defect; keeps big changes (e.g. React→Vue) under the one planning gate, no third gate | 2026-07-02 |
| roadmap is counted as a loop skill — `docs/vision.md` becomes "five loop skills (inception, plan, implement, design, roadmap)" | It is a producer-side loop skill in the same family; the count is descriptive, not a new category | 2026-07-02 |
| OPEN — DRY mechanism: (a) roadmap's `SKILL.md` cross-references inception's Steps 2/5/6 in-prose, vs (b) extract the three shared steps into a shared reference both skills read | resolved at the spec-acceptance gate (recommendation: (a) cross-reference — simplest, matches "reuse not reinvent", avoids a new artifact) | — |

## Tracking

- Milestone: [roadmap-iteration](<milestone-url>) — created once this spec merges
- Issues: created from this spec once it is merged (one per implementable step)

## Verification

Verify is `none yet`; this list is the human milestone-QA script.

- [ ] `/loopkit:roadmap` smoke-run: given a raw idea, it offers a research mode,
      sparrings, and seeds ≥1 roadmap row plus a backing prior-art entry — with no
      readiness sweep.
- [ ] Seeding multiple ideas in one run appends multiple rows, each backed by a
      prior-art concern (the coupling holds).
- [ ] `/loopkit:plan` smoke-run: given two named phases with a dependency, it
      plans both in one run in dependency order.
- [ ] No prose is duplicated between `skills/roadmap/SKILL.md` and
      `skills/inception/SKILL.md` (the DRY decision is honored — grep check).
- [ ] `docs/vision.md`, `docs/constitution.md`, `docs/architecture.md` reflect the
      new skill + the foundation-edits-belong-to-planning principle.
- [ ] `.claude-plugin/` registers `/loopkit:roadmap`; `docs/workflow.md` documents
      the roadmap loop.
- [ ] grep guardrails still pass: no headless flag, API key, scheduler, or local
      state introduced.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Cross-referencing inception's step numbers couples roadmap to inception's structure (if (a) chosen) | Reference the steps by name + number and keep inception's step titles stable; a grep test asserts no duplication |
| "roadmap may edit foundation docs" erodes the two-gate rule | Foundation edits are only ratified at the spec-acceptance gate via `/loopkit:plan`; roadmap alone never lands them on the default branch |
| Scope creep — design/prior-art-elevation bleed into this phase | Explicit Out-of-scope; those are dependent/sibling phases with their own specs |
| Multi-milestone plan loop picks work the human didn't name | Preserve "never auto-picks": the human passes the phase set; plan only orders it |

## Decision log

- 2026-07-02: Spec drafted from the roadmap-sparring dogfood; most decisions were
  resolved live in the sparring and recorded above as Prior decisions. Single
  genuinely-open item (DRY mechanism) carried to the spec-acceptance gate.
