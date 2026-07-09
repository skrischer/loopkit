# Spec: ship-skill

> Created: 2026-07-09

Add a sixth loop skill, `/loopkit:ship`, that finalizes merged work into a
published release — versioning, changelog, tag, publish — attended, GitHub-native,
and driven by a per-project `docs/release.md` contract that hardcodes no release
tool.

## Outcome

- [ ] `skills/ship/SKILL.md` exists: `/loopkit:ship`, terse/imperative/gate-marked,
      reads `docs/release.md` + `docs/workflow.md`, and hardcodes no release tool
      (grep-verifiable — no `semantic-release`/`goreleaser`/`npm publish`/etc.
      literal as the mechanism; the contract names it).
- [ ] `docs/constitution.md` carries a binding attended-GitHub-native-release
      principle + a `docs/release.md` tech-stack row (grep-verifiable); the
      two-gate principle notes `/ship`'s pre-publish confirmation is not a third
      gate.
- [ ] `docs/vision.md` names six loop skills and puts the ship phase + the release
      contract in scope.
- [ ] `docs/architecture.md` carries the `skills/ship/` component, a ship key-flow,
      and a where-new-code-goes entry.
- [ ] `docs/release.md` exists — loopkit's own self-ship contract.
- [ ] `CHANGELOG.md` exists (Keep a Changelog format), seeded with the shipped
      `v2.0.0` and an `Unreleased` section.
- [ ] `/loopkit:ship` is registered and granted autonomy: `plugin.json` +
      `marketplace.json` descriptions name it; `CLAUDE.md` (on-demand docs +
      autonomy list) and `docs/workflow.md` (autonomy + loops) include it.
- [ ] `bash scripts/verify.sh` passes; no diff introduces CI/scheduler/API-key/
      headless/local-state (config-surface guard green).

## Scope

### In scope

