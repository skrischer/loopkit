# Spec: skill-structure

> Created: 2026-10-28

Make loopkit's skills work in a target project and survive compaction: a
compaction-safe core `SKILL.md` per skill with on-demand `references/`,
plugin-relative paths, plugin-shipped shared preflight and trust-boundary
references, and a register pass. This spec carries no lifecycle state —
acceptance is the spec merged on the default branch with a milestone and
issues, and all progress lives in the GitHub issues and milestone. A completed
spec is moved to `docs/specs/archive/`.

## Outcome

- [ ] After a compaction, every invoked loopkit skill still carries what its run
      needs to reach its gate: the re-attached copy holds the whole core, or the
      core's truncation guard sends Claude to Read the full file.
- [ ] The per-issue subagent contract lives in
      `skills/implement/references/issue-contract.md`. The orchestrator passes its
      absolute path in every dispatch brief and no longer carries the contract
      itself. Solo mode reads the same file.
- [ ] Every path a skill gives to a plugin file resolves in a target project.
      Skill content uses `${CLAUDE_SKILL_DIR}` or `${CLAUDE_PLUGIN_ROOT}`; files
      read with Read use paths relative to themselves. No repo-relative
      `skills/…` or `templates/…` path is left.
- [ ] The `gh`/`git` preflight exists once, in `skills/shared/preflight.md`. Each
      skill names its scopes and whether the clean-base check applies, and keeps
      no copy.
- [ ] The read-discipline, shell-hygiene and capability-separation rules reach
      target projects through the plugin-shipped `skills/shared/trust-boundary.md`.
      No skill points at a principle only loopkit's own constitution carries.
- [ ] Bold survives only as a paragraph or list-item lead label or on a STOP
      marker. Caps emphasis is gone outside STOP/GATE markers, GitHub enums and
      quoted strings. The audit's restatements are deduped. Trained defaults and
      history phrasing are gone from the skills. Every keep-list rule is still
      present.
- [ ] The issue contract states what actually works for the review gate. It runs
      as a nested subagent, and when the Agent tool is withheld it falls back to
      `pr-open`, which the orchestrator completes.
- [ ] `argument-hint` is set on every argument-taking skill, and the plan and
      implement descriptions are trigger text, not a restatement of the body.
- [ ] `/loopkit:inception`'s readiness checklist checks the `CLAUDE.md` wiring,
      including the `# Compact Instructions` section, so `--here` reports a
      missing one as a gap.
- [ ] `scripts/verify.sh` enforces the structure:
      - the merge-ordering guard also scans `references/`;
      - each core `SKILL.md` stays within its size budget and carries its guard
        and end sentinel;
      - plugin-file paths use the plugin-relative forms;
      - every reference file is linked from its core.
- [ ] `docs/constitution.md` (Conventions) and `docs/architecture.md` (component
      map, boundaries, where new code goes) describe `references/` and the shared
      files. They ride this spec PR and are ratified at its acceptance.

## Scope

### In scope

- The split of `implement`, `plan` and `inception` into a core `SKILL.md` plus
  `references/`. Its depth is set by the size-budget decision below.
- A truncation guard under the H1 of every `SKILL.md`, and an end sentinel as its
  last line.
- The plugin-relative path forms in all six skills, `skills/shared/` and the new
  reference files, including the template pointers in inception and plan.
- New `skills/shared/preflight.md` and `skills/shared/trust-boundary.md`, and the
  pointers to them from the skills.
- The register pass over all six `SKILL.md` files and the new references:
  - emphasis;
  - restatements;
  - trained defaults (audit F23);
  - history phrasing in skill lines (audit F19, skill lines only).
- Issue-contract review-gate nesting: state the assumption, add the depth-limit
  fallback.
- `argument-hint` frontmatter; trimmed plan and implement descriptions (audit F31).
- Inception readiness checklist: the `CLAUDE.md` wiring item.
- `scripts/verify.sh`: guard 5 scope, and the new structure guards.
- Foundation edits (constitution Conventions, architecture), authored in this
  spec PR. The constitution's count-bound "across the five skills" becomes
  count-free.

### Out of scope

