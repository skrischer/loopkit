# Spec: foundation-dedup

> Created: 2026-07-08

Reduce the permanently-loaded context by de-duplicating the flagship docs — the
constitution's design principle shrinks to its binding core (medium/mechanism
detail moves to `docs/design.md`), the vision's most duplicative Scope bullet
becomes a pointer, the drifting hard-limit enumerations single-source to
`.claude/settings.json`, and the oversized `roadmap`/`plan` SKILL.md frontmatter
descriptions slim to match their peers. Also removes `docs/design.md`'s
German-diagram exception (English-only) and corrects `docs/architecture.md`'s
stale plan-cycle flow. The foundation-doc edits are authored here and ratified at
the spec-acceptance gate.

## Outcome

- [ ] `docs/constitution.md`'s design principle shrinks to its **binding core**
      (optional; triggered by UI surface OR a decision-clarifying visualisation;
      reviewed at the spec-acceptance gate; reads `docs/design.md`; hardcodes no
      tool/medium; durable form is a committed file, never an external-tool URL) —
      the **medium enumeration + sparring-vs-gate elaboration are dropped in favour
      of a pointer to `docs/design.md`**, which (with its template) already owns the
      medium options and mechanism. No binding rule is lost; grep-verifiable markers
      preserved.
- [ ] `docs/vision.md`'s design Scope bullet becomes a **one-line pointer** to the
      constitution's design principle (the most duplicative bullet); the other
      Scope bullets stay (they are scope statements, not duplications).
- [ ] The **hard-limit shell-command enumeration** (`rm -rf`, force-push, hard
      reset, `git clean -f`, `git branch -D`, `git checkout .`, `git restore .`)
      is single-sourced to `.claude/settings.json`: `README.md` and
      `skills/inception/SKILL.md` reference "the constitution hard limits (see
      `.claude/settings.json`)" instead of re-enumerating (CLAUDE.md already
      points there).
- [ ] The `roadmap` and `plan` SKILL.md **frontmatter descriptions** slim to a
      one-line trigger+scope matching the ~640-char peers (they are ~1160 / ~960
      today) — cutting the always-loaded per-session tax every target project pays.
- [ ] `docs/design.md`'s **German-diagram exception is removed** — English-only
      per the binding convention (the SVG-vs-Mermaid *medium* question stays
      deferred; the one existing German exemplar SVG is flagged for a follow-up
      re-authoring, out of scope here).
- [ ] `docs/architecture.md`'s plan-cycle flow is corrected to the folded order
      (spec-acceptance gate -> milestone + roadmap link on the spec branch ->
      merge -> issues), matching the `ceremony-overhead` change already on `main`.
- [ ] Verify passes; no normative rule is lost — dedup relocates or points, never
      deletes a binding rule; the permanently-loaded surface is measurably smaller.

## Scope

### In scope

- **Spec PR (foundation edits, ratified at the gate):** `docs/vision.md` (design
  bullet -> pointer), `docs/constitution.md` (design principle shrinks to its core
  + points to `docs/design.md` for medium/mechanism), `docs/architecture.md`
  (plan-cycle flow fix), and `docs/design.md` (German-exception removal) — kept in
  one PR so the design-principle dedup and its pointer target stay consistent.
- **Issue A:** hard-limit single-sourcing in `README.md` + `skills/inception/SKILL.md`.
- **Issue B:** slim `skills/roadmap/SKILL.md` + `skills/plan/SKILL.md` frontmatter
  descriptions.

### Out of scope

- Re-authoring the German exemplar `docs/design/loopkit-interpretation.svg` into
  English — the exception removal is the policy change; re-authoring the SVG is a
  design task flagged as a follow-up (a `track:adhoc` or design cycle), not this
  dedup.
- The **SVG-vs-Mermaid medium** decision — deferred (stays a per-project
  `docs/design.md` choice); this phase only removes the *language* exception.
- Any semantic change to a binding rule — this is dedup (relocate/point), never a
  weakening. No principle is dropped.
- Aggressive re-cutting of the remaining vision Scope bullets — only the
  clearly-duplicative design bullet is pointered; the rest are scope statements
  vision must keep.

## Constraints

- Foundation-doc edits (`vision`/`constitution`/`architecture`) are authored in
  this spec PR and ratified at the spec-acceptance gate (constitution corollary),
  never in `/loopkit:implement`.
- **No binding rule is lost:** the constitution stays grep-verifiable for every
  principle it asserts; detail moves to `docs/design.md`, it is not deleted.
- One character per foundation artifact — the dedup enforces the constitution's
  own "no content duplicated across foundation artifacts" Don't on itself.
- English-only (the binding convention) — the German exception contradicted it.
- Proportional; GitHub-only state; subscription-auth (constitution).

## Prior art

- `none directly relevant` — this is an internal-hygiene dedup of loopkit's own
  docs, not a design decision with external precedent. The governing input is the
  constitution's own **"one character per foundation artifact / no content
  duplicated across foundation artifacts"** rule (the dedup applies it to itself)
  and the 2026-07-08 audit Lens C (permanently-loaded token budget).

