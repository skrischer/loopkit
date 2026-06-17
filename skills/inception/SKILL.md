---
name: inception
description: Phase-0 inception dialog that runs BEFORE any spec work — clarify the goal, research prior art, then derive vision, constitution, and architecture artifacts plus roadmap, workflow contract, GitHub project board, project permission settings, and CLAUDE.md wiring, leaving the project loop-ready for /loopkit:plan and /loopkit:implement. On an existing project (--here) it doubles as a loop-readiness check that diffs the project against the contract and closes only the gaps. Only run when the user explicitly invokes it. Arguments: a project pitch (greenfield) or --here (brownfield).
---

# /loopkit:inception — Phase-0 inception (before specs)

Codifies the phase BEFORE spec-driven development (constitution -> specify ->
plan -> tasks). Produces four foundation artifacts in `docs/` (vision,
constitution, prior-art, architecture), a `docs/roadmap.md` sequencing the work
into plannable phases, a `docs/workflow.md` operational contract, a GitHub
Project board, and the project's `.claude/settings.json` permissions — the
hand-off to the `/loopkit:plan` and `/loopkit:implement` sibling skills, which
then run as two parallel attended loops over GitHub issues, milestones, and the
board. Strictly separate intent (what/why) from implementation (how); the tech
stack belongs in the constitution, never in feature specs.

**Interaction model:** guided dialog, never one-shot. Human gates: after the
goal draft, before finalizing each artifact (prior-art, vision, constitution,
architecture), before the roadmap, before the workflow contract, and before
writing the permission settings. At each gate, present the draft and confirm
via AskUserQuestion before writing the final file. Converse in the user's
language; all artifacts and the CLAUDE.md wiring are written in English.

**Brownfield = readiness check + gap closure:** with `--here` on an existing
project, first read the codebase and every existing artifact, then diff them
against the current templates' mandatory fields (the readiness checklist in
Close out). Present the gap report as the first gate, then run ONLY the steps
that close gaps — reconcile and extend existing artifacts, never
blind-overwrite; surface conflicts at the artifact's gate. Idempotent: on a
fully loop-ready project the result is "all green — nothing to do".

## Artifacts and their character (strict separation, no duplication)

| File                 | Character                        | Content                                              |
| -------------------- | -------------------------------- | ---------------------------------------------------- |
| docs/vision.md       | normative                        | what/why, implementation-free                        |
| docs/constitution.md | normative, binding               | rules; every principle verifiable and specific       |
| docs/prior-art.md    | descriptive, living              | indexed by concern, not by project                   |
| docs/architecture.md | structural, living, most volatile| components, boundaries, flows, where new code goes   |

Templates live in `templates/` next to this file — copy the structure, fill
it, never duplicate content across artifacts.

## Step 0 — Determine mode (no gate)

**Preflight (the LITERAL FIRST action — before mode detection, before any
`gh repo view`, before the `$ARGUMENTS` branch).** Every loopkit op hard-depends
on `git` and an authenticated `gh` with the `repo` + `project` scopes; verify
that now so nothing fails cryptically mid-flow (e.g. board creation in Step 7).
Run all checks, then on ANY failure STOP and list EVERY problem at once with the
exact remedy — INSTRUCT the fix, never auto-run `gh auth login`/`gh auth refresh`
(those are interactive browser/device flows):

- **Tools on PATH.** `command -v git` and `command -v gh` (then `git --version` /
  `gh --version`). Missing -> remedy: "install git / gh — https://cli.github.com".
- **`gh` authenticated.** `gh auth status`. Not authenticated -> remedy:
  `gh auth login`.
- **Token scopes — required: `repo` + `project` (two-step check).**
  1. If the `Token scopes:` line of `gh auth status` is present, it must contain
     `repo` and `project`.
  2. If that line is ABSENT (fine-grained PAT / GitHub App / `GH_TOKEN` report no
     classic scopes), do NOT parse — probe instead:
     `gh api graphql -f query='{viewer{projectsV2(first:1){nodes{id}}}}'`
     (project access) and `gh repo view >/dev/null` (repo access); a non-zero
     exit whose stderr matches `INSUFFICIENT_SCOPES` or mentions `project`
     (case-insensitive) = missing scope.
  Missing `project` -> remedy: `gh auth refresh -s project` *(OAuth login; for a
  PAT or `GH_TOKEN`, `gh auth refresh` does not apply — re-create the token with
  the `project` scope instead)*. **Project-scope landmine:** `gh auth login` does
  NOT grant `project` by default, so a "correctly authed" user still fails board
  creation without it — this is the specific gap the check exists to catch.

- `$ARGUMENTS` is `--here` -> brownfield.
- Otherwise auto-detect: working directory contains a codebase -> brownfield
  (treat any pitch text as extra context); empty -> greenfield with
  `$ARGUMENTS` as the pitch.
