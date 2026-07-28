## Plan: Add Docker build & push to GHCR in CI

Add a `docker` job to [ci.yml](.github/workflows/ci.yml) that builds the existing multi-stage [Dockerfile](Dockerfile) with Buildx and pushes multi-arch images to GitHub Container Registry (`ghcr.io/lorenzobaronio22/aiam`), gated on `lint`+`test` passing.

**Decisions**
- Push on every trigger (PR and main pushes) — no build-only mode for PRs.
- Multi-arch: `linux/amd64` + `linux/arm64` (via QEMU).
- Tags: `latest` (default branch only), branch ref, `sha-<short>`, `pr-<number>` — via `docker/metadata-action`.
- `docker` job depends on `needs: [lint, test]`.

**Steps**
1. Edit [ci.yml](.github/workflows/ci.yml) to add a new `docker` job after `test`:
   - `needs: [lint, test]`, `runs-on: ubuntu-latest`
   - `permissions: { contents: read, packages: write }` (required for `GITHUB_TOKEN` GHCR push)
   - Steps: `actions/checkout@v7` → `docker/setup-qemu-action@v3` → `docker/setup-buildx-action@v3` → `docker/login-action@v3` (registry `ghcr.io`, `github.actor`/`GITHUB_TOKEN`) → `docker/metadata-action@v5` (id `meta`, images `ghcr.io/${{ github.repository }}`, tags: `type=ref,event=branch`, `type=ref,event=pr`, `type=sha,prefix=sha-,format=short`, `type=raw,value=latest,enable={{is_default_branch}}`) → `docker/build-push-action@v6` (`context: .`, `platforms: linux/amd64,linux/arm64`, `push: true`, tags/labels from `meta`, `cache-from: type=gha`, `cache-to: type=gha,mode=max`)
2. No `Dockerfile` changes needed — existing multi-stage build (non-root, verified working) is already CI-ready.

**Relevant files**
- [ci.yml](.github/workflows/ci.yml) — only file changed.

**Verification**
1. Confirm the `docker` job runs after `lint`/`test` succeed in the Actions tab.
2. Confirm image appears in the repo's Packages tab under `ghcr.io/lorenzobaronio22/aiam` with expected tags.
3. `docker pull ghcr.io/lorenzobaronio22/aiam:latest && docker run -p 8000:8000 ghcr.io/lorenzobaronio22/aiam:latest`, hit `/` to confirm it responds.
4. Re-run the workflow without Dockerfile/lockfile changes and confirm GHA cache hit speeds up the build.

**Further Considerations**
1. Forked-repo PRs get a read-only `GITHUB_TOKEN`, so push will fail for external contributors' PRs — not addressed now per your choice to push on every trigger; can add a same-repo guard around login/push later if needed.
2. GHCR package visibility defaults to private on first push; you may need to manually set visibility (public/private) in the repo's Packages settings afterward.
