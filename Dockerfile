# catet dashboard — Next.js standalone image.
#
# bun installs and builds (it is the repo's package manager); the runtime
# stage is plain node because `output: "standalone"` emits a server.js
# that needs nothing else. `bun run generate` is deliberately NOT run
# here: it reads ../catet-backend, and src/lib/api/schema.ts is committed.
FROM oven/bun:1.4-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM deps AS build
COPY . .
# GIT_SHA becomes NEXT_PUBLIC_BUILD_ID and the `sw.js?v=` query, so each
# release invalidates the service worker registration.
ARG GIT_SHA=dev
ENV GIT_SHA=$GIT_SHA NEXT_TELEMETRY_DISABLED=1
RUN bun run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production PORT=3001 HOSTNAME=0.0.0.0
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
USER node
EXPOSE 3001
CMD ["node", "server.js"]
