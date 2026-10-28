# Changelog

All notable changes to loopkit are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Versioning and the release process are defined in [`docs/release.md`](docs/release.md).

## [Unreleased]

## [2.2.1] - 2026-10-28

### Changed

- `/loopkit:inception`, `/loopkit:roadmap` and `/loopkit:ship` carry Claude
  Code's native `disable-model-invocation: true`: Claude no longer loads them on
  its own, and their descriptions leave the always-loaded skill listing. The
  human still runs each by name. `plan`, `implement` and `design` stay
  model-invocable (`/loop` and `/loopkit:plan` invoke them).
- The inception settings template ships `defaultMode: acceptEdits` instead of
  `bypassPermissions`, which Claude Code ignores in a project file (the session
  started in Manual mode). Step 8 states the permission facts: a project-level
  `auto` falls back to the built-in default, a project `defaultMode` outranks
  `~/.claude/settings.json` (the opt-in for `auto` is `--permission-mode auto`),
  and `acceptEdits` auto-approves edits only inside the working directory or
  `additionalDirectories`. `--here` flags any other project `defaultMode` as a
  gap.
- The release contract (template and loopkit's own `docs/release.md`) no longer
  points at a pre-publish preview that `/loopkit:ship` does not have: the human
  reviews with `--dry-run`, passes an explicit `vX.Y.Z` to override the computed
  version, and curates `## [Unreleased]` on the base branch before invoking.
  `/loopkit:ship` promotes a curated unreleased section instead of overwriting
  it.

### Fixed

- The `# Compact Instructions` section inception writes into a target
  `CLAUDE.md` now keeps the milestone target and the running wave's issues and
  re-derives the unblocked frontier from GitHub after a compaction.
- `/loopkit:implement` no longer claims the orchestrator can run `/compact`: at a
  wave boundary it tells the human this is a safe point and keeps going. The
  subagent-model order is corrected (a per-call `model` beats
  `CLAUDE_CODE_SUBAGENT_MODEL`, which only forces with
  `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1`), and `code-reviewer` is no longer named
  as a built-in agent; `/loopkit:plan` names the `omitClaudeMd` condition for a
  custom reviewer.
- The settings template repeats each git hard limit for the `git -C <path>`
  form, and the skills explain the `git -C … push` phrasing honestly.
- Contract drift: inception describes the board as a queue and status display,
  not a claim or lock; the workflow template's plan loop asks instead of
  auto-picking the next phase; hand-offs name `/loopkit:plan` and
  `/loopkit:ship` instead of the native `/plan` or a bare `/ship`.
- Stale facts: the README lists six skills (with `/loopkit:ship`) and the
  one-orchestrator-per-milestone model; `docs/release.md` no longer hardcodes a
  current version; deep-research cost guidance names no model or cost multiple.

## [2.2.0] - 2026-07-16

### Added

- Two structural guards in `scripts/verify.sh`. A **merge-ordering guard**
  asserts every `--delete-branch` merge site is preceded by
  `git worktree remove "$wt"`, and rejects a `--repo`/`-R` flag or a
  line-continuation at that site — both silently disable gh's local-branch
  delete. An **always-in-context guard** asserts `docs/vision.md` and
  `docs/constitution.md` stay `@import`ed in `CLAUDE.md`, so the
  permanently-loaded foundation docs cannot silently detach from the gate that
  reads them.

### Fixed

- The `/loopkit:implement` merge sequence leaked a local branch on every merge:
  `--delete-branch` cannot delete a branch a worktree still holds. All four
  skills (`implement`, `ship`, `plan`, `roadmap`) now remove the worktree
  **before** the squash-merge, and the `/loopkit:implement` §4.5 cleanup sweep's
  branch rule is honest and report-only — it had keyed its safety on the wrong
  ref (a squash-merged branch is deletable only while its upstream
  `origin/<branch>` survives, never by ancestry to the base).
- The `track:adhoc` auto-pick eligibility check queried a non-existent
  `gh issue view` field, silently failing the trust-boundary trusted-author
  gate; it now reads `author_association` via the REST API
  (`gh api repos/:owner/:repo/issues/<n>`).
- The spec-acceptance gate could pass a spec that contradicts a foundation doc.
  `/loopkit:plan` §6 now explicitly asks whether the spec contradicts
  `docs/vision.md`, `docs/constitution.md`, or `docs/architecture.md` (with
  citation verification), and `/loopkit:roadmap` Step 3 records foundation-doc
  impact as a sweep across all three docs rather than a single hit.

## [2.1.0] - 2026-07-09

### Added

- `/loopkit:ship` — the sixth loop skill: an attended, GitHub-native release
  phase (determine the version -> update the changelog -> tag -> publish via
  native `gh` + `git`), driven by a per-project `docs/release.md` contract;
  `/loopkit:inception` Step 7c bootstraps that contract from a project-agnostic
  template. Ships loopkit's own self-ship contract and this changelog.
- Optional `role -> tier` model routing in `docs/workflow.md` (orchestrator /
  implementer / reviewer), read by `/loopkit:implement` and `/loopkit:plan` and
  passed to native subagent model selection.
- Structural `Verify`: `bash scripts/verify.sh` (native `claude plugin validate`
  plus a config-surface auth/state guard) as the per-PR machine gate.
- Trust boundary: read-discipline and trusted-author (`author_association`)
  gating before a `track:adhoc` issue is auto-picked by the implement loop.
- Resume- and compaction-safety in the `/loopkit:implement` orchestrator
  (branch/PR idempotency, wave-boundary compaction, a ProjectV2 field-ID recipe,
  `--limit` on `gh` list calls).

### Changed

- `/loopkit:plan` folds the roadmap-link commit onto the accepted spec branch
  (one acceptance PR, not two) and records the Decision log pre-merge.
- `docs/constitution.md` gains a binding trust-boundary principle; the
  permanently-loaded foundation docs were deduplicated and slimmed, and the
  hard-limit list is single-sourced to `.claude/settings.json`.
- The `docs/design/loopkit-interpretation.svg` exemplar was re-authored to
  English and extended to show all six skills (including `/loopkit:ship`) in a
  single row.
- `README.md` drift fixed (dropped "READY spec" and "select/claim" wording).

### Fixed

- Closed the orchestrator wave-loop's undefined exit states and wired bounded
  review-retry into the plan and implement review loops.
- Shell-injection hardening: safe `gh` parameter passing in `/loopkit:plan`
  (values passed by file, never interpolated unquoted); the settings template
  replaces project-specific deny rules with a placeholder.
- Skill `description` frontmatter is quoted so it parses as valid YAML.

## [2.0.0] - 2026-07-02

Baseline release — the first tagged, published loopkit. This entry is a baseline
marker, not a reconstructed history; changes from here forward are recorded above.

### Added

- The proportional-loop toolkit as a Claude Code plugin: five loop skills
  (`/loopkit:inception`, `/loopkit:plan`, `/loopkit:implement`,
  `/loopkit:design`, `/loopkit:roadmap`) with the proportional dial
  (full-spec / living-spec / `track:adhoc` fast-lane).
- GitHub issues / milestones / Project board as the single durable state
  machine; subscription-auth only (no headless, no API key, no scheduler).
- Foundation docs (vision, constitution, architecture, prior-art, roadmap) and
  the per-project contracts (`docs/workflow.md`, `docs/design.md`).

[Unreleased]: https://github.com/skrischer/loopkit/compare/v2.2.0...HEAD
[2.2.0]: https://github.com/skrischer/loopkit/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/skrischer/loopkit/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/skrischer/loopkit/releases/tag/v2.0.0
