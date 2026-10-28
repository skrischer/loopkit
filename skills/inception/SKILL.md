---
name: inception
description: "Phase-0 inception dialog, run before any spec work: clarify the goal, research prior art, derive vision, constitution, architecture, roadmap, workflow contract (plus optional design and release contracts), project board, permission settings and CLAUDE.md wiring, leaving the project loop-ready for /loopkit:plan and /loopkit:implement. With --here on an existing project it is a loop-readiness check that closes only the gaps. Arguments: a project pitch (greenfield) or --here (brownfield)."
argument-hint: "[pitch | --here]"
disable-model-invocation: true
---

# /loopkit:inception — Phase-0 inception (before specs)

> Truncation guard: if the end-of-skill line is missing from your copy of this skill, it was cut after a compaction — Read ${CLAUDE_SKILL_DIR}/SKILL.md in full before continuing (in a full-file Read, ${CLAUDE_SKILL_DIR} means the directory this SKILL.md sits in).

Codifies the phase before spec-driven development: four foundation artifacts
(table below), `docs/roadmap.md`, the `docs/workflow.md` contract, optional
`docs/design.md` and `docs/release.md`, a GitHub Project board and the project's
`.claude/settings.json` — the hand-off to `/loopkit:plan` and
`/loopkit:implement`. Keep intent (what/why) apart from implementation (how); the tech stack
belongs in the constitution.

**Interaction model:** guided dialog, never one-shot. Human gates: after the
goal draft, before finalizing each artifact (prior-art, vision, constitution,
architecture), before the roadmap, before the workflow contract, before the
design contract (design-surface projects), before the release contract
(releasable projects), and before writing the permission settings. At each
gate, present the draft and confirm via AskUserQuestion before writing the final
file. Converse in the user's language; write all artifacts and the CLAUDE.md wiring
in English.

**Brownfield = readiness check + gap closure:** with `--here` on an existing
project, read the codebase and every existing artifact, then diff them against
the current templates' mandatory fields (the readiness checklist). Present the
gap report as the first gate, then run only the steps that close gaps —
reconcile and extend, never blind-overwrite; surface conflicts at the artifact's gate. Adding or extending a roadmap phase opens a prior-art gap for it — close both. A
fully loop-ready project yields "all green — nothing to do".

## Artifacts and their character (strict separation, no duplication)

| File | Character |
| --- | --- |
| docs/vision.md | normative: what/why, implementation-free |
| docs/constitution.md | normative, binding: every principle verifiable and specific |
| docs/prior-art.md | descriptive, living: indexed by concern, not by project |
| docs/architecture.md | structural, living, most volatile: components, boundaries, flows, where new code goes |

Templates live in `${CLAUDE_SKILL_DIR}/templates/` — fill them, never
duplicate content.

## Step 0 — Determine mode (no gate)

Preflight first, before mode detection and any `gh repo view`: Read
`${CLAUDE_PLUGIN_ROOT}/skills/shared/preflight.md` and run it. Required scopes:
`repo` + `project`. The clean-base check does not apply (greenfield: no base
branch).

- `$ARGUMENTS` is `--here` -> brownfield.
- Otherwise auto-detect: a codebase in the working directory -> brownfield
  (pitch text is extra context); empty -> greenfield with `$ARGUMENTS` as the
  pitch. Empty and no pitch: ask for the pitch first.
- State the detected mode in one line.
- Brownfield only: first read the existing codebase and extract the lived
  conventions, structure and stack; never invent what the code already answers.
  Also read `docs/workflow.md`, `.claude/settings.json` and the GitHub state
  (`gh repo view`, milestones, board). Then Read
  `${CLAUDE_SKILL_DIR}/references/readiness-checklist.md`, present the readiness
  gap report (GATE) from it, and skip every step whose output already meets the
  current template.

## Step 1 — Rough goal (gate 1)

Work out with the user: problem, why now, target users, measurable success
criteria. Short dialog, not a form. GATE: confirm the goal summary before
research.

## Step 2 — Prior-art challenge (gate 2)

Run the prior-art challenge per `${CLAUDE_PLUGIN_ROOT}/skills/shared/iteration-steps.md` (Read it first) — the
challenge lens (existence, USP, differentiation, idea harvest), the ask-first
research-mode choice, and filling `docs/prior-art.md`. Inception framing: the
challenge answers are the direct input to the vision (Step 3: USP, non-goals).

GATE: present the challenge answers and the per-entry verdicts before finalizing.

## Step 3 — Sharpen the vision (gate 3)

Informed by the research: goal + scope (in/out) + explicit non-goals ->
`docs/vision.md`, ~1 page (loaded permanently).
GATE before finalizing.

## Step 4 — Derive the constitution (gate 4)

Tech stack with rationale, architecture principles, conventions, quality
gates, a "don't" list -> `docs/constitution.md`. Every principle verifiable and
specific ("max function length 50 lines", not "clean code"). ~1 page, loaded
permanently. Brownfield: write the target state;
mark known deviations as tech debt instead of normalizing the status quo.
GATE before finalizing.

## Step 5 — Seed the architecture (gate 5)

Read `${CLAUDE_PLUGIN_ROOT}/skills/shared/iteration-steps.md` and seed the
architecture per it -> `docs/architecture.md`. GATE before finalizing.

## Step 6 — Seed the roadmap (gate 6)

Read `${CLAUDE_PLUGIN_ROOT}/skills/shared/iteration-steps.md` and seed the
roadmap per it, filling `${CLAUDE_SKILL_DIR}/templates/roadmap.md` into
`docs/roadmap.md` and deriving the phases from the vision scope and the
architecture seed. GATE before finalizing.

