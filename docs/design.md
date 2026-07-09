---
kind: concept
# UI-token blocks (color / type / spacing / radii / shadow) pruned per the
# template's prune-on-fill rule: loopkit renders no UI, so a concept contract
# carries no UI tokens. Its medium is defined in "Diagram medium" below.
---

# Design contract

> loopkit's design contract — the single source for its design medium, rules,
> and handoff, read by `/loopkit:design`, `/loopkit:plan`, and
> `/loopkit:implement` instead of hardcoding any tool. The sibling of
> `docs/workflow.md`. loopkit is a **concept-design** project: it renders no UI,
> so its design surface is the concept / flow / architecture diagrams that settle
> recurring decisions — `docs/design/loopkit-interpretation.svg` is the exemplar.

## Overview

loopkit's design intent is **conceptual clarity**: diagrams drawn to settle
flow, architecture, and mental-model decisions — not visual or brand design.
There is no UI to style, so the "design surface" is the shared understanding a
diagram creates. `docs/design/loopkit-interpretation.svg` is the exemplar — no
UI, yet a design artifact that drove alignment on how the loops interpret their
inputs. A diagram earns a place here only when it **materially clarifies a
recurring decision**; proportional ceremony holds, so a change that needs no
visualisation carries no design artifact.

## Design tool

- Tool: whatever authors the SVG in-session — hand-authored SVG or an in-session
  diagram step. There is no external design app in the loop; the medium is a
  committed `.svg`.
- The tool is the **editor, never the source of truth.** The durable design
  state is the committed `.svg` in this repo (see Durable form), not anything
  living only inside an editor.
- Auth: in-session / subscription only — no headless run, no API key, no
  scheduler (constitution).

## Where designs live

- Working / source diagrams: authored in-session and edited in place — there is
  no external workspace to point at.
- Committed diagrams: `docs/design/*.svg`. The exemplar is
  `docs/design/loopkit-interpretation.svg`.
- No committed tokens file — a concept contract has no UI tokens (front-matter
  blocks pruned).

## Diagram medium

- Medium: **committed SVG** (primary). loopkit deliberately does NOT use
  **Mermaid** — the GitHub-native alternative — because its diagrams (the
  per-skill cards in the "Skills" section, the "Prior-Art = Substrat" panel)
  need richer layout than Mermaid renders.
- Where diagrams live: `docs/design/` as committed `.svg`.
- Render-surface caveat (honest): a committed SVG renders in GitHub's **file /
  rich-diff view** and in local file explorers, **NOT** in the raw PR text diff
  (which shows the XML). It is durable GitHub state either way — the committed
  file is the state, never an external link.
- Decisions it clarifies: flow, architecture, and the mental model of how the
  loops interpret their inputs (the interpretation diagram is the exemplar).

## Durable form

The durable design form is **a `.svg` committed under `docs/design/`**,
referenced from the spec or the design-surface issue — e.g.
`docs/design/loopkit-interpretation.svg`. An external-tool URL (a Figma / v0 /
Paper share link) is NOT a valid durable form: the tool is the editor, the
committed file is the state (constitution: GitHub-only durable state). When
`/loopkit:design` finishes, the design exists as a committed `.svg`, not as a
link.

## Review path

- Reviewer: an **in-session Agent reviewer**.
- The design is reviewed **AT the spec-acceptance gate** as part of the spec
  package — never a separate stop after planning (constitution: exactly two
  human gates). The interpretation SVG rode in its own spec PR and was reviewed
  there.

## Handoff format

- Format the implementer consumes: the committed `.svg` referenced from the
  design-surface issue (or its spec).
- `/loopkit:implement` reads the committed `.svg` at the referenced path; it
  never reaches into a design tool.

## Diagram conventions

- One concept per diagram — a flow, a state model, or an architecture view; do
  not cram unrelated concerns into one `.svg`.
- Self-contained: readable from the committed file alone, with no external font
  or asset dependency (the interpretation SVG inlines `system-ui` fallbacks).
- Keep the source hand-editable — a diffable `.svg` a future worktree can open
  and amend, not a flattened export.
- Language: **English**, per the binding constitution convention (all artifacts
  in English) — diagrams included, no exception. The exemplar
  `loopkit-interpretation.svg` is authored in English.

## Do's and Don'ts

**Do**

- Commit the `.svg` under `docs/design/` and reference it from the spec / issue.
- Keep it diffable-by-file — hand-authored SVG a reviewer can open in the file /
  rich-diff view.
- Draw a diagram only when it materially clarifies a recurring decision
  (proportional ceremony).

**Don't**

- Treat a share link as the design — the committed file is the state.
- Hardcode the medium in a skill — the skills read this contract; the medium
  lives here only.
- Add a third human gate — the diagram is reviewed at spec-acceptance.
