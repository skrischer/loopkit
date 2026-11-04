# Review bound

> Paths in this file are relative to this file.

> Plugin-shipped shared reference — not a skill. The bound on an agent review:
> which findings withhold a merge, how rounds run, where the rest goes. Read it
> before briefing a reviewer, running a review round, or ending a review gate.
> The round count and every classification are in-session memory, never a label
> or a file.

## Finding classes

- **Blocking.** A violation of the issue's `Acceptance:`, the spec, the
  constitution, the project's contract (`docs/workflow.md`, and `docs/design.md`
  or `docs/release.md` where the skill reads them) or the `CLAUDE.md` rules the
  reviewer is seeded with; a red Verify; a defect in reachable behavior the
  change adds or alters; or a doc the change makes wrong. It withholds the merge
  in whichever round it is seen, wherever it sits in the change.
- **Non-blocking.** Any other finding, including polish and hardening against
  unreachable states. It is marked `Nit:`, raised only in round 1, never fixed
  in the PR it was found in, and recorded in a `Review notes` section of the PR
  body before the merge.
- **Follow-up.** A finding outside the change's scope with a concrete failure
  scenario in a real run. It becomes its own issue (below). Without a concrete
  scenario it is a `Review notes` entry.

## Rounds and verdict

- Round 1 reviews the whole diff. A later round checks the fixes since the
  reviewed head and raises only blocking findings. There is no round cap; the
  no-progress rule parks the same blocking finding raised twice in a row.
- The verdict's first line is `VERDICT: REQUEST_CHANGES` only with a blocking
  finding, otherwise `VERDICT: APPROVE`, with the non-blocking findings and
  follow-ups listed. The reviewer brief asks for findings in the three classes
  and states this verdict rule.
- Round 2 onward continue the round-1 reviewer (SendMessage) with the fix diff
  (`git diff <reviewed-sha>..HEAD`) and the open blocking findings, where the
  gate's runner spawned round 1 itself and can still reach it. Otherwise (no
  SendMessage tool, the agent id lost to a compaction, a send error, or a
  fix-dispatch subagent) a fresh reviewer gets the full change diff
  (`git diff <base>...HEAD`), the fix diff and the open blocking findings, so a
  defect round 1 missed is still in view.
- The fix brief carries the open blocking findings, the non-blocking findings
  and follow-ups collected so far, the reviewed head SHA and the round number.
  A gate whose brief carries findings runs as a later round.
- When round 1 ran on the cheaper no-source-change tier and the fix touches
  source or config, the next round is a fresh reviewer at the full tier.
- Floor: no contract loosens the bound. A project may tighten it: more blocking
  classes, or every finding blocks.

## Ending the gate

Whoever runs the gate when it ends (merge, park or escalation) writes the
`Review notes` and files the follow-ups once.

- **Follow-up issue.** One per finding: a `fix:` title and a `Goal:` /
  `Acceptance:` / `Depends on: none` / `Spec:` body (the milestone's spec path,
  or `none`) with a `Follow-up of #<n> (PR #<pr>)` line, both passed through
  files (`trust-boundary.md`); board `Todo`. Before filing, search the
  milestone's open issues (in the fast lane, the open `track:adhoc` issues) for
  the same finding; a match files nothing.
- **In a milestone** a follow-up goes into the same milestone, and the next wave
  picks it up before the QA gate.
- **In the fast lane** a follow-up becomes a `track:adhoc` issue only when the
  issue under review is auto-pick eligible (author OWNER or MEMBER,
  `trust-boundary.md`). Otherwise it is a `Review notes` entry plus one
  `Needs you:` line offering to file it (`needs-you.md`). A follow-up filed
  under an account that is itself not OWNER or MEMBER waits in `Todo` for
  explicit selection, like any such issue.
- **Planning.** The spec-acceptance review takes the same bound with these
  blocking classes: a contradiction with the vision, the constitution or the
  architecture; an open question an implementer would hit; a wrong factual claim
  the spec relies on; a section the spec template requires missing or wrong; a
  Foundation-doc change whose `Replaces` or `After:` text does not match its
  doc. Non-blocking findings go into the spec PR body's `Review notes`, shown at
  the spec-acceptance gate. Planning files no follow-up issue: an out-of-scope
  finding is a note, or a `Needs you:` line when only the human can act on it.

## QA gate

At the milestone QA gate, "anything the reviewers flagged" includes the
follow-ups, found by their `Follow-up of` line among the milestone's issues, and
the `Review notes` of the milestone's merged PR bodies, both read from GitHub.

End of review bound.
