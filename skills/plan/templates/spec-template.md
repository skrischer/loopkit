# Spec: [Feature/Phase Name]

> Created: YYYY-MM-DD

One-sentence summary of what this spec delivers. This spec carries no lifecycle
state — acceptance is the spec merged on the default branch with a milestone and
issues, and all progress (in progress, done, blocked) lives in the GitHub issues
and milestone. A completed spec is moved to `docs/specs/archive/`.

## Outcome

What is true when this work is done? Write observable, verifiable outcomes — not
activities. These are the spec's done-criteria, not a progress tracker: check a
box only when the outcome holds end-to-end. Step-by-step progress lives in the
issues, never here.

- [ ] Outcome 1
- [ ] Outcome 2

## Scope

### In scope

- What this spec covers

### Out of scope

- What this spec explicitly does NOT cover (and why, if not obvious)

## Constraints

Technical constraints, existing decisions, and assumptions that affect
implementation. Reference the constitution rather than restating it.

- Constraint 1
- Constraint 2

## Prior art

Relevant entries from `docs/prior-art.md` that inform this scope. `/loopkit:plan`
consults the prior-art doc — indexed by concern — and links the entries that bear
on this spec here, so `/loopkit:implement` can reach them. List each by its
concern-heading as a link, with a one-line note on why it is relevant. Write
`none relevant` explicitly if prior art has nothing for this scope.

- [<Concern heading>](../prior-art.md#<concern-heading>) — why it is relevant here

## Human prerequisites

Everything only a human can provide for this milestone — secrets, external
provisioning, dashboard configuration, accounts. Enumerated at planning time
and delivered or confirmed by the human at the spec-acceptance gate, so the
implement loop can run the whole milestone without interruption. Write `none`
explicitly if there are none.

- [ ] e.g. `SOME_API_KEY` present in `.env.local`
- [ ] e.g. third-party dashboard setting X configured

## Prior decisions

Decisions already made that the implementor must respect. Include rationale so
edge cases can be judged. Mark any genuinely-open point explicitly until it is
resolved at the spec-acceptance gate.

| Decision | Rationale | Date |
|---|---|---|
| Example | Why | YYYY-MM-DD |
| OPEN — <question> | resolved at the spec-acceptance gate | — |

## Tracking

The decomposition into steps lives as GitHub issues, not in this file — one
issue per step, grouped under a milestone. This spec owns the design; the issues
own progress. Do not duplicate the step list here.

- Milestone: [Phase/Feature name](<milestone-url>)
- Issues: created from this spec once it is merged (one per implementable step)

Each issue references this spec path in its body.

## Verification

How does Claude Code (or the developer) know the entire spec is complete? Use
the project's Verify/Test/Build commands from `docs/workflow.md`. This list
doubles as the script for the human milestone-QA gate: while the project's Test
command is `none yet`, list every acceptance item no machine check covers —
they are checked by the human here.

- [ ] Verify passes
- [ ] [Specific behavioral test]
- [ ] [Specific edge case handled]

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Risk 1 | How to handle it |

## Decision log

Decisions made during implementation. Claude Code adds entries here as work
progresses.

- YYYY-MM-DD: [Decision and rationale]
