# Spec: tooling-preflight — fail fast when git/gh are missing or unauthorized

> Created: 2026-06-17

Every loopkit operation hard-depends on `git` and an **authenticated** `gh` with
the right token scopes. Today nothing verifies this up front: a missing tool,
logged-out `gh`, or a token without the `project` scope surfaces as a cryptic
mid-flow failure (the board creation in inception Step 7, or `/plan`'s
`gh repo view` misread as "no repo"). This spec adds a preflight check that fails
fast with an actionable remedy, before any repo or network work.

## Outcome

- [ ] `/loopkit:inception` verifies the tooling as the FIRST action (Step 0,
      before reading the codebase or touching the network): `git` and `gh` on
      PATH, `gh` authenticated, and the required token scopes present. On any
      failure it STOPS and lists every problem at once with the exact remedy
      command — never proceeds into the artifact/board steps.
- [ ] The inception Close-out readiness checklist includes the tooling + auth +
      scope check (so a brownfield `--here` run reports it).
- [ ] `/loopkit:plan` and `/loopkit:implement` guard their Preconditions on
      `gh` auth + required scopes (once per run), stopping with the same remedy —
      because the two loops run in separate attended sessions over time and auth
      or scope can lapse between them.
- [ ] The `project`-scope landmine is explicitly handled: a token authenticated
      via `gh auth login` with default scopes (which do NOT include `project`)
      is detected and remediated by message (`gh auth refresh -s project`),
      instead of crashing at board creation.
