FROM node:20 AS builder

WORKDIR /app

COPY ./package.json ./package-lock.json ./

RUN npm ci --legacy-peer-deps
RUN chmod +x ./node_modules/.bin/nx

COPY . .

RUN ./node_modules/.bin/nx sync
RUN npm i
RUN ./node_modules/.bin/nx run @notlegaladvice/server:build --configuration=production --with-deps

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json* ./

RUN npm ci --omit=dev --legacy-peer-deps && \
    npm cache clean --force

COPY --from=builder /app/packages/application/dist ./node_modules/@notlegaladvice/application
COPY --from=builder /app/packages/data/dist ./node_modules/@notlegaladvice/data
COPY --from=builder /app/packages/database/dist ./node_modules/@notlegaladvice/database
COPY --from=builder /app/packages/domain/dist ./node_modules/@notlegaladvice/domain
#COPY --from=builder /app/packages/file—repository/dist ./node_modules/@notlegaladvice/file
COPY --from=builder /app/packages/llm-integration/dist ./node_modules/@notlegaladvice/llm-integration
COPY --from=builder /app/packages/streaming/dist ./node_modules/@notlegaladvice/streaming
COPY --from=builder /app/packages/usecase/dist ./node_modules/@notlegaladvice/usecase

COPY --from=builder /app/apps/server/dist .

EXPOSE 3000
ENV HOST=0.0.0.0 PORT=3000

CMD ["node", "main.js"]
