#!/usr/bin/env bash
set -euo pipefail

# loopkit structural Verify.
#
# Reuses the native `claude plugin validate` (non-strict) as the structural
# check, plus a config-surface auth/state guard for the loopkit invariants the
# validator does not cover (subscription-auth only, GitHub-only durable state).
# No new dependency: only `claude`, `git`, and shell (the allowed runtime).
#
# Run from anywhere; the script resolves the repo root itself:
#   bash scripts/verify.sh

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

fail=0

echo "== loopkit Verify =="

# 1. Marketplace manifest — validates only the marketplace, does NOT recurse
#    into skills. Non-strict (advisory warnings stay non-fatal).
echo "-- claude plugin validate . (marketplace manifest) --"
if claude plugin validate .; then
  echo "  marketplace: OK"
else
  echo "  marketplace: FAILED"
  fail=1
fi

# 2. Plugin manifest + every skill. Non-strict.
echo "-- claude plugin validate .claude-plugin/plugin.json (plugin + skills) --"
if claude plugin validate .claude-plugin/plugin.json; then
  echo "  plugin+skills: OK"
else
  echo "  plugin+skills: FAILED"
  fail=1
fi

# 3. Config-surface auth/state guard — scan ONLY the non-prose config surfaces
#    for actual forbidden usage. Instructional Markdown is deliberately NOT
#    scanned: loopkit's skills legitimately name these tokens as prohibitions,
#    and a settings.json may name them in deny rules.
#
#    Surfaces: .claude-plugin/ (JSON), skills/**/templates/*.json, scripts/*.sh,
#    hooks/. THIS script names the forbidden tokens as its own grep patterns, so
#    it MUST exclude itself from the scan (self-match guard).
echo "-- config-surface auth/state guard --"

self="scripts/verify.sh"
surface_files=()
while IFS= read -r f; do
  [ "$f" = "$self" ] && continue
  surface_files+=("$f")
done < <(
  {
    find .claude-plugin -type f 2>/dev/null || true
    find skills -path '*/templates/*.json' -type f 2>/dev/null || true
    find scripts -type f -name '*.sh' 2>/dev/null || true
    { [ -d hooks ] && find hooks -type f 2>/dev/null; } || true
  } | sort -u
)

forbidden=(
  'claude -p'
  '--dangerously-skip-permissions'
  'GH_TOKEN='
  'cron'
  'scheduler'
)

guard_hit=0
if [ "${#surface_files[@]}" -gt 0 ]; then
  for pat in "${forbidden[@]}"; do
    if grep -n -F -e "$pat" -- "${surface_files[@]}"; then
      echo "  FORBIDDEN token '$pat' found in a config surface (above)"
      guard_hit=1
    fi
  done
fi
if [ "$guard_hit" -eq 0 ]; then
  echo "  config-surface guard: OK (no forbidden auth/scheduler usage)"
else
  fail=1
fi

# 4. No committed local-state second source — GitHub is the only durable state.
echo "-- local-state second-source guard --"
state_hits="$(git ls-files -- '*.sqlite' '*.db' 'state.json' 2>/dev/null || true)"
if [ -n "$state_hits" ]; then
  echo "  FORBIDDEN tracked local-state file(s):"
  echo "$state_hits"
  fail=1
else
  echo "  local-state guard: OK (no tracked *.sqlite/*.db or root state.json)"
fi

# 5. Merge-ordering guard — `gh pr merge --delete-branch` deletes the LOCAL
#    branch too, and git refuses to delete a branch a worktree still holds
#    ("cannot delete branch '<b>' used by worktree at '<path>'" — neither -d nor
#    -D gets through). Every skill mandates a worktree, so merging before
#    removing it orphans one local branch per merged PR, silently and every time.
#
#    SCOPE NOTE — this consciously extends the scanned surface. Guard 3 above
#    deliberately does NOT scan instructional Markdown, because a skill
#    legitimately NAMES a forbidden token in order to forbid it. That rationale
#    is about token-prohibition greps and does not carry to an ordering
#    assertion, so this guard reads skills/*/SKILL.md — for this ONE invariant
#    only. Do not grow it into a general skill-prose linter.
#
#    It matches COMMAND lines inside fenced code blocks only (fence-tracked and
#    line-anchored): implement/SKILL.md legitimately mentions
#    `gh pr merge <n> --delete-branch` in prose, explaining why a second such
#    call is NOT the repair — that mention must never count as a merge site.
#
#    The pair must live in the SAME fence, and every merge needs its OWN
#    preceding removal: `seen_remove` resets on fence open and after each merge.
echo "-- merge-ordering guard (worktree removed before --delete-branch) --"

