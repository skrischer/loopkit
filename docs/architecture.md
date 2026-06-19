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
| `skills/design/` | The optional `/loopkit:design` skill, planning-time: reads `docs/design.md`, delivers/produces a design, hands off a committed file referenced by the spec |
| `skills/*/templates/` | Pure artifact blueprints, filled into target projects by inception |
| `.claude-plugin/` | `plugin.json` + `marketplace.json` |
| `docs/` (target project) | vision/constitution/prior-art/architecture + `roadmap.md` + `workflow.md` + `design.md` |
| GitHub (issues/milestones/board/PRs) | the single durable state machine |

## Boundaries

- Skills never hardcode project specifics — they read `docs/workflow.md`
  (inception produces it; plan/implement consume it).
- The three skills do not know each other's internals — handoff is only through
  GitHub state and `docs/` artifacts.
- Foundation docs keep strict character separation — no duplicated content.
- Orchestrator <-> subagents is in-session and ephemeral; orchestrator <->
  orchestrator is only through GitHub (independent milestones, no shared state).
- Worktrees are isolated — no skill reaches into another's.

## Key flows

1. **Inception (Phase 0):** pitch / `--here` -> goal -> prior-art challenge ->
   vision/constitution/architecture -> roadmap -> workflow + board + settings +
   CLAUDE.md -> loop-ready.
2. **Plan cycle (producer):** roadmap phase (human-pointed) -> sort decisions
   (+ prior-art) -> spec (with prior-art links) -> [if UI surface: `/loopkit:design`
   delivers/produces a design per `docs/design.md`, committed as a file and
   referenced by the spec] -> in-session review -> **spec-acceptance gate (human,
   reviews the design too)** -> merge -> milestone + issues with two-level
   `depends-on` -> roadmap links.
3. **Implement cycle (orchestrator):** human points it at one milestone -> read
   spec + issues -> compute the issue DAG -> fan out in-session subagents along
   the frontier (each: worktree -> implement -> Verify -> review -> merge) ->
   board mirrors status -> **milestone-QA gate (human)** -> archive spec + close
   milestone.
4. **Milestone parallelization:** a second orchestrator on an independent
   milestone (chosen via milestone-level `depends-on`); sync only through GitHub.
5. **Ad-hoc fast-lane:** a bug/QoL change -> `track:adhoc` issue (no
   spec/milestone) -> implement directly -> PR -> merge.

## Where new code goes

- The inception dialog / a new foundation artifact -> `skills/inception/`
  (+ a template).
- How specs/milestones/issues are produced -> `skills/plan/`.
- How a milestone is executed/orchestrated -> `skills/implement/`.
- Per-project parameters (commands, board, naming) -> the `workflow.md` template
  (NOT the skill — skills read it).
- Shared cross-skill behavior -> the `workflow.md` contract, or the constitution
  if binding; never a single skill.
- Permission/autonomy -> the `settings.json` template.
