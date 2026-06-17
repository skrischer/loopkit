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
- `skills/inception/templates/workflow.md` and `docs/workflow.md` — document the
  `gh` (authed, scopes `repo` + `project`) + `git` environment prerequisite.

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
| Required token scopes: `repo` (issues/milestones/PRs) + `project` (the ProjectV2 board); `read:org` additionally only when the repo/project owner is an org (detect via `gh repo view --json owner -q .owner.type`) | grounded in the skills' gh usage; `project` is the default-`gh-auth-login` gap | 2026-06-17 |
| inception checks all of the above as the FIRST action of Step 0 and STOPS listing every failure at once with the exact remedy; no partial progress | preflight pattern + fail-fast; re-running inception after `gh auth refresh` is cheap | 2026-06-17 |
| plan + implement check once per run (not per iteration/wave) | the loops run in separate sessions over time; once-per-run honors "loops never grind" | 2026-06-17 |
| The skill INSTRUCTS the remedy, never auto-runs `gh auth login`/`refresh` | those are interactive browser/device flows; constitution forbids silent outward/interactive actions | 2026-06-17 |
| Remedy strings are pinned verbatim in this spec so the parallel issues stay byte-consistent across inception/plan/implement/template/contract | the P6 frontier lesson: a shared token must be added identically everywhere at once | 2026-06-17 |
| Scope detection: parse the `gh auth status` "Token scopes:" line; if it is absent (e.g. `GH_TOKEN`/app auth), fall back to a cheap probe (attempt a harmless ProjectV2 read) and treat a scope error as the missing scope | robustness across auth methods | 2026-06-17 |
| OPEN — the required-scope POLICY: mandate exactly `repo` + `project` (+ `read:org` for org-owned), or a stricter set (e.g. also `workflow`)? | security-relevant; the project owner confirms it | resolved at the spec-acceptance gate |

### Pinned reference strings (issues copy these verbatim)

- Tool check: `command -v git` and `command -v gh` (with `git --version` /
  `gh --version`).
- Auth check: `gh auth status`.
- Scope check: the `Token scopes:` line of `gh auth status` must contain `repo`
  and `project` (and `read:org` for org-owned repos).
- Remedies (instruct, do not auto-run):
  - tool missing -> "install git / gh — https://cli.github.com"
  - not authenticated -> `gh auth login`
  - missing `project` scope -> `gh auth refresh -s project`
  - missing `read:org` (org repos) -> `gh auth refresh -s read:org`

## Tracking

- Milestone: tooling-preflight (created once this spec is merged)
- Issues: created from this spec — one per skill surface (inception; plan +
  implement; workflow contract). Independent (disjoint files); the spec's pinned
  strings keep them consistent. Milestone-level: `Depends on milestone: none`.

## Verification

- [ ] Verify command is `none yet` — these acceptance items are checked at the
      milestone-QA gate (read-through + the behavioral checks below).
- [ ] Behavioral: with `gh` logged out, `/loopkit:inception` stops at Step 0 with
      `gh auth login` guidance — not a cryptic mid-flow error.
- [ ] Behavioral: with `gh` authed but WITHOUT the `project` scope,
      `/loopkit:inception` stops at Step 0 with `gh auth refresh -s project`
      guidance — not a Step-7 board-creation crash.
- [ ] Behavioral: with `git` or `gh` absent from PATH, inception stops naming the
      missing tool and where to get it.
- [ ] Read-through: `plan` and `implement` Preconditions carry the once-per-run
      auth/scope guard with the same remedy strings.
- [ ] Read-through: the workflow template AND `docs/workflow.md` document the
      `gh` (authed, scopes `repo` + `project`) + `git` prerequisite.
- [ ] grep: the pinned remedy strings and the scope list (`repo`, `project`)
      match across inception/plan/implement/template/contract — no drift.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Scope detection fails for non-token auth (`GH_TOKEN` / GitHub App) where `gh auth status` omits the scopes line | fall back to a cheap ProjectV2 probe and treat a scope error as the missing scope |
| Over-blocking: stopping for a scope that this particular run will not actually use | require only the universally-needed set (`repo` + `project`); `read:org` stays conditional on org ownership |
| Drift: the scope list / remedy strings diverge across the five edited surfaces | the spec pins the exact strings; a grep-consistency Verification item closes the loop |

## Decision log

- 2026-06-17: Preflight checks tooling + auth + scopes, fails fast with an
  actionable remedy, instructs (never auto-runs) the fix; the `project`-scope
  gap of default `gh auth login` is the specific landmine targeted.
