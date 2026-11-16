# Spec: checks-not-lines — measure a phase spec by its checks and its structure

> Created: 2026-11-16

A phase spec is measured by whether every contract has its check and by how
many issues it plans, never by its line count. Growth during review is judged
by its cause, and the reviewed detail stays in the spec. This spec carries no
lifecycle state: acceptance is the spec merged on the default branch with a
milestone and issues. A completed spec is moved to `docs/specs/archive/`.

## Outcome

- [ ] O1. **Every contract has its check.**
  - The spec template numbers Outcomes (`- [ ] O1. …`) and Constraints
    (`- C1. …`). Each Verification item ends with the ids it checks, in
    parentheses: `(O1, C2)`.
  - Every Outcome id and every Constraint id appears in at least one
    Verification item. A check is a Verify guard, a test, or a QA-gate item (a
    smoke scenario or a review check). A machine check still gets its own
    Verification line, which names the guard or the test.
  - A line that no check can cover is not a Constraint. Sequencing goes to
    Tracking. A probe, a measurement or history goes to the spec PR body. An
    assumption or a risk goes to Risks and mitigations.
  - The pre-mortem (plan step 4) builds the mapping, and the spec-acceptance
    review (step 6) checks it. A contract without a check is a blocking
    planning finding in `skills/shared/review-bound.md`.
- [ ] O2. **A phase is sized by its structure.**
  - **The limit.** A phase plans at most three implementing issues. The QA
    gate is the orchestrator's stop, not an issue. Nothing in loopkit counts a
    spec's lines.
    - The rule and its default of three are stated once, in
      `skills/shared/iteration-steps.md` (Roadmap seeding).
    - The workflow template states the number in one fixed line under
      "Proportional tracks", and a project may change it. loopkit's own
      `docs/workflow.md` gains the same line beside its "Proportional tracks"
      bullet.
    - Plan, roadmap seeding and the review read "the phase-size limit" from
      the contract. Where the contract has no such line, or does not exist yet
      (inception seeds the roadmap before it writes the contract), they use the
      shared default.
  - **The cut.** The spec's Tracking section lists the planned issues. Each
    line gives the Outcomes the issue builds, the files it touches and its
    `Depends on`. It never lists the steps inside an issue. Acceptance creates
    exactly those issues. These lines change to match:
    - plan step 3: `No step list inside the spec — steps live as issues.` →
      `No step list inside the spec: Tracking lists the planned issues (the
      cut), and the issues own their steps.`;
    - the chain rule in the workflow template and `docs/workflow.md`:
      `The spec never lists steps; the issues never restate the design.` →
      `The spec lists its planned issues, never their steps; the issues never
      restate the design.`;
    - the spec template's Tracking text, and both "implementable step" lines
      in `acceptance.md` §2, which now point at the Tracking cut.
  - **Counting.** The limit counts the issues one `/loopkit:plan` run plans
    for its scope. Review follow-ups and QA-gate fix issues are filed later and
    do not count. A `track:adhoc` issue belongs to no phase.
  - **A living-spec re-run** has no spec PR and no gate. It creates at most
    the limit's issues. Known work beyond that waits for a re-run after this
    batch's QA gate. A re-run does not edit the spec's Tracking: its issues
    accrete on GitHub. `living-spec.md` states this.
  - **The split.** A planned cut over the limit splits in the pre-mortem.
    `skills/plan/references/split.md` holds the mechanics, and step 4 reads it
    only then.
    - The spec keeps a first part within the limit.
    - The text of each part that moves out leaves the original roadmap row
      and goes to a new row, together with that part's share of the Foundation
      impact line. The new row takes the next free phase number, or a new
      feature slug, and its Spec and Milestone cells are `—`. Each row names
      the other: `split into <id>` and `split from <id>`.
    - Every prior-art concern backing the original row lists the new id on its
      `Also feeds:` line, adding the line if it has none.
    - The row form and the permanent id follow `iteration-steps.md` (Roadmap
      seeding), and plan becomes that file's third reader.
    - Step 5 stages `docs/roadmap.md` and `docs/prior-art.md` with the spec, so
      the split rides the spec PR and the gate shows it. The same run does not
      plan the new rows; a later `/loopkit:plan` does.
  - A cut over the limit is a blocking planning finding.
  - Roadmap seeding sizes each seeded phase to the limit, so a phase that is
    too large is seeded as several rows.
  - The constitution's "Proportional ceremony" principle and the architecture
    carry the rule (Foundation-doc changes below).
