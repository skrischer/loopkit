# Spec: model-tier-slots

> Created: 2026-07-08

Add an OPTIONAL `docs/workflow.md` field mapping role -> model tier
(orchestrator / implementer / reviewer), default `inherit` when absent, read by
`/implement` and `/plan` and passed to the native subagent model selection. Model
names live only in the per-project contract, never in tool-agnostic skill prose.
Reuses the native mechanism — nothing to build. Absorbs the no-op-diff
reviewer-tier point deferred from `ceremony-overhead`, with the spec-acceptance
review kept top-tier.

## Outcome

- [ ] `docs/workflow.md` (and the inception template) carry an **OPTIONAL
      role->tier field** — `orchestrator` / `implementer` / `reviewer` -> a model
      tier — with **`inherit` the default** when the field is absent or a role is
      unset. Model names appear **only** here (per-project config), never in skill
      prose.
- [ ] `skills/implement/SKILL.md` reads the field and passes the mapped tier to
      the **native Agent-tool `model` selection** when it dispatches a per-issue
      **implementer** subagent and when it runs the per-issue **reviewer** — a
      **no-source-change** issue-PR diff (docs/config-only) may use the cheaper
      reviewer tier. The orchestrator itself is the session model (unchanged). A
      note warns that **`CLAUDE_CODE_SUBAGENT_MODEL` globally overrides** all
      per-role routing (documented foot-gun).
- [ ] `skills/plan/SKILL.md` reads the **reviewer** tier for its step-6 review
      subagent — **but the spec-acceptance review always stays top-tier** (never
      downgraded: it is the planning-rigor checkpoint; the carve-out the
      `ceremony-overhead` deferral required).
