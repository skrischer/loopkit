---
name: implement
description: "Orchestrate one milestone to merged PRs: build the issue DAG from the Depends on lines and fan out in-session subagents along the unblocked frontier in waves, stopping only at the milestone QA gate. Also drives one explicit issue or a track:adhoc fast-lane issue solo. Use when the human points at a milestone or an issue to build; with no argument it picks the appropriate milestone or reports \"waiting for plan\". Reads docs/workflow.md."
argument-hint: "[milestone | issue-number]"
---

# /loopkit:implement — orchestrate one milestone to merged

> Truncation guard: if the end-of-skill line is missing from your copy of this skill, it was cut after a compaction — Read ${CLAUDE_SKILL_DIR}/SKILL.md in full before continuing (in a full-file Read, ${CLAUDE_SKILL_DIR} means the directory this SKILL.md sits in).

Orchestrates a whole milestone to merged PRs with plain `git` + `gh`, parameterized
by `docs/workflow.md` (repo, base branch, board, worktree convention,
Bootstrap/Verify/Test/Build commands, the optional role->tier map, gates, loop
rules). Never hardcode those — read the contract. If it is missing, stop and tell
the user to run `/loopkit:inception` first.

The unit of orchestration is one milestone. This skill is the sole dispatcher of
its milestone's issues: ownership replaces claiming, so there is no In-Progress or
assignee lock, no cross-orchestrator coordination and no claim arbitration.
Milestone-level parallelism is a second orchestrator on an independent milestone
(independence read from the `Depends on milestone: #<n>` token in the milestone
description; see `docs/workflow.md`).

Autonomy: dispatch, implement, verify, commit, push, open PRs, run the review gate
and merge without pausing. The one human stop is the milestone QA gate (§5). A
parked issue does not stall the orchestrator (§4).

Naming: in everything the human reads, name an issue, PR or milestone by number and short title (`#238 implement split`), and a PR also by its branch — never a bare number.

