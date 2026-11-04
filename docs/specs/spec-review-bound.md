# Spec: review-bound

> Created: 2026-11-04

Bound an agent review by finding class and by round. Only a blocking finding
withholds the merge, and after one full review a later round checks the fixes
and raises only blocking findings. Non-blocking findings become a note in the
PR body, and a larger finding outside the change becomes its own issue. This
spec carries no lifecycle state — acceptance is the spec merged on the default
branch with a milestone and issues, and all progress lives in the GitHub issues
and milestone. A completed spec is moved to `docs/specs/archive/`.

## Outcome

- [ ] O1. `skills/shared/review-bound.md` defines the bound once:
  - **Blocking finding**: a violation of the issue's `Acceptance:`, the spec,
    the constitution, the project's contract (`docs/workflow.md`, and
    `docs/design.md` or `docs/release.md` where the skill reads them) or the
    `CLAUDE.md` rules the reviewer is seeded with; a red Verify; a defect in
    reachable behavior the change adds or alters; or a doc the change makes
    wrong. A blocking finding withholds the merge in whichever round it is
    seen, wherever it sits in the change.
  - **Non-blocking finding**: any other, including polish and hardening against
    unreachable states. It is marked `Nit:`, raised only in round 1, never
    fixed in the PR it was found in, and recorded in a `Review notes` section
    of the PR body before the merge.
  - **Follow-up**: a finding outside the change's scope with a concrete
    failure scenario in a real run. It becomes its own issue under O2's
    mechanics. Without a concrete scenario it is a note.
  - **Rounds**: round 1 reviews the whole diff. A later round checks the fixes
    since the reviewed head and raises only blocking findings. There is no
    round cap; the no-progress rule parks the same blocking finding raised
    twice in a row.
  - **Verdict**: `REQUEST_CHANGES` only with a blocking finding; otherwise
    `APPROVE`, with the non-blocking findings and follow-ups listed.
  - **Floor**: no contract loosens the bound. A project may tighten it: more
    blocking classes, or every finding blocks.
  - **QA**: at the milestone QA gate, "anything the reviewers flagged" includes
    the follow-ups, found by their `Follow-up of` line among the milestone's
    issues, and the `Review notes` of the milestone's merged PR bodies — both
    read from GitHub, so a compaction loses neither.
- [ ] O2. The issue contract's review gate, its fix-dispatch case and
  implement's step 3b apply the bound:
  - **Brief**: the reviewer brief asks for findings in the three classes and
    for the verdict rule.
  - **Later rounds**: round 2 onward continue the round-1 reviewer (SendMessage)
    with the fix diff (`git diff <reviewed-sha>..HEAD`) and the open blocking
    findings, where the gate's runner spawned round 1 itself and can still
    reach it. Otherwise — no SendMessage tool, the agent id lost to a
    compaction, a send error, or a fix-dispatch subagent — a fresh reviewer
    gets the full change diff (`git diff <base>...HEAD`), the fix diff and the
    open blocking findings, so a defect round 1 missed is still in view.
  - **Fix brief**: it carries the open blocking findings, the non-blocking
    findings and follow-ups collected so far, the reviewed head SHA and the
    round number. A gate whose brief carries findings runs as a later round,
    and whoever ends the gate has what it needs for the notes and follow-ups.
  - **Tier**: when round 1 ran on the cheaper no-source-change tier and the fix
    touches source or config, the next round is a fresh reviewer at the full
    tier.
  - **Ending the gate**: whoever runs the gate when it ends (merge, park or
    escalation) writes the `Review notes` and files the follow-ups once. The
    round count is in-session memory only.
  - **Follow-up issue**: a `fix:` title and a `Goal:` / `Acceptance:` /
    `Depends on: none` / `Spec:` body (the milestone's spec path, or `none`)
    with a `Follow-up of #<n> (PR #<pr>)` line, both passed through files;
    board `Todo`. Before filing, the runner searches
    the milestone's open issues (in the fast lane, the open `track:adhoc`
    issues) for the same finding, and a match files nothing.
  - **In a milestone** a follow-up goes into the same milestone, and the next
    wave picks it up before the QA gate.
  - **In the fast lane** a follow-up becomes a `track:adhoc` issue only when
    the issue under review is auto-pick eligible (author OWNER or MEMBER,
    `skills/shared/trust-boundary.md`). Otherwise it is a `Review notes` entry
    plus one `Needs you:` line offering to file it. A follow-up filed under an
    account that is itself not OWNER or MEMBER waits in `Todo` for explicit
    selection, like any such issue.
