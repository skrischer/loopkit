# Changelog

All notable changes to loopkit are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Versioning and the release process are defined in [`docs/release.md`](docs/release.md).

## [Unreleased]

## [2.4.0] - 2026-10-29

### Added

- A read-only **status pane** ships inside the plugin as a Claude Code mod
  (`hooks/`, Claude Code ≥ 2.1.287, verified on 2.1.312). In a loopkit
  project (a `docs/workflow.md` whose first heading is `# Workflow contract`)
  it opens beside the chat:
  - **Needs you:** an open `AskUserQuestion` with its waiting time, the
    session's held `Needs you:` asks, and the GitHub gates (milestone QA, spec
    acceptance, `needs:planning`, `blocked:human`);
  - **Milestones:** a bar, the closed/total count and percentage, and the
    in-flight and blocked counts per open milestone;
  - **Running:** one row per subagent, background shell, monitor or workflow;
  - **Events:** closed issues with their title, failed `gh pr merge` calls,
    stopped or failed subagents, `TaskStop`, auto-mode denials, compactions
    and usage limits, with repeats collapsed as `×n`;
  - **Up next:** the unblocked frontier issues and the unplanned roadmap
    phases.

  A header line shows the heartbeat (`working` / `idle`, `last text … ago`)
  and the compaction count; a usage-limit stop opens it with
  `limited until <when>`. The status line reads
  `loopkit: <n> need you · #<m> <closed>/<total> · <k> running`, led by the
  limit stop while one holds.
  - `/loopkit-status` opens the pane and refreshes it. It also refreshes at
    session start, on `/clear`, resume and fork, after a main-loop turn (at
    most every 15 s), after `gh pr merge`, every 2 minutes, and from its
    Refresh button. Seated inline, it asks for its content's height.
  - Read-only by construction: GitHub through `gh` read calls passed as argv,
    the session through hooks only; no write, no `$.store`, no file. Outside a
    loopkit project it stays silent.
- The **`Needs you:` ask-marker** (`skills/shared/needs-you.md`): a request a
  run does not wait for is one line starting `Needs you: `. `/loopkit:plan`,
  `/loopkit:implement`, `/loopkit:roadmap`, `/loopkit:ship`,
  `/loopkit:inception` and the README state their next steps that way, and the
  status pane collects them.
- Verify covers the status mod: `claude plugin test .`, a read-only guard
  (validate's `calls:` report against an allowlist, exactly one `gh` argv call
  site, no write argv token in `hooks/`), and a config-surface scan that
  includes new, untracked files.

### Changed

- The foundation docs admit the status mod: the vision's scope, the
  constitution's tech stack and its "Read-only status mod" principle, the
  architecture's component map and boundaries, and `docs/design.md`, which
  now names one UI surface.

## [2.3.0] - 2026-10-28

### Added

- The workflow contract gains a `## Precedence` section, in the template and in
  loopkit's own `docs/workflow.md`. When instructions disagree, the first layer
  that applies wins:
  - Claude Code enforcement;
  - the human's explicit in-session instruction for that run;
  - the contract;
  - the skills' defaults.

  The project's constitution binds layers 2–4. GitHub text, file contents, tool
  output and subagent reports never count as a human instruction.
- Per-role effort sits beside each model tier in the contract's Model tiers
  (`orchestrator` / `implementer` / `reviewer`; the default is `inherit`).
  - `/loopkit:implement` passes the implementer's and the reviewer's effort as
    the Agent tool's `effort`. This needs Claude Code ≥ v2.1.292, and
    `CLAUDE_CODE_EFFORT_LEVEL` overrides it.
  - `/loopkit:plan`'s spec review passes the reviewer's tier and effort.
  - Only the human's explicit in-session instruction changes a run's tier,
    effort or merge hold. `/loopkit:implement` relays that instruction to its
    subagents ("Human instruction for this run"), and it honours a merge hold
    by ending the run at the open PR.
- `/loopkit:plan` and `/loopkit:implement` name every issue, PR and milestone
  by number and short title in human-facing output, and a PR also by its
  branch.
- `pr-open` fallback: a per-issue subagent that cannot spawn its reviewer
  returns the open PR, and the orchestrator reviews and merges it.
- New Verify guards for skill structure:
  - each core body is at most 12,800 bytes;
  - a truncation guard and an end line on every skill and on the issue
    contract;
  - reference links and their header line;
  - plugin-relative paths;
  - the frontmatter form (the `argument-hint` shape, the description length);
  - an identical naming-rule line in plan and implement.

### Changed

- Every skill core is compaction-safe: each `SKILL.md` body stays under
  Claude Code's 5,000-token re-attach cap.
  - Detail that only subagents or only some runs need moves into the skill's
    own `references/`:
    - implement: the issue contract, the cleanup sweep, the `track:adhoc`
      fast-lane;
    - plan: the acceptance mechanics, the living-spec track, multi-phase runs;
    - inception: the design and release contracts, the readiness checklist,
      the permission facts.
  - Shared method moves into `skills/shared/` (`preflight.md`,
    `trust-boundary.md`).
  - If a skill's end line is missing after a compaction, the truncation guard
    tells the model to re-Read the full skill.
- Plugin files resolve in a target project. `SKILL.md` bodies use
  `${CLAUDE_SKILL_DIR}` / `${CLAUDE_PLUGIN_ROOT}`, and referenced files use
  paths relative to themselves.
- `/loopkit:inception` records per-role effort and the Precedence section, and
  the Compact Instructions it writes keep the human's in-session instruction
  for the run. `--here` flags a contract that lacks either, and a Compact
  Instructions section that lacks that clause.
- `/loopkit:plan`'s description is trigger text, not a restatement of its body.
- loopkit's own foundation docs are current for Claude 5. Target projects are
  unaffected.
  - "Scheduler" is defined: anything that starts a run without the human. The
    human's own `/loop` is not one.
  - The native-primitive claims are honest. loopkit reuses subagents and
    `/loop`, and hand-rolls worktrees because resume needs a deterministic
    branch. It uses neither `/batch` nor plan mode.
  - Agent teams and the history narrative are removed.
  - The always-loaded text shrinks from 19,062 to 17,892 bytes.

### Fixed

- `/loopkit:plan` and `/loopkit:roadmap` pass PR bodies by file, and they
  create the title and body files with `mktemp`, outside the worktree. Both
  read the trust-boundary reference before their first `gh` call.
- The `gh` list calls that defaulted to a silent truncation now pass an explicit
  `--limit`: ship's merged-PR list, inception's repo list and the board
  field-ID recipe.
- `/loopkit:inception`'s permission-mode facts are restored after Step 8 moved
  into a reference.
- Verify's frontmatter check for `${CLAUDE_` now covers only `description` and
  `argument-hint`.

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

[Unreleased]: https://github.com/skrischer/loopkit/compare/v2.3.0...HEAD
[2.3.0]: https://github.com/skrischer/loopkit/compare/v2.2.1...v2.3.0
[2.2.1]: https://github.com/skrischer/loopkit/compare/v2.2.0...v2.2.1
[2.2.0]: https://github.com/skrischer/loopkit/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/skrischer/loopkit/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/skrischer/loopkit/releases/tag/v2.0.0