- Empty directory and no pitch: ask for the pitch first.
- State the detected mode in one line and continue.
- Brownfield only: before anything else, read the existing codebase and
  EXTRACT the lived conventions, structure, and stack. Never invent what the
  code already answers. Also read `docs/workflow.md`, `.claude/settings.json`,
  and the GitHub state (`gh repo view`, milestones, board) — then present the
  readiness gap report (GATE) and skip every step below whose output already
  meets the current template.

## Step 1 — Rough goal (gate 1)

Work out with the user: problem, why now, target users, measurable success
criteria. Short dialog, not a form. GATE: confirm the goal summary before
research starts.

## Step 2 — Prior-art challenge (gate 2)

Prior art is not just catalogued — it CHALLENGES the project. Derive the
challenge questions from the goal and answer them from the findings:

- **Existence** — does an existing tool already solve this well enough to make
  the project redundant? The honest output may be "reuse X, don't build."
- **USP** — in one sharp sentence, what justifies this project that prior art
  does not already cover?
- **Differentiation / non-goals** — where does this project deliberately stop
  where others go on? Feeds the vision's scope and non-goals.
- **Idea harvest** — per reference: what works, what fails, did we account for
  the same concerns; what to adopt, what to avoid on purpose.

The challenge answers are an input to the vision (Step 3: USP, non-goals) and
may spawn roadmap items — prior art is not a passive document.

**Research mode — ASK, never assume.** Present the choice before researching:

- **deep-research** — the deep-research skill: deep, multi-source. COST: it
  fans out ~100 subagents that inherit the session model — run on a
  cost-appropriate model (e.g. Opus); a heavy model (Fable) multiplies the cost
  ~100x and can exhaust the session limit. Switch the session model before
  triggering, not during.
- **websearch** — a handful of focused WebSearch/WebFetch lookups; cheap, fast,
  enough for a landscape comparison.
- **none** — offer ONLY when `docs/prior-art.md` already exists with relevant
  entries: reuse what is there, skip fresh research.

Look for exemplary, preferably OSS projects that solve the problem or its
sub-problems. Fill `docs/prior-art.md` from the template: per entry concern,
repo + concrete path, license, verdict (reuse / reference-only / avoid + why),
date, and the harvest notes (adopt / avoid) in Notes. Living document — gaps
are fine.

GATE: present the challenge answers (existence, USP, differentiation, harvest)
and the per-entry verdicts before finalizing.

## Step 3 — Sharpen the vision (gate 3)

Informed by the research: goal + scope (in/out) + explicit non-goals ->
`docs/vision.md`. Keep it to ~1 page — it is loaded into context permanently.
GATE before finalizing.

## Step 4 — Derive the constitution (gate 4)

Tech stack with rationale, architecture principles, conventions, quality
gates, a "don't" list -> `docs/constitution.md`. Every principle must be
verifiable and specific ("max function length 50 lines", not "clean code").
Keep it to ~1 page — loaded permanently. Brownfield: write the TARGET state;
mark known deviations as tech debt instead of normalizing the status quo.
GATE before finalizing.

## Step 5 — Seed the architecture (gate 5)

Component map, responsibilities and boundaries, the most important
data/control flows, a "where does new code go" guide ->
`docs/architecture.md`. Greenfield: this is a seed, not a final design.
GATE before finalizing.

## Step 6 — Seed the roadmap (gate 6)

The roadmap is the content hand-off to `/loopkit:plan`: the sequenced queue of
phases it picks the next one from. Derive it from the vision scope and the
architecture seed — break the work into ordered, plannable phases. From
`templates/roadmap.md` into `docs/roadmap.md`:

- A phase-overview table (Phase, Name, Spec, Milestone). Specs and milestones
  are created later by `/loopkit:plan`, so both columns start `—`.
- A one-line north star tying back to the vision.

No status markers in the roadmap — progress lives in the GitHub issues and
milestones each phase links to; specs carry no lifecycle state either, a spec
is accepted once merged on the default branch with a milestone. Living
document; `/loopkit:plan` keeps the links current. GATE before finalizing.

## Step 7 — Establish the workflow contract (gate 7)

The operational hand-off to the `/loopkit:plan` and `/loopkit:implement`
sibling skills: they read `docs/workflow.md` instead of hardcoding project
specifics.

First, ensure the **git foundation** the contract (and the loops) depend on —
`/loopkit:plan` requires a GitHub repo:

- Check `git rev-parse --is-inside-work-tree`. If it is already a git repo with
  an `origin` remote, use it.
- If it is NOT a git repo, find the GitHub repo and wire it up:
  - Look for a repo matching the directory name
    (`gh repo list --json name,url,isEmpty`), or ask the user for the link.
  - For an existing repo, initialize and connect it (state what you do, no
    separate gate — it is plumbing): `git init`, `git remote add origin <url>`,
    `git fetch origin`. If the remote has commits, check out its default branch;
    if it is empty, create the base branch locally.
  - If NO repo can be found, ask the user — and only **create** one
    (`gh repo create`) on explicit confirmation, never silently.

