# Spec: artifact-hygiene

> Created: 2026-11-04

Four rules for loopkit's planning artifacts: a Decision log entry records an
implementation choice, a ratified foundation-doc change lands with the PR that
makes it true, nothing outside `docs/` cites a spec, and a phase number is a
permanent id. This spec carries no lifecycle state — acceptance is the spec
merged on the default branch with a milestone and issues, and all progress
lives in the GitHub issues and milestone. A completed spec is moved to
`docs/specs/archive/`.

## Outcome

- [ ] O1. The spec template's Decision log section defines an entry as an
  implementation choice: a choice the spec leaves to the implementer on
  purpose (a latitude it grants, or a construction technique the spec and code
  leave free) that a later change must keep. It names what goes in the commit
  or PR body instead: test helpers, waits and timeouts, initial file contents,
  review-fix records, and anything the code or its tests already state. It
  states that a design fork, a choice that changes the spec's design, still
  escalates as `needs:planning`, and that the re-plan records its answer as a
  Prior decisions row. The issue contract and implement's QA-gate sweep record
  only implementation choices and point at that section; no skill asks to
  record "any decision" or "any resulting decision".
- [ ] O2. Planning records a settled question as a Prior decisions row only.
  Plan's steps 2, 4 and 6 no longer ask for a Decision-log entry.
- [ ] O3. The spec template has a Foundation-doc changes section after
  Constraints. It starts from the foundation impact the roadmap row records,
  or from the planner's own three verdicts where the row records none (a phase
  seeded by inception). Per change it names the doc and section and the kind:
  MODIFIED (the replaced text and the target text), ADDED (an `After:` line
  quoting the line it follows, and the target text) or REMOVED (the replaced
  text). The texts sit in fenced `text` blocks at column 0, so they compare
  as they stand. A `Lands:` line names the Outcome whose issue builds the
  behavior the change describes, or `spec PR` for a rule that holds once
  adopted. A spec with no change says `none`. The section states the
  pending-change rule (Prior decisions), and the template's Verification
  section carries an item that every change landed.
- [ ] O4. Acceptance assigns each change that does not land with the spec PR to
  exactly one issue, whose `Acceptance:` names it, and applies each `spec PR`
  change on the spec branch before the acceptance merge. The issue contract has
  the implementer apply the target text verbatim, a needed wording change
  being a design fork (`needs:planning`), and the per-PR review check the
  verbatim match. Plan's spec-acceptance review checks each `Replaces` and
  `After:` text against the doc it changes, or against the pending target text
  where a pending change applies.
- [ ] O5. The roadmap skill's Step 3 and Close out, the workflow template's
  roadmap-loop text, the constitution's planning corollary and the
  architecture's flows 2–4 say the same: a foundation-doc change is authored as
  target text in the spec, ratified at spec-acceptance, lands with the PR that
  makes it true, and is never authored in `/loopkit:implement`.
- [ ] O6. The issue contract forbids citing a spec in a file outside `docs/`;
  implement's QA-gate archive move repoints links inside `docs/` only; the
  workflow template states the rule, and loopkit's `docs/workflow.md` states it
  too (G1 = B) or points at the constitution's Conventions (G1 = A); and
  `scripts/verify.sh` cites no spec.
- [ ] O7. (Only if G1 is A.) loopkit's constitution Conventions carry the
  no-spec-citation rule, and `scripts/verify.sh` guards it as guard 13.
- [ ] O8. The roadmap template, the prior-art template,
  `skills/shared/iteration-steps.md` and the roadmap skill's Step 2 state that
  a phase number is a permanent id: never reused or renumbered, no letter
  suffix (5a, 1c), and no order — the queue order is the roadmap's row order.
  A new phase takes the next free number, and a split takes new numbers; a
  Features-table row carries a slug instead. A concern header keeps the tag it
  was created with, and a row that later draws on the concern is added to an
  `Also feeds:` line under the header. loopkit's own `docs/prior-art.md`
  follows the rule.

## Scope

### In scope

- `skills/plan/templates/spec-template.md`: the Decision log definition, the
  Foundation-doc changes section, its Verification item.
- `skills/plan/SKILL.md`: steps 2, 4 and 6 (Prior decisions only, and the
  review check of Foundation-doc changes).
- `skills/plan/references/acceptance.md`: the issue cut and the `spec PR`
  landing.
