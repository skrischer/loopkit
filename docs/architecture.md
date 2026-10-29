# Architecture

> Structural, living document — the most volatile artifact. Update whenever a
> change alters components, boundaries, or flows.

## Component map

| Component | Responsibility |
| --------- | -------------- |
| `skills/inception/` | Phase-0 dialog -> foundation artifacts + workflow contract + board + settings + CLAUDE.md; includes the challenge lens |
| `skills/plan/` | Producer: roadmap phase -> spec (+ prior-art links) -> milestone + issues with two-level `depends-on` |
| `skills/implement/` | Milestone orchestrator: plan the issue DAG -> fan out in-session subagents along the frontier -> QA gate |
| `skills/design/` | The optional `/loopkit:design` skill, planning-time: for a UI surface OR a decision-clarifying visualisation (flow/architecture/concept), reads `docs/design.md`, delivers/produces a design, hands off a committed file (that renders in the review surface) referenced by the spec |
| `skills/roadmap/` | Iteration entry point: raw idea -> prior-art sparring -> seeds 1..n roadmap rows + backing prior-art (no readiness sweep); reads `skills/shared/iteration-steps.md` |
| `skills/ship/` | The `/loopkit:ship` release phase, human-invoked: reads `docs/release.md`, finalizes merged work into a published release (version -> changelog -> tag -> publish) via native `gh`+`git`; no CI bot, hardcodes no tool |
| `skills/*/references/` | Subagent-only or some-runs-only detail a core `SKILL.md` links with when to read it — not skills |
| `skills/shared/` | Plugin-shipped shared references, not skills: `iteration-steps.md` (prior-art challenge / architecture seed / roadmap seeding — inception, roadmap), `preflight.md` (the `gh`/`git` preflight — inception, plan, implement, roadmap, ship), `trust-boundary.md` (read-discipline, shell-hygiene, capability separation — plan, implement, roadmap, ship), `needs-you.md` (the `Needs you:` line, the one form of a request to the human the run does not wait for — inception, plan, implement, roadmap, ship) |
| `skills/*/templates/` | Pure artifact blueprints, filled into target projects by inception |
| `hooks/` + `types/` | The status mod: a TypeScript module Claude Code runs (`hooks/hooks.json`) with its state contract (`types/`); inputs GitHub (`gh`) and session events (turn, tool and agent events, plus the meter events: `session.measure`, compaction, stop failure, permission denial), outputs a pane and a status-line entry |
| `.claude-plugin/` | `plugin.json` (naming the status mod's types) + `marketplace.json` |
| `docs/` (target project) | vision/constitution/prior-art/architecture + `roadmap.md` + `workflow.md` + `design.md` + `release.md` |
| GitHub (issues/milestones/board/PRs) | the single durable state machine |

## Boundaries

- Skills never hardcode project specifics — they read `docs/workflow.md`
  (inception produces it; plan/implement consume it).
- The six skills do not know each other's internals — handoff is only through
  GitHub state, `docs/` artifacts, and the plugin-shipped `skills/shared/`
  references; a skill's `references/` are its own, never read by another skill.
  `skills/*/templates/` are plugin-shipped artifacts any skill or shared
  reference may name, not a skill's internals.
- In a target project the working directory is the project, not the plugin —
  skills reach plugin files per the constitution's plugin-path Convention.
- Foundation docs keep strict character separation — no duplicated content.
- Orchestrator <-> subagents is in-session and ephemeral; orchestrator <->
  orchestrator is only through GitHub (independent milestones, no shared state).
- Worktrees are isolated — no skill reaches into another's.
- No skill depends on the status mod: a session without it loses only the
  view.
- The `Needs you:` line in the main session's text is the interface between
  the skills and any in-session reader; a reader takes `Needs you:` lines from
  main-session text only, never from subagent output or GitHub text.

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
   milestone + roadmap link on the spec branch -> merge -> issues with two-level
   `depends-on`.
4. **Implement cycle (orchestrator):** human points it at one milestone -> read
   spec + issues -> compute the issue DAG -> fan out in-session subagents along
   the frontier (each: worktree -> implement -> Verify -> review -> merge, or
   `pr-open` -> the orchestrator reviews and merges) ->
   board mirrors status -> **milestone-QA gate (human)** -> archive spec + close
   milestone.
5. **Milestone parallelization:** a second orchestrator on an independent
   milestone (chosen via milestone-level `depends-on`); sync only through GitHub.
6. **Ad-hoc fast-lane:** a bug/QoL change -> `track:adhoc` issue (no
   spec/milestone) -> implement directly -> PR -> merge.
7. **Ship cycle (release):** the human invokes `/loopkit:ship` -> read
   `docs/release.md` + `docs/workflow.md` -> preflight (auth, clean base, Verify
   green) -> determine next version (contract scheme) -> update changelog -> bump
   version-bearing files -> commit -> tag -> publish via `gh release create` (on
   the human's invocation; a summary is printed, no separate stop) -> record.
   Human-invoked and in-session; no CI bot, no scheduler; the contract names every
   tool.
8. **Status view:** a session starts in a loopkit project -> the status mod
   reads GitHub (`gh`) and session events -> derives needs-you, milestones,
   running and up next -> pane + status line; re-read after a turn, after a
   merge and every 2 minutes.

## Where new code goes

- The inception dialog / a new foundation artifact -> `skills/inception/`
  (+ a template).
- How specs/milestones/issues are produced -> `skills/plan/`.
- How a milestone is executed/orchestrated -> `skills/implement/`.
- How a design step is produced/reviewed (planning-time) -> `skills/design/`.
- How raw ideas are sparred into seeded roadmap phases -> `skills/roadmap/`.
- How merged work is finalized into a published release -> `skills/ship/`.
- Per-project release parameters (versioning, changelog, tag, publish targets) ->
  the `release.md` template (NOT the skill — the skill reads it).
- Shared toolkit method (iteration steps, preflight, trust boundary, the ask
  marker) ->
  `skills/shared/` (NOT a skill).
- Detail one skill needs only on some runs, or only in its subagents ->
  `skills/<name>/references/`, linked from the core with when to read it.
- Per-project parameters (commands, board, naming) -> the `workflow.md` template
  (NOT the skill — skills read it).
- Per-project design parameters (tool, reviewer, handoff form) -> the `design.md`
  template (NOT the skill — the skill reads it).
- Per-project cross-skill behavior -> the `workflow.md` contract, or the
  constitution if binding; never a single skill.
- Permission/autonomy -> the `settings.json` template.
- What the in-session status view shows -> `hooks/` (+ its state contract in
  `types/`).