Then fill the `templates/workflow.md` template, deriving values rather than
asking where you can:

- **Repository** — `gh repo view --json nameWithOwner` (now resolvable).
- **Base branch** — `git symbolic-ref refs/remotes/origin/HEAD` (fallback:
  `main`).
- **GitHub Project board — mandatory.** It is the loops' queue and claim
  mechanism (`Todo` / `In Progress` / `Done`). Ask for the existing project
  URL/number; if none exists, create one (`gh project create`) on explicit
  confirmation, never silently. `none` is not a valid value.
- **Brownfield backfill:** put every existing open issue onto the board
  (`Todo`, or its real state) AND retrofit the issue conventions on the
  existing issue bodies — above all a parseable `Depends on: #N` line per
  issue, derived from the specs' phase and step order. The implement loop's
  unblocked check reads exactly that line; prose dependencies are invisible
  to it and let issues get picked too early.
- **Commands** — derived from the stack just fixed in the constitution:
  - **Bootstrap** — makes a fresh clone or worktree runnable (install deps
    from the lockfile, copy env files). Run it once to prove it works.
  - **Verify** — ONE non-interactive command for the per-iteration gate. If
    the stack has no single command, create one as part of this step (e.g. an
    npm script chaining lint + typecheck). Run it once and record its measured
    duration in the contract — iteration cost burns attended-session usage.
  - **Test** — the test command, or `none yet` with its defined consequence
    (acceptance items no machine check covers go to the milestone-QA gate).
  - **Build** — the full check for app-affecting changes.
- **QA-gate default** — the check type for the milestone QA gate (review /
  UI check / smoke test).
- Worktree convention, branch/spec naming, issue conventions, gates, autonomy,
  and the loop prompts are fixed by the template — leave them as-is and fill
  the placeholders (repo name, iteration ceiling).

GATE: present the filled contract before writing `docs/workflow.md`.

## Step 8 — Project permissions (gate 8)

Fill `templates/settings.json` into the project's `.claude/settings.json` —
plugins cannot ship permission rules, so the loops' autonomy must be granted
per project:

- Broad allows; deny rules for `rm -rf`, force-push, and hard reset.
- Extend the deny list with the stack's destructive commands against shared
  state (e.g. `supabase db reset`, `prisma migrate reset` — replace the
  template's examples with what this stack actually has).
- The contract's Autonomy section is the human-readable counterpart: it
  explicitly grants autonomous commits, pushes, merges, dependency installs,
  and `.env` edits to the skills, overriding any stricter global user rules.
- **Conflict check:** read the user-level `~/.claude/settings.json`. Deny
  rules and PreToolUse hooks there beat every project setting — a global
  `Bash(npm install*)` deny silently kills Bootstrap, and no project file can
  override it. Surface every global rule that collides with the contract's
  Autonomy section and ask the user to relax it (their edit, never yours).

GATE: present the settings before writing; merge with an existing file, never
overwrite silently.

## Step 9 — Wire CLAUDE.md (no gate)

Create or extend the project `CLAUDE.md` (last, so it can reference every
artifact):
- Reference `@docs/vision.md` and `@docs/constitution.md` (always in context).
- List `docs/prior-art.md`, `docs/architecture.md`, `docs/roadmap.md`, and
  `docs/workflow.md` as on-demand references — explicitly NOT loaded permanently
  (token budget).
- State the contract's Autonomy grant directly in `CLAUDE.md` — the
  always-in-context counterpart to stricter global user rules (which are also
  always in context): within the loopkit skills, autonomous commits, pushes,
  merges, dependency installs, and `.env` edits are explicitly granted; hard
  limits live in `.claude/settings.json`.

## Close out — loop readiness

Walk this checklist and show the result (brownfield: the same checklist that
produced the gap report in Step 0):

- [ ] gh + git available and authorized — gh authenticated with the repo + project scopes (Step 0 preflight)
- [ ] Verify is ONE command, runs green, duration recorded in the contract
- [ ] Bootstrap turns a fresh worktree runnable, proven by running it
- [ ] Project board exists with `Todo` / `In Progress` / `Done`
- [ ] `docs/workflow.md` complete — no placeholders left
- [ ] `.claude/settings.json` deny rules in place
- [ ] Provisioning: `.env.example` complete and every value the project needs
      is provided — collect missing secrets from the user NOW, not mid-loop
- [ ] Initial commit exists on the base branch. If the branch is unborn,
      `/loopkit:plan` cannot branch a worktree from it: prompt the user and,
      only on their explicit confirmation, stage, commit, and push the
      inception output.

Show the list of created and changed files for sign-off, then print the two
loop start commands from the contract's Loops section — ready to paste into
two parallel sessions.

## If blocked

Stop and ask. No workarounds, no skipped gates.
