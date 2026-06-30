# ── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:24-slim AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

# Copy workspace manifests + .npmrc first (maximises layer cache)
COPY .npmrc package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy shared lib packages (workspace:* dependencies of api-server)
COPY lib/ ./lib/

# Copy api-server source
COPY artifacts/api-server/ ./artifacts/api-server/

# Install all workspace dependencies
# onlyBuiltDependencies (pnpm-workspace.yaml) + enable-pre-post-scripts (.npmrc) allow esbuild postinstall
RUN pnpm install --frozen-lockfile

# Build api-server — esbuild bundles everything into artifacts/api-server/dist/
RUN pnpm --filter @workspace/api-server run build

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM node:24-slim AS runtime

WORKDIR /app

# Copy only the compiled bundle — no node_modules needed (esbuild bundles them)
COPY --from=builder /app/artifacts/api-server/dist ./dist

EXPOSE 8080

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