order_fail=0
order_sites=0
for f in skills/*/SKILL.md; do
  [ -f "$f" ] || continue
  out="$(
    awk -v file="$f" '
      /^[[:space:]]*```/ { infence = !infence; if (infence) seen_remove = 0; next }
      !infence { next }
      /^[[:space:]]*git worktree remove([[:space:]]+--[^[:space:]]+)*[[:space:]]+"\$wt"/ { seen_remove = 1; next }
      /^[[:space:]]*gh pr merge/ {
        # A trailing comment is prose, not part of the command — strip it before
        # any flag test, so a line documenting a prohibition cannot trip it.
        # Require the fences own convention of 2+ spaces before the #: a bare
        # /#.*/ would also cut at a # INSIDE a quoted argument (this repo commits
        # titles like "chore(release): 2.1.0 (#204)"), hiding a --repo that follows
        # it — a silent miss, which is the very thing this guard exists to prevent.
        cmd = $0
        sub(/[[:space:]][[:space:]]+#.*/, "", cmd)
        # Count ONLY what we actually check: the floor is meaningless unless
        # counted == checked. Counting every `gh pr merge` would let a merge whose
        # delete flag moved to a continuation line keep the count at 4 while its
        # ordering went unchecked — silent vacuity, one level down.
        if (cmd ~ /--delete-branch/ || cmd ~ /[[:space:]]-d([[:space:]]|$)/) {
          sites++
          if (!seen_remove) {
            printf "  %s:%d: `gh pr merge` deletes the branch with no `git worktree remove \"$wt\"` before it in this block.\n", file, FNR
            print  "      --delete-branch/-d deletes the LOCAL branch too, and git refuses while a worktree"
            print  "      holds it — this order orphans a local branch on EVERY merge. Remove the worktree first."
            bad = 1
          }
          # --repo makes the ordering fix moot: gh sets
          # CanDeleteLocalBranch = !cmd.Flags().Changed("repo"), so with --repo it
          # NEVER deletes the local branch — silently, with no warning and no note
          # in `gh pr merge --help`. Observed live 2026-07-15 (PR #215).
          if (cmd ~ /--repo([[:space:]]|=|$)/ || cmd ~ /[[:space:]]-R/) {
            printf "  %s:%d: `gh pr merge` carries --repo/-R together with a delete flag.\n", file, FNR
            print  "      gh sets CanDeleteLocalBranch = !Flags().Changed(\"repo\"), so --repo silently skips"
            print  "      the LOCAL branch delete and re-creates the #205 leak. Drop --repo from the merge."
            bad = 1
          }
          # Every flag test above is LINE-LOCAL, so a continuation would carry a
          # flag out of their reach while `sites` still counts the site and the
          # floor stays satisfied — green guard, broken invariant. Keep merge sites
          # on one line and assert it, rather than assuming it: the ship fence
          # already uses a continuation for `gh pr create`.
          # (No apostrophes in this awk program — it is single-quoted in the shell.)
          if (cmd ~ /\\[[:space:]]*$/) {
            printf "  %s:%d: `gh pr merge` delete site continues onto the next line.\n", file, FNR
            print  "      The flag checks here are line-local, so a continuation hides --repo or a"
            print  "      second delete flag from them while the site still counts. Keep it on one line."
            bad = 1
          }
        }
        seen_remove = 0
      }
      END { printf "SITES=%d\n", sites; exit (bad ? 1 : 0) }
    ' "$f"
  )" || order_fail=1
  echo "$out" | grep -v '^SITES=' || true
  n="$(echo "$out" | sed -n 's/^SITES=//p')"
  order_sites=$(( order_sites + ${n:-0} ))
done

# Floor — without it the guard degrades SILENTLY. A line continuation
# (`gh pr merge <n> --squash \` + `--delete-branch` on the next line) stops
# matching, the site vanishes from the count, and Verify stays green while
# guarding nothing. A guard that can quietly stop guarding is the same defect
# class it exists to catch. If a skill legitimately gains or loses a merge site,
# raise or lower this floor deliberately — that conscious edit is the point.
order_floor=4
if [ "$order_sites" -lt "$order_floor" ]; then
  echo "  found $order_sites merge site(s), expected at least $order_floor."
  echo "      A site stopped matching (pattern drift — e.g. a line continuation), so the guard"
  echo "      no longer checks it. Fix the pattern, or lower the floor deliberately."
  order_fail=1
fi

if [ "$order_fail" -eq 0 ]; then
  echo "  merge-ordering guard: OK ($order_sites merge site(s) checked, worktree removed before each)"
else
  echo "  merge-ordering guard: FAILED"
  fail=1
fi

# 6. Always-in-context guard — `/loopkit:plan` §6's spec-acceptance gate does NOT
#    seed docs/vision.md or docs/constitution.md: it relies on CLAUDE.md's
#    `@import` ("Always in context") to put both in the review subagent's context
#    before any tool use. Only docs/architecture.md is seeded, being the one
#    foundation doc CLAUDE.md marks "On demand (NOT auto-loaded)". If an @import
#    line is dropped, the gate silently loses the documents it exists to check
#    against — no failure, just a quieter gate. Assert the lines are still there.
#
#    Scope: this covers THIS repo's CLAUDE.md (loopkit dogfooding itself). Target
#    projects get the same wiring from /loopkit:inception (skills/inception/SKILL.md
#    Step 9); asserting it there is a separate concern, not this guard's job.
#
#    Match the LIVE import form only — a bare `- @docs/x.md` list item. CLAUDE.md
#    deliberately distinguishes it from the backticked `docs/x.md` of the "On demand
#    (NOT auto-loaded)" section, which Claude Code does NOT import. A plain
#    substring test would accept a doc demoted into that style: token present,
#    import dead, guard green.
echo "-- always-in-context guard (CLAUDE.md @imports the gate's decision docs) --"

import_fail=0
for doc in docs/vision.md docs/constitution.md; do
  if ! grep -qE "^[[:space:]]*-[[:space:]]+@${doc//./\\.}([[:space:]]|$)" CLAUDE.md; then
    echo "  CLAUDE.md no longer @imports $doc as a live import."
    echo "      /loopkit:plan §6 does not seed it — it relies on this line to place it in the"
    echo "      review subagent's context. Without it the spec-acceptance gate silently loses"
    echo "      the doc it checks specs against. Restore the @import, or seed the doc in §6."
    import_fail=1
  fi
done
if [ "$import_fail" -eq 0 ]; then
  echo "  always-in-context guard: OK (vision + constitution @imported)"
else
  echo "  always-in-context guard: FAILED"
  fail=1
fi

echo
if [ "$fail" -eq 0 ]; then
  echo "PASS: loopkit Verify — all checks green"
  exit 0
else
  echo "FAIL: loopkit Verify — see failures above"
  exit 1
fi
