# Spec: artifact-hygiene

> Created: 2026-11-04

Four rules for loopkit's planning artifacts: a Decision log entry records a
design fork, a ratified foundation-doc change lands with the PR that makes it
true, nothing outside `docs/` cites a spec, and a phase number is a permanent
id. This spec carries no lifecycle state — acceptance is the spec merged on the
default branch with a milestone and issues, and all progress lives in the GitHub
issues and milestone. A completed spec is moved to `docs/specs/archive/`.

## Outcome

- [ ] O1. The spec template's Decision log section defines an entry: a design
  fork settled during implementation — the spec left two or more designs open,
  one was chosen, and a later change must keep that choice. It names what goes
  in the commit or PR body instead: test helpers, waits and timeouts, initial
  file contents, review-fix records, and anything the code or its tests already
  state. The issue contract and implement's QA-gate sweep record only design
  forks and point at that section; no skill asks to record "any decision".
- [ ] O2. Planning records a settled question as a Prior decisions row only.
  Plan's steps 2, 4 and 6 no longer ask for a Decision-log entry.
- [ ] O3. The spec template has a Foundation-doc changes section after
  Constraints. It starts from the foundation impact the roadmap row records,
  and per change it names the doc and section, the kind (MODIFIED, ADDED or REMOVED), the
  replaced text and the target text verbatim, and where it lands: with the
  issue that builds the behavior it describes, or `spec PR` for a rule that
  holds once adopted. A spec with none says `none`. The template's
  Verification section carries an item that every change landed.
- [ ] O4. Acceptance assigns each Foundation-doc change to exactly one issue,
  whose `Acceptance:` names it, and applies a `spec PR` change on the spec
  branch before the acceptance merge. The issue contract has the implementer
  apply the target text verbatim, a needed wording change being a planning
  fork (`needs:planning`), and the per-PR review check the verbatim match.
  Plan's spec-acceptance review checks each change's replaced text against
  the doc it changes.
- [ ] O5. The roadmap skill's Step 3, the workflow template's roadmap-loop
  text, the constitution's planning corollary and the architecture's flows 2–4
  say the same: a foundation-doc change is authored as target text in the
  spec, ratified at spec-acceptance, lands with the PR that makes it true, and
  is never authored in `/loopkit:implement`.
- [ ] O6. The issue contract forbids citing a spec in a file outside `docs/`;
  implement's QA-gate archive move repoints links inside `docs/` only; the
  workflow template and loopkit's `docs/workflow.md` state the rule; and
  `scripts/verify.sh` cites no spec.
- [ ] O7. (Per gate decision G1.) loopkit's constitution Conventions carry the
  no-spec-citation rule and `scripts/verify.sh` guards it.
- [ ] O8. The roadmap template, the prior-art template,
  `skills/shared/iteration-steps.md` and the roadmap skill's Step 2 state that
  a phase number is a permanent id — never reused or renumbered, no letters,
  no order; a new phase takes the next free number and a split takes new
  numbers; a Features-table row carries a slug instead — and that a concern
  header lists every phase or feature row it feeds. loopkit's own
  `docs/prior-art.md` follows it.

## Scope

### In scope

- `skills/plan/templates/spec-template.md`: the Decision log definition, the
  Foundation-doc changes section, its Verification item.
- `skills/plan/SKILL.md`: steps 2, 4 and 6 (Prior decisions only; the review
  check of Foundation-doc changes).
- `skills/plan/references/acceptance.md`: the issue cut and the `spec PR`
  landing.
- `skills/implement/references/issue-contract.md`: the source-checkout and
  commit steps (design forks only), the Implement step (verbatim apply, no
  spec citation outside `docs/`), the review gate (verbatim check), the merge
  note on the Decision log.
- `skills/implement/SKILL.md`: the QA-gate sweep and the archive move.
- `skills/roadmap/SKILL.md`: Step 2 (permanent ids) and Step 3 (landing).
- `skills/shared/iteration-steps.md`: concern tags and roadmap seeding.
- `skills/inception/templates/workflow.md`, `roadmap.md`, `prior-art.md`.
- `docs/constitution.md` and `docs/architecture.md`: the target text under
  Foundation-doc changes, nothing else.
