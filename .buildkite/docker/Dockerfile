FROM node:14-alpine
WORKDIR /app

RUN apk update && apk add --no-cache git

COPY package.json package-lock.json ./

RUN npm ci
RUN npm set unsafe-perm true
