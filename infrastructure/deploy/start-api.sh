#!/bin/sh
set -eu
cd /app
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${REDIS_URL:?REDIS_URL is required}"
: "${WEB_URL:?WEB_URL is required}"
: "${MAIL_FROM:?MAIL_FROM is required}"
export API_PORT="${PORT:-${API_PORT:-4000}}"
# Current bootstrap requires the root file. Runtime values stay in process env.
# Never overwrite a mounted env file or bake secrets into the image.
if [ ! -e .env ]; then
  (umask 077; : > .env)
fi
cd apps/api
exec node dist/main.js
