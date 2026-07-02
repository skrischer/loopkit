# Vision

> Normative. What and why only — no implementation detail. Keep to ~1 page;
> this file is permanently loaded via CLAUDE.md. No status marker — foundation
> docs carry none.

## Problem

Working with AI coding agents (Claude Code) today forces a bad choice: steer
manually prompt-by-prompt (you are the bottleneck in the loop), or run fully
autonomous "while you sleep" loops that make mistakes unattended (comprehension
debt, no guardrails). The spec-driven tools that add rigor (Kiro, Spec-Kit) are
"a sledgehammer to crack a nut" for small changes and have no model for ad-hoc
work. No tool scales the ceremony to the size of the change while keeping the
human the engineer.

## Why now

"Loop engineering" crystallized as a named practice in mid-2026 (Cherny,
Osmani, Steinberger — going viral). Claude Code ships the primitives natively
(`/plan`, `/loop`, `/batch`, skills, worktrees, sub-agents). The building blocks
exist; what is missing is an opinionated, attended methodology that binds them
to durable GitHub state and matches process weight to change size.

## Target users

Primary: a solo developer or small team using Claude Code as a daily driver who
wants loop-engineering leverage without surrendering judgment or drowning in
ceremony. Secondary: teams that want auditable, GitHub-native AI development
state.

## Goal

loopkit is the proportional loop: an attended, spec-anchored implementation of
loop engineering where planning weight scales with the size of the change — a
full spec -> milestone -> dependency-ordered issues for real features, a
lightweight fast-lane for bugs and QoL, a living-spec track for ongoing themes —
all synchronized through GitHub issues, milestones, and a Project board as the
single durable state machine, under subscription auth, with no headless mode and
no schedulers. You stay the engineer; the loop does the typing.

## Success criteria

- A one-line bug fix reaches a merged PR with zero spec/milestone artifacts (the
  fast-lane works).
- A multi-step feature runs roadmap -> spec -> milestone -> dependency-ordered
  issues -> merged PRs with exactly one human planning gate and one human QA
  gate.
- All work state (planned, in progress, blocked, done, ad-hoc) is reconstructable
  from GitHub alone — no local database, no JSON state file.
- A milestone orchestrator runs a full milestone between gates without human
  intervention, fanning out its issues to in-session subagents.
- Two independent milestones run as two orchestrators with no claim or
  coordination layer.
- Ceremony is proportional: the artifact count for a change correlates with its
  size (no spec for a one-liner).
- loopkit runs entirely on subscription auth — no API key, no headless flag, no
  scheduler (verifiable by grep over the skills).

## Scope

### In

- The five loop skills (inception, plan, implement, design, roadmap) plus the
  proportional dial (full-spec / living-spec / fast-lane).
- An optional, tool-agnostic design phase inside the planning cycle: for a
  UI-surface change a design is delivered or produced, becomes part of the spec
  package, and is reviewed at the spec-acceptance gate — non-UI work skips it.
- GitHub issues, milestones, and the Project board as the sole durable state.
- The attended producer/orchestrator model: producer `/plan` + per-milestone
  orchestrator `/implement` that fans out in-session subagents/agent-teams along
  the issue frontier; independent milestones run as independent orchestrators.
- Guardrails: the Verify gate, in-session agent review, bounded retry, and human
  gates at spec-acceptance and milestone-QA.
- Dependency representation at milestone and issue level — the unblocked
  frontier the orchestrator parallelizes along.

### Out

- Headless / unattended / scheduled execution; API-key auth.
- Local databases, JSON state files, daemons — GitHub is the only state.
- Spec-as-source / bidirectional code<->spec generation (Tessl's territory)
  beyond a living-spec track.
- Reimplementing native primitives loopkit can reuse (`/batch` fan-out, plan
  mode).
- Claim arbitration of any kind (peer loops competing for issues, atomic locks,
  local coordinators) — parallelism comes from orchestrator ownership, not
  claiming.

## Non-goals

- "Ship while you sleep" autonomy — deliberately rejected: a loop running
  unattended is also a loop making mistakes unattended (Osmani). The human stays
  the engineer.
- Zero-ceremony "just talk to it" (Steinberger) — loopkit keeps structure where
  it earns its place, and answers the ceremony critique with proportionality,
  not abolition.
- Heavyweight spec ceremony for every change — the fast-lane exists precisely so
  small work skips it.
- A general project-management tool — loopkit orchestrates AI dev loops; it is
  not Linear or Jira.
