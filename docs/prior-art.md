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

## Bootstrap vs iteration — separate one-time inception from ongoing prior-art-driven planning (feature: roadmap-iteration)

After inception a project is feature-complete; further features are an
*iteration* loop, not a re-bootstrap. The value that loop must inject each time is
prior-art research — "who has built this already, well or badly" — as inspiration
and an adopt/avoid filter, so new features reuse the best existing patterns
instead of being reinvented. The open shape: a dedicated iteration entry point
running the prior-art + architecture-seed + roadmap steps without inception's
one-time loop-readiness sweep, delegating to the shared inception steps (DRY).

### github/spec-kit — command topology separates setup from iteration

- Path: https://github.com/github/spec-kit (commands: /constitution vs /specify + /plan)
- License: unverified (MIT likely — verify)
- Verdict: reference-only — spec-kit already splits the one-time project step
  (`/constitution`) from the per-feature iteration steps (`/specify` + `/plan`):
  direct precedent for extracting loopkit's roadmap/iteration planning out of the
  one-time inception dialog into its own `/loopkit:roadmap` entry point.
- Date: 2026-07-02
- Notes: ADOPT — the bootstrap-vs-iteration command split; run readiness once, not
  per feature. DIFFERENTIATE — loopkit's iteration step centres prior-art research
  (adopt/avoid/sources), not just spec drafting, and reuses the shared inception
  steps rather than duplicating them.

## Prior-art as the substrate for every artifact — research + adopt/avoid + sources (feature: prior-art-elevation)

