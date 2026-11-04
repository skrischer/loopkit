# Spec: review-bound

> Created: 2026-11-04

Bound an agent review by rounds and by finding class: one full review, then one
check of the fixes, and from then on only a blocking finding withholds the
merge. Non-blocking findings become a note in the PR body, and a larger finding
outside the change becomes its own issue. This spec carries no lifecycle state —
acceptance is the spec merged on the default branch with a milestone and issues,
and all progress lives in the GitHub issues and milestone. A completed spec is
moved to `docs/specs/archive/`.

## Outcome

- [ ] O1. `skills/shared/review-bound.md` defines the bound once:
  - The **rounds**: round 1 reviews the whole diff. Every later round checks
    the fixes and raises only blocking findings.
  - A **blocking finding** is a violation of the issue's `Acceptance:`, the
    spec or the constitution; a red Verify; a defect in reachable behavior the
    change adds or alters; or a doc the change makes wrong.
  - A **non-blocking** finding is any other, polish and hardening against
    unreachable states among them. It is marked `Nit:`, is not fixed in this
    PR, and is recorded in a `Review notes` section of the PR body before the
    merge.
  - A **follow-up** is a finding outside the change's scope with a concrete
    failure scenario in a real run. In a milestone it becomes a `fix:` issue in
    the same milestone (board `Todo`), which the next wave picks up before the
    QA gate. In the fast lane it becomes a new `track:adhoc` issue. Without a
    concrete scenario it is a note.
  - The **verdict**: `REQUEST_CHANGES` only with a blocking finding, otherwise
    `APPROVE` with the non-blocking findings listed.
  - The no-progress rule still parks the same blocking finding raised twice in
    a row.
- [ ] O2. The issue contract's review gate and implement's step 3b apply the
  bound: the reviewer brief asks for findings in the three classes and the
  verdict rule, round 2 onward continue the same reviewer with the fixes, and
  whoever runs the gate writes the `Review notes` and files the follow-ups. The
  round count is in-session memory only.
- [ ] O3. (Per gate decision G1.) Plan's spec-acceptance review takes the same
  bound, with its own blocking classes: a contradiction with the vision, the
  constitution or the architecture; an open question an implementer would hit;
  a wrong factual claim the spec relies on; a required section missing or
  wrong (Prior art, Human prerequisites, Foundation-doc changes).
- [ ] O4. The workflow template's Gates and loopkit's `docs/workflow.md` Gates
  name the review bound as the per-PR default, which a project's contract may
  tighten: more blocking classes, or no non-blocking notes.
- [ ] O5. The constitution's Bounded retry principle names the bound (target
  text below). Its Quality gates line, "in-session agent review returns
  `APPROVE`", stays as it is, because under the bound `APPROVE` means no
  blocking finding.

## Scope

### In scope

- `skills/shared/review-bound.md` (new).
- `skills/implement/references/issue-contract.md`: the review gate.
- `skills/implement/SKILL.md`: step 3b's review-fix loop.
- `skills/plan/SKILL.md`: step 6's review loop (if G1 is A).
- `skills/inception/templates/workflow.md` and `docs/workflow.md`: the Gates
  section.
- `docs/constitution.md`: the target text below.

### Out of scope

- A hard cap on rounds: blocking findings keep their rounds, bounded by the
  no-progress rule.
- The reviewer's tier and effort, and the no-source-change cheaper tier: they
  are unchanged.
- The explicit human override of a review verdict, which is unchanged.
- The design review in `/loopkit:design`: it has its own bounded retry (its
  step 3).
- relay's mutation-guard class: loopkit has no mutation testing. A missing test
  counts as blocking only when it lets a reachable defect through.

## Constraints

- Body-size guard (guard 11): after `artifact-hygiene`, plan's body is close
  to 12,800 bytes and implement's about 60 bytes under it. Each core change is
  a pointer that replaces text: plan's step 6 swaps "bounded by
  `docs/workflow.md`'s no-progress rule" for a pointer to the shared file, and
  implement's step 3b names the shared file in place of restating the bound.
  The detail lives in the shared file.
- Plugin paths (guard 7): the cores point with
  `${CLAUDE_PLUGIN_ROOT}/skills/shared/review-bound.md`, and
  `issue-contract.md` points with `../../shared/review-bound.md`.
- The trust boundary is unchanged: a follow-up issue's body is written to a
  file and passed with `--body-file`. Its author is the session's own account,
  so loop mode may pick a `track:adhoc` follow-up.
- Shared files with `artifact-hygiene`: issue #341 (`issue-contract.md`, the
  workflow template, `docs/workflow.md`) and issue #340 (plan's step 6,
  `issue-contract.md`'s review gate). The issue here depends on #341, and the
  milestone on #29.
- The loops run the installed release, so this milestone's implementer follows
  the installed skills, and its `Acceptance:` names the verbatim apply of the
  target text below.

## Foundation-doc changes

Vision: none. Architecture: none.

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
  resumable report; loops never grind. An agent review is bounded too: one full
  review, then one check of the fixes, and after that only a blocking finding
  withholds the merge (`skills/shared/review-bound.md`).
