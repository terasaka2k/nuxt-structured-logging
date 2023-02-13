FROM node:18 AS build

WORKDIR /app

COPY .npmrc package.json pnpm-lock.yaml ./
RUN npx pnpm install --frozen-lockfile

COPY tsconfig.json nuxt.config.ts app.vue server modules ./
RUN test -d modules
RUN npm run build


FROM gcr.io/distroless/nodejs18-debian11 AS app

WORKDIR /app

COPY --from=build /app/.output .

CMD [".output/server/index.mjs"]