- `skills/implement/references/issue-contract.md`: the source-checkout and
  commit steps and the merge note (implementation choices only); the Implement
  step (verbatim apply, no spec citation outside `docs/`); the review gate
  (verbatim check).
- `skills/implement/SKILL.md`: the QA-gate sweep and the archive move.
- `skills/roadmap/SKILL.md`: Step 2 (permanent ids), Step 3 and Close out
  (landing).
- `skills/shared/iteration-steps.md`: concern tags and roadmap seeding.
- `skills/inception/templates/workflow.md`, `roadmap.md` and `prior-art.md`.
- `docs/constitution.md` and `docs/architecture.md`: the target text under
  Foundation-doc changes, nothing else.
- `docs/workflow.md`: the spec-naming lines.
- `docs/prior-art.md`: an `Also feeds:` line under the one concern that backs
  two rows.
- `scripts/verify.sh`: the comment at line 346, and guard 13 if G1 is A.

### Out of scope

- The review bound, which is its own phase (feature: review-bound).
- A guard in target projects: whether a project checks the no-citation rule is
  its own choice, and no loopkit template ships one.
- Rewriting the Decision logs of archived specs, which are frozen.
- Renumbering anything in loopkit's roadmap, whose Features rows carry slugs.
- A lettered issue outline in the template's Tracking section: `Lands:` names
  an Outcome instead.
- relay's own rules (date markers in rule docs, test-double naming, a spec
  budget) and the `CLAUDE.md` autonomy grant.

## Constraints

- Body-size guard (`scripts/verify.sh` guard 11): each `SKILL.md` body stays at
  most 12,800 bytes. Today plan is at 12,769 and implement at 12,718. New
  instruction text goes into the spec template,
  `skills/plan/references/acceptance.md` or
  `skills/implement/references/issue-contract.md`. Issue A's three removals in
  plan's steps 2, 4 and 6 free about 60 bytes, which leaves about 90 for issue
  B's step-6 sentence, for example "Check each Foundation-doc change's
  `Replaces` and `After:` text against its doc." An edit that adds bytes to a
  `SKILL.md` body frees the same room in that body.
- Plugin paths follow the constitution's Conventions (guard 7). The spec
  template is copied into target projects, so it names no plugin path.
- Templates carry no project-specific values (constitution Quality gates).
- The trust boundary is unchanged.
- The loops run the installed release (2.4.x), whose skills do not know these
  rules yet. Each issue's `Acceptance:` states what the rules ask of that
  issue. Issue B's names the architecture change it applies and its
  ratification (this spec, PR #338), so the per-PR review judges the diff
  against the ratified text. The installed `acceptance.md` has no step that
  applies a `spec PR` change, so this cycle's planner applies the corollary
  verbatim on the spec branch, beside the roadmap-link commit, before the
  acceptance merge.
- Issues A and B change behavior for every project on loopkit. Their PRs are
  `feat:` commits, so `/loopkit:ship` computes a minor, and the changelog names
  both.

## Foundation-doc changes

This spec's own changes, in the shape O3 introduces. Vision: none.

### docs/constitution.md — Architecture principles, "Clarification belongs to planning": MODIFIED

Lands: spec PR. This is a rule that holds once adopted. This milestone already
follows it, and it licenses issue B to apply the architecture change verbatim.

Replaces:

```text
  spec), which resolves it at the spec-acceptance gate. Corollary: foundation-doc
  edits (vision/constitution/architecture) belong to planning too — authored in a
  `/loopkit:plan` spec PR and ratified at the spec-acceptance gate, never in
  `/loopkit:implement`, never left as a dangling draft.
```

Target text:

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

Lands: with the issue that builds O5 (issue B).

Replaces (flow 2, its last two lines):

```text
   1..n roadmap rows + backing prior-art; a foundation-doc impact is recorded onto
   the seeded phase (edited later in that phase's plan cycle), never here.
```

Target text:

```text
   1..n roadmap rows + backing prior-art; a foundation-doc impact is recorded onto
   the seeded phase (authored later as target text in that phase's plan cycle),
   never here.
```

Replaces (flow 3, the whole item):

```text
3. **Plan cycle (producer):** roadmap phase (human-pointed) -> sort decisions
   (+ prior-art) -> spec (with prior-art links) -> [if UI surface OR a
   decision-clarifying visualisation: `/loopkit:design` delivers/produces a design
   per `docs/design.md`, committed as a file and referenced by the spec] ->
   in-session review -> **spec-acceptance gate (human, reviews the design too)** ->
   milestone + roadmap link on the spec branch -> merge -> issues with two-level
   `depends-on`.
```

Target text:

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

Replaces (flow 4, its third line):

```text
   the frontier (each: worktree -> implement -> Verify -> review -> merge, or
```

Target text:

```text
   the frontier (each: worktree -> implement, applying a ratified foundation-doc
   change verbatim when the issue carries one -> Verify -> review -> merge, or
```

### docs/constitution.md — Conventions, the specs line: MODIFIED (only if G1 is A)

Lands: with the issue that builds O6 and O7 (issue C), once `scripts/verify.sh`
cites no spec and guards the rule.

Replaces:

```text
- Foundation docs in `docs/`; specs in `docs/specs/`, archived to
  `docs/specs/archive/`.
```

Target text:

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
    points at the living text) and its delta kinds; AVOID per-capability main
    specs and merging only at archive time.
  - Docs-as-code: ADOPT the doc change in the PR that changes behavior; AVOID a
    CI drift check.
