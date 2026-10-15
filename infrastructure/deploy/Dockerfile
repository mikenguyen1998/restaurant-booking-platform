# Build from repository root. Development tools are retained for Prisma's release step.
FROM node:24-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN npm install --global pnpm@12.3.4
COPY . .
RUN pnpm install --frozen-lockfile
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# No database credentials or .env files are needed to compile.
RUN pnpm build

FROM build AS runtime
ENV NODE_ENV=production
RUN chown -R node:node /app
USER node
EXPOSE 3000 4000
# Railway API config overrides this default with start-api.sh.
CMD ["sh", "infrastructure/deploy/start-web.sh"]
