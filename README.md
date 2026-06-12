# loopkit

Spec-driven loop engineering for Claude Code. Three skills take a project from
zero to two parallel, attended development loops — tech-stack-agnostic, with
GitHub issues, milestones, and a project board as the mandatory state machine.

- `/loopkit:inception` — Phase-0 dialog: vision, constitution, prior-art,
  architecture, roadmap, workflow contract, project board, permission
  settings, CLAUDE.md wiring. On existing projects (`--here`) it runs as a
  loop-readiness check and closes only the gaps. Idempotent.
- `/loopkit:plan` — one planning cycle: readiness -> `READY` spec (incl. human
  prerequisites) -> milestone + issues with `Depends on:` edges + board
  entries -> roadmap update. One human stop: the spec-acceptance gate.
- `/loopkit:implement` — one issue: select/claim -> bootstrapped worktree ->
  implement -> verify -> PR -> in-session agent review -> autonomous merge.
  One human stop: the milestone QA gate, when a milestone completes.

## The loop model

Two attended interactive Claude Code sessions (subscription auth — no headless
mode, no API keys, no detached schedulers), synchronized only through GitHub:

```
/loop /loopkit:plan ...        # producer: roadmap -> READY specs -> issues
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
