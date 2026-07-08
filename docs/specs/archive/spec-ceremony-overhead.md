# Spec: ceremony-overhead

> Created: 2026-07-08

Cut the full-spec track's fixed process-PR overhead by folding the roadmap-link
commit onto the accepted spec branch, and fix the unexecutable post-merge
Decision-log instruction. The one-line constitution clarification is authored here
and ratified at the spec-acceptance gate. (Reviewer-tiering for no-op diffs is
deferred to `model-tier-slots` — see Out of scope.)

## Outcome

- [ ] `skills/plan/SKILL.md` **folds the roadmap-link commit onto the accepted
      spec branch**: after acceptance at the gate the milestone is created (so its
      `#NN` exists), the roadmap link is committed onto the **spec branch**, and
      the spec merges **once** carrying spec + roadmap link — step 8's separate
      roadmap PR is gone. Issues are still created post-merge; the QA archive PR
      stays as the single close-out. Net: one acceptance PR + one close-out PR, not
      three.
- [ ] The **Decision-log instruction is executable**: decisions are recorded
      **pre-merge** on the issue branch (`skills/implement/SKILL.md`) and on the
      spec branch (`skills/plan/SKILL.md`) — never written to a branch the merge
      already deleted — with the QA close-out as the catch-all.
- [ ] `docs/constitution.md`'s "accepted = merged ... with a milestone and issues"
      carries a **one-line clarification** that the milestone may be created just
      before the merge (so the roadmap link rides the spec branch) — authored in
      this spec PR, ratified at the spec-acceptance gate.
- [ ] Verify passes; **no new artifact type** is introduced (ceremony is measured
      and reduced, never fixed by adding more ceremony).

## Scope

### In scope

- `skills/plan/SKILL.md`: step 7/8 flow (create the milestone at acceptance, fold
  the roadmap-link commit onto the spec branch, one merge); Decision-log written
  pre-merge.
- `skills/implement/SKILL.md`: Decision-log written pre-merge on the issue branch
  (§3), QA close-out as catch-all.
- `docs/constitution.md`: the one-line milestone-before-merge clarification
  (authored here, ratified at the gate — the constitution corollary that
  foundation edits belong to a plan spec PR).

### Out of scope

- **Reviewer-tiering for no-op diffs** -> `model-tier-slots` (the next phase), the
  proper home for role->tier selection. Deferred here on purpose: routing a
  "no-source-change" diff to a cheaper reviewer is dangerously ambiguous in this
  spec's scope — the spec-acceptance step-6 review is itself a docs-only diff yet
  the single most consequential review in the loop (the planning-rigor
  checkpoint), so it must **never** be downgraded; and the roadmap-link and
  archive PRs carry no review gate at all (merged autonomously), so there is
  nothing to downgrade for them. `model-tier-slots` will express reviewer tiers
  with an explicit carve-out that the spec-acceptance review stays top-tier. This
  phase's PR-count cut already removes the roadmap-link PR (which had no review
  anyway), delivering the review-spend win structurally rather than by tiering.
- The full **role->tier contract field** -> `model-tier-slots`.
- **gate-evidence** (a durable QA trail on GitHub) -> deferred.
- No reduction drops a human gate or skips or downgrades any existing review —
  the two Agent review gates (spec step-6, per-issue §3) are untouched.
- No new metrics artifact/file — the reduced flow *is* the deliverable
  (prior-art AVOID: fixing ceremony by adding an artifact type).

## Constraints

- The constitution edit belongs to this spec PR, ratified at the spec-acceptance
  gate (constitution corollary), never in `/loopkit:implement`.
- Milestone-before-merge is created **after** gate acceptance, so a rejected spec
  leaves no dangling milestone.
- GitHub-only durable state; subscription-auth only; proportional ceremony; no
  cross-skill duplication (constitution).

## Prior art

