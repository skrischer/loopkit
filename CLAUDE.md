# loopkit

Spec-driven loop engineering for Claude Code — developed via its own loops (dogfood).

## Always in context

- @docs/vision.md — what loopkit is and why (normative).
- @docs/constitution.md — binding, verifiable rules (tech stack, principles,
  don'ts).

## On demand (NOT auto-loaded — read when relevant)

- `docs/prior-art.md` — the challenge + tool/loop-engineering landscape, indexed
  by concern.
- `docs/architecture.md` — components, boundaries, flows, where new code goes.
- `docs/roadmap.md` — the phase catalogue (P1–P6); the human points `/plan` at a
  phase.
- `docs/workflow.md` — the operational contract the skills read (repo, board,
  commands, gates, loops).
- `docs/release.md` — the release contract `/loopkit:ship` reads (versioning,
  changelog, tag, publish targets).

## Autonomy (scoped override)

Within the loopkit skills (`/loopkit:plan`, `/loopkit:implement`,
`/loopkit:inception`, `/loopkit:ship`), autonomous commits, pushes, PR creation
and merges, tag and release creation, dependency installs, and `.env` edits are
explicitly granted — this overrides the stricter global user rules for these
skills only. Outside the loopkit skills,
the global rules still apply. Hard limits (no `rm -rf`, force-push, hard reset,
`git clean -f`, `git branch -D`, etc.) live in `.claude/settings.json` and always
win.

# Compact Instructions

Read only at compaction (manual `/compact` and auto-compaction) — zero permanent
per-turn cost. When compacting mid-`/loopkit:implement`, preserve the active
milestone target and its unblocked frontier (both re-derivable from GitHub —
milestone number, open issues, `Depends on:` edges, board status); drop
resolved subagent chatter. State lives on GitHub, never in this summary.
