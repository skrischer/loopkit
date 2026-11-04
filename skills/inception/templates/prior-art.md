# Prior Art

> Descriptive, living document. Indexed BY CONCERN, not by project. Add
> entries whenever new references surface; gaps are fine.
>
> Tag each concern header with the roadmap rows it feeds, one kind per header:
> `(Phase N)`, `(Phase N, M)`, `(feature: <slug>)` or `(feature: <slug>, <slug>)`
> — so `/loopkit:plan` can resolve "prior art for phase N" deterministically. A
> header keeps the tag it was created with; a row that later draws on the concern
> goes on an `Also feeds:` line directly under the header.

## <Concern> (Phase N)

### <org/repo>

- Path: <concrete file or directory>
- License: <SPDX id>
- Verdict: reuse | reference-only | avoid — <why>
- Date: <YYYY-MM-DD>
- Notes:
  - ADOPT: <what to take/reuse from this prior art for our scope>
  - AVOID: <what to deliberately not do — where it over-reaches or goes wrong for us>
