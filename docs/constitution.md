# Constitution

> Normative and binding. Every principle must be verifiable and specific.
> Keep to ~1 page; this file is permanently loaded via CLAUDE.md. No status
> marker — foundation docs carry none.

## Tech stack

| Area | Choice | Rationale |
| ---- | ------ | --------- |
| Skill format | Markdown `SKILL.md` + YAML frontmatter | Claude Code's native skill format; no build step |
| Templates | Markdown + one `settings.json` | copied verbatim into target projects by inception |
| Plugin manifest | `.claude-plugin/plugin.json` + `marketplace.json` | Claude Code plugin/marketplace spec |
| Runtime | Claude Code + `gh` + `git` | the only execution substrate; no language runtime, no package manager |
| State | GitHub issues / milestones / Project board | the single durable state machine — no DB, no local state files |
| Design contract | `docs/design.md` (the `docs/workflow.md` sibling) | per-project design medium + rules; skills read it, hardcode no tool |

## Architecture principles

Each one is checkable in review.

- **GitHub-only durable state.** No skill writes work state to a local DB, JSON
  file, or daemon. Issues/milestones/board/PRs are the durable state;
  within-milestone subagent coordination is in-session and ephemeral, never a
  second source of truth. (grep-verifiable.)
- **Subscription auth only.** No skill invokes `claude -p`,
  `--dangerously-skip-permissions`, an API key, or a scheduler/cron. Subagents
  run in-session, not headless. (grep-verifiable.)
- **Specs carry no lifecycle state.** No `DRAFT`/`READY` header; "accepted" =
  merged on the default branch with a milestone and issues.
- **The roadmap carries no current-focus or status marker.** The human passes
  scope to the loops explicitly.
- **Proportional ceremony.** Three tracks, each change uses exactly one:
  full-spec (a feature), a living-spec milestone (an ongoing theme), a
  `track:adhoc` fast-lane (a bug/QoL change — no spec, no milestone).
- **Optional, tool-agnostic design phase.** Design runs inside the planning
  cycle and is optional, triggered when a change has UI surface OR when a
  visualisation (a flow, a state machine, an architecture, a mental model) would
  materially clarify a decision — a change needing neither carries no design
  artifact (proportional ceremony). It may be sketched exploratorily during the
  roadmap/plan sparring, but the durable, reviewed artifact is produced in the
  planning cycle and reviewed AT the spec-acceptance gate — sparring is a dialog,
  not a gate. The mechanism reads the project's `docs/design.md` contract (the
  `docs/workflow.md` sibling) and hardcodes no tool or medium (grep-verifiable).
  Its durable form is a committed file that renders in the project's review
  surface — a Mermaid diagram (GitHub-native), a committed SVG, an exported
  image, or a tokens file — chosen per project in `docs/design.md` and referenced
  from the spec or issue; an external-tool URL (a Figma/v0 share link) is NOT
  durable state — the tool is an editor, never a second source of truth.
  (grep-verifiable.)
- **Dependency representation at two levels.** Milestones carry depends-on info;
  issues carry `Depends on: #N`. The unblocked frontier (everything with no open
  dependency) is by definition the parallelizable set. Representation is the
  prerequisite for parallelization, not merely ordering. (Evidence:
  `docs/prior-art.md` — CCPM, Taskmaster, Osmani.)
- **Hierarchical orchestration, not claiming.** `/implement` orchestrates
  exactly one milestone: it plans the issue dependency chain and fans out
  in-session subagents/agent-teams along the unblocked frontier. As the sole
  dispatcher it needs no claiming. Milestone-level parallelism = a second
  orchestrator on an independent milestone. Ownership replaces claiming at both
  levels.
- **Reuse native primitives.** Skills wrap `/loop`, `/plan`, `/batch`, and
  worktrees rather than reimplementing them.
- **Bounded retry.** The identical failure twice in a row stops the loop with a
  resumable report; loops never grind.
- **Prior art is the substrate every artifact derives from — consulted, linked,
  read to source when it earns it.** Prior art (who has done this well or badly)
  is the ground loopkit's artifacts — vision, constitution, architecture, each
  spec, and the implementation — derive from, not one input among many. `/plan`
  checks `docs/prior-art.md` per spec and links the relevant entries so
  `/implement` can reach them. When the distilled verdict does not settle a
  decision, `/plan` and `/implement` are encouraged to check out the referenced
  source — a public repo, read-only, into an ephemeral location outside this
  repo — and analyse the specific implementation. The checkout is a transient
  read, discarded after: never retained state, never copied in; the spec's
  recorded decision is the durable output.
- **Clarification belongs to planning.** The implementer never asks the human.
  The spec — informed by vision, constitution, and prior art — must leave zero
  open questions for implementation. A fork that reaches an implementer is a
  planning defect: the implementer escalates it back to the planner (reopen the
  spec), which resolves it at the spec-acceptance gate. Corollary: foundation-doc
  edits (vision/constitution/architecture) belong to planning too — authored in a
  `/loopkit:plan` spec PR and ratified at the spec-acceptance gate, never in
  `/loopkit:implement`, never left as a dangling draft.
- **Exactly two human gates.** Spec-acceptance and milestone-QA; everything else
  is autonomous. When a change carries a design (UI or a decision-clarifying
  visualisation), that design — delivered or produced during planning — is
  reviewed AT the spec-acceptance gate as part of the spec package — NOT a third
  gate.

## Conventions

- Skills in `skills/<name>/SKILL.md`; templates in `skills/<name>/templates/`.
- Foundation docs in `docs/`; specs in `docs/specs/`, archived to
  `docs/specs/archive/`.
- All artifacts, code, comments, and commits in English. Conventional Commits
  (`feat`/`fix`/`chore`/`docs`/`refactor`).
- Skill prose is terse, imperative, and gate-marked. No duplication across the
  five skills — project specifics live in `docs/workflow.md` (or `docs/design.md`
  for the design skill); shared toolkit method lives in `skills/shared/`.
- One character per foundation artifact (vision normative, constitution binding,
  prior-art descriptive, architecture structural) — no content duplicated across
  them.

## Quality gates

- The Verify command (defined in `docs/workflow.md`) runs green; in-session
  agent review returns `APPROVE`.
- No diff introduces local state, an API key, a headless flag, or a scheduler.
- Templates contain no project-specific values; placeholders stay intact.

## Don'ts

- No local DB/JSON/daemon as a second source of truth.
- No headless (`claude -p`), `--dangerously-skip-permissions`, API key, or cron.
- No `DRAFT`/`READY` in specs; no current-focus/status marker in the roadmap.
- No claim arbitration of any kind — parallelism comes from orchestrator
  ownership.
- No full-spec ceremony for a one-line change (use the fast-lane).
- No external-tool URL (Figma/v0 share link) as the durable design form — a
  committed file only.
- No spec-as-source / bidirectional code<->spec generation.
- No reimplementing a native primitive that can be reused.
- No content duplicated across foundation artifacts.

## Tech debt (brownfield only)

None. The brownfield deviations the P1–P6 roadmap tracked here — spec lifecycle
state, roadmap current-focus, the missing ad-hoc/living-spec model, unlinked
prior art, the flat claiming implementer, and dead-end fork parking — are all
resolved: each phase's spec is merged and its milestone closed (history in
`docs/specs/archive/`). The skills now match this constitution, with no
remaining `(Target)` caveats.