- [ ] `docs/workflow.md` (loopkit's own) records the concrete dogfood mapping the
      maintainer hand-prompts today (orchestrator = top tier, implementer =
      cheaper, reviewer = top with the no-op-diff exception).
- [ ] Verify passes; nothing is built — native subagent model selection is reused;
      no new dependency / headless / scheduler / API key / local state.

## Scope

### In scope

- The OPTIONAL role->tier contract field: `skills/inception/templates/workflow.md`
  (placeholder + default-`inherit` note), `skills/inception/SKILL.md` (records it),
  loopkit's own `docs/workflow.md` (concrete mapping).
- `skills/implement/SKILL.md`: read the field; pass implementer + reviewer tiers to
  the native Agent `model` selection; the no-source-change cheaper-reviewer rule
  (the `ceremony-overhead` deferral); the `CLAUDE_CODE_SUBAGENT_MODEL` foot-gun.
- `skills/plan/SKILL.md`: read the reviewer tier for step-6, with the
  spec-acceptance-review-stays-top-tier carve-out.

### Out of scope

- Building any model-selection mechanism — native subagent `model` selection
  (frontmatter / per-invocation param / `opusplan`) already exists; this only
  wires roles to it (constitution: reuse native primitives).
- Any autonomy-dial / gate change — orthogonal.
- Forcing the "model decides its own tier" variant (Willison 2026-07-03, which
  beat a fixed rule): recorded as an **optional** stance a project MAY put in its
  contract, not required here (proportional — avoid over-scoping).

## Constraints

- **Model names live only in the contract** — never in tool-agnostic skill prose
  (same class as "no external-tool URL as durable state"; the roles are stable,
  the model filling each is volatile project-config, exactly like the Verify
  command).
- Default **`inherit`**: with no field, behavior is identical to today (the skills
  work unchanged), so the field is purely additive.
- The **spec-acceptance review is never downgraded** (carve-out) — the reviewer
  tier applies to per-issue reviews and no-op diffs, not the planning gate.
- Reuse native primitives; GitHub-only state; subscription-auth (constitution).

## Prior art

- [Model-tier-per-agent — role-to-tier routing in the contract](../prior-art.md#model-tier-per-agent--role-to-tier-routing-in-the-contract-feature-model-tier-slots)
  — Anthropic model-config: ADOPT an OPTIONAL `docs/workflow.md` role->tier field,
  default `inherit`, passed to native subagent model selection; model names only
  in the contract. Native mechanism (frontmatter `model` / resolution order /
  `opusplan`) already exists — nothing to build. AVOID literal model names in the
  skill layer; note the `CLAUDE_CODE_SUBAGENT_MODEL` override foot-gun. Willison
  (2026-07-03): delegating the tier decision to the model beat a fixed rule — an
  optional variant. The cost tie-in: a top-tier reviewer over the 44/86
  no-behavior PRs burned ~half of review spend (the `ceremony-overhead` link).

## Human prerequisites

- none — contract, template, and skill-prose changes only.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| The role->tier field is **OPTIONAL**, default `inherit` | purely additive — with no field the skills behave exactly as today; no forced migration | 2026-07-08 |
| Roles are `orchestrator` / `implementer` / `reviewer`; **model names live only in the contract** | the roles are stable, the model is volatile project-config (Opus 4.8 -> Fable 5 churn); hardcoding names in skills violates "hardcodes no tool" | 2026-07-08 |
| Wire to **native** subagent model selection (Agent `model` param / frontmatter / `opusplan`) — build nothing | the mechanism already exists (constitution: reuse native primitives) | 2026-07-08 |
| A **no-source-change** issue-PR diff may use the cheaper **reviewer** tier — but the **spec-acceptance review stays top-tier** | the ceremony-overhead deferral: reviewer-tiering belongs here, with an explicit carve-out protecting the loop's most consequential review | 2026-07-08 |
| Warn that **`CLAUDE_CODE_SUBAGENT_MODEL` overrides** all per-role routing | documented native foot-gun — silent global override | 2026-07-08 |
| The "model decides its own tier" variant is **optional**, not required | Willison found it beat a fixed rule, but forcing it over-scopes; a project MAY adopt it in its contract | 2026-07-08 |

## Tracking

- Milestone: created at acceptance (the folded flow); one merge carries spec +
  roadmap link.
- Issues (three, **parallel** — disjoint files, one wave):
  - **A** — the contract field: `skills/inception/templates/workflow.md` +
    `skills/inception/SKILL.md` + loopkit's `docs/workflow.md`.
  - **B** — `skills/implement/SKILL.md`: read the field; pass implementer +
    reviewer tiers to native model selection; no-op-diff cheaper reviewer;
    `CLAUDE_CODE_SUBAGENT_MODEL` foot-gun.
  - **C** — `skills/plan/SKILL.md`: read the reviewer tier for step-6, with the
    spec-acceptance-review-stays-top-tier carve-out.

## Verification

- [ ] Verify passes (`bash scripts/verify.sh`).
- [ ] `skills/inception/templates/workflow.md` carries the OPTIONAL role->tier
      field with placeholders + the default-`inherit` note; no concrete model name
      leaks into the template (grep-verifiable).
- [ ] No **tool-agnostic skill prose** (`skills/plan`, `skills/implement`) contains
      a literal model name — only role/tier references that read from the contract
      (grep-verifiable).
- [ ] `skills/implement/SKILL.md` passes implementer + reviewer tiers to the native
      Agent `model` selection, applies the no-source-change cheaper-reviewer rule,
      and warns about `CLAUDE_CODE_SUBAGENT_MODEL` (grep-verifiable).
- [ ] `skills/plan/SKILL.md` reads the reviewer tier for step-6 **and** states the
      spec-acceptance review stays top-tier (grep-verifiable).
- [ ] loopkit's `docs/workflow.md` records the concrete dogfood mapping.
- [ ] No new dependency / headless / scheduler / API key / local state
      (config-surface guard).

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| A cheaper implementer tier degrades output quality | the tier is per-project config the maintainer sets and can revert to `inherit`; the review gate still runs and must return `APPROVE` |
| `CLAUDE_CODE_SUBAGENT_MODEL` silently overrides the routing, confusing debugging | the skills document the override explicitly as a foot-gun |
| The reviewer tier accidentally downgrades the spec-acceptance review | the carve-out is explicit in `skills/plan/SKILL.md`: the spec gate review is never downgraded |
| Model names drift as models churn | they live only in the contract (one project-local edit), never in the skills — exactly the Verify-command precedent |

## Decision log

- 2026-07-08: Drafted from the `model-tier-slots` roadmap seed (2026-07-08 audit)
  + the reviewer-tier facet deferred here from `ceremony-overhead`. Design settled
  entirely by the prior-art anchor (OPTIONAL contract field, native selection,
  names-only-in-contract, foot-gun) — no genuinely-open decision. The Willison
  "model-decides-tier" variant is recorded as optional, not required, to keep the
  change bounded. Three issues, parallel on disjoint files (contract vs implement
  vs plan). Planned via the folded flow (ceremony-overhead): milestone + roadmap
  link on the spec branch, one merge.
