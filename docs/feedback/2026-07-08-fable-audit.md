# Fable strategic audit — 2026-07-08

> Intake note for `/loopkit:roadmap` and `/loopkit:plan`. Decides nothing; every
> foundation-doc recommendation here is ratified later in a `/loopkit:plan` cycle
> at the spec-acceptance gate. Roadmap seeds staged on branch
> `audit/2026-07-08-fable` (never main). This note walks the loopkit flow through
> five lenses and reports only findings that ATTACK or SHARPEN an existing seed /
> shipped feature, or bring intelligence that did not exist on 2026-07-02.

## Method (and the Lens-C discipline, demonstrated)

Orchestrated as three fan-out workflows; the orchestrator (Fable) spent tokens
only on adjudication and synthesis, never on reading repo files or web pages
directly.

- **Phase 1 — map + research (19 Sonnet agents).** Distilled readers over every
  flow stage (all five `SKILL.md` + templates, `skills/shared/`, the four `docs/`
  contracts, `docs/prior-art.md`, both feedback notes, `.claude/settings.json`,
  the plugin manifests); a byte-accurate context-footprint measurement; a
  git/gh gate-telemetry mine over all 13 milestones / 88 merged PRs / 49 issues;
  a trust-boundary grep sweep of the skills; and five web researchers
  (software-factory, practitioners, terminology, Willison prompt-injection,
  compaction/model-tiering). Every agent returned a bounded schema (bullet lists
  + `file:line` / URL refs), never raw text.
- **Phase 2 — evaluation (5 Opus agents).** Lenses A/B/C/E in parallel on the
  distilled maps; Lens D (backlog) last, folding all four.
- **Phase 3 — adversarial verify (45 Sonnet skeptics + 1 Opus critic).** Each of
  15 adjudicated findings faced three skeptics on distinct lenses — evidence
  (re-read the refs, re-ran the git/gh/`wc` checks, re-fetched cited URLs),
  novelty (does it restate a 2026-07-02 seed → refute), constitution-consistency
  — with majority-refute dropping the finding. A completeness critic then asked
  what the audit never covered.

Tiering as the audited discipline (Lens C in practice): 64 Sonnet workers did all
reading/research/verification, 6 Opus agents did multi-source synthesis, Fable
adjudicated. Subagent tokens: ~1.15M (map/eval) + ~2.0M (verify). This is the
same orchestrator-plans / cheaper-worker-executes split that finding **C4/D2**
recommends loopkit codify — see Lens C.

## Verdict tally

15 findings entered adversarial verification; **13 survived**, 2 fell.

| Survived (13) | Fell (2) |
|---|---|
| F2, F4, F5, F6, F7, F8, F9, F10, F11, F12, F13, F14, F15 | F1, F3 |

- **F1 (repositioning: DAG+GitHub-state is the real wedge)** — dropped, 2/3
  refute. Not because it is wrong but because `docs/prior-art.md` already reached
  it on 2026-07-02: the "Big-vendor aggregate" and CCPM/Copilot entries already
  say no competitor "computes a dependency-ordered execution frontier from
  issue-level relations" and name that as the differentiator. F1 restates a seed.
  The *live* repositioning defect is different and real — see the critic's README
  finding, folded into `repositioning` below.
- **F3 (Dynamic Workflows may supersede `/batch`)** — the "native *adversarial*
  verification pattern" claim was over-stated against the cited InfoQ source (one
  skeptic confirmed the word never appears there; the other two found the pattern
  via other sources but the citation was loose). The underlying question — is
  `/batch` still the current fan-out primitive to reuse, given Dynamic
  Workflows — survives as an **open adjudication**, not a finding, because it is
  unresolved intelligence, not a settled defect.

Two findings survived with a one-skeptic caveat worth recording:

