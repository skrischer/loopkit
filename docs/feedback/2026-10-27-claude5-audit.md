# Claude 5 / Claude Code audit — 2026-10-27

> Intake note for `/loopkit:roadmap` and `/loopkit:plan`. Decides nothing: every
> foundation-doc recommendation here is ratified later in a `/loopkit:plan` cycle
> at the spec-acceptance gate. Routed on 2026-10-28 by the proportional dial —
> fast-lane issues for the small fixes, roadmap rows and re-scopes for the
> structural ones (see Routing at the end).

Repo state audited: `main` `f60e39e` (2.2.0). Method: the claude-api
`prompt-audit` pattern scan; every Claude Code claim checked against
code.claude.com/docs as of 2026-10-27; plus Anthropic's "Context Engineering for
Claude 5 Generation Models" (Thariq Shihipar, 2026-07-24). A proof diff (23
sections, one per finding; `git apply --check` clean on `f60e39e`, Verify green on
the result) was built in a scratch clone and deliberately not committed: each
route re-derives its change, and the fast-lane issue bodies carry the proposed
text.

## Step 0 — assumptions

- **Target model:** `claude-opus-5-5`, the model this audit ran on and the Claude
  Code default for these loops. Subagents inherit it unless the contract maps a
  tier (`docs/workflow.md` maps opus/sonnet/opus).
- **Scope:**
  - `CLAUDE.md` with its `@import`s (`docs/vision.md`, `docs/constitution.md`);
  - all six `skills/*/SKILL.md`, `skills/shared/`, and every
    `skills/inception/templates/*` file;
  - the docs the skills read: `docs/workflow.md`, `docs/release.md`,
    `docs/architecture.md`, `docs/roadmap.md`;
  - `README.md`, for stale facts only.
- **Skipped:**
  - `.claude/settings.json`, not read under the prompt-audit rule that it may
    hold secrets;
  - `~/.claude`;
  - `docs/specs/archive/` and `docs/feedback/`, read only for provenance.
- **Not applicable:** there are no non-Anthropic provider markers, and no API
  request code, so Group 4 (request config) does not apply. There are no
  `agents/` or `commands/` directories, so no subagent definitions were audited.
- **Size estimates:** token counts are chars/4 and were not measured with a
  tokenizer. They are good enough to place the 5,000-token cutoff within about
  30 lines.
- **Size guidance, stated precisely:** about 200 lines is the documented target for a
  *`CLAUDE.md`* file. For skills the docs say "Keep `SKILL.md` under 500 lines",
  and implement (477) passes that. The constraint that actually bites is the
  compaction re-attach cap (T1).
- **Ordering and authority:**
  - Group 2 conflicts are resolved by `git blame`: the newer, ratified decision
    wins.
  - Sections that edit a foundation doc are marked **[FOUNDATION]**. Under
    loopkit's own constitution they must be ratified through a
    `/loopkit:plan` spec PR, not committed directly.

## Results at a glance

| File | Before: lines / chars / bold | After: lines / chars / bold |
| ---- | ---------------------------- | --------------------------- |
| `implement/SKILL.md` | 477 / 31,348 (~7.8k tok) / 207 | 275 / 16,147 (~4.0k tok) / 24 |
| `plan/SKILL.md` | 369 / 22,783 (~5.7k tok) / 70 | 324 / 19,436 (~4.9k tok) / 22 |
| `inception/SKILL.md` | 356 / 21,176 (~5.3k tok) / 40 | 292 / 17,030 (~4.3k tok) / 16 |
| `roadmap` / `ship` / `design` | 164 / 150 / 95 lines; bold 18 / 20 / 18 | 162 / 150 / 95 lines; bold 7 / 5 / 5 |
| new `references/` + `shared/` | — | 5 skill references (21k chars), `shared/preflight.md`, `shared/trust-boundary.md` |

The total text barely shrinks: implement plus its references is 30.5k chars,
against 31.3k before. That is the point of the change. The core skill is what
survives a compaction and what the orchestrator carries all session. The rest
moves to files read only on the path that needs them.

## Themes

**T1 — Skill size vs the compaction re-attach cap (F01).** After a compaction,
Claude Code re-injects invoked skill bodies "capped at 5,000 tokens per skill";
"truncation keeps the start of the file". At ~7.8k tokens, implement is cut
around line 272–305, in the middle of §3. Everything after that point is gone
for the rest of the run:

- the merge-ordering block;
- §4 (escalate/park);
- §4.5 (cleanup sweep);
- §5, the milestone QA gate, which is one of the two human gates.

This is the documented cause of the "implement came back truncated after a
compaction" symptom. plan (~5.7k) and inception (~5.3k) lose their tails the
same way.

**T2 — The dogfood blind spot (F03, F04).** loopkit is developed in its own
repo, so some text works only there:

