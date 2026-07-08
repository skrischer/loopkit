# Spec: trust-boundary

> Created: 2026-07-08

Establish a binding trust-boundary principle and close the two evidenced leaks
where partly-untrusted GitHub-sourced text reaches a shell or an
instruction-following context in the loopkit skills.

## Outcome

- [ ] `docs/constitution.md` carries a binding trust-boundary principle
      (read-discipline + shell-hygiene + Rule of Two), grep-verifiable.
- [ ] `skills/plan/SKILL.md` constructs no `gh` command by interpolating
      scope/step/spec text unquoted into a shell string — GitHub-bound values
      are passed via safe parameter passing.
- [ ] `skills/implement/SKILL.md` frames a `track:adhoc` issue body as fully
      defining scope yet an inert request to plan against (not a licence to act),
      and an externally-authored adhoc issue is excluded from loop-mode
      auto-pick unless the author is trusted (author_association) or a human
      explicitly selects it — a selection-time exclusion, not a new gate.
- [ ] Verify passes; no new dependency, headless flag, scheduler, API key, or
      local state; the config-surface guard stays green.

## Scope

### In scope

- A new binding principle in `docs/constitution.md` (authored here, ratified at
  the spec-acceptance gate — the constitution corollary that foundation edits
  belong to a plan spec PR).
- Shell-hygiene in `skills/plan/SKILL.md` — the `gh` milestone/issue creation
  commands (~lines 225-229) must not interpolate scope/step/spec into a
  double-quoted string.
- Read-discipline + a trusted-author / human-select **auto-pick eligibility rule**
  (a selection-time exclusion, not a gate) for the `track:adhoc` fast-lane in
  `skills/implement/SKILL.md` (the `track:adhoc fast-lane` section and the Orient
  step, ~lines 44-54 and 130-136). When the implementer edits the "its body is
  the whole contract" prose, it preserves the body's scope-defining role (no spec
  exists) and adds the trust framing — it does not negate the "contract" language
  wholesale.

### Out of scope

- The unscoped `bypassPermissions` fix and deny-list gaps -> `permission-template-hardening`
  (a deny-list guards shell-exec only; this spec closes the instruction/shell
  path a deny-list cannot touch — the two are sequenced, not merged).
- Any autonomy-dial / gate pre-authorisation -> deferred; this spec is its hard
  predecessor, not its vehicle.
- Repo-hygiene (comment-deletion Action, issue locking, blocking accounts,
  public/private choice) -> the target project's choice, explicitly NOT a
  loopkit primitive. The per-repo Action was discarded on purpose and must never
  enter the inception template.
- The latent data-only reads (`implement` issue-body `Depends on:` parsing,
  milestone-marker matching) -> matched as data, never executed; no change owed.
- Issue #138 (the malware-comment trigger) is the repo-hygiene facet; this spec
  addresses only the project-agnostic skill facet the note isolates.

## Constraints

- The foundation-doc edit belongs to this spec PR and is ratified at the
  spec-acceptance gate (`docs/constitution.md` corollary), never in
  `/loopkit:implement`.
- GitHub-only durable state; subscription-auth only; no headless / scheduler /
  API key (constitution).
- Proportional ceremony: change only the two evidenced loci; the principle
  covers the rest normatively — no skill-wide rewrite (guards against bloat).
- Skill prose stays terse/imperative; no duplication across skills.

## Prior art

- [State-machine trust boundary](../prior-art.md#state-machine-trust-boundary--untrusted-github-text-as-instructionshell-feature-trust-boundary)
  — Willison lethal-trifecta + prompt-injection design patterns
  (plan-then-execute / dual-LLM) + Meta Rule of Two: adopt inert-request framing,
  shell-hygiene, and a human gate when all three legs coincide; avoid
  injection-detection filters (futile — "99% is a failing grade").
- [Attended-loop permission guardrails](../prior-art.md#attended-loop-permission-guardrails-feature-permission-template-hardening)
  — the sibling deny-list/bypass work; the boundary here is the instruction/shell
  path a deny-list structurally cannot reach.

## Human prerequisites

- none — skill and doc changes only; no secret, provisioning, or account.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| A `track:adhoc` body is an inert request, never an executable contract | Willison plan-then-execute / dual-LLM: untrusted text must not trigger consequential actions | 2026-07-08 |
| `gh` values are passed via safe parameter passing, never interpolated unquoted into a shell string | Willison shell-hygiene; the plan skill's current `-f`/`--body` interpolation breaks or executes on backticks/`$()`/quotes | 2026-07-08 |
| trust-boundary is a binding constitution principle (read-discipline + shell-hygiene + Rule of Two) | Meta Rule of Two via Willison; it is the hard predecessor of any autonomy-dial | 2026-07-08 |
| No injection-detection / classification filter | Willison: detection is futile as the boundary; capability separation is the boundary | 2026-07-08 |
| bypass / deny-list scoping excluded -> `permission-template-hardening` | a deny-list guards shell-exec only and cannot touch the instruction path; split kept from the 2026-07-08 audit | 2026-07-08 |
| `track:adhoc` auto-pick requires trusted authorship (author_association) **or** explicit human selection — the two combined, not a fork | Rule of Two applied: a trusted author removes the untrusted-input leg (auto-pick fine); everyone else keeps all three legs, so a human selects. The roadmap seed states this combined rule | 2026-07-08 |
| Trusted for adhoc auto-pick = `author_association` **OWNER or MEMBER** only; COLLABORATOR, CONTRIBUTOR and NONE require explicit human selection | Spec-acceptance gate 2026-07-08: on a public repo with no QA gate for the adhoc lane, OWNER/MEMBER is the proportional trust boundary — a compromised collaborator account cannot trigger an autonomous loop | 2026-07-08 |

## Tracking

- Milestone: created from this spec once it is merged
- Issues: one per implementable step (created after merge)

## Verification

- [ ] Verify passes (`bash scripts/verify.sh`) — validate + config-surface +
      local-state guards green.
- [ ] `docs/constitution.md` contains the trust-boundary principle
      (read-discipline, shell-hygiene, Rule of Two) — grep-verifiable.
- [ ] `skills/plan/SKILL.md` no longer interpolates scope/step/spec into a
      double-quoted `gh -f`/`--body` string; a shell-hygiene rule is stated.
- [ ] `skills/implement/SKILL.md` frames the adhoc body as an inert request and
      conditions auto-pick eligibility on trusted authorship / human selection
      (a selection-time exclusion, not a gate) per the gate decision.
- [ ] No diff introduces local state, an API key, a headless flag, or a
      scheduler (config-surface guard).

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Read-discipline over-restricts and adds friction | change only the evidenced loci; the principle is normative, not a skill-wide rewrite |
| adhoc auto-pick rule too strict, hurts solo autonomy | the gate decision picks the proportional rule (author_association vs. human-select) |
| shell-hygiene fix is skill prose, not testable code | Verify's config-surface guard + a grep assertion in the milestone-QA scenarios |

## Decision log

- 2026-07-08: Spec drafted from the `trust-boundary` roadmap seed (2026-07-08
  Fable audit). Foundation edit (the constitution principle) authored in this PR
  per the constitution corollary; ratified at the spec-acceptance gate.
- 2026-07-08: Spec-acceptance gate — trusted authorship for `track:adhoc`
  auto-pick set to `author_association` OWNER/MEMBER; COLLABORATOR and external
  authors require explicit human selection. In-session review returned APPROVE
  after three blocking findings were addressed (gate-count wording, the
  false-open decision, shell-hygiene coverage of the write path).
