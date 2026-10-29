# loopkit

Spec-driven loop engineering for Claude Code. Six skills take a project from
zero to attended development loops — tech-stack-agnostic, with GitHub issues,
milestones, and a project board as the mandatory state machine.

- `/loopkit:inception` — Phase-0 dialog: vision, constitution, prior-art,
  architecture, roadmap, workflow contract, optional design and release
  contracts (`docs/design.md`, `docs/release.md`), project board, permission
  settings, CLAUDE.md wiring. On existing projects (`--here`) it runs as a
  loop-readiness check and closes only the gaps. Idempotent.
- `/loopkit:plan` — one planning cycle: readiness -> spec (incl. human
  prerequisites) -> one human stop, the spec-acceptance gate -> milestone +
  roadmap link on the spec branch -> one squash-merge (the merge is the
  acceptance — specs carry no lifecycle marker) -> issues with `Depends on:`
  edges + board entries.
- `/loopkit:implement` — orchestrate one milestone: build the issue DAG from
  the `Depends on:` edges and fan out in-session subagents along the unblocked
  frontier -> bootstrapped worktree -> implement -> verify -> PR -> in-session
  agent review -> autonomous merge. Ownership, not claiming — the orchestrator
  is the sole dispatcher. One human stop: the milestone QA gate. Also drives a
  single issue or a `track:adhoc` fast-lane issue solo.
- `/loopkit:design` — optional planning-time design step: reads `docs/design.md`,
  accepts or produces a design, hands off one committed file referenced by the
  spec and reviewed at the spec-acceptance gate. Skipped when a change has no UI
  surface and needs no clarifying visualisation.
- `/loopkit:roadmap` — prior-art-driven idea-sparring loop on an already-loop-ready
  project: per idea offers a research mode, spars the idea against prior art, then
  seeds one or more roadmap phases with backing prior-art. Records any
  foundation-doc impact onto the seeded phase; runs no readiness sweep.
- `/loopkit:ship` — cuts a release: bumps the version, updates the changelog,
  tags, and publishes a GitHub release per the project's `docs/release.md`;
  `--dry-run` previews without publishing.

## The loop model

Attended interactive Claude Code sessions (subscription auth — no headless
mode, no API keys, no detached schedulers), synchronized only through GitHub:

```
/loop /loopkit:plan <phase...>        # producer: roadmap phase -> accepted spec + milestone -> issues
/loop /loopkit:implement <milestone>  # orchestrator: one milestone's issue DAG -> merged PRs -> QA gate
```

Independent milestones run as separate orchestrators, one session each.

The exact loop prompts live in each project's `docs/workflow.md` (Loops
section). Machine gates run per PR (single Verify command + agent review);
human gates run per milestone (spec acceptance with prerequisites handover,
milestone QA from the spec's Verification section). Blockers only a human can
clear are parked (`blocked:human` label + comment), never fatal:
`gh issue list --label blocked:human` is the delivery queue. A request the loop
does not wait for appears as one `Needs you:` line.

## Status pane

In a loopkit project, the plugin ships a read-only status view, a Claude Code
mod, that answers "what needs me?" without looking it up. It opens beside the
chat at session start and shows four sections:

- **Needs you** — what waits for the human: a milestone ready for QA, an open
  spec-acceptance PR, issues labelled `needs:planning` or `blocked:human`, an
  open `AskUserQuestion`, and any `Needs you:` line from the session's last
  answers.
- **Milestones** — each open milestone with a progress bar, closed/total and
  percentage, plus how many issues are in flight and blocked (a living-spec
  milestone shows its closed count).
- **Running** — the session's subagents and background tasks, with their age.
- **Up next** — the unblocked issue frontier, then the roadmap phases not yet
  planned.

The status line carries a one-line summary: `loopkit · <n> need you · #<m>
<closed>/<total> · <n> running`.

`/loopkit-status` opens the pane and refreshes it from GitHub, even mid-turn.
Otherwise it refreshes every two minutes, after a turn (at most once every 15
seconds) and after a `gh pr merge`.

The engine seats the pane that opens unasked only on a terminal of at least 144
columns, and keeps it waiting below that; once you have opened it, it stays from
110 columns.

The pane is read-only: it reads GitHub through `gh` read commands and the
session through its hooks, writes nothing to GitHub or disk, and offers only
open and refresh. It is active only in a loopkit project (a working directory
whose `docs/workflow.md` starts with `# Workflow contract`) and stays silent
elsewhere. Verified on Claude Code 2.1.312; mods are on by default from 2.1.287.

## Requirements

- `gh` CLI authenticated with `repo` and `project` scopes.
- A GitHub repository per project; issues, milestones, and a Project board are
  mandatory — they are the loops' durable state machine.
- Project permissions are written per project by inception into
  `.claude/settings.json` (plugins cannot ship permission rules). Its deny
  rules are the enforced source for the constitution hard limits, plus the
  stack's destructive database commands.

## Install

```
/plugin marketplace add /path/to/loopkit
/plugin install loopkit@loopkit
```

Enable at user scope to make the skills available in every project; then run
`/loopkit:inception` (greenfield) or `/loopkit:inception --here` (existing
project) per project.
