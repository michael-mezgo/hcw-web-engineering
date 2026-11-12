# Build context: repository root (see compose.yaml)
FROM node:24-alpine AS build
WORKDIR /app

# Manifests first: dependency layer stays cached until a package.json changes.
# npm ci validates the lockfile against ALL workspaces, so both manifests are needed.
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci --ignore-scripts -w apps/api --include-workspace-root

COPY apps/api apps/api
RUN npm run build -w apps/api


FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci --ignore-scripts --omit=dev -w apps/api

COPY --from=build /app/apps/api/dist apps/api/dist

USER node
EXPOSE 3000
CMD ["node", "apps/api/dist/server.js"]
