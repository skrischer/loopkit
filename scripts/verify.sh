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
# The report is kept: validate's "Validating hooks" lines (hooks:, calls:) feed
# the read-only guard in step 3b.
plugin_rc=0
plugin_report="$(claude plugin validate .claude-plugin/plugin.json 2>&1)" || plugin_rc=$?
printf '%s\n' "$plugin_report"
if [ "$plugin_rc" -eq 0 ]; then
  echo "  plugin+skills: OK"
else
  echo "  plugin+skills: FAILED"
  fail=1
fi

# 2b. Mod tests — the status mod's tests (`claude plugin test`), when hooks/ exists.
if [ -d hooks ]; then
  echo "-- claude plugin test . (status mod tests) --"
  if claude plugin test .; then
    echo "  mod tests: OK"
  else
    echo "  mod tests: FAILED"
    fail=1
  fi
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
guard_hit=0
# The surface is every tracked file plus every new, non-ignored one, so a PR's
# new files are scanned before their first commit. The engine-written
# .claude-plugin/types/ folder ignores itself and is therefore never listed.
surface_files=()
while IFS= read -r -d '' f; do
  [ "$f" = "$self" ] && continue
  # A tracked file deleted in the working tree is gone, not skipped silently
  # for any other reason: anything else that is not a regular file fails.
  if [ ! -e "$f" ] && [ ! -L "$f" ]; then continue; fi
  if [ ! -f "$f" ]; then
    echo "  surface entry is not a regular file: $f"
    guard_hit=1
    continue
  fi
  surface_files+=("$f")
done < <(
  git ls-files -z --cached --others --exclude-standard -- \
    '.claude-plugin' 'types' 'hooks' 'skills/*/templates/*.json' 'scripts/*.sh'
)

forbidden=(
  'claude -p'
  '--dangerously-skip-permissions'
  'GH_TOKEN='
  'cron'
  'scheduler'
)

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

# 3b. Read-only guard for the status mod (hooks/). The mod must never act: it
#     reads GitHub through `gh` read commands passed as argv, and the session
#     through its hooks. Validate reports the calls a module makes but enforces
#     no policy, so this guard is the policy: an allowlist over validate's own
#     `calls:` lines (it also catches a destructured `$`, which a source grep
#     would miss), plus two source greps over the non-test hooks files.
echo "-- read-only guard (status mod) --"

