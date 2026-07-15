---
name: roadmap
description: "Prior-art-driven idea-sparring loop that turns raw ideas into seeded roadmap phases — the lighter iteration entry point on an already-loop-ready project. Per idea it offers a research mode (asked, never assumed), spars the idea against the findings, then seeds 1..n roadmap rows plus backing prior-art entries. Runs NO loop-readiness sweep (/loopkit:inception --here's job) and never edits a foundation doc — a foundation-doc impact is recorded ONTO the seeded phase for its later /loopkit:plan cycle. Reads skills/shared/iteration-steps.md and docs/workflow.md for project specifics. Only run when the user explicitly invokes it. Arguments: one or more raw ideas (or empty — then ask)."
---

# /loopkit:roadmap — spar a raw idea into seeded roadmap phases

The iteration entry point that runs AFTER a project is loop-ready: from a raw
idea it spars against prior art and seeds one or many roadmap phases (each with
its backing prior art) — the content hand-off `/loopkit:plan` picks the next
phase from. It is the lighter sibling of `/loopkit:inception`: no foundation
bootstrap, no readiness sweep, just prior-art-driven idea sparring that grows the
roadmap.

It shares three steps with inception — the prior-art challenge, the architecture
seed, and roadmap seeding — which both skills read from
**`skills/shared/iteration-steps.md`**; this skill supplies only its own framing,
gates, and ordering and never reaches into inception's internals. Iteration
framing: unlike inception's bootstrap, roadmap applies the architecture-seed
method only to detect a phase's foundation impact (Step 3) — it never writes
`docs/architecture.md`.

**Complementary to `/loopkit:inception --here`, not overlapping:** inception
audits an existing project against the contract and repairs gaps (a readiness
sweep); roadmap is generative — it seeds NEW phases and runs no readiness sweep.
Use inception to make a project loop-ready; use roadmap to grow its backlog.

**Interaction model:** guided dialog, never one-shot. The sparring and the
per-idea research-mode choice are conversation, **not a new human gate** — the
project's two gates (spec-acceptance, milestone-QA) stay untouched; the real gate
for anything an idea decides lands later, at that phase's `/loopkit:plan`
spec-acceptance. Converse in the user's language; all artifacts are written in
English.

## Preconditions

- `gh` authenticated with the `repo` scope — checked once at the start (same
  `gh auth status` probe as `/loopkit:plan`'s preconditions). No `project` scope
  is needed: roadmap creates no milestones, issues, or board entries. Not
  authenticated -> STOP and instruct `gh auth login` (never auto-run).
- A GitHub repo and `docs/workflow.md` are required — roadmap reads the contract
  for the repo, base branch, and worktree convention, and opens a docs PR to
  commit its seed. If `docs/workflow.md` is missing, stop and tell the user to
  run `/loopkit:inception` first.
- Run from the main checkout on a clean base branch (`git rev-parse
  --abbrev-ref HEAD`, `git status -sb`); the seed is committed via a worktree, so
  the main checkout is never modified.

## Step 0 — Orient (no gate)

- Read `docs/workflow.md` (repo, base branch, worktree paths), then
  `docs/roadmap.md` (existing phases / features) and `docs/prior-art.md`
  (existing concerns) so the seed **appends** and matches each file's established
  shape — never overwrite, never re-seed a phase already present.
- Collect the raw idea(s) from the argument. Empty -> ask the user for at least
  one idea before continuing. Multiple ideas run through Steps 1–3 each, in turn.

## Step 1 — Spar each idea: the prior-art challenge (per idea, no gate)

For EACH idea, run the prior-art challenge per
`skills/shared/iteration-steps.md` — the challenge lens (existence, USP,
differentiation, idea harvest), the ASK-first research-mode choice
(websearch / deep / none), and filling `docs/prior-art.md`. Roadmap framing:

- **This is the sparring.** Apply the challenge lens as an interactive dialog:
  challenge the idea and sharpen it *with* the human using the findings — what to
  adopt, what to avoid, the sources behind each. Not a gate, a conversation.
- **A design-shaped idea MAY be sketched.** When the idea turns on a flow, state
  machine, architecture, UI, or concept, the sparring may draw an **exploratory**
  visualisation to sharpen it (per `skills/shared/iteration-steps.md`) — a dialog
  aid, no new gate. The durable, reviewed design artifact is deferred to that
  phase's `/loopkit:plan` cycle (referenced by the spec, reviewed at
  spec-acceptance); the roadmap seed commits no design artifact.
