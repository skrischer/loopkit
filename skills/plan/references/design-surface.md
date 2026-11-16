# Plan — design surface

> Paths in this file are relative to this file.

> Read when the scope has UI surface or a visualisation would materially clarify
> a decision (`../SKILL.md` §3).

Optional, by surface only. Invoke `/loopkit:design` from within this planning
cycle (it reads `docs/design.md` for every tool specific) and reference its
committed design artifact from the spec by repo path. The design travels in the
spec package and is reviewed at the spec-acceptance gate (`../SKILL.md` §6),
adding no new gate. The referenced artifact's presence is the design-surface
signal the implementer reads — no separate label. If `docs/design.md` is missing
or records `none`, the project did not enable the design phase: note it and
proceed without designing.

End of design-surface.
