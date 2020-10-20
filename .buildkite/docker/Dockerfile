FROM node:14-alpine
WORKDIR /app

RUN apk update && apk add --no-cache git

RUN addgroup -S appgroup && adduser -S appuser -G appgroup && chown -R appuser:appgroup /app

USER appuser

COPY package.json package-lock.json ./

RUN npm ci