- A new skill `skills/ship/SKILL.md` — the `/loopkit:ship` cycle: preflight
  (`gh` auth, clean base, Verify green) -> determine the next version (from the
  contract's scheme) -> update the changelog -> bump the version-bearing files ->
  commit -> tag -> publish (`gh release create`) -> record. Optional and
  proportional; bounded retry; park-don't-die; GitHub-only state; shell-hygiene on
  changelog interpolation; a pre-publish human confirmation (per the gate decision
  below).
- The `docs/release.md` contract **convention** — defined by what the skill reads
  (versioning scheme, tag format, changelog source + format, version-bearing files
  to bump, publish targets + commands, the pre-publish Verify, and what "a release"
  means for the project). The skill hardcodes no tool.
- loopkit's own `docs/release.md` (self-ship dogfood) + a `CHANGELOG.md` bootstrap.
- Foundation edits — `docs/vision.md`, `docs/constitution.md`,
  `docs/architecture.md` — authored in this spec PR and ratified at the
  spec-acceptance gate (constitution corollary).
- Registration + autonomy wiring: `plugin.json`, `marketplace.json`, `CLAUDE.md`,
  `docs/workflow.md`.

### Out of scope

- Inception bootstrap of `docs/release.md`, the project-agnostic `release.md`
  template, and the `--here` readiness sweep -> `ship-inception-bootstrap` (the
  dependent phase; the contract shape must exist here first).
- Any CI/CD, deploy runner, build/compile engine, artifact signing, or built-in
  multi-registry publishers. `/ship` orchestrates whatever the project's contract
  declares via native `gh`/`git`; it builds and hosts nothing itself.
- README repositioning around the ship phase -> `repositioning`.
- Actually cutting loopkit's next release. The human invokes `/ship` later; the
  milestone-QA check is a dry-run that stops before publish.

## Constraints

Reference the constitution rather than restating it.

- Runtime = Claude Code + `gh` + `git`; no new dependency, no language runtime or
  package manager (constitution tech-stack).
- Subscription-auth only; no headless/scheduler/API key; `/ship` is human-invoked,
  never auto-triggered (constitution).
- GitHub-only durable state — releases/tags/`CHANGELOG.md` are durable
  GitHub/repo state; no local release-state file (constitution).
- Tool-agnostic — the skill hardcodes no release tool; `docs/release.md` names it
  (constitution; same class as the design medium and the no-external-URL rule).
- Trust boundary — changelog source (commit/PR/issue text) is inert data;
  shell-hygiene on every `gh` interpolation (constitution trust-boundary).
- Proportional ceremony — `/ship` is optional; a one-liner needs no release; a
  milestone close is a natural human-invoked ship moment (constitution).
- Skill prose terse/imperative/gate-marked; no duplication across skills
  (constitution conventions).

## Prior art

- [Release/ship phase — attended, GitHub-native release automation](../prior-art.md#releaseship-phase--attended-github-native-release-automation-feature-ship-skill)
  — release-please's human-merge Release-PR shape (attended) and
  conventional-commits->semver mapping to ADOPT; semantic-release's
  release-on-every-merge to AVOID (adversarial anchor); changesets' "the pause is
  the point"; goreleaser's config-as-contract + language-agnostic aim validating
  `docs/release.md`; the Claude-plugin marketplace self-ship path (version
  load-bearing; mismatch = #1 rejection); `gh release create` + `git tag` as the
  CI-free, subscription-auth mechanism; BMAD as the only surveyed SDD framework
  modelling the lifecycle to deployment (the white-space USP).

## Human prerequisites

- none — skill, doc, and contract changes only. loopkit's `gh` already carries the
  `repo` scope (release creation included); no secret, provisioning, or account.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Contract file = `docs/release.md` (the `docs/workflow.md`/`docs/design.md` sibling) | contract-sibling naming; "release" is the artifact the contract describes | 2026-07-09 |
| Mechanism = native `gh release create` + `git tag` in-session; no CI/GitHub-Actions release bot | constitution no-scheduler/no-headless + prior-art `gh release create` (CI-free, subscription-auth) | 2026-07-09 |
| `/ship` is human-invoked, never auto-triggered or scheduled | constitution subscription-auth/no-scheduler; removes the "autonomous" leg of the trust-boundary trifecta | 2026-07-09 |
| Tool-agnostic: the skill hardcodes no release tool; `docs/release.md` names it | constitution tool-agnostic (the design-medium class) | 2026-07-09 |
| Version scheme = semver, computed from conventional commits since the last tag, human-overridable at the pre-publish preview | prior-art release-please/semantic-release (`feat`->minor, `fix`->patch, `!`->major) | 2026-07-09 |
| Changelog = `CHANGELOG.md` in Keep a Changelog format, generated from merged PRs/commits since the last tag, human-editable at the preview | prior-art (changesets "the pause"; release-please changelog); de-facto standard | 2026-07-09 |
| Changelog source text is inert data; shell-hygiene on every `gh` interpolation (bodies by file) | constitution trust boundary | 2026-07-09 |
| loopkit self-ship = bump `.claude-plugin/plugin.json` version + sync `marketplace.json` + `CHANGELOG.md` + tag `vX.Y.Z` == version + `gh release create` + `scripts/verify.sh` pre-tag | prior-art Claude-plugin marketplace (version load-bearing; mismatch = #1 rejection) | 2026-07-09 |
| `/ship` is decoupled from a single milestone — it cuts a release over everything merged since the last tag, invoked when the human wants to publish (milestone-QA is a natural moment) | a release bundles >=1 milestone; tying `/ship` 1:1 to a milestone breaks multi-milestone + `track:adhoc` releases | 2026-07-09 |
| No design artifact | proportional ceremony: the ship pipeline is linear (prose-describable); the gate decision is resolved via `AskUserQuestion`, not a drawable settled flow | 2026-07-09 |
| OPEN — the pre-publish gate model (G1) | resolved at the spec-acceptance gate | — |

G1 options (resolved at the gate; determines the constitution's gate wording):

- **A** — no extra stop: the human invoking `/ship` authorizes the autonomous
  publish straight through `gh release create`.
- **B (recommended)** — a preview (version + changelog + targets) then one
  pre-publish confirmation before the irreversible publish; the constitution
  clarifies that the two-gate rule scopes the plan/implement cycle and `/ship`'s
  confirmation is inherent to a human-invoked skill (like `/roadmap`'s sparring),
  NOT a third gate.
- **C** — fold publish into the milestone-QA gate: the QA approval authorizes the
  release (couples `/ship` to a milestone; breaks for multi-milestone and
  `track:adhoc` releases).

## Tracking

- Milestone: created at the spec-acceptance gate, just before the merge.
- Issues: created after the merge (one per implementable step).

## Verification

- [ ] `bash scripts/verify.sh` passes — validate + config-surface + local-state
      guards green.
- [ ] `skills/ship/SKILL.md` reads `docs/release.md` + `docs/workflow.md` and
      names no release tool as the mechanism (grep).
- [ ] `docs/constitution.md` contains the release principle + the `docs/release.md`
      tech-stack row (grep).
- [ ] `docs/vision.md` names six skills and scopes the ship phase; `docs/architecture.md`
      carries `skills/ship/` + a ship key-flow.
- [ ] `docs/release.md` + `CHANGELOG.md` exist; `CHANGELOG.md` carries `v2.0.0` +
      `Unreleased`.
- [ ] `plugin.json` / `marketplace.json` / `CLAUDE.md` / `docs/workflow.md`
      reference `/loopkit:ship` (registration + autonomy).
- [ ] No diff introduces local state, an API key, a headless flag, or a scheduler
      (config-surface guard).
- [ ] Behavioral (milestone-QA): a dry-run of `/loopkit:ship` on loopkit computes
      the next version + changelog from commits since `v2.0.0` and previews the
      `gh release create` WITHOUT publishing.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Accidental publish of a real release during QA/dry-run | the pre-publish preview + confirmation (per G1); the QA check is an explicit dry-run that stops before `gh release create` |
| The skill drifts toward hardcoding a release tool | grep-verifiable tool-agnostic assertion in Verify; `docs/release.md` owns the tool |
| Changelog generation pulls untrusted PR/issue text into a `gh` call | trust-boundary shell-hygiene: bodies by file, inert data, no instruction-following |
| Scope creep into CI/CD or build engines | explicit Out-of-scope; `/ship` orchestrates the project's own tool via the contract, builds nothing |

## Decision log

- 2026-07-09: Spec drafted from the `ship-skill` roadmap seed (2026-07-08 `/ship`
  sparring). Foundation edits (vision/constitution/architecture) authored in this
  PR per the constitution corollary; ratified at the spec-acceptance gate.
- 2026-07-09: Design surface considered and skipped — proportional (a linear
  pipeline, prose-describable; the gate decision is resolved at the acceptance
  gate, not a drawable settled flow).