- [ ] O3. **Growth by cause.** `skills/shared/review-bound.md` states:
  - In planning, a fix that closes a finding grows the spec as far as closing
    it needs. Scope growth is a blocking finding: a fix that adds a new
    outcome, route, command, schema field or foundation-doc change that no
    blocking finding asked for. The planner takes the added scope out of the
    spec and carries it to the spec-acceptance gate as an `OPEN` Prior
    decisions row. If the human accepts it there, it enters the spec with its
    id and its Verification citation, like any contract.
  - In an issue PR, growth stays inside the spec's contracts. A new outcome,
    route, command, schema field or foundation-doc change that the spec does
    not contain escalates `needs:planning`, whether a finding asked for it or
    not.
  - No rule in the bound stops on size, and the floor forbids a project's
    tightening that does.
- [ ] O4. **Details stay in the spec.**
  - A planned issue's body carries its `Goal:`, `Acceptance:`, `Depends on:`
    and `Spec:` lines and nothing the spec does not say. A detail an issue
    would need goes into the spec before acceptance.
  - An issue's `Acceptance:` mirrors each Verification item, or the part of
    one, that checks a file the issue touches, as named by its Tracking line.
    So an Outcome that two issues build gives each issue the part on its own
    files. An item that checks the whole milestone (a smoke run, or a check
    over the milestone's diff) says so and stays with the QA gate alone. A
    foundation-doc change whose Outcome two issues build lands with the last
    of them by `Depends on`.
  - The spec PR body carries the rationale, probes and history the spec leaves
    out. A Prior decisions row keeps only the rationale an implementer needs to
    judge an edge case.

## Scope

### In scope

- `skills/shared/review-bound.md`, `skills/shared/iteration-steps.md`.
- `skills/plan/SKILL.md` steps 2–6, the new references `split.md`,
  `design-surface.md` and `source-checkout.md`, `acceptance.md`,
  `living-spec.md`, and the spec template.
- The workflow template and loopkit's own `docs/workflow.md`.
- `docs/constitution.md` and `docs/architecture.md` (below).

### Out of scope

- Archived specs, which are frozen, and the issue bodies of closed milestones.
- Review follow-up issue bodies (`review-bound.md`, "Ending the gate"): a
  follow-up describes a finding, not a design.
- A Verify guard that parses the id mapping.
- The relay project's own workflow contract.

## Constraints

- C1. `skills/plan/SKILL.md`'s body stays at or under 12,800 bytes (Verify
  guard 11). Step 4 stays in the core. The room comes from two passages that
  only some runs need, each moved to a reference behind a one-line pointer
  that says when to read it:
  - step 2's source-checkout passage (from "When a `docs/prior-art.md` verdict
    is too coarse" to "Only when it hardens a real decision.") goes to
    `references/source-checkout.md`;
  - step 3's "Design surface" bullet goes to `references/design-surface.md`.
- C2. Each new reference (`split.md`, `design-surface.md`,
  `source-checkout.md`) carries the relative-paths line within its first five
  lines, writes plugin paths relative to itself, is linked from the core as
  `${CLAUDE_SKILL_DIR}/references/<file>`, and ends with an end line.
- C3. `skills/implement/SKILL.md` and
  `skills/implement/references/issue-contract.md` stay unchanged.
- C4. `skills/inception/SKILL.md` stays unchanged, and the workflow
  template's phase-size line is fixed text, not a placeholder.
- C5. No new planning artifact, label, spec section or gate.

## Foundation-doc changes

### docs/constitution.md — Architecture principles, "Proportional ceremony": MODIFIED