ro_fail=0
if [ -d hooks ]; then
  allowed_calls=(
    '$.process.run' '$.fs.read'
    '$.ui.open' '$.ui.status' '$.ui.resolve'
    '$.clock.now' '$.clock.every'
    '$.command.register'
    '$.state.get' '$.state.set'
  )
  calls_seen=0
  while IFS= read -r line; do
    calls_seen=1
    list="$(printf '%s\n' "${line#*calls: }" | sed -E 's/ \(via [^)]*\)//g')"
    while IFS= read -r call; do
      call="$(printf '%s' "$call" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')"
      [ -z "$call" ] && continue
      [ "$call" = "nothing" ] && continue
      ok=0
      for a in "${allowed_calls[@]}"; do
        [ "$call" = "$a" ] && ok=1 && break
      done
      if [ "$ok" -eq 0 ]; then
        echo "  FORBIDDEN call '$call' (not on the read-only allowlist): $line"
        ro_fail=1
      fi
    done < <(printf '%s\n' "$list" | tr ',' '\n')
  done < <(printf '%s\n' "$plugin_report" | grep -E ' calls: ' || true)
  if [ "$calls_seen" -eq 0 ]; then
    echo "  validate printed no 'calls:' line for the hooks module"
    ro_fail=1
  fi

  hook_src=()
  while IFS= read -r -d '' f; do
    if [ ! -e "$f" ] && [ ! -L "$f" ]; then continue; fi
    if [ ! -f "$f" ]; then
      echo "  hooks entry is not a regular file: $f"
      ro_fail=1
      continue
    fi
    case "$f" in *.test.ts|*.test.tsx) continue ;; esac
    hook_src+=("$f")
  done < <(git ls-files -z --cached --others --exclude-standard -- 'hooks')

  if [ "${#hook_src[@]}" -gt 0 ]; then
    # One process call site, and it is a gh argv. Before hooks/github.ts exists
    # (the gh module lands in a later step) zero call sites is fine.
    run_total="$(cat -- "${hook_src[@]}" | { grep -o -F '$.process.run(' || true; } | wc -l | tr -d ' ')"
    run_gh="$(cat -- "${hook_src[@]}" | { grep -o -F "\$.process.run(['gh'," || true; } | wc -l | tr -d ' ')"
    if [ "$run_total" -gt 1 ] || [ "$run_total" -ne "$run_gh" ]; then
      echo "  process.run occurs $run_total time(s), $run_gh with a ['gh', argv: want at most one call site, and it must be a gh argv"
      ro_fail=1
    elif [ "$run_total" -eq 0 ] && [ -f hooks/github.ts ]; then
      echo "  hooks/github.ts exists but the one process.run(['gh', ...]) call site is missing"
      ro_fail=1
    fi

    # No write argv token, in single or double quotes.
    if grep -n -E -e "'(create|merge|edit|close|comment|delete|-X|--method|-f|-F|--field|--raw-field|--input)'" \
        -e '"(create|merge|edit|close|comment|delete|-X|--method|-f|-F|--field|--raw-field|--input)"' -- "${hook_src[@]}"; then
      echo "  FORBIDDEN write argv token in hooks/ (above)"
      ro_fail=1
    fi
  fi
fi
if [ "$ro_fail" -eq 0 ]; then
  echo "  read-only guard: OK"
else
  echo "  read-only guard: FAILED"
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
#    assertion, so this guard reads skills/*/SKILL.md and
#    skills/*/references/*.md (a merge fence may move into a reference; an
#    unmatched glob is skipped by the -f test) — for this ONE invariant
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
for f in skills/*/SKILL.md skills/*/references/*.md; do
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

# --- Skill-structure guards (7-11) -------------------------------------------
# docs/specs/spec-skill-structure.md owns the rules. Each guard is its own
# check, none folded into guard 5 (whose note limits it to the ordering
# invariant). Shared helpers first.

skill_files=(skills/*/SKILL.md)
ref_files=()
for f in skills/*/references/*.md skills/shared/*.md; do
  [ -f "$f" ] && ref_files+=("$f")
done

# Line number of the closing frontmatter `---` (2..30), empty if absent.
fm_close() {
  awk 'NR==1 && $0!="---" { exit }
       NR>1 && NR<=30 && $0=="---" { print NR; exit }' "$1"
}

# Token that opens a plugin path: first segment skills|templates|references|shared
# at a word boundary. A preceding `/` (e.g. `${CLAUDE_SKILL_DIR}/references/`,
# `../shared/`) is not a boundary, so substituted and dotted forms do not match.
bare_pat='(^|[[:space:]`("'"'"'[])(skills|templates|references|shared)/'

# 7. Plugin-path guard — a plugin path must resolve in a TARGET project, where
#    the working directory is the project and the plugin lives elsewhere. A bare
#    repo-relative path (`skills/shared/x.md`) resolves only inside loopkit itself;
#    Claude Code substitutes ${CLAUDE_SKILL_DIR} / ${CLAUDE_PLUGIN_ROOT} only in a
#    SKILL.md body (not in Read files, the Bash env, or a description). So:
#    SKILL.md (body and description): no bare match and no `../` or `./` plugin
#    path (a dot path with a segment skills|templates|references|shared or a skill
#    directory name). Target-project dot paths (`../<repo>-worktrees/...`,
#    `../loopkit-priorart/<project>`) are not plugin paths and pass.
#    references/*.md and shared/*.md: no bare match (a `../` or `./` form is
#    allowed; guard 9 resolves it) and no `${CLAUDE_`.
echo "-- plugin-path guard (no repo-relative plugin path; no \${CLAUDE_ in referenced files) --"

path_fail=0
skill_dirs="$(for d in skills/*/; do basename "$d"; done | paste -sd'|')"
for f in "${skill_files[@]}"; do
  while IFS= read -r hit; do
    [ -n "$hit" ] || continue
    echo "  $f:$hit"
    echo "      bare repo-relative plugin path in a SKILL.md (body or description). Use \${CLAUDE_SKILL_DIR}/... or \${CLAUDE_PLUGIN_ROOT}/skills/shared/..."
    path_fail=1
  done < <(grep -nE -e "$bare_pat" -- "$f" || true)
  while IFS=: read -r ln tok; do
    [ -n "$tok" ] || continue
    if printf '%s\n' "$tok" | tr '/' '\n' | grep -qxE "skills|templates|references|shared|$skill_dirs"; then
      echo "  $f:$ln: $tok"
      echo "      ../ or ./ plugin path in a SKILL.md — relative plugin paths are allowed only in reference and shared files."
      path_fail=1
    fi
  done < <(grep -noE '\.\.?/[A-Za-z0-9_./<>{}$-]*' -- "$f" || true)
