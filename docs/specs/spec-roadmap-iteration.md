# Spec: roadmap-iteration

> Created: 2026-07-02

Extract ongoing feature/phase planning out of the one-time `/loopkit:inception`
dialog into a new `/loopkit:roadmap` skill — a prior-art-driven idea-sparring loop
that seeds one or many roadmap phases (with their backing prior art) without
inception's loop-readiness sweep — and give `/loopkit:plan` a matching
multi-milestone loop so several seeded phases can be planned in one run. The
prior-art / architecture-seed / roadmap-seeding logic shared with inception is
extracted into a shared reference both skills read, so nothing is duplicated and
neither skill reaches into the other's internals.

## Outcome

- [ ] A new skill `skills/roadmap/SKILL.md` is invocable as `/loopkit:roadmap`
      and, from a raw idea, runs: prior-art discovery (research mode offered —
      websearch / deep / none, ASKED per idea) → sparring (challenge + sharpen) →
      seeds 1..n roadmap rows + their backing prior-art entries, with **no**
      loop-readiness sweep.
- [ ] The three steps shared with inception (prior-art challenge, architecture
      seed, roadmap seeding) live in a **shared reference** that BOTH
      `skills/inception/SKILL.md` and `skills/roadmap/SKILL.md` read; neither skill
      cross-references the other's internals (upholds `docs/architecture.md`'s
      "the skills do not know each other's internals" boundary). `inception` is
      refactored to consume the shared reference — no prose is duplicated.
- [ ] When an idea implies a foundation-doc change (vision / constitution /
      architecture), `/loopkit:roadmap` records the impact **on the seeded phase**
      (a note on its roadmap row / prior-art entry — committed as part of the
      seed). The actual foundation-doc edit is authored inside that phase's
      `/loopkit:plan` spec PR and **ratified at its spec-acceptance gate** — never
      left as a dangling draft in the main checkout, never landed on the default
      branch by roadmap alone, never authored in `/loopkit:implement`.
- [ ] `/loopkit:plan` plans **one or many** phases in a single loop run: the human
      names the set (never auto-picked), plan processes the given sequence and
      writes each new milestone's `Depends on milestone:` edge as it goes.
- [ ] Foundation docs + the plugin manifest reflect the new skill: a grep sweep
      updates every "four (loop) skills" mention (`docs/vision.md`,
      `docs/constitution.md`, `docs/architecture.md`, `README.md`) to five and adds
      the component/flow; `docs/constitution.md` gets the "foundation edits belong
      to planning, never implement" rule as a **one-line corollary** under the
      existing "Clarification belongs to planning" principle (not a new top-level
      principle — the file is permanently loaded, ~1 page budget).
