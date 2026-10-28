# Release contract (Step 7c)

> Paths in this file are relative to this file.

The release sibling of the workflow contract: `/loopkit:ship` reads
`docs/release.md` instead of hardcoding a release tool. Proportional — only a
project with a versioned release/publish concept gets it; a throwaway /
experiment / unversioned-internal project records `none` and skips this step
entirely (no `docs/release.md`, no gate). Release applicability is broader than
design-surface — more projects publish than render UI — so the yes-rate is
higher; the optional framing still holds.

Fill `../templates/release.md` into `docs/release.md`, deriving values from the
vision/constitution/stack where you can rather than asking:

- **Versioning scheme** — semver / CalVer / build number, and how the next
  version is computed from the range since the last tag.
- **Version-bearing files** — the file(s) carrying the version string to bump;
  name the single source and any metadata-consistent siblings.
- **Tag format** — the tag shape; the tag must match the version exactly.
- **Changelog** — source range + format/file; the human curates the unreleased
  section before invoking (reviewed with `--dry-run`).
- **Publish target + command** — the native in-session `gh` / tooling command;
  release notes passed by file, never inlined.
- **Pre-publish Verify** — reference this project's Verify (from
  `docs/workflow.md`); do not restate the command.

The template's invariant prose (human-invoked, tag == version, trust boundary,
durable state, G1 = A) is loopkit-fixed — leave it intact, it is not a
placeholder.

**`--here`:** a missing or placeholder-stale `docs/release.md` on a releasable
project is a gap that routes here (Step 7c) — never a second bootstrap inside
`/loopkit:ship`; a non-releasable project's absent file is not a gap.

GATE: present the filled contract before writing `docs/release.md` (skip the gate
entirely when the project is not releasable).
