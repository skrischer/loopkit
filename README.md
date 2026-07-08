# loopkit

Spec-driven loop engineering for Claude Code. Five skills take a project from
zero to two parallel, attended development loops — tech-stack-agnostic, with
GitHub issues, milestones, and a project board as the mandatory state machine.

- `/loopkit:inception` — Phase-0 dialog: vision, constitution, prior-art,
  architecture, roadmap, workflow contract, project board, permission
  settings, CLAUDE.md wiring. On existing projects (`--here`) it runs as a
  loop-readiness check and closes only the gaps. Idempotent.
- `/loopkit:plan` — one planning cycle: readiness -> spec (incl. human
  prerequisites) -> milestone + issues with `Depends on:` edges + board
  entries -> roadmap update. One human stop: the spec-acceptance gate (the
  merge is the acceptance — specs carry no lifecycle marker).
- `/loopkit:implement` — orchestrate one milestone: build the issue DAG from
  the `Depends on:` edges and fan out in-session subagents along the unblocked
  frontier -> bootstrapped worktree -> implement -> verify -> PR -> in-session
  agent review -> autonomous merge. Ownership, not claiming — the orchestrator
  is the sole dispatcher. One human stop: the milestone QA gate. Also drives a
  single issue or a `track:adhoc` fast-lane issue solo.
- `/loopkit:design` — optional planning-time design step: reads `docs/design.md`,
  accepts or produces a design, hands off one committed file referenced by the
  spec and reviewed at the spec-acceptance gate. Skipped for non-UI work.
- `/loopkit:roadmap` — prior-art-driven idea-sparring loop on an already-loop-ready
  project: per idea offers a research mode, spars the idea against prior art, then
  seeds one or more roadmap phases with backing prior-art. Records any
  foundation-doc impact onto the seeded phase; runs no readiness sweep.

## The loop model

Two attended interactive Claude Code sessions (subscription auth — no headless
mode, no API keys, no detached schedulers), synchronized only through GitHub:

```
/loop /loopkit:plan ...        # producer: roadmap -> merged specs -> issues
/loop /loopkit:implement ...   # consumer: unblocked Todo issues -> merged PRs
```

The exact loop prompts live in each project's `docs/workflow.md` (Loops
section). Machine gates run per PR (single Verify command + agent review);
human gates run per milestone (spec acceptance with prerequisites handover,
milestone QA from the spec's Verification section). Blockers only a human can
clear are parked (`blocked:human` label + comment), never fatal:
`gh issue list --label blocked:human` is the delivery queue.

## Requirements

- `gh` CLI authenticated with `repo` and `project` scopes.
- A GitHub repository per project; issues, milestones, and a Project board are
  mandatory — they are the loops' durable state machine.
- Project permissions are written per project by inception into
  `.claude/settings.json` (plugins cannot ship permission rules). Deny rules
  cover `rm -rf`, force-push, hard reset, and stack-specific destructive
  database commands.

## Install

```
/plugin marketplace add /path/to/loopkit
/plugin install loopkit@loopkit
```

Enable at user scope to make the skills available in every project; then run
`/loopkit:inception` (greenfield) or `/loopkit:inception --here` (existing
project) per project.
