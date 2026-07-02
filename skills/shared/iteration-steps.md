# Shared iteration steps

> Plugin-shipped shared reference — NOT a skill. The generic, reusable
> methodology for the three steps both `/loopkit:inception` (one-time bootstrap)
> and `/loopkit:roadmap` (ongoing iteration) perform: the prior-art challenge,
> the architecture seed, and roadmap seeding. Each calling skill supplies its own
> gates, ordering, and framing; this file holds only the invariant method,
> authored once so no step prose is duplicated across skills. It reaches into no
> skill's internals and no skill reaches into another's — the shared artifact is
> the sanctioned handoff.

## Prior-art challenge

Prior art is not just catalogued — it CHALLENGES the work. Derive the challenge
questions from the goal (or the raw idea) and answer them from the findings:

- **Existence** — does an existing tool already solve this well enough to make it
  redundant? The honest output may be "reuse X, don't build."
- **USP** — in one sharp sentence, what justifies this that prior art does not
  already cover?
- **Differentiation / non-goals** — where does this deliberately stop where others
  go on? Feeds scope and non-goals.
- **Idea harvest** — per reference: what works, what fails, did we account for the
  same concerns; what to adopt, what to avoid on purpose.

The challenge answers are not a passive document — they feed scope/non-goals and
may spawn roadmap items. Conversely, every plannable roadmap phase must be backed
by at least one prior-art concern (or an explicit `greenfield — no prior art`
note), because `/loopkit:plan` seeds specs from prior art.

**Research mode — ASK, never assume.** Present the choice before researching:

- **deep-research** — the deep-research skill: deep, multi-source. COST: it fans
  out ~100 subagents that inherit the session model — run on a cost-appropriate
  model (e.g. Opus); a heavy model (Fable) multiplies the cost ~100x and can
  exhaust the session limit. Switch the session model before triggering, not
  during.
- **websearch** — a handful of focused WebSearch/WebFetch lookups; cheap, fast,
  enough for a landscape comparison.
- **none** — offer ONLY when `docs/prior-art.md` already exists with relevant
  entries: reuse what is there, skip fresh research.

Look for exemplary, preferably OSS projects that solve the problem or its
sub-problems. Fill `docs/prior-art.md` from the template: per entry concern, repo
+ concrete path, license, verdict (reuse / reference-only / avoid + why), date,
and the harvest notes (adopt / avoid) in Notes. Living document — gaps are fine.
Tag each concern's `##` header with the phase it feeds — `## <Concern> (Phase N)`
for a roadmap P-number or `## <Concern> (feature: <slug>)` for a Features-table
row — so `/loopkit:plan` can resolve "prior art for phase N" deterministically.

## Architecture seed

A component map, responsibilities and boundaries, the most important data/control
flows, and a "where does new code go" guide -> `docs/architecture.md`. Greenfield:
this is a seed, not a final design.

## Roadmap seeding

The roadmap is the content hand-off to `/loopkit:plan`: the sequenced queue of
phases it picks the next one from. Break the work into ordered, plannable phases,
derived from the scope and the architecture seed. From the roadmap template into
`docs/roadmap.md`:

- A phase-overview table (Phase, Name, Spec, Milestone). Specs and milestones are
  created later by `/loopkit:plan`, so both columns start `—`.
- Then run a prior-art pass: for any phase concern not already covered in
  `docs/prior-art.md`, run the prior-art challenge (same research-mode choice) and
  add a per-concern entry, indexed by concern and tagged with the phase it feeds —
  or record an explicit `greenfield — no prior art` note for that phase.
- A one-line north star tying back to the vision.

No status markers in the roadmap — progress lives in the GitHub issues and
milestones each phase links to; specs carry no lifecycle state either, a spec is
accepted once merged on the default branch with a milestone. Living document;
`/loopkit:plan` keeps the links current.
