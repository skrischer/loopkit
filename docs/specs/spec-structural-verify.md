# Spec: structural-verify

> Created: 2026-07-02

Set loopkit's Verify command (currently `none yet`) to the native
`claude plugin validate` — no new dependency — plus a thin companion check for
loopkit invariants the validator misses, and wire it into the per-PR machine gate
and the milestone-QA gate. Adopting the validator immediately surfaces a real
latent bug it must fix first: four of the five skills' `description:` frontmatter
fails to parse, so they load with empty metadata at runtime.

## Outcome

- [ ] The frontmatter of `skills/{plan,implement,inception,roadmap}/SKILL.md`
      parses cleanly — `claude plugin validate .claude-plugin/plugin.json` reports
      **zero errors** for all five skills. The `name`/`description` **text is
      unchanged in meaning** (only YAML quoting/scalar style changes).
- [ ] loopkit's Verify is a committed `scripts/verify.sh` that runs **both**
      required invocations, **non-strict**, and exits non-zero if either fails:
      `claude plugin validate .` (marketplace manifest) **and**
      `claude plugin validate .claude-plugin/plugin.json` (plugin manifest + all
      skills). It uses no npm/ajv/python — only `claude` (always present in the
      Claude Code runtime), `git`, and shell.
- [ ] `scripts/verify.sh` also runs a **thin companion check** for the loopkit
      invariant(s) the native validator does not cover (exact scope resolved at the
      spec-acceptance gate), false-positive-free on the current tree.
- [ ] `docs/workflow.md` Commands sets `Verify: bash scripts/verify.sh` (no longer
      `none yet`), and its Gates section reflects that the per-PR machine gate now
      runs Verify (its checks no longer "fall to milestone-QA").
- [ ] The gate prose is wired: `skills/implement/SKILL.md`'s per-issue **Verify**
      step and milestone-QA default check run `scripts/verify.sh`; any
      `none yet`/`Verify is none yet` caveat in `skills/implement/SKILL.md` /
      `skills/plan/SKILL.md` is updated.
- [ ] The marketplace `description` warning is cleared (add a `description` to
      `.claude-plugin/marketplace.json`); `claude plugin validate .` runs
      warning-clean. The advisory CLAUDE.md-root warning is **tolerated** (non-strict).
- [ ] Verify is green end-to-end on the merged tree, and demonstrably **fails** if
      a manifest is malformed, a skill's frontmatter breaks, or the companion
      invariant is violated.

## Scope

### In scope

- `skills/{plan,implement,inception,roadmap}/SKILL.md` — **frontmatter only**: make
  the `description:` value valid YAML (it currently contains unquoted `: `
  sequences → parse error) while preserving the exact text.
- `scripts/verify.sh` (new) — the two `claude plugin validate` invocations
  (non-strict) + the thin companion check; non-zero on any failure.
- `.claude-plugin/marketplace.json` — add a top-level `description`.
- `docs/workflow.md` — Commands (`Verify`) + Gates section.
- `skills/implement/SKILL.md` (Verify step + milestone-QA default check),
  `skills/plan/SKILL.md` (any `none yet` Verify caveat) — prose wiring only.

### Out of scope

- **`--strict` mode** — deliberately not used (see Constraints / prior art
  #25380). Revisitable if that upstream issue is resolved.
- **The inception template `skills/inception/templates/workflow.md`** — target
  projects are not necessarily Claude Code plugins, so `claude plugin validate` is
  not universally their Verify. Suggesting a structural Verify to plugin-type
  target projects is a possible later follow-up, not this phase.
- **Moving loopkit's `CLAUDE.md` into a skill** to clear the advisory root warning
  — a larger change; the warning is tolerated under non-strict.
- **Rewording any skill `description` text** — only the YAML encoding changes; the
  user-facing wording is preserved.
- **A CI workflow / GitHub Action** — Verify runs in-loop (the per-PR machine gate
  and milestone-QA), consistent with loopkit's no-scheduler, attended model.

## Constraints

Reference `docs/constitution.md` / `docs/prior-art.md` rather than restating.

- **Runtime = Claude Code + `gh` + `git`, no language runtime / package manager**
  (constitution, Tech stack). The native `claude plugin validate` and a shell
  script satisfy this with **no new dependency**; hand-rolling a JSON/frontmatter
  validator or pulling npm/ajv/python is forbidden (prior art: AVOID).
- **Non-strict is required, not `--strict`.** Tested: non-strict already surfaces
  the real failures as **errors** (malformed JSON, YAML parse failure → exit 1),
  while `--strict` turns advisory **warnings** into failures — including the
  extended-frontmatter false-positives of Claude Code issue #25380 (prior art:
  AVOID failing Verify on those) and the intentional CLAUDE.md-root warning.
