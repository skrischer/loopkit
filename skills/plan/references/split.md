# Plan — split a phase over the limit

> Paths in this file are relative to this file.

> Read in the pre-mortem (`../SKILL.md` §4) only when the planned cut is over the
> phase-size limit. The rule, the default and the living-spec exemption are in
> `../../shared/iteration-steps.md` (Roadmap seeding).

A cut over the limit is a blocking planning finding, so split it before review:

1. Keep a first part within the limit in the spec. Its Tracking lists only that
   part's issues.
2. Move the text of each part that leaves out of the original roadmap row into a
   new row, with that part's share of the Foundation impact line. The new row
   takes the next free phase number, or a new feature slug, per the row form and
   the permanent id in `../../shared/iteration-steps.md`. Its Spec and Milestone
   cells are `—`. Each row names the other: `split into <id>` and
   `split from <id>`.
3. On `docs/prior-art.md`, add the new id to the `Also feeds:` line of every
   concern backing the original row, adding the line if it has none.
4. Stage `docs/roadmap.md` and `docs/prior-art.md` with the spec (`../SKILL.md`
   §5), so the split rides the spec PR and the gate shows it. This run does not
   plan the new rows; a later `/loopkit:plan` does.

End of split.