- Hooks: the SessionStart(`compact`) re-injection and the PreToolUse merge and
  force-push guards. They belong to `permission-template-hardening` (audit F25).
- Foundation-doc history phrasing, native-primitive honesty, always-loaded
  weight. These belong to `foundation-currency` (audit F19/F24/F27).
- Precedence between layers and per-role effort, which belong to
  `contract-precedence`. Its edits to implement's model-tier paragraph and to
  `docs/workflow.md` land after this spec, on the restructured layout.
- Template content. Templates are human-facing and stay untouched, apart from
  any path a skill hands over.
- Moving the per-skill worktree and merge mechanics into a shared file. The keep
  list rules that out: the duplication is working redundancy that guard 5 checks
  per site.
- `gate-evidence` and `implement-conflict-recovery`. Both are still unplanned and
  will plan against the restructured implement and plan.

## Constraints

- Constitution: skill prose is terse, imperative and gate-marked; there is no
  duplication across the skills. Exactly two human gates, whose STOP markers
  keep their emphasis. The trust boundary is unchanged in substance; this spec
  changes only how it reaches target projects.
- Foundation edits ride this spec PR and are ratified at spec-acceptance, never
  in `/loopkit:implement`.
- Verify stays green after every merge. Each issue leaves the tree in a state
  the current guards accept, and the new guards switch on last.
- Claude Code facts this spec relies on (verified 2026-10-28):
  - Skills docs: "re-attaches the most recent invocation of each skill after
    the summary, keeping the first 5,000 tokens of each. Re-attached skills
    share a combined budget of 25,000 tokens."
  - Context-window docs: "Truncation keeps the start of the file, so put the
    most important instructions near the top of `SKILL.md`."
  - The docs mention no marker on a truncated skill, hence the end sentinel.
  - Skills docs: "Keep `SKILL.md` under 500 lines". All six already pass this;
    the binding limit is the re-attach cap.
  - Plugins reference: `${CLAUDE_SKILL_DIR}` / `${CLAUDE_PLUGIN_ROOT}` resolve
    in "Skill, command, and agent content | Anywhere in the Markdown body".
  - Plugins reference: "The variables aren't present in the environment of
    commands Claude runs through the Bash tool, in the main session or in a
    subagent."
  - Skills docs: `${CLAUDE_SKILL_DIR}` is "the skill's subdirectory within the
    plugin, not the plugin root". The docs do not say substitution applies to
    files read with Read.
  - Subagents docs: "By default, a subagent can spawn subagents of its own, up
    to three layers below the main conversation. At the depth limit, Claude Code
    withholds the `Agent` tool from every subagent except a fork".
  - The depth limit is set by `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`.
- Size measurement:
  - The only first-party measure without an API key is `claude plugin details
    loopkit@loopkit` (on-invoke column, an estimate). For the 2.2.0 release it
    reports implement ~11.3k, plan ~8.2k, inception ~7.6k, roadmap ~3.3k,
    ship ~2.8k and design ~1.9k tokens. That is about 2.77 bytes per token on
    implement, so 5,000 tokens is about 13,850 bytes.
  - The audit's chars/4 estimate (implement ~7.8k) understates this by ~45%.
  - The subscription-auth rule rules out the token-counting API.

## Prior art

