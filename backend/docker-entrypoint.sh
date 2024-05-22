#!/bin/sh
set -e

node ace migration:run --force

exec "$@"
