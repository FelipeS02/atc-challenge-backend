###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:22.0.0-alpine AS development

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./

RUN yarn install

COPY --chown=node:node . .

FROM redis

COPY redis.conf /usr/local/etc/redis/redis.conf

CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]

USER node


###################
# BUILD FOR PRODUCTION
###################

FROM node:22.0.0-alpine AS build

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./

# In order to run `yarn build` we need access to the Nest CLI.
# The Nest CLI is a dev dependency,
# In the previous development stage we ran `yarn` which installed all dependencies.
# So we can copy over the node_modules directory from the development image into this build image.
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN yarn build

ENV NODE_ENV production

RUN yarn --production

USER node

###################
# PRODUCTION
###################

FROM node:22.0.0-alpine AS production

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD [ "node", "dist/main.js" ]