- [Non-UI concept design + the durable diagram medium (feature: design-in-the-loop)](../prior-art.md#non-ui-concept-design--the-durable-diagram-medium-feature-design-in-the-loop)
  — the ADR entry: the decision shape loopkit's Prior decisions and Decision
  log already follow, and its AVOID of lifecycle status.
- [Process-PR overhead — ceremony telemetry (feature: ceremony-overhead)](../prior-art.md#process-pr-overhead--ceremony-telemetry-feature-ceremony-overhead)
  — measure ceremony and drive it down, and AVOID a new artifact type as the
  fix (this spec adds a spec section, not a new artifact).

## Human prerequisites

none

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| One phase with one issue per rule (A–D). | The four rules share the spec template, the issue contract, plan and the roadmap skill, and one release carries them (sparring 2026-11-04). | 2026-11-04 |
| Planning records only Prior decisions rows: before acceptance, and in a re-plan that answers a `needs:planning` design fork. The Decision log holds the implementation choices made during implementation, written pre-merge on the issue branch, with implement's QA-gate sweep as the catch-all. | The human adopted 1b in the sparring: two records of one decision duplicate each other. The split by author matches the template's own wording ("Decisions made during implementation"). | 2026-11-04 |
| A Decision-log entry is an "implementation choice", not a "design fork". | The issue contract and the workflow template already use "design fork" for the `needs:planning` escalation. A fork that changes the spec's design is a planning defect and is escalated, never chosen by the implementer (constitution, "Clarification belongs to planning"). What may reach the log is a choice the spec leaves free on purpose, which matches Nygard's significance filter. | 2026-11-04 |
| The definition lives once, in the spec template's Decision log section. The issue contract states the rule in its own sentence (implementation choices only, everything else in the commit or PR body) and points at that section (`../../plan/templates/spec-template.md`); implement's sweep and plan use the same term. | The section is where entries are written. A template is a plugin-shipped artifact a skill may point at (`skills/shared/iteration-steps.md`), while a copied template cannot point at a plugin path. A new shared file for three sentences is the ceremony the ceremony-overhead entry warns about. relay shows the implementer acts on the contract sentence itself, so that sentence carries the rule as well as the pointer. | 2026-11-04 |
| A Foundation-doc change uses OpenSpec's delta kinds. MODIFIED has `Replaces:` and `Target text:`, ADDED has `After:` (the verbatim line it follows) and `Target text:`, and REMOVED has `Replaces:`. The texts sit in fenced `text` blocks at column 0. `Lands:` names an Outcome or `spec PR`. | OpenSpec delta specs (prior art). Column-0 blocks make the apply and the review a plain text comparison. The template and plan forbid a step list in the spec, so the landing cannot name an issue letter, while every spec has Outcomes. | 2026-11-04 |
| A change that describes behavior lands with the issue PR that builds it. Acceptance assigns each change not landing with the spec PR to exactly one issue, the last one building its Outcome, and that issue's `Acceptance:` reads "applies the ratified <doc> change (<section>) from the spec verbatim". A rule that holds once adopted lands with the spec PR: the planner applies it on the spec branch beside the roadmap-link commit, before the acceptance merge. | The handoff's rule. One owner per change keeps the always-loaded docs true at every merge. | 2026-11-04 |
| A change is pending while its spec is still in `docs/specs/` (not archived) and its doc does not yet contain its target text verbatim; a REMOVED change is pending while its doc still contains its `Replaces` text. A new change to the same text is written against the pending target text, the milestone takes a `Depends on milestone:` edge to the pending spec's milestone, and the acceptance review compares against that pending text. The rule sits in the template section and in `acceptance.md`. | No issue lookup is needed: the repo shows it. The constitution's two-level dependency representation is the existing mechanism, and it keeps each verbatim apply exact. | 2026-11-04 |
| The implementer applies the target text verbatim, and a needed wording change is `needs:planning`. The per-PR review receives the issue's target text and checks that the diff carries it exactly. | "Never authored in `/loopkit:implement`" stays true: the implementer copies ratified text and authors none. | 2026-11-04 |
| This spec's constitution corollary lands with the spec PR; its architecture flows land with issue B. | The corollary is a rule that holds once adopted. The current corollary already allows it ("authored in a `/loopkit:plan` spec PR"), and once on `main` it licenses issue B's verbatim apply, which a reviewer seeded with the old wording could otherwise refuse. The flows describe what plan, implement and roadmap do, and issue B builds that. | 2026-11-04 |
| A spec citation is a concrete spec file name (`spec-<slug>.md`, live or archived) in a tracked file outside `docs/`, root files included. Path patterns (`spec-<scope>.md`, `spec-*.md`, `spec-$scope.md`) and `spec-template.md` are not citations. The issue, the commit body and the PR keep referencing the spec. | The handoff's rule. Skill prose has to name the path convention, and today no root file cites a spec. | 2026-11-04 |
| `scripts/verify.sh:346` points at the living rules instead: the constitution's Conventions for plugin paths, and each guard's own comment for its rule. | `docs/specs/spec-skill-structure.md` has moved to the archive, the very rot this rule prevents. | 2026-11-04 |
| If G1 is A, guard 13 in `scripts/verify.sh` runs `git grep -n -E 'spec-[a-z0-9][a-z0-9-]*\.md' -- ':!docs'`, drops the lines naming `spec-template.md`, and fails on any line left, naming the file and line. loopkit's `docs/workflow.md` then points at the Conventions line instead of restating it. | Tested on 2026-11-04: the pattern finds exactly `scripts/verify.sh:346` and `skills/plan/SKILL.md:105` (`spec-template.md`); `spec-<scope>.md`, `spec-*.md` and `spec-$scope.md` do not match, and the regex does not match its own text. Pointing at the Conventions keeps the rule in one place. | 2026-11-04 |
| A concern header keeps the tag it was created with — `(Phase N)`, `(Phase N, M)`, `(feature: <slug>)` or `(feature: <slug>, <slug>)`, one kind per header — and is never edited for a later row. A row that later draws on the concern is added to an `Also feeds:` line directly under the header. "Prior art for phase N" reads the header and that line. loopkit's "Worktree resume & merge-conflict recovery" concern gains `Also feeds: (feature: implement-conflict-recovery)`. | A header is a link target: two archived specs link this very header by its anchor. A tag that grows with every row would break those links on each extension, or make every extension repoint them. A permanent header fits the permanent-id rule. No code parses the tags, and the status pane's unplanned-phase rule reads only the Spec and Milestone cells. | 2026-11-04 |
| OPEN — G1: do loopkit's own constitution Conventions carry the no-spec-citation rule? A: yes, with guard 13 in `scripts/verify.sh` (O7). B: no; the rule lives in the skills and templates, and `scripts/verify.sh:346` is fixed either way. | resolved at the spec-acceptance gate | — |

## Tracking

- Milestone: created at acceptance.
- Issues, one per step, created after the merge:
  - **A — The Decision log records implementation choices (O1, O2).** The
    spec template's Decision log section; `issue-contract.md`'s
    source-checkout and commit steps and its merge note; implement's QA-gate
    sweep; plan's steps 2, 4 and 6.
  - **B — Foundation-doc changes land with their PR (O3, O4, O5).** Depends on
    A. The template's Foundation-doc changes section and Verification item;
    `acceptance.md`; `issue-contract.md`'s Implement step and review gate;
    plan's step 6 review (step 3 stays as it is, since the template section
    instructs the planner); the roadmap skill's Step 3 and Close out; the
    workflow template's roadmap-loop text; and this spec's architecture change,
    applied verbatim.
  - **C — No spec citation outside `docs/` (O6, O7).** Depends on B.
    `issue-contract.md`'s Implement step; implement's archive move; the
    workflow template; `docs/workflow.md`; `scripts/verify.sh:346`; and, if G1
    is A, the Conventions change, applied verbatim, and guard 13.
  - **D — A phase number is a permanent id (O8).** Depends on B. The roadmap
    and prior-art templates; `skills/shared/iteration-steps.md`; the roadmap
    skill's Step 2; the `Also feeds:` line in `docs/prior-art.md`.
- C and D touch disjoint files and can run in parallel.

## Verification

- [ ] `bash scripts/verify.sh` passes, the body-size guard included.
- [ ] `git grep -n -i -E "any (resulting )?decision" -- skills` finds nothing.
  The issue contract and implement's QA-gate sweep say "implementation choice",
  and the contract points at the spec template's Decision log section, which
  says a design fork still escalates `needs:planning`.
- [ ] `grep -n "Decision log" skills/plan/SKILL.md` finds nothing: plan's steps
  2, 4 and 6 write a Prior decisions row.
- [ ] The spec template has the Foundation-doc changes section (the three
  kinds with their parts, column-0 blocks, `Lands:`, the pending-change rule,
  `none`) and a Verification item that every change landed.
- [ ] `acceptance.md` assigns each change that does not land with the spec PR
  to one issue and applies a `spec PR` change before the merge; `issue-contract.md` has the verbatim apply, the
  `needs:planning` route and the review check; plan's step 6 checks the
  `Replaces` and `After:` texts.
- [ ] Every Foundation-doc change of this spec is on `main` verbatim, landed
  where its `Lands:` line says: the corollary in the spec PR's merge commit,
  the architecture flows in issue B's PR, and the Conventions line (if G1 is
  A) in issue C's PR. QA compares each fenced target text with the doc.
