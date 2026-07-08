# Spec: implement-resume-safety

> Created: 2026-07-08

Make the orchestrator resume-safe and compaction-safe with **no local state** —
re-derive dispatch state from GitHub as a per-dispatch invariant, name the wave
boundary as the only safe `/compact` point, bound every `gh` list with `--limit`,
and have inception record the board field-ID recipe + a Compact-Instructions
block. Reuse native mechanisms; reimplement nothing.

## Outcome

- [ ] `skills/implement/SKILL.md` §3 branch+worktree is **idempotent as a
      per-dispatch invariant**: before `git worktree add -b <branch>` it checks for
      an existing branch / open PR for the issue (`gh pr list --head <branch>` +
      existing local/remote branch) and **re-attaches instead of colliding**,
      resuming at the stage that matches the branch's **work state** (derived from
      GitHub + the branch, never a local file): an existing **open PR** -> continue
      from the review/merge stage; a branch **with commits/diff** but no PR ->
      continue from Verify -> push -> PR; a branch **with no commits** (a crash
      before the first commit, or mid-Implement) -> resume from **Implement**; an
      **ambiguous or unrelated** collision -> **park `blocked:human`** rather than
      guess. Applied per dispatch, it catches both a prior run's leftover and a
      **post-compaction re-dispatch** mid-milestone. No local resume file — state
      is re-derived from GitHub.
- [ ] `skills/implement/SKILL.md` §2 names the **wave boundary** (step-3 "await
      the whole batch" completed, before step-5 recompute — a hard barrier with no
      live subagents, all state re-derivable from GitHub after step-4) as the
      **only safe native `/compact` point** (never mid-wave); it MAY `/compact`
      there when context runs high, relying on the CLAUDE.md **Compact-Instructions
      section** (below) to preserve the milestone target + frontier. Reuses the
      native compactor — reimplements nothing.
- [ ] Every `gh` list call in `skills/implement/SKILL.md` and
      `skills/plan/SKILL.md` carries an explicit **`--limit`** — no silent default
      truncation of the frontier/board/issue queries the loop depends on.
- [ ] `skills/inception/SKILL.md` records into the workflow contract the
      **ProjectV2 board field-ID recipe** (the Status field ID + Todo / In
      Progress / Done option IDs) so `plan`/`implement` set board status without
      re-discovering them — consumed via the skills' existing deference to
      `docs/workflow.md` for board specifics (no skill-prose change needed to read
      it) — and writes a **`# Compact Instructions` section** into the target
      project's `CLAUDE.md`: the native Claude Code mechanism, **read only at
      compaction time (manual and auto), zero permanent per-turn token cost**
      (unlike ordinary always-loaded CLAUDE.md text), directing the compactor to
      **preserve the active milestone target + the unblocked frontier** (both
      re-derivable from GitHub). loopkit's own `docs/workflow.md` (concrete field
      IDs) + `CLAUDE.md` (the section) get the same (dogfood). Kept terse — it is a
      directive, not a state dump.
- [ ] Verify passes; no local state, headless flag, scheduler, or API key —
      GitHub stays the only durable state.

## Scope

### In scope

- `skills/implement/SKILL.md`: §3 branch+worktree idempotency (per-dispatch
  invariant); §2 wave-boundary `/compact` naming; `--limit` on its `gh` list
  calls (§1, §2, §4).
- `skills/inception/SKILL.md` + `skills/inception/templates/workflow.md`: the
  board field-ID recipe recorded into the contract; the Compact-Instructions
  block written into the target `CLAUDE.md`.
- `skills/plan/SKILL.md`: `--limit` on its `gh` list calls (readiness survey).
- loopkit's own `docs/workflow.md` (field-ID recipe) + `CLAUDE.md`
  (Compact-Instructions block) — dogfood the same guidance.

### Out of scope

