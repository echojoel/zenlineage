#!/bin/sh
# Publish the packaged site to Cloudflare Pages.
#
# Exists because `wrangler pages deploy` authenticates from the process
# environment, and npm scripts do not load `.env`. Without this, wrangler
# falls back to whatever OAuth token is cached in ~/.wrangler, and when that
# token cannot refresh it fails with a bare "Failed to fetch auth token: 400
# Bad Request" — which reads like a Cloudflare outage rather than "your API
# key was sitting in .env the whole time".
#
# Precedence: an already-exported CLOUDFLARE_API_TOKEN wins (that is how CI
# supplies it), otherwise we source .env. Nothing here prints the token.
#
# Usage: npm run deploy        (build + package + this)
#        npm run deploy:cf     (this alone, against an existing out-cf/)

set -eu

PROJECT_NAME="zenlineage"
OUT_DIR="out-cf"

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] && [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "[deploy-cf] No CLOUDFLARE_API_TOKEN found." >&2
  echo "[deploy-cf] Put it in .env (CLOUDFLARE_API_TOKEN=...) or export it." >&2
  echo "[deploy-cf] Create one at: Cloudflare dashboard → My Profile → API Tokens," >&2
  echo "[deploy-cf] using the \"Edit Cloudflare Workers\" template." >&2
  exit 1
fi

if [ ! -d "$OUT_DIR" ]; then
  echo "[deploy-cf] $OUT_DIR/ does not exist — run 'npm run build && npm run package:cf' first." >&2
  exit 1
fi

echo "[deploy-cf] Deploying $OUT_DIR/ to Pages project '$PROJECT_NAME' (token from ${CLOUDFLARE_API_TOKEN:+env/.env})"
exec npx wrangler pages deploy "$OUT_DIR" \
  --project-name="$PROJECT_NAME" \
  --commit-dirty=true
