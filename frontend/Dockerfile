ARG NODE_IMAGE=node:20.11.0-alpine

FROM $NODE_IMAGE AS base
RUN apk --no-cache add dumb-init curl
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node

FROM base AS dependencies
COPY --chown=node:node ./common ../common
RUN cd ../common; npm ci; npm run build; cd ../app
COPY --chown=node:node ./frontend/package*.json ./
RUN npm ci
COPY --chown=node:node ./frontend .

RUN chmod +x docker-entrypoint.sh

ENTRYPOINT [ "/home/node/app/docker-entrypoint.sh" ]

CMD ["node", "/home/node/app/build"]
