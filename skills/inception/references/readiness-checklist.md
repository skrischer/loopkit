# Loop-readiness checklist

> Paths in this file are relative to this file.

Walk this checklist and show the result. Brownfield: this is the checklist that
produces the gap report in Step 0.

- [ ] gh + git available and authorized — gh authenticated with the repo + project scopes (Step 0 preflight)
- [ ] Verify is one command, runs green, duration recorded in the contract
- [ ] Bootstrap turns a fresh worktree runnable, proven by running it
- [ ] Project board exists with `Todo` / `In Progress` / `Done`, and its
      field-ID recipe (Status field id + option ids) is recorded in the contract
- [ ] `docs/workflow.md` complete — no placeholders left, and the template's
      Precedence section present
- [ ] Model tiers (optional) — if the project routes roles to tiers or effort,
      each role's tier is filled and its effort is filled or unset (unset =
      `inherit`; a tiers-only contract is no gap); else absent (default
      `inherit`)
- [ ] `docs/design.md` complete (design-surface project) — no placeholders left;
      or recorded `none` (neither surface, no file)
- [ ] `docs/release.md` complete (releasable project) — no placeholders left;
      or recorded `none` (not releasable, no file)
- [ ] Every roadmap phase has prior-art coverage to seed its spec (or an explicit
      greenfield "no prior art" note)
- [ ] `.claude/settings.json` in place: `defaultMode: acceptEdits` with an
      `allow` list, and deny rules covering every hard limit in the template's
      deny list
- [ ] `CLAUDE.md` wired (Step 9): the `@docs/vision.md` and `@docs/constitution.md`
      imports, the on-demand list, the Autonomy grant, and a
      `# Compact Instructions` section whose text keeps the human's in-session
      instruction for the run
- [ ] Provisioning: `.env.example` complete and every value the project needs
      is provided — collect missing secrets from the user now, not mid-loop
- [ ] Initial commit exists on the base branch. If the branch is unborn,
      `/loopkit:plan` cannot branch a worktree from it: prompt the user and,
      only on their explicit confirmation, stage, commit, and push the
      inception output.
