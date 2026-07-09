# Spec: ship-inception-bootstrap

> Created: 2026-07-09

Wire `/loopkit:inception` to bootstrap the `docs/release.md` contract for a new
project — a project-agnostic template + an OPTIONAL Step 7c that mirrors the
design-contract step, plus a `--here` readiness sweep that detects a missing
release contract on a releasable project.

## Outcome

- [ ] `skills/inception/templates/release.md` exists — a project-agnostic release
      contract template (placeholders intact, no project-specific values).
- [ ] `skills/inception/SKILL.md` has an OPTIONAL **Step 7c — Release contract**
      that authors `docs/release.md` from the template, mirroring Step 7b (design
      contract): only for a project that publishes releases; a non-releasing
      project skips it (no `docs/release.md`, no gate).
- [ ] `skills/inception/SKILL.md`'s `--here` readiness sweep detects a missing (or
      placeholder-stale) `docs/release.md` on a releasable project and routes to
      Step 7c — NOT a second bootstrap inside `/ship`.
- [ ] Inception's frontmatter/intro and close-out readiness checklist name the
      release contract alongside the design contract.
- [ ] `bash scripts/verify.sh` passes; the template carries no project-specific
      values (placeholder guard green).

## Scope

### In scope

- `skills/inception/templates/release.md` — the project-agnostic template,
  generalized from loopkit's own `docs/release.md` (from `ship-skill`): versioning
  scheme, tag format, changelog source + format, version-bearing files, publish
  targets + commands, and the pre-publish Verify — all as placeholders.
- `skills/inception/SKILL.md` — an OPTIONAL **Step 7c (Release contract)** that
  mirrors Step 7b; the `--here` readiness sweep detection + routing; the
  frontmatter, intro, and close-out readiness-checklist updates.

### Out of scope

- The `/loopkit:ship` skill, the `docs/release.md` contract convention, and
  loopkit's own `docs/release.md` -> `ship-skill` (the predecessor; done).
- Any change to `/ship` behavior.
- Retrofitting `docs/release.md` into existing non-loopkit projects beyond the
  `--here` sweep offering it.
- A new constitution principle or a vision edit — `ship-skill` already added the
  release principle and scoped the ship phase; the architecture already
  anticipates the `release.md` template (its where-new-code-goes entry). This
  phase is skill + template wiring only, so it carries **no foundation-doc edit**.

## Constraints

Reference the constitution rather than restating it.

- Depends on `ship-skill` (#20): loopkit's own `docs/release.md` (the contract
  shape) must exist to generalize into the template.
- Templates contain no project-specific values; placeholders stay intact
  (constitution quality gate; `scripts/verify.sh` asserts).
- Mirror Step 7b (design contract) exactly: OPTIONAL + proportional, and the
  `--here` sweep routes a missing contract back to inception, never a second
  bootstrap inside the consuming skill.
- All artifacts in English; skill prose terse/imperative/gate-marked; no
  duplication across skills (constitution conventions).

## Prior art

- [Release contract bootstrap — inception authors the per-project release medium](../prior-art.md#release-contract-bootstrap--inception-authors-the-per-project-release-medium-feature-ship-inception-bootstrap)
  — the Superdesign/loopkit design-contract bootstrap precedent (reuse the same
  move for release.md) + spec-kit's setup-vs-iteration command topology (author
  the contract once at inception, `/ship` runs it per release).
- [Release/ship phase — attended, GitHub-native release automation](../prior-art.md#releaseship-phase--attended-github-native-release-automation-feature-ship-skill)
  — the shape being templatized (what `docs/release.md` must contain).

## Human prerequisites

- none — skill + template changes only.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Template = `skills/inception/templates/release.md`, alongside the other inception-filled templates | the established templates dir (`workflow.md`, `design.md`, `settings.json`, ...) | 2026-07-09 |
| Step 7c mirrors Step 7b (design contract): OPTIONAL, releasable-projects-only; a non-releasing project skips it with no `docs/release.md` and no gate | Step 7b precedent + proportional ceremony (do not force a release contract on a project that never publishes) | 2026-07-09 |
| `--here` readiness sweep detects a missing/placeholder-stale `docs/release.md` on a releasable project and routes to Step 7c — never a second bootstrap inside `/ship` | design.md-missing -> inception precedent (design-coverage row); a skill owns one bootstrap, not two | 2026-07-09 |
| Template is project-agnostic with placeholders (no project values) | constitution quality gate; `scripts/verify.sh` template guard | 2026-07-09 |
| No foundation-doc edit (no constitution/vision/architecture change) | `ship-skill` already added the release principle + scoped the phase + anticipated the template in architecture; this phase is skill+template wiring | 2026-07-09 |
| No design artifact | proportional ceremony: pure bootstrap wiring, no flow/UI/concept to draw | 2026-07-09 |

## Tracking

- Milestone: created at the spec-acceptance gate, just before the merge
  (`Depends on milestone: #20`).
- Issues: created after the merge (one per implementable step).

## Verification

- [ ] `bash scripts/verify.sh` passes — validate + template-placeholder guard
      green.
- [ ] `skills/inception/templates/release.md` exists; no project-specific values
      (grep — the verify.sh template guard).
- [ ] `skills/inception/SKILL.md` has Step 7c (Release contract, OPTIONAL, mirrors
      7b) + the `--here` sweep detection/routing + the close-out checklist item +
      the frontmatter/intro mention (grep).
- [ ] Behavioral (milestone-QA): inception Step 7c on a sample releasable project
      produces a filled `docs/release.md` from the template; a non-releasing
      project skips it (no file, no gate); `--here` on loopkit (which now HAS
      `docs/release.md`) reports the release contract present, no gap.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| The template leaks loopkit-specific values (plugin.json/marketplace.json) | write it project-agnostic with placeholders; `scripts/verify.sh` template guard asserts no project values |
| Step 7c drifts from Step 7b (two divergent bootstrap patterns) | author it as a mirror of Step 7b; the `--here` sweep reuses the design.md-missing routing |
| A release contract is forced on a project that never publishes | Step 7c is OPTIONAL (releasable-projects-only), exactly like Step 7b for design |

## Decision log

- 2026-07-09: Spec drafted from the `ship-inception-bootstrap` roadmap seed
  (2026-07-08 `/ship` sparring), the dependent half of the `/ship` feature. No
  foundation-doc edit — `ship-skill` carried the vision/constitution/architecture
  changes; this phase mirrors the design-contract bootstrap (Step 7b) for release.
- 2026-07-09: Design surface considered and skipped — pure bootstrap wiring, no
  flow/UI/concept to visualise.
