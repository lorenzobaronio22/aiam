# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# aiam — the single production image.
#
# One Hono/Node process serves everything: the REST API, the MCP endpoint, and
# the built SPA (apps/website) as static files on the same origin. No second
# container, no reverse proxy, no CORS.
#
# Multi-stage build following the Vite+ Docker guide
# (https://viteplus.dev/guide/docker#production-ssr-node-js-server-app): build
# both apps with the official toolchain image, then ship only the resolved
# Node.js binary, the server bundle, production dependencies, and the static
# frontend in a slim runtime.
#
# This is a pnpm workspace, so the build context is the repo root:
#   docker build -f apps/api/Dockerfile -t aiam .
# ---------------------------------------------------------------------------

ARG VITE_PLUS_IMAGE=ghcr.io/voidzero-dev/vite-plus:1.3.0
ARG DEBIAN_IMAGE=debian:bookworm-slim

# --- build stage: the official Vite+ toolchain image ------------------------
FROM ${VITE_PLUS_IMAGE} AS build
WORKDIR /app

ENV CI=true

# Optional API origin baked into the SPA. Empty (the default) means
# same-origin, which is exactly what this single image serves.
ARG VITE_API_URL=
ENV VITE_API_URL=${VITE_API_URL}

# Only the manifests this image needs: the root workspace files, the api and
# website, and their shared workspace dependency (`api-contract`). pnpm
# tolerates the other workspace importers being absent and installs just this
# subgraph, so test projects such as `apps/e2e` are never installed or copied.
COPY --chown=vp:vp package.json pnpm-lock.yaml pnpm-workspace.yaml .node-version* ./
COPY --chown=vp:vp apps/api/package.json ./apps/api/
COPY --chown=vp:vp apps/website/package.json ./apps/website/
COPY --chown=vp:vp packages/api-contract/package.json ./packages/api-contract/
RUN vp install --frozen-lockfile

# Dotfiles and sources (node_modules/dist are excluded by .dockerignore).
COPY --chown=vp:vp . .

# Both apps resolve the shared contract through `exports`, so its `dist` must
# exist before either is built. The website type-checks against it, too.
RUN vp run --filter api-contract build
RUN vp run --filter api build
RUN vp run --filter website build

# Isolated, production-only node_modules. `pnpm deploy` inlines workspace
# dependencies (api-contract) and leaves devDependencies — including the
# vite-plus toolchain and the whole frontend build stack — behind.
#
# Deploy under /tmp: the toolchain image's root filesystem is read-only to the
# unprivileged `vp` user, but /tmp is world-writable.
RUN vp env exec pnpm deploy --filter api --prod /tmp/deploy/api

# Export the exact Node.js resolved for this project (from engines.node), so
# the runtime matches the toolchain bit for bit.
RUN cp "$(vp env which node | head -1)" /tmp/node

# --- runtime stage: small, glibc, no vp toolchain ---------------------------
FROM ${DEBIAN_IMAGE} AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=8787 \
    STATIC_ROOT=./public

LABEL org.opencontainers.image.title="aiam" \
      org.opencontainers.image.description="Members API, MCP endpoint, and SPA served by Hono on Node."

# The exact, signature-verified Node.js build from the project's spec.
COPY --from=build /tmp/node /usr/local/bin/node

# Only what the process needs at runtime: the server bundle, production
# dependencies, manifest, and the built frontend served from STATIC_ROOT.
COPY --from=build --chown=nobody:nogroup /app/apps/api/dist ./dist
COPY --from=build --chown=nobody:nogroup /tmp/deploy/api/node_modules ./node_modules
COPY --from=build --chown=nobody:nogroup /tmp/deploy/api/package.json ./package.json
COPY --from=build --chown=nobody:nogroup /app/apps/website/dist ./public

# Run unprivileged; nothing in the image is written at runtime.
USER nobody

EXPOSE 8787

# Liveness comes from the app's own /health route.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8787)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/index.mjs"]