- Paths like `skills/shared/iteration-steps.md` and `templates/` "next to this
  file" resolve relative to the working directory, which in a target project is
  that project, not the plugin.
- Pointers like "Trust boundary (`docs/constitution.md`)" point to a principle
  that exists only in loopkit's own constitution. A target project's constitution
  comes from a placeholder template and has none of it. The security rules are
  therefore not delivered to the projects that need them.

**T3 — Stale Claude Code facts (F02, F05, F06, F07, F08, F13, F15, F18).** Each of
these was true once, or was never documented:

- the env-var model override;
- the orchestrator running `/compact`;
- a "Compact Instructions" section that costs nothing per turn;
- a built-in `code-reviewer` agent;
- `bypassPermissions` taking effect from project settings;
- deny rules that catch `git -C … push`;
- bare `/plan` meaning loopkit's plan.

**T4 — Skill↔template↔decision drift (F09, F10, F11).** Three contracts disagree
with their own ratified sources:

- The workflow template's plan loop auto-picks "the next unplanned phase", while
  the constitution says the human passes scope.
- The release contract describes a "pre-publish preview" that ship's ratified
  G1=A decision removed.
- Inception still calls the board "queue and claim mechanism".

**T5 — Pressure, repetition, duplication (F14, F16).**

- Emphasis is inflated: implement carries 207 bold spans in 477 lines, plus caps
  (OPTIONAL, MAY, NOT, ONLY, ALWAYS).
- Restatements: the frontier taxonomy appears three times in implement, and
  "board is not a lock" three times.
- Cross-skill copies: the `gh auth` probe exists in five copies, in breach of
  loopkit's own "no duplication across the skills" convention.

On Claude 5 models, emphasis everywhere drowns out the emphasis that matters:
the two STOP gates.

**T6 — Patch accretion and history narrative (F19, F21).** Text such as these
describes what changed instead of what is:

- "not the old … binary";
- "after §3's ordering fix";
- "Availability was never the gap";
- "the P1–P6 … complete";
- the constitution's Tech-debt history paragraph.

The model has no "before". The constitution is always loaded, so its history
costs tokens every turn. Volatile model names and cost ratios ("Fable … ~100x")
age with every release.

**T7 — Choreography vs outcomes (F23, and parts of F16).**

- "Lay out a short in-session plan", "read existing code first, reuse utilities"
  and "Follow the project `CLAUDE.md`" (which the subagent loads anyway) are
  trained defaults of current models.
- The issue contract should state outcomes and the non-obvious constraints, not
  the steps a capable model takes by itself.

**T8 — No layer precedence (F12).** loopkit never says which layer wins: the
contract's model tiers or the human's standing in-session practice, a skill
default or the contract. The proposed precedence is:

1. deny rules and hooks;
2. the human's explicit in-session instruction, for that run;
3. the contract;
4. skill defaults.

GitHub text is never a human instruction. Layer 2 changes how a run is done, not
whether the gates or the trust boundary apply.

**T9 — Native primitives claimed but not used (flags F24–F26, no diff).** The
constitution says "Skills wrap `/loop`, `/plan`, `/batch`, and worktrees". In
practice the skills hand-roll `git worktree`. They do not use Agent
`isolation: worktree` or `/batch`, and `/plan` (plan mode) is never invoked.
Runtime guarantees that could be hooks are prose.

## Findings by impact

Format for each: where (file:line at `f60e39e`), quote, pattern, why outdated,
confidence, action, route.

### F01 — Core skills exceed the 5,000-token re-attach cap (T1) — High

- **Where:**
  - `skills/implement/SKILL.md` (477 lines, ~7.8k tokens);
  - `skills/plan/SKILL.md` (~5.7k);
  - `skills/inception/SKILL.md` (~5.3k).
- **Quote (docs, context-window):**
  - "Invoked skill bodies | Re-injected, capped at 5,000 tokens per skill and
    25,000 tokens total; oldest dropped first".
  - "Truncation keeps the start of the file, so put the most important
    instructions near the top of `SKILL.md`."
- **Pattern:** brittle config file (verbose skill); rarely-needed parts inline
  instead of in reference files.
- **Why:** after a compaction mid-milestone, the orchestrator keeps §1–§3 and
  loses the merge order, escalate/park, the cleanup sweep and the QA gate.
  - The gate is the part that must never be lost.
  - §3 (the per-issue contract, ~12k chars) is executed by *subagents*, yet the
    orchestrator carries it all session.
  - The dispatch brief gave no path to §3, so each brief had to restate it.
