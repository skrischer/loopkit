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
  - The pre-mortem builds the mapping, and the spec-acceptance review checks
    it. A contract without a check is a blocking planning finding in
    `skills/shared/review-bound.md`.
- [ ] O2. **A phase is sized by its structure.**
  - A phase plans at most three implementing issues, plus the QA gate. The
    workflow template states the limit in one line under "Proportional
    tracks", and a project may change the number. A contract without the line
    means three. Nothing in loopkit counts a spec's lines.
  - The spec's Tracking section lists the planned issues, one line each, naming
    the Outcomes the issue builds. Acceptance creates exactly those issues.
  - The limit counts the issues one `/loopkit:plan` run plans for its scope:
    for a full-spec phase, the cut at acceptance; for a living-spec theme, each
    re-run's issues. Review follow-ups and QA-gate fix issues are filed later
    and do not count. A `track:adhoc` issue belongs to no phase.
  - A planned cut over the limit splits in the pre-mortem:
    - The spec keeps a first part within the limit.
    - Each remaining part becomes a new roadmap row with the next free phase
      number, or a new feature slug, with Spec and Milestone `—`. The row
      carries its share of the original row's Foundation impact line, and the
      backing prior-art concern gets an `Also feeds:` line for it.
    - The rows are staged with the spec in step 5, so they ride the spec PR
      and are shown at the gate. The same run does not plan them; a later
      `/loopkit:plan` does.
  - A cut over the limit is a blocking planning finding.
  - Roadmap seeding (`skills/shared/iteration-steps.md`) sizes each seeded
    phase to the limit, so a phase that is too large is seeded as several rows.
  - The constitution's "Proportional ceremony" principle carries the rule
    (Foundation-doc changes below).
- [ ] O3. **Growth by cause.** `skills/shared/review-bound.md` states:
  - A fix that closes a finding grows the change as far as closing it needs.
    No rule in the bound stops on size, and a project's tightening never does:
    the floor names it.
  - Scope growth is a blocking finding: a fix that adds a new outcome, route,
    command, schema field or foundation-doc change that no blocking finding
    asked for.
    - In planning, the planner takes the added scope out of the spec and
      carries it to the spec-acceptance gate as an `OPEN` Prior decisions row.
    - In an issue PR, the fix drops the added scope. If the finding cannot
      close without it, the issue escalates `needs:planning`.
- [ ] O4. **Details stay in the spec.**
  - A planned issue's body carries its `Goal:`, `Acceptance:`, `Depends on:`
    and `Spec:` lines and nothing the spec does not say. Its `Acceptance:`
    mirrors the spec's Verification items for the Outcomes it builds. A detail
    an issue would need goes into the spec before acceptance.
  - The spec PR body carries the rationale, probes and history the spec leaves
    out. A Prior decisions row keeps only the rationale an implementer needs
    to judge an edge case.

## Scope

### In scope

- `skills/shared/review-bound.md`: growth by cause, the scope-growth class and
  the two new planning classes.
- `skills/plan/SKILL.md` steps 4–6, a new `skills/plan/references/pre-mortem.md`,
  `skills/plan/references/acceptance.md` and
  `skills/plan/templates/spec-template.md`.
- `skills/inception/templates/workflow.md` and loopkit's own
  `docs/workflow.md`: the phase-size line.
- `skills/plan/references/living-spec.md`: a re-run plans within the limit.
- `skills/shared/iteration-steps.md`: roadmap seeding sizes phases.
- `docs/constitution.md`: one sentence in "Proportional ceremony".

### Out of scope

- Archived specs, which are frozen, and the issue bodies of closed milestones.
- Review follow-up issue bodies (`review-bound.md`, "Ending the gate"): a
  follow-up describes a finding, not a design.
- A Verify guard that parses the mapping. The review checks it; a guard is a
  later choice once the id form has settled.
- The relay project's own workflow contract.

## Constraints

- C1. `skills/plan/SKILL.md`'s body stays at or under 12,800 bytes (Verify
  guard 11). Step 4 in the core keeps its heading, its "not a new gate"
  framing and a pointer to `${CLAUDE_SKILL_DIR}/references/pre-mortem.md`
  saying to read it every run before step 5. The pre-mortem's bullets move
  into the reference.
- C2. `pre-mortem.md` follows the reference conventions: the relative-paths
  line within its first five lines, plugin paths relative to the file, and an
  end line.
- C3. `skills/implement/SKILL.md` and
  `skills/implement/references/issue-contract.md` stay unchanged. The issue
  contract reaches growth by cause through its existing pointer to
  `review-bound.md`, and it already defines the `needs:planning` escalation.
- C4. `skills/inception/SKILL.md` stays unchanged. The phase-size line is
  fixed template text, not a placeholder, so inception's "fill only the
  placeholders" holds. No template carries a project-specific value.