done
for f in "${ref_files[@]}"; do
  while IFS= read -r hit; do
    [ -n "$hit" ] || continue
    echo "  $f:$hit"
    echo "      bare repo-relative plugin path in a referenced file. Use a path relative to this file (../shared/x.md)."
    path_fail=1
  done < <(grep -nE -e "$bare_pat" -- "$f" || true)
  while IFS= read -r hit; do
    [ -n "$hit" ] || continue
    echo "  $f:$hit"
    echo "      \${CLAUDE_...} in a referenced file — substitution happens only in a SKILL.md, so it would reach the reader unexpanded."
    path_fail=1
  done < <(grep -nF -e '${CLAUDE_' -- "$f" || true)
done
if [ "$path_fail" -eq 0 ]; then
  echo "  plugin-path guard: OK"
else
  echo "  plugin-path guard: FAILED"
  fail=1
fi

# 8. Guard-line / end-line guard — a compaction re-attaches only the first 5,000
#    tokens of a skill, silently cutting the rest. The end line is the sentinel
#    that tells a whole copy from a cut one; the guard line near the top tells a
#    cut copy to Read the full file. The guard line must NOT quote the end line:
#    a quoted copy would survive in a truncated skill and fake completeness.
echo "-- guard-line / end-line guard (truncation sentinel on every skill) --"

line_fail=0
for f in "${skill_files[@]}"; do
  name="$(basename "$(dirname "$f")")"
  h1="$(grep -n -m1 '^# ' -- "$f" | cut -d: -f1 || true)"
  ok=0
  if [ -n "$h1" ]; then
    for off in 1 2 3; do
      line="$(sed -n "$((h1 + off))p" "$f")"
      if printf '%s' "$line" | grep -qF -e '> Truncation guard:' \
         && printf '%s' "$line" | grep -qF -e 'end-of-skill line' \
         && printf '%s' "$line" | grep -qF -e '${CLAUDE_SKILL_DIR}/SKILL.md'; then
        ok=1
        if printf '%s' "$line" | grep -qF -e 'End of /loopkit:'; then
          echo "  $f:$((h1 + off)): the guard line quotes the end line ('End of /loopkit:'); a quoted copy fakes completeness in a cut skill."
          line_fail=1
        fi
      fi
    done
  fi
  if [ "$ok" -eq 0 ]; then
    echo "  $f: no '> Truncation guard:' line (with 'end-of-skill line' and '\${CLAUDE_SKILL_DIR}/SKILL.md') within 3 lines after the H1."
    line_fail=1
  fi
  last="$(grep -v '^[[:space:]]*$' -- "$f" | tail -n 1 || true)"
  if [ "$last" != "End of /loopkit:$name." ]; then
    echo "  $f: last non-empty line is not exactly 'End of /loopkit:$name.'"
    line_fail=1
  fi
done
ic="skills/implement/references/issue-contract.md"
last="$(grep -v '^[[:space:]]*$' -- "$ic" | tail -n 1 || true)"
if [ "$last" != "End of issue contract." ]; then
  echo "  $ic: last non-empty line is not exactly 'End of issue contract.'"
  line_fail=1
fi
if [ "$line_fail" -eq 0 ]; then
  echo "  guard-line / end-line guard: OK (${#skill_files[@]} skills + issue contract)"