loopkit's own thesis, sharpened: every artifact it produces — vision,
constitution, architecture, each spec, and the implementation itself — is
downstream of a thick prior-art pass answering "who has done this well or badly".
The constitution today frames prior art as one principle among many ("consulted
and linked"); this concern elevates it toward the substrate the other artifacts
derive from, and carries the source-level analysis already granted to `/plan`
(an ephemeral read-only checkout of the referenced OSS) into the implement loop
as a template for when a supposedly simple change is struggling.

### loopkit source-checkout precedent (PR #93) — read the OSS, don't guess

- Path: `docs/constitution.md` (Prior-art principle) + `skills/plan/SKILL.md` (Step 2); this repo. Cross-ref the Loop engineering entries above (Osmani/Cherny: design the system around what already exists).
- License: n/a (in-house)
- Verdict: reuse — planning already encourages an ephemeral, read-only checkout of
  a referenced OSS repo to analyse a specific implementation when the distilled
  verdict is too coarse; generalise the same move to the implement loop.
- Date: 2026-07-02
- Notes: ADOPT — source-level prior-art analysis as a first-class loop input, not
  just a distilled verdict. AVOID — retaining or copying in the external code (a
  transient read only; the recorded decision is the durable output).

### Clean-room design (ReactOS, Coherent) + MALUS "Clean Room as a Service" (satire) — the boundary loopkit must not cross

- Path: https://en.wikipedia.org/wiki/Clean_room_design ; https://malus.sh/ (satire)
- License: n/a (concept / satirical site)
- Verdict: reference-only (adversarial) — clean-room design is the *inverse* of
  loopkit's move: it forbids looking at the source (reimplement from specs only)
  to avoid copyright contamination. MALUS lampoons the degenerate case — "robots
  that never see a single line of source code" laundering OSS into
  zero-attribution proprietary code. Names the line loopkit's source-checkout
  stays on the right side of.
- Date: 2026-07-02
- Notes: ADOPT — the licensing discipline clean-room encodes: keep the checkout
  transient and read-only, harvest ideas/approaches (facts), never copy
  copyrightable expression into this repo. AVOID — becoming a reimplementation
  shop; loopkit reads source for *analysis feeding a recorded decision*, not to
  reproduce it. The durable output is the decision, not the code.

### Manus — per-execution isolated, temporary sandbox (the disposable analysis environment)

- Path: https://gist.github.com/renschni/4fbc70b31bad8dd57f3370239dccd58f ; https://www.bunnyshell.com/guides/sandboxed-environments-ai-coding/
- License: n/a (article / product analysis)
- Verdict: reference-only — Manus runs each task in an isolated, temporary Ubuntu
  VM (Docker-isolated, independent per execution); the broader sandbox ecosystem
  clones a branch, works, and auto-destroys after review. Validates loopkit's
  "ephemeral checkout outside the repo, discarded after" as the standard shape.
- Date: 2026-07-02
- Notes: ADOPT — disposable-by-default: the source-analysis environment is created
  for the read and torn down after, never retained state. DIFFERENTIATE — loopkit
  needs no VM/daemon; a read-only git checkout outside the repo is the whole
  mechanism (no headless infra, staying subscription-only).

### Repo-of-Repos — a manifest that stages reference repos for cross-reference

- Path: https://raffertyuy.com/raztype/repo-of-repos-pattern/
- License: unverified (OSS template)
- Verdict: reference-only — a `repos.yaml` manifest clones multiple repos into one
  workspace so an agent can "grep, read, and cross-reference ... as if they were
  one codebase"; each inner repo keeps its own origin so commits never flow into
  the outer workspace. Concrete mechanism for holding OSS references beside the work.
- Date: 2026-07-02
- Notes: ADOPT — the isolation guarantee (inner repos keep their own origin -> no
  accidental commit of reference code into loopkit) and the cross-reference value.
  AVOID / DIFFERENTIATE — a persistent multi-repo manifest would be a second source
  of truth; loopkit's checkout stays transient and outside the repo, so the
  reference cannot ossify into retained state.

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

## Non-UI concept design + the durable diagram medium (feature: design-in-the-loop)

Design is not only UI: a flow, a state machine, an architecture, a mental model
can be "designed" too — drawn to settle a decision (exactly what the loopkit
interpretation diagram did: no UI, yet a design artifact that drove alignment).
This broadens the design phase from "UI surface only" to "a visual would clarify
the decision", still optional and proportional, and woven INTO the prior-art
sparring (e.g. "how did others build a date-range picker" -> sketch variants ->
pick one). The open question the research settles: which durable, git-committable,
tool-agnostic, agent-authorable medium — and whether hand-authored HTML still
earns its place.

### Mermaid — diagrams-as-code, rendered natively where loopkit reviews

- Path: https://github.blog/developer-skills/github/include-diagrams-markdown-files-mermaid/ ; https://github.com/mermaid-js/mermaid ; https://microsoft.github.io/genaiscript/reference/scripts/diagrams/
- License: MIT (verify)
- Verdict: reuse — text-based diagrams GitHub renders natively in Markdown, Issues,
  PRs and wikis (since Feb 2022); diffs cleanly in git, reviewable line-by-line in
  a PR, and LLMs author it well. It lands the design artifact exactly in loopkit's
  own durable state (the issue/PR/spec markdown), rendered at the spec-acceptance
  review — no external tool, no second source of truth.
- Date: 2026-07-02
- Notes: ADOPT — Mermaid as the DEFAULT non-UI concept medium; the diagram lives in
  the committed markdown and renders in-review. Guard the known failure mode: LLM
  Mermaid syntax is fragile — validate/repair (GenAIScript ships a repairer). AVOID
  — bespoke HTML/SVG as the default: committable but it does NOT render in a GitHub
  PR review and diffs noisily; keep it only for the rare diagram Mermaid cannot
  express. (D2 has nicer auto-layout, PlantUML is the UML standard — both
  reference-only here: not GitHub-native, so they need a render step.)

### C4 model — tool-agnostic notation for architecture-level design

- Path: https://c4model.com/ ; https://structurizr.com/
- License: n/a (model) / Structurizr proprietary DSL
- Verdict: reference-only — a notation- and tooling-INDEPENDENT hierarchy (context /
  container / component / code) that renders via Mermaid, PlantUML or Structurizr
  DSL. Matches loopkit's "hardcode no tool" rule: the notation is portable, the
  renderer swappable.
- Date: 2026-07-02
- Notes: ADOPT — C4 as the shared vocabulary when a design is architectural, on top
  of the Mermaid medium. DIFFERENTIATE — loopkit needs only the lightest C4 levels
  its change touches, not the full model (proportional).

### Architecture Decision Records (ADR) — design-as-decision, minus the lifecycle markers

- Path: https://adr.github.io/ ; https://martinfowler.com/bliki/ArchitectureDecisionRecord.html ; https://aws.amazon.com/blogs/architecture/master-architecture-decision-records-adrs-best-practices-for-effective-decision-making/
- License: n/a (practice)
- Verdict: reference-only — the canonical "capture a decision as a short in-repo
  artifact": one decision, one page, context + decision + consequences, written
  DURING the decision, stored beside the code. Direct precedent for treating a
  non-UI design as a reviewable decision artifact in sync with planning.
- Date: 2026-07-02
- Notes: ADOPT — the ADR shape (context / alternatives / decision / consequences,
  authored at decision time) as the prose skeleton beside the diagram; it already
  lives in loopkit's spec Prior-decisions + Decision-log. AVOID — the ADR lifecycle:
  its Proposed/Accepted/Deprecated/Superseded status headers + append-only log clash
  with loopkit's "specs carry no lifecycle state / no DRAFT-READY" rule. loopkit's
  accepted-state is the merge + git history, not a status marker.

## Structural verification of a Claude Code plugin — reuse the native validator (feature: structural-verify)

loopkit ships `Verify: none`, so every change is checked only at the milestone-QA
gate. The idea "add a structural Verify (JSON validity + SKILL.md frontmatter)"
survives the existence check only in a SHARPENED form: Claude Code already ships
the validator, so loopkit should REUSE it, not hand-roll one — which also keeps
the constitution's "Runtime = Claude Code + gh + git, no language runtime, no
package manager" intact (no npm / ajv / python dependency). No foundation-doc
impact: the native validator fits the existing runtime.

### Claude Code `claude plugin validate` / `/plugin validate` — the native validator

- Path: https://code.claude.com/docs/en/plugin-marketplaces
- License: n/a (first-party)
- Verdict: reuse — validates `plugin.json` + `marketplace.json` (JSON + schema),
  skill/agent/command frontmatter, duplicate plugin names, and source path
  traversal; runs against a plugin dir or a marketplace dir. Exactly loopkit's
  desired structural invariants, already shipped with the runtime.
- Date: 2026-07-02
- Notes: ADOPT — set loopkit's Verify command to `claude plugin validate` (+ a thin
  shell/git assertion for loopkit-specific invariants it does not cover); wire it
  into the per-PR and milestone-QA gates. AVOID — hand-rolling a JSON/frontmatter
  validator or pulling in npm/ajv/python (breaks the no-package-manager runtime).

