#!/bin/sh
set -e

node ace migration:run --force
node ace db:seed

exec "$@"
