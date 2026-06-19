---
name: design
description: Optional planning-time design step the planner invokes WITHIN the planning cycle for a UI-surface change — accept a delivered design OR produce one from the spec, iterate to a reviewed result, and hand off a single durable file committed to the repo and referenced by the spec. Reviewed AT the spec-acceptance gate as part of the spec package — never a third human stop. Skip entirely for non-UI work. Reads docs/design.md for every tool specific (medium, where designs live, the reviewer, the handoff form); hardcodes no tool.
---

# /loopkit:design — produce a reviewed design, committed and spec-referenced

A sub-step of the planning cycle, invoked by `/loopkit:plan` when a scope has
**UI surface**. It owns only the design step: deliver-or-produce a design ->
iterate -> hand off a committed file referenced by the spec. It adds **no human
gate** — the design rides in the spec package and is reviewed AT the existing
spec-acceptance gate. `/loopkit:implement` later consumes the committed artifact.

This is the design-side sibling to `/loopkit:plan` and `/loopkit:implement`.
Like them it reads a **contract, never hardcodes specifics** — here
**`docs/design.md`** (the `docs/workflow.md` sibling, produced by
`/loopkit:inception` for UI-surface projects): the medium (tool / MCP), where
designs live, the reviewer, and the handoff form all come from it. If
`docs/design.md` is missing or records `none`, the project did not enable the
design phase: report that and return to `/loopkit:plan` without designing — do
not invent a tool.

**Optional, by UI surface only.** A non-UI change never reaches this skill (no
design artifact — proportional ceremony). The planner decides UI surface and
points here; this skill does not re-litigate scope.

**Autonomy:** run the whole step autonomously — read the contract, produce or
ingest the design, iterate, review, commit, hand off. There is **no gate here**;
the one human review is the spec-acceptance gate `/loopkit:plan` already owns.

## Preconditions

- Invoked from within a planning cycle for a UI-surface scope — `/loopkit:plan`
  is the caller, the spec for the scope is being drafted (or exists in its docs
  worktree).
- `docs/design.md` resolves and names a tool. Missing or `none` -> report and
  return to the planner; never hardcode a medium.

## 1. Read the contract

- Read **`docs/design.md`** for every specific: the design medium (tool / MCP),
  where committed designs live in the repo, the reviewer (the in-session review
  path), and the durable handoff form (tokens file / exported image /
  screenshot). Everything tool-shaped comes from here — this skill stays
  tool-free.

## 2. Deliver or produce — bidirectional

Resolve the design through whichever path applies; both end at step 3's review:

- **Delivered:** the human (or an upstream artifact) already provides a design.
  Ingest it and convert it to the contract's durable form — a file committed to
  the repo. An external-tool share link is the editor's location, **not** the
  durable form: export it down to the committed file.
- **Produced from the spec:** no design exists -> generate one from the spec's
  intent using the contract's medium, in-session (subscription auth — never
  `claude -p`, a headless flag, or an API key). Generation reuses the project's
  design tooling and review primitives named in `docs/design.md`; this skill
  orchestrates the loop, it does not reimplement a generator.

## 3. Iterate to a reviewed design

- Review the design with the **reviewer named in `docs/design.md`**, run
  **in-session** (the Agent tool / the project's design review path) against the
  spec's intent and the project's design rules. Reuse the in-session review
  primitives — do not shell out to a billed CLI.
- Iterate produce -> review until the reviewer is satisfied. **Bounded retry:**
  the identical review finding twice in a row stops the step with a resumable
  report handed back to the planner — never grind.

## 4. Hand off — a committed file referenced by the spec

- The durable design form is **a file committed to the repo** in the location
  `docs/design.md` specifies — a tokens file, an exported image, or a
  screenshot. Commit it on the planning cycle's docs branch (the spec's
  worktree); `/loopkit:plan` operates the worktree via `git -C`.
- **Reference it from the spec** (a path, not an external URL) so it travels in
  the spec package. An external-tool URL is never the handoff — the tool is the
  editor, the committed file is the source of truth.
- Return control to `/loopkit:plan`: the design is now part of the spec package
  and is reviewed **at the spec-acceptance gate** with the rest of the spec.
  `/loopkit:implement` consumes the committed artifact for the UI-surface issues.

## If blocked — report, don't die

- A blocker only a human can clear (the tool needs auth, the contract is
  incomplete, the delivered design cannot be exported to a committed file):
  stop, hand a one-line resumable report back to `/loopkit:plan`, and let the
  planner park it. Never guess a medium, never work around the contract, never
  fabricate a durable form from a URL.
