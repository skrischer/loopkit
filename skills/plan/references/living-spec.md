# Plan — living-spec milestone

> Paths in this file are relative to this file.

> Read only when the human opened an ongoing theme (the living-spec track,
> `../SKILL.md` §1). Same chain as full-spec acceptance (`acceptance.md`), with
> two differences: it is human-initiated and its milestone stays open.

- **Acceptance is the no-lifecycle model** — exactly as in the spec-acceptance
  gate: a merged spec on the default branch + an open milestone. The spec
  carries no lifecycle header to flip; the open milestone is the signal the
  theme is active. Nothing about acceptance differs from full-spec.
- Create the milestone (`acceptance.md` §1 step 1) and leave it open; issues for a re-run follow `acceptance.md` §2; do not plan an
  end state for it. Mark it living-spec so `/loopkit:implement` can tell the
  tracks apart at the QA gate: put a `Track: living-spec` line in the milestone
  description (a full-spec milestone has no such line). Seed it with the issues
  known now and keep accreting issues into the same open milestone as the theme
  grows — re-run this skill with the same scope to add more (the merged spec
  already covers them). Use `Depends on: #N` for ordering as usual.
- It is not a roadmap phase: skip the roadmap-link commit (`acceptance.md` §1
  step 2) — do not add it to the roadmap overview's phase table, and never fill a
  current-focus/status marker. Loop-mode never sees it, so the loop terminal
  state is unaffected.
- It is never archived or closed by the QA gate. Closing one of its issues
  archives nothing; the milestone and spec stay live. `/loopkit:implement`
  handles the QA-gate behavior (per-batch summary, no archive) — this skill's
  job is to open the milestone and keep accreting issues into it.
- Close-out exception: a living-spec milestone never closes out. Its milestone
  stays open and accretes issues; the QA gate runs per closed-issue batch
  without archiving the spec or closing the milestone. There is no "done"
  signal for an ongoing theme.

End of living-spec.
