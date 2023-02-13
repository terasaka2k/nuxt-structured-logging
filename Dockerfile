FROM node:18 AS build

WORKDIR /app

COPY .npmrc package.json pnpm-lock.yaml ./
RUN npx pnpm install --frozen-lockfile

COPY . .
RUN npm run build


FROM gcr.io/distroless/nodejs18-debian11 AS app

COPY --from=build /app/.output/ /app/.output/

CMD ["/app/.output/server/index.mjs"]
