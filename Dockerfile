# Stage 1: Development
FROM node:16.17.0 AS development

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./

RUN yarn install

COPY --chown=node:node . .

USER node

# Stage 2: Build
FROM node:16.17.0 AS build

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./

# Copy node_modules from the development stage
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN yarn build

# Stage 3: Production
FROM node:16.17.0 AS production

WORKDIR /usr/src/app

COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node package.json yarn.lock ./

RUN yarn install --production

ENV NODE_ENV=production

CMD ["node", "dist/main"]