- [Skill structure for Claude 5 — compaction re-attach, progressive disclosure, plugin-relative paths (feature: skill-structure)](../prior-art.md#skill-structure-for-claude-5--compaction-re-attach-progressive-disclosure-plugin-relative-paths-feature-skill-structure)
  - Claude Code docs: the re-attach cap and the substitution rules (ADOPT a
    core holding everything a run needs to reach its gate, and plugin variables
    in skill content).
  - Agent Skills spec / anthropics/skills: the `references/` name, each linked
    from the core with when to read it.
  - VisiTrans: compaction hooks (ADOPT later via `permission-template-hardening`).
  - Anthropic's Claude 5 context-engineering essay: the register pass, with
    emphasis only where it guards a real failure.
- [Foundation-doc context budget (feature: foundation-dedup)](../prior-art.md#foundation-doc-context-budget-feature-foundation-dedup)
  — the precedent for slimming always-loaded descriptions. F31 applies it to
  plan and implement, the only loopkit descriptions left in the listing once
  inception, roadmap and ship carry `disable-model-invocation`.
- [Model-tier-per-agent — role-to-tier routing in the contract (feature: model-tier-slots)](../prior-art.md#model-tier-per-agent--role-to-tier-routing-in-the-contract-feature-model-tier-slots)
  — the reviewer-tier routing that the moved review gate keeps unchanged.

Internal evidence: `docs/feedback/2026-10-27-claude5-audit.md`
- findings F01, F03, F04, F14, F16, F19 (skill lines), F23 and F31;
- the "Keep — load-bearing" list, which this spec must not weaken.

## Human prerequisites

- none

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| The binding size limit is Claude Code's 5,000-token-per-skill re-attach cap, not the 500-line rule. | All six skills are under 500 lines. The cap is what drops implement's merge order, park rules, cleanup sweep and QA gate mid-run (audit F01). | 2026-10-28 |
| OPEN — core size target: a hard per-`SKILL.md` byte budget (and how deep the split goes) vs the audit's split plus the guard. | Resolved at the spec-acceptance gate (see open-decisions). | — |
| Every `SKILL.md` gets a truncation guard right under the H1 and an end sentinel as its last line, e.g. guard `If this skill's text stops before the line "End of /loopkit:<name>.", it was cut after a compaction — Read ${CLAUDE_SKILL_DIR}/SKILL.md in full before continuing.` with last line `End of /loopkit:<name>.` | The docs name no truncation marker, so a model cannot tell a cut copy from a whole one without a sentinel. The guard turns truncation into a self-healing Read whatever the tokenizer ratio turns out to be. Uniform on all six because it costs a few dozen tokens per invocation and is one rule to check. | 2026-10-28 |
| On-demand detail lives in `skills/<name>/references/<topic>.md`. The core links each file with when to read it. | The cross-agent Agent Skills convention (prior art). "Link each reference with when to read it" is what makes the core point the model at the file after a compaction. | 2026-10-28 |
| What moves: subagent-only text (implement §3) and parts a run needs only sometimes (implement §4.5; plan's living-spec path; inception's design- and release-contract steps). What stays: everything up to and including each STOP gate. Under the hard-budget option, post-gate mechanics also move behind a core pointer: plan's acceptance mechanics (milestone, roadmap link, merge, issues and board), and inception's readiness checklist. | The core keeps what a run needs to reach its gate (prior-art ADOPT). Post-gate mechanics are read once per cycle, so a pointer costs one Read and does not put the gate at risk. | 2026-10-28 |
| Moved text is moved first, then edited only by this spec's register pass and cross-reference fixes. No behaviour change rides the move except the review-gate fallback, the `CLAUDE.md` checklist item and the frontmatter. | Keeps the restructure reviewable as a move, and keeps behaviour changes small and named. | 2026-10-28 |
| Path forms. Skill-local files: `${CLAUDE_SKILL_DIR}/…` (templates, references). Shared files: `${CLAUDE_PLUGIN_ROOT}/skills/shared/…`. Inside files read with Read (references, shared files): paths relative to that file, e.g. `../inception/templates/prior-art.md` from `skills/shared/iteration-steps.md`. Never `${CLAUDE_…}` inside a referenced file. | Substitution happens only in the skill's Markdown body (plugins reference). The Bash environment does not carry the variables. loopkit ships only as a plugin (constitution tech stack), so `${CLAUDE_PLUGIN_ROOT}` always resolves. | 2026-10-28 |
| The orchestrator hands the subagent an absolute path. The dispatch brief quotes the substituted `${CLAUDE_SKILL_DIR}/references/issue-contract.md` path verbatim, and solo mode reads the same file. | A subagent's own context has no substitution for implement's variables, and the Bash env has none either. The orchestrator's loaded core already holds the substituted absolute path. This also fixes the audit F01 finding that dispatch briefs had no path to §3 and had to restate it. | 2026-10-28 |
| The review gate stays in the per-issue subagent, run as a nested subagent. If the Agent tool is unavailable to it (spawn-depth limit), the subagent stops after opening the PR and reports `pr-open` with the PR number. The orchestrator then runs the contract's review gate and merge step for that PR. `pr-open` is not a failed dispatch. | Docs: nesting is allowed by default, up to three layers, and the Agent tool is withheld only at the depth limit. Keeping the review in the subagent keeps the orchestrator's context and its core small, so the merge fence lives only in the issue contract. The session's belief that "subagents cannot spawn" was an unverified assumption, refuted by the docs. The fallback covers the configurable limit instead of failing silently. | 2026-10-28 |
| `skills/shared/preflight.md` covers: tools on PATH; `gh` auth; the two-step scope probe; remedies (always instructed, never auto-run); the project-scope landmine, verbatim; and the clean-base check. Each skill's preflight line names its scopes (`repo` + `project` for inception, plan and implement; `repo` only for roadmap and ship) and whether the clean-base check applies. | Five drifting copies (audit F14) contradict "no duplication across the skills". The landmine is on the keep list. Ship's extra checks (release contract present, pre-publish Verify green) stay in ship. | 2026-10-28 |
| `skills/shared/trust-boundary.md` covers: read-discipline; shell-hygiene (bind titles through variables; bodies by `--body-file` / `--notes-file` / `-F field=@file`); and capability separation. Capability separation means implement auto-picks a `track:adhoc` issue only for an OWNER/MEMBER author, read via REST `author_association` (no `authorAssociation` JSON field exists — never "fix it back"). plan, implement and ship point at it. The prior-art pointer in implement becomes its one operative rule: never copy external code into this repo. | Target constitutions are filled from a template with no trust-boundary or prior-art principle, so today's pointers deliver nothing (audit F03). All of these items are on the keep list; they move, they do not weaken. loopkit's own constitution principle stays binding for loopkit. | 2026-10-28 |
| Register pass: bold only as a lead label or STOP marker; caps emphasis lowercased except STOP/GATE, GitHub enums and quoted strings; restatements deduped (implement's frontier taxonomy, "not a lock", the fast-lane sentence, the model-tier paragraph; plan step 8 folded away). The trained defaults "lay out a short plan" and "read existing code first" are dropped; "keep the change minimal", "build the minimum the issue needs" and "do not stop for confirmation" stay. History phrasing in skill lines goes ("not the old … binary", "is a future optimization", "after §3's ordering fix", "availability was never the gap"). Templates are untouched. | Audit F16/F23/F19, the prior-art essay ("overconstraining hurts"), and the keep list. The STOP gates stand out again only once the surrounding bold is gone. | 2026-10-28 |
| `argument-hint`: inception `[pitch | --here]`, roadmap `[idea ...]`, ship `[vX.Y.Z] [--dry-run]`, plan `[phase ...]`, implement `[milestone | issue-number]`. design gets none (plan invokes it with the spec in context). | Docs: "Hint shown during autocomplete". Inception, roadmap and ship are typed by the human; plan and implement are typed and also run under `/loop`. | 2026-10-28 |
| The plan and implement descriptions become trigger text: what the skill does, when to use it, and its argument forms. No mechanics. | Audit F31. With `disable-model-invocation` on the other three, these two plus design are the only always-loaded loopkit descriptions. The `foundation-dedup` precedent applies. | 2026-10-28 |
| Inception's readiness checklist gains a `CLAUDE.md` item covering the vision and constitution `@import`s, the on-demand list, the Autonomy grant and a `# Compact Instructions` section (Step 9). | `--here` diffs against this checklist, so a missing item was never reported. The section is what carries the milestone target through a compaction in a target project, which is this row's subject. | 2026-10-28 |
| `scripts/verify.sh`: guard 5 also scans `skills/*/references/*.md` (it must land before any merge fence moves). New guards come after all skills comply: a path-form guard; the guard-and-sentinel guard; the reference link guard (every file in a `references/` dir is named in its `SKILL.md`, and every `${CLAUDE_SKILL_DIR}/references/…` pointer resolves); and, if the hard budget is chosen, a size guard. The merge-site floor stays 4. | Guard 5's own note limits it to the ordering invariant, so the new checks are separate guards, not a skill-prose linter grown from guard 5. Merge sites stay at 4: implement's moves to `references/issue-contract.md`; plan's moves to `references/acceptance.md` under the budget option; roadmap's and ship's stay. | 2026-10-28 |
| Constitution Conventions names `skills/<name>/references/` and the plugin-relative path rule (grep-verifiable). "across the five skills" becomes "across the skills". Architecture gains a `skills/*/references/` row, an updated `skills/shared/` row, and matching boundary and where-new-code-goes lines. | The roadmap row's recorded foundation impact. The count fix sits in the same Conventions bullet and avoids the next drift (there are six skills). | 2026-10-28 |

## Tracking

- Milestone: [skill-structure](<milestone-url>)
- Issues: created from this spec once it is merged (one per implementable step)

Each issue references this spec path in its body.

## Verification

- [ ] `bash scripts/verify.sh` passes, and its output includes:
  - [ ] merge-ordering guard: 4 sites, including the ones now in `references/`;
  - [ ] the path-form guard;
  - [ ] the guard/sentinel guard;
  - [ ] the reference link guard;
  - [ ] the size guard, if chosen.
- [ ] Machine-checked by Verify:
  - every `SKILL.md` has the guard line under its H1 and ends with its sentinel;
  - no `SKILL.md` names a plugin file by a repo-relative `skills/…` or
    `templates/…` path;
  - no file under `references/` or `skills/shared/` contains `${CLAUDE_`.
- [ ] `grep -rn "docs/constitution.md" skills/*/SKILL.md skills/*/references skills/shared`
      finds no pointer used as a rule source. Mentions that name the target
      project's own artifact, such as inception writing it or plan's review
      seed, are fine.
- [ ] Human QA, target-project smoke test:
  - in an empty temp directory, start `claude --plugin-dir <loopkit main checkout>`;
  - run `/loopkit:inception` and stop after Step 0;
  - the preflight runs from `skills/shared/preflight.md` and names the real
    absolute plugin path.
- [ ] Human QA, compaction check. In the same kind of session:
  - invoke `/loopkit:implement` (no argument, idle report), then run `/compact`;
  - ask Claude to quote the last line of the implement skill in its context. It
    is `End of /loopkit:implement.`, or Claude reports the guard and Reads the
    file.
  - Repeat for `/loopkit:plan`.
- [ ] Human QA, review pass:
  - the implement core still states the merge order (via the issue-contract
    pointer), the escalate/park routing, the cleanup-sweep pointer and the QA
    gate;
  - plan's core still states the spec-acceptance STOP gate;
  - each keep-list rule from the audit note is present somewhere in the skill
    tree.
- [ ] `claude plugin validate .claude-plugin/plugin.json` accepts the new
      `argument-hint` fields. Verify guard 2 runs this.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| The milestone is implemented by the installed 2.2.1 skills, so the very truncation it fixes can hit its own run. | The orchestrator re-reads `skills/implement/SKILL.md` after any compaction, as standing practice. The wave boundary is the safe compaction point. |
| The estimator's bytes-per-token ratio is wrong in either direction. | The guard and sentinel make truncation self-healing whatever the ratio. The size budget, if chosen, is a cost optimization on top. |
| The register pass deletes a load-bearing prohibition. | The keep list is an acceptance item, and the reviewer checks each entry against the diff. |
| A moved reference is never read, for example a subagent brief that omits the path. | The reference link guard; the dispatch brief quoting the path is an acceptance item; the compaction QA check. |
| Parallel restructure issues conflict on shared lines. | One issue per skill file. Shared files are created first. verify.sh changes are serialized by `Depends on:`. |
| `contract-precedence`, `gate-evidence` and `implement-conflict-recovery` edit the same skills. | They plan after this spec merges, against the new layout; the roadmap's shared-spine note already orders them. |

## Decision log

- 2026-10-28: Follow-up "subagents cannot spawn subagents" was checked against
  the subagents docs and found false (nesting up to three layers by default).
  The issue contract keeps the review in the subagent and adds the depth-limit
  `pr-open` fallback instead of moving review and merge to the orchestrator.
