ARG NODE_IMAGE=node:16.13.1-alpine

FROM $NODE_IMAGE AS base
RUN apk --no-cache add dumb-init
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node
RUN mkdir tmp

FROM base AS dependencies
COPY --chown=node:node ./package*.json ./
RUN npm ci
COPY --chown=node:node . .

FROM dependencies AS build
RUN node ace build --production

FROM base AS production
ENV PORT=$PORT
ENV HOST=0.0.0.0
ENV NODE_ENV=production
ENV APP_KEY=$APP_KEY
ENV DRIVE_DISK=local
ENV DB_CONNECTION=pg
ENV PG_HOST=$PG_HOST
ENV PG_PORT=$PG_PORT
ENV PG_USER=$PG_USER
ENV PG_PASSWORD=$PG_PASSWORD
ENV PG_DB_NAME=$PG_DB_NAME
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
ENV GOOGLE_CALLBACK_URL=$GOOGLE_CALLBACK_URL

COPY --chown=node:node ./package*.json ./
RUN npm ci --production
COPY --chown=node:node --from=build /home/node/app/build .
COPY --chown=node:node . ./docker-entrypoint.sh
EXPOSE $PORT
ENTRYPOINT [ "docker-entrypoint.sh" ]
CMD [ "dumb-init", "node", "server.js" ]