- C5. No new artifact, label, spec section or gate. The mapping uses ids in
  the existing Outcome, Constraints and Verification sections. A split and a
  scope decision both surface at the spec-acceptance gate.

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
| The mapping is a citation: ids on Outcomes and Constraints, cited at the end of each Verification item. There is no separate table or report. | A missing check can be found at review and by grep, and the spec gains no section (C5; the Spec Kit AVOID). | 2026-11-16 |
| A line no check can cover is routed by kind: sequencing to Tracking, a probe or history to the PR body, an assumption to Risks. | Otherwise the rule forces fake checks or deletes context an implementer needs. | 2026-11-16 |
| Tracking lists the planned issues with the Outcomes each builds. This reverses `artifact-hygiene`'s out-of-scope note on an issue outline. | The size rule must be checkable at the gate, and acceptance already ties a foundation-doc change to the issue that builds its Outcome. A line naming Outcomes is a cut, not a step list: the issues still own the steps. | 2026-11-16 |
| The planner splits an oversize phase in the pre-mortem, into new roadmap rows on the spec branch. | A split takes new ids (the permanent-id rule). The gate already reviews the spec PR, so no new stop is needed, and the rows hand off to a later `/loopkit:plan`. | 2026-11-16 |
| The limit counts one plan run's issues; follow-ups and QA fixes do not count. | The limit bounds what one gate reviews. Issues filed after acceptance come from the bound and the QA gate, not from the cut. | 2026-11-16 |
| Growth by cause applies to both reviews. Scope growth in planning goes to the gate as an `OPEN` row; in an issue PR it is dropped or escalated `needs:planning`. | `review-bound.md` is one bound for plan and implement. Both routes already exist, and neither adds a gate. | 2026-11-16 |
| The floor forbids a tightening that stops on size. | A size stop is the defect this phase removes. Line counts stay telemetry. | 2026-11-16 |
| The constitution gains the size rule only. The check mapping lives in the template, the pre-mortem and the bound. | "Never by its line count" is a binding don't. The mapping is mechanism, and the constitution is always loaded. | 2026-11-16 |
| The pre-mortem moves to `references/pre-mortem.md` (C1). | The plan core has about 20 bytes left. Step 4 is pre-gate method, not a stop, so it may move to a reference like the acceptance mechanics. | 2026-11-16 |
| OPEN — Is the phase-size limit a loopkit default with a per-project number, or a per-project rule only? | resolved at the spec-acceptance gate | — |

## Tracking

- Milestone: created at acceptance, `Depends on milestone: none`.
- Planned issues (three, the limit):
  - **A — The review bound (O3; the planning classes of O1 and O2).**
    `skills/shared/review-bound.md`.
  - **B — The check mapping and details in the spec (O1, O4).** Plan steps
    4–6, `pre-mortem.md`, `acceptance.md`, the spec template.
  - **C — Phase size (O2).** The workflow template, `docs/workflow.md`,
    `pre-mortem.md`, `acceptance.md`, `living-spec.md`, the spec template's
    Tracking, `iteration-steps.md`, and the constitution change. Depends on B, which
    touches the same files.

## Verification

- [ ] `bash scripts/verify.sh` passes, including the body-size,
  reference-link, plugin-path and guard-line guards. (C1, C2)
- [ ] Plan step 4 keeps its heading, its "not a new gate" framing and the
  pointer to `pre-mortem.md`. The reference opens with the relative-paths
  line and ends with an end line. (C1, C2)
- [ ] The spec template numbers Outcomes and Constraints, asks for id
  citations in Verification, requires every id to be cited, routes a line no
  check can cover, and limits Prior decisions rationale to what an edge case
  needs. (O1, O4)
- [ ] `pre-mortem.md` builds the mapping, routes non-contract lines, counts
  the planned cut against the limit and splits an oversize phase as in O2.
  Step 6 asks the reviewer whether each id has its check and the cut fits the
  limit. Step 5 names the PR body's content. (O1, O2, O4)
- [ ] `review-bound.md` states growth by cause, the scope-growth class with
  both routes, the two new planning classes, and a floor that names size.
  (O1, O2, O3)
- [ ] `acceptance.md` creates exactly the Tracking cut, limits an issue body
  to its four lines and the spec's content, and carries a split's rows on the
  spec branch. (O2, O4)
- [ ] The workflow template and `docs/workflow.md` carry the phase-size line,
  `iteration-steps.md` sizes seeded phases to it, and `living-spec.md` keeps
  a re-run within it. (O2, C4)
- [ ] The constitution change landed verbatim with issue C's PR. (O2)
- [ ] Over the milestone, `skills/implement/SKILL.md`,
  `skills/implement/references/issue-contract.md` and
  `skills/inception/SKILL.md` are unchanged, and the diff adds no label, no
  spec section and no gate. (C3, C4, C5)
- [ ] Smoke (the QA-gate default): a fresh-context subagent is given only the
  changed files, and each answer matches this spec. (O1, O2, O3, O4, C5)
  - A spec whose Constraint no Verification item cites: blocking at review.
  - A Constraint "issue B depends on #12": moves to Tracking.
  - Five planned issues under the default: a split, with a new row, an
    `Also feeds:` line and the rows shown at the gate.
  - A project contract with no phase-size line: the limit is three.
  - A round-2 fix adds 40 lines to close a fork the reviewer named: expected,
    not stopped.
  - A round-2 fix adds a command no finding asked for: blocking. In planning
    it becomes an `OPEN` row; in an issue PR it is dropped or escalated.
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
| A split row is weaker than a sparred one. | It keeps its backing concern and its share of the Foundation impact line, and the gate shows it before it lands. |
| The scope-growth class misfires on a fix that needs a new field to close a fork. | Only growth no blocking finding asked for counts. Closing a named fork is asked for by definition. |
| This milestone's implementers follow the pre-change skills on `main`. | The rules govern planning. Issue C lands the constitution change last. |

## Decision log

Implementation choices only (see the template). None yet.