- [ ] O3. (Per gate decision G1.) Plan's spec-acceptance review takes the same
  bound:
  - **Blocking classes**: a contradiction with the vision, the constitution or
    the architecture; an open question an implementer would hit; a wrong
    factual claim the spec relies on; a section the spec template requires
    missing or wrong; a Foundation-doc change whose `Replaces` or `After:`
    text does not match its doc.
  - **Non-blocking findings** go into the spec PR body's `Review notes` and are
    shown at the spec-acceptance gate, where the human may ask for any of
    them.
  - **No follow-up issues in planning**: an out-of-scope finding is a note, or
    a `Needs you:` line when only the human can act on it.
  - **Step 6** addresses the blocking findings.
- [ ] O4. The workflow template's Gates and loopkit's `docs/workflow.md` Gates
  name the bound as the per-PR rule, point at the shared file, and state the
  floor: a project may tighten the bound (more blocking classes, or every
  finding blocks) and never loosen it.
- [ ] O5. The constitution's Bounded retry names the bound, and the
  architecture's `skills/shared/` row lists the new file (target texts below).
  The Quality gates line, "in-session agent review returns `APPROVE`", stays as
  it is, because under the bound `APPROVE` means no blocking finding.

## Scope

### In scope

- `skills/shared/review-bound.md` (new).
- `skills/implement/references/issue-contract.md`: the review gate and the
  fix-dispatch case.
- `skills/implement/SKILL.md`: step 3b's review-fix loop and §5's "anything
  the reviewers flagged".
- `skills/plan/SKILL.md`: step 6's review loop (if G1 is A).
- `skills/inception/templates/workflow.md` and `docs/workflow.md`: the Gates
  section.
- `docs/constitution.md` and `docs/architecture.md`: the target texts below.

### Out of scope

- A round cap: blocking findings keep their rounds, bounded by the no-progress
  rule.
- The reviewer's tier and effort and the no-source-change tier, which are
  unchanged except for O2's tier rule.
- The explicit human override of a review verdict, which is unchanged.
- The design review in `/loopkit:design`, which has its own bounded retry (its
  step 3).
- relay's mutation-guard class: loopkit has no mutation testing. A missing test
  counts as blocking only when it lets a reachable defect through.

## Constraints

- Body-size guard (guard 11). Measured on 2026-11-04: plan 12,769 bytes,
  implement 12,718. After `artifact-hygiene`'s #339 and #340, plan has about
  10 bytes left and implement about 60. So each core change replaces text:
  - plan's step 6 (if G1 is A) swaps today's "Address the findings and
    re-review, bounded by `docs/workflow.md`'s no-progress rule — a repeated
    failure stops and parks (see If blocked)." (143 bytes) for "Address the
    blocking findings and re-review per
    `${CLAUDE_PLUGIN_ROOT}/skills/shared/review-bound.md` (park: see If
    blocked)." (127 bytes);
  - implement has about 60 bytes left after #339 and #341. Step 3b swaps
    "`docs/workflow.md`'s no-progress rule" for the shared file's path (about
    +18 bytes) and keeps "the brief also carries the findings", whose contents
    the shared file defines; §5's "anything the reviewers flagged" gains
    "(follow-ups, `Review notes`)" (about +33 bytes).

  Issue A re-measures both bodies after #341 has merged, and an overrun frees
  room elsewhere in the same body.
- Guards 7 and 9: the cores point with
  `${CLAUDE_PLUGIN_ROOT}/skills/shared/review-bound.md`, `issue-contract.md`
  points with `../../shared/review-bound.md`, and the new file carries
  `> Paths in this file are relative to this file.` within its first five lines
  and names no bare plugin path.
- Trust boundary: O2's fast-lane rule keeps capability separation, so a
  follow-up never turns an issue that needed explicit selection into
  auto-pickable work. A follow-up's title and body pass through files, never
  into a command string.
- Shared files with `artifact-hygiene`: issue #341 (`issue-contract.md`, the
  workflow template, `docs/workflow.md`) and issue #340 (plan's step 6, the
  issue contract's review gate). The issue here depends on #341, and the
  milestone on #29. `artifact-hygiene`'s pending architecture change touches
  flows 2–4 only, so the `skills/shared/` row below is written against `main`.
- The loops run the installed release, so this milestone's implementer follows
  the installed skills. Its `Acceptance:` names the verbatim apply of both
  target texts.

## Foundation-doc changes

Vision: none.

### docs/constitution.md — Architecture principles, "Bounded retry": MODIFIED

Lands: with the issue that builds O1 and O2.

Replaces:

```text
- **Bounded retry.** The identical failure twice in a row stops the loop with a
  resumable report; loops never grind.
```

Target text:

```text
- **Bounded retry.** The identical failure twice in a row stops the loop with a
  resumable report; loops never grind. An agent review is bounded too: only a
  blocking finding withholds the merge, and after one full review a later round
  checks the fixes and raises only blocking findings
  (`skills/shared/review-bound.md`).
```