## Human prerequisites

- none — doc, contract, and skill-frontmatter changes only.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| The constitution design principle shrinks to its binding core; medium/mechanism detail moves to `docs/design.md` | the constitution is permanently loaded and binding — it keeps the rule, `docs/design.md` (read on demand) keeps the how; applies the "no duplication across foundation artifacts" Don't to itself | 2026-07-08 |
| Only the clearly-duplicative vision **design** Scope bullet becomes a pointer; the other Scope bullets stay | they are scope statements ("what/why"), not verbatim duplications — over-cutting would harm the normative vision doc for marginal savings | 2026-07-08 |
| Hard-limit shell-command enumeration single-sources to `.claude/settings.json`; `README`/`inception` point to it | the enumeration drifts across docs; settings.json is the enforced source (deny rules); CLAUDE.md already points there | 2026-07-08 |
| Slim `roadmap`/`plan` SKILL.md frontmatter to a one-line trigger+scope (~640 chars, peer-matching) | they are ~1.5-1.8x their peers and are the highest-leverage always-loaded per-session tax every target project pays | 2026-07-08 |
| Remove the `docs/design.md` German-diagram exception (English-only); defer the SVG-vs-Mermaid medium; flag the German exemplar SVG for follow-up re-authoring | the binding convention is English-only; the exception was never sanctioned; re-authoring the SVG is a separate design task | 2026-07-08 |
| Correct `docs/architecture.md`'s stale plan-cycle flow to the folded order | `ceremony-overhead` changed the flow (milestone + roadmap link on the spec branch, one merge); architecture drifted and is a foundation doc, fixed here in a ratified plan cycle | 2026-07-08 |

## Tracking

- Milestone: created at acceptance (folded flow); one merge carries spec +
  foundation edits + roadmap link.
- Issues (two, **parallel** — disjoint files, one wave; the foundation-doc edits
  ride the spec PR itself, not an issue):
  - **A** — hard-limit single-sourcing: `README.md` + `skills/inception/SKILL.md`.
  - **B** — frontmatter slim: `skills/roadmap/SKILL.md` + `skills/plan/SKILL.md`.

## Verification

- [ ] Verify passes (`bash scripts/verify.sh`).
- [ ] `docs/constitution.md` still asserts the design principle's binding core
      (optional / trigger / gate / reads design.md / no-hardcoded-tool /
      committed-file-not-URL) grep-verifiably, but the constitution no longer
      enumerates media — the medium options live in `docs/design.md` + its
      template (grep: the constitution's design principle names no specific
      medium).
- [ ] `docs/vision.md`'s design Scope bullet is a one-line pointer to the
      constitution; the other Scope bullets are intact.
- [ ] `README.md` and `skills/inception/SKILL.md` no longer re-enumerate the full
      hard-limit shell list — they point to `.claude/settings.json` (grep).
- [ ] `skills/roadmap/SKILL.md` and `skills/plan/SKILL.md` frontmatter
      descriptions are each ≤ ~700 chars (peer-matching), still a valid single
      YAML string that `claude plugin validate` accepts.
- [ ] `docs/design.md` contains no German-language exception; the relocated
      design-mechanism detail is present.
- [ ] `docs/architecture.md` plan-cycle flow reads milestone+roadmap-link-on-spec-branch
      -> merge -> issues (folded order).
- [ ] No diff introduces local state, an API key, a headless flag, or a scheduler;
      no binding rule is dropped (config-surface guard + review).

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Dedup silently drops a binding rule | the review + gate check each moved rule survives (in constitution as core, in design.md as detail); Verify's grep-checkable markers preserved |
| Slimming the frontmatter loses a real trigger cue | keep the one-line description a true trigger+scope (what invokes it + what it does), matching the peer skills that already work |
| Removing the German exception orphans the exemplar SVG | flagged explicitly as a follow-up re-authoring; the exception removal is the ratified policy, the SVG fix is separate |
| The constitution shrink over-thins a principle | conservative — only the design principle (the one the roadmap named) shrinks; detail relocates to design.md, nothing is deleted |

## Decision log

- 2026-07-08: Drafted from the `foundation-dedup` roadmap seed (2026-07-02 batch +
  2026-07-08 audit re-scope: frontmatter slim + German-exception removal). No
  external prior art — governed by the constitution's own no-duplication Don't and
  Lens C's permanently-loaded budget. The foundation-doc edits (vision,
  constitution, architecture, design.md) ride this spec PR and are ratified at the
  gate per the corollary; two post-merge issues (hard-limit single-sourcing;
  frontmatter slim) run parallel on disjoint files. Also corrects the
  architecture plan-cycle flow that `ceremony-overhead` left stale (a foundation
  doc, fixed here in a ratified cycle rather than drifting). Planned via the
  folded flow.
