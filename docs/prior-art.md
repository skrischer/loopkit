# Prior Art

> Descriptive, living document. Indexed BY CONCERN, not by project. Add entries
> whenever new references surface; gaps are fine.
>
> Challenge basis: two research passes (2026-06-16). Pass 1 — the tool landscape
> (spec-driven dev / autonomous orchestration / GitHub-state). Pass 2 — "Loop
> Engineering" as a named practice (Cherny, Osmani, Steinberger). Per-entry
> verdict: reuse | reference-only | avoid. Harvest (ADOPT / AVOID) in Notes.

## Loop engineering — the practice loopkit embodies

The named movement loopkit operationalizes: design the system that prompts the
agent instead of prompting it yourself; a loop = a recursive, verifiable goal
the agent iterates until done or a stop condition. loopkit maps onto 5 of
Osmani's 6 loop components (Skills, Worktrees, Sub-agents maker/checker,
State/Memory, Plugins) and deliberately omits the 6th — scheduled Automations.

### Addy Osmani — "Loop Engineering"

- Path: https://addyosmani.com/blog/loop-engineering/
- License: n/a (article)
- Verdict: reference-only — the canonical component taxonomy plus the
  "stay the engineer" stance that legitimizes loopkit's attended model.
- Date: 2026-06-16
- Notes: ADOPT — the 6-component frame as loopkit's own self-description;
  "Verification is still on you" -> keep the human QA gate; State/Memory may be
  markdown OR a board (validates GitHub-board-as-state). AVOID — treating
  "press go and walk away" as the goal; Osmani warns against comprehension debt
  and cognitive surrender.

### Boris Cherny (Claude Code, Anthropic) — via The New Stack

- Path: https://thenewstack.io/loop-engineering/
- License: n/a (article)
- Verdict: reference-only — origin authority for the term: "I don't prompt
  Claude anymore. I have loops running that prompt Claude."
- Date: 2026-06-16
- Notes: ADOPT — loops as the unit of work, not prompts. TENSION — his framing
  leans autonomous; loopkit takes the attended cut on purpose.

### Peter Steinberger — "Just Talk To It"

- Path: https://steipete.me/posts/just-talk-to-it
- License: n/a (article)
- Verdict: reference-only (adversarial) — the sharpest challenge to loopkit's
  spec ceremony; a named promoter of loop engineering who rejects SDD.
- Date: 2026-06-16
- Notes: TENSION — "Designing a big spec... is the old way of thinking";
  subagents/RAG = "charade"; "just talk to it." loopkit's answer is
  proportionality (the planned<->ad-hoc dial), not capitulation. AVOID — forcing
  full spec ceremony on small changes (the "sledgehammer" failure mode).

### cobusgreyling/loop-engineering

- Path: https://github.com/cobusgreyling/loop-engineering (loop-audit, loop-init, loop-cost)
- License: unverified
- Verdict: reference-only — a competing claim on the term, but CLI
  patterns/starters, not a spec-driven GitHub-state methodology. Different shape.
- Date: 2026-06-16
- Notes: ADOPT — `loop-cost`-style awareness of iteration cost (loopkit already
  records the Verify duration; keep leaning into cost-as-first-class).

## Spec-driven development & spec state model

### github/spec-kit

- Path: https://github.com/github/spec-kit — workflows reference:
  https://github.github.io/spec-kit/reference/workflows.html
