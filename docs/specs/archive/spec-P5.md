# Spec: P5 — /implement as milestone orchestrator; /plan emits milestone-level depends-on

> Created: 2026-06-16

Turn `/loopkit:implement` from a flat issue-consumer that claims issues into a
milestone orchestrator: pointed at one milestone, it plans the issue dependency
graph and fans out in-session subagents along the unblocked frontier, with no
claiming. `/loopkit:plan` starts emitting milestone-level depends-on so the human
can run independent milestones as parallel orchestrators.

## Outcome

- [ ] `/loopkit:implement <milestone>` orchestrates one milestone: it reads the
      milestone's issues, builds the dependency graph from the `Depends on:`
      lines, and dispatches the unblocked frontier.
- [ ] The orchestrator runs in waves: it dispatches the current unblocked
      frontier as a parallel batch of in-session subagents (each: worktree ->
      implement -> Verify -> review -> merge), awaits the batch, re-reads GitHub
      issue state, and recomputes the next frontier, until the milestone is done.
      A parked subagent issue is excluded with its dependents; the orchestrator
      finishes the rest and reports parked issues instead of running QA.
- [ ] No claiming: the orchestrator is the sole dispatcher of its milestone's
      issues; the `In Progress` + assignee race-prevention claim is removed.
- [ ] `/loopkit:plan` records a milestone-level depends-on (which milestones a new
      milestone depends on) in the milestone description.
- [ ] The workflow template documents the orchestrator model, milestone-level
      depends-on, and the no-claiming rule.

## Scope

### In scope

- `skills/implement/SKILL.md` — the orchestrator model: milestone targeting,
  build the DAG, fan-out along the frontier, frontier recomputation, remove the
  claim mechanism. Preserve P3's `track:adhoc` fast-lane and living-spec QA.
- `skills/plan/SKILL.md` — emit a milestone-level depends-on line in the
  milestone description (step 6).
- `skills/inception/templates/workflow.md` — document the orchestrator model,
  milestone-level depends-on, and no-claiming.

### Out of scope

- Clarification-belongs-to-planning (P6).
- Parallel-implementer claim arbitration — explicitly NOT needed (ownership
  replaces it).

## Constraints

- Constitution: "Hierarchical orchestration, not claiming. `/implement`
  orchestrates exactly one milestone ... fans out in-session subagents/agent-teams
  along the unblocked frontier ... Ownership replaces claiming at both levels."
  Reference, do not restate.
- Builds on P3: the orchestrator must keep the `track:adhoc` fast-lane and the
  living-spec milestone QA behavior intact.
- Subscription-auth / no-headless: subagents run in-session (Agent tool), never
  `claude -p` or a detached process.

## Human prerequisites

- none

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| The orchestrator fans out via the in-session Agent tool (one subagent per frontier issue); agent-teams is an optional enhancement where available | the Agent tool is the portable, subscription-auth baseline | 2026-06-16 |
| One subagent implements exactly one issue end-to-end (worktree -> merge) | keeps the maker/checker split and worktree isolation per issue | 2026-06-16 |
| No claiming at all — ownership replaces it: the orchestrator owns its milestone; parallel milestones run as separate orchestrators chosen via milestone-level depends-on | constitution; GitHub labels are not atomic, and ownership sidesteps the need | 2026-06-16 |
| Milestone-level depends-on is recorded as a parseable `Depends on milestone: #<n>` line in the milestone description | a fixed token plan writes and implement/humans read; avoids drift | 2026-06-16 |
| The orchestrator runs in waves: dispatch the current unblocked frontier as a parallel batch of in-session subagents, await the batch, re-read GitHub issue state, recompute the next frontier; repeat until no open issues | the in-session Agent tool returns per subagent; wave-based is the simplest correct coordination (rolling dispatch is a later optimization) | 2026-06-16 |
| When a subagent parks its issue (`blocked:human`), the orchestrator excludes that issue and its dependents, finishes the rest, and reports the parked issues instead of running milestone-QA | preserves "park, don't die"; a milestone with parked issues is not complete | 2026-06-16 |
| Single-orchestrator-per-milestone is a human-attended convention, not a GitHub lock | the attended model means the human starts one orchestrator per milestone; the constitution forbids claim arbitration of any kind | 2026-06-16 |
| This phase runs after P4 | both edit `plan/SKILL.md` and `implement/SKILL.md`; serialize | 2026-06-16 |

## Tracking

- Milestone: P5 (created once this spec is accepted)
- Issues: created from this spec. The first issue carries
  `Depends on: #<P4's last issue>` (filled at issue-creation time, once P4's
  issues exist) — serialize after P4 (shared skill files).

## Verification

- [ ] `implement/SKILL.md` describes milestone targeting, building the DAG,
      fan-out along the frontier, and frontier recomputation.
- [ ] `implement/SKILL.md` no longer claims issues (`In Progress` + assignee for
      race-prevention is gone); ownership is stated instead.
- [ ] `implement/SKILL.md` still handles `track:adhoc` (P3) and living-spec QA
      (P3) — no regression.
- [ ] `plan/SKILL.md` step 6 writes a milestone-level depends-on line in the
      milestone description.
- [ ] The workflow template documents the orchestrator model, milestone-level
      depends-on (`Depends on milestone: #<n>`), and no-claiming.
- [ ] Behavioral (milestone-QA script): after a subagent merges and closes an
      issue, the orchestrator recomputes the frontier and dispatches the
      newly-unblocked issue(s).
- [ ] Behavioral: a parked (`blocked:human`) issue does not stall the
      orchestrator — the rest of the frontier completes and the parked issue is
      reported.
- [ ] Behavioral: a `track:adhoc` issue is reachable and drives to a merged PR
      under the new entry model (P3 fast-lane not regressed).

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Two subagents touch the same file on the same frontier | the dependency graph serializes same-file issues; the orchestrator only dispatches a truly unblocked frontier |
| The orchestrator change regresses P3's fast-lane / living-spec behavior | an explicit Verification item checks both are preserved |

## Decision log

- 2026-06-16: Orchestrator fans out via the in-session Agent tool, one subagent
  per issue, no claiming (from the constitution + architecture).
- 2026-06-17: Implementation review hardened the wave loop with three
  refinements: (1) the loop runs **while the unblocked frontier is non-empty**
  (precise, terminating condition) rather than "until no open issues remain";
  (2) the orchestrator **fast-forwards its local base between waves**
  (`git pull --ff-only` after awaiting a batch) so a wave-N issue that
  `Depends on:` a wave-(N-1) merge sees it in its worktree base — a real
  dependency-chain correctness fix; (3) the orchestrator sets dispatched issues
  to `In Progress` for board visibility (explicitly not a lock) now that the
  claim step is gone. The `Depends on milestone:` token was also documented in
  `docs/workflow.md` (not just the template) for dogfood consistency.
