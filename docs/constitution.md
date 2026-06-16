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
  merged on the default branch with a milestone and issues. (Target — see Tech
  debt.)
- **The roadmap carries no current-focus or status marker.** The human passes
  scope to the loops explicitly. (Target — see Tech debt.)
- **Proportional ceremony.** Three tracks, each change uses exactly one:
  full-spec (a feature), a living-spec milestone (an ongoing theme), a
  `track:adhoc` fast-lane (a bug/QoL change — no spec, no milestone).
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
  levels. (Target — see Tech debt.)
- **Reuse native primitives.** Skills wrap `/loop`, `/plan`, `/batch`, and
  worktrees rather than reimplementing them.
- **Bounded retry.** The identical failure twice in a row stops the loop with a
  resumable report; loops never grind.
- **Prior art is consulted and linked.** `/plan` checks `docs/prior-art.md` per
  spec and links the relevant entries so `/implement` can reach them. (Target —
  P4.)
- **Clarification belongs to planning.** The implementer never asks the human.
  The spec — informed by vision, constitution, and prior art — must leave zero
  open questions for implementation. A fork that reaches an implementer is a
  planning defect: the implementer escalates it back to the planner (reopen the
  spec), which resolves it at the spec-acceptance gate. (Target — P6.)
- **Exactly two human gates.** Spec-acceptance and milestone-QA; everything else
  is autonomous.

## Conventions

- Skills in `skills/<name>/SKILL.md`; templates in `skills/<name>/templates/`.
- Foundation docs in `docs/`; specs in `docs/specs/`, archived to
  `docs/specs/archive/`.
- All artifacts, code, comments, and commits in English. Conventional Commits
  (`feat`/`fix`/`chore`/`docs`/`refactor`).
- Skill prose is terse, imperative, and gate-marked. No duplication across the
  three skills — project specifics live in `docs/workflow.md`.
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
- No spec-as-source / bidirectional code<->spec generation.
- No reimplementing a native primitive that can be reused.
- No content duplicated across foundation artifacts.

## Tech debt (brownfield only)

| Deviation | Where | Plan |
| --------- | ----- | ---- |
| Specs carry `DRAFT`/`READY`; `/plan` flips it, `/implement` guards on it | plan/implement SKILL, spec-template, workflow | P1 |
| Roadmap has a current-focus pointer; `/plan` advances it | roadmap template, plan SKILL steps 1+7 | P2 |
| No ad-hoc / living-spec model | all three skills, workflow | P3 |
| Prior art not consulted/linked by `/plan`; templates lack the challenge lens | plan SKILL, prior-art/spec/vision templates | P4 (inception challenge lens already bootstrapped) |
| `/implement` is a flat consumer that claims issues (In Progress + assignee), not a milestone orchestrator; `/plan` emits no milestone-level depends-on | implement SKILL, plan SKILL, workflow | P5 |
| `/implement` parks forks to `blocked:human` as a dead-end; `/plan` has no explicit step to anticipate implementer questions | implement SKILL, plan SKILL | P6 |