- **Two invocations are both needed** (tested): `claude plugin validate .`
  validates only the **marketplace** manifest and does **not** recurse into skills;
  `claude plugin validate .claude-plugin/plugin.json` validates the **plugin
  manifest + every skill**. Verify runs both.
- **The frontmatter fix is a prerequisite, not optional** — Verify cannot be green
  while four skills error. This is the dogfood value: adopting a structural Verify
  catches a real, pre-existing bug in loopkit's own skills (they load with empty
  metadata at runtime). Fix by valid YAML (a block scalar `>-` avoids escaping the
  internal `"…"` and `: ` the descriptions contain), preserving the text.
- **The companion check must be false-positive-free** — loopkit's instructional
  Markdown legitimately names forbidden tokens (`claude -p`,
  `--dangerously-skip-permissions`, cron…) as prohibitions, and a settings.json
  may name them in **deny** rules; a naive whole-tree grep would false-positive on
  that prose. The chosen check must not (scope resolved at the gate).
- **GitHub-only state / subscription auth / no scheduler** (constitution) — Verify
  is a local in-loop check; it adds no CI scheduler, no API key, no headless flag.
- Skills are Markdown; the only executable added is `scripts/verify.sh` (shell,
  part of the allowed runtime).

## Prior art

- [Structural verification of a Claude Code plugin — reuse the native validator](../prior-art.md#structural-verification-of-a-claude-code-plugin--reuse-the-native-validator-feature-structural-verify) — the concern this scope implements.
  - **Claude Code `claude plugin validate`** — REUSE the native validator (JSON + schema, frontmatter, duplicate names, path traversal); set it as Verify + a thin companion; wire into both gates. AVOID hand-rolling a validator or adding npm/ajv/python.
  - **hesreallyhim/claude-code-json-schema** — reference-only; documentation-grade schema shapes. AVOID depending on it at runtime (needs a JSON-Schema engine → a package manager).
  - **Claude Code issue #25380 (frontmatter validator rejects extended fields)** — CAUTION driving the non-strict decision: validate required fields (`name`, `description`), treat extended-field warnings as non-fatal, do NOT fail Verify on false positives.

## Human prerequisites

- none — `claude plugin validate` ships with the Claude Code runtime (verified
  present); every change is in-repo (Markdown / JSON / a shell script). No
  secrets, accounts, or external provisioning.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Verify = `claude plugin validate` (native), no new dependency | Prior art REUSE; keeps the constitution's "no language runtime / package manager" runtime intact | 2026-07-02 |
| Non-strict, not `--strict` | Non-strict already catches the real errors (JSON/YAML parse) as exit-1; `--strict` fails on advisory warnings + #25380 extended-field false positives (prior art AVOID) | 2026-07-02 |
| Verify runs TWO invocations: `claude plugin validate .` (marketplace) + `claude plugin validate .claude-plugin/plugin.json` (plugin + skills) | Tested: `.` validates only the marketplace and does not recurse into skills; the plugin.json path validates the plugin manifest + every skill; both are needed for full coverage | 2026-07-02 |
| Fix the 4 broken skills' frontmatter IN this phase, preserving description text (block scalar / quoting) | Verify cannot be green while `plan`/`implement`/`inception`/`roadmap` error; the fix is the dogfood payoff (a real runtime bug: skills load with empty metadata). `design` already parses | 2026-07-02 |
| Verify lives in a committed `scripts/verify.sh`, invoked by both gates and humans | Two invocations + a companion check referenced in two places → one DRY script; shell is within the allowed runtime | 2026-07-02 |
| Clear the marketplace `description` warning; tolerate the advisory CLAUDE.md-root warning | The marketplace description is a trivial, real improvement; the CLAUDE.md-root note is intentional (loopkit's CLAUDE.md is project context, not plugin-shipped) and non-fatal under non-strict | 2026-07-02 |
| `Depends on milestone: none` | roadmap-iteration (#10) and prior-art-elevation (#11) are closed; design-in-the-loop is not yet a milestone. No cross-milestone file collision at plan time | 2026-07-02 |
| No inception-template change, no CI workflow (out of scope) | Proportional: target projects are not all plugins; Verify runs in-loop, not on a scheduler | 2026-07-02 |
| OPEN — the thin companion check's exact scope/altitude (what invariant it asserts + how it stays false-positive-free) | resolved at the spec-acceptance gate | — |

## Tracking

- Milestone: [structural-verify](<milestone-url>) — created once this spec merges
- Issues: created from this spec once merged (one per implementable step)

## Verification

The project's Verify becomes `bash scripts/verify.sh`; this list is also the human
milestone-QA script.

- [ ] `claude plugin validate .claude-plugin/plugin.json` exits 0 (non-strict) with
      **zero error findings**; all five skills parse. Each fixed skill's
      `name`/`description` text is unchanged in meaning (diff shows only YAML
      encoding).
- [ ] `claude plugin validate .` exits 0 and is **warning-clean** (marketplace
      `description` present).
- [ ] `scripts/verify.sh` exits 0 on the clean tree and **non-zero** in each
      injected-failure smoke: (a) malform a manifest JSON; (b) break a skill's
      frontmatter; (c) violate the companion invariant. (Run on a throwaway copy /
      revert after — do not commit the breakage.)
- [ ] The companion check is false-positive-free on the current tree (no match on
      legitimate prohibition prose or deny-rule mentions).
- [ ] `docs/workflow.md` Commands shows `Verify: bash scripts/verify.sh`; the Gates
      section no longer says Verify is `none yet` / that its checks fall to
      milestone-QA.
- [ ] `skills/implement/SKILL.md` (Verify step + milestone-QA default check) and
      any `skills/plan/SKILL.md` Verify caveat run/reference `scripts/verify.sh`.
- [ ] grep guardrails still pass: the diff introduces no headless flag, API key,
      scheduler/cron, or local-state second-source.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| The frontmatter fix silently changes a skill's description meaning | Acceptance requires the text be unchanged (diff shows only YAML encoding); prefer a block scalar so no rewording is needed |
| `--strict` creep re-introduces the #25380 false-positive failure mode | Decided non-strict; recorded with the upstream issue as the reason; revisit only when it resolves |
| The companion check false-positives on prohibition prose / deny rules and blocks every PR | The check is scoped to be false-positive-free (gate decision); a Verification item asserts it is clean on the current tree |
| Marketplace vs plugin invocation confusion leaves skills unvalidated | Both invocations are mandated in `scripts/verify.sh`; the injected-failure smoke proves a broken skill fails Verify |
| Adding `scripts/` introduces an executable surface loopkit didn't have | One small shell script within the allowed runtime; the companion grep also guards this new surface for forbidden tokens |

## Decision log

- 2026-07-02: Spec drafted. During planning, ran `claude plugin validate` against
  loopkit and discovered four skills (`plan`, `implement`, `inception`, `roadmap`)
  fail YAML frontmatter parsing (`design` is clean) — a real latent bug the phase
  now fixes first. Tested that `.` validates only the marketplace while
  `.claude-plugin/plugin.json` validates the plugin + skills (both needed), and
  that non-strict already reports the real errors while `--strict` fails on
  advisory warnings (aligning with prior-art #25380). One genuinely-open item
  carried to the gate: the thin companion check's scope.