```

## Prior art

- [Review bound — round-limited agent review with blocking classes (feature: review-bound)](../prior-art.md#review-bound--round-limited-agent-review-with-blocking-classes-feature-review-bound)
  - relay's bound and loopkit's #335 round spent on a whitespace glitch: ADOPT
    a fixed round count plus named blocking classes; AVOID a bound that lets a
    reachable defect through because it was found late.
  - Google's "The Standard of Code Review": ADOPT approval once the change is
    clearly better and the `Nit:` prefix for optional polish; AVOID leaving the
    bound to the reviewer's judgment alone.
- [Loop safety / bounded retry](../prior-art.md#loop-safety--bounded-retry) —
  the no-progress rule the bound sits beside.

## Human prerequisites

none

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| The bound is defined once, in `skills/shared/review-bound.md`, and the cores and `issue-contract.md` point at it. | Two skills use it (implement, and plan if G1 is A), and shared method lives in `skills/shared/` (constitution Conventions). The body-size guard leaves the cores room for pointers only. | 2026-11-04 |
| Blocking: a violation of the `Acceptance:`, the spec or the constitution, a red Verify, a defect in reachable behavior the change adds or alters, or a doc the change makes wrong. | relay's blocking classes plus its three fix-in-PR cases, folded into one class: each must be fixed before the merge. relay's mutation-guard case maps to "a reachable defect", since loopkit has no mutation testing. | 2026-11-04 |
| A non-blocking finding is never fixed in the PR it was found in; it is recorded in the PR body's `Review notes`. | relay (2026-11-03): cosmetics are a PR-body note. A round 1 with only non-blocking findings then merges without a fix round, which is the saving. Google's `Nit:` marks it as optional. | 2026-11-04 |
| Round 2 onward continue the same reviewer agent (SendMessage) with the fix diff and the open findings; where that is not possible, a fresh reviewer gets round 1's findings and the fix diff. | A check of the fixes needs round 1's context, and continuing the agent is the native way to keep it. | 2026-11-04 |
| Follow-up: a finding outside the change's scope with a concrete failure scenario becomes a `fix:` issue in the same milestone, or a `track:adhoc` issue in the fast lane. Without a scenario it is a note. | relay's rule. The QA gate already files `fix:` issues in the milestone, and the next wave picks them up, so the finding is fixed before QA. | 2026-11-04 |
| The verdict keeps its form: `REQUEST_CHANGES` only with a blocking finding. The constitution's Quality gates line stays, and Bounded retry gains one sentence. | `APPROVE` now means no blocking finding, so "returns `APPROVE`" stays true. Bounded retry is the principle the bound refines. | 2026-11-04 |
| The round count and the classification are in-session memory, never a label or a file. | The failed-dispatch count sets the precedent; GitHub-only durable state. | 2026-11-04 |
| A project's contract may tighten the bound: more blocking classes, or no non-blocking notes. It may not loosen it below "a blocking finding blocks". | The contract (layer 3) outranks the skills' default (layer 4) per the Precedence section, and the constitution binds both: its Quality gates and Bounded retry make a blocking finding block. | 2026-11-04 |
| OPEN — G1: does plan's spec-acceptance review take the same bound (O3)? A: yes, with the spec-review blocking classes. B: no; it keeps today's loop, bounded only by the no-progress rule. | resolved at the spec-acceptance gate | — |

## Tracking

- Milestone: created at acceptance, with `Depends on milestone: #29`
  (artifact-hygiene: shared files).
- Issues, one per step, created after the merge:
  - **A — The review bound (O1–O5).** Depends on #341. The shared file; the
    issue contract's review gate; implement's step 3b; plan's step 6 if G1 is
    A; the workflow template and `docs/workflow.md`; and the constitution
    change above, applied verbatim.

## Verification

- [ ] `bash scripts/verify.sh` passes, the body-size, plugin-path and
  reference-link guards included.
- [ ] `skills/shared/review-bound.md` states the rounds, the three classes,
  the verdict rule, the `Review notes` section, the follow-up issue, and the
  no-progress park.
- [ ] The issue contract's review gate and implement's step 3b point at it, and
  the reviewer brief asks for classified findings. If G1 is A, plan's step 6
  points at it, with the spec-review blocking classes.
- [ ] The workflow template's Gates and `docs/workflow.md` name the bound and
  what a project may tighten.
- [ ] The constitution's Bounded retry carries the target text verbatim,
  landed in issue A's PR.
- [ ] Smoke (the QA-gate default): a fresh-context subagent given only the
  changed skills answers, and each answer matches this spec:
  - round 1 finds only a `Nit:` (merge, note in the PR body);
  - round 2 finds a reachable defect the fix introduced (blocks);
  - round 2 finds a new style point (note, merge);
  - a pre-existing defect outside the change with a concrete failure scenario,
    in a milestone (a `fix:` issue in that milestone) and in the fast lane (a
    `track:adhoc` issue).

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| A reviewer files a real defect as non-blocking to finish sooner. | A defect in reachable behavior is blocking by definition, and the brief names the classes. The QA gate still reviews the merged work. |
| Notes pile up in PR bodies and nobody reads them. | Only a finding with a concrete failure scenario becomes work (a follow-up issue). A note is a record, not a queue. |
| A core passes 12,800 bytes. | Each core change replaces text with a pointer (Constraints), and Verify's guard fails the PR otherwise. |

## Decision log

- 2026-11-04: Drafted. The planning decisions are the Prior decisions rows.