- [ ] The change propagates to future projects, not just this repo:
      `.claude-plugin/` registers `/loopkit:roadmap`; **both** loopkit's own
      `docs/workflow.md` **and** the inception template
      `skills/inception/templates/workflow.md` document the roadmap loop (and the
      plan loop's multi-phase capability) in their Loops sections.

## Scope

### In scope

- New `skills/roadmap/SKILL.md` (+ any template it needs).
- The **shared reference** for the three shared steps + refactoring
  `skills/inception/SKILL.md` to consume it (DRY without cross-skill coupling).
- The `/loopkit:plan` change: plan multiple phases/milestones per loop run.
- Foundation-doc edits (grep sweep for "four skills" → five; the planning-edits
  corollary in `docs/constitution.md`; the new component/flow in
  `docs/architecture.md`).
- Plugin manifest registration; Loops-section updates in **both**
  `docs/workflow.md` **and** `skills/inception/templates/workflow.md`.

### Out of scope

- **Design in the sparring loop / non-UI design medium** — that is the
  `design-in-the-loop` phase (depends on this one). `/loopkit:roadmap` ships here
  without design wiring.
- **prior-art-elevation** (prior-art's weight in vision/constitution, the OSS
  source-checkout into `/loopkit:implement`) — separate phase.
- No change to `/loopkit:implement`'s one-milestone-per-orchestrator model;
  milestone parallelism stays "a second orchestrator on an independent milestone".

## Constraints

Reference `docs/constitution.md` / `docs/architecture.md` rather than restating.

- **Skills do not know each other's internals** (`docs/architecture.md`, Boundaries)
  — the shared steps are extracted into a shared reference both read; no skill
  cross-references another's step numbers.
- **No duplication across skills** — project specifics stay in `docs/workflow.md`;
  shared toolkit logic lives in the shared reference, authored once.
- **GitHub-only durable state + never modify the main checkout** — roadmap emits
  only committed artifacts (roadmap rows, prior-art, and via worktrees any PR); it
  leaves no uncommitted foundation-doc draft behind.
- **Exactly two human gates / clarification belongs to planning** — roadmap
  sparring is an interactive dialog, not a new gate; foundation decisions resolve
  in roadmap/plan, never in implement.
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
| New skill `/loopkit:roadmap`; the prior-art / arch-seed / roadmap-seeding logic it shares with inception is extracted into a shared reference both skills read | Bootstrap ≠ iteration (spec-kit precedent); DRY without violating `docs/architecture.md`'s "skills don't know each other's internals" — a shared artifact is the sanctioned handoff (mirrors plan/implement both reading `docs/workflow.md`) | 2026-07-02 |
| `skills/inception/SKILL.md` is refactored to consume the shared reference (in scope) | Otherwise the "extraction" recreates the duplication it removes | 2026-07-02 |
| Scope = prior-art discovery + architecture-seed + roadmap-seeding; **no** readiness sweep; seeds 1..n phases per run; research mode ASKED per idea | The readiness sweep is token ballast per iteration; value is prior-art inspiration + adopt/avoid, injected per idea; mirrors inception Step 2's "ASK, never assume" | 2026-07-02 |
| Foundation-doc changes: roadmap records the impact onto the seeded phase; the edit is authored in that phase's `/loopkit:plan` spec PR and ratified at spec-acceptance; roadmap never leaves a dangling draft nor lands one on the default branch alone; never in implement | Only GitHub-durable, never-modify-main-checkout mechanism; keeps big changes (React→Vue) under the one planning gate; "clarification belongs to planning" | 2026-07-02 |
| `/loopkit:plan` multi-phase loop processes the **human-named** sequence, writing each new milestone's `Depends on milestone:` as it goes (nothing pre-existing to order by on a first-time batch) | Preserves "never auto-picks"; the milestone-level edge is authored during the batch, not read from thin air | 2026-07-02 |
| `/loopkit:roadmap` (generative idea-sparring, seeds NEW phases) and `/loopkit:inception --here` (readiness audit/repair against the contract) are complementary, not overlapping; inception's existing prior-art↔roadmap gap-closure stays a repair path | Two distinct jobs; avoids collapsing the new front door into the audit sweep | 2026-07-02 |
| roadmap counted as a loop skill — "five loop skills (inception, plan, implement, design, roadmap)" across all mentions | Producer-side loop skill in the same family; count is descriptive | 2026-07-02 |
| The shared reference lives in `skills/shared/` (a new plugin-shipped steps artifact, e.g. `skills/shared/iteration-steps.md`); both inception and roadmap read it — neither owns the other's internals. NOT `docs/workflow.md` (per-project parameter contract; category mismatch with invariant plugin methodology). Final filename is the implementer's | resolved at the spec-acceptance gate — a neutral shared home ships with the plugin and keeps the architecture boundary | 2026-07-02 |

## Tracking

- Milestone: [roadmap-iteration](<milestone-url>) — created once this spec merges
- Issues: created from this spec once it is merged (one per implementable step)

## Verification

Verify is `none yet`; this list is the human milestone-QA script.

- [ ] `/loopkit:roadmap` smoke-run: a raw idea → research mode offered → sparring →
      ≥1 roadmap row + backing prior-art entry seeded, with no readiness sweep.
- [ ] Multiple ideas in one run append multiple rows, each backed by a prior-art
      concern (the coupling holds).
- [ ] `/loopkit:plan` smoke-run: two named phases with a dependency planned in one
      run, in the named order, each milestone's `Depends on milestone:` written.
- [ ] Foundation-impact path: a roadmap idea that touches a foundation doc records
      the impact on the seeded phase and does NOT edit the foundation doc in the
      main checkout; a follow-up `/loopkit:plan` authors the edit in its spec PR.
- [ ] DRY holds: `skills/roadmap/SKILL.md` and `skills/inception/SKILL.md` share
      the three steps via the shared reference; grep finds no duplicated step prose
      and no cross-skill internal reference.
- [ ] Propagation: `.claude-plugin/` registers `/loopkit:roadmap`; both
      `docs/workflow.md` and `skills/inception/templates/workflow.md` document the
      roadmap loop + the plan multi-phase capability.
- [ ] Sweep: no "four (loop) skills" mention remains stale in `docs/vision.md`,
      `docs/constitution.md`, `docs/architecture.md`, `README.md`.
- [ ] grep guardrails still pass: no headless flag, API key, scheduler, or local
      state introduced.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Extraction is under-done — inception keeps a copy, so duplication persists | DRY Verification item greps both `SKILL.md`s for shared step prose; inception refactor is an explicit Outcome + in scope |
| "roadmap may edit foundation docs" erodes the two-gate rule or leaves a dangling draft | Resolved: roadmap only records the impact onto the phase; the edit + ratification happen in `/loopkit:plan`'s spec PR at the spec-acceptance gate |
| Feature ships to this repo but not to future projects | The inception **template** `skills/inception/templates/workflow.md` is in scope, not just loopkit's own `docs/workflow.md` |
| Multi-idea run × per-idea `deep-research` multiplies cost (fan-out ~100×); plan's 10-iteration ceiling may not fit a multi-phase batch | research mode ASKED per idea (default to the cheapest that settles it); document that a multi-phase plan run may exceed the 10-iteration ceiling and should be split — noted in the skill |
| Scope creep — design / prior-art-elevation bleed in | Explicit Out-of-scope; those are dependent/sibling phases with their own specs |

## Decision log

- 2026-07-02: Spec drafted from the roadmap-sparring dogfood; most decisions
  resolved live and recorded as Prior decisions.
- 2026-07-02: In-session spec review (code-reviewer) returned REQUEST_CHANGES with
  four blocking findings — all accepted: (1) the DRY cross-reference violated the
  "skills don't know each other's internals" boundary → switched to a shared
  reference both skills read; (2) added `skills/inception/SKILL.md` refactor to
  scope; (3) specified the foundation-doc mechanism (record-onto-phase; `/plan`
  authors + ratifies); (4) added the inception **template** workflow.md so the
  feature propagates. Single genuinely-open item now: the shared reference's home.
- 2026-07-02: Spec-acceptance gate — the one open decision (the shared reference's
  home) resolved to `skills/shared/`: a new plugin-shipped steps artifact both
  inception and roadmap read, keeping the "skills don't know each other's
  internals" boundary. Human prerequisites confirmed none. Spec accepted;
  re-review returned APPROVE.
