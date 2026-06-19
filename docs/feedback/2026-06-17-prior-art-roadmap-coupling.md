# Feedback — couple prior-art research to roadmap phases

> Source: dogfooding `/loopkit:inception` on the **Rack** project
> (`../rack`, `skrischer/rack`) on 2026-06-17. Captures a real gap in the
> prior-art feature and proposes concrete `skills/inception/SKILL.md` changes.

## TL;DR

The roadmap and the prior-art document are currently coupled in **one
direction only** — the skill says prior art "may spawn roadmap items" (Step 2),
but nothing says the reverse: **new roadmap phases need prior-art entries to
seed their specs.** When we extended the roadmap in a second (`--here`) run,
the skill happily added phases 7–13 and stopped — prior art was left untouched.
The user caught it. `/loopkit:plan` reads prior art to seed specs, so a phase
with no prior-art concern is a phase whose spec starts from nothing.

## What happened (timeline)

1. **First inception (greenfield).** Produced the full foundation for Rack,
   including a prior-art doc focused on the USP (open programmable training data
   + a hosted MCP + live socket sync): `wger`, `wger-mcp`, read-only fitness
   MCPs, native FOSS trackers, remote-MCP auth, real-time sync patterns. Good
   coverage — because every USP concern was researched in Step 2.

2. **Second inception (`--here`, brownfield).** The user wanted to add roadmap
   entries for *standard* fitness-app features that the USP-first roadmap had
   deferred: rest/session timers, push notifications, overviews, exercise
   execution detail with images, etc. The brownfield path correctly diagnosed
   the gap as "roadmap is missing phases", ran **Step 6 (roadmap)** only, and
   appended phases 7–13. It did **not** run **Step 2 (prior-art)** for the new
   concerns — only a one-line touch to the existing wger entry (images).

3. **The catch.** User: *"Gar keine prior-art für die neuen Features
   hinzugekommen, um beim Planning die Specs daraus zu speisen?"* Exactly right.

4. **The fix (manual).** A focused websearch pass added prior-art entries per
   new concern — exercise media, Android rest timers, guided session player,
   Supabase+FCM push, Compose charts, 1RM formulas — each with a verdict and
   ADOPT/AVOID harvest, and one genuine licensing fork surfaced
   (free-exercise-db: data is Unlicense and reusable, **images are unlicensed**
   and must not be shipped; wger CC-BY-SA stays the primary image source).

## Why a second inception was the right tool

`--here` brownfield mode is designed for exactly this: an idempotent
gap-closure pass that extends existing artifacts instead of redoing the whole
foundation. It read the current state (only the inception commit, no `/plan`
run yet, roadmap phases still `—`), reported a focused gap, and touched only the
roadmap. That part worked well. The problem is purely that "extend the roadmap"
should have *implied* "and research prior art for the new phases."

## What got better as a result

- Phases 7–13 each now map to at least one prior-art **concern** with a
  verdict and ADOPT/AVOID notes, tagged with the phase they feed
  (e.g. `## Exercise media … (Phase 7)`).
- `/loopkit:plan` can now seed each standard-feature spec from concrete
  references and decisions instead of inventing them — e.g. "rest timer runs in
  an Android foreground service", "push via Supabase Database Webhook → Edge
  Function → FCM HTTP v1; local notifications for timers/reminders", "Vico for
  Compose charts", "Epley/Brzycki for 1RM".
- A real, spec-shaping constraint was found *before* planning, not during it
  (the free-exercise-db image-licensing fork). That is the whole point of
  prior art feeding specs.

## Proposed changes to `skills/inception/SKILL.md`

1. **State the reverse coupling in Step 2.** Step 2 already says prior art "may
   spawn roadmap items". Add the dual: *every plannable roadmap phase must be
   backed by at least one prior-art concern (or an explicit "greenfield — no
   prior art" note), because `/loopkit:plan` seeds specs from prior art.*

2. **Add a prior-art step to Step 6 (roadmap).** After deriving/extending the
   phase list, run a prior-art pass (Step 2's research + per-concern entries)
   for any phase concern not already covered. Index the entry by concern and
   tag the phase it feeds. This makes prior art and roadmap evolve together.

3. **Make it explicit in the brownfield rule.** "Run ONLY the steps that close
   gaps" misled here: closing the roadmap gap silently skipped the prior-art
   step the new phases created. Add: *adding a roadmap phase opens a prior-art
   gap for that phase's concern — close both, not just the roadmap.*

4. **Add a readiness-checklist item (Close out).** Something like:
   `[ ] Every roadmap phase has prior-art coverage to seed its spec (or an
   explicit greenfield note).` This is what would have caught the miss
   automatically, in both greenfield and brownfield runs.

5. **Optional: a light phase↔concern convention.** We used a `(Phase N)` tag in
   the prior-art concern headers and phase intents that name their references.
   Worth codifying as the convention so `/loopkit:plan` can resolve "prior art
   for phase N" deterministically.

## Evidence (in `../rack`)

- `docs/roadmap.md` — phases 7–13 appended (commit `b45c408`).
- `docs/prior-art.md` — per-concern entries for phases 7–13 (commit `1d6c70b`),
  including the free-exercise-db data-vs-images licensing fork.
- The miss was between those two commits: the roadmap landed first with no
  matching prior art, which is the exact gap this feedback targets.