else
  echo "  guard-line / end-line guard: FAILED"
  fail=1
fi

# 9. Reference-link guard — a core is only as good as its pointers: an on-demand
#    file nothing links to is never read, and a pointer to a missing file sends
#    the model after nothing. Checks: (a) every skills/<n>/references/<f>.md is
#    named in its SKILL.md as ${CLAUDE_SKILL_DIR}/references/<f>.md; (b) every
#    ${CLAUDE_SKILL_DIR}/... and ${CLAUDE_PLUGIN_ROOT}/... path in a SKILL.md
#    exists (skill dir / repo root); (c) every ../ or ./ path in a reference or
#    shared file resolves relative to that file (target-project paths with a
#    <placeholder> are skipped); (d) every reference and shared file opens with
#    the paths-relative header, because a Read file gets no substitution.
echo "-- reference-link guard (pointers exist, references linked, relative paths resolve) --"

link_fail=0
for f in "${skill_files[@]}"; do
  d="$(dirname "$f")"
  for r in "$d"/references/*.md; do
    [ -f "$r" ] || continue
    if ! grep -qF -e "\${CLAUDE_SKILL_DIR}/references/$(basename "$r")" -- "$f"; then
      echo "  $f does not link $r as \${CLAUDE_SKILL_DIR}/references/$(basename "$r")"
      link_fail=1
    fi
  done
  while IFS= read -r tok; do
    [ -n "$tok" ] || continue
    tok="$(printf '%s' "$tok" | sed -E 's/[.,:;)]+$//')"
    case "$tok" in
      '${CLAUDE_SKILL_DIR}'/*) target="$d/${tok#'${CLAUDE_SKILL_DIR}'/}" ;;
      '${CLAUDE_PLUGIN_ROOT}'/*) target="${tok#'${CLAUDE_PLUGIN_ROOT}'/}" ;;
      *) continue ;;
    esac
    if [ ! -e "$target" ]; then
      echo "  $f points at $tok, which does not exist ($target)"
      link_fail=1
    fi
  done < <(grep -oE '\$\{CLAUDE_(SKILL_DIR|PLUGIN_ROOT)\}/[^[:space:]`"'"'"'>]*' -- "$f" | sort -u || true)
done
hdr='> Paths in this file are relative to this file.'
for f in "${ref_files[@]}"; do
  d="$(dirname "$f")"
  if ! head -n 5 -- "$f" | grep -qxF -e "$hdr"; then
    echo "  $f lacks the header line '$hdr' near the top."
    link_fail=1
  fi
  while IFS= read -r tok; do
    [ -n "$tok" ] || continue
    tok="$(printf '%s' "$tok" | sed -E 's/[.,:;)]+$//')"
    case "$tok" in
      *'<'*|*'>'*)
        # Placeholder path: a target-project path (../<repo>-worktrees/...) is
        # skipped; one with a plugin segment (../inception/templates/<file>)
        # must resolve up to its first placeholder segment.
        printf '%s\n' "$tok" | tr '/' '\n' | grep -qxE "skills|templates|references|shared|$skill_dirs" || continue
        tok="${tok%%<*}"
        ;;
    esac
    if [ ! -e "$d/$tok" ]; then
      echo "  $f: relative path $tok does not resolve from $d"
      link_fail=1
    fi
  done < <(grep -oE '(^|[^A-Za-z0-9_.}/-])\.\.?/[A-Za-z0-9_./<>-]*' -- "$f" | sed -E 's/^[^.]*//' | sort -u || true)
done
if [ "$link_fail" -eq 0 ]; then
  echo "  reference-link guard: OK"
else
  echo "  reference-link guard: FAILED"
  fail=1
fi

# 10. Frontmatter guard — `claude plugin validate` accepts a malformed
#     `argument-hint` (scratch-tested), and an unclosed block silently turns the
#     whole skill into frontmatter. PyYAML is not an allowed dependency, so the
#     mechanical floor is: block closed by a second `---` within 30 lines, any
#     `argument-hint:` a double-quoted string without `"` or `\`, and a
#     description of at most 700 characters (trigger text, not mechanics), and
#     no ${CLAUDE_ in the description or argument-hint (no substitution in a
#     description; substitution does happen in `allowed-tools` Bash rules, so
#     the other frontmatter lines are not checked).
echo "-- frontmatter guard (block closed, argument-hint form, description length) --"

