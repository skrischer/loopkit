# Spec: prior-art-elevation

> Created: 2026-07-02

Raise prior-art research from one principle among many to loopkit's core
substrate — the input every artifact (vision, constitution, architecture, each
spec, and the implementation) derives from — by sharpening its framing in
`docs/vision.md` and `docs/constitution.md`; and carry the ephemeral,
read-only OSS source-checkout already granted to `/loopkit:plan` into
`/loopkit:implement` as an available template for when a supposedly simple,
spec-backed change is struggling on technique.

## Outcome

- [ ] `docs/vision.md` names prior-art research as the substrate loopkit's
      artifacts derive from — one concise addition, not a new section; the ~1-page
      normative budget is preserved.
- [ ] `docs/constitution.md`'s existing prior-art principle is sharpened to
      substrate-level framing **and** its ephemeral-checkout clause is generalised
      from "`/plan` is encouraged" to cover **both** loops (`/plan` and
      `/implement`) — a reframe of the existing principle, **not** a new top-level
      principle; the ~1-page budget is preserved and the grep-verifiable licensing
      discipline (transient, read-only, outside the repo, discarded, never copied
      in) is retained.
- [ ] `skills/implement/SKILL.md` §3 (the per-issue subagent contract) gains an
      **optional** source-checkout step: when a supposedly simple, spec-backed
      change is struggling on technique, the subagent MAY do an ephemeral,
      read-only checkout of an OSS repo the spec's Prior-art section links, analyse
      the specific implementation, harvest facts (never copy expression), and
      discard it — then record any decision in the spec's Decision log.
- [ ] That implement step is explicitly bounded: it is a **technique** aid tried
      **before** the no-progress park, never a licence to resolve an open **design**
      fork — a genuine fork still escalates to planning (`needs:planning`), and a
      `track:adhoc` issue (no spec, no linked prior art) has no linked source, so
      the step naturally does not apply to it.
- [ ] The guardrails still hold: grep finds no headless flag, API key, scheduler,
      or local/retained state introduced by any of these changes; the checkout is
      transient and outside the repo, so it is never a second source of truth.

## Scope

### In scope

- `docs/vision.md` — one concise substrate statement for prior-art research.
- `docs/constitution.md` — sharpen the existing "Prior art is consulted and
  linked" principle to substrate framing; generalise its checkout clause to both
  loops. No new top-level principle.
- `skills/implement/SKILL.md` — add the optional source-checkout step to the §3
  subagent contract, with the technique-vs-design-fork boundary.

### Out of scope

- **`/loopkit:plan`'s existing source-checkout** (Step 2, PR #93) — already
  shipped; this scope generalises the constitution's rule to also sanction
  `/implement`, it does not re-author plan's step.
- **The roadmap-iteration foundation-doc sweep** (`#10`/`#98`: "five skills"
  count, the planning-edits corollary, the architecture component) — a separate,
  in-flight milestone that also edits `vision.md`/`constitution.md`; this scope
  serialises after it (see Constraints), it does not duplicate that sweep.
- **A persistent multi-repo reference manifest** (Repo-of-Repos) — rejected: it
  would be retained state / a second source of truth. The checkout stays
  transient and per-need.
- **Any new tooling, VM, or sandbox** — a read-only `git` checkout outside the
  repo is the whole mechanism (Manus validates disposable-by-default without
  loopkit needing infra).
- **`docs/architecture.md`** — no component/boundary/flow changes; the
  source-checkout is a subagent technique inside the existing §3 contract, not a
  new component.

## Constraints

Reference `docs/constitution.md` / `docs/vision.md` rather than restating.

- **Foundation docs stay ~1 page and carry no duplicated content** (constitution:
  Conventions — "one character per foundation artifact"). The elevation is
  **weight**, not bulk: sharpen the existing principle and add a single vision
  statement; no new top-level principle (mirrors the accepted roadmap-iteration
  decision to add a one-line corollary rather than a new principle).
