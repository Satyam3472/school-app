#!/bin/sh
set -e

# Resolve DB path — strip optional "file:" prefix, then make absolute from /app
DB_PATH="${DATABASE_URL#file:}"
case "$DB_PATH" in
  /*) ;;                        # already absolute
  *)  DB_PATH="/app/$DB_PATH" ;;  # make absolute
esac
DB_DIR=$(dirname "$DB_PATH")

# Ensure the DB directory exists and is writable (volume may be freshly mounted)
mkdir -p "$DB_DIR"

# Always run the seed script — it uses "IF NOT EXISTS" and checks for duplicates
echo "[entrypoint] Running database initialisation…"
node setup-db.mjs
echo "[entrypoint] Database ready."

exec node server.js