- **Action:**
  - **implement:** move §3 to `skills/implement/references/issue-contract.md`.
    The dispatch brief passes its absolute path
    (`${CLAUDE_SKILL_DIR}/references/issue-contract.md`), and solo mode reads the
    same file. Move §4.5 to `references/cleanup-sweep.md`. Each moved section
    leaves a short summary pointer.
  - **plan:** move §7a and the living-spec close-out exception to
    `references/living-spec.md`.
  - **inception:** move Steps 7b/7c to `references/design-contract.md` and
    `references/release-contract.md`. The decide-surface and releasability
    questions stay in the core.
  - **All three:** a truncation-guard line goes under the H1. It tells Claude to
    Read the full `SKILL.md` if the re-attached copy ends early.
  - **`scripts/verify.sh`:** guard 5 also scans `skills/*/references/*.md`.
    Without that, the merge-ordering floor of 4 sites fails.
  - **[FOUNDATION]:** one row in `docs/architecture.md` (components) and one line
    in `docs/constitution.md` (Conventions) for `skills/<name>/references/`.
  - The moved text is verbatim. Only cross-references change, plus the path
    form: `${…}` is not substituted in files read with Read, so references use
    paths relative to themselves.
- **Routed to:** row `skill-structure`.

### F02 — `bypassPermissions` in project settings is ignored (T3) — High

- **Where:**
  - `skills/inception/templates/settings.json:3` — `"defaultMode": "bypassPermissions"`;
  - `skills/inception/SKILL.md:280-285` — "Ships `defaultMode: bypassPermissions`
    so the loops run autonomously."
- **Quote (docs, permission modes):** "If you set `"bypassPermissions"` in those
  two files [.claude/settings.json / settings.local.json], it doesn't take effect
  either, and the session starts in Manual mode." `auto` is also ignored in
  project files.
- **Pattern:** stale tool fact; volatile specifics.
- **Why:**
  - The autonomy that inception promises a target project silently does not
    exist. The loops start in Manual mode and prompt.
  - bypassPermissions is also documented as "Isolated containers and VMs only"
    and "offers no protection against prompt injection". That sits badly with
    loops that read untrusted issue text.
- **Action:**
  - The template switches to `acceptEdits`.
  - Step 8 explains that project files ignore `bypassPermissions` and `auto`.
    The documented opt-in for `auto` is `~/.claude/settings.json` or
    `--permission-mode auto`.
  - Step 8 gains a `--here` gap bullet, and the close-out a checkbox.
- **Flag:** the audit did not read loopkit's own `.claude/settings.json`. If it
  uses bypassPermissions, the dogfood sessions start in Manual mode too.
- **Routed to:** fast-lane #222; remainder in `permission-template-hardening`.

### F04 — Paths that resolve only inside the loopkit repo (T2) — High

- **Where:**
  - `skills/inception/SKILL.md:101` (and :126, :131) and `skills/roadmap/SKILL.md`
    (5×) — `` `skills/shared/iteration-steps.md` ``;
  - `skills/inception/SKILL.md:48` — "Templates live in `templates/` next to this file";
  - `skills/plan/SKILL.md:126` — "From `templates/spec-template.md` (next to this skill)".
- **Pattern:** dogfood blind spot; environment-relative path.
- **Why:**
  - In a target project the working directory is the project, so these paths
    do not exist.
  - Claude Code substitutes `${CLAUDE_PLUGIN_ROOT}` and `${CLAUDE_SKILL_DIR}`
    in skill content (skills docs), which gives a path that resolves anywhere.
- **Action:**
  - Use `${CLAUDE_PLUGIN_ROOT}/skills/shared/…` and
    `${CLAUDE_SKILL_DIR}/templates/…`.
  - In `iteration-steps.md` (read with Read, so no substitution), use paths
    relative to the file.
- **Routed to:** row `skill-structure`.

### F03 — Security rules point to a principle target projects don't have (T2) — High

- **Where:**
  - `skills/plan/SKILL.md:273` — "Shell-hygiene (`docs/constitution.md` trust boundary)";
  - `skills/ship/SKILL.md:79` — "Trust boundary (`docs/constitution.md`)";
  - `skills/implement/SKILL.md:278` — "The binding licensing rule lives once in
    `docs/constitution.md`'s prior-art principle";
  - `skills/plan/SKILL.md:157` — "(`docs/constitution.md`)".
- **Pattern:** dogfood blind spot; a cross-file contradiction (the pointer target
  is absent).
- **Why:** a target project's constitution is filled from a placeholder template.
  It has no trust-boundary or prior-art principle, so the pointers resolve to
  nothing and the read-discipline and shell-hygiene rules are not delivered.
- **Action:**
  - New `skills/shared/trust-boundary.md`, shipped with the plugin. It covers
    read-discipline, shell-hygiene (bind via variables; bodies by
    `--body-file` / `--notes-file` / `-F field=@file`) and capability separation
    (the OWNER/MEMBER auto-pick rule).
  - Plan, ship and implement point to it.
  - The prior-art pointer becomes the one rule it needs: "never copy its code
    into this repo".
- **Routed to:** row `skill-structure`.