- **Subscription auth only / GitHub-only durable state** (constitution,
  grep-verifiable) — the OSS checkout is ephemeral, read-only, outside the repo,
  and discarded; it introduces no headless flag, API key, scheduler, or retained
  local state.
- **Clean-room licensing boundary** — the checkout harvests facts/approaches for a
  recorded decision, never copies copyrightable expression into this repo; the
  durable output is the decision (in the spec's Decision log), not the code.
- **Clarification belongs to planning** (constitution) — the implement
  source-checkout aids a **technical** struggle only; a genuine **design** fork
  still escalates to planning via `needs:planning`. The step must not read as a
  way to settle open design questions by copying OSS.
- **No duplication across skills** — the binding **licensing rule** (transient /
  read-only / outside the repo / discarded / never copied in) lives once in the
  constitution's prior-art principle; each loop states its own **trigger** and a
  brief context-specific operational note (`/plan`: harden a planning decision,
  record in Prior decisions; `/implement`: unstick a technique struggle, record in
  the Decision log). The scope does **not** re-author `/plan`'s already-shipped
  Step 2 — the no-duplication check applies to the prose **this diff introduces**,
  not to `/plan`'s pre-existing text.
- **Shared-file serialisation** — this scope edits `docs/vision.md` +
  `docs/constitution.md`, which the in-flight roadmap-iteration milestone (`#10`,
  issue `#98`) also edits. Per loopkit's own dogfood rule (shared files serialise
  milestones), this milestone carries `Depends on milestone: #10` and its
  foundation-doc issue carries `Depends on: #98`. This is an honest correction to
  the roadmap "Features" note that assumed these features touch disjoint files.
- Skills/docs are Markdown (no build step); Verify is `none yet`, so this scope
  is checked at the milestone-QA gate (review + a smoke read of the changed
  artifacts + the grep guardrails).

## Prior art