- `docs/workflow.md`: the spec-naming lines.
- `docs/prior-art.md`: the header of the one concern that backs two rows.
- `scripts/verify.sh`: the comment at line 346, and the guard if G1 is A.

### Out of scope

- The review bound: its own phase (feature: review-bound).
- A guard in target projects: whether a project checks the no-citation rule is
  its own choice, and no loopkit template ships one.
- Rewriting the Decision logs of archived specs: they are frozen.
- Renumbering anything in loopkit's roadmap: its Features rows carry slugs.
- relay's own rules (date markers in rule docs, test-double naming, a spec
  budget) and the `CLAUDE.md` autonomy grant.

## Constraints

- Body-size guard (`scripts/verify.sh` guard 11): each `SKILL.md` body stays at
  most 12,800 bytes. Today plan is at 12,769 and implement at 12,718. New
  instruction text goes into the spec template,
  `skills/plan/references/acceptance.md` or
  `skills/implement/references/issue-contract.md`; an edit that adds bytes to a
  `SKILL.md` body frees the same room in that body.
- Plugin paths follow the constitution's Conventions (guard 7). The spec
  template is copied into target projects, so it names no plugin path.
- Templates carry no project-specific values (constitution Quality gates).
- The trust boundary is unchanged.
- The loops run the installed release (2.4.x), whose skills do not know these
  rules yet. Each issue's `Acceptance:` states what the rules ask of that issue,
  above all the verbatim apply in issue B.
- Issues A and B change behavior for every project on loopkit: their PRs are
  `feat:` commits, so `/loopkit:ship` computes a minor and the changelog names
  both.

## Foundation-doc changes

This spec's own changes, written in the shape O3 introduces. Vision: none.

### docs/constitution.md — Architecture principles, "Clarification belongs to planning": MODIFIED

- Lands: with issue B, which builds the behavior it describes (O4, O5).
- Replaces:

  ```text
    spec), which resolves it at the spec-acceptance gate. Corollary: foundation-doc
    edits (vision/constitution/architecture) belong to planning too — authored in a
    `/loopkit:plan` spec PR and ratified at the spec-acceptance gate, never in
    `/loopkit:implement`, never left as a dangling draft.
  ```

- Target text:

  ```text
    spec), which resolves it at the spec-acceptance gate. Corollary: foundation-doc
    edits (vision/constitution/architecture) belong to planning too — authored as
    target text in a `/loopkit:plan` spec and ratified at the spec-acceptance gate,
    never authored in `/loopkit:implement`, never left as a dangling draft. A
    ratified edit lands with the PR that makes it true — a behavior change with the
    issue PR that builds it, a rule that holds once adopted with the spec PR — and
    the implementer applies it verbatim.
  ```

### docs/architecture.md — Key flows 2, 3 and 4: MODIFIED

- Lands: with issue B (O5).
- Replaces (flow 2, its last two lines):

  ```text
     1..n roadmap rows + backing prior-art; a foundation-doc impact is recorded onto
     the seeded phase (edited later in that phase's plan cycle), never here.
  ```

- Target text:

  ```text
     1..n roadmap rows + backing prior-art; a foundation-doc impact is recorded onto
     the seeded phase (authored later as target text in that phase's plan cycle),
     never here.
  ```

- Replaces (flow 3, whole item):

  ```text
  3. **Plan cycle (producer):** roadmap phase (human-pointed) -> sort decisions
     (+ prior-art) -> spec (with prior-art links) -> [if UI surface OR a
     decision-clarifying visualisation: `/loopkit:design` delivers/produces a design
     per `docs/design.md`, committed as a file and referenced by the spec] ->
     in-session review -> **spec-acceptance gate (human, reviews the design too)** ->
     milestone + roadmap link on the spec branch -> merge -> issues with two-level
     `depends-on`.
  ```