Lands: Outcome 2

Replaces:

```text
- **Proportional ceremony.** Three tracks, each change uses exactly one:
  full-spec (a feature), a living-spec milestone (an ongoing theme), a
  `track:adhoc` fast-lane (a bug/QoL change — no spec, no milestone).
```

Target text:

```text
- **Proportional ceremony.** Three tracks, each change uses exactly one:
  full-spec (a feature), a living-spec milestone (an ongoing theme), a
  `track:adhoc` fast-lane (a bug/QoL change — no spec, no milestone). A phase
  is sized by its structure, never by its line count: it plans at most the
  workflow contract's limit of implementing issues, and a larger phase splits.
```

### docs/architecture.md — Components, the `skills/plan/` row: MODIFIED

Lands: Outcome 2

Replaces:

```text
| `skills/plan/` | Producer: roadmap phase -> spec (+ prior-art links) -> milestone + issues with two-level `depends-on` |
```

Target text:

```text
| `skills/plan/` | Producer: roadmap phase -> spec (+ prior-art links) -> milestone + issues with two-level `depends-on`; splits a phase over the phase-size limit into new roadmap rows, reading `skills/shared/iteration-steps.md` |
```

### docs/architecture.md — Components, the `skills/shared/` row: MODIFIED

Lands: Outcome 2

Replaces:

```text
| `skills/shared/` | Plugin-shipped shared references, not skills: `iteration-steps.md` (prior-art challenge / architecture seed / roadmap seeding — inception, roadmap), `preflight.md` (the `gh`/`git` preflight — inception, plan, implement, roadmap, ship), `trust-boundary.md` (read-discipline, shell-hygiene, capability separation — plan, implement, roadmap, ship), `needs-you.md` (the `Needs you:` line, the one form of a request to the human the run does not wait for — inception, plan, implement, roadmap, ship), `review-bound.md` (the agent-review bound: finding classes, rounds, review notes, follow-ups — plan, implement) |
```

Target text:

```text
| `skills/shared/` | Plugin-shipped shared references, not skills: `iteration-steps.md` (prior-art challenge / architecture seed / roadmap seeding and the phase-size limit — inception, roadmap; plan for a split), `preflight.md` (the `gh`/`git` preflight — inception, plan, implement, roadmap, ship), `trust-boundary.md` (read-discipline, shell-hygiene, capability separation — plan, implement, roadmap, ship), `needs-you.md` (the `Needs you:` line, the one form of a request to the human the run does not wait for — inception, plan, implement, roadmap, ship), `review-bound.md` (the agent-review bound: finding classes, rounds and growth by cause, review notes, follow-ups — plan, implement) |
```

### docs/architecture.md — Key flows, flow 3: MODIFIED

Lands: Outcome 2

Replaces:

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

Target text:

```text
3. **Plan cycle (producer):** roadmap phase (human-pointed) -> sort decisions
   (+ prior-art) -> spec (with prior-art links and any foundation-doc change as
   target text) -> [if UI surface OR a decision-clarifying visualisation:
   `/loopkit:design` delivers/produces a design per `docs/design.md`, committed
   as a file and referenced by the spec] -> pre-mortem (every contract mapped
   to its check; a cut over the phase-size limit splits into new roadmap rows
   on the spec branch) -> in-session review ->
   **spec-acceptance gate (human, reviews the design too)** -> milestone +
   roadmap link (+ a foundation-doc change that lands with the spec PR) on the
   spec branch -> merge -> issues with two-level `depends-on`.
```

## Prior art

- [Checks, not lines — contract-to-check mapping, structural phase size, growth by cause (feature: checks-not-lines)](../prior-art.md#checks-not-lines--contract-to-check-mapping-structural-phase-size-growth-by-cause-feature-checks-not-lines)
  - The relay and loopkit evidence: line rules that fired on fork-closing
    fixes, and loopkit's specs and phases growing without a structural limit.
  - Spec Kit's coverage gaps: ADOPT coverage keyed by an id; AVOID a separate
    command and report (C5).
  - OpenSpec's scenarios: ADOPT a contract named together with its check (the
    id citation); AVOID one fixed scenario syntax.
  - Knip, Goodhart/Strathern: measure the defect; a line count is telemetry,
    never a budget.
  - DORA small batches: size by independently completable units (issues).
