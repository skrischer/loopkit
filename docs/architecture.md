# Architecture

> Structural, living document — the most volatile artifact. Update whenever a
> change alters components, boundaries, or flows.
>
> This describes the orchestrator model, which `/loopkit:implement` now
> implements (the P1–P6 brownfield roadmap is complete).

## Component map

| Component | Responsibility |
| --------- | -------------- |
| `skills/inception/` | Phase-0 dialog -> foundation artifacts + workflow contract + board + settings + CLAUDE.md; includes the challenge lens |
| `skills/plan/` | Producer: roadmap phase -> spec (+ prior-art links) -> milestone + issues with two-level `depends-on` |
| `skills/implement/` | Milestone orchestrator: plan the issue DAG -> fan out in-session subagents/agent-teams along the frontier -> QA gate |
| `skills/design/` | The optional `/loopkit:design` skill, planning-time: for a UI surface OR a decision-clarifying visualisation (flow/architecture/concept), reads `docs/design.md`, delivers/produces a design, hands off a committed file (that renders in the review surface) referenced by the spec |
| `skills/roadmap/` | Iteration entry point: raw idea -> prior-art sparring -> seeds 1..n roadmap rows + backing prior-art (no readiness sweep); reads `skills/shared/iteration-steps.md` |
| `skills/shared/` | Plugin-shipped shared reference (`iteration-steps.md`): the prior-art challenge / architecture-seed / roadmap-seeding steps inception and roadmap both read — not a skill |
| `skills/*/templates/` | Pure artifact blueprints, filled into target projects by inception |
| `.claude-plugin/` | `plugin.json` + `marketplace.json` |
| `docs/` (target project) | vision/constitution/prior-art/architecture + `roadmap.md` + `workflow.md` + `design.md` |
| GitHub (issues/milestones/board/PRs) | the single durable state machine |

## Boundaries

- Skills never hardcode project specifics — they read `docs/workflow.md`
  (inception produces it; plan/implement consume it).
- The five skills do not know each other's internals — handoff is only through
  GitHub state, `docs/` artifacts, and the plugin-shipped `skills/shared/`
  reference (inception and roadmap both read `skills/shared/iteration-steps.md`;
  neither reaches into the other).
- Foundation docs keep strict character separation — no duplicated content.
- Orchestrator <-> subagents is in-session and ephemeral; orchestrator <->
  orchestrator is only through GitHub (independent milestones, no shared state).
- Worktrees are isolated — no skill reaches into another's.

## Key flows

1. **Inception (Phase 0):** pitch / `--here` -> goal -> prior-art challenge ->
   vision/constitution/architecture -> roadmap -> workflow + board + settings +
   CLAUDE.md -> loop-ready.
2. **Roadmap iteration:** raw idea -> [per idea: research mode ASKED —
   websearch / deep / none] -> prior-art sparring (challenge + sharpen, per
   `skills/shared/iteration-steps.md`; an exploratory visualisation may sharpen a
   design-shaped idea here — no durable artifact, that is the plan cycle) -> seed
   1..n roadmap rows + backing prior-art; a foundation-doc impact is recorded onto
   the seeded phase (edited later in that phase's plan cycle), never here.
3. **Plan cycle (producer):** roadmap phase (human-pointed) -> sort decisions
   (+ prior-art) -> spec (with prior-art links) -> [if UI surface OR a
   decision-clarifying visualisation: `/loopkit:design` delivers/produces a design
   per `docs/design.md`, committed as a file and referenced by the spec] ->
   in-session review -> **spec-acceptance gate (human, reviews the design too)** ->
   merge -> milestone + issues with two-level `depends-on` -> roadmap links.
4. **Implement cycle (orchestrator):** human points it at one milestone -> read
   spec + issues -> compute the issue DAG -> fan out in-session subagents along
   the frontier (each: worktree -> implement -> Verify -> review -> merge) ->
   board mirrors status -> **milestone-QA gate (human)** -> archive spec + close
   milestone.
5. **Milestone parallelization:** a second orchestrator on an independent
   milestone (chosen via milestone-level `depends-on`); sync only through GitHub.
6. **Ad-hoc fast-lane:** a bug/QoL change -> `track:adhoc` issue (no
   spec/milestone) -> implement directly -> PR -> merge.

## Where new code goes

- The inception dialog / a new foundation artifact -> `skills/inception/`
  (+ a template).
- How specs/milestones/issues are produced -> `skills/plan/`.
- How a milestone is executed/orchestrated -> `skills/implement/`.
- How a design step is produced/reviewed (planning-time) -> `skills/design/`.
- How raw ideas are sparred into seeded roadmap phases -> `skills/roadmap/`.
- The shared prior-art / architecture-seed / roadmap-seeding steps (read by both
  inception and roadmap) -> `skills/shared/iteration-steps.md` (NOT a skill).
- Per-project parameters (commands, board, naming) -> the `workflow.md` template
  (NOT the skill — skills read it).
- Per-project design parameters (tool, reviewer, handoff form) -> the `design.md`
  template (NOT the skill — the skill reads it).
- Shared cross-skill behavior -> the `workflow.md` contract, or the constitution
  if binding; never a single skill.
- Permission/autonomy -> the `settings.json` template.