- Target text:

  ```text
  3. **Plan cycle (producer):** roadmap phase (human-pointed) -> sort decisions
     (+ prior-art) -> spec (with prior-art links and any foundation-doc change as
     target text) -> [if UI surface OR a decision-clarifying visualisation:
     `/loopkit:design` delivers/produces a design per `docs/design.md`, committed
     as a file and referenced by the spec] -> in-session review ->
     **spec-acceptance gate (human, reviews the design too)** -> milestone +
     roadmap link (+ a foundation-doc change that lands with the spec PR) on the
     spec branch -> merge -> issues with two-level `depends-on`.
  ```

- Replaces (flow 4, its third line):

  ```text
     the frontier (each: worktree -> implement -> Verify -> review -> merge, or
  ```

- Target text:

  ```text
     the frontier (each: worktree -> implement, applying a ratified foundation-doc
     change verbatim when the issue carries one -> Verify -> review -> merge, or
  ```

### docs/constitution.md — Conventions, the specs line: MODIFIED (only if G1 is A)

- Lands: with issue C, once `scripts/verify.sh` cites no spec and guards the
  rule (O6, O7).
- Replaces:

  ```text
  - Foundation docs in `docs/`; specs in `docs/specs/`, archived to
    `docs/specs/archive/`.
  ```

- Target text:

  ```text
  - Foundation docs in `docs/`; specs in `docs/specs/`, archived to
    `docs/specs/archive/`. Nothing outside `docs/` cites a spec, live or archived:
    a comment that needs a contract points at the living doc that holds it.
    (grep-verifiable.)
  ```

## Prior art

