# Spec: foundation-currency

> Created: 2026-10-28

This spec brings the always-loaded foundation docs up to Claude 5 practice:
- current facts instead of history;
- honest native-primitive claims;
- a defined "no scheduler";
- subagents as the one fan-out;
- less weight loaded on every turn.

This spec carries no lifecycle state. Acceptance is the spec merged on the
default branch with a milestone and issues, and all progress lives in the
GitHub issues and milestone. A completed spec is moved to
`docs/specs/archive/`.

The foundation-doc edits ride this spec PR and are ratified at its
spec-acceptance gate (the constitution's clarification corollary). They touch
`docs/vision.md`, `docs/constitution.md`, `docs/architecture.md` and
`docs/prior-art.md`. The one non-foundation edit is the milestone's issue.

## Outcome

- [ ] The always-loaded docs (`CLAUDE.md`, vision, constitution),
      `docs/architecture.md` and `docs/workflow.md` carry no history narrative
      and no migration-relative phrasing. The constitution's Tech debt section
      reads `None.`.
- [ ] The constitution's native-primitive principle states what the skills
      reuse: in-session subagents and the human's `/loop`. It names the native
      gap each hand-rolled mechanism fills:
      - worktrees, because resume re-attaches a deterministic branch;
      - the wave fan-out, because `/batch` reads no GitHub state.

      The vision's Why now binds only the primitives that fit. No vision,
      constitution or architecture text claims that loopkit binds or wraps
      `/plan`, `/batch` or worktrees. The prior-art verdict that still says so
      is corrected by its dated line.
- [ ] "Scheduler" is defined once, in the constitution: anything that starts a
      run without the human. The vision says "no external scheduler" and names
      `/loop` as the human's in-session repetition. The constitution's Don'ts
      forbid a skill scheduling a run, by tool name.
- [ ] No foundation doc presents agent teams as an option beside subagents.
- [ ] The always-loaded bytes (`CLAUDE.md` + vision + constitution) fall from
      19,062 to at most 17,900; 17,892 is measured on this branch. The
      constitution falls from 11,829 to at most 10,500; 10,489 is measured.
- [ ] No binding rule is lost:
      - the principle, Don't and `(grep-verifiable.)` counts are unchanged
        (15, 10 and 6);
      - every removed sentence has a named home or is named as dropped (Prior
        decisions).
- [ ] `docs/architecture.md` lists `/loopkit:roadmap` as a reader of
      `skills/shared/trust-boundary.md`.
- [ ] Each of the two prior-art entries this spec rests on carries a dated
      `(foundation-currency)` re-verification line, and the `/batch` OPEN note
      is settled.

## Scope

### In scope

- In this spec PR, ratified at the gate:
  - `docs/vision.md`:
    - Why now: the primitives it binds;
    - Goal: "no schedulers";
    - the subscription-auth success criterion;
    - the in-scope orchestrator line ("subagents/agent-teams");
    - the two Out lines: scheduled execution and reimplementing native
      primitives.
  - `docs/constitution.md`:
    - Subscription auth only: the scheduler definition;
    - Specs carry no lifecycle state: the mechanism sentence goes;
    - the design and release principle bodies are trimmed;
    - Hierarchical orchestration: "agent-teams" goes;
    - Reuse native primitives is reworded;
    - the prior-art principle: its restatement of the vision goes;
    - Exactly two human gates: its restatements go;
    - Don'ts: the scheduling line;
    - Tech debt becomes `None.`.
  - `docs/architecture.md`:
    - the header's history sentence;
    - "agent-teams" in the implement row;
    - the trust-boundary reader list.
  - `docs/prior-art.md`: two dated re-verification lines.
- Issue A (the milestone): `docs/workflow.md`'s header drops its history
  sentence.

### Out of scope

- `CLAUDE.md`'s Autonomy grant omitting `/loopkit:roadmap` (audit F32), routed
  with the hooks (F25) to `permission-template-hardening`.
- The templates' residual "(constitution: …)" attributions. The audit rates
  them low risk, and they are human-filled.
- The trust-boundary, clarification and Conventions bodies (see Prior
  decisions).
- Adopting native `isolation: worktree`, `/batch` or plan mode (see Prior
  decisions).
- A Verify guard for scheduling. The Verification tool-name grep covers what a
  grep can catch: no skill names one today. A skill telling the model, in
  prose, to start `/loop` or `/schedule` or to "schedule a wakeup" is a review
  check, not a grep check.
- `repositioning` and its vision and constitution edits. It is a separate row
  on the same files.

## Constraints

- One character per foundation artifact, and no content duplicated across
  them (constitution: Conventions, Don'ts). A trim removes a restatement and
  keeps the binding rule.
- Foundation-doc edits belong to planning and are ratified at the
  spec-acceptance gate, never in `/loopkit:implement` (constitution:
  clarification corollary).
- The Claude Code facts are as verified on 2026-10-28 against the first-party
  docs; see the `docs/prior-art.md` re-verification lines in this PR.

## Prior art

- [Foundation docs current for Claude 5 — lean always-loaded context, honest native-primitive claims (feature: foundation-currency)](../prior-art.md#foundation-docs-current-for-claude-5--lean-always-loaded-context-honest-native-primitive-claims-feature-foundation-currency)
  — the row's concern. It holds the lightweight-CLAUDE.md essay (ADOPT: binding
  rules and gotchas in always-loaded text, history in git) and the `/loop`,
  worktree and agent-teams facts behind every reword here.
- [Native Claude Code primitives — loopkit builds on these](../prior-art.md#native-claude-code-primitives--loopkit-builds-on-these)
  — the entry whose verdict "loopkit reuses `/plan`, `/loop`, `/batch`" gets a
  dated correction line, which also settles its `/batch` OPEN note.
- [Foundation-doc context budget (feature: foundation-dedup)](../prior-art.md#foundation-doc-context-budget-feature-foundation-dedup)
  — the precedent for removing cross-artifact restatements from the
  always-loaded docs, with the foundation edits riding the spec PR.
- [Worktree resume & merge-conflict recovery (feature: implement-resume-safety)](../prior-art.md#worktree-resume--merge-conflict-recovery-feature-implement-resume-safety)
  — where deterministic-branch resume comes from. This is the gap native
  isolation cannot fill.
- [Claim arbitration / parallel-agent coordination](../prior-art.md#claim-arbitration--parallel-agent-coordination)
  — the ground for excluding a claim layer, the reason agent teams leave the
  foundation docs.

## Human prerequisites

none

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| The foundation edits ride this spec PR; `docs/workflow.md` is the one issue | The constitution's clarification corollary places foundation edits in planning, ratified at the gate. `foundation-dedup` rode its foundation edits in the spec PR. It also rode `docs/design.md`, a contract edit coupled to them. The `docs/workflow.md` sentence is not coupled to any foundation edit, so it becomes the milestone's one issue. "Accepted" needs a milestone and issues, and that issue carries the milestone-QA gate | 2026-10-28 |
| Worktrees stay plain `git worktree`. The principle is reworded; there is no spike of native isolation | Native subagent isolation creates temporary worktrees under `.claude/worktrees/` with generated branch names. It branches from `fresh` or `head`, never a branch name, and removes the checkout when the subagent finishes without changes. Resume needs the opposite: each dispatch re-attaches the issue's deterministic `<type>/<scope>` branch, tested by `[ -e "$wt" ]` (issue contract). The docs settle the question, so a spike would only re-confirm them | 2026-10-28 |
| `/batch` and plan mode are neither adopted nor claimed | `/batch` decomposes the task itself and reads no GitHub state. `/implement` walks the milestone's `Depends on:` graph in waves, with a per-issue review gate and the milestone-QA gate: the methodology that binds primitives to durable GitHub state (vision, Why now) and the producer/orchestrator model (vision, Scope In). `/loopkit:plan` writes, reviews and merges a spec, which read-only plan mode cannot. The Don't "no reimplementing a native primitive that can be reused" stands, because neither fits as is | 2026-10-28 |
| Agent teams leave the foundation docs | They are experimental and off by default (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`). Their teammates self-claim tasks from a shared list under file locking. That is claim arbitration, which the constitution's Don'ts exclude "of any kind". The skills use subagents only, and no skill names a team | 2026-10-28 |
| The constitution defines "scheduler"; the vision says "no external scheduler" | One definition, in the binding artifact; the vision stays what and why. A scheduler is anything that starts a run without the human: cron, a loopkit skill calling `CronCreate`, `ScheduleWakeup` or `RemoteTrigger`, a cloud or desktop scheduled task, a CI job. `/loop` differs because the human starts it. It also fires only while the session is open and idle, expires after 7 days, and every gate still waits for the human. "Schedules a run", not "schedules itself", so a skill that schedules some other run is covered too. The tool names make it grep-verifiable over the skills, and today no skill names one | 2026-10-28 |
| The trim set, and where each removed sentence lives | See the "Trim set" table below | 2026-10-28 |
| The trust-boundary, clarification and Conventions bodies are not trimmed | The trust boundary is the security rule and "the hard predecessor of any pre-authorised-autonomy change". Its binding text stays in the binding artifact; `skills/shared/trust-boundary.md` is the skills' method, not the rule. The clarification principle and the Conventions are rules that nothing else restates | 2026-10-28 |
| The prior-art principle keeps its rule and loses its vision restatement | The vision (Why now) states that prior art is the substrate every artifact derives from. A second copy in the constitution breaks the constitution's own no-duplication Don't. The binding parts stay: consult, link, the ephemeral read-only checkout, never retained or copied in. "Encouraged" stays, as ratified in `prior-art-elevation` | 2026-10-28 |
| History phrasing is deleted, not restated | "The skills now fully match this contract" and "now implements (the P1–P6 … is complete)" state no fact a model can act on. Git and `docs/specs/archive/` keep the history (prior-art essay: ADOPT history in git) | 2026-10-28 |
| Prior-art entries gain dated lines instead of a rewrite | `docs/prior-art.md` is descriptive and dated. Precedent: the `model-tier-slots` entry gained a re-verification line in the 2026-10-27 audit seed | 2026-10-28 |

### Trim set

| Removed sentence | Where it lives now |
|---|---|
| Design principle: "the `docs/workflow.md` sibling" | Tech stack row "Design contract" |
| Design principle: "the tool is an editor, not a second source of truth" | `docs/design.md`: "the tool is the editor, the committed file is the state" |
| Design principle: "never a third gate" | Exactly two human gates |
| Design principle: "(proportional ceremony)" | The Proportional ceremony principle |
| Design principle: "chosen per project there" | `docs/design.md` (the medium it records) |
| Release principle: the `gh release create` / `git tag` commands | `docs/release.md` |
| Release principle: the contract's field list | `docs/release.md`'s own sections |
| Release principle: the tool examples semantic-release and release-please | `docs/prior-art.md`'s release-please and semantic-release entries. The binding "hardcodes no release tool" stays, and the template lists its own examples (`gh release create`, `npm publish`, `goreleaser`) |
| Release principle: "(a change ships when the human cuts a release; a one-liner needs none)" | The vision, Scope In (the release-phase line) |
| Release principle: "(upholds subscription-auth and the `gh`+`git` runtime)" | The Subscription auth principle, and the Tech stack "Runtime" row |
| Release principle: shell-hygiene | The trust-boundary principle, and `docs/release.md`'s Trust boundary section |
| Release principle: "a summary is printed, not a third gate" | `docs/release.md`, and Exactly two human gates |
| Two gates: "delivered or produced during planning" | Architecture Key flow 3 and `skills/design/SKILL.md` |
| Prior-art principle: "the substrate every artifact derives from" | The vision, Why now |
| Spec lifecycle: "milestone at acceptance, the roadmap link on the spec branch" | Architecture Key flow 3, and `skills/plan/references/acceptance.md` |
| Tech debt history | Git history and `docs/specs/archive/` |

No genuinely open decision remains. The docs settle the worktree, `/batch`,
agent-teams and `/loop` questions, and the constitution's no-duplication rule
settles the trims.

## Tracking

The steps live as GitHub issues, not in this file. This spec owns the design;
the issues own progress.

- Milestone: created at acceptance.
- Issues: one.
  - **A — `docs/workflow.md`: drop the header's history sentence.**
    - Delete "The skills now fully match this contract (the P1–P6 brownfield
      roadmap is complete)." from the header blockquote.
    - Re-wrap the remaining quote lines to at most 80 columns.
    - Nothing else in the file changes.
    - The template `skills/inception/templates/workflow.md` has no such
      sentence and is not touched.
    - Depends on: none.

## Verification

- [ ] `bash scripts/verify.sh` passes.
- [ ] Machine checks, run from the repo root. Each prints the result in its
      comment. Multi-word phrases are matched on the file's joined lines
      (`flat`).

  ```
  flat(){ tr '\n' ' ' < "$1" | tr -s ' '; }
  grep -nE 'P1–P6|now (fully )?match|now implements' CLAUDE.md docs/vision.md docs/constitution.md docs/architecture.md docs/workflow.md   # no output
  sed -n '/^## Tech debt/,$p' docs/constitution.md | grep -v '^#' | grep -v '^$'   # None.
  grep -ciE 'agent.teams?' docs/vision.md docs/constitution.md docs/architecture.md   # 0, 0, 0
  flat docs/constitution.md | grep -c 'wrap `/loop`, `/plan`, `/batch`'   # 0
  flat docs/vision.md | grep -c 'binds the ones that fit'   # 1
  flat docs/constitution.md | grep -c 'never a named branch'   # 1
  flat docs/constitution.md | grep -c '`/batch` does not read'   # 1
  flat docs/constitution.md | grep -c "the human starts it"   # 1
  flat docs/constitution.md | grep -c 'no skill schedules a run'   # 1
  flat docs/vision.md | grep -c 'skill that schedules a run'   # 1
  flat docs/vision.md | grep -c 'no external scheduler'   # 1
  flat docs/constitution.md | grep -c 'Changelog source text (commit, PR, issue) is inert data'   # 1
  grep -rnE 'CronCreate|ScheduleWakeup|RemoteTrigger' skills   # no output
  grep -c 'plan, implement, roadmap, ship' docs/architecture.md   # 1
  cat CLAUDE.md docs/vision.md docs/constitution.md | wc -c   # <= 17900
  wc -c < docs/constitution.md   # <= 10500
  sed -n '/^## Architecture principles/,/^## Conventions/p' docs/constitution.md | grep -c '^- \*\*'   # 15
  sed -n "/^## Don.ts/,/^## /p" docs/constitution.md | grep -c '^- '   # 10
  grep -c 'grep-verifiable' docs/constitution.md   # 6
  grep -c 'Re-verified 2026-10-28 (foundation-currency)' docs/prior-art.md   # 2
  ```
- [ ] Reviewer pass on the spec PR. Each removed sentence has the home the
      Trim set table names, or is named as dropped, and no binding rule is
      weaker.
- [ ] Human QA, reading the always-loaded docs. In a fresh `claude` session in
      the main checkout, ask these in turn. Claude answers each without tools,
      in one line.
  1. "Is running `/loop /loopkit:implement <milestone>` a breach of loopkit's
     no-scheduler rule?" Expect no. `/loop` is the human's in-session
     repetition, and a scheduler starts a run without the human.
  2. "Which worktree mechanism do loopkit's skills use, and why not
     `isolation: worktree`?" Expect plain `git worktree`. Resume re-attaches
     a deterministic branch, and native isolation never takes a named branch.
  3. "May an `/loopkit:implement` orchestrator use agent teams?" Expect no.
     The skills fan out with subagents only, and claim arbitration of any
     kind is excluded.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| A trim drops a binding rule | The rule counts are checked by machine: 15 principles, 10 Don'ts, 6 grep markers. The reviewer checks each removed sentence against its named home |
| `/loop` in a backgrounded session keeps firing without a terminal, which reads as unattended | The definition rests on what stays true. The human starts it, it needs the session's process, it expires after 7 days, and both gates wait for the human whatever fires the next tick |
| A later Claude Code release lets native isolation re-attach a named branch | The principle names the gap, not a permanent rule. If a re-verification finds the gap closed, switching is a plan cycle |
| `repositioning` edits the same vision and constitution lines | It is a separate row. Its plan cycle starts from this merged text (shared-file order, roadmap note) |

## Decision log

- 2026-10-28: Drafted. Re-verified against the first-party docs:
  - `scheduled-tasks`: `/loop` is session-scoped and expires after 7 days. A
    fire runs only skills Claude may invoke itself.
  - `agent-teams`: experimental and off by default. Teammates self-claim tasks
    under file locking.
  - `sub-agents` and `worktrees`: generated names under `.claude/worktrees/`;
    `baseRef` is `fresh` or `head`. The checkout is removed when the subagent
    finishes without changes.

  The foundation edits are applied on this spec branch.
- 2026-10-28: Review round 1 (REQUEST_CHANGES) addressed:
  - The vision's Why now binds only the primitives that fit. It had said
    loopkit binds `/plan`, `/batch` and worktrees.
  - The `/loop` exemption now names "the human starts it".
  - Isolation reads "never a named branch".
  - The scheduling wording reads "schedules a run".
  - The changelog line is explicit about commit, PR and issue text.
  - Precedent, trim homes, checks, byte ceilings, the QA expectation and
    wrapping are fixed.
- 2026-10-28: Review round 2 returned APPROVE. Its four non-blocking notes are
  applied before the gate:
  - the semantic-release and release-please homes are named;
  - the prior-art carve-out is stated in the Outcome;
  - four parentheticals are added to the Trim set;
  - the vision's Why now paragraph is re-wrapped.