### docs/architecture.md — Components, the `skills/shared/` row: MODIFIED

Lands: with the issue that builds O1 and O2. If G1 is B, the target text names
implement only.

Replaces:

```text
| `skills/shared/` | Plugin-shipped shared references, not skills: `iteration-steps.md` (prior-art challenge / architecture seed / roadmap seeding — inception, roadmap), `preflight.md` (the `gh`/`git` preflight — inception, plan, implement, roadmap, ship), `trust-boundary.md` (read-discipline, shell-hygiene, capability separation — plan, implement, roadmap, ship), `needs-you.md` (the `Needs you:` line, the one form of a request to the human the run does not wait for — inception, plan, implement, roadmap, ship) |
```

Target text:

```text
| `skills/shared/` | Plugin-shipped shared references, not skills: `iteration-steps.md` (prior-art challenge / architecture seed / roadmap seeding — inception, roadmap), `preflight.md` (the `gh`/`git` preflight — inception, plan, implement, roadmap, ship), `trust-boundary.md` (read-discipline, shell-hygiene, capability separation — plan, implement, roadmap, ship), `needs-you.md` (the `Needs you:` line, the one form of a request to the human the run does not wait for — inception, plan, implement, roadmap, ship), `review-bound.md` (the agent-review bound: finding classes, rounds, review notes, follow-ups — plan, implement) |
```

## Prior art

