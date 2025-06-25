#!/bin/sh
set -e
mongosh <<EOF
db = db.getSiblingDB('$MONGO_INITDB_CUSTOM_DB');
db.createUser(
  {
    user: "$MONGO_INITDB_CUSTOM_USER",
    pwd: "$MONGO_INITDB_CUSTOM_PASSWORD",
    roles: [
      {
        role: "readWrite",
        db: "$MONGO_INITDB_CUSTOM_DB"
      }
    ]
  }
);
EOF