- [Prior-art as the substrate for every artifact — research + adopt/avoid + sources](../prior-art.md#prior-art-as-the-substrate-for-every-artifact--research--adoptavoid--sources-feature-prior-art-elevation) — the concern this scope implements: the thesis that every loopkit artifact is downstream of a thick prior-art pass, and the move to carry `/plan`'s source-checkout into the implement loop.
  - **loopkit source-checkout precedent (PR #93)** — the granted `/plan` mechanism this generalises to `/implement`; ADOPT source-level analysis as a first-class loop input.
  - **Clean-room design + MALUS (satire)** — the licensing line: transient, read-only, harvest facts, never copy expression; the durable output is the decision.
  - **Manus — per-execution isolated sandbox** — ADOPT disposable-by-default; DIFFERENTIATE: a read-only checkout outside the repo is the whole mechanism, no VM/daemon (stays subscription-only).
  - **Repo-of-Repos** — ADOPT the isolation guarantee (no accidental commit of reference code); AVOID a persistent manifest as a second source of truth (out of scope above).

## Human prerequisites

- none — every change is in-repo Markdown; no secrets, accounts, or external
  provisioning. The OSS checkouts the implement template performs are public,
  read-only, and unauthenticated.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Elevation is a **reframe** of the existing constitution prior-art principle + one vision statement — no new top-level principle, no new section | Foundation docs are permanently loaded, ~1-page budget; "elevate" means weight, not bulk (mirrors roadmap-iteration's accepted one-line-corollary discipline) | 2026-07-02 |
| The binding licensing rule stays once in the constitution's prior-art principle (shared home); `/implement`'s §3 states its own trigger + a brief operational note and points to the principle — it does not restate the rule | "No duplication across skills"; the constitution already owns the rule — generalise it once. `/plan`'s already-shipped Step 2 carries its own operational note too, so the no-duplication check is scoped to this diff, not a re-audit of `/plan` | 2026-07-02 |
| The `/implement` source-checkout is **optional (MAY)** and tried **before** the no-progress park | Proportionality — it is an available technique aid, not a mandatory step; it does not replace the identical-failure-twice park | 2026-07-02 |
| The step aids a **technical** struggle only; a **design** fork still escalates to planning (`needs:planning`); a `track:adhoc` issue has no linked source so it does not apply | "Clarification belongs to planning" — the checkout must not become a way to resolve open design questions by copying OSS | 2026-07-02 |
| `Depends on milestone: #10`; the foundation-doc issue `Depends on: #98` | This scope shares `vision.md` + `constitution.md` with the in-flight roadmap-iteration milestone; shared files serialise (loopkit's own dogfood rule) | 2026-07-02 |
| No persistent reference manifest; no VM/sandbox | Retained cross-repo state would be a second source of truth (Repo-of-Repos AVOID); a transient read-only checkout is sufficient (Manus) | 2026-07-02 |
| OPEN — how prominent the elevation is in vision + constitution (light reframe of the existing principle + one vision line vs. a stronger dedicated statement) | resolved at the spec-acceptance gate — a calibration call on two permanently-loaded normative docs | — |

## Tracking

- Milestone: [prior-art-elevation](<milestone-url>) — created once this spec merges
- Issues: created from this spec once it is merged (one per implementable step)

## Verification

Verify is `none yet`; this list is the human milestone-QA script.

- [ ] `docs/vision.md` reads with prior-art research named as the substrate loopkit's
      artifacts derive from, in one concise addition; the file stays ~1 page.
- [ ] `docs/constitution.md`'s prior-art principle reads at substrate weight and its
      checkout clause covers **both** `/plan` and `/implement`; no new top-level
      principle was added; the licensing discipline (transient / read-only / outside
      the repo / discarded / never copied in) is intact.
- [ ] `skills/implement/SKILL.md` §3 has an optional source-checkout step: trigger =
      a supposedly simple, spec-backed change struggling on technique; ephemeral
      read-only checkout of an OSS repo the spec links; harvest facts, discard,
      record the decision in the spec's Decision log.
- [ ] That step states the boundary: technique aid before the no-progress park; a
      design fork still escalates `needs:planning`; it does not apply to a
      `track:adhoc` issue.
- [ ] grep guardrails pass: no headless flag (`claude -p`,
      `--dangerously-skip-permissions`), API key, scheduler/cron, or retained local
      state introduced by the diff.
- [ ] The prose **this diff introduces** does not restate the constitution's
      licensing rule: the constitution owns the rule; `/implement`'s new §3 step
      states only its trigger + a brief operational note and points to the
      principle. (Scoped to the diff — `/plan`'s pre-existing Step 2 is not
      re-audited.)

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| "Elevation" bloats the ~1-page foundation docs | Decided: a reframe + one line, no new principle/section; the QA script checks the files stay ~1 page |
| The implement source-checkout is read as a licence to resolve design forks by copying OSS | Explicit boundary in the step (technique-only; a design fork escalates `needs:planning`) + the clean-room licensing rule |
| Shared-file collision with roadmap-iteration (`vision.md`/`constitution.md`) | `Depends on milestone: #10` + issue-level `Depends on: #98` serialise the edits |
| The mechanism gets duplicated into the skill, drifting from the constitution rule | Decided home = the constitution principle; the skill points to it; a Verification item greps for duplication |

## Decision log

- 2026-07-02: Spec drafted. Decisions sorted precedent/constraint/open; the
  source-checkout mechanism, licensing boundary, and disposability come straight
  from the `prior-art-elevation` concern (PR #93, Clean-room/MALUS, Manus,
  Repo-of-Repos). One genuinely-open item carried to the gate: the prominence of
  the foundation-doc elevation.
- 2026-07-02: In-session spec review (code-reviewer) returned APPROVE, no blocking
  findings. Two non-blocking: (1) the "no duplication" claim/Verification was
  unfalsifiable because `/plan`'s shipped Step 2 already carries operational
  detail — scoped the claim + Verification item 6 to the prose THIS diff
  introduces; (2) `docs/roadmap.md`'s "disjoint files" Features note is now stale —
  corrected in this milestone's Step-8 roadmap PR (a one-line honesty fix, not a
  status marker).
