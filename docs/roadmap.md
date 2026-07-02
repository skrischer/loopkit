# Roadmap

> Living document: the catalogue of phases. The hand-off to `/plan`, which the
> human points at a phase; `/plan` then drafts its spec + issues and links them
> back here. No status markers and no current-focus pointer — the human chooses
> what to plan next; progress lives in the GitHub milestone each phase links to.

## Phase overview

| Phase | Name | Spec | Milestone |
|---|---|---|---|
| P1 | Drop spec lifecycle state (DRAFT/READY) | [spec-P1](specs/archive/spec-P1.md) | [#1](https://github.com/skrischer/loopkit/milestone/1) |
| P2 | Drop roadmap current-focus + status; manual targeting | [spec-P2](specs/archive/spec-P2.md) | [#2](https://github.com/skrischer/loopkit/milestone/2) |
| P3 | Proportional ceremony: living-spec milestone + `track:adhoc` fast-lane | [spec-P3](specs/archive/spec-P3.md) | [#3](https://github.com/skrischer/loopkit/milestone/3) |
| P4 | Prior-art elevation: mandatory consult + linking; template challenge fields | [spec-P4](specs/archive/spec-P4.md) | [#4](https://github.com/skrischer/loopkit/milestone/4) |
| P5 | `/implement` as milestone orchestrator; `/plan` emits milestone-level depends-on | [spec-P5](specs/archive/spec-P5.md) | [#5](https://github.com/skrischer/loopkit/milestone/5) |
| P6 | Clarification belongs to planning: planner anticipates implementer questions; implementer escalates forks back | [spec-P6](specs/archive/spec-P6.md) | [#6](https://github.com/skrischer/loopkit/milestone/6) |

The milestone (open/closed + issue progress) is where status lives.

## Dependencies & parallelization

Applying the milestone-level `depends-on` principle to loopkit itself — with an
honest correction surfaced during planning: loopkit's phases are **not**
independent. P2–P6 all edit `skills/plan/SKILL.md`, and P1/P3/P5/P6 also edit
`skills/implement/SKILL.md`. Because they share these core files, the phases run
as a **sequential** chain, not parallel orchestrators:

- Run order: **P1 → P2 → P3 → P4 → P5 → P6**. Each milestone carries a
  `Depends on milestone: #<n>` line to its predecessor.
- The earlier "P1/P2/P4 are parallelizable" assumption was optimistic; the
  file-level reality serializes them. That is itself a dogfood finding: on a
  small, shared-file codebase the parallelizable frontier is narrow — the
  orchestrator's parallelism pays off later, on feature work that touches
  disjoint files.
- Within a milestone, issues touching different files run in parallel; issues
  touching the same file are serialized by their `Depends on:` lines.
- The inception challenge lens (part of P4) is already bootstrapped in
  `skills/inception/SKILL.md`.

## Features (post-redesign)

The P1–P6 redesign is complete; new work is planned directly via
`/loopkit:plan <scope>` and lands here as a catalogue row.

| Feature | Spec | Milestone |
|---|---|---|
| tooling-preflight — fail fast when git/gh are missing or unauthorized | [spec](specs/archive/spec-tooling-preflight.md) | [#7](https://github.com/skrischer/loopkit/milestone/7) |
| inception-prior-art-coupling — bidirectional prior-art↔roadmap coupling: every plannable phase backed by prior art (Step 2 ↔ Step 6) | [spec](specs/archive/spec-inception-prior-art-coupling.md) | [#8](https://github.com/skrischer/loopkit/milestone/8) |
| design-phase — optional, tool-agnostic design step anchored to the spec (project docs/design.md contract); reviewed at the spec-acceptance gate | [spec](specs/archive/spec-design-phase.md) | [#9](https://github.com/skrischer/loopkit/milestone/9) |
| roadmap-iteration — extract ongoing feature/phase planning into `/loopkit:roadmap`: prior-art-driven idea sparring that seeds one or many phases per loop, may revise foundation docs (vision/constitution/architecture — ratified at spec-acceptance, never in implement), no readiness sweep, delegates to inception (DRY); `/loopkit:plan` gains the matching multi-milestone loop | [spec](specs/archive/spec-roadmap-iteration.md) | [#10](https://github.com/skrischer/loopkit/milestone/10) |
| prior-art-elevation — raise prior-art research to loopkit's core substrate (more weight in vision/constitution) + carry `/plan`'s OSS source-checkout into the implement loop as a template | [spec](specs/archive/spec-prior-art-elevation.md) | [#11](https://github.com/skrischer/loopkit/milestone/11) |
| design-in-the-loop — broaden design from UI-only to "a visualisation clarifies the decision" (UI + concept/flow/architecture), woven into the roadmap+plan sparring; durable medium = committed SVG (renders in GitHub's file/rich view, not the raw PR diff), Mermaid the GitHub-native alternative; extends inception Step 7b + the constitution design principle. Constitution stays medium-agnostic; loopkit's own docs/design.md picks committed SVG | [spec](specs/archive/spec-design-in-the-loop.md) | [#12](https://github.com/skrischer/loopkit/milestone/12) |
| structural-verify — set loopkit's `Verify` (currently `none`) to the native `claude plugin validate` (JSON validity + skill/agent/command frontmatter + duplicate names + path traversal — no new deps); wire it into the per-PR + milestone-QA gates; add a thin shell/git check only for loopkit invariants the native validator misses | [spec](specs/archive/spec-structural-verify.md) | [#13](https://github.com/skrischer/loopkit/milestone/13) |
| implement-frontier-exits — close the orchestrator wave loop's undefined exit states: an issue left open without a label by a subagent that reports none of merged/escalated/parked re-enters the frontier and re-dispatches forever — treat it as a failed dispatch (one retry, then auto-park `blocked:human`); report cross-milestone blocks alongside escalated/parked; wire the workflow contract's bounded-retry rule (same failure twice -> stop) into implement's review loop and plan's step-6 review by reference, never by copy | — | — |
| implement-resume-safety — resume idempotency (check for an existing branch/open PR via `gh pr list --head` before `git worktree add -b`; re-attach instead of colliding) + a defined merge-conflict path (rebase onto the updated base, re-run Verify, re-merge once; a second conflict routes to `needs:planning` — a missed serialization edge is a planning defect) + a soft file-overlap pass in plan (predict touched files per issue, add `Depends on:` edges or overlap notes) replacing implement's unestablished same-file guarantee + `--limit` on every gh list call and an inception-recorded ProjectV2 field-ID recipe | — | — |
| ceremony-overhead — cut the full-spec track's fixed process-PR overhead (~3 per milestone -> 1: fold the roadmap-link commit onto the accepted spec branch, keep the QA archive PR as the single close-out) and fix the unexecutable post-merge Decision-log instruction (write decisions pre-merge on the issue branch; QA close-out as catch-all). Own telemetry as of 2026-07-02: 44 of 86 merged PRs carried no behavior change. Foundation impact: constitution — one-line adjustment to the "accepted = merged with a milestone and issues" wording (milestone creation briefly precedes the spec merge) | — | — |
| gate-evidence — make milestone-QA evidence durable on GitHub: post the derived QA scenarios + the human verdict as a milestone comment before closing (the living-spec batch summary gets the same durable home) + a QA handover mapping each spec Verification item to the PRs/commits implementing it, so a gate stop costs minutes, not archaeology | — | — |
| design-coverage — commit and act on the Flowmate feedback (docs/feedback/2026-06-19-design-skill-retrofit.md): /design derives the spec's user-facing capabilities and asserts each maps to a surface or state, writes back a complete `Design:` line per spec, splits its review into craft + coverage passes (both under bounded retry); a missing docs/design.md routes to inception --here instead of growing a second bootstrap; /roadmap recognizes docs/feedback/ files as first-class raw-idea inputs and surfaces unseeded ones | — | — |
| permission-template-hardening — replace the hardcoded Supabase deny rules in the inception settings template with the placeholder convention (verify.sh asserts the placeholder is intact or replaced, never the shipped example); close cheap deny-list gaps (`rm -r`/`-fr` spellings, `+refspec` force-push, `git -C` variants of guarded commands); document why bypassPermissions is the attended-loop default and offer an acceptEdits variant as an explicit inception choice | — | — |
| repositioning — rewrite README.md + plugin.json around the proportional dial and the winning vocabulary (attended, spec-anchored loop engineering under the agentic-engineering umbrella): three-track table, one walkthrough per lane backed by dogfood data, orchestrator fan-out GIF, remote install, uninstall/footprint section, Codex/multi-harness FAQ as a documented stance; gates justified via review bottleneck/comprehension debt/security, never model unreliability; extend scripts/verify.sh with a README-only drift assertion (fail on "READY spec"/"select/claim"). Foundation impact: vision — add the positive "attended orchestration between exactly two human gates" claim; the constitution's grep-verifiable no-scheduler rule stays untouched | — | — |
| prior-art-backfill — backfill the competitive landscape (GitHub Copilot coding agent + Agent HQ into the single-entry USP section; OpenAI Codex/AGENTS.md, BMAD, OpenSpec, GSD, one parallel-orchestration UI) with per-concern adopt/avoid verdicts + a lightweight freshness contract: `Verified: <date>` distinct from creation date, a volatility flag on product-feature claims, a staleness check in inception --here's readiness sweep + index repair (tag the untagged legacy sections, fix stale "Point 3" references, update the passes header) | — | — |
| dogfood-untested-claims — exercise the two untested headline claims: open a human-initiated living-spec milestone for the ongoing correction/feedback-intake stream (exercises the never-used QA batch-summary path) and, when two spec-worthy phases with verified-disjoint file sets exist, run two /loopkit:implement orchestrators concurrently; record both outcomes here like the P1–P6 serialization finding; never inflate a trivial change into a spec to force the test | — | — |
| launch-playbook — run the proven methodology-plugin launch sequence while "loop engineering" is hot: first-person dogfood narrative with GitHub state as proof (all cited figures re-verified pre-publication), HN + Simon Willison pitch, submission to the official Anthropic directory and awesome-claude-code, visible release cadence. Human prerequisites: LICENSE + repo metadata (fast-lane) landed; depends on repositioning (the README must match the constitution before strangers read both) | — | — |
| foundation-dedup — dedup the permanently-loaded flagship docs (vision Scope bullets become one-line pointers to constitution principles; the constitution's design principle shrinks to its binding core with mechanism detail moving to docs/design.md), single-source the drifting hard-limit enumerations to .claude/settings.json, ratify or remove docs/design.md's German-diagram exception. Foundation impact: vision + constitution — the dedup is the change itself, authored in the plan cycle and ratified at spec-acceptance | — | — |

Unlike the P1–P6 chain, some of these features touch **disjoint files** — the
first real parallel frontier, the orchestrator payoff the chain's own narrative
anticipated. But not all: the foundation docs are a shared spine several features
touch, which serialised the early ones — `prior-art-elevation` edited
`docs/vision.md` + `docs/constitution.md` behind `roadmap-iteration` (#10), and
`design-in-the-loop` was seeded depending on `roadmap-iteration` for the same
reason. In practice that spine discharged itself in order: #10 then #11 both
closed before `design-in-the-loop` (#12) was planned, so #12's foundation edits
(the broadened design principle) landed on a clean base and its milestone runs
**independently** (`Depends on milestone: none`). The lesson held — a
shared-spine dependency is real, but on an attended cadence it often resolves by
sequencing rather than blocking.

The 2026-07-02 seed batch (rows `implement-frontier-exits` through
`foundation-dedup`) came out of one `/loopkit:roadmap` pass over a verified
market + codebase analysis; each row's backing prior-art concern is tagged
`(feature: <slug>)` and dated 2026-07-02. Plan-time sequencing note — the batch
has its own shared spines: `skills/implement/SKILL.md` is touched by
`implement-frontier-exits`, `implement-resume-safety`, `ceremony-overhead`, and
`gate-evidence` (serialize in that order); `skills/plan/SKILL.md` by the first
three of those; `README.md` by `repositioning` -> `launch-playbook` (ordered);
the vision/constitution spine by `ceremony-overhead`, `repositioning`, and
`foundation-dedup`. LICENSE/repo-metadata fixes are deliberately NOT seeded —
they are `track:adhoc` fast-lane material, no phase needed.

## North star

loopkit becomes the proportional loop — its own development driven by its own
loops, so every change to the tool flows through the same producer/orchestrator
cycle it ships.
