# Project permissions (Step 8)

> Paths in this file are relative to this file.

Fill `../templates/settings.json` into the project's `.claude/settings.json` —
plugins cannot ship permission rules, so the loops' autonomy must be granted
per project:

- Ships `defaultMode: acceptEdits` plus an `allow` list (`Bash`, `WebFetch`,
  `WebSearch`). `acceptEdits` auto-approves edits only inside the working
  directory or `additionalDirectories`, so edits in worktrees under
  `../<repo>-worktrees/` still prompt. Claude Code ignores two values as a
  project-level `defaultMode`: `bypassPermissions` (it doesn't take effect and
  the session starts in Manual mode) and `auto` (it doesn't take effect and
  Claude Code uses the built-in default, not a `defaultMode` from
  `~/.claude/settings.json`). A project or managed value outranks
  `~/.claude/settings.json`, so the project's `acceptEdits` outranks both the
  built-in default and a user-level `defaultMode`. Start order: the
  `--permission-mode` flag, then a settings `defaultMode`, then the built-in
  default — so a human who wants `auto` starts with `--permission-mode auto`.
  Deny rules apply in every mode. The template's deny list ships the hard
  limits concretely — the enforced single source; no prose re-enumerates them.
- Deny rules match command text: a guardrail, not a security boundary. The
  template repeats each git limit for the `git -C <path>` form, and the skills'
  never-force rules stay as the second layer.
- **`--here`:** a project `defaultMode` other than `acceptEdits` is a gap —
  `bypassPermissions` starts sessions in Manual mode and `auto` never takes
  effect from a project file — propose the `acceptEdits` + `allow` form at this
  gate.
- Replace the template's `<STACK_DESTRUCTIVE_DB_COMMAND>` deny placeholder with
  the stack's destructive commands against shared state (e.g. `supabase db
  reset`, `prisma migrate reset`), or drop it if the stack has none.
- The contract's Autonomy section is the human-readable counterpart: it grants
  the skills autonomous commits, pushes, merges, dependency installs and `.env`
  edits, overriding any stricter global user rules.
- **Conflict check:** read the user-level `~/.claude/settings.json`. Its deny
  rules and PreToolUse hooks beat every project setting (a global
  `Bash(npm install*)` deny silently kills Bootstrap). Surface each rule that
  collides with the Autonomy section and ask the user to relax it (their edit, never yours).

GATE: present the settings before writing; merge with an existing file, never
overwrite silently.
