---
# kind — which design surface this project needs; set exactly one. How to fill
# (YAML cannot be conditional, so the switch is prune-on-fill):
#   ui      — renders a UI: KEEP the color / type / spacing / radii / shadow
#             token blocks below.
#   concept — no UI, but a visualisation clarifies recurring decisions
#             (flow / state / architecture): DELETE those token blocks and fill
#             the "Diagram medium" section in the body instead.
#   both    — UI plus concept diagrams: KEEP the token blocks AND fill "Diagram
#             medium".
kind: "<ui | concept | both>"
# Design tokens — the durable, agent-readable contract for this project's UI
# (kind ui / both only). Placeholders only; inception fills them. The values
# below are the single source of truth for design — the design tool is the
# editor, this file is the state.
color:
  background: "<#hex>"
  foreground: "<#hex>"
  primary: "<#hex>"
  secondary: "<#hex>"
  accent: "<#hex>"
  muted: "<#hex>"
  border: "<#hex>"
  destructive: "<#hex>"
type:
  font-sans: "<font family>"
  font-mono: "<font family>"
  scale: "<e.g. 12 / 14 / 16 / 20 / 24 / 32 / 48 px>"
  weights: "<e.g. 400 / 500 / 600 / 700>"
  line-height: "<e.g. 1.5 body / 1.2 headings>"
spacing:
  unit: "<base unit, e.g. 4px>"
  scale: "<e.g. 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px>"
radii:
  sm: "<e.g. 4px>"
  md: "<e.g. 8px>"
  lg: "<e.g. 16px>"
  full: "<e.g. 9999px>"
shadow:
  sm: "<e.g. 0 1px 2px rgba(0,0,0,.05)>"
  md: "<e.g. 0 4px 12px rgba(0,0,0,.1)>"
---

# Design contract

> Design contract for the loopkit skills (`/loopkit:design`, `/loopkit:plan`,
> `/loopkit:implement`) — the single source for this project's design medium,
> rules, and handoff. Filled during inception for a design-surface project — one
> that renders a UI, or where a visualisation would materially clarify recurring
> decisions; the skills read it instead of hardcoding any tool. The sibling of
> `docs/workflow.md`. A project with neither surface records `none` and has no
> `docs/design.md`.

## Overview

`<One or two paragraphs: the project's visual character and design intent —
brand, mood, density, light/dark, accessibility target (e.g. WCAG 2.1 AA). Why
the tokens above are what they are. Implementation-free prose; the tokens carry
the values, this prose carries the rationale.>`

## Design tool

- Tool / MCP: `<the design editor this project uses — e.g. Paper MCP | Figma
  (Dev Mode MCP) | Superdesign | v0 | Claude artifacts>`. Pick exactly one as
  the primary editor; record any secondary tool and what it is used for.
- The tool is the **editor, never the source of truth.** The durable design
  state is the committed files in this repo (see Durable form), not anything
  living only inside the tool.
- Auth: in-session / subscription only — no headless run, no API key, no
  scheduler (constitution).

## Where designs live

- Source / working designs: `<where the editable design lives — e.g. a Paper
  file id, a Figma file URL, a Superdesign/v0 workspace>`. This is the editing
  surface; it is NOT durable state on its own.
- Committed tokens: `<repo path — e.g. docs/design.md front-matter above |
  design/tokens.json (W3C DTCG) | src/styles/tokens.css>`.
- Committed assets: `<repo path for exported images / screenshots — e.g.
  docs/design/assets/ | design/exports/>`.

## Diagram medium

`<kind: concept | both only — DELETE this section for kind: ui.>`

- Medium: `<the git-committable diagram medium — Mermaid (GitHub-native, diffs
  cleanly) | committed SVG (richer layout) | exported image>`. Pick one that
  renders in the review surface; the design mechanism hardcodes no medium.
- Where diagrams live: `<repo path — e.g. docs/design/*.svg | inline Mermaid in
  the spec / issue | docs/design/assets/>`. The committed diagram is the durable
  state, never an external editor's link.
- Decisions it clarifies: `<the recurring decisions this project draws to settle
  — e.g. flow / state machine / architecture / concept>`.

## Durable form

The durable design form is **a file committed to this repo** — a tokens file,
an exported image, or a screenshot — referenced from the spec or the issue. An
external-tool URL (a Figma / v0 / Paper share link) is NOT a valid durable form:
the tool is the editor, the committed file is the state (constitution:
GitHub-only durable state). When `/loopkit:design` finishes, the design exists
as a committed file at the location above, not as a link.

## Review path

- Reviewer: `<which reviewer / skill checks the design — e.g. the design
  critique skill | paper-reviewer | wcag-auditor | design-system-checker | an
  in-session Agent reviewer>`.
- The design is reviewed **AT the spec-acceptance gate** as part of the spec
  package — never a separate stop after planning (constitution: exactly two
  human gates). Reference, do not restate.

## Handoff format

- Format the implementer consumes: `<how the committed design reaches code —
  e.g. token file imported by the build | exported image referenced from the
  issue | Figma Code Connect mapping | screenshot annotated in the spec>`.
- `/loopkit:implement` consumes the committed artifact referenced from the
  UI-surface issue; it never reaches into the design tool.

## Components

`<Per recurring UI element, the rules an implementer must follow. One block per
component. Keep it to the elements this project actually ships.>`

- **`<Component, e.g. Button>`** — `<variants, sizes, states (default / hover /
  active / disabled / focus), which tokens it uses>`.
- **`<Component, e.g. Input>`** — `<states, validation styling, token usage>`.
- **`<Component, e.g. Card>`** — `<padding, radius, shadow, border tokens>`.

## Do's and Don'ts

**Do**

- `<e.g. Use the spacing scale above for every margin and padding.>`
- `<e.g. Meet the stated accessibility target on every interactive element.>`
- `<e.g. Reference only the named tokens — never a raw hex outside this file.>`

**Don't**

- `<e.g. Introduce a color, font, or radius not in the front-matter.>`
- `<e.g. Treat a share link as the design — commit the file.>`
- `<e.g. Add a third human gate — design is reviewed at spec-acceptance.>`
