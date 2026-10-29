# Cut a release

One version for the whole product: the root `package.json`, reported by the api (`/api/v1/system/ping`,
the OpenAPI document) and used to tag every image. Why the pipeline works this way:
[ADR 0014](../adr/0014-ci-checks-what-changed-and-boots-the-images-that-ship.md).

## Once per repository

1. **Protect `main`** — Settings → Rules → Rulesets: require a pull request and the `CI OK` status
   check. Add the `CodeQL` and `Dependency review` checks to block on security findings too.
2. **Let release-please open pull requests** — Settings → Actions → General → Workflow permissions:
   allow GitHub Actions to create and approve pull requests.
3. **Give it a token** — a pull request opened with the workflow token triggers no workflow, so the
   release pull request would wait forever for `CI OK`. Add a `RELEASE_PLEASE_TOKEN` Actions secret:
   a fine-grained token (or a GitHub App token) on this repository with contents and pull requests
   write.
4. **Set the web build variables** — the web bundle inlines its URLs at build time. Add the Actions
   variables `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL` with the production URLs.

## Each release

1. **Merge into `main`** — commits (or squashed pull request titles) follow Conventional Commits:
   `fix:` makes a patch, `feat:` a minor, `feat!:` or a `BREAKING CHANGE:` footer a major (a minor
   before 1.0.0). CI rejects a pull request whose commits do not; it does not check the title, so
   word it as a Conventional Commit before a squash merge, or the release skips the change.
2. **Review the release pull request** — `chore(main): release X.Y.Z`, kept up to date by the
   Release workflow: it bumps `package.json` and the OpenAPI version, and writes `CHANGELOG.md`.
   Edit the changelog in that pull request if a line needs rewording.
3. **Merge it** — the workflow tags `vX.Y.Z`, creates the GitHub release and publishes
   `ghcr.io/<owner>/<repo>/{api,migrator,worker,scheduler,web}` tagged `X.Y.Z`, `X.Y` and
   `sha-<commit>`, each with an SBOM and a signed build provenance.
4. **Deploy** — run the `migrator` image to completion, then roll out the api, worker, scheduler
   and web. Check an image came from this repository first:
   `gh attestation verify oci://ghcr.io/<owner>/<repo>/api:X.Y.Z --repo <owner>/<repo>`.

To publish a release's images again (a registry purge, a new web URL), run the Release workflow
from the Actions tab with its tag.