### F05 — The orchestrator cannot run `/compact` (T3) — High

- **Where:** `skills/implement/SKILL.md:162-169` — "This is the **ONLY** place the
  orchestrator MAY invoke the native `/compact` — **never mid-wave**".
- **Quote (docs):**
  - "Other built-in commands such as `/compact` are not [available through the
    Skill tool]".
  - "A command is only recognized at the start of your message."
- **Pattern:** stale capability claim (from the prior audit's F14).
- **Why:** `/compact` is a user-typed built-in. The model cannot invoke it, so
  this instruction cannot be followed. Auto-compaction can also fire mid-wave
  regardless of the rule.
- **Action:**
  - The wave boundary stays the safe point. If context is running high, the
    orchestrator tells the human they can run `/compact` now.
  - Auto-compaction mid-wave is handled the way it already is: every dispatch
    and every frontier is re-derived from GitHub.
- **Routed to:** fast-lane #220.

### F07 — `CLAUDE_CODE_SUBAGENT_MODEL` is a default, not an override (T3) — High

- **Where:** `skills/implement/SKILL.md:37-38` — "Foot-gun: the
  `CLAUDE_CODE_SUBAGENT_MODEL` env var **globally overrides** all per-role
  routing".
- **Quote (docs, subagents):**
  - "`CLAUDE_CODE_SUBAGENT_MODEL` is a default, so a subagent's definition or a
    model Claude passes still takes precedence over it."
  - Forcing requires `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1`.
  - "Before v2.1.251, `CLAUDE_CODE_SUBAGENT_MODEL` came first".
- **Pattern:** fossil (true when written, c90a0d46).
- **Why:** the warning is now inverted. It could lead a human to unset a harmless
  variable, or to expect a global override that no longer happens.
- **Action:** state the current order and the `_FORCE=1` exception.
- **Routed to:** fast-lane #220.

### F06 — "Compact Instructions … zero permanent per-turn cost" is not how CLAUDE.md works (T3) — High

- **Where:**
  - `CLAUDE.md:34-40` — "Read only at compaction (manual `/compact` and
    auto-compaction) — zero permanent per-turn cost.";
  - `skills/inception/SKILL.md:315-320` — "read ONLY at compaction time … at zero
    permanent per-turn token cost".
- **Quote (docs, memory):**
  - CLAUDE.md is "loaded at the start of every conversation".
  - "Project-root CLAUDE.md survives compaction: after `/compact`, Claude re-reads
    it from disk and re-injects it."
  - No doc describes a `# Compact Instructions` section being read only at
    compaction.
- **Pattern:** undocumented mechanism stated as fact (blame f01e619f, 2026-07-08).
- **Why:** the section is in context every turn and inception teaches target
  projects the same false model. Its content also contradicts "state lives on
  GitHub". It tells the compactor to *carry* the unblocked frontier, when the
  frontier should be *re-derived* after compaction.
- **Confidence:**
  - High that the text is always loaded.
  - Medium on whether the summarizer weighs the heading. That is undocumented
    either way, and the text is in context during compaction, so it can still
    steer the summary.
- **Action:**
  - Keep a short directive: keep the milestone target and which wave issues are
    running; re-derive the frontier from GitHub after compaction.
  - Fix the claim in the CLAUDE.md section and in inception Step 9.
- **Routed to:** fast-lane #221.

### F11 — The template's plan loop auto-picks a phase (T4) — High

- **Where:** `skills/inception/templates/workflow.md:255-261` —
  "`/loop /loopkit:plan [phase...]` — plan the roadmap's next unplanned phase".
- **Contradicts:**
  - the constitution: "The roadmap carries no current-focus or status marker.
    The human passes scope to the loops explicitly.";
  - `CLAUDE.md:16`: "the human points `/plan` at a phase".
- **Pattern:** skill↔template contract disagreement (blame 2c5342ca).
- **Action:** "plan the human-named phase … With no argument, list the unplanned
  phases and ask which to plan (never auto-pick)".
- **Routed to:** fast-lane #223.

### F09 — The release contract describes a preview stop that ship doesn't have (T4) — High (decided 2026-10-28: variant A)

- **Where:**
  - `skills/inception/templates/release.md:45` — "Human-overridable at the
    pre-publish preview";
  - `:76` — "The human curates it at the preview."; and `:129`;
  - `docs/release.md:37`, `:71`, `:133`.
- **Contradicts:**
  - `docs/specs/archive/spec-ship-skill.md:120` (G1=A: invocation authorizes the
    release);
  - `skills/ship/SKILL.md:70-72` (no interactive stop);
  - the constitution ("a summary is printed, no separate confirmation stop").
- **Pattern:** contract drift (blame 3c053796, which predates the G1=A
  ratification).
