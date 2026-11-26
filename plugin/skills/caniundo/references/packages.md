# Packages

Generated from `entries/` in https://github.com/willor16/caniundo. Do not edit by hand.

- `cargo publish`: NO
- `cargo yank --version 1.0.0 my-crate`: YES
- `npm publish`: PARTLY
- `npm unpublish my-package@1.0.0`: NO
- `twine upload dist/*`: NO

## cargo publish

**NO** · Publish a crate · id `cargo-publish`

- **Matches:** `cargo publish`, not with `-n`, `--dry-run`
- **Lost:** That version cannot be overwritten, and its code cannot be deleted.
- **Instead:** See what it would do: cargo publish --dry-run. To stop new uses of a version, cargo yank.
- **Evidence:** Documented, not tested
- **Source:** https://doc.rust-lang.org/cargo/reference/publishing.html (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/cargo-publish/ (Spanish: https://willor16.github.io/caniundo/es/c/cargo-publish/)

## cargo yank --version 1.0.0 my-crate

**YES** · Stop new uses of a crate version · id `cargo-yank`

- **Matches:** `cargo yank`, not with `--undo`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** Nothing. The code stays available for whoever already uses it.
- **To undo:** The version, as before.

    ```sh
    cargo yank --undo --version <version> <crate>
    ```
- **Evidence:** Documented, not tested
- **Source:** https://doc.rust-lang.org/cargo/commands/cargo-yank.html (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/cargo-yank/ (Spanish: https://willor16.github.io/caniundo/es/c/cargo-yank/)

## npm publish

**PARTLY** · Publish a package on npm · id `npm-publish`

- **Matches:** `npm publish`, not with `--dry-run`; or `pnpm publish`, not with `--dry-run`; or `yarn publish`, not with `--dry-run`; or `yarn npm publish`, not with `--dry-run`; or `bun publish`, not with `--dry-run`
- **Lost:** That version number, forever. Whoever installed it keeps it.
- **Instead:** See what it would publish: npm publish --dry-run
- **To undo:** Takes that version off the registry, if no other package depends on it.

    ```sh
    npm unpublish <package>@<version>
    ```
  - Until: 72 hours. After that there are more conditions.
  - Careful: That version number can never be used again.
- **Evidence:** Documented, not tested
- **Source:** https://docs.npmjs.com/policies/unpublish/ (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/npm-publish/ (Spanish: https://willor16.github.io/caniundo/es/c/npm-publish/)

## npm unpublish my-package@1.0.0

**NO** · Remove a package from npm · id `npm-unpublish`

- **Matches:** `npm unpublish`, not with `--dry-run`; or `pnpm unpublish`, not with `--dry-run`
- **Lost:** That version, and its number can never be used again. If it was the last one, nothing can be published under that name for 24 hours.
- **Instead:** npm deprecate warns whoever installs it, and breaks nobody.
- **Evidence:** Documented, not tested
- **Source:** https://docs.npmjs.com/policies/unpublish/ (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/npm-unpublish/ (Spanish: https://willor16.github.io/caniundo/es/c/npm-unpublish/)

## twine upload dist/*

**NO** · Publish a package on PyPI · id `pypi-upload`

- **Matches:** `twine upload`, not with `--dry-run`; or `uv publish`, not with `--dry-run`; or `poetry publish`, not with `--dry-run`; or `flit publish`, not with `--dry-run`; or `hatch publish`, not with `--dry-run`
- **Lost:** That file name, forever. It can be deleted, but not uploaded again.
- **Instead:** Try it on TestPyPI first. To stop new installs of a version, yank it on the PyPI website.
- **Evidence:** Documented, not tested
- **Source:** https://docs.pypi.org/project-management/troubleshooting/ (checked 2026-11-25)
- **Source:** https://docs.pypi.org/publishing/troubleshooting/ (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/pypi-upload/ (Spanish: https://willor16.github.io/caniundo/es/c/pypi-upload/)