- [Process-PR overhead — ceremony telemetry](../prior-art.md#process-pr-overhead--ceremony-telemetry-feature-ceremony-overhead)
  — Scott Logic / OpenSpec: ADOPT **measure ceremony as a first-class number and
  drive it down — fold the roadmap-link commit onto the accepted spec branch, keep
  one QA close-out PR**; AVOID fixing ceremony by introducing a **new artifact
  type** (the meta-failure). loopkit's own telemetry: 3 fixed process PRs per
  full-spec milestone; 44 of 86 merged PRs carried no behavior change; the
  post-merge Decision-log instruction writes to a branch the merge already deleted.

## Human prerequisites

- none — skill and constitution-clarification changes only.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Fold the roadmap-link commit onto the accepted spec branch; the milestone is created **after gate acceptance, just before the merge** | prior-art ADOPT; eliminates the separate step-8 roadmap PR; creating it post-acceptance avoids a dangling milestone on rejection | 2026-07-08 |
| Decisions are written **pre-merge** (issue branch / spec branch); the QA close-out is the catch-all | the current post-merge instruction writes to a branch the merge already deleted — unexecutable as ordered | 2026-07-08 |
| **Reviewer-tiering for no-op diffs is deferred entirely to `model-tier-slots`**, not stated here | routing "no-source-change" to a cheaper reviewer would ambiguously catch the docs-only spec-acceptance review (the most consequential review); roadmap/archive PRs have no review gate to downgrade — the review-spend win comes structurally from removing the roadmap-link PR, not from tiering | 2026-07-08 |
| The constitution clarification is authored in this spec PR, ratified at the gate | constitution corollary: foundation-doc edits belong to a plan spec PR, never to implement | 2026-07-08 |
| **No new artifact type** to measure or reduce ceremony | prior-art AVOID: the meta-failure is fixing ceremony with more ceremony | 2026-07-08 |

## Tracking

- Milestone: created from this spec once it is merged
- Issues (two, **parallel** — disjoint files, one wave):
  - **A** — `skills/plan/SKILL.md`: fold the roadmap-link onto the spec branch
    (milestone-at-acceptance, one merge) + Decision-log pre-merge.
  - **B** — `skills/implement/SKILL.md`: Decision-log pre-merge on the issue
    branch + QA close-out as the catch-all.

## Verification

- [ ] Verify passes (`bash scripts/verify.sh`).
- [ ] `skills/plan/SKILL.md` no longer creates a separate step-8 roadmap-link PR:
      the roadmap link is committed onto the spec branch and the milestone is
      created at acceptance (just before merge) (grep-verifiable).
- [ ] No Decision-log instruction in `skills/plan/SKILL.md` or
      `skills/implement/SKILL.md` writes post-merge to a deleted branch; decisions
      are recorded pre-merge (grep-verifiable).
- [ ] The two Agent review gates (`skills/plan/SKILL.md` step-6,
      `skills/implement/SKILL.md` §3) are **unchanged** — no reviewer downgrade in
      this phase.
- [ ] `docs/constitution.md` carries the milestone-before-merge one-line
      clarification (grep-verifiable).
- [ ] No new artifact/template file introduced; no local state, API key, headless
      flag, or scheduler (config-surface guard).

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Milestone-before-merge dangles if the spec is rejected | it is created **after** gate acceptance, immediately before the merge — a rejected spec never reaches milestone creation |
| Milestone created but the merge then stalls (e.g. red CI between acceptance and merge) leaves a live milestone with an unmerged spec | acceptable and self-healing: the milestone is the intended target, its issues are created only after the merge succeeds, and the pending spec PR is the obvious resume point — no cleanup owed, no dangling issues |
| Folding roadmap link onto the spec branch races the merge | the roadmap link is one commit added to the already-approved spec branch before the single squash-merge — no second review needed for a link edit |
| Constitution clarification widens acceptance semantics | it is a clarification, not a change: acceptance stays "merged on the default branch"; the milestone merely exists slightly earlier |

## Decision log

- 2026-07-08: Drafted from the `ceremony-overhead` roadmap seed (2026-07-02 batch
  + 2026-07-08 audit re-scope). Design settled by the prior-art anchor (fold
  roadmap-link, one close-out, measure not add) — no genuinely-open decision. The
  constitution one-liner is authored here per the corollary and ratified at the
  spec-acceptance gate. Two issues, parallel on disjoint files (plan vs implement).
- 2026-07-08: Spec-acceptance review deferred the model-tier reviewer facet
  entirely to `model-tier-slots`. The "route no-source-change diffs to a cheaper
  reviewer" rule was ambiguous and risky in this scope: taken literally it would
  downgrade the docs-only spec-acceptance step-6 review — the loop's most
  consequential review — and the roadmap-link/archive PRs carry no review gate to
  downgrade at all. The review-spend win is delivered structurally by removing the
  roadmap-link PR; reviewer-tiering (with an explicit spec-review-stays-top-tier
  carve-out) belongs in `model-tier-slots`. Also added a mitigation for a
  merge-stall-after-milestone-creation between acceptance and merge (self-healing;
  issues created only post-merge).
