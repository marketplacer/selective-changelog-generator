FROM node:18-alpine
WORKDIR /app

RUN apk update && apk add --no-cache git

COPY package.json package-lock.json ./

# --legacy-peer-deps required as we are upgrading from npm 6 to npm 8
RUN npm ci --legacy-peer-deps

RUN git config --global --add safe.directory /app
