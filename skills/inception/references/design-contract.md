# Design contract (Step 7b)

> Paths in this file are relative to this file.

The design sibling of the workflow contract: `/loopkit:design` and the loops
read `docs/design.md` instead of hardcoding a design tool. Proportional — only a
project with a design surface gets it; a project with neither records `none` and
skips this step entirely (no `docs/design.md`, no gate).

Fill `../templates/design.md` into `docs/design.md`, deriving values from the
vision/constitution where you can rather than asking:

- **kind** — set the front-matter `kind` (`ui` / `concept` / `both`). Per the
  template's "How to fill" note this is prune-on-fill: for `concept`, delete
  the color/type/spacing/radii/shadow token blocks and fill the **Diagram
  medium** section (medium + where diagrams live) instead; for `ui`/`both`,
  keep the token blocks.
- **Design tool / MCP** — the editor this project uses (e.g. Paper MCP /
  Figma / Superdesign / v0 / Claude artifacts, or a diagram tool for a concept
  project); ask the user, pick exactly one primary. The tool is the editor,
  never the source of truth.
- **Where designs live** — the working surface (file/URL) and the committed
  token / asset / diagram paths in the repo.
- **Durable form** — a file committed to the repo (tokens / exported image /
  screenshot / committed diagram); an external-tool URL is not durable state
  (GitHub-only durable state). Leave the template's rule intact.
- **Review path** — which reviewer/skill checks the design; it is reviewed at
  the spec-acceptance gate, not a third stop.
- **Handoff format** — how `/loopkit:implement` consumes the committed
  artifact.
- **Tokens / Diagram medium, Components, Do's/Don'ts** — for `ui`/`both` fill
  the front-matter tokens and the component rules; for `concept` fill the
  Diagram medium instead. Derive from the design intent.

GATE: present the filled contract before writing `docs/design.md` (skip the gate
entirely when the design surface is `none`).
