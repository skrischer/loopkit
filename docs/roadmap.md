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
| design-in-the-loop — broaden design from UI-only to "a visualisation clarifies the decision" (UI + concept/flow/architecture), woven into the roadmap+plan sparring; durable medium = committed SVG (renders in GitHub's file/rich view, not the raw PR diff), Mermaid the GitHub-native alternative; extends inception Step 7b + the constitution design principle. Constitution stays medium-agnostic; loopkit's own docs/design.md picks committed SVG | [spec](specs/spec-design-in-the-loop.md) | [#12](https://github.com/skrischer/loopkit/milestone/12) |
| structural-verify — set loopkit's `Verify` (currently `none`) to the native `claude plugin validate` (JSON validity + skill/agent/command frontmatter + duplicate names + path traversal — no new deps); wire it into the per-PR + milestone-QA gates; add a thin shell/git check only for loopkit invariants the native validator misses | — | — |

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

## North star

loopkit becomes the proportional loop — its own development driven by its own
loops, so every change to the tool flows through the same producer/orchestrator
cycle it ships.
