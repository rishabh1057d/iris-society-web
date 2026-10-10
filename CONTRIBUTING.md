# Contributing to IRIS

Students are welcome to suggest features, improve learning content, fix bugs,
and submit photographs through the society's normal approval process.

1. Open an issue for a bug or feature. Explain the problem and expected result;
   include screenshots and screen size for visual issues. Never post credentials,
   session tokens, registration exports, or private student information.
2. Fork the repository and create a focused branch from current `main`.
3. Follow the README setup. A content/UI change needs no database credentials.
   For database work use a separate project you control, never society production.
4. Keep existing colors, responsive layouts, cursor behavior, accessible controls,
   and working routes unless your issue explicitly changes them.
5. Run `pnpm test`, `pnpm typecheck`, `pnpm audit --prod`, and `pnpm build`.
   Start the built site and run `pnpm test:smoke`; test the affected pages at
   desktop and phone widths. Include test results in your PR.
6. Submit a pull request describing the change, its risks, and how it was tested.
   A maintainer reviews it before merging. Do not commit generated builds,
   screenshots, `.env.local`, browser profiles, or downloaded credential files.

## Content and assets

Tutorials/guides are in `lib/beginner/`. Recommend free resources, check links,
credit sources, and write your own explanations rather than copying articles.
Public content JSON is in `public/`; registration records do not belong there.
Follow [image conventions](docs/IMAGE_ASSETS.md) and
[asset licensing](ASSET_LICENSE.md). Update every reference when renaming images;
the image tests check exact filename case for Linux deployments.

## Expectations

Be respectful, give constructive feedback, and do not harass contributors or
submit others' work as your own. Report conduct problems privately to
photography.society@study.iitm.ac.in. Security reports follow [SECURITY.md](SECURITY.md).

Original code/documentation contributions are accepted under the project's MIT
license. Asset contributions retain their applicable rights and require explicit
publication permission. Local admin content mockups are not production editors;
event-registration admin tools are the database-backed implementation.