- [Review bound — round-limited agent review with blocking classes (feature: review-bound)](../prior-art.md#review-bound--round-limited-agent-review-with-blocking-classes-feature-review-bound)
  - relay's bound and loopkit's #335 round spent on a whitespace glitch:
    - ADOPT a fixed round shape plus named blocking classes;
    - AVOID a bound that lets a reachable defect through because it was found
      late, which O1 turns into its "in whichever round it is seen".
  - Google's "The Standard of Code Review":
    - ADOPT approval once the change is clearly better, and the `Nit:` prefix
      for optional polish;
    - AVOID leaving the bound to the reviewer's judgment alone.
- [Loop safety / bounded retry](../prior-art.md#loop-safety--bounded-retry) —
  the no-progress rule the bound sits beside.

## Human prerequisites

none

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| The bound is defined once, in `skills/shared/review-bound.md`. The cores and `issue-contract.md` point at it. | It is used by implement, and by plan if G1 is A. Shared method lives in `skills/shared/` (constitution Conventions), and the body-size guard leaves the cores room only for pointers. | 2026-11-04 |
| Blocking classes as in O1, the project's contract and `CLAUDE.md` rules included. A blocking finding blocks in any round, anywhere in the change. | relay's blocking classes plus its three fix-in-PR cases, folded into one class, since each must be fixed before the merge. relay's mutation-guard case maps to "a reachable defect". Without the contract and `CLAUDE.md` rules, a rule a project keeps only in its contract (in target projects, `artifact-hygiene`'s no-spec-citation rule) would be a `Nit:`. A defect round 1 missed must still block (prior art AVOID). | 2026-11-04 |
| A non-blocking finding is raised only in round 1 and never fixed in the PR it was found in. It is recorded in the PR body's `Review notes`. | relay (2026-11-03): cosmetics are a PR-body note. With only non-blocking findings, round 1 then merges without a fix round, which is the saving, and the fix diff stays tight. Google's `Nit:` marks the finding as optional. | 2026-11-04 |
| Later rounds continue the round-1 reviewer where its runner can still reach it; otherwise, and always for a fix-dispatch subagent, a fresh reviewer gets the full change diff, the fix diff and the open blocking findings. The fix brief carries the open blocking findings, the non-blocking findings and follow-ups so far, the reviewed SHA and the round number. A fix that touches source after a cheaper-tier round 1 gets a fresh full-tier reviewer. | A check of the fixes needs round 1's findings, and continuing the agent is the native way to keep them, but a fix-dispatch subagent has no handle on the orchestrator's reviewer. A fresh reviewer needs the whole change to see a defect round 1 missed, and the runner that ends the gate needs the notes and follow-ups to record them. "Any source or config touch keeps the full tier" (issue contract) must hold across rounds. | 2026-11-04 |
| Follow-ups are one `fix:` issue per finding, marked `Follow-up of #<n> (PR #<pr>)`, filed once when the gate ends, after a search for a match. In a milestone they go into the same milestone; in the fast lane they become `track:adhoc` only when the reviewed issue is auto-pick eligible, and otherwise a note plus a `Needs you:` line. | relay files them into one sweep issue. One issue per finding, with the search, keeps parallel subagents in a wave from racing to create that single issue. The QA gate already files `fix:` issues into the milestone, and the next wave picks them up before QA. The fast-lane rule is capability separation: review output from an externally authored issue must not become auto-picked work. | 2026-11-04 |
| The verdict keeps its form: `REQUEST_CHANGES` only with a blocking finding. The constitution's Quality gates line stays, and Bounded retry gains one sentence. | `APPROVE` now means no blocking finding, so "returns `APPROVE`" stays true. Bounded retry is the principle the bound refines. | 2026-11-04 |
| The round count and the classification are in-session memory, never a label or a file. | The failed-dispatch count sets the precedent, and durable state stays GitHub-only. | 2026-11-04 |
| Floor: no contract loosens the bound; a project may tighten it (more blocking classes, or every finding blocks). The floor is stated as a prohibition in the shared file and in the template's Gates line. | A skill-stated prohibition is not a layer-4 default, and the contract states the floor too, so layers 3 and 4 agree. A project that deletes the floor from its own contract has made a deliberate choice loopkit cannot prevent, as with the skills' other prohibitions. A target project's constitution has no Bounded retry, so the floor is stated where its contract and the skills say it. | 2026-11-04 |
| The architecture's `skills/shared/` row lists `review-bound.md`. | That row lists every shared file with its users; without the entry the change would leave a doc wrong. | 2026-11-04 |
| OPEN — G1: does plan's spec-acceptance review take the same bound (O3)? A: yes, with O3's blocking classes, notes shown at the gate, and no follow-up issues. B: no; it keeps today's loop, bounded only by the no-progress rule, and the architecture row names implement only. | resolved at the spec-acceptance gate | — |

## Tracking

- Milestone: created at acceptance, with `Depends on milestone: #29`
  (artifact-hygiene: shared files).
- Issues, one per step, created after the merge:
  - **A — The review bound (O1–O5).** Depends on #341. Covers:
    - the shared file;
    - the issue contract's review gate and fix-dispatch case;
    - implement's step 3b and its fix brief;
    - plan's step 6, if G1 is A;
    - the workflow template and `docs/workflow.md`;
    - both target texts, applied verbatim;
    - its own review already follows the bound: classified findings, and a
      `Review notes` section in its PR body if there were non-blocking ones.

## Verification

- [ ] `bash scripts/verify.sh` passes, including the body-size, plugin-path and
  reference-link guards.
- [ ] `skills/shared/review-bound.md` states the three classes, the rounds, the
  verdict rule, `Review notes`, the follow-up mechanics with the fast-lane
  eligibility rule, the floor and the QA-gate listing. Its first five lines
  carry the relative-paths line.
- [ ] The issue contract's review gate and fix-dispatch case, and implement's
  step 3b, point at the shared file, and §5 names the follow-ups and
  `Review notes`. The reviewer brief asks for classified
  findings, and the fix brief carries the findings, the reviewed SHA and the
  round. If G1 is A, plan's step 6 carries the 127-byte sentence from
  Constraints.
- [ ] The workflow template's Gates and `docs/workflow.md` name the bound,
  point at the shared file and state the floor.
- [ ] The constitution's Bounded retry and the architecture's `skills/shared/`
  row carry their target texts verbatim, landed in issue A's PR.
- [ ] Issue A's PR body has a `Review notes` section if its review had
  non-blocking findings.
- [ ] Smoke (the QA-gate default). A fresh-context subagent is given only the
  changed skills, and each answer it gives matches this spec:
  - round 1 finds only a `Nit:` (merge, note in the PR body);
  - round 2 finds a reachable defect the fix introduced (blocks);
  - round 2 finds a blocking defect in code round 1 reviewed but missed
    (blocks);
  - round 2 notices a style point (not raised; merge);
  - the same blocking finding twice in a row (park);
  - a pre-existing defect outside the change, with a concrete failure
    scenario, in a milestone (a `fix:` issue in that milestone) and in the fast
    lane from an OWNER issue (a `track:adhoc` issue);
  - the same in the fast lane from a CONTRIBUTOR issue (a note plus a
    `Needs you:` line, no issue);
  - an out-of-scope finding with no scenario (a note).

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| A reviewer files a real defect as non-blocking to finish sooner. | A defect in reachable behavior is blocking by definition, the brief names the classes, and the QA gate sees every note and follow-up. |
| Notes pile up in PR bodies and nobody reads them. | Only a finding with a concrete failure scenario becomes work. A note is a record, not a queue, and the QA gate lists them. |
| Follow-ups add work no planner ratified. | Each needs a concrete failure scenario, the QA gate lists them, and the fast lane files one only from an auto-pick-eligible issue. |
| A core passes 12,800 bytes. | Each core change replaces text (Constraints), issue A re-measures after #341, and Verify's guard fails the PR otherwise. |

## Decision log

- 2026-11-04: Drafted. The planning decisions are the Prior decisions rows.