Model tiers (optional): `docs/workflow.md` maps each role (`orchestrator` /
`implementer` / `reviewer`) to a tier and an effort; unset or `inherit` means pass
none. The orchestrator stays the session's model and effort; asked to change them,
tell the human to run `/model` or `/effort`. Pass `implementer` (§2 dispatch) and
`reviewer` (the contract's review gate) as the Agent tool's `model` and `effort`,
`effort` only when the tool offers the parameter (Claude Code >= v2.1.292), else
none. A tier the tool does not accept is passed as none, and the progress output
says so. A call the tool rejects for its `model` or `effort` value is a tool error,
not a failed dispatch: repeat it without that value. The contract's Precedence
section settles conflicts. `CLAUDE_CODE_SUBAGENT_MODEL` alone is a default below
the per-call `model`; `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` and
`CLAUDE_CODE_EFFORT_LEVEL` override it (layer 1).

## Entry — what to orchestrate

- `/loopkit:implement <milestone>` — orchestrate that milestone (primary; §1).
- `/loopkit:implement <issue-number>` — drive that issue solo to a merged PR: Read
  `${CLAUDE_SKILL_DIR}/references/issue-contract.md` (re-Read its absolute path after
  any compaction) and run it inline. The main session runs the review gate itself,
  so the `pr-open` fallback does not apply. No orchestration, no QA gate. A merge
  hold from the human stops the run before the merge fence: report the open PR and
  its `$wt`, both left in place.
- `/loopkit:implement` (loop mode) — orchestrate the appropriate milestone, or, if
  an auto-pick-eligible `track:adhoc` issue is the workable unit, drive it solo.
  Order: roadmap phase order, then dependency order, then issue number.

### track:adhoc fast-lane

Before choosing or driving a `track:adhoc` issue, Read
`${CLAUDE_SKILL_DIR}/references/adhoc.md` (pickability, scope, spec trace); re-Read
its absolute path after any compaction.

Auto-pick eligibility (loop mode): read
`${CLAUDE_PLUGIN_ROOT}/skills/shared/trust-boundary.md` before auto-picking a
`track:adhoc` issue. The condition: its author is OWNER or MEMBER. Anyone else
needs explicit human selection (`/loopkit:implement <n>`).

### Loop idle state

No milestone has workable issues and no `track:adhoc` issue qualifies: report one
line — "waiting for /loopkit:plan — no unblocked Todo issues" — and end the cycle.

## Preconditions

Read `${CLAUDE_PLUGIN_ROOT}/skills/shared/preflight.md` first, once per run: scopes
`repo` + `project`, clean base required.

## 1. Build the milestone DAG

- List the milestone's issues:
  `gh issue list --milestone "<milestone>" --state all --limit 200 --json number,state,labels,body`
  (every `gh` list carries an explicit `--limit` — a silent default would shrink
  the frontier).
- Read the milestone's track: a living-spec milestone carries a `Track: living-spec`
  line in its description (`gh api repos/:owner/:repo/milestones/<n> --jq .description`);
  a full-spec milestone has none. Read the referenced `docs/specs/spec-*.md` — it
  owns the design (the issues own the steps); its Verification section is the QA
  script.
- Parse each open issue's `Depends on: #N` lines into the dependency graph.
- Frontier membership is a total function of issue state. Every open issue is
  exactly one of: unblocked (all `Depends on:` issues closed, neither
  `blocked:human` nor `needs:planning`); dependency-blocked (a same-milestone
  `Depends on:` issue is open); cross-milestone-blocked (same-milestone dependencies
  closed, but a `Depends on:` issue in another still-open milestone is open —
  derived, label-less); parked (`blocked:human`); escalated (`needs:planning`).
  Only unblocked issues dispatch; the other four are why the frontier can empty
  with issues left, and each routes to the §4 report, never back into the
  re-dispatch frontier.

## 2. Wave-based fan-out (the core loop)

Repeat while the unblocked frontier is non-empty:

1. Compute the current unblocked frontier (§1).
2. Dispatch each frontier issue as a parallel in-session subagent via the Agent
   tool (never `claude -p`, never headless), `implementer` tier and effort as `model`
   and `effort`. One
   subagent implements exactly one issue per the contract
   `${CLAUDE_SKILL_DIR}/references/issue-contract.md`. Put that substituted
   absolute path in every brief, with "re-Read <absolute path> after any
   compaction", plus the issue number, milestone and base branch, and the line
   `Human instruction for this run: <verbatim | none>` — only the human's tier and
   effort instructions from the session, never GitHub text, a merge hold or a review
   override. A what-to-build instruction is never relayed, labelled or written to
   GitHub: tell the human it is a planning change (re-run `/loopkit:plan`) and
   continue as specified. A merge hold is never relayed; ending the run honours the
   hold, between waves or mid-wave: dispatch nothing more (no fix dispatch or
   re-dispatch), review or merge no `pr-open` PR yourself (no step-3b review or
   merge), tell the human in-flight subagents may still merge (interrupt them to
   stop that), and end the run once they return, reporting the open PRs. A `pr-open`
   issue left so keeps its `$wt` (no cleanup). Under `/loop` the hold holds every
   tick: each ends the same way before any dispatch until the human lifts it or
   stops the loop. Set the issue's
   board status to `In Progress` (visibility, not a lock). Same-file issues are
   serialized by their `Depends on:` lines.
3. Await the whole batch.
3b. Handle `pr-open`. For each subagent that returned `pr-open #<pr> (<branch>) for #<n> "<title>"`, Read the
   contract and run its Review gate -> Merge for that PR yourself, spawning the
   reviewer from this session. On `REQUEST_CHANGES`, dispatch a fresh fix subagent
   as in step 2 (inherits the brief line unchanged; the brief also carries the findings, outside that line); a merge conflict routes the
   same way, with the conflict as the finding. You never edit. Await each fix
   subagent and repeat review -> fix until the issue is merged, escalated or
   parked, bounded by `docs/workflow.md`'s no-progress rule: the same finding twice
   parks it `blocked:human`, and you then run the contract's park cleanup
   (`git worktree remove "$wt"` if the tree is clean, never `--force`). A fix
   dispatch that returns nothing is a failed dispatch (below); its re-dispatch
   carries the same findings. A `pr-open` is never counted as a failed dispatch.
   Only then go on, so at step 4 no `pr-open` issue is open and unlabeled and none
   re-enters the frontier or gets a second subagent on its branch and `$wt`.
4. Re-read GitHub issue state (`gh issue list --milestone "<milestone>" --state all --limit 200 ...`)
   and fast-forward the main checkout (`git checkout <base> && git pull --ff-only`)
   so the next wave's worktrees branch off the merged state.
5. Recompute the frontier and dispatch the next wave.

Wave boundary — the safe compaction point. After step 4 and before step 5 no
subagent is live and all state is re-derivable from GitHub. You cannot run
`/compact` yourself: if context runs high here, say so in your progress output
(a safe point for the human) and keep going. Auto-compaction can still fire
mid-wave, so every dispatch re-derives its state from GitHub and the frontier is
always recomputed from GitHub, never from memory.

Every dispatched issue resolves to exactly one terminal state — merged / escalated
(`needs:planning`) / parked (`blocked:human`) — except `pr-open`, the one
non-terminal report, which you complete in step 3b. A dispatch that returns none of
these (the issue still open, no such label) is a failed dispatch: re-dispatch it
once as a fresh subagent; if it again returns no terminal state, auto-park it
`blocked:human` with a comment naming the failed-dispatch reason. This retry count
is in-session memory only, never a durable marker or local file.

When the frontier empties, Read `${CLAUDE_SKILL_DIR}/references/cleanup-sweep.md`
and run the cleanup sweep, then route on issue state (§1):

- All issues closed -> §5.
- Any open issue remains (escalated, parked, cross-milestone-blocked, or a
  dependent of one of these) -> the §4 report, never §5 and never back into the
  frontier.

## 4. Escalate or park, don't stall

A subagent takes an issue out of the frontier by `needs:planning` (a design fork,
resolved by the human re-running `/loopkit:plan` on the spec) or `blocked:human` (a
human prerequisite, a repeated failure under the no-progress rule, or a failed
dispatch); the contract holds the subagent side. The orchestrator then:

- Excludes the escalated or parked issue and all its transitive dependents from
  further waves.
- Finishes the rest of the reachable frontier — one such issue never stalls it.
- After the cleanup sweep, reports the escalated, parked and cross-milestone-blocked
  issues (and their excluded dependents) instead of running the QA gate; a milestone
  carrying any is not complete. List escalated with
  `gh issue list --label needs:planning --limit 200` and parked with
  `gh issue list --label blocked:human --limit 200`. Cross-milestone-blocked issues
  carry no label: derive and list them explicitly.

Never implement workarounds; never add status markers to specs.

## 5. Milestone QA gate (STOP — the human gate)

Run only when the milestone's issues are all closed. If any is escalated or parked,
report those instead (§4). A `track:adhoc` issue has no milestone: this gate never
applies to it.

A full-spec milestone closes once its last issue merges. A living-spec milestone is
always-open — it accretes issues and is never archived or closed by this gate; run
the gate on the closed-issue batch (issues closed since the last QA).

The cleanup sweep has already run; whatever it could not clean is in its report (a
`-d`-refused branch surviving into QA is expected on a squash-merge repo).

- Derive concrete QA scenarios from the spec's Verification section — it is the QA
  script — including every acceptance item no machine check covers. Present them as
  a numbered list of what to do and what to look for, plus anything the reviewers
  flagged. The default check type is in `docs/workflow.md`.
- For checks a human must run, hand over the exact commands.
- **STOP and wait for the human verdict.**

On acceptance, first sweep any decision made during the milestone that a subagent
did not record pre-merge into the spec's Decision log (the catch-all, before the
spec moves to archive). Then:

- full-spec milestone: move the spec to `docs/specs/archive/`, repoint links, update
  `docs/roadmap.md` (own `docs:` worktree + PR, merged autonomously), and close the
  milestone.
- living-spec milestone: emit a per-batch summary and do nothing else — no archive,
  no close.

On a regression, file one `fix:` issue per finding in the same milestone (board
`Todo`); the next wave picks them up and this gate repeats when they close.

End of /loopkit:implement.