## Step 7 — Establish the workflow contract (gate 7)

The hand-off to `/loopkit:plan` and `/loopkit:implement`: they read
`docs/workflow.md` instead of hardcoding project specifics. First ensure the git
foundation — `/loopkit:plan` requires a GitHub repo:

- `git rev-parse --is-inside-work-tree`: a repo with an `origin` remote is used
  as is.
- Otherwise find the GitHub repo and wire it up:
  - Look for a repo matching the directory name
    (`gh repo list --limit 100 --json name,url,isEmpty`) or ask for the link.
  - For an existing repo, initialize and connect it (state it, no gate): `git init`, `git remote add origin <url>`, `git fetch origin`. If the
    remote has commits, check out its default branch; if empty, create the base
    branch locally.
  - If none exists, create one (`gh repo create`) only on explicit confirmation.

Then fill `${CLAUDE_SKILL_DIR}/templates/workflow.md`, deriving values rather
than asking where you can:

- **Repository** — `gh repo view --json nameWithOwner` (now resolvable).
- **Base branch** — `git symbolic-ref refs/remotes/origin/HEAD` (fallback `main`).
- **GitHub Project board (mandatory).** It is the loops' queue and status
  display (`Todo` / `In Progress` / `Done`). Ask for the existing project
  URL/number; if none exists, create one (`gh project create`) on explicit
  confirmation, never silently. `none` is not a valid value. Then record the
  field-ID recipe: `gh project field-list <number> --owner <owner>
  --format json --jq '.fields[]|select(.name=="Status")'` returns the Status
  field id + the Todo / In Progress / Done option ids; write them into the
  contract's `<status-field-id>` / `<...-option-id>` placeholders so
  `plan`/`implement` skip re-discovery.
- **Brownfield backfill:** put every existing open issue onto the board
  (`Todo`, or its real state) and retrofit the issue conventions on existing
  bodies — above all a parseable `Depends on: #N` line per issue, derived from
  the specs' phase and step order. The unblocked check
  reads exactly that line; prose dependencies let issues get picked too early.
- **Commands** — derived from the stack just fixed in the constitution:
  - **Bootstrap** — makes a fresh clone or worktree runnable (deps from the
    lockfile, env files). Run it once to prove it works.
  - **Verify** — one non-interactive per-iteration gate command; create one
    if the stack has none (e.g. an npm script chaining lint + typecheck). Run it
    once and record its duration in the contract.
  - **Test** — the test command, or `none yet` (acceptance items no machine
    check covers go to the milestone-QA gate).
  - **Build** — the full check for app-affecting changes.
- **QA-gate default** — the milestone QA check type (review / UI check / smoke
  test).
- **Model tiers (optional)** — if the project routes roles to model tiers, fill
  the role->tier field (orchestrator / implementer / reviewer). Absent or a role
  unset -> `inherit`. Model names live only in the contract.
- Worktree convention, branch/spec naming, issue conventions, gates, autonomy
  and loop prompts are fixed by the template — fill only the placeholders (repo
  name, iteration ceiling).

GATE: present the filled contract before writing `docs/workflow.md`.

## Step 7b — Design contract (gate 7b, optional — design-surface only)

Decide design surface: does this project render a user-facing interface
(web/app/CLI-with-rich-output) or would a visualisation
(flow / state / architecture / concept) materially clarify recurring
decisions? Neither -> record `none` in the readiness checklist and skip to
Step 7c. Either -> Read `${CLAUDE_SKILL_DIR}/references/design-contract.md` and
fill the contract from it (it carries this step's GATE).

## Step 7c — Release contract (gate 7c, optional — releasable projects only)

Decide releasability: does this project ship a versioned release — a
library / plugin / binary / deployed service / hosted site? No -> record `none`
in the readiness checklist and skip to Step 8. Yes -> Read
`${CLAUDE_SKILL_DIR}/references/release-contract.md` and fill the contract from
it (it carries this step's GATE and the `--here` gap routing).

## Step 8 — Project permissions (gate 8)

Decide: the project's loops need autonomy granted per project — plugins cannot
ship permission rules. Read `${CLAUDE_SKILL_DIR}/references/permissions.md` and
fill `.claude/settings.json` from it (it carries this step's GATE, the
permission-mode facts and the `--here` gap).

## Step 9 — Wire CLAUDE.md (no gate)

Create or extend the project `CLAUDE.md` (last, so it references every
artifact):
- Reference `@docs/vision.md` and `@docs/constitution.md` (always in context).
- List `docs/prior-art.md`, `docs/architecture.md`, `docs/roadmap.md`, and
  `docs/workflow.md` as on-demand references — explicitly not loaded permanently
  (token budget).
- State the contract's Autonomy grant in `CLAUDE.md`, the always-in-context
  counterpart to stricter global user rules: within the loopkit skills,
  autonomous commits, pushes, merges, dependency installs and `.env` edits are
  explicitly granted; hard limits live in `.claude/settings.json`.
- Write a `# Compact Instructions` section — a few lines, a directive not a
  state dump, re-injected after a compaction: keep the active milestone target
  and the wave issues still running, and re-derive the unblocked frontier from
  GitHub afterwards.

## Close out — loop readiness

Read `${CLAUDE_SKILL_DIR}/references/readiness-checklist.md`, walk it and show
the result. Show the created and changed files for sign-off, then print the `/loop` start
commands (plan, implement) from the contract's Loops section, ready to paste
into the plan session and one orchestrator session per milestone.
`/loopkit:roadmap` is invoked directly, per idea.

## If blocked

Stop and ask. No workarounds, no skipped gates.

End of /loopkit:inception.
