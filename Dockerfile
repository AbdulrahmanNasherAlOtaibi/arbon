# ── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:24-slim AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

# Copy workspace manifests + .npmrc first (maximises layer cache)
COPY .npmrc package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy shared lib packages (workspace:* dependencies of api-server + frontend)
COPY lib/ ./lib/

# Copy api-server and the frontend (arboun) source
COPY artifacts/api-server/ ./artifacts/api-server/
COPY artifacts/arboun/ ./artifacts/arboun/
COPY attached_assets/ ./attached_assets/

# Install all workspace dependencies
# onlyBuiltDependencies (pnpm-workspace.yaml) + enable-pre-post-scripts (.npmrc) allow esbuild postinstall
RUN pnpm install --frozen-lockfile

# Build the frontend — Vite requires PORT and BASE_PATH; served at the root path
RUN PORT=8080 BASE_PATH=/ pnpm --filter @workspace/arboun run build

# Build api-server — esbuild bundles everything into artifacts/api-server/dist/
RUN pnpm --filter @workspace/api-server run build

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM node:24-slim AS runtime

WORKDIR /app

# Copy the compiled server bundle — no node_modules needed (esbuild bundles them)
COPY --from=builder /app/artifacts/api-server/dist ./dist

# Copy the built frontend so the server can serve it as static files
COPY --from=builder /app/artifacts/arboun/dist/public ./public

EXPOSE 8080

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
