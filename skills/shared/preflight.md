# Shared preflight

> Paths in this file are relative to this file.

> Plugin-shipped shared reference — NOT a skill. The environment checks every
> loopkit skill runs once at the start of a run, authored once. The calling skill
> names the scopes it requires and says whether the clean-base check applies.

Run all checks, then on ANY failure STOP and list EVERY problem at once with the
exact remedy. INSTRUCT the fix, never auto-run `gh auth login` or
`gh auth refresh` (interactive browser/device flows).

- **Tools on PATH.** `command -v git` and `command -v gh` (then `git --version` /
  `gh --version`). Missing -> remedy: "install git / gh — https://cli.github.com".
- **`gh` authenticated.** `gh auth status`. Not authenticated -> remedy:
  `gh auth login`.
- **Token scopes (two-step check)** — the calling skill names the required scopes
  (e.g. `repo` + `project`).
  1. If the `Token scopes:` line of `gh auth status` is present, it must contain
     every required scope.
  2. If that line is ABSENT (fine-grained PAT / GitHub App / `GH_TOKEN` report no
     classic scopes), do NOT parse — probe each scope the caller requires instead:
     `gh api graphql -f query='{viewer{projectsV2(first:1){nodes{id}}}}'`
     (`project` access — only when the caller requires `project`) and
     `gh repo view >/dev/null` (`repo` access); a non-zero
     exit whose stderr matches `INSUFFICIENT_SCOPES` or mentions `project`
     (case-insensitive) = missing scope.
  Missing `project` -> remedy: `gh auth refresh -s project` *(OAuth login; for a
  PAT or `GH_TOKEN`, `gh auth refresh` does not apply — re-create the token with
  the `project` scope instead)*. **Project-scope landmine:** `gh auth login` does
  NOT grant `project` by default, so a "correctly authed" user still fails board
  creation without it — this is the specific gap the check exists to catch.
- **Clean base** — only when the calling skill says it applies. Run from the main
  checkout on the base branch with a clean tree: check
  `git rev-parse --abbrev-ref HEAD` and `git status -sb`; if not on a clean base
  branch, stop and ask.