- License: unverified (MIT likely — verify)
- Verdict: reference-only — the human `gate` step is worth copying; but it is
  spec-as-source with local-FS run state (`.specify/workflows/runs/<id>/`),
  one-way `taskstoissues`, and no read-back. GitHub Issues integration was
  explicitly closed "not planned" (issue #1088).
- Date: 2026-06-16
- Notes: ADOPT — an explicit human gate step. AVOID — one-way issue export with
  no read-back (state drift); local-FS run state as a second source of truth.

### Amazon Kiro

- Path: product (assessed via Fowler analysis below)
- License: n/a (proprietary)
- Verdict: avoid — spec-first, no GitHub state, markdown over-production (one bug
  -> 4 user stories / 16 acceptance criteria; "sledgehammer to crack a nut").
- Date: 2026-06-16
- Notes: AVOID — acceptance-criteria explosion; verbose markdown humans review
  instead of code.

### Tessl

- Path: product (assessed via Fowler analysis below)
- License: n/a (proprietary)
- Verdict: reference-only — ahead on living specs: spec-anchored, bidirectional
  `tessl document --code`, "// GENERATED FROM SPEC - DO NOT EDIT".
- Date: 2026-06-16
- Notes: ADOPT (later) — spec-anchored living-spec discipline; reverse-engineer
  specs from code. loopkit is spec-first today; the living-spec milestone
  (Point 3) is a step toward this, not the whole of it.

## Issue-state-as-source / GitHub-only orchestration

### automazeio/ccpm — closest prior art

- Path: https://github.com/automazeio/ccpm
- License: unverified
- Verdict: reference-only — the closest existing parallel: "Issue state is the
  project state... No separate databases or project management tools",
  PRD -> Epic -> Task -> Issue -> Code, git worktrees, no scheduler. Partially
  refutes "GitHub-only is unique" — frame loopkit as uncommon, not unique.
- Date: 2026-06-16
- Notes: ADOPT — the "Issue state is the project state" discipline + explicit
  event-driven sync (no hidden scheduler). DIFFERENTIATE — loopkit's two
  attended loops + subscription auth + dependency-ordering + the planned/ad-hoc
  boundary are the delta CCPM does not have.

## Dependency graph & parallelization

Representing dependencies — at the milestone level (does milestone B depend on
A?) and at the issue level within a milestone (`Depends on: #N`) — is what makes
the *unblocked frontier* explicit, and that frontier is exactly the set of work
that can run in parallel. Dependency representation is the prerequisite for safe
parallelization, not merely ordering. (Cross-ref: Osmani's worktrees as
"isolated parallel environments preventing file collisions" — worktrees give
isolation, the dependency graph gives the schedule.)

### automazeio/ccpm — parallel agents per epic

- Path: https://github.com/automazeio/ccpm
- License: unverified
- Verdict: reference-only — decomposes an epic into tasks and runs multiple
  parallel agents on the independent ones: evidence that issue-level dependency
  decomposition is what enables parallel execution on GitHub issues.
- Date: 2026-06-16
- Notes: ADOPT — dependency-decomposed parallelism along the unblocked frontier.
  GAP — CCPM parallelizes within one epic; milestone-level depends-on is
  loopkit's own extension of the same DAG principle one grain coarser.

### eyaltoledano/claude-task-master — dependency model

- Path: https://github.com/eyaltoledano/claude-task-master
- License: unverified
- Verdict: reference-only — tasks carry explicit dependencies; the tool computes
  the next/available task (the unblocked frontier) from the graph.
- Date: 2026-06-16
- Notes: ADOPT — explicit dependency edges + a computed "what is workable now"
  frontier. AVOID — its local `.taskmaster/` store as the graph's home; loopkit
  keeps the graph in GitHub (milestone links + `Depends on:` lines).

## Claim arbitration / parallel-agent coordination

Every autonomous orchestrator examined chose a LOCAL db/JSON/daemon for
claim-locking, because GitHub labels are not atomic. Relevant as a known risk,
not as a pattern to copy.

### frankbria/parallel-cc

- Path: https://github.com/frankbria/parallel-cc
- License: unverified
- Verdict: avoid — SQLite coordinator (`~/.parallel-cc/coordinator.db`),
  heartbeats, E2B headless (`claude -p --dangerously-skip-permissions` + API
  keys). The literal inverse of loopkit's model.
- Date: 2026-06-16
- Notes: AVOID — local DB as a hidden second source of truth; headless
  skip-permissions. CAUTION for loopkit — a GitHub claim (In Progress +
  assignee) is not atomic; safe for the 1-plan / 1-implement model, a real risk
  if implementers are ever parallelized.

### mraza007/baton

- Path: https://github.com/mraza007/baton
- License: unverified
- Verdict: avoid — autonomous daemon (30s poller) + in-memory/JSON state machine
  (Unclaimed -> Claimed -> Running -> RetryQueued -> Released); GitHub is only
  the work source, not the claim arbiter.
- Date: 2026-06-16
- Notes: ADOPT (concept only) — an explicit claim state machine is a useful
  mental model. AVOID — the background daemon + JSON claim store (breaks both
  GitHub-only and attended).

## Native Claude Code primitives — loopkit builds on these

### Claude Code `/plan`, `/loop`, `/batch`

- Path: https://code.claude.com/docs/en/commands
- License: n/a (first-party)
- Verdict: reference-only — loopkit reuses these: `/plan` (plan mode), `/loop`
  (loopkit wraps it), `/batch` (decompose -> per-unit worktree -> implement ->
  test -> PR). Overlap is at per-unit execution, not the orchestration/state
  model.
- Date: 2026-06-16
- Notes: OPEN — what is `/implement`'s delta over native `/batch` beyond
  GitHub-state sync + milestone-QA gate + dependency-ordering? (-> architecture).
  ADOPT — lean on native primitives instead of reimplementing them.

## Planned vs ad-hoc work boundary — loopkit's headline USP

### Boeckeler / Martin Fowler — "Spec-driven development: the tools"

- Path: https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html
- License: n/a (article)
- Verdict: reference-only — documents the open white space: the planned-vs-ad-hoc
  boundary is "not explicitly addressed", and spec tools are overkill for small
  changes.
- Date: 2026-06-16
- Notes: ADOPT — keep planning proportional to change size; the planned<->ad-hoc
  dial (Point 3: a living-spec milestone + a `track:adhoc` fast-lane) is
  loopkit's headline USP. AVOID — Kiro-style ceremony for one-liners.

## Loop safety / bounded retry

### eyaltoledano/claude-task-master (Taskmaster-AI)

- Path: https://github.com/eyaltoledano/claude-task-master — https://www.task-master.dev/
- License: unverified
- Verdict: reference-only — local `.taskmaster/` task store; autopilot
  Red/Green/Refactor with bounded retry (`maxGreenAttempts: 3` -> pause with
  resumable state). Does not integrate GitHub issues/milestones directly.
- Date: 2026-06-16
- Notes: ADOPT — bounded retry that fails safe with an actionable resume state
  (loopkit already has "same failure twice -> stop"; formalize it). AVOID — a
  local task store as the source of truth (breaks GitHub-only).

## Research-to-plan coupling — every plannable phase backed by prior art (feature: inception-prior-art-coupling)

Dogfooding `/loopkit:inception` on Rack (2026-06-17) surfaced a one-directional
coupling: prior art *could* spawn roadmap items, but extending the roadmap did
not pull prior art for the new phases — a phase reached `/plan` with nothing to
seed its spec. The fix makes the coupling bidirectional: every plannable roadmap
phase must be backed by >=1 prior-art concern (or an explicit "greenfield — no
prior art" note). The references below are the external practice this generalizes.

### loopkit dogfooding finding (Rack) — the originating evidence

- Path: `docs/feedback/2026-06-17-prior-art-roadmap-coupling.md` (this repo);
  evidence in `../rack`: `docs/roadmap.md` (`b45c408`) + `docs/prior-art.md` (`1d6c70b`).
- License: n/a (in-house)
- Verdict: reuse — the concrete gap report + the 5 proposed `SKILL.md` changes
  this feature implements.
- Date: 2026-06-17
- Notes: ADOPT — the dual coupling rule + a per-phase prior-art pass in Step 6 +
  a Close-out readiness item + the `(Phase N)` / `(feature: <slug>)` concern tag.
  AVOID — treating "extend the roadmap" as done while the prior-art gap it opens
  stays open.

### Dual-track agile — discovery feeds the delivery backlog

- Path: https://www.svpg.com/dual-track-agile/ ; https://www.productplan.com/glossary/dual-track-agile
- License: n/a (article/practice)
- Verdict: reference-only — the canonical practice: a continuous discovery track
  feeds *validated* items into the delivery backlog with explicit handoff
  criteria. loopkit's prior-art->roadmap coupling is the same shape one level up.
- Date: 2026-06-19
- Notes: ADOPT — research gates entry to the plannable queue (a phase is ready
  only once its concern is researched). DIFFERENTIATE — dual-track is user/market
  discovery; loopkit's concern is technical prior-art seeding specs, kept in ONE
  living doc, not a separate discovery backlog (which would be a second source of
  truth).

### github/spec-kit — per-feature `research.md` (Phase 0)

- Path: https://github.com/github/spec-kit/blob/main/templates/plan-template.md
- License: unverified (MIT likely — verify)
- Verdict: reference-only — closest tool prior art: the `plan` command emits a
  Phase-0 `research.md` per feature, making research a first-class artifact
  before implementation.
- Date: 2026-06-19
- Notes: ADOPT — research as an explicit Phase-0 artifact gating the spec.
  DIFFERENTIATE — spec-kit regenerates research per feature at plan time and
  stores it in the feature folder; loopkit seeds a shared, concern-indexed living
  prior-art doc at inception/roadmap time, so `/plan` *reads* it across phases
  instead of regenerating per feature.

## Design phase in the loop — optional, tool-agnostic design anchored to the spec (feature: design-phase)

For UI work, delivering or generating a design alongside the spec and reviewing
it before code lifts quality. The open question is placement and agnosticism:
loopkit wants an OPTIONAL design step (only when a change has UI surface), tool-
agnostic (Paper MCP / Figma / Superdesign / v0 / Claude artifacts), with the
design's durable form living in GitHub — the medium named in a project
`docs/design.md` contract, never in the skill.

### Superdesign `DESIGN.md` — the design-contract precedent

- Path: https://www.superdesign.dev/blog/what-is-design-md ; repo https://github.com/superdesigndev/superdesign
- License: OSS (verify); article n/a
- Verdict: reuse — the closest analog to loopkit's proposed `docs/design.md`:
  "tsconfig.json for your design system", repo-versioned markdown read by any
  agent (Claude Code, Cursor, v0). Tool-agnostic by being portable text.
- Date: 2026-06-19
- Notes: ADOPT — the contract structure: YAML token front-matter (colors, type,
  spacing, radii) + prose rationale + Components + Do's/Don'ts; loaded each
  session. loopkit's `docs/design.md` = `workflow.md`'s sibling: names the tool,
  where designs live, the review path, the handoff format. AVOID — coupling it to
  one generator.

### W3C Design Tokens (DTCG) — agnostic interchange = durable state

- Path: https://www.designtokens.org/tr/drafts/format/ ; https://tokens.studio/
- License: W3C Community spec / Tokens Studio OSS core
- Verdict: reuse — the platform-agnostic, vendor-neutral token format (first
  stable 2025.10): "the contract between design and development". A token file in
  the repo is the durable, GitHub-storable design state; the canvas is the editor.
- Date: 2026-06-19
- Notes: ADOPT — tokens as the durable form that satisfies GitHub-only state and
  tool-agnosticism in one move. AVOID — letting tool-specific token dialects leak
  past the contract.

### Spec-kit / Kiro — Requirements -> Design -> Tasks (design reviewed before code)

- Path: https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html (cross-ref existing entries)
- License: n/a (article) / proprietary (Kiro)
- Verdict: reference-only — validates placement: design is a documented artifact
  reviewed before code, where humans keep architectural control.
- Date: 2026-06-19
- Notes: ADOPT — design-before-code as a reviewed artifact. DIFFERENTIATE — fold
  the design review into loopkit's existing spec-acceptance gate (no third gate);
  keep it OPTIONAL (Kiro forces it -> over-production loopkit's proportionality
  rejects).

### Figma Dev Mode MCP + Code Connect — designer->agent handoff (one tool option)

- Path: https://www.figma.com/blog/the-figma-agent-is-here/ ; https://blog.logrocket.com/ux-design/design-to-code-with-figma-mcp/
- License: proprietary
- Verdict: reference-only — the bidirectional design<->code handoff: agents read
  variables/tokens/components as machine-readable context; code-to-canvas and
  back. One concrete `docs/design.md` tool option, not the orchestration.
- Date: 2026-06-19
- Notes: ADOPT — bidirectional (matches "design from spec" AND "spec from design")
  + tokens/Code Connect as structured handoff over screenshots. AVOID — Figma
  lock-in; the agnostic skill selects the tool MCP via the contract.

### Superdesign + Vercel v0 — agentic UI generation + iterate loop (OSS option)

- Path: https://github.com/superdesigndev/superdesign ; https://v0.dev
- License: OSS (verify) / proprietary (v0)
- Verdict: reference-only — generate UI from natural-language/spec, iterate in a
  review loop, derive a design-system file from the existing repo.
- Date: 2026-06-19
- Notes: ADOPT — the generate->review->iterate loop as the design step's inner
  cycle; "derive design system from the repo" for brownfield UIs. AVOID — direct
  code output bypassing the spec/issue (keep the design artifact, not just code).