- [Process-PR overhead — ceremony telemetry (feature: ceremony-overhead)](../prior-art.md#process-pr-overhead--ceremony-telemetry-feature-ceremony-overhead)
  — the ceremony number this phase refines: lines per change stay telemetry.
- [Review bound — round-limited agent review with blocking classes (feature: review-bound)](../prior-art.md#review-bound--round-limited-agent-review-with-blocking-classes-feature-review-bound)
  — the bound that growth by cause extends.

## Human prerequisites

none

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| The mapping covers every Outcome as well as every Constraint. | The rule is "every contract has its check", and the QA gate derives its scenarios from Verification. An Outcome that no Verification item names is never checked. | 2026-11-16 |
| The mapping is a citation: ids on Outcomes and Constraints, cited at the end of each Verification item. There is no separate table or report. | A missing check can be found at review and by grep, and the spec gains no section (C5). | 2026-11-16 |
| A line no check can cover is routed by kind: sequencing to Tracking, a probe or history to the PR body, an assumption to Risks. | Otherwise the rule forces fake checks or deletes context an implementer needs. | 2026-11-16 |
| The limit is a loopkit default of three, stated once in `iteration-steps.md`. The workflow template states the number as fixed text, and a project may change it. | Precedent: the iteration ceiling's template default, the review bound's template default, and the contract's Precedence layer 4 ("the skills' defaults"). The principle is loopkit's, and the number is a project specific. | 2026-11-16 |
| Tracking lists the cut: per issue its Outcomes, files and `Depends on`, never its steps. The chain rule is reworded to match. This reverses `artifact-hygiene`'s out-of-scope note on an issue outline. | The size must be checkable at the gate, and files and `Depends on` are what the reviewer checks the order against. The issues still own the steps. | 2026-11-16 |
| The planner splits an oversize phase in the pre-mortem. The moved text leaves the original row, and every backing concern gains the new id. | A split takes new ids (the permanent-id rule), and no row text is duplicated. The gate already reviews the spec PR, so no new stop is needed. | 2026-11-16 |
| The limit counts one plan run's issues. A living-spec re-run creates at most the limit's issues, and the rest waits for a re-run after the batch's QA gate. | The limit bounds what one gate reviews and one QA run covers. A re-run has no gate, so its batch is the unit. | 2026-11-16 |
| Growth by cause has two routes: in planning, scope growth goes to the gate as an `OPEN` row; in an issue PR, any new scope escalates `needs:planning`. | Foundation-doc edits are never authored in `/loopkit:implement` (constitution), and a design beyond the spec is a fork (issue contract). | 2026-11-16 |
| The floor forbids a tightening that stops on size. | A size stop is the defect this phase removes. Line counts stay telemetry. | 2026-11-16 |
| An issue's `Acceptance:` takes the Verification items, or their parts, on the files it touches. Whole-milestone items stay with the QA gate. | Files are what an issue can check in its own PR, and the Tracking line names them. Citing Outcomes says which contract an item covers, not which issue builds it. | 2026-11-16 |
| The constitution gains the size rule only. | "Never by its line count" is a binding don't. The check mapping is mechanism, and the constitution is always loaded. | 2026-11-16 |
| Step 4 stays in the core, and two passages that only some runs need move out (C1). | References hold "subagent-only or some-runs-only detail" (architecture), and the pre-mortem runs on every run before the gate. | 2026-11-16 |

## Tracking

- Milestone: created at acceptance, `Depends on milestone: none`.
- Planned issues (three, the limit):
  - **A — The review bound** (O3; the planning classes of O1 and O2).
    Files: `skills/shared/review-bound.md`. Depends on: none.
  - **B — The check mapping and details in the spec** (O1, O4). Files: plan
    steps 2–6, `source-checkout.md`, `design-surface.md`, `acceptance.md`, the
    spec template. Depends on: none.
  - **C — Phase size and the split** (O2). Files: plan steps 3–5, `split.md`,
    `acceptance.md`, `living-spec.md`, the spec template, `iteration-steps.md`,
    the workflow template, `docs/workflow.md`, `docs/constitution.md`,
    `docs/architecture.md`. Depends on: A, B (the foundation-doc changes
    describe both).

## Verification

- [ ] `bash scripts/verify.sh` passes, including the body-size,
  reference-link and plugin-path guards. (C1, C2)
- [ ] Plan step 4 is in the core. Steps 2 and 3 point at the moved passages,
  each with when to read it. Each new reference opens with the relative-paths
  line and ends with an end line. (C1, C2)
- [ ] The spec template numbers Outcomes and Constraints, asks for id
  citations in Verification, requires every id to be cited, routes a line no
  check can cover, lists the cut in Tracking, and limits Prior decisions
  rationale to what an edge case needs. (O1, O2, O4)
- [ ] Step 4 builds the mapping, routes non-contract lines and counts the cut
  against the limit. `split.md` splits as in O2. Step 5 names the PR body's
  content and stages a split's files. Step 6 asks the reviewer whether each id
  has its check and the cut fits the limit. (O1, O2, O4)
- [ ] `review-bound.md` states growth by cause with both routes, the two new
  planning classes, and a floor that names size. (O1, O2, O3)
- [ ] `acceptance.md` creates exactly the Tracking cut, limits an issue body
  to its four lines and the spec's content, states the Acceptance mapping, and
  counts a split's rows among the roadmap changes on the spec branch.
  (O2, O4)
- [ ] `iteration-steps.md` states the rule and the default once. The workflow
  template and `docs/workflow.md` carry the phase-size line, `living-spec.md`
  the re-run rule, and plan step 3, the chain rule (in both places), the spec
  template and `acceptance.md` the reworded cut lines. (O2, C4)
- [ ] The constitution change and the three architecture changes landed
  verbatim with issue C's PR. (O2)
- [ ] Over the milestone, `skills/implement/SKILL.md`,
  `skills/implement/references/issue-contract.md` and
  `skills/inception/SKILL.md` are unchanged, and the diff adds no label, no
  spec section and no gate. (C3, C4, C5)
- [ ] Smoke (the QA-gate default): a fresh-context subagent is given only the
  changed files, and each answer matches this spec. (O1, O2, O3, O4, C5)
  - A spec whose Constraint no Verification item cites: blocking at review.
  - A Constraint "issue B depends on #12": moves to Tracking.
  - Five planned issues under the default: a split, with new rows, moved
    text, `Also feeds:` lines and the rows shown at the gate.
  - A project contract with no phase-size line: the limit is three.
  - A living-spec re-run with five known items: three now, the rest after
    the batch's QA gate.
  - A round-2 planning fix adds 40 lines to close a fork the reviewer named:
    expected, not stopped.
  - A round-2 planning fix adds a command no finding asked for: blocking, and
    it becomes an `OPEN` row.
  - An issue-PR reviewer asks for a new schema field: `needs:planning`.
  - A project tightening "a spec over 250 lines stops the cycle": the floor
    forbids it.
  - An issue body draft with a design detail the spec lacks: the detail goes
    into the spec instead.
  - A byte measurement taken while planning: it goes in the spec PR body.
  - A review follow-up in a three-issue milestone: it does not count.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Id citations feel like noise, and planners skip them. | The review blocks on a missing check, and the template shows the form. |
| A split row is weaker than a sparred one. | It keeps its backing concerns and its share of the Foundation impact line, and the gate shows it before it lands. |
| The scope-growth class misfires on a planning fix that needs a new field to close a fork. | Only growth no blocking finding asked for counts there. |
| This milestone's implementers follow the pre-change skills on `main`. | The rules govern planning, and issue C lands the foundation changes last. |

## Decision log

Implementation choices only (see the template). None yet.
