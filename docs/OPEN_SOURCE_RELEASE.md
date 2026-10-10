# Open-source release verification

## Status: prepared, not yet released

This is a verification snapshot from 2026-10-10 for the hardening work in
[PR #6](https://github.com/rishabh1057d/iris-society-web/pull/6).
Production release and real-account verification remain pending. Do not describe
passing fixture tests as successful production Google sign-in or admin writes.

The society's existing free Supabase project is retained. No new project, paid
plan, paid protection feature, or storage service was created. Previews deliberately
disable database-backed features instead of sharing privileged production access.

## Original requirements and evidence

| Requirement | Implementation and evidence | Remaining work |
| --- | --- | --- |
| 1. Patch vulnerable dependencies | Next 15.5.27, React 19.3.0, Supabase JS 2.117.3 and committed lockfile. Production audit, build, typecheck and dependency regression tests passed in CI. | Full audit still reports the build-only patched `braces` version; see `DEPENDENCY_SECURITY.md`. Replace the local patch when an upstream fix is available. |
| 2. Isolate previews | Server/client preview guards and five isolation tests. Vercel saves privileged credentials as Production-only. Fork Protection and Vercel Authentication are enabled. A fresh cache-free Preview build completed and its participant UI showed `Registration unavailable`. | Three public `NEXT_PUBLIC_SUPABASE_*` settings remain shared: Vercel rejected scope-only edits of these write-only Secret variables. They are browser-public configuration, not privileged keys; preview code uses inert credentials and makes no database/auth calls. Do not restore private keys to previews. |
| 3. Scan complete history | Gitleaks ran locally across all fetched refs/history with redacted output and no findings. CI fetches full history and verifies the scanner download checksum before running it. GitHub secret scanning and push protection are enabled. | A clean scan is evidence, not a guarantee that no secret can ever be committed. Rotate any future confirmed exposure. |
| 4. Commit, deploy, test accounts | Fixes committed on `fix/open-source-readiness`. All admin handlers use verified server authorization; registration ownership is tied to the confirmed session email. Supabase grants/RLS and storage policies were inspected; internal function execution was restricted. Fixture tests and anonymous local HTTP tests passed. | Merge/release approval, Production deployment, then the real-account checks below. |
| 5. License code and clarify assets | Root MIT `LICENSE`, separate `ASSET_LICENSE.md`, bundled Khand OFL. Maintainer confirmed redistribution permission for Kids Dream and Samarkan. | Code MIT does not grant blanket rights to photos, branding, or third-party fonts. New assets still need explicit rights. |
| 6. Contributor/security setup | README, `CONTRIBUTING.md`, `SECURITY.md`, blank `.env.example`, safe fresh-project SQL seed and existing-project hardening script. Clean CI install/build uses no credentials. | Contributors needing database tests must supply their own development setup, not the society's production credentials. |
| 7. Review and automated checks | Pinned GitHub Actions, read-only workflow token, frozen install, audit, history scan, tests/build/typecheck/smoke. `main` requires one approving review, passing `checks`, up-to-date code and resolved conversations; force pushes/deletion are disabled. | Required code-owner review is deliberately off: once the new sole-owner `CODEOWNERS` file lands, that owner could not approve their own future PRs. Existing write-access collaborators can provide the required review. Owner override remains available, but has not been used and needs explicit release approval. |
| 8. Deliberate release cleanup | Local tooling/screenshots/credentials/build output ignored. Public configuration backup moved to ignored `.backups/`. 221 migrated image paths have decode/reference checks and legacy 308 redirects. | Old images/admin addresses remain in history. No destructive history rewrite was performed; keep a permanent copy of original images before temporary backup cleanup. |

## Measured verification

The clean Linux [CI run](https://github.com/rishabh1057d/iris-society-web/actions/runs/38045156997)
tested application commit `fac49fcd5fed3b2ff8bf3ab4ad7f86dffb4c18a8`:

- Frozen dependency installation without application credentials: passed.
- Production dependency audit: passed.
- Unit/fixture/preview/dependency/image tests: 20 passed, 0 failed.
- Production build and TypeScript check: passed.
- Built-site HTTP checks: 22 passed, 0 failed. These cover anonymous authorization,
  12 rendered routes, all 221 new image URLs and all 221 old redirects.
- Full fetched-history Gitleaks scan: passed, no findings.

An independent code reviewer approved the preview-guard correction. This does not
count as a GitHub maintainer approval. Desktop browser checks covered Beginner
guides and the clean-audio lesson, including its image and free-resource links.
The fresh Vercel Preview also rendered its disabled-registration explanation.
Direct API navigation in that browser was blocked by the browser client and is
not counted as a successful deployed endpoint test. No load test or comprehensive
new mobile UI audit was performed; no general UI redesign is part of this release.

## Production release gate

1. Obtain the required GitHub maintainer review, or explicit owner approval for a
   one-time override. Do not remove required checks to make a failing PR merge.
2. Merge only the reviewed, green head. Confirm Vercel deploys that exact commit
   to the society domain with Production variables, not a Preview promotion.
3. Run `pnpm test:smoke` with `TEST_BASE_URL` set to the society's HTTPS domain.
   These requests are anonymous and must not create or expose registrations.
4. In a private session, sign in with a real institutional student account. Confirm
   its own registration lookup works; attempts to read or submit another email
   return 403. Confirm each admin endpoint rejects this account with 403.
5. Sign in with a verified address in server-only `ADMIN_EMAILS`. Confirm admin
   identity/config reads and CSV export work; never attach the export or token to
   GitHub. Verify a config save with an agreed reversible change and restore it.
6. Test a genuine registration only when a real event is open and the participant
   intends to register. Do not open a closed event or inject dummy registrations
   into production merely to obtain a passing test. Check duplicate submission is
   refused with 409; closed/expired events must stay closed.
7. Inspect the affected registration/admin UI on phone and desktop. Record results
   here or privately without personal information, then mark release complete.

Private review needs an authenticated admin/student session, not a copied token in
a public report. Until this gate is complete, the implementation is prepared but
the production end-to-end requirement is unverified.