- [ ] The workflow contract (template + loopkit's own `docs/workflow.md`)
      documents `gh` (authenticated; scopes `repo` + `project`) and `git` as an
      environment prerequisite.

## Scope

### In scope

- `skills/inception/SKILL.md` — a tooling-preflight precondition at the start of
  Step 0, and the matching Close-out readiness-checklist item.
- `skills/plan/SKILL.md`, `skills/implement/SKILL.md` — a one-line auth/scope
  guard in each Preconditions section (once per run).
- `skills/inception/templates/workflow.md` and `docs/workflow.md` — add a short
  `## Environment prerequisites` section **immediately before the `## Repository`
  section**, documenting `gh` (authenticated; scopes `repo` + `project`) + `git`
  as required, with the same remedy strings.

### Out of scope

- Auto-running `gh auth login` / `gh auth refresh` — these trigger an
  interactive browser/device flow the human must complete; the skill INSTRUCTS,
  never auto-runs (constitution: no silent outward/interactive actions).
- Installing git/gh for the user, or managing credential storage.
- Network reachability / GitHub outage detection — a different concern.

## Constraints

- Constitution: the runtime is "Claude Code + `gh` + `git`" and state lives in
  "GitHub issues / milestones / Project board" — so an authenticated `gh` with
  board (`project`) access is a hard runtime dependency, not optional. Reference,
  do not restate.
- Constitution: "Bounded retry — loops never grind; fail safe with a resumable
  report." The preflight is the same spirit applied to preconditions: fail fast
  with an actionable remedy, do not grind into cryptic errors.
- The board is a ProjectV2 (`gh project` / `updateProjectV2ItemFieldValue`),
  which requires the `project` token scope — and `gh auth login` does NOT grant
  it by default. This is the specific landmine the check exists to catch.

## Prior art

- [Loop safety / bounded retry](../prior-art.md#loop-safety--bounded-retry) —
  Taskmaster's ADOPT note ("bounded retry that fails safe with an actionable
  resume state") is the same principle applied to preconditions: stop early with
  a remedy the human can act on, rather than failing deep and cryptically.

## Human prerequisites

- none — this feature is a self-contained check; it needs no secrets, accounts,
  or provisioning. (The check's PURPOSE is to surface the human's own missing
  auth at run time, but planning needs nothing delivered.)

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Required tools: `git` and `gh` on PATH, verified via `command -v` + `--version` | constitution runtime stack | 2026-06-17 |
| `gh` must be authenticated, verified via `gh auth status` | every loop op hits GitHub | 2026-06-17 |
| Required token scopes: exactly `repo` (issues/milestones/PRs) + `project` (the ProjectV2 board). `read:org` is NOT required up front and is NOT detected up front (no skill calls `gh workflow` or org APIs; the only org case is a board that lives under an org, an edge case) — it is a **reactive remedy only**: if a board op later fails with an org-scope error, instruct `gh auth refresh -s read:org`. | grounded in the skills' gh usage; `project` is the default-`gh-auth-login` gap; avoids brittle up-front org detection | 2026-06-17 |
| inception runs the check as the **literal first action of Step 0** — before mode detection and before any `gh repo view`/`$ARGUMENTS` branch, so even mode detection's gh calls are guarded — and STOPS listing every failure at once with the exact remedy; no partial progress | preflight pattern + fail-fast; re-running inception after the remedy is cheap | 2026-06-17 |
| plan + implement check once per run (not per iteration/wave) | the loops run in separate sessions over time; once-per-run honors "loops never grind" | 2026-06-17 |
| The skill INSTRUCTS the remedy, never auto-runs `gh auth login`/`refresh` | those are interactive browser/device flows; constitution forbids silent outward/interactive actions | 2026-06-17 |
| Remedy strings are pinned verbatim in this spec so the parallel issues stay byte-consistent across inception/plan/implement/template/contract | the P6 frontier lesson: a shared token must be added identically everywhere at once | 2026-06-17 |
| Scope detection — pinned two-step: (1) run `gh auth status` and read the `Token scopes:` line; if present, require it to contain `repo` and `project`. (2) If the line is ABSENT (fine-grained PAT / GitHub App / `GH_TOKEN` report no classic scopes), do NOT parse — fall back to the pinned probe `gh api graphql -f query='{viewer{projectsV2(first:1){nodes{id}}}}'`; exit 0 = `project` access OK, a non-zero exit whose stderr matches `INSUFFICIENT_SCOPES` or mentions `project` (case-insensitive) = missing `project`. `repo` access is likewise confirmed by the probe `gh repo view >/dev/null` (non-zero = no repo access). | robustness across all `gh` auth methods, no guessing | 2026-06-17 |
| Required-scope policy = exactly `repo` + `project` — no `workflow`, no up-front `read:org` | confirmed by the project owner at the spec-acceptance gate; the skills use only `repo` + `project`, reviewer verified no `gh workflow` usage, and the minimal set avoids blocking fresh users | 2026-06-17 |

### Pinned reference strings (issues copy these verbatim)

- Tool check: `command -v git` and `command -v gh` (with `git --version` /
  `gh --version`).
- Auth check: `gh auth status`.
- Scope check (two-step, per the scope-detection decision above):
  1. `Token scopes:` line present -> it must contain `repo` and `project`.
  2. line absent -> probe `gh api graphql -f query='{viewer{projectsV2(first:1){nodes{id}}}}'`
     (project) and `gh repo view >/dev/null` (repo); a non-zero exit whose
     stderr matches `INSUFFICIENT_SCOPES` or mentions `project` = missing scope.
- Remedies (instruct, do not auto-run):
  - tool missing -> "install git / gh — https://cli.github.com"
  - not authenticated -> `gh auth login`
  - missing `project` scope -> `gh auth refresh -s project` *(OAuth login; for a
    PAT or `GH_TOKEN`, `gh auth refresh` does not apply — re-create the token
    with the `project` scope instead)*
  - org-board scope error (reactive only) -> `gh auth refresh -s read:org`
    *(same PAT caveat)*

## Tracking

- Milestone: tooling-preflight (created once this spec is merged)
- Issues: created from this spec — one per skill surface (inception; plan +
  implement; workflow contract). Independent (disjoint files); the spec's pinned
  strings keep them consistent. Milestone-level: `Depends on milestone: none`.

Verify is `none yet`, so the QA gate splits into machine-checkable items
(read-through + grep, done at review) and manual-attended items (a hands-on
smoke run the human performs at the milestone-QA gate).

**Machine-checkable (read-through / grep):**

- [ ] `inception/SKILL.md` Step 0 opens with the preflight (tool + auth + scope)
      as its literal first action, before mode detection; the Close-out
      readiness checklist includes the check.
- [ ] `plan/SKILL.md` and `implement/SKILL.md` Preconditions carry the
      once-per-run auth/scope guard with the same remedy strings.
- [ ] The workflow template AND `docs/workflow.md` have an
      `## Environment prerequisites` section before `## Repository` documenting
      `gh` (authed, scopes `repo` + `project`) + `git`.
- [ ] grep: the pinned remedy strings and the scope list (`repo`, `project`)
      match across inception/plan/implement/template/contract — no drift.

**Manual-attended (hands-on smoke run at the QA gate — no machine check covers these):**

- [ ] With `gh` logged out, `/loopkit:inception` stops at Step 0 with
      `gh auth login` guidance — not a cryptic mid-flow error.
- [ ] With `gh` authed but WITHOUT the `project` scope, `/loopkit:inception`
      stops at Step 0 with `gh auth refresh -s project` guidance — not a Step-7
      board-creation crash. (Reproduce via a token lacking `project`.)
- [ ] With `git` or `gh` absent from PATH, inception stops naming the missing
      tool and where to get it.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Scope detection fails for non-token auth (`GH_TOKEN` / GitHub App / fine-grained PAT) where `gh auth status` omits the scopes line | the pinned two-step: when the scopes line is absent, fall back to the pinned ProjectV2 + repo probes and treat an `INSUFFICIENT_SCOPES`/`project` error as the missing scope |
| Over-blocking: stopping for a scope this run will not use | require only `repo` + `project`; `read:org` is a reactive remedy (shown only if an org-board op actually errors), never an up-front block — so the brittle org-board-on-user-repo case needs no up-front detection |
| Drift: the scope list / remedy strings diverge across the five edited surfaces | the spec pins the exact strings; a grep-consistency Verification item closes the loop |

## Decision log

- 2026-06-17: Preflight checks tooling + auth + scopes, fails fast with an
  actionable remedy, instructs (never auto-runs) the fix; the `project`-scope
  gap of default `gh auth login` is the specific landmine targeted.
- 2026-06-17: Spec-acceptance gate — required-scope policy confirmed by the
  project owner as exactly `repo` + `project` (not `workflow`, not up-front
  `read:org`). Spec review (PR #61) resolved two blocking implementer-forks
  before acceptance: the scope-detection probe is pinned verbatim, and
  `read:org` was reduced to a reactive remedy (no brittle up-front org
  detection).
