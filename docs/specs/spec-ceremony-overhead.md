# Spec: ceremony-overhead

> Created: 2026-07-08

Cut the full-spec track's fixed process-PR overhead by folding the roadmap-link
commit onto the accepted spec branch, fix the unexecutable post-merge Decision-log
instruction, and route no-source-change diffs to a cheaper review model. The
one-line constitution clarification is authored here and ratified at the
spec-acceptance gate.

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
- [ ] A **no-source-change diff** (docs-only: roadmap link, spec, archive) is
      reviewed by a **cheaper review model** (the native Agent-tool `model`
      parameter), not a top-tier subagent — stated in `skills/implement/SKILL.md`
      §3 review gate and `skills/plan/SKILL.md` step-6. This compounds with
      `model-tier-slots` (which generalizes role->tier next); here it is the
      no-op-diff rule only.
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
  pre-merge; the no-source-change cheaper-reviewer rule in step-6.
- `skills/implement/SKILL.md`: Decision-log written pre-merge on the issue branch
  (§3), QA close-out as catch-all; the no-source-change cheaper-reviewer rule in
  the §3 review gate.
- `docs/constitution.md`: the one-line milestone-before-merge clarification
  (authored here, ratified at the gate — the constitution corollary that
  foundation edits belong to a plan spec PR).

### Out of scope

- The full **role->tier contract field** -> `model-tier-slots` (the next phase).
  ceremony-overhead states the cheaper-reviewer rule for no-op diffs using the
  native Agent `model` parameter; `model-tier-slots` generalizes tier selection.
- **gate-evidence** (a durable QA trail on GitHub) -> deferred.
- No reduction drops a human gate or skips a real review — the cheaper reviewer
  still runs; only its **tier** drops, and only for a no-source-change diff.
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
| A **no-source-change diff** is reviewed by a **cheaper model** via the native Agent `model` parameter (not a top-tier subagent) | ~half of review spend went to the 44 no-op PRs; the review still runs, only the tier drops; compounds with `model-tier-slots` | 2026-07-08 |
| The role->tier **contract field is out of scope** here -> `model-tier-slots` | this phase states the no-op-diff rule; the next generalizes tier selection — kept split to avoid coupling | 2026-07-08 |
| The constitution clarification is authored in this spec PR, ratified at the gate | constitution corollary: foundation-doc edits belong to a plan spec PR, never to implement | 2026-07-08 |
| **No new artifact type** to measure or reduce ceremony | prior-art AVOID: the meta-failure is fixing ceremony with more ceremony | 2026-07-08 |

## Tracking

- Milestone: created from this spec once it is merged
- Issues (two, **parallel** — disjoint files, one wave):
  - **A** — `skills/plan/SKILL.md`: fold the roadmap-link onto the spec branch
    (milestone-at-acceptance) + Decision-log pre-merge + no-op-diff cheaper
    reviewer in step-6.
  - **B** — `skills/implement/SKILL.md`: Decision-log pre-merge on the issue
    branch + no-op-diff cheaper reviewer in the §3 review gate.

## Verification

- [ ] Verify passes (`bash scripts/verify.sh`).
- [ ] `skills/plan/SKILL.md` no longer creates a separate step-8 roadmap-link PR:
      the roadmap link is committed onto the spec branch and the milestone is
      created at acceptance (just before merge) (grep-verifiable).
- [ ] No Decision-log instruction in `skills/plan/SKILL.md` or
      `skills/implement/SKILL.md` writes post-merge to a deleted branch; decisions
      are recorded pre-merge (grep-verifiable).
- [ ] `skills/implement/SKILL.md` §3 review gate and `skills/plan/SKILL.md` step-6
      route a no-source-change diff to a cheaper review model (grep-verifiable).
- [ ] `docs/constitution.md` carries the milestone-before-merge one-line
      clarification (grep-verifiable).
- [ ] No new artifact/template file introduced; no local state, API key, headless
      flag, or scheduler (config-surface guard).

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Milestone-before-merge dangles if the spec is rejected | it is created **after** gate acceptance, immediately before the merge — a rejected spec never reaches milestone creation |
| Folding roadmap link onto the spec branch races the merge | the roadmap link is one commit added to the already-approved spec branch before the single squash-merge — no second review needed for a link edit |
| "Cheaper reviewer" silently skips real review | the review still runs and must still return `APPROVE`; only the model tier drops, and only when the diff changes no source (docs/roadmap/archive) |
| Constitution clarification widens acceptance semantics | it is a clarification, not a change: acceptance stays "merged on the default branch"; the milestone merely exists slightly earlier |

## Decision log

- 2026-07-08: Drafted from the `ceremony-overhead` roadmap seed (2026-07-02 batch
  + 2026-07-08 audit re-scope adding the model-tier reviewer dimension). Design
  settled by the prior-art anchor (fold roadmap-link, one close-out, measure not
  add) — no genuinely-open decision. The constitution one-liner is authored here
  per the corollary and ratified at the spec-acceptance gate. Two issues, parallel
  on disjoint files (plan vs implement). The no-op-diff cheaper-reviewer rule uses
  the native Agent `model` parameter now and compounds with `model-tier-slots`
  next; the full role->tier field is deliberately deferred to that phase to keep
  this change bounded.
