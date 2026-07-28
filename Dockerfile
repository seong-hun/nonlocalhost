# ─── deps: workspace 의존성 설치 (한 번만) ────────────────────────────────────
FROM oven/bun:1.3-alpine AS deps
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/cli/package.json apps/cli/
COPY packages/shared/package.json packages/shared/
COPY packages/middleware/package.json packages/middleware/
COPY packages/db/package.json packages/db/

RUN bun install --frozen-lockfile

# ─── web-builder: 대시보드 SPA 빌드 ────────────────────────────────────────────
FROM deps AS web-builder

COPY apps/web/ apps/web/
RUN cd apps/web && bun run build

# ─── runtime: API 서버 (대시보드 정적 파일 + 터널 릴레이 겸함) ────────────────────
FROM oven/bun:1.3-alpine AS runtime
WORKDIR /app

COPY --from=deps /app/node_modules node_modules
COPY package.json bun.lock ./
COPY apps/api/ apps/api/
COPY packages/shared/ packages/shared/
COPY packages/middleware/ packages/middleware/
COPY packages/db/ packages/db/
COPY --from=web-builder /app/apps/web/dist apps/web/dist

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && mkdir -p /app/data

ENV NODE_ENV=production
EXPOSE 3000
VOLUME /app/data

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["bun", "apps/api/src/index.ts"]
