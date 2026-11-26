#!/bin/sh
# Pings the CMS health check so a sleeping free-tier instance starts waking during the build.
# Never fails the build: the site serves cached content and retries Strapi on the next visit.
url="${STRAPI_INTERNAL_URL:-}"
if [ -z "$url" ]; then
  exit 0
fi
if curl -fsS --max-time 90 -o /dev/null "${url%/}/_health"; then
  echo "[wake-cms] CMS is awake"
else
  echo "[wake-cms] CMS did not answer within 90s; continuing"
fi