- **Merge-conflict recovery** (rebase onto updated base -> re-run Verify ->
  re-merge once; second conflict -> `needs:planning`) **and the soft file-overlap
  pass in `/plan`** -> `implement-conflict-recovery` (deferred; split out of this
  row on 2026-07-08). This package adds **no** conflict handling and does not
  touch the merge step's conflict behaviour.
- Rolling dispatch (re-dispatch as each subagent returns) — the skill already
  names it a future optimization; not introduced here.
- No change to the happy path, the wave model, or the two human gates.

## Constraints

- **GitHub-only durable state** (constitution): resume/re-dispatch state is
  re-derived from GitHub, never a local resume/JSON/marker file. The one-retry
  and wave bookkeeping stay in-session/ephemeral.
- Reuse the **native `/compact`** and the native ProjectV2 API — reimplement no
  compactor, no state store (constitution: reuse native primitives).
- Per-project data (field IDs, Verify command, Compact-Instructions) lives in the
  **contract / `CLAUDE.md`**, never in tool-agnostic skill prose.
- Proportional ceremony: only the named loci; terse/imperative prose; no
  cross-skill duplication.

## Prior art

- [Worktree resume & merge-conflict recovery](../prior-art.md#worktree-resume--merge-conflict-recovery-feature-implement-resume-safety)
  — the **"Claude Code background agents — resume is re-derived, not restored"**
  sub-entry is the one this package adopts: ADOPT re-derive resume state from
  GitHub (existing branch? open PR for the issue? -> re-attach and continue from
  Verify), AVOID any local resume file. The **CoAgent** and **CCPM
  `conflicts_with`** sub-entries back the *deferred* `implement-conflict-recovery`
  half (rebase-on-conflict, soft file-overlap pass) — explicitly **out of scope**
  here.

## Human prerequisites

- none — skill, template, and doc changes only.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Resume/re-dispatch state is **re-derived from GitHub** (existing branch / open PR), never a local resume file | prior-art: native resume re-derives, not restores; the GitHub-only-state principle applied to recovery | 2026-07-08 |
| Idempotency is a **per-dispatch invariant**, not resume-only | so it also catches a post-compaction re-dispatch mid-milestone, not just a fresh run | 2026-07-08 |
| The re-attach **resumes at the stage matching the branch's work state** — open PR -> review/merge; commits present -> Verify; no commits -> Implement; ambiguous/unrelated collision -> park `blocked:human` | re-attaching everything "from Verify" would run Verify on an empty diff and hit "nothing to commit"; the resume point is a function of observable work state, not a guess | 2026-07-08 |
| "Branch exists with a **merged** PR" is **deliberately unhandled — structurally unreachable**: a merge auto-closes the issue (`Closes #N`), dropping it from the unblocked frontier before it can be re-dispatched | consistent with the `implement-frontier-exits` frontier model; not a silent omission | 2026-07-08 |
| `/compact` **only at the wave boundary** (step-3 await done, before step-5 recompute), never mid-wave | the barrier is the only point with no live subagents and all state on GitHub — the native compactor can safely drop context there | 2026-07-08 |
| The compact guidance uses the native **`# Compact Instructions` CLAUDE.md section**, not `/compact <inline arg>` and not ordinary always-loaded text | the native section is read **only at compaction** (manual + auto), zero permanent per-turn token cost — the token-efficient choice that also steers auto-compaction; verified against Claude Code docs | 2026-07-08 |
| **`--limit` on every `gh` list call** | an explicit bound prevents silent default truncation of the frontier/board queries the loop's correctness depends on | 2026-07-08 |
| Field-ID recipe + Compact-Instructions are **recorded by inception into the contract / `CLAUDE.md`** | reuse native mechanisms; they are per-project data (like the Verify command), not skill prose | 2026-07-08 |
| Merge-conflict + file-overlap handling **excluded** -> `implement-conflict-recovery` | deferred split (2026-07-08); this package is the idempotency/compaction half only | 2026-07-08 |

## Tracking

- Milestone: created from this spec once it is merged
- Issues (two, **parallel** — disjoint files, one wave):
  - **A** — `skills/implement/SKILL.md`: per-dispatch idempotency + wave-boundary
    `/compact` naming + `--limit` on implement's `gh` lists.
  - **B** — `skills/inception/SKILL.md` + `skills/inception/templates/workflow.md`
    + `skills/plan/SKILL.md` + loopkit's `docs/workflow.md` + `CLAUDE.md`: the
    field-ID recipe + Compact-Instructions block + `--limit` on plan's `gh` lists.

## Verification

- [ ] Verify passes (`bash scripts/verify.sh`).
- [ ] `skills/implement/SKILL.md` §3 checks for an existing branch / open PR
      before `git worktree add -b` and re-attaches, resuming at the stage matching
      the branch's work state (open PR / commits / no commits / ambiguous->park),
      stated as a **per-dispatch invariant** (grep-verifiable).
- [ ] `skills/implement/SKILL.md` §2 names the wave boundary as the **only** safe
      `/compact` point (never mid-wave) (grep-verifiable).
- [ ] No `gh issue list` / `gh project item-list` / `gh pr list` in
      `skills/implement/SKILL.md` or `skills/plan/SKILL.md` lacks `--limit`
      (grep-verifiable).
- [ ] `skills/inception/templates/workflow.md` carries a board field-ID recipe
      (placeholder intact), `skills/inception/SKILL.md` records it + writes a
      `# Compact Instructions` section, and loopkit's own `docs/workflow.md`
      carries the concrete field IDs while its `CLAUDE.md` carries a
      `# Compact Instructions` section (grep the heading) preserving the milestone
      target + frontier.
- [ ] No diff introduces local state, an API key, a headless flag, or a scheduler
      (config-surface guard).

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Idempotency check misfires and re-attaches to an unrelated branch | key the check on the issue's own branch name + `--head` PR match; on ambiguity, park `blocked:human` rather than guess |
| A mid-wave `/compact` loses live subagent state | the spec forbids it — `/compact` is named ONLY at the barrier where no subagent is live and all state is on GitHub |
| The field-ID recipe drifts when the board changes | it is per-project data in the contract; inception's `--here` readiness sweep re-checks it (existing inception behavior) |
| Scope bleeds into merge-conflict handling | conflict recovery is explicitly out of scope -> `implement-conflict-recovery`; the merge step is untouched |

## Decision log

- 2026-07-08: Drafted from the `implement-resume-safety` roadmap seed — the
  compaction/idempotency package only (the merge-conflict/file-overlap half was
  split to `implement-conflict-recovery` on 2026-07-08 and is deferred). Design
  settled by the prior-art anchor's re-derive-from-GitHub sub-entry — no
  genuinely-open decision. Two issues, parallel on disjoint files (implement vs
  inception/plan/templates/CLAUDE.md), a genuine one-wave frontier.
- 2026-07-08: Spec-acceptance review closed two forks the first draft left open.
  (1) Re-attach resume point is now a function of the branch's **work state**
  (open PR / commits / no commits / ambiguous->park), not a blanket
  "continue from Verify" that would run Verify on an empty diff. (2) The compact
  mechanism is pinned to Claude Code's native **`# Compact Instructions` CLAUDE.md
  section** — verified (via claude-code-guide against the Claude Code docs) to be
  read **only at compaction time**, honoring both manual `/compact` and
  auto-compaction, at **zero permanent per-turn token cost** — which is why it
  beats an always-loaded block (the Lens-C token-budget concern) and couples the
  two issues (A `/compact`s at the boundary; B writes the section both halves
  rely on). Also confirmed "branch with a merged PR" is structurally unreachable
  (merge auto-closes the issue) and the field-ID recipe is consumed via the
  skills' existing `docs/workflow.md` deference (no skill-prose read-change owed).
