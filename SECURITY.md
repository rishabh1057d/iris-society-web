# Security policy

Please report suspected vulnerabilities privately to
**photography.society@study.iitm.ac.in** with subject `IRIS website security`.
GitHub private vulnerability reporting is also available when enabled on this
repository. Do not open a public issue containing secrets or personal data.

Include the affected URL/version, expected versus actual behavior, and minimal
reproduction steps using test accounts/data. Do not access other students'
records, flood endpoints, upload harmful files, or publish exploit details before
maintainers have investigated. We cannot promise a bounty or response deadline.

Security updates target current `main` and the latest production release;
unmaintained forks must apply updates themselves.

## Maintainer boundaries

- Validate Supabase sessions and the server-only `ADMIN_EMAILS` allowlist on every
  privileged API. Browser UI and localStorage flags are not authorization.
- Registrations are private and server-only. Keep RLS and restricted grants;
  service-role keys bypass RLS and must never enter public bundles or files.
- Preview builds run untrusted source/dependencies. Production credentials must
  be scoped to Production only. Database-backed previews are intentionally off;
  do not approve builds with production secrets to make a preview work.
- Scan all Git history before release and scan every proposed commit. If an
  actual secret is found, revoke/rotate it first; deleting a file is insufficient.
- Require CI and review before merge. Avoid `pull_request_target` workflows that
  execute PR code with secrets or write-capable credentials.

See [API security checklist](docs/API_SECURITY.md) for database setup and tests.
