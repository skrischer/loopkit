# Changelog

All notable changes to loopkit are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Versioning and the release process are defined in [`docs/release.md`](docs/release.md).

## [Unreleased]

### Added

- `docs/release.md` — loopkit's self-ship contract (the `docs/workflow.md` /
  `docs/design.md` sibling): versioning scheme, version-bearing files, tag
  format, changelog source, publish target, and pre-publish Verify.
- `CHANGELOG.md` — this file, in Keep a Changelog format.
- Attended, GitHub-native release phase (`/loopkit:ship`) plus its foundation
  wiring (vision / constitution / architecture) — human-invoked, in-session via
  native `gh` + `git`, no CI bot or scheduler.

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

[Unreleased]: https://github.com/skrischer/loopkit/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/skrischer/loopkit/releases/tag/v2.0.0