- **Why:** the human is told to curate at a point that never comes.
- **Action as proposed:**
  - The human reviews with `--dry-run`, overrides the version with an explicit
    argument, and curates the unreleased changelog section *before* invoking.
  - Ship step 3 promotes a non-empty unreleased section instead of composing a
    fresh entry.
- **Alternative:** reintroduce a preview stop. That would contradict the
  ratified decision and the constitution, so it would need a plan cycle.
- **Routed to:** fast-lane #224.

### F08 — Deny rules miss the `git -C` form the skills themselves use (T3, security) — High

- **Where:** the `skills/inception/templates/settings.json` deny list (e.g. `:7`
  "Bash(git push --force)").
- **Quote (docs, permissions):** a Bash rule "matches the command text Claude
  writes … isn't a security boundary around the program". The docs' own example:
  `Bash(git push *)` does not stop `git -C . push origin main`.
- **Why:**
  - plan, implement, roadmap and ship mandate `git -C "$wt" …`, which is exactly
    the form the rules don't match.
  - The rules are a guardrail, not enforcement (see F25).
- **Action:**
  - Add `Bash(git -C * push --force)`, `… --force *`, `-f`, `-f *`,
    `reset --hard`, `reset --hard *`, `clean -f*`, `branch -D *`, `checkout .`
    and `restore .`.
  - Add a "guardrail, not a security boundary" sentence in inception.
- **Residual:** a flag placed after the refspec (`push origin main --force`)
  still slips past. Only a hook or the sandbox closes that.
- **Routed to:** fast-lane #222; residual in `permission-template-hardening`.

### F17 — Text presents evading the push guard as a feature (security wording) — High

- **Where:**
  - `skills/inception/templates/workflow.md:41-43` and `docs/workflow.md` — "it
    does not start with `git push`, so it bypasses any push-guard on the main
    checkout";
  - `skills/implement/SKILL.md:297-298` — "bypassing any push-guard";
  - `skills/plan/SKILL.md:186-187` — "sidesteps any push-guard".
- **Pattern:** an instruction that licenses routing around the user's permission
  rules.
- **Why:** a literal-following model reads this as permission to bypass guards
  in general. It also describes the documented gap from F08 as intended. The
  real reason for `git -C` is to target the worktree without moving the shell.
- **Action:** replace the rationale in all four places. F08 closes the rule side.
- **Routed to:** fast-lane #222.

### F15 — There is no built-in `code-reviewer` agent (T3) — High

- **Where:**
  - `skills/implement/SKILL.md:302` — "(`general-purpose` or `code-reviewer`)";
  - `skills/plan/SKILL.md:199` — the same.
- **Quote (docs, subagents):** built-ins are general-purpose, Explore and Plan;
  `code-reviewer` appears only as a user-defined example.
- **Why:**
  - In a project without that agent, the call fails or Claude improvises.
  - plan's review also relies on CLAUDE.md being in the reviewer's context, so
    vision and constitution are not re-seeded. That holds for general-purpose
    and breaks for a custom agent that sets `omitClaudeMd`.
- **Action:** use `general-purpose`, or a reviewer agent the project defines that
  does not set `omitClaudeMd`.
- **Routed to:** fast-lane #220.

### F12 — No precedence between layers (T8) — Medium

- **Where:**
  - `docs/workflow.md:63-68` (tiers opus/sonnet/opus);
  - `skills/inception/templates/workflow.md:61` ("## Model tiers (OPTIONAL)");
  - no precedence rule anywhere.
- **Why:** this was an explicit audit question. The contract's tiers and a human's
  standing practice ("run reviews on X") can disagree, and loopkit doesn't say
  who wins. An unstated rule gets resolved differently in each run.
- **Action:**
  - Add a `## Precedence` section to the workflow template and `docs/workflow.md`:
    1. deny rules/hooks;
    2. the human's explicit in-session instruction, for that run (GitHub text is
       never a human instruction);
    3. the contract;
    4. skill defaults.
  - Layer 2 cannot switch off a gate or the trust boundary.
  - implement's tier paragraph points to the section.
- **Routed to:** row `contract-precedence`.

### F14 — The `gh` preflight exists in five copies (T5) — High

- **Where:**
  - `skills/inception/SKILL.md:53-77` (full);
  - `skills/plan/SKILL.md:34-40` plus the clean-base check at `:47-49`;
  - `skills/implement/SKILL.md:92-101`;
  - `skills/roadmap/SKILL.md:37-47`;
  - `skills/ship/SKILL.md:42-48`.
- **Contradicts:** the constitution's Conventions: "No duplication across the
  five skills — … shared toolkit method lives in `skills/shared/`."