- [ ] `git grep -n -E 'spec-[a-z0-9][a-z0-9-]*\.md' -- ':!docs'` finds only
  `spec-template.md` lines. If G1 is A, Verify fails on a planted citation
  outside `docs/` and passes once it is removed.
- [ ] The roadmap and prior-art templates, `iteration-steps.md` and the
  roadmap skill's Step 2 state the permanent-id rule, the row-order queue and
  the `Also feeds:` line. The worktree-resume concern header is unchanged, its
  `Also feeds:` line names `implement-conflict-recovery`, and both archived
  links to it still resolve.
- [ ] Smoke (the QA-gate default, review plus a run of the changed skill): a
  fresh-context subagent given only the changed skills answers where a choice
  made during implementation goes, where a test helper goes, what happens to a
  design fork, where a constitution change for a new behavior lands, and what
  number a new roadmap phase takes, and each answer matches this spec.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| A `SKILL.md` body passes 12,800 bytes. | The Constraints route new text into the template and the references; Verify's body-size guard fails the PR otherwise. |
| This milestone's implementers run the installed 2.4.x skills and do not know the new rules. | Each issue's `Acceptance:` states what the rules ask of it. The corollary is on `main` before issue B runs, and B's `Acceptance:` names its ratified architecture change. |
| A planner skips the Foundation-doc changes section. | The template asks for `none` explicitly, and plan's spec-acceptance review checks the section. |
| Two specs change the same text before either lands. | The pending-change rule writes the later text against the earlier and adds a milestone edge. |
| If G1 is A, guard 13 flags a changelog entry that names a spec: `/loopkit:ship` drafts entries from PR and commit bodies, which reference the spec. | Ship's curation keeps spec paths out of changelog entries, and Verify runs before the tag, so a slip fails before anything is published. |
| Guard 13 flags a future non-spec file named `spec-<x>.md` outside `docs/`. | Its failure names the file and line; the file is renamed, or the guard's exclusion is widened in that PR. |

## Decision log

- 2026-11-04: Drafted. The planning decisions are the Prior decisions rows;
  under this spec's own rule (O2) they get no second record here.