- **F7** — one skeptic correctly noted the M12 SVG defect was a *spec-acceptance*
  gate miss (the SVG rode in the spec PR #115, fixed in ad-hoc PR #132), not the
  *implement merge*-gate mechanism F7 targets. Both facts hold: design is dropped
  from implement's review-gate seed AND the spec-acceptance gate missed the SVG.
  The corroboration is re-attributed accordingly below.
- **F13** — the "~5.5×" size ratio is overstated; the true ratio of
  `prior-art.md` to the next-largest doc (`roadmap.md`) is ~3.8×. The outlier
  claim stands with the corrected number.

---

## Lens A — Positioning / external

**Vision-substance verdict: the wedge holds, but it is not "attended".** Anthropic's
own "Getting started with loops" (Jun 30, verified) codifies a four-rung ladder
(turn → goal → time → proactive) that normalizes scheduled and unattended
operation as legitimate. loopkit's no-scheduler stance is therefore now a
*deliberate minority position*, not an industry gap. The surviving unique claim —
a dependency-ordered frontier computed from GitHub issue relations, fanned out by
one orchestrator — is one no practitioner in the research window discusses. loopkit
already knows this (`prior-art.md` "Big-vendor aggregate", 2026-07-02), which is
why the strategy finding F1 was dropped as a restatement. **The vision has
substance; the launch vocabulary must lead with the frontier/GitHub-state claim
and frame no-scheduler as a stance, which `repositioning` already directs.**

### Software-factory adjudication — COUNTER-POSITION, do not adopt (F2, survived 3/0)

Argued both ways from verified sources:

- **For adopting as an umbrella:** Factory.ai markets a literal "Software Factory"
  product with "graduated autonomy" (attended-compatible); marmelab and
  freecodecamp use "software factory" loosely for human-supervised Claude-Code
  stacks; the term has real 2026 reach.
- **Against:** the highest-visibility *definitional anchor* is Shapiro's Level-5
  "Dark Factory" — "humans are neither needed nor welcome" — and StrongDM's
  founding rules ("code must not be written or reviewed by humans", ~$1000/day
  tokens), verified via Willison. That is exactly what loopkit's vision rejects.
  Factory.ai *owns the term commercially*, so adopting it borrows a competitor's
  identity. And Osmani — loopkit's own cited authority — pointedly uses "Factory
  Model", not "software factory".

**Recommendation:** counter-position. Reference "software factory / Dark Factory"
only descriptively, as loopkit's attended/unattended foil. This is not in any of
the 11 rows; it becomes a new avoid-anchor prior-art entry, folded into
`prior-art-backfill`.

### Practitioner deltas (leverage left on the table)

- **New since 2026-07-02 — model-tier delegation (F15/A3).** Willison (Jul 3)
  has Claude Code self-select a lower-power model per subagent task (Haiku
  mechanical, Sonnet implementation, top tier reserved for judgment) — delegating
  the *decision* beat a fixed rule. loopkit's `/implement` fans out subagents with
  no tier policy. → Lens C, seed **D2**.
- **New — the economic backlash (F4/A6).** A "Loop Engineering Is Dead" narrative
  (Jul 5, verified: Uber budget exhaustion; Willison's own loop ~$149.25;
  StrongDM ~$1000/day) attacks the practice on *cost*, not concept. loopkit's
  subscription-auth-only + proportional dial is the precise rebuttal, and
  `launch-playbook` doesn't name it.
- **Known but uncited — Ronacher's harness-loop vocabulary (A4).** "The Coming
  Loop" (Jun 23) names the exact internal-agent-loop vs external-harness-loop
  split loopkit ships, and warns unattended harness loops erode comprehension —
  independent third-party validation of loopkit's thesis, absent from
  `prior-art.md`. Adopt-cite in `repositioning` / `prior-art-backfill`.

### Terminology / timing verdict (F4, A7)

"Loop engineering" is ~4 weeks old yet Anthropic canonized it (Jul 7, ~1.2M
X-views/day) *mid-backlash* — that is compression, not fading. It sits under
"agentic engineering" (Karpathy) as a sub-discipline, exactly as
`repositioning`'s vocabulary already frames it. **Timing verdict: launch now; the
window is weeks, not months.** One caveat the terminology skeptic flagged:
Anthropic's Jul-7 post uses its own product vocabulary and does not clearly adopt
the "loop engineering" *label* — so `repositioning` should track Anthropic's
product terms, not assume the community label won.

Minor (low confidence, F4): a crypto product `looplabs.fun` self-brands "the
first autonomous software factory" — a "loop" + "software factory" collision on
exactly the unattended model loopkit rejects. Add a name-disambiguation check to
`launch-playbook` before directory submission.

---

## Lens B — Flow & gates coherence (adversarial on shipped work)

### Prior-art threading breaks at three named points (F6, survived 3/0)

The constitution calls prior art "the substrate every artifact derives from." It
is genuinely wired in `/plan` (bucket-1 decision sorting + the spec template's
Prior-art section force a link-or-"none"). It is **not** wired at two places the
constitution's own wording demands, and the coupling is unenforceable:

1. **implement Orient** (`skills/implement/SKILL.md:130-136`) reads the issue +
   design artifact but **not** the spec's Prior-art section. The only consumption
   is the opt-in OSS checkout "MAY, when stuck on technique" (163-177), explicitly
   excluded for `track:adhoc`. The spec template says its Prior-art section exists
   "so `/loopkit:implement` can reach them" — a real contradiction. The shipped
   `prior-art-elevation` threaded the *checkout mechanism*, not the *derive-from
   default*.
2. **inception Step 4** (constitution derivation, `skills/inception/SKILL.md:113-120`)
   has no prior-art hook; only Step 3 (vision) says "Informed by the research".
   Binding tech-stack/principle rows are chosen with no "avoid X's approach" input.
3. **The `(feature: slug)` coupling is prose-only.** The first 8 `prior-art.md`
   section headers (lines 11-209) carry no tag; there is no grep/CI check; the
   "greenfield — no prior art" escape valve can satisfy the rule with no backing.

→ new seed **D3 (prior-art-threading)** + a grep-verifiable tag check folded into
`prior-art-backfill`.

### Design threading: read at Orient, dropped at the merge gate (F7, survived 2/1)

Design-in-the-loop (#12) *is* genuinely threaded at implement Orient
(`skills/implement/SKILL.md:132-136`: read the committed artifact, no share link —
not lip service). But the in-session **review gate** reseeds the subagent with
only the diff + constitution/CLAUDE.md (189-193) — the design artifact is absent,
so no coverage/conformance check at merge. This is the Flowmate silent-under-delivery
pattern relocated to the gate.

Corroboration (re-attributed per the F7 skeptic): the M12 design SVG itself broke
the no-status-marker rule and was fixed 5m35s *after* M12 closed (PR #132 /
`ca7cbb9`). The SVG rode in the *spec PR* (#115) and the miss is a **spec-acceptance
gate** miss, not the implement merge-gate mechanism — but that only widens the
finding: *both* gates are design-blind. → `design-coverage` re-scope: reseed the
design artifact into implement's review gate for UI-surface issues.

**Ceremony-creep guard (F7/B3, upheld).** The design skill's shipped wording is
clean — proportionality language ("materially clarify", "no artifact for
out-of-scope work") is reinforced, not lip-service, and `track:adhoc` is not a
plan cycle at all. The creep risk lives in the *`design-coverage` seed*, not the
shipped skill: a coverage audit applied beyond full-spec would make visuals
de-facto mandatory on small work. **Bound coverage enforcement to full-spec;
exempt `track:adhoc` and living-spec batches explicitly.** Sparring stays a
dialog, not a gate.

### SVG-over-Mermaid degrades the fidelity design exists to deliver (F8, survived 2/1)

`docs/design.md:50-58` mandates committed SVG over Mermaid and admits SVG renders
only in file/rich-diff view — raw XML in the PR text diff. How `/implement`
consumes the `.svg` (rendered vs raw XML) is unspecified (82-85). The
spec-acceptance reviewer can approve having seen only markup. `prior-art.md` marks
Mermaid the GitHub-native *default* with a known-and-solvable LLM-syntax guard.
The completeness critic sharpened this: the one real committed artifact
(`docs/design/loopkit-interpretation.svg`) is authored **in German** by the
`design.md` exception — unreviewable by non-German reviewers and degrading
LLM-as-reviewer at the gate. The refuting skeptic is right that this is partly
already-scoped (foundation-dedup names the German exception; design.md admits the
render caveat) — so this lands as **report-only**: reopen the medium decision and
ratify-or-remove the German exception in a `/plan` cycle (touches the
English-only convention → foundation edit).

### GATE MODEL adjudication (F9, survived 3/0 — the load-bearing telemetry finding)

**The milestone-QA gate is structurally rubber-stamped, and it let defects through.**
Verified independently against gh/git by all three skeptics:

- All **13** milestones closed **3–13 seconds** after their own archive PR merged
  (M1 5s, M9/M10/M11/M13 3s, M12 13s) — no window for the specced "review + smoke
  run".
- **2 of the only 3 fix commits in all history** trace to defects that rode
  instant-closed gates: M5's worktree leak (caught 2 days later via an unrelated
  `track:adhoc` ticket, `345e1ba`/#87) and unparseable SKILL.md YAML frontmatter
  shipped since bootstrap `da288ba`, undetected across **12** milestone gates for
  ~15 days until M13's validator caught it (`87fa655`/#134), never a human gate.
- Zero reverts, zero reopened issues in history — damage stayed contained, but
  the gate was **rubber-stamped, not skipped-then-caught-elsewhere**.

**Adjudication (the open question the mandate posed — decided):** **Keep exactly
two hard gates. Do NOT introduce a durable autonomy dial now.**

- The current ad-hoc prompt-to-skip already fails "reconstructable from GitHub
  alone" *in spirit*: you cannot reconstruct *why* 13 milestones closed in 3–13s
  with zero QA evidence. The fix is **`gate-evidence`, re-scoped**: post the
  derived QA scenarios + the human verdict — which MAY be an explicit recorded
  **"waived"** — as a milestone comment, and enforce **ordering**: the verdict is
  recorded *before* the archive PR merges, else the instant-close pattern posts
  evidence nobody read. This makes today's de-facto skipping *auditable* without
  changing the gate count, and satisfies the hard constraint (state stays
  reconstructable from GitHub; no headless/scheduler/API-key). Backed by Osmani
  comprehension-debt (QA-as-comment, no third gate).
- A durable autonomy dial (pre-authorising a gate via a GitHub-recorded decision)
  is defensible only **second-order**: it requires (a) a constitution amendment
  ("exactly two human gates" is binding → a foundation edit via `/plan`
  spec-acceptance) AND (b) the **trust boundary landing first** (Lens E). A
  pre-authorised autonomous milestone-close *widens* blast radius exactly where
  untrusted GitHub strings feed decisions — raising the dial is precisely the move
  that removes the circuit-breaker the state-machine note names. So the dial is
  **deferred behind D1 (trust-boundary) + a ratified amendment**, recorded as an
  open adjudication, not seeded.

---

## Lens C — Context & token efficiency

### Footprint is proportionate except one outlier (F13, survived 2/1)

Byte-measured (chars/3.8):

- **Always-loaded a target project pays:** 5 skill frontmatter descriptions =
  ~1075 tokens. Small and proportionate.
- **Always-loaded the loopkit repo itself pays:** CLAUDE.md + vision +
  constitution = ~3750 tokens. Matches the "~1 page each" cap.
- **On-demand outlier:** `docs/prior-art.md` at **~13.2k tokens (50.3 KB)** —
  ~3.8× the next-largest doc (`roadmap.md`; the earlier "~5.5×" was against
  `workflow.md`, skipping `roadmap.md` — corrected here). And `prior-art-backfill`
  *grows exactly this file* while `foundation-dedup` never touches it.
- **Uneven frontmatter:** `roadmap` (310 tok) and `plan` (250 tok) descriptions
  are ~1.5–1.8× their 170-token peers — together half the always-loaded target
  tax, restating body content in the always-loaded slug.

→ `prior-art-backfill` re-scope: add a **read-by-index-not-whole-file assertion +
a per-doc size budget** so the largest on-demand doc stays index-addressable as it
grows. `foundation-dedup` re-scope: slim the `roadmap`/`plan` frontmatter to a
one-line trigger+scope. **Open sub-question (skeptic-confirmed unresolved):**
`/plan` says "consult prior-art.md for this scope" and link "by concern-heading"
but never states index-vs-whole-file; `/implement` never reads `prior-art.md`
directly (it follows the spec's curated links). So implement's footprint does NOT
scale with `prior-art.md` size — the budget assertion is a `/plan`-side and
authoring-discipline concern, not an implement-context one.

### Wave-boundary compaction — a provably-safe native /compact point (F14, survived 3/0)

Known 2026 failure mode: after auto-compact an orchestrator's summary drops live
sub-agent state, so it thinks "no agents running" and re-spawns duplicates.
loopkit is **uniquely immune at the wave boundary**: step 3 "Await the whole
batch" (`skills/implement/SKILL.md:108`) is a hard synchronous barrier — no
subagents live — and after step 4 (109-114: re-read GitHub, `git pull --ff-only`)
all durable state is in GitHub; the frontier recomputes from GitHub on resume.
Compacting there loses nothing. Yet the skill gives zero compaction guidance, so
a long milestone either bloats or auto-compacts mid-wave (the unsafe point).

**Recommendation (minimal, reuse-native — do NOT reimplement the compactor):**
fold into `implement-resume-safety` — one line naming the wave boundary as the
safe native `/compact` point (never mid-wave), plus a CLAUDE.md "Compact
Instructions" section preserving only milestone target + current frontier. And
make the `gh pr list --head` idempotency check a **per-dispatch invariant**, not
just resume-time — that alone catches any post-compaction re-dispatch. Adopt
Praetorian "compact only at gated safe points"; AVOID Praetorian/dirge local
manifest/SQLite durable state (violates GitHub-only) — loopkit compacts safely
*precisely because* state lives in issues.

### Model tiers — codify as role-slots in the contract, never model names in skills (F15, survived 3/0)

The maintainer hand-prompts Opus-orchestrates / Sonnet-implements / Opus-reviews
every run; nothing in the skills or contract encodes it (grep confirms zero
`sonnet`/`opus`/`haiku` in `implement/SKILL.md` or `workflow.md`). Hardcoding
literal model names into skills would violate "hardcodes no tool" AND is maximally
volatile (Opus 4.8 → Fable 5 churn already happened). But the **abstraction is
durable**: the *roles* (orchestrator/implementer/reviewer) are stable; only the
model filling each is project-config. Native mechanism already exists (subagent
frontmatter `model` / resolution order / `opusplan`) — nothing to build.

→ new seed **D2 (model-tier-slots)**: an OPTIONAL `docs/workflow.md` field mapping
role→tier, default `inherit` when absent, passed to native subagent model
selection — model names live only in the per-project contract (exactly where the
Verify command already lives). Must warn: `CLAUDE_CODE_SUBAGENT_MODEL` globally
overrides the routing (documented foot-gun). This is the same discipline this
audit itself demonstrated. **Sharpens `ceremony-overhead` (C5):** 44/86 merged PRs
carried no behavior change, each still ran a fresh-context review subagent — if
that runs at Opus tier, ~half of review spend burned on no-behavior PRs. Route
no-source-change diffs to a cheaper reviewer.

---

## Lens E — State-machine trust boundary

Read against the 2026-07-08 state-machine note. The grep sweep of all skills +
`workflow.md` found **exactly one genuine instruction-following hit** and settled
the note's five facets on evidence.

### The one real structural gap: track:adhoc body as an unreviewed build contract (F11, survived 3/0)

`skills/implement/SKILL.md:44-58, 130-136`: a `track:adhoc` issue body is treated
as "the whole contract" (an instruction-following context, not data), is
auto-pickable in loop mode on board-Todo + label + deps-closed alone, and drives
solo to a squash merge with explicitly **no QA gate**. Untrusted text reaches both
instruction-selection AND autonomous state-change with no human circuit-breaker —
the exact leak the note names (facets 2 + 5). Grep confirms **no** `author_association`
/ trust / collaborator check anywhere on the adhoc pick path. → seed **D1**: frame
the body as an inert request to plan against, and require trusted authorship
(`author_association` OWNER/MEMBER/COLLABORATOR) or explicit human selection before
loop-mode auto-picks an adhoc issue. **loopkit's job, shipped skill.**

### Command-injection: latent in implement, LIVE (robustness) in plan (F10, survived 3/0)

The note's facet-1 (branch/commit/PR body built from issue title) is **not**
present in implement: branch names come from contract naming
(`skills/implement/SKILL.md:150-156`), PR/commit text is agent-authored (183-190).
But `skills/plan/SKILL.md:226-232` interpolates `<scope>`/`<step>`/spec text
**unescaped** into double-quoted `gh` shell strings (`gh api -f description=...`,
`gh issue create --body=...`) — grep found no escaping/quoting rule anywhere in the
file. A scope or spec containing backticks/`$()`/quotes breaks or executes the
command. This is a **live robustness defect on the human-authored write path**
today (not an attacker path — the input is planner-authored), and it is exactly
the shell-hygiene gap the note predicts. → fix inside **D1**; correct the note's
facet-1 severity to latent/preventive for implement, live for plan.

### The amplifier leg is already on: unscoped bypassPermissions (F12, survived 2/1)

`.claude/settings.json` sets `defaultMode: bypassPermissions` **globally/unscoped**,
while CLAUDE.md claims autonomy is "scoped to loopkit skills only" — and GitHub
`settings.json` has **no** skill-scoping mechanism, so the scoping claim is
unenforceable (inception's own SKILL.md admits this). The same unscoped bypass
ships via the inception template. Deny-list gaps: no `--force-with-lease` (only
`--force`/`-f`); no entry for `claude -p` / `--dangerously-skip-permissions` /
cron. The refuting skeptic is right on one point: the no-headless/API-key/cron
*grep-verifiable* rule **is** enforced — not by `settings.json` but by
`scripts/verify.sh`'s config-surface guard (a separate mechanism). So the accurate
claim is narrower: **deny-lists guard shell-exec only — necessary but not
sufficient**, and they cannot touch the F11 instruction path. → `permission-template-hardening`
re-scope: reconcile the unscoped-bypass-vs-"scoped"-claim contradiction, document
bypass as the amplifier leg, close the cheap gaps; **must NOT be sold as
trust-boundary closure** (that is D1). Note-split upheld: the per-repo comment-deletion
Action was discarded on purpose and must never enter the inception template; repo
hygiene (locking, blocking, public/private) is the target project's job, not
loopkit's.

### Willison adopt/avoid (all verified)

- **Adopt:** Rule-of-Two (human gate when untrusted-input + sensitive-access +
  external-comms coincide); plan-then-execute / dual-LLM (untrusted text is an
  inert request, structurally unable to trigger consequential actions);
  deterministic non-AI-judged guardrails (Lockdown-Mode style); keep the
  human-visible audit trail (GitHub state already provides this).
- **Avoid as futile:** injection detection/classification filters ("99% is a
  failing grade"); vendor "95-99% caught" claims; trained-in model resistance as
  *the* boundary — even Jun-2026 Willison "would not deploy where an injection
  could cause irreversible action".

### Coupling to the gate question

**Before any autonomy-dial pre-authorisation could responsibly ship, the trust
boundary must guarantee no untrusted GitHub-sourced string reaches
instruction-selection or a shell without a human between — concretely, the F11
adhoc path must be closed.** D1 is therefore a **hard predecessor edge** of any
dial. The two data-read sweep hits (`implement:78` deps parsing, `:81` milestone
marker) stay **latent** — matched as data, never executed; no fix owed. New
prior-art entry required: lethal-trifecta / Rule-of-Two (Willison; Meta).

---

## Lens D — Backlog adjudication

Verdicts on the 11 unplanned rows, folding A/B/C/E. No row killed — the 2026-07-02
seed batch holds up — but 9 of 11 re-scoped with concrete new mechanism, and 3 new
seeds added. Full staged text on branch `audit/2026-07-08-fable`.

| Row | Verdict | What changes (finding) |
|---|---|---|
| `implement-frontier-exits` | **keep** | Correctness bug, no lens contradicts; the F10/F11 latent data-reads (`implement:78/:81`) confirmed needing no extra fix. First of the implement spine. |
| `implement-resume-safety` | **re-scope** | + wave boundary as the only safe `/compact` point (never mid-wave); + `gh pr list --head` as a per-dispatch invariant catching post-compaction re-dispatch (F14). |
| `ceremony-overhead` | **re-scope** | + the model-tier dimension: a no-behavior PR must not run a top-tier reviewer; compounds with D2 (F15/C5). |
| `gate-evidence` | **re-scope** | Enforce **ordering** — verdict (incl. explicit "waived") recorded as a milestone comment *before* the archive PR merges, else evidence nobody read. Keep two hard gates (F9). |
| `design-coverage` | **re-scope** | + reseed the design artifact into implement's review gate for UI-surface issues; **bound coverage to full-spec**, exempt adhoc/living-spec (anti-creep) (F7). |
| `permission-template-hardening` | **re-scope** | + reconcile unscoped-bypass-vs-"scoped" contradiction; document bypass as amplifier; not trust-boundary closure. Subordinate to D1 (F12/E). |
| `repositioning` | **re-scope** | Lead on DAG-frontier + GitHub-state (already the recorded USP); cite Ronacher harness-loop; **fix the live README drift the critic found** (see below); resolve the `/batch` vs Dynamic Workflows open question before locking vocabulary (A1/A4/F3). |
| `prior-art-backfill` | **re-prioritise** | Re-verify the load-bearing USP verdicts (spec-kit stale, single-entry CCPM) FIRST — `/plan` links them as the spec decision substrate, so stale-in → stale-out. + the F2 software-factory avoid-anchor, Ronacher, the grep-verifiable coupling tags (F6), and the C13 size budget. Must precede repositioning + launch. |
| `dogfood-untested-claims` | **re-scope** | + record one concrete instance where an attended gate caught a defect an unattended loop would have merged — the launch's evidentiary core. No-inflation bar stays (F5/A9). |
| `launch-playbook` | **re-scope** | + a subscription-auth cost-control beat preempting the Jul-5 backlash (paired with D2); + a loop/software-factory name-disambiguation check (F4/A6/A8). |
| `foundation-dedup` | **re-scope** | + slim the `roadmap`/`plan` frontmatter descriptions (half the always-loaded target tax) (F13/C2); ratify-or-remove the German-diagram exception (F8). |

### New seeds (each backed by ≥1 prior-art concern)

- **D1 — trust-boundary** — constitution trust-boundary principle (read-discipline:
  GitHub text is inert data; shell-hygiene: never interpolate GitHub strings
  unquoted; Rule-of-Two human gate) + the `plan/SKILL.md:226-232` shell-hygiene fix
  + `track:adhoc` body-as-request framing and trusted-author/human-select gate on
  auto-pick. **Backing: NEW prior-art entry — lethal-trifecta / Rule-of-Two**
  (Willison 2025-06-13/16, 2025-09-26, 2025-11-02, 2026-06-22; Meta Rule-of-Two).
  Origin: F10, F11, F12, E + the 2026-07-08 note. **Hard predecessor of the
  autonomy dial and paired-before `permission-template-hardening`.**
- **D2 — model-tier-slots** — optional `docs/workflow.md` role→tier field
  (orchestrator/implementer/reviewer), default `inherit`, native subagent model
  selection; model names never in skill prose; warn on `CLAUDE_CODE_SUBAGENT_MODEL`.
  **Backing: NEW prior-art entry — opusplan / per-role model routing** (Anthropic
  model-config docs; Willison Jul-3 tier-delegation; practitioner top-orchestrates
  consensus). Origin: F15, A3, C5, A6.
- **D3 — prior-art-threading** — make `/implement` Orient read the spec's Prior-art
  verdicts by default (currently reachable only on a struggle); wire inception
  Step 4 constitution derivation to name the adopt/avoid it derives from.
  **Backing: constitution prior-art-substrate principle + `loopkit source-checkout
  precedent (PR #93)` + `loopkit dogfooding finding (Rack)`.** Origin: F6.

### Recommended sequencing

Security/foundation first. **D1 (trust-boundary) leads** — hard predecessor of any
autonomy change, and it fixes the live plan-side injection. In parallel:
`implement-frontier-exits` (correctness), then `implement-resume-safety`,
`ceremony-overhead`, `gate-evidence` serialize on `skills/implement/SKILL.md`.
`permission-template-hardening` follows D1. `prior-art-backfill` runs early on the
(disjoint) `prior-art.md` and MUST precede `repositioning` + `launch-playbook`,
which consume its USP verdicts. D3 and D2 slot after the implement spine.
`foundation-dedup`, `ceremony-overhead`, `repositioning` share the
vision/constitution spine — sequence, don't parallelize. `dogfood-untested-claims`
once two verified-disjoint phases exist, feeding `launch-playbook` last. **Defer
the autonomy dial behind D1 + a constitution amendment.**

---

## Open adjudications (for the human, not decided here)

1. **`/batch` vs Dynamic Workflows** (was F3). Is `/batch` still the current
   fan-out primitive to reuse, or does Claude Code Dynamic Workflows ("use a
   workflow") supersede it — and should a native adversarial-verification pattern
   back the in-session review gate? Resolve before `repositioning` locks vocabulary,
   else risk reimplementing a native primitive (loopkit's own don't). Needs a
   source read, not a guess.
2. **Autonomy dial.** Keep two hard gates (this audit's recommendation) vs a
   durable GitHub-recorded pre-authorisation. If pursued, it requires D1 + a
   ratified constitution amendment as predecessors — not seeded now.
3. **SVG-over-Mermaid + the German exception** (F8). Reopen the medium decision?
   Touches the English-only convention → `/plan` cycle; route via `foundation-dedup`
   or `design-coverage`.
4. **Unscoped `bypassPermissions`** (F12). Fixable via `settings.json` at all, or
   an inherent harness limitation to document rather than fix?
5. **adhoc auto-pick on public repos** (F11). GitHub labels alone cannot enforce
   trusted authorship — human-select-only for the adhoc lane on public repos?

## Completeness-critic gaps (not covered by this audit; recommend a follow-up pass)

The critic surfaced coverage holes the five lenses structurally could not see.
The material ones:

- **README.md was never read — and it ships two live constitution violations to
  every installer:** a "READY spec" (forbidden DRAFT/READY lifecycle state) and
  "/implement … select/claim" (forbidden claiming — the model is orchestration).
  This is present-tense drift on the primary onboarding surface, distinct from the
  F1 strategy question. **Folded into `repositioning`'s scope** (which already
  plans a `verify.sh` README-drift assertion — this confirms why it's needed).
- **A THIRD feedback note exists** (`2026-06-17-prior-art-roadmap-coupling.md`) —
  unread; documents a defect on the `inception --here` brownfield path, a flow
  stage no lens walked (the audit only walked greenfield inception).
- **The 13 archived specs** (`docs/specs/archive/`) were never read: whether
  milestone-QA is even *executable* depends on each spec's Verification section.
  F9's rubber-stamp verdict rests on close-timestamp telemetry alone.
- **No skill was ever EXERCISED.** All findings derive from static reads + git/gh
  telemetry + web research; the F10/F11 injection surfaces and the frontier-exit
  deadlock are asserted from prose, never behaviourally driven against adversarial
  inputs. A "verify by driving" pass would confirm or kill them.
- **The settings.json TEMPLATE** ships hardcoded `supabase db reset` deny rules — a
  project-specific value in a copied-verbatim template, violating the "templates
  contain no project-specific values" quality gate. This is exactly what
  `permission-template-hardening` targets — confirms the row.
- **Install surface is local-path only** (`marketplace.json` source `./`); remote
  installability is an unverified hard precondition for every launch finding.
- **The multi-orchestrator concurrency claim** rests on a documented, unmitigated
  branch/worktree collision path (`implement-resume-safety` confirms
  `git worktree add -b` can collide) — distinct from F5's path-existence gap.