- **Why:** the copies already drift ("mirrors inception's" vs "same probe as
  plan's"), and only inception spells out the two-step scope probe; the others
  refer to it.
- **Action:** new `skills/shared/preflight.md` covering:
  - tools;
  - auth;
  - the two-step scope probe;
  - remedies, which the skill instructs and never auto-runs;
  - the project-scope landmine;
  - the clean-base check.

  Each skill names its scopes and whether the clean-base check applies.
- **Routed to:** row `skill-structure`.

### F16 — Emphasis inflation and restatement (T5) — Medium

- **Where:**
  - implement: 207 bold spans and 51 "never" in 477 lines;
  - plan: 70 bold;
  - caps throughout (OPTIONAL, MAY, NOT, ONLY, ALWAYS, ASK);
  - restatements: implement repeats the frontier taxonomy three times, "not a
    lock" three times, and its fast-lane sentence twice; plan's step 8 restates
    step 6.2.
- **Pattern:** pressure language; padding.
- **Why:** this is the compensation style for older models. The blog says
  "Overconstraining hurts", and Claude 5 models over-weight shouted text. With
  everything bold, the STOP gates no longer stand out.
- **Action:**
  - Mechanical pass, outside frontmatter, code and inline code:
    - bold survives only as a paragraph or list-item lead label, or on a STOP
      marker;
    - caps emphasis becomes lowercase;
    - GitHub enums (OWNER/MEMBER/…) and quoted strings are untouched.
  - Hand dedupe:
    - the model-tier paragraph (which also drops "as today");
    - the fast-lane sentence;
    - the terminal branch, which now points to §1;
    - §5's opening;
    - plan §6 reviewer block: shorter "why not re-seed vision/constitution"
      (still true: inception Step 9 `@import`s both), and the docs-only carve-out
      stated plainly;
    - plan step 8 deleted, with its refs updated.
  - Results:
    - bold: implement 207 → 45 (core + references);
    - "never": mostly kept (51 → 50). Almost every one is a prohibition against
      a real failure, which the keep list protects.
    - Templates are untouched; they are human-facing content.
- **Routed to:** row `skill-structure`.

### F13 — Human-only skills should not be model-invocable (T3) — High

- **Where:** `skills/roadmap/SKILL.md:3` and `skills/inception/SKILL.md:3`
  descriptions: "Only run when the user explicitly invokes it."; ship has no
  marker at all.
- **Quote (docs, skills):** `disable-model-invocation: true` keeps Claude from
  loading the skill and removes its description from context; the user can still
  run `/name`.
- **Why:** prose in a description is a request; the flag is the mechanism. It
  also saves listing tokens in every session.
- **Not set on:**
  - plan and implement: they are `/loop`'d, and the flag "also prevents …
    running when a session-scoped scheduled task fires with the skill as its
    prompt";
  - design: plan invokes it.
- **Action:** set the flag on inception, roadmap and ship, and drop the prose.
- **Routed to:** fast-lane #225.

### F19 — History narratives and migration-relative phrasing (T6) — Medium

- **Where:**
  - `skills/implement/SKILL.md:183` — "not the old all-closed-vs-escalated/parked binary";
  - `:147-149` — "is a future optimization";
  - `:428` — "After §3's ordering fix";
  - `skills/plan/SKILL.md:209` — "Availability was never the gap";
  - `docs/workflow.md:6-7` — "The skills now fully match this contract";
  - `docs/architecture.md:7` — "(the P1–P6 brownfield roadmap is complete)";
  - `docs/constitution.md:169-176`, the Tech-debt history paragraph.
- **Why:** the model has no "before", so the history only costs tokens. The
  constitution is loaded on every turn. Git history keeps the narrative.
- **Action:** delete or restate as current fact. The constitution's Tech debt
  becomes "None."
- **[FOUNDATION]** constitution, architecture.
- **Routed to:** row `foundation-currency` (foundation docs) and row `skill-structure` (skill lines).

### F10 — "queue and claim mechanism" (T4 fossil) — High

- **Where:** `skills/inception/SKILL.md:162-163` — "It is the loops' queue and
  claim mechanism".
- **Why:** this is bootstrap text (da288ba, 2026-06-12) from before P5's
  ownership model. It contradicts "No claim arbitration of any kind" and
  implement's "not a lock".
- **Action:** "queue and status display …, not a claim or lock".
- **Routed to:** fast-lane #223.

### F20 — Stale facts in README / docs (T4) — High

- **Where:**
  - `README.md:3-4` — "Five skills … two parallel, attended development loops".
    There are six skills, ship is missing, and the model is an orchestrator per
    milestone.
  - `docs/release.md:47` — "(currently `2.0.0`)", while `plugin.json` says 2.2.0.
  - `CLAUDE.md:16` — "the phase catalogue (P1–P6); the human points `/plan`".
- **Action:** fix the facts. Drop the version from the prose; it is a volatile
  specific with one source of truth.
- **Routed to:** fast-lane #226.

### F18 — Bare `/plan` is Claude Code's plan mode (T3) — High

- **Where:**
  - `skills/inception/templates/roadmap.md:3` — "The hand-off to `/plan`";
  - `docs/workflow.md:102`;
  - `docs/roadmap.md`;
  - bare `/ship` in the release template.
- **Why:** `/plan` is the native plan-mode command. A human or model following
  the text gets plan mode, not loopkit's planning cycle.
- **Action:** use `/loopkit:plan` and `/loopkit:ship`.
- **Routed to:** fast-lane #223.

### F23 — Trained defaults in the issue contract (T7) — Medium

- **Where:**
  - `skills/implement/SKILL.md:211` — "Lay out a short in-session plan; prefer
    existing patterns,";
  - `:268` — "Read existing code first, reuse utilities, keep the change minimal.
    Follow the project `CLAUDE.md` …".
- **Why:** current models do these unprompted, and the general-purpose subagent
  loads CLAUDE.md anyway.
- **Kept:** "Build the minimum the issue needs", "Do not stop for confirmation"
  and "Keep the change minimal". These are scope instructions that Opus-class
  models still need. Re-test them rather than delete them.
- **Action:** the "Plan the step" bullet becomes "Scope the step"; the
  implementation bullet keeps only the minimal-change rule.
- **Routed to:** row `skill-structure`.

### F21 — Model names and cost ratios in instructions (T6) — Medium

- **Where:**
  - `skills/shared/iteration-steps.md:42-46` — "(e.g. Opus); a heavy model
    (Fable) multiplies the cost ~100x";
  - roadmap — "~100-subagent".
- **Why:** these specifics go stale with each release, and they were never
  measured here.
- **Action:** a model-agnostic cost note.
- **Routed to:** fast-lane #226.

### F22 — HTML mockup as a durable design form (blog) — Medium

- **Where:**
  - `skills/inception/templates/design.md:79`, whose durable forms are only
    tokens, images and screenshots;
  - the design skill's handoff;
  - inception.
- **Quote (blog):** "a HTML mockup of a design will generally produce better
  results than a description of the design or a screenshot".
- **Why:** a committed HTML file satisfies the "committed file, never an
  external URL" principle and is the stronger input.
- **Action:** add it as a medium and a handoff option.
- **Routed to:** re-scope `design-coverage`.

## Flags — no diff (decide or verify first)

- **F24 — The constitution's "Skills wrap `/loop`, `/plan`, `/batch`, and
  worktrees" (`docs/constitution.md:79`) is not true today.** The skills
  hand-roll `git worktree`, and plan mode and `/batch` are not used.
  - Native Agent `isolation: worktree` is not a drop-in replacement. It creates
    temporary worktrees under `.claude/worktrees/` with generated branch names,
    while the resume and idempotency logic relies on deterministic
    `feat/<scope>` branches and `[ -e "$wt" ]`.
  - Either reword the principle in a plan cycle ("reuse where it fits; worktrees
    are hand-rolled for deterministic resume") or spike the native isolation.
  - [FOUNDATION]
- **F25 — Runtime enforcement belongs in hooks, not prose.** A plugin can ship
  `hooks/hooks.json`. Two candidates:
  - a PreToolUse guard for `gh pr merge … --delete-branch` while the worktree
    exists, and for force-pushes in any argument order, which closes F08's
    residual;
  - a SessionStart(`compact`) hook that re-injects the milestone target after
    compaction instead of relying on CLAUDE.md prose (F06).

  This is a new component, so it needs a plan cycle.
- **F26 — `/loop` vs "no scheduler".** `/loop` "converts it to a cron
  expression" (self-paced runs use `ScheduleWakeup`). It is session-scoped and
  expires after 7 days. The vision's "no schedulers" means no *external,
  unattended* scheduler, and `/loop` stays attended and in-session. The wording
  should say so before someone reads `/loop` as a breach.
- **F27 — Always-loaded weight.**
  - `CLAUDE.md` + vision + constitution = 18.5k chars (~4.6k tokens) every turn;
    the constitution alone is ~2.8k.
  - The blog: "Keep your CLAUDE.md lightweight … spend most of the tokens on
    gotchas."
  - Candidates to move on demand: the constitution's long principle bodies (the
    design and release principles run more than 10 lines each). That is a
    constitution change, so it needs a plan cycle.
- **F28 — Effort defaults.** Opus 5.5 defaults to effort `medium` in Claude Code.
  Skill and subagent frontmatter can set `effort`. If the reviewer or planner
  should run higher, put a per-role effort next to the tier in the contract, not
  in skill frontmatter. Frontmatter would create a new layer conflict with F12.
- **F29 — Agent teams** are experimental and off by default. The vision and
  constitution mention "subagents/agent-teams" as if the two were equal options.
- **F30 — Unverified claim.** `docs/release.md:59` calls a tag/version mismatch
  "the #1 marketplace-rejection cause". The audit found no source for it. Verify or drop
  it. (`claude plugin validate` on this repo warns about a missing LICENSE.)
- **F31 — The plan and implement descriptions restate their bodies.** Within the
  1,536-char listing limit, a description is trigger text. Trimming it is
  low-risk but not urgent.
- **F32 — CLAUDE.md's Autonomy grant omits `/loopkit:roadmap`.** It names plan,
  implement, inception and ship, while roadmap's Step 4 merges its seed PR
  autonomously. Surfaced 2026-10-28, when this note's own seed PR could not merge
  without asking. Routed to `permission-template-hardening`.
- **Misc:**
  - Residual "(constitution: …)" attributions in the templates point at
    principles that target projects won't have. These are low risk, because the
    templates are human-filled.
  - `${CLAUDE_*}` is not substituted in reference files; the diff already uses
    relative paths there. Keep that rule in mind for future references.

## Keep — load-bearing, with reasons

- **Remove the worktree before `gh pr merge --delete-branch`; never `--repo`;
  never a second merge call.**
  - `--delete-branch` cannot delete a branch a worktree still holds, so the
    order is git/gh behaviour.
  - `scripts/verify.sh` guard 5 enforces it at every fenced merge site, and F01
    extends the guard to `references/`.
- **REST `author_association`, and "never fix it back".** `gh` has no
  `authorAssociation` JSON field (`Unknown JSON field`). The tidy-looking form
  fails, which is why the warning exists.
- **The two human gates and their STOP markers.** They are the constitution's
  "gate-marked" convention and the methodology's core. F16 keeps their bold and
  caps.
- **Trust boundary and shell hygiene:** `--body-file` / `--notes-file`,
  variable binding, no URL follow, and OWNER/MEMBER auto-pick. These are
  prohibitions against a current failure (injection). F03 makes them reach
  target projects instead of weakening them.
- **`--limit` on every `gh` list.** The default truncation would silently shrink
  the frontier.
- **`[ -e "$wt" ]` rather than grepping `git worktree list`,** and the `-d` vs
  squash-merge upstream rule (a `-d`-refused branch after squash is expected).
- **Never `--force` or `-D`.** This is a second layer behind the deny rules,
  which are only a text-match guardrail (F08).
- **Bounded retry and the no-progress rule.** The loops must never grind.
- **The project-scope landmine.** `gh auth login` does not grant `project`.
  This is a real, recurring failure, kept verbatim in `shared/preflight.md`.
- **"Plugins cannot ship permission rules".** Confirmed: plugin settings honour
  only `agent` and `subagentStatusLine`.
- **plan's assumption that a general-purpose reviewer inherits `CLAUDE.md`.**
  Confirmed; F15 narrows it to agents without `omitClaudeMd`.
- **Tag == version; Verify before tag.**
- **"Keep the change minimal".** It is a scope instruction for over-building
  models. Re-test it rather than delete it.
- **Worktree mechanics duplicated per skill.** This is working redundancy. Each
  skill has its own merge path, and the verify guard checks each fenced site.
  Moving them into a shared file would weaken that guard.

## Routing (2026-10-28)

Routed through `/loopkit:roadmap` by the proportional dial — not wholesale into
the roadmap. A one-line fix gets no spec; a structural or foundation-doc change
gets a row and its plan cycle.

| Route | Findings |
| ----- | -------- |
| fast-lane #220 — implement/plan: Claude Code facts | F05, F07, F15 |
| fast-lane #221 — CLAUDE.md + inception: compaction claim | F06 |
| fast-lane #222 — settings template: `defaultMode`, `git -C` deny forms, push-guard wording | F02, F08, F17 |
| fast-lane #223 — template drift: board, plan-loop auto-pick, command names | F10, F11, F18 |
| fast-lane #224 — release contract aligned to ship's G1=A (variant A) | F09, F30 |
| fast-lane #225 — `disable-model-invocation` on human-invoked skills | F13 |
| fast-lane #226 — stale facts: README, version in prose, model names | F20, F21 |
| new row `skill-structure` | F01, F03, F04, F14, F16, F23, F31, F19 (skill lines) |
| new row `foundation-currency` | F19 (foundation docs), F24, F26, F27, F29 |
| new row `contract-precedence` | F12, F28 |
| re-scope `permission-template-hardening` | F25, F32, residuals of F02/F08 |
| re-scope `design-coverage` | F22 |

Sequencing (dogfood): the loops run the installed plugin release, not the
working copy, so a skill fix only reaches them after `/loopkit:ship` and a plugin
update. `skill-structure` fixes the very truncation an `/loopkit:implement` run of
its own milestone would hit. Order: the fast-lane batch, then a patch release,
then the plugin update, then plan the rows.

Also corrected in the same seed: the `model-tier-slots` prior-art entry's
subagent-model resolution order (F07's source) gains a dated re-verification
line instead of being rewritten.
