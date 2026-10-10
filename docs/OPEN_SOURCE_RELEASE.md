# Open-source release verification

## Status: deployed; launch checks confirmed by the maintainer

This is a verification snapshot from 2026-10-10 for the hardening work in
[PR #6](https://github.com/rishabh1057d/iris-society-web/pull/6).
PR #6 merged on 2026-10-10. Vercel's Production deployment for merge commit
`e93749a418174f91b374f1f955dbaadc043f57e4` is READY. All 22 anonymous HTTP/site/image
checks passed against `https://iris-society.iitmbs.org` after deployment.
The follow-up media-rights and CI-action PRs (#15, #8, #9 and #7) also merged.
Production is READY for `e2a110da4110d88dde2e880547a73754b82990d7`; all 24
anonymous live-site checks passed for that release.

On 2026-10-10, the repository maintainer reported that the requested real-account
authentication/access checks passed, including phone testing. This is
maintainer-confirmed verification, not an agent-performed sign-in session.
Fixture results alone are not evidence of production Google sign-in or admin writes.

The society's existing free Supabase project is retained. No new project, paid
plan, paid protection feature, or storage service was created. Previews deliberately
disable database-backed features instead of sharing privileged production access.

## Original requirements and evidence

| Requirement | Implementation and evidence | Remaining work |
| --- | --- | --- |
| 1. Patch vulnerable dependencies | Next 15.5.27, React 19.3.0, Supabase JS 2.117.3 and committed lockfile. Production audit, build, typecheck and dependency regression tests passed in CI. | Full audit still reports the build-only patched `braces` version; see `DEPENDENCY_SECURITY.md`. Replace the local patch when an upstream fix is available. |
| 2. Isolate previews | Server/client preview guards and five isolation tests. Vercel saves privileged credentials as Production-only. Fork Protection and Vercel Authentication are enabled. A fresh cache-free Preview build completed and its participant UI showed `Registration unavailable`. | Three public `NEXT_PUBLIC_SUPABASE_*` settings remain shared: Vercel rejected scope-only edits of these write-only Secret variables. They are browser-public configuration, not privileged keys; preview code uses inert credentials and makes no database/auth calls. Do not restore private keys to previews. |
| 3. Scan complete history | Gitleaks ran locally across all fetched refs/history with redacted output and no findings. CI fetches full history and verifies the scanner download checksum before running it. GitHub secret scanning and push protection are enabled. | A clean scan is evidence, not a guarantee that no secret can ever be committed. Rotate any future confirmed exposure. |
| 4. Commit, deploy, test accounts | The release is deployed. All admin handlers use verified server authorization; registration ownership is tied to the confirmed session email. Supabase grants/RLS and storage policies were inspected; internal function execution was restricted. Fixture tests and 24 anonymous Production HTTP checks passed. The maintainer confirmed the requested auth/access and phone checks. | Repeat relevant account checks after future auth/API changes. Keep tokens, exports and enrollment proof private. |
| 5. License code and clarify assets | Root MIT `LICENSE`, explicit media restrictions in `ASSET_LICENSE.md`, bundled open-font license and confirmed redistribution permission for the other event fonts. Generic aliases preserve font bytes and required notices. | Code MIT does not grant blanket rights to photos, branding, or third-party fonts. New assets still need explicit rights. |
| 6. Contributor/security setup | README, `CONTRIBUTING.md`, `SECURITY.md`, blank `.env.example`, safe fresh-project SQL seed and existing-project hardening script. Clean CI install/build uses no credentials. Community contributions require privately verified current IITM BS enrollment; PR/feature templates state that policy. | Contributors needing database tests must supply their own development setup, not the society's production credentials. A checked eligibility box is not proof; maintainers must verify privately. |
| 7. Review and automated checks | Pinned GitHub Actions, read-only workflow token, frozen install, audit, history scan, tests/build/typecheck/smoke. `main` requires one approving review, passing `checks`, up-to-date code and resolved conversations; force pushes/deletion are disabled. | Required code-owner review is deliberately off: the sole code owner could not approve their own PRs. Existing write-access collaborators can provide the required review. Owners can override protection; contributor changes should follow the normal review gate. |
| 8. Deliberate release cleanup | Local tooling/screenshots/credentials/build output ignored. Public configuration backup moved to ignored `.backups/`. 221 migrated image paths have decode/reference checks and legacy 308 redirects. | Old images/admin addresses remain in history. No destructive history rewrite was performed; keep a permanent copy of original images before temporary backup cleanup. |

## Measured verification

The clean Linux [CI run](https://github.com/rishabh1057d/iris-society-web/actions/runs/38066666223)
tested application commit `e2a110da4110d88dde2e880547a73754b82990d7`:

- Frozen dependency installation without application credentials: passed.
- Production dependency audit: passed.
- Unit/fixture/preview/dependency/image/font tests: 22 passed, 0 failed.
- Production build and TypeScript check: passed.
- Built-site HTTP checks: 24 passed, 0 failed. These cover anonymous authorization,
  12 rendered routes, all 221 new image URLs, all 221 old redirects, fonts,
  fallbacks, branding and the media-rights notice. The same 24 checks also passed
  against the live production domain.
- Full fetched-history Gitleaks scan: passed, no findings.

An independent code reviewer approved the preview-guard correction. This does not
count as a GitHub maintainer approval. Desktop browser checks covered Beginner
guides and the clean-audio lesson, including its image and free-resource links.
The fresh Vercel Preview also rendered its disabled-registration explanation.
Direct API navigation in that browser was blocked by the browser client and is
not counted as a successful deployed endpoint test. No load test or comprehensive
agent-led mobile UI audit was performed. The maintainer subsequently confirmed
phone checks; no general UI redesign is part of this release.

## Production release gate

1. PR #6 merged by the repository owner; do not remove required checks to make a
   failing future PR merge.
2. Verified: Vercel's Production deployment is READY for the follow-up release
   commit `e2a110da4110d88dde2e880547a73754b82990d7`.
3. Verified: `pnpm test:smoke` with `TEST_BASE_URL=https://iris-society.iitmbs.org`
   passed all 24 checks. These anonymous requests created no registrations.
4. Maintainer-confirmed: the requested real-account auth/access checks passed.
   The student checklist covers own-email lookup, refusal of another email and
   refusal of admin access. The admin checklist covers verified allowlist access,
   config reads/save and CSV export. No session tokens or exports belong in GitHub.
5. Maintainer-confirmed: phone testing passed. This records the owner's report;
   it does not claim that the agent independently repeated those account/UI tests.
6. Future registration tests must use a real open event and an intending
   participant. Do not open a closed event or inject dummy production registrations
   for a test. Fixture tests cover duplicate 409 and closed/expired refusal;
   this record does not claim a new production registration was created.
7. Main protection stayed unchanged during the explicitly authorized owner
   overrides for #15, #8, #9 and #7. Future student PRs must follow eligibility
   verification, CI and maintainer review rather than treat those overrides as
   automatic approval.

Private review needs an authenticated admin/student session, not a copied token
in a public report. The release is ready for announcement based on the automated
evidence and the maintainer's confirmation. This is a dated verification snapshot,
not a guarantee against future defects; repeat relevant checks after changes.