fm_fail=0
for f in "${skill_files[@]}"; do
  c="$(fm_close "$f")"
  if [ -z "$c" ]; then
    echo "  $f: frontmatter does not start with --- and close with a second --- within 30 lines."
    fm_fail=1
    continue
  fi
  while IFS= read -r h; do
    [ -n "$h" ] || continue
    if ! printf '%s\n' "$h" | grep -qE '^argument-hint: "[^"\\]*"$'; then
      echo "  $f: argument-hint is not a plain double-quoted string: $h"
      fm_fail=1
    fi
  done < <(sed -n "2,$((c - 1))p" "$f" | grep -E '^argument-hint:' || true)
  desc="$(sed -n "2,$((c - 1))p" "$f" | awk '
    /^description:/ { sub(/^description:[[:space:]]*/, ""); d = $0; on = 1; next }
    on && (/^[[:space:]]/ || /^$/) { sub(/^[[:space:]]+/, ""); d = d " " $0; next }
    { on = 0 }
    END { print d }')"
  desc="${desc#\"}"; desc="${desc%\"}"
  if { printf '%s\n' "$desc"; sed -n "2,$((c - 1))p" "$f" | grep -E '^argument-hint:' || true; } | grep -qF -e '${CLAUDE_'; then
    echo "  $f: \${CLAUDE_...} in the description or argument-hint — no substitution there, and a plugin path is forbidden."
    fm_fail=1
  fi
  dlen="$(printf '%s' "$desc" | LC_ALL=C.UTF-8 wc -m | tr -d ' ')"
  if [ "$dlen" -gt 700 ]; then
    echo "  $f: description is $dlen characters (limit 700). Keep trigger text: what, when, argument forms."
    fm_fail=1
  fi
done
if [ "$fm_fail" -eq 0 ]; then
  echo "  frontmatter guard: OK"
else
  echo "  frontmatter guard: FAILED"
  fail=1
fi

# 11. Body-size guard — after a compaction Claude Code re-attaches only the first
#     5,000 tokens of a skill (~13,500 body bytes at ~2.70 bytes/token); the rest
#     is cut and, with it, the gates. 12,800 bytes after the closing frontmatter
#     `---` keeps ~260 tokens of headroom. Frontmatter does not count.
echo "-- body-size guard (SKILL.md body <= 12800 bytes) --"

body_limit=12800
size_fail=0
for f in "${skill_files[@]}"; do
  c="$(fm_close "$f")"
  [ -n "$c" ] || continue   # unclosed block is guard 10's failure
  size="$(tail -n +"$((c + 1))" -- "$f" | wc -c | tr -d ' ')"
  if [ "$size" -gt "$body_limit" ]; then
    echo "  $f: body is $size bytes (limit $body_limit). Move post-gate or subagent-only text to references/, never a STOP gate."
    size_fail=1
  fi
done
if [ "$size_fail" -eq 0 ]; then
  echo "  body-size guard: OK (all ${#skill_files[@]} bodies <= $body_limit bytes)"
else
  echo "  body-size guard: FAILED"
  fail=1
fi

# 12. Naming-rule guard — the implement and plan cores carry one identical rule
#     line (issues, PRs and milestones named by number and title in human-facing
#     output). A later slimming pass must not drop it silently.
echo "-- naming-rule guard (identical rule line in the implement and plan cores) --"

name_rule='Naming: in everything the human reads, name an issue, PR or milestone by number and short title (`#238 implement split`), and a PR also by its branch — never a bare number.'
name_fail=0
for s in implement plan; do
  if ! grep -qxF -e "$name_rule" -- "skills/$s/SKILL.md"; then
    echo "  skills/$s/SKILL.md lacks the naming rule line (exact text, own line)."
    name_fail=1
  fi
done
if [ "$name_fail" -eq 0 ]; then
  echo "  naming-rule guard: OK"
else
  echo "  naming-rule guard: FAILED"
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
