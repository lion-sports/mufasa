ARG NODE_IMAGE=node:20.13.1-alpine

FROM $NODE_IMAGE AS base
RUN apk --no-cache add dumb-init curl
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node
RUN mkdir tmp

FROM base AS dependencies
COPY --chown=node:node ./common ../common
RUN cd ../common; npm ci; npm run build; cd ../app
COPY --chown=node:node ./backend/package*.json ./
RUN npm ci
COPY --chown=node:node ./backend .

FROM dependencies AS build
RUN node ace build

FROM base AS production
COPY --chown=node:node ./common ../common
RUN cd ../common; npm ci; npm run build; cd ../app
COPY --chown=node:node ./backend/package*.json ./
RUN npm ci --production
COPY --chown=node:node --from=build /home/node/app/build .

EXPOSE $PORT
COPY --chown=node:node --chmod=+x ./backend/docker-entrypoint.sh ./docker-entrypoint.sh
ENTRYPOINT [ "/home/node/app/docker-entrypoint.sh" ]

CMD [ "dumb-init", "node", "bin/server.js" ]
