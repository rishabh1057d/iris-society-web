# Dependency security

Security-sensitive runtime dependencies are pinned and `pnpm-lock.yaml` is
committed. CI installs with `--frozen-lockfile` and audits production dependencies.
Preview/PR builds receive no production secrets. Dependabot opens update PRs;
maintainers must review and rerun site checks before merging them.

## Build-only braces patch

`braces@3.0.3`, used by Tailwind's file watcher, has no published fix for
[CVE-2026-93687 / GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
The checked-in pnpm patch bounds nesting/traversal to 64 levels in the parser,
compiler, expander, and stringifier. Normal content globs are much shallower;
excessively nested input gets a controlled SyntaxError instead of stack overflow.
The regression test exercises the patched installed package, including direct
AST entry points. No website HTTP endpoint accepts brace patterns.

`pnpm audit` still reports the original package version because advisories do not
inspect pnpm patches. This warning is not hidden or globally ignored. Runtime
dependencies must have a clean `pnpm audit --prod`; for the full audit this one
patched build-only finding is expected until upstream publishes a fixed version.
Replace the patch with an upstream fix when available and keep the regression test.
