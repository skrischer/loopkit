# Changelog

All notable changes to loopkit are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Versioning and the release process are defined in [`docs/release.md`](docs/release.md).

## [Unreleased]

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