### hesreallyhim/claude-code-json-schema — unofficial manifest schemas (reference)

- Path: https://github.com/hesreallyhim/claude-code-json-schema
- License: unverified (OSS)
- Verdict: reference-only — comprehensive JSON Schemas for `plugin.json` /
  `marketplace.json`, meant for editor/IDE integration; a documentation-grade
  fallback if the native validator is unavailable in some context.
- Date: 2026-07-02
- Notes: ADOPT (reference) — the schema shapes as documentation. AVOID — depending
  on it at runtime (needs a JSON-Schema engine → a package manager).

### Claude Code issue #25380 — frontmatter validator rejects extended fields (caution)

- Path: https://github.com/anthropics/claude-code/issues/25380
- License: n/a (issue)
- Verdict: avoid (as a blind dependency) — the SKILL.md validator recognizes only
  Agent-Skills standard fields and rejects Claude Code extended frontmatter; a
  known limitation to scope around.
- Date: 2026-07-02
- Notes: ADOPT — validate the required fields (`name`, `description`; `name` matches
  the folder) and treat extended-field warnings as non-fatal. AVOID — failing Verify
  on extended-frontmatter false-positives until the issue is resolved.

## Orchestrator loop exit states & bounded review retry (feature: implement-frontier-exits)

The wave loop branches only on "all closed" vs "escalated/parked": an issue left
open without a label by a subagent that reports none of the three §3 states
re-enters the frontier and re-dispatches each wave — an undefined exit state in
the core orchestration loop (2026-07-02 codebase analysis). The bounded-retry
rule already exists at contract level (`docs/workflow.md`); the review loops in
implement/plan must consult it by reference, not restate it.

### Claude Code agent teams — shared task list with dependency auto-unblocking

- Path: https://code.claude.com/docs/en/agent-teams
- License: n/a (first-party docs)
- Verdict: reference-only — the native task list supports task dependencies with
  auto-unblocking, but the docs name the same failure class loopkit must define
  away: "task status can lag/block dependents"; team state is local and
  ephemeral (`~/.claude/tasks`, deleted at session end) — not durable state.
- Date: 2026-07-02
- Notes: ADOPT — explicit terminal states per dispatched unit: every subagent
  exit MUST map to exactly one of merged / escalated / parked, with a defined
  default (failed dispatch: one retry, then auto-park `blocked:human`) when it
  maps to none. AVOID — a frontier whose membership is defined only by the
  happy path; relying on status that can lag.

### eyaltoledano/claude-task-master — DAG frontier filters

- Path: https://github.com/eyaltoledano/claude-task-master (v0.42.0 `--ready` / `--blocking`)
- License: unverified (OSS)
- Verdict: reference-only — shipped explicit DAG frontier filters (2026-01-15):
  the frontier is a first-class queryable set with total membership, not an
  emergent condition of the loop.
