# Spec: foundation-currency

> Created: 2026-10-28

Bring the always-loaded foundation docs up to Claude 5 practice: current facts
instead of history, honest native-primitive claims, a defined "no scheduler",
subagents as the one fan-out, and less weight loaded on every turn. This spec
carries no lifecycle state — acceptance is the spec merged on the default branch
with a milestone and issues, and all progress lives in the GitHub issues and
milestone. A completed spec is moved to `docs/specs/archive/`.

The foundation-doc edits — `docs/vision.md`, `docs/constitution.md`,
`docs/architecture.md`, `docs/prior-art.md` — ride this spec PR and are ratified
at its spec-acceptance gate (the constitution's clarification corollary). The
one non-foundation edit is the milestone's issue.

## Outcome

- [ ] The always-loaded docs (`CLAUDE.md`, vision, constitution),
      `docs/architecture.md` and `docs/workflow.md` carry no history narrative
      and no migration-relative phrasing. The constitution's Tech debt section
      reads `None.`.
- [ ] The constitution's native-primitive principle states what the skills
      reuse (in-session subagents, the human's `/loop`). It names the native gap
      each hand-rolled mechanism fills: worktrees, because resume re-attaches a
      deterministic branch, and the wave fan-out, because `/batch` reads no
      GitHub state. No foundation doc claims a wrap of `/plan`, `/batch` or
      worktrees.
- [ ] "Scheduler" is defined once, in the constitution: anything that starts a
      run without the human. The vision says "no external scheduler" and names
      `/loop` as the human's in-session repetition. The constitution's Don'ts
      forbid a skill scheduling itself, by tool name.
- [ ] No foundation doc presents agent teams as an option beside subagents.
- [ ] The always-loaded bytes (`CLAUDE.md` + vision + constitution) fall from
      19,062 to at most 17,773, and the constitution from 11,829 to at most
      10,430. No binding rule is lost: the principle, Don't and
      `(grep-verifiable.)` counts are unchanged (15, 10 and 6), and every
      removed sentence has a named home (Prior decisions).
- [ ] `docs/architecture.md` lists `/loopkit:roadmap` as a reader of
      `skills/shared/trust-boundary.md`.
- [ ] Each of the two prior-art entries this spec rests on carries a dated
      re-verification line, and the `/batch` OPEN note is settled.

## Scope

### In scope

- In this spec PR, ratified at the gate:
  - `docs/vision.md`: the Goal's "no schedulers", the subscription-auth
    success criterion, the in-scope orchestrator line ("subagents/agent-teams"),
    and the two Out lines (scheduled execution; reimplementing native
    primitives).
  - `docs/constitution.md`:
    - Subscription auth only: the scheduler definition.
    - Specs carry no lifecycle state: the mechanism sentence goes.
    - The design and release principle bodies are trimmed.
    - Hierarchical orchestration: "agent-teams" goes.
    - Reuse native primitives is reworded.
    - The prior-art principle: its restatement of the vision goes.
    - Exactly two human gates: its restatements go.
    - Don'ts: the self-scheduling line.
    - Tech debt becomes `None.`.
  - `docs/architecture.md`: the header's history sentence, "agent-teams" in the
    implement row, and the trust-boundary reader list.
  - `docs/prior-art.md`: two dated re-verification lines.
- Issue A (the milestone): `docs/workflow.md`'s header drops its history
  sentence.

### Out of scope

- `CLAUDE.md`'s Autonomy grant omitting `/loopkit:roadmap` (audit F32). It is
  routed to `permission-template-hardening`, together with the hooks (F25).
- The templates' residual "(constitution: …)" attributions. The audit rates
  them low risk, and they are human-filled.
- The trust-boundary, clarification and Conventions bodies (see Prior
  decisions).
- Adopting native `isolation: worktree`, `/batch` or plan mode (see Prior
  decisions).
- A Verify guard for the self-scheduling tool names. The Verification grep
  covers them today, with no skill naming one.
- The vision's "Why now" primitive list. It states what Claude Code ships, not
  what loopkit uses.
- `repositioning` and its vision/constitution edits (a separate row on the same
  files).

## Constraints

- One character per foundation artifact; no content duplicated across them
  (constitution, Conventions and Don'ts). A trim removes a restatement and
  keeps the binding rule.
- Foundation-doc edits belong to planning and are ratified at the
  spec-acceptance gate, never in `/loopkit:implement` (constitution,
  clarification corollary).
- Claude Code facts are as verified on 2026-10-28 against the first-party docs
  (`docs/prior-art.md` re-verification lines in this PR).

## Prior art

- [Foundation docs current for Claude 5 — lean always-loaded context, honest native-primitive claims (feature: foundation-currency)](../prior-art.md#foundation-docs-current-for-claude-5--lean-always-loaded-context-honest-native-primitive-claims-feature-foundation-currency)
  — the row's concern. It holds the lightweight-CLAUDE.md essay (ADOPT: binding
  rules and gotchas in always-loaded text, history in git) and the
  `/loop`/worktree/agent-teams facts behind every reword here.
- [Native Claude Code primitives — loopkit builds on these](../prior-art.md#native-claude-code-primitives--loopkit-builds-on-these)
  — the entry whose "loopkit reuses `/plan`, `/loop`, `/batch`" verdict is
  corrected by a dated line, which also settles its `/batch` OPEN note.
- [Foundation-doc context budget (feature: foundation-dedup)](../prior-art.md#foundation-doc-context-budget-feature-foundation-dedup)
  — the precedent for removing cross-artifact restatements from the
  always-loaded docs. Its spec rode the foundation edits in the spec PR, with
  issues only for non-foundation files.

## Human prerequisites

none

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| The foundation edits ride this spec PR; `docs/workflow.md` is the one issue | The constitution's clarification corollary places foundation edits in planning, ratified at the gate. `foundation-dedup` did the same: foundation edits in the spec PR, issues for non-foundation files. `docs/workflow.md` is the contract, not a foundation artifact | 2026-10-28 |
| Worktrees stay plain `git worktree`; the principle is reworded, with no spike of native isolation | Native subagent isolation creates temporary worktrees under `.claude/worktrees/` with generated branch names. It branches from `fresh` or `head`, never a branch name, and is removed when the subagent changes nothing. Resume needs the opposite: each dispatch re-attaches the issue's deterministic `<type>/<scope>` branch, tested by `[ -e "$wt" ]` (issue contract). The docs settle it, so a spike would only re-confirm them | 2026-10-28 |
| `/batch` and plan mode are neither adopted nor claimed | `/batch` decomposes the task itself and reads no GitHub state. `/implement` walks the milestone's `Depends on:` graph in waves, with a per-issue review gate and the milestone-QA gate: that orchestration is what loopkit adds (vision, Goal). `/loopkit:plan` writes, reviews and merges a spec, which read-only plan mode cannot. The Don't "no reimplementing a native primitive that can be reused" stands: neither fits as is | 2026-10-28 |
| Agent teams leave the foundation docs | They are experimental and off by default (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`). Their teammates self-claim tasks from a shared list under file locking: claim arbitration, which the constitution's Don'ts exclude "of any kind". The skills use subagents only; no skill names a team | 2026-10-28 |
| The constitution defines "scheduler"; the vision says "no external scheduler" | One definition, in the binding artifact. The vision stays what-and-why. The definition: anything that starts a run without the human, meaning cron, a skill calling `CronCreate`, `ScheduleWakeup` or `RemoteTrigger`, a cloud or desktop scheduled task, or a CI job. `/loop` is the human's own: it fires only while the session is open and idle, expires after 7 days, and every gate still waits for the human. The tool names make it grep-verifiable over the skills, and today no skill names one | 2026-10-28 |
| Trim set and where each removed sentence lives | Design principle: "the `docs/workflow.md` sibling" is in the Tech stack row; "the tool is an editor, not a second source of truth" is in `docs/design.md` ("the tool is the editor, the committed file is the state"); "never a third gate" is in Exactly two human gates. Release principle: the tool examples and the `gh release create`/`git tag` commands are in `docs/release.md` and its template; the contract's field list is `docs/release.md`'s own sections; shell-hygiene is in the trust-boundary principle and `docs/release.md`'s Trust boundary section; "a summary is printed, not a third gate" is in `docs/release.md` and Exactly two human gates. Two gates: "delivered or produced during planning" is in the design principle. Prior-art principle: "the substrate every artifact derives from" is the vision's (Why now). Spec lifecycle: "milestone at acceptance, the roadmap link on the spec branch" is architecture Key flow 3 and `skills/plan/references/acceptance.md`. Tech debt history: git history and `docs/specs/archive/` | 2026-10-28 |
| The trust-boundary, clarification and Conventions bodies are not trimmed | The trust boundary is the security rule and "the hard predecessor of any pre-authorised-autonomy change". Its binding text stays in the binding artifact, and `skills/shared/trust-boundary.md` is the skills' method, not the rule. The clarification principle and the Conventions are rules with no restatement elsewhere | 2026-10-28 |
| The prior-art principle keeps its rule and loses its vision restatement | The vision (Why now) already states that prior art is the substrate every artifact derives from, so the constitution's copy breaks its own no-duplication Don't. The binding parts stay: consult, link, an ephemeral read-only checkout, never retained or copied in. "Encouraged" stays as ratified in `prior-art-elevation` | 2026-10-28 |
| History phrasing is deleted, not restated | "The skills now fully match this contract" and "now implements (the P1–P6 … is complete)" state no fact a model can act on; git and `docs/specs/archive/` keep the history (prior-art essay: ADOPT history in git) | 2026-10-28 |
| Prior-art entries gain dated lines instead of a rewrite | `docs/prior-art.md` is descriptive and dated. Precedent: the `model-tier-slots` entry gained a re-verification line in the 2026-10-27 audit seed | 2026-10-28 |

No genuinely open decision remains: the docs settle the worktree, `/batch`,
agent-teams and `/loop` points, and the constitution's no-duplication rule
settles the trims.

## Tracking

The decomposition lives as GitHub issues, not in this file. This spec owns the
design; the issues own progress.

- Milestone: created at acceptance.
- Issues: one.
  - **A — `docs/workflow.md`: drop the header's history sentence.**
    - Delete "The skills now fully match this contract (the P1–P6 brownfield
      roadmap is complete)." from the header blockquote, and re-wrap the quote's
      remaining lines to at most 80 columns.
    - Nothing else in the file changes.
    - The template `skills/inception/templates/workflow.md` carries no such
      sentence and is not touched.
    - Depends on: none.

## Verification

- [ ] `bash scripts/verify.sh` passes.
- [ ] Machine checks, run from the repo root. Each prints the expected result
      noted in its comment. Multi-word phrases are matched on the file's joined
      lines (`flat`).

  ```
  flat(){ tr '\n' ' ' < "$1" | tr -s ' '; }
  grep -nE 'P1–P6|now (fully )?match|now implements' CLAUDE.md docs/vision.md docs/constitution.md docs/architecture.md docs/workflow.md   # no output
  sed -n '/^## Tech debt/,$p' docs/constitution.md | grep -v '^#' | grep -v '^$'   # None.
  grep -ciE 'agent.teams?' docs/vision.md docs/constitution.md docs/architecture.md   # 0, 0, 0
  flat docs/constitution.md | grep -c 'wrap `/loop`, `/plan`, `/batch`'   # 0
  flat docs/constitution.md | grep -c 'isolation: worktree'   # 1
  flat docs/constitution.md | grep -c '`/batch` does not read'   # 1
  flat docs/constitution.md | grep -c "The human's own \`/loop\` is not one"   # 1
  flat docs/constitution.md | grep -c 'no skill schedules itself'   # 1
  flat docs/vision.md | grep -c 'no external scheduler'   # 1
  grep -rnE 'CronCreate|ScheduleWakeup|RemoteTrigger' skills   # no output
  grep -c 'plan, implement, roadmap, ship' docs/architecture.md   # 1
  cat CLAUDE.md docs/vision.md docs/constitution.md | wc -c   # <= 17773
  wc -c < docs/constitution.md   # <= 10430
  sed -n '/^## Architecture principles/,/^## Conventions/p' docs/constitution.md | grep -c '^- \*\*'   # 15
  sed -n "/^## Don.ts/,/^## /p" docs/constitution.md | grep -c '^- '   # 10
  grep -c 'grep-verifiable' docs/constitution.md   # 6
  grep -c 'Re-verified 2026-10-28' docs/prior-art.md   # >=2
  ```
- [ ] Reviewer pass on the spec PR. Each sentence removed from the constitution
      has the home the trim-set row names, and no binding rule is weaker.
- [ ] Human QA, the always-loaded reading. In a fresh `claude` session in the
      main checkout, ask three questions in turn, without tools and in one line
      each:
  1. "Is running `/loop /loopkit:implement <milestone>` a breach of loopkit's
     no-scheduler rule?" It answers no: `/loop` is the human's in-session
     repetition, and a scheduler starts a run without the human.
  2. "Which worktree mechanism do loopkit's skills use, and why not
     `isolation: worktree`?" It answers plain `git worktree`: resume re-attaches
     a deterministic branch.
  3. "May an `/loopkit:implement` orchestrator use agent teams?" It answers no.
     The skills fan out with subagents, and teammates self-claim, which is
     claim arbitration.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| A trim drops a binding rule | The rule counts are checked mechanically (15 principles, 10 Don'ts, 6 grep markers), and the reviewer checks each removed sentence against its named home |
| `/loop` in a backgrounded session keeps firing without a terminal, which reads as unattended | The definition rests on what stays true: the human starts it, it needs the session's process, it expires after 7 days, and both gates wait for the human whatever fires the next tick |
| A later Claude Code release lets native isolation re-attach a named branch | The principle names the gap, not a permanent rule. A re-verification that finds the gap closed is a plan cycle for the switch |
| `repositioning` edits the same vision/constitution lines | It is a separate row. Its plan cycle starts from this merged text (shared-file order, roadmap note) |

## Decision log

- 2026-10-28: Drafted. Re-verified on the first-party docs:
  - `scheduled-tasks`: `/loop` is session-scoped and expires after 7 days; a fire runs only model-invocable skills.
  - `agent-teams`: teams are experimental and off by default; teammates self-claim under file locking.
  - `sub-agents` and `worktrees`: isolation uses generated names under `.claude/worktrees/`; `baseRef` is `fresh` or `head`.
  
  The foundation edits are applied on this spec branch, and the Verification checks above pass on it, except the `docs/workflow.md` line, which is issue A.