- **Research mode is ASKED per idea** (per the shared reference's ASK-first
  choice) — default to the cheapest mode that settles the idea; the reference
  details when `none` applies and `deep-research`'s ~100-subagent fan-out cost,
  so reserve the heavy mode.
- The **existence** check may honestly conclude "reuse X, don't build" — record
  that verdict in `docs/prior-art.md` and drop the idea from seeding. Every idea
  that survives seeds at least one phase in Step 2.

## Step 2 — Seed the roadmap + its backing prior art (per surviving idea, no gate)

Seed the roadmap per `skills/shared/iteration-steps.md`, appending to the
existing `docs/roadmap.md` in its established shape (do not fill a
current-focus / status marker, do not invent milestone/spec links — both columns
start `—`, `/loopkit:plan` fills them later):

- One idea seeds **1..n** phases — break it into ordered, plannable rows when it
  is more than one phase of work.
- **Uphold the coupling:** run the shared reference's per-concern prior-art pass
  so every seeded phase is backed by ≥1 prior-art concern (or carries the
  reference's explicit `greenfield — no prior art` note). No seeded row without
  backing.
- Multiple ideas in one run append multiple rows; the roadmap keeps its ordering
  and north star intact.

## Step 3 — Sweep every seeded phase for foundation-doc impact (per seeded phase, no gate)

Run this sweep on **every** seeded phase, not just ones that look
foundation-shaped. For each of the three foundation docs — `docs/vision.md`,
`docs/constitution.md`, `docs/architecture.md` (apply the architecture-seed
method per `skills/shared/iteration-steps.md` to work out the architectural
impact) — record an explicit verdict, `none` included; a missing verdict is an
omission, not an absence of impact. Roadmap does **NOT** edit any foundation
doc itself:

- Record the three verdicts as **one inline, semicolon-separated line** on the
  seeded phase — on its roadmap row or its backing prior-art entry, committed as
  part of the seed:

  `Foundation impact: vision — none; constitution — <one line of what must change and why>; architecture — none`

  **Why inline:** `docs/roadmap.md`'s phase table is a pipe-delimited Markdown
  table where each row is one physical line — a multi-line block breaks it. The
  same inline form is used at both locations named above (the roadmap row and
  the backing prior-art entry) so there is one form to write and grep, not two.
- The actual foundation-doc edit is authored inside that phase's
  `/loopkit:plan` spec PR and **ratified at its spec-acceptance gate** — never
  landed on the default branch by roadmap alone, never left as a dangling draft
  in the main checkout, never authored in `/loopkit:implement`. This keeps even a
  large change (e.g. a stack swap) under the one planning gate.
- Forward rule: roadmap never backfills a verdict onto an existing row.

## Step 4 — Commit the seed (worktree + PR, merged autonomously — no gate)

The seed is a docs change (`docs/roadmap.md` + `docs/prior-art.md`); commit it
like `/loopkit:plan`'s roadmap update — via a worktree, never the main checkout,
merged autonomously (the sparring dialog was the human involvement; there is no
acceptance gate for a living-doc seed):

```
base=<base branch from workflow.md>
wt=../<repo>-worktrees/docs-roadmap-<slug>
git worktree add "$wt" -b docs/roadmap-<slug> "$base"
# write the appended docs/roadmap.md + docs/prior-art.md into "$wt"
git -C "$wt" add docs/roadmap.md docs/prior-art.md
git -C "$wt" commit -m "docs(roadmap): seed <phases> from idea sparring"
git -C "$wt" push -u origin docs/roadmap-<slug>
gh pr create --base "$base" --head docs/roadmap-<slug> --title "docs(roadmap): ..." --body "..."
git worktree remove "$wt"   # BEFORE the merge: --delete-branch cannot delete a
                            # branch a worktree still holds — never re-swap these.
                            # On a conflict: re-add $wt, fix, remove again, merge.
gh pr merge <n> --squash --delete-branch
git checkout "$base" && git pull --ff-only
```

Operate **only** via `git -C "$wt"`, never `cd`. A `docs:` seed PR closes no
issue.

## Close out

- Report the seeded phases and their backing concerns in one summary, and point
  at `/loopkit:plan <phase>` as the next step — planning is where each seeded
  phase becomes a spec + milestone + issues, and where any recorded
  foundation-doc impact is authored and ratified.
- Nothing here creates milestones, issues, or board entries, and nothing edits a
  foundation doc — those are `/loopkit:plan`'s job.

## If blocked — park, don't die

Stop and ask; no workarounds, no skipped steps, no guessed decisions. A decision
the sparring cannot settle belongs to the phase's `/loopkit:plan` cycle, not to a
roadmap guess.