- Date: 2026-07-02
- Notes: ADOPT — frontier membership as a total function of issue state (every
  open issue is exactly one of: unblocked, dependency-blocked,
  cross-milestone-blocked, parked, escalated). AVOID — the rest of Task Master's
  model (local tasks.json, Docker/API-key loops — constitution don'ts).

## Worktree resume & merge-conflict recovery (feature: implement-resume-safety)

The orchestrator's autonomous-merge core has no defined behavior for its two
most likely mid-run failures (2026-07-02 codebase analysis): a prior run's
leftover branch/worktree (`git worktree add -b` collides) and a conflicting
squash-merge between frontier siblings. The field names this unsolved — shipping
a defined recovery path is differentiating because nobody else has one.

### CoAgent / InfoWorld — worktrees do not solve semantic conflicts

- Path: https://arxiv.org/pdf/2606.15376 (CoAgent); https://www.infoworld.com/article/4035926
- License: n/a (paper / article)
- Verdict: reference-only — the named 2026 gap: worktrees "only provide low-level
  workspace isolation and do not solve task decomposition, dependency tracking,
  semantic conflicts, or merge selection"; agents edit related files under
  incompatible assumptions and errors appear only at integration.
- Date: 2026-07-02
- Notes: ADOPT — a defined conflict path: rebase onto the updated base ->
  re-run Verify -> re-merge once; a second conflict routes to `needs:planning`
  (a missed serialization edge is a planning defect under "clarification belongs
  to planning"). AVOID — hard file locks or claim-like arbitration (constitution
  don't).

### automazeio/ccpm — `conflicts_with` task metadata

- Path: https://github.com/automazeio/ccpm
- License: unverified
- Verdict: reference-only — CCPM tasks carry `depends_on` / `parallel` /
  `conflicts_with` metadata: file-overlap risk is representable at plan time
  instead of discovered at merge time.
- Date: 2026-07-02
- Notes: ADOPT — a soft, advisory file-overlap pass in /plan (predict touched
  files per issue; add `Depends on:` edges or an overlap note on intersection)
  and soften implement's same-file serialization claim, which plan never
  establishes. AVOID — turning overlap hints into hard locks.

### Claude Code background agents — resume is re-derived, not restored

- Path: https://code.claude.com/docs/en/changelog (v2.1.144+); https://code.claude.com/docs/en/agent-teams
- License: n/a (first-party)
- Verdict: reference-only — background sessions persist and resume, but the
  native `/resume` explicitly does NOT restore in-process teammates: even
  first-party resume re-derives rather than restores agent state.
- Date: 2026-07-02
- Notes: ADOPT — re-derive resume state from GitHub (existing branch? open PR
  for the issue? -> re-attach and continue from Verify) — the GitHub-only-state
  principle applied to recovery. AVOID — any local resume file.

## Process-PR overhead — ceremony telemetry (feature: ceremony-overhead)

The loudest criticism of every SDD leader is ceremony (Spec Kit: "a permit
application to move a chair", ~800 artifact lines per run; Kiro: one bug -> 4
user stories / 16 acceptance criteria). loopkit's own telemetry exhibits the
same failure at PR granularity (2026-07-02 analysis: 3 fixed process PRs per
full-spec milestone; milestone #11 delivered 2 issues at the cost of 5 PRs; 44
of 86 merged PRs carried no behavior change). The proportionality pitch must be
backed by loopkit's own numbers. Also internal: the post-merge Decision-log
instruction writes to a branch the merge already deleted — unexecutable as
ordered.

### Scott Logic / OpenSpec — overhead without qualitative benefit

- Path: https://blog.scottlogic.com (2025-11-26); https://codemyspec.com/blog/openspec-vs-spec-kit; https://github.com/Fission-AI/OpenSpec
- License: n/a (articles); OpenSpec unverified (OSS)
- Verdict: reference-only — documented verdicts on Spec Kit: "heavyweight for
  anything other than really big features", "no qualitative benefit to justify
  the overhead"; OpenSpec won ~52k stars by June 2026 on delta specs producing
  ~250 lines where Spec Kit produces ~800 — lighter ceremony is a proven
  adoption driver.
- Date: 2026-07-02
- Notes: ADOPT — measure ceremony as a first-class number (process PRs per
  milestone, artifact lines per change) and drive it down: fold the roadmap-link
  commit onto the accepted spec branch, keep one QA close-out PR. AVOID —
  fixing ceremony by introducing a new artifact type (the meta-failure).

## Gate evidence & review-payload compression (feature: gate-evidence)

The two human gates currently leave no GitHub trace beyond a closed milestone —
the #12 QA gate passed an SVG violating loopkit's own no-status-marker rule and
no audit trail caught it (fixed post-hoc in #132). The field's consensus #1 pain
is review, not authorship; per-gate comprehension cost is the honest
justification for keeping exactly two gates.

### Addy Osmani — "Comprehension debt"

- Path: https://addyosmani.com/blog/comprehension-debt/; https://www.oreilly.com/radar/comprehension-debt-the-hidden-cost-of-ai-generated-code/
- License: n/a (articles)
- Verdict: reference-only — agents generate 140–200 lines/min against 20–40
  lines/min human comprehension; PR volume +29% YoY; review is the 2026
  bottleneck.
- Date: 2026-07-02
- Notes: ADOPT — post the derived QA scenarios + the human verdict as a
  milestone comment before closing (a comment on an existing GitHub object — no
  new state; the living-spec batch summary gets the same durable home) + a QA
  handover mapping each spec Verification item to the PRs/commits implementing
  it. AVOID — a third human gate; duplicating spec-acceptance decisions into PR
  comments (the merged spec's Decision log is already the durable record).

### AlphaSignal — "The wall is review, not authorship"

- Path: https://alphasignalai.substack.com/p/most-developers-do-not-need-agent
- License: n/a (article)
- Verdict: reference-only — a 2025 study: 68% of production agents run ten steps
  or fewer before humans intervene; loops pay off only where verification is
  cheap and gates are hard.
- Date: 2026-07-02
- Notes: ADOPT — invest in per-gate payload compression; it is the binding
  constraint on attended loops. AVOID — gates that rubber-stamp (six
  spec-acceptance gates in a 20-minute window is the dogfood symptom to design
  against).

## Design coverage enforcement (feature: design-coverage)

loopkit dogfooding finding (Flowmate): /design designs but does not enforce
coverage — an entire flow shipped undesigned and caused a real bug. The parallel
Rack feedback (2026-06-17) shipped as milestone #8 within 2 days once committed;
the Flowmate write-up sat untracked on local disk for 13 days — the intake loop
works only when the file is committed.

### loopkit dogfooding finding (Flowmate) — the originating evidence

- Path: docs/feedback/2026-06-19-design-skill-retrofit.md (untracked at seed
  time; committed by this phase)
- License: n/a (internal)
- Verdict: reuse — derive the spec's user-facing capabilities and assert each
  maps to a surface or state; enumerate per-surface states the spec's
  Outcome/Verification implies; write back a complete `Design:` line per spec;
  split the design review into craft + coverage passes under bounded retry.
- Date: 2026-07-02
- Notes: ADOPT — coverage as a machine-checkable planning-cycle assertion, not a
  third gate; a missing docs/design.md routes to inception --here (which owns
  the design-contract bootstrap). AVOID — growing a second bootstrap inside
  /design (duplication); a feedback watcher/automation — /roadmap recognizes
  docs/feedback/ files as raw-idea inputs when invoked (attended model).

## Attended-loop permission guardrails (feature: permission-template-hardening)

The shipped inception settings template defaults generated projects to
bypassPermissions with a leaky deny list and hardcoded Supabase rules —
violating loopkit's own "templates contain no project-specific values" quality
gate on exactly the surface a skeptical adopter inspects first.

### AlphaSignal / skills audit — unattended loops as attack surface

- Path: https://alphasignalai.substack.com/p/most-developers-do-not-need-agent
- License: n/a (article)
- Verdict: reference-only — an audit of 17,022 agent skills found 520 leaking
  credentials (~74% via debug logging); "a loop running unattended is an attack
  surface running unattended" — the security half of the attended stance.
- Date: 2026-07-02
- Notes: ADOPT — cite this in the positioning; close the cheap deny-list gaps
  (`rm -r`/`-fr` spellings, `+refspec` force-push, `git -C` variants of guarded
  commands); extend verify.sh to assert the template placeholder is intact.
  AVOID — claiming airtightness: prefix-match deny rules cannot stop `bash -c`
  wrapping; the honest claim is deny-wins + human gates.

### Boris Cherny — auto mode over permission fatigue

- Path: https://howborisusesclaudecode.com
- License: n/a (compilation)
- Verdict: reference-only — "more safe than reading every single permission
  prompt": permission fatigue is the real-world failure mode; a curated bypass
  with hard deny rules beats prompt-per-call in attended loops.
- Date: 2026-07-02
- Notes: ADOPT — document WHY bypassPermissions is the attended default; offer a
  stricter acceptEdits variant as an explicit inception choice. AVOID —
  defaulting strangers into bypass silently, without the rationale in front of
  them.

## Positioning vocabulary — attended, spec-anchored, agentic engineering (feature: repositioning)

Karpathy's "agentic engineering" won the umbrella-term war (2026-02-04, vibe
coding declared passé); the 2026 SDD consensus is "spec-anchored is where the
value is today" — loopkit's exact tier. Plan-before-code approval is table
stakes at every big vendor, and attended operation is everywhere an option,
nowhere a principle: the principle is the pitch. README/plugin.json must carry
this vocabulary and stop contradicting the constitution ("READY spec",
"select/claim").

### Karpathy / SDD tier consensus — the winning vocabulary

- Path: https://www.ibm.com/think/topics/agentic-engineering; https://dev.to/krlz (spec-driven development in 2026); https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html
- License: n/a (articles)
- Verdict: reference-only — the tier model (spec-first / spec-anchored /
  spec-as-source) with spec-anchored as the consensus sweet spot; Thoughtworks
  keeps SDD at "Assess" insisting executable code remains the source of truth.
- Date: 2026-07-02
- Notes: ADOPT — "attended, spec-anchored loop engineering" as the one-line
  self-description; justify the two gates via the review bottleneck,
  comprehension debt, and security — never via model unreliability (which
  improves and would date the stance); reframe no-scheduler as the positive
  claim "attended orchestration between exactly two human gates" in prose while
  the grep-verifiable constitution rule stays untouched. AVOID — "vibe"
  vocabulary; pitching "a human reviews a plan" as differentiation (table
  stakes everywhere).

### Big-vendor aggregate — attended is nowhere a principle

- Path: vendor docs/changelogs (Codex scheduled reminders + proactive
  delegation; Copilot autopilot/fleet; Jules `requirePlanApproval` defaulting
  off + proactive tasks; Antigravity scheduled background tasks; Devin
  unattended API) — 2026-07-02 research pass
- License: n/a (products)
- Verdict: reference-only — every vendor ships unattended options; none computes
  a dependency-ordered execution frontier from issue-level relations; parallel
  dispatch is human-curated in mission-control UIs.
- Date: 2026-07-02
- Notes: ADOPT — a documented multi-harness/Codex FAQ stance (the most common
  adoption objection; wshobson/agents grew ~37k stars on portability). AVOID —
  scope-creeping into actual multi-harness support (constitution: Runtime =
  Claude Code + gh + git).

## Prior-art freshness & the single-entry USP section (feature: prior-art-backfill)

This file defends the headline USP ("GitHub-only durable state") with exactly
one entry (CCPM) and carries fast-decaying claims propagated across research
passes: the spec-kit entry's "GitHub Issues integration closed not planned"
predates `/speckit.taskstoissues` + `/speckit.converge`; the native-primitive
inventory (2026-06-16) predates Routines; "MIT likely — verify" TODOs sit
unresolved. The most direct first-party occupants of the GitHub-native cell are
absent entirely (2026-07-02 analysis).

### GitHub Copilot coding agent + Agent HQ — the missing first-party occupant

- Path: https://docs.github.com/copilot/concepts/agents/coding-agent/about-coding-agent; https://github.blog/news-insights/company-news/welcome-home-agents/
- License: n/a (product)
- Verdict: reference-only (full assessment is this phase's work) — issue-assigned,
  Actions-powered, explicitly unattended-capable ("continues even if your
  computer is off"); Agent HQ mission control holds session/orchestration state
  outside issues/milestones/boards. Occupies the GitHub-native cell WITHOUT the
  issues-as-only-state discipline — sharpens, not refutes, loopkit's USP.
- Date: 2026-07-02
- Notes: ADOPT — backfill full entries (also: OpenAI Codex/AGENTS.md, BMAD,
  OpenSpec, GSD, one parallel-orchestration UI — Conductor or Vibe Kanban) each
  under its matching concern with adopt/avoid verdicts; add `Verified: <date>`
  distinct from creation date, a volatility flag on product-feature claims, and
  a staleness check in inception --here's readiness sweep. AVOID — a scheduler
  for freshness (non-goal); append-only growth without index repair (untagged
  legacy sections, stale header, "Point 3" references).

## Dogfooding the untested tracks (feature: dogfood-untested-claims)

Two headline claims have zero exercised evidence after 13 milestones
(2026-07-02 analysis): the living-spec track (one of the constitution's three)
and "two independent milestones run as two orchestrators" (a literal vision
success criterion). Undogfooded tracks are where the proportionality claim gets
caught out publicly — BMAD v6 markets "scale-adaptive planning" at ~49k stars.

### Boris Cherny — parallel attended sessions as daily practice

- Path: https://howborisusesclaudecode.com
- License: n/a (compilation)
- Verdict: reference-only — 5–10 parallel worktree sessions attended by one
  engineer is demonstrated daily practice; two concurrent orchestrators is a
  modest, realistic test of the vision claim.
- Date: 2026-07-02
- Notes: ADOPT — run the two-orchestrator test on genuinely disjoint spec-worthy
  phases (verify file-set disjointness at plan time against the known shared
  spines) and record the outcome in the roadmap like the P1–P6 serialization
  finding. AVOID — inflating a trivial change into a spec to force the test
  (manufactured ceremony); deferring is better than fabricating.

### Gas Town (Steve Yegge) — the unattended contrast

- Path: https://github.com/gastownhall/gastown; https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04
- License: unverified
- Verdict: avoid — colonies of 20–30 parallel agents over git-tracked JSON issue
  records, largely autonomous, with reported ~$100/hour token burn: the
  cost/comprehension failure mode the attended model exists to avoid.
- Date: 2026-07-02
- Notes: ADOPT — the living-spec milestone for the ongoing correction/feedback
  stream (exercises the never-used QA batch-summary path) as the attended answer
  to "ongoing themes". AVOID — colony-scale parallelism; unattended issue
  factories.

## Launch playbook — methodology-plugin distribution (feature: launch-playbook)

The category-defining precedent is Superpowers: shipped 2025-10-09 (the day
plugins launched), first-person blog post -> Simon Willison (2025-10-10) -> HN
-> official directory (2026-01-15); 244,309 stars by 2026-07-02 (GitHub API).
The window matters: "loop engineering" went viral 2026-06-07 with only thin
tooling attached, 15,134 Claude Code plugin repos (4x YoY) make unlabeled repos
invisible, and CCPM — the niche incumbent — is fading (last push 2026-03-18).

### obra/superpowers — the launch playbook

- Path: https://github.com/obra/superpowers; https://blog.fsck.com/2025/10/09/superpowers/; https://simonwillison.net/2025/Oct/10/superpowers/
- License: unverified (OSS)
- Verdict: reference-only — the proven distribution sequence for a methodology
  plugin; HN's main criticism of it ("over-engineering for small tasks") is
  loopkit's exact differentiator.
- Date: 2026-07-02
- Notes: ADOPT — first-person dogfood narrative with GitHub state as proof;
  re-verify every cited figure pre-publication (star counts are the one detail
  a skeptical HN commenter checks); submit to the official Anthropic directory
  (public solo-dev form; passes `claude plugin validate` since #134/#135) and
  awesome-claude-code (~48k stars, updated daily). Prerequisites: LICENSE +
  repo metadata landed (fast-lane); repositioning landed (the README must match
  the constitution before strangers read both). AVOID — launching with the
  stale README; a stale pushed_at (reads as abandonment — establish a visible
  release cadence).

### buildtolaunch — plugin keep-criteria

- Path: https://buildtolaunch.substack.com/p/best-claude-code-plugins-tested-review
- License: n/a (review)
- Verdict: reference-only — independent reviewers keep only ~4 of 11 tested
  plugins; keep-criteria: real workflow improvement (not polish), accurate
  output, no "always-on overhead", integration with existing systems.
- Date: 2026-07-02
- Notes: ADOPT — lead with the fast-lane demo (proportional = no always-on
  overhead) and the GitHub-integration story (existing systems, no new tool).
  AVOID — polish-only pitches.

## Foundation-doc context budget (feature: foundation-dedup)

greenfield — no external prior art; internal integrity finding (2026-07-02
analysis). vision.md and constitution.md duplicate ~20 lines near-verbatim (the
design phase, the orchestrator model), violating their own "no content
duplicated across foundation artifacts" don't, at 105/133 lines against the
self-imposed ~1-page budget — and both are permanently loaded into every
session, so the duplication costs tokens on every loop iteration. Three
drifting hard-limit enumerations (CLAUDE.md, docs/workflow.md, settings.json)
name the same authority; docs/design.md declares a German-diagram exception the
binding constitution does not sanction — ratify or remove.

## State-machine trust boundary — untrusted GitHub text as instruction/shell (feature: trust-boundary)

loopkit turns partly-untrusted GitHub-sourced strings into instructions for a
privilege-granted autonomous agent and into shell commands, removing the human
that normal GitHub use keeps between an untrusted channel and an action, while
widening blast radius (commit/push/merge/exec, dependency installs, .env edits).
Surfaced by the 2026-07-08 state-machine note (an external NONE-association
account posted a malware `.zip` comment on issue #138) and settled by the
2026-07-08 audit skill-sweep: the one genuine structural gap is the `track:adhoc`
body treated as "the whole contract" and auto-picked to autonomous squash-merge
with no author check and no QA gate; a live shell-hygiene defect exists at
`skills/plan/SKILL.md:226-232` (unescaped interpolation into `gh` strings on the
human-authored write path). The command-injection facet is latent (preventive)
in `/implement` — branch names come from contract naming, PR/commit text is
agent-authored. `settings.json` hard-limits cover only the crudest ops, not
injection amplification.

### Simon Willison — lethal trifecta, prompt-injection design patterns, Rule of Two

- Path: https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/;
  https://simonwillison.net/2025/Jun/13/prompt-injection-design-patterns/;
  https://simonwillison.net/2025/Nov/2/new-prompt-injection-papers/;
  https://simonwillison.net/2025/Sep/26/how-to-stop-ais-lethal-trifecta/;
  https://simonwillison.net/2026/Jun/22/prompt-injection-as-role-confusion/
- License: n/a (essays) — plus Meta "Agents Rule of Two" (via Willison 2025-11-02)
- Verdict: reference-only — the canonical practitioner corpus on securing LLM
  agents against prompt injection; directly applicable to a tool that reads issue
  bodies/titles/comments and can commit/push/merge.
- Date: 2026-07-08
- Notes: ADOPT — **plan-then-execute / dual-LLM**: treat every issue/PR/comment/
  bot field as an inert request, structurally unable to trigger a consequential
  action (the `track:adhoc` body is a request to plan against, never an
  executable contract); **shell-hygiene**: never interpolate a GitHub-sourced
  string unquoted into a shell; **Rule of Two**: force a human gate when
  untrusted-input + sensitive-access + external-comms coincide — which is exactly
  why the autonomy dial must not pre-authorise a gate until this boundary lands;
  keep the human-visible audit trail (GitHub state already provides it). AVOID as
  futile — injection detection/classification filters ("99% is a failing grade"),
  vendor "95–99% caught" claims, and trusting trained-in model resistance as *the*
  boundary (even Jun-2026 Willison would not deploy where an injection could cause
  irreversible action). The per-repo comment-deletion Action from the note's
  sparring was discarded on purpose (repo hygiene is the target project's choice,
  not a loopkit primitive) — do not ship it.

## Model-tier-per-agent — role-to-tier routing in the contract (feature: model-tier-slots)

The maintainer hand-prompts an Opus-orchestrates / Sonnet-implements /
Opus-reviews split every run; nothing in the skills or `docs/workflow.md` encodes
it, so `/implement` fans out orchestrator, per-issue subagent, and reviewer
identically. Hardcoding literal model names into the skills would violate the
"hardcodes no tool" principle and is maximally volatile (Opus 4.8 → Fable 5 churn
already happened) — but the *roles* are stable and only the model filling each is
project-config, exactly like the Verify command already in the contract.

### Anthropic model-config — subagent resolution, opusplan; practitioner tier consensus

- Path: https://code.claude.com/docs/en/model-config;
  https://code.claude.com/docs/en/sub-agents; https://simonwillison.net/2026/Jul/3/
- License: n/a (first-party docs + essay)
- Verdict: reference-only — native subagent model selection already exists
  (frontmatter `model`: alias / full-id / `inherit`, default `inherit`;
  resolution order `CLAUDE_CODE_SUBAGENT_MODEL` env var > per-invocation param >
  frontmatter > main conversation), and `opusplan` ships the plan-Opus /
  execute-Sonnet split — so no mechanism needs building.
- Date: 2026-07-08
- Notes: ADOPT — an OPTIONAL `docs/workflow.md` field mapping role→tier
  (orchestrator / implementer / reviewer), default `inherit` when absent, read by
  the skills and passed to native subagent model selection; model names live only
  in the per-project contract, never in tool-agnostic skill prose (the same class
  as the "no external-tool URL as durable state" rule). Willison (2026-07-03)
  found delegating the tier *decision* to the model (Haiku mechanical, Sonnet
  implementation, top tier for judgment) beat a fixed rule — a variant worth an
  option. AVOID — literal model names in the skill layer; and note the foot-gun
  that `CLAUDE_CODE_SUBAGENT_MODEL` silently overrides all per-role routing. The
  cost story is real: routing a top-tier reviewer over the 44/86 no-behavior PRs
  (see `ceremony-overhead`) burned ~half of review spend on process PRs.