- [Planning-artifact lifecycle — decision scope, foundation-doc landing, spec citations, permanent phase ids (feature: artifact-hygiene)](../prior-art.md#planning-artifact-lifecycle--decision-scope-foundation-doc-landing-spec-citations-permanent-phase-ids-feature-artifact-hygiene)
  - The evidence: relay's 104 of 145 Decision-log entries that settle no design
    question, its constitution ahead of its code, its 263 spec citations in
    non-doc files and its drifting phase numbers; loopkit's 13 % Decision-log
    share, its status-mod principle ahead of the mod and its stale citation in
    `scripts/verify.sh:346`.
  - Nygard: ADOPT the significance filter as the Decision log's scope and
    numbers that are never reused as the phase-id rule; AVOID superseded
    status and reading the number as order.
  - OpenSpec: ADOPT the split between living text and change proposal (a
    foundation-doc change is a delta that lands when the behavior exists; code
    points at the living text); AVOID per-capability main specs and merging
    only at archive time.
  - Docs-as-code: ADOPT the doc change in the PR that changes behavior; AVOID a
    CI drift check.
- [Non-UI concept design + the durable diagram medium (feature: design-in-the-loop)](../prior-art.md#non-ui-concept-design--the-durable-diagram-medium-feature-design-in-the-loop)
  — the ADR entry: the decision shape loopkit's Prior decisions and Decision
  log already follow, and its AVOID of lifecycle status.
- [Process-PR overhead — ceremony telemetry (feature: ceremony-overhead)](../prior-art.md#process-pr-overhead--ceremony-telemetry-feature-ceremony-overhead)
  — measure ceremony and drive it down; AVOID a new artifact type as the fix
  (this spec adds a spec section, not a new artifact).

## Human prerequisites

none

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| One phase with one issue per rule (A–D). | The four rules share the spec template, the issue contract, plan and the roadmap skill, and one release carries them (sparring 2026-11-04). | 2026-11-04 |
| Planning records a settled question only as a Prior decisions row: before acceptance, and in a re-plan after a `needs:planning` escalation. The Decision log holds the forks settled during implementation, written pre-merge on the issue branch, plus implement's QA-gate sweep as the catch-all. | The human adopted 1b in the sparring: two records of one decision duplicate each other. The split by author matches the template's own wording ("Decisions made during implementation"). | 2026-11-04 |
| The definition of a Decision-log entry lives once, in the spec template's Decision log section. The issue contract says "design fork" with the rule that everything else goes in the commit or PR body, and points at that section (`../../plan/templates/spec-template.md`); implement's sweep and plan use the same term. | The section is where entries are written. A template is a plugin-shipped artifact a skill may point at (`skills/shared/iteration-steps.md`), while a copied template cannot point at a plugin path. A new shared file for three sentences would be the ceremony the ceremony-overhead entry warns about. relay shows the implementer acts on the contract sentence itself, so that sentence carries the rule, not only a pointer. | 2026-11-04 |
| A Foundation-doc change uses OpenSpec's delta kinds (MODIFIED, ADDED, REMOVED), with the replaced text and the target text verbatim in fenced `text` blocks and a `Lands:` line. `Lands:` names the issue from the spec's Tracking outline that builds the behavior, or `spec PR`. | OpenSpec delta specs (prior art). Verbatim blocks make the apply and the review a text comparison. The Tracking outline already letters the issues before they exist. | 2026-11-04 |
| A change that describes behavior lands with the issue PR that builds it; acceptance assigns it to exactly one issue, the last one building that behavior, and that issue's `Acceptance:` reads "applies the ratified <doc> change (<section>) from the spec verbatim". A rule that holds once adopted lands with the spec PR: the planner applies it on the spec branch beside the roadmap-link commit, before the acceptance merge. | The handoff's rule. One owner per change keeps the always-loaded docs true at every merge. | 2026-11-04 |
| Before writing a change, the planner checks the live specs in `docs/specs/` for a ratified change to the same text whose landing issue is still open. If there is one, the new target text is written against that pending text, and the milestone takes a `Depends on milestone:` edge to the pending spec's milestone. The rule sits in the template section and in `acceptance.md`. | The constitution's two-level dependency representation is the existing mechanism, and it keeps each verbatim apply exact. | 2026-11-04 |
| The implementer applies the target text verbatim; a needed wording change is `needs:planning`. The per-PR review receives the issue's target text and checks that the diff carries it exactly. Plan's spec-acceptance review checks each replaced text against the current doc. | "Never authored in `/loopkit:implement`" stays true: the implementer copies ratified text and authors none. | 2026-11-04 |
| This spec's constitution corollary and architecture flows land with issue B, not the spec PR. | They describe what plan, implement and roadmap do, and issue B builds that. | 2026-11-04 |
| A spec citation is a concrete spec file name (`spec-<slug>.md`, live or archived) in a tracked file outside `docs/`, root files included. Path patterns (`spec-<scope>.md`, `spec-*.md`, `spec-$scope.md`) and `spec-template.md` are not citations. The issue, the commit body and the PR keep referencing the spec. | The handoff's rule. Skill prose has to name the path convention. Today no root file cites a spec. | 2026-11-04 |
| `scripts/verify.sh:346` points at the living rules instead: the constitution's Conventions for plugin paths, and each guard's own comment for its rule. | `docs/specs/spec-skill-structure.md` has moved to the archive, which is the very rot this rule prevents. | 2026-11-04 |
| If G1 is A, the guard is its own numbered check in `scripts/verify.sh`: `git grep -n -E 'spec-[a-z0-9][a-z0-9-]*\.md' -- ':!docs'`, with lines naming `spec-template.md` dropped, must find nothing; on a hit it names the file and line. | Tested on 2026-11-04: it finds exactly `scripts/verify.sh:346`, and `spec-<scope>.md`, `spec-*.md` and `spec-$scope.md` do not match. The regex does not match its own text. | 2026-11-04 |
| Concern tags: `(Phase N)`, `(Phase N, M)`, `(feature: <slug>)` or `(feature: <slug>, <slug>)`, one kind per header. loopkit's "Worktree resume & merge-conflict recovery" header also names `implement-conflict-recovery`, the only concern that backs two rows today. | The handoff's rule, extended to Features rows because loopkit's own roadmap has such a case. No code parses the tags, and the status pane's unplanned-phase rule reads only the Spec and Milestone cells. | 2026-11-04 |
| OPEN — G1: do loopkit's own constitution Conventions carry the no-spec-citation rule, guarded by `scripts/verify.sh`? | resolved at the spec-acceptance gate | — |

## Tracking

- Milestone: created at acceptance.
- Issues, one per step, created after the merge:
  - **A — Decision log records design forks (O1, O2).** The spec template's
    Decision log section; `issue-contract.md`'s source-checkout and commit
    steps and its merge note; implement's QA-gate sweep; plan's steps 2, 4
    and 6.
  - **B — Foundation-doc changes land with their PR (O3, O4, O5).** Depends on
    A. The template's Foundation-doc changes section and Verification item;
    `acceptance.md`; `issue-contract.md`'s Implement step and review gate;
    plan's step 6 review (step 3 stays as it is: the template section
    instructs the planner); the roadmap skill's Step 3; the workflow template's
    roadmap-loop text; and this spec's constitution and architecture changes,
    applied verbatim.
  - **C — No spec citation outside `docs/` (O6, O7).** Depends on B.
    `issue-contract.md`'s Implement step; implement's archive move; the
    workflow template; `docs/workflow.md`; `scripts/verify.sh:346`; per G1,
    the Conventions change, applied verbatim, and the guard.
  - **D — A phase number is a permanent id (O8).** Depends on B. The roadmap
    and prior-art templates; `skills/shared/iteration-steps.md`; the roadmap
    skill's Step 2; the concern header in `docs/prior-art.md`.
- C and D touch disjoint files and can run in parallel.

## Verification

- [ ] `bash scripts/verify.sh` passes, the body-size guard included.
- [ ] `git grep -n -i "any decision" -- skills` finds nothing. The issue
  contract and implement's QA-gate sweep say "design fork", and the contract
  points at the spec template's Decision log section.
- [ ] Plan's steps 2, 4 and 6 write a Prior decisions row and ask for no
  Decision-log entry.
- [ ] The spec template has the Foundation-doc changes section (kinds, replaced
  and target text, `Lands:`, the pending-change check, `none`) and a
  Verification item that every change landed.
- [ ] `acceptance.md` assigns each change to one issue and applies a `spec PR`
  change before the merge; `issue-contract.md` has the verbatim apply, the
  `needs:planning` route and the review check.
- [ ] Every Foundation-doc change of this spec is on `main` verbatim: QA
  compares each fenced target text with the doc, and the change landed in the
  PR its `Lands:` line names.
- [ ] `git grep -n -E 'spec-[a-z0-9][a-z0-9-]*\.md' -- ':!docs'` finds only
  `spec-template.md` lines. If G1 is A, Verify fails on a planted citation
  outside `docs/` and passes once it is removed.
- [ ] The roadmap and prior-art templates, `iteration-steps.md` and the
  roadmap skill's Step 2 state the permanent-id rule and the multi-row tag,
  and the worktree-resume concern header names both rows.
- [ ] Smoke (the QA-gate default, review plus a run of the changed skill): a
  fresh-context subagent given only the changed skills answers where a
  decision from implementation goes, where a test helper goes, where a
  constitution change for a new behavior lands, and what number a new
  roadmap phase takes, and each answer matches this spec.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| A `SKILL.md` body passes 12,800 bytes. | The Constraints route new text into the template and the references; Verify's body-size guard fails the PR otherwise. |
| This milestone's implementers run the installed 2.4.x skills and do not know the new rules. | Each issue's `Acceptance:` states what the rules ask of it, and issue B's names the verbatim apply. |
| A planner skips the Foundation-doc changes section. | The template asks for `none` explicitly, and plan's spec-acceptance review checks the section. |
| Two specs change the same principle before either lands. | The pending-change check writes the later text against the earlier and adds a milestone edge. |
| The G1 guard flags a future non-spec file named `spec-<x>.md` outside `docs/`. | Its failure names the file and line; the file is renamed, or the guard's exclusion is widened in that PR. |

## Decision log

- 2026-11-04: Drafted. The planning decisions are the Prior decisions rows;
  under this spec's own rule (O2) they get no second record here.
