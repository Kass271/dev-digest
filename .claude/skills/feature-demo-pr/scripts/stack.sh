#!/usr/bin/env bash
# Boot an isolated, freshly seeded DevDigest stack, run "$@" against it, tear down.
# Same approach as scripts/e2e.sh, on its own ports so it never touches the dev
# stack or dev DB. Usage: stack.sh <command...>   (BASE is exported for the command)
set -euo pipefail
ROOT="$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)"
cd "$ROOT"

PG_CONTAINER="${DEMO_PG_CONTAINER:-devdigest-demo-postgres}"
PG_PORT="${DEMO_PG_PORT:-5441}"
API_PORT="${DEMO_API_PORT:-3121}"
WEB_PORT="${DEMO_WEB_PORT:-3120}"

export DATABASE_URL="postgres://devdigest:devdigest@127.0.0.1:${PG_PORT}/devdigest"
export API_PORT WEB_PORT
export NEXT_PUBLIC_API_BASE="http://localhost:${API_PORT}"
export BASE="http://localhost:${WEB_PORT}"

log() { printf '\033[1;36m▸ %s\033[0m\n' "$*"; }
SERVER_PID=""; WEB_PID=""
kill_tree() { local p="$1"; [ -n "$p" ] || return 0; for k in $(pgrep -P "$p" 2>/dev/null || true); do kill_tree "$k"; done; kill "$p" 2>/dev/null || true; }
cleanup() {
  local code=$?
  log "tearing down demo stack"
  kill_tree "$WEB_PID"; kill_tree "$SERVER_PID"
  for port in "$WEB_PORT" "$API_PORT"; do
    pids="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null || true)"
    [ -n "$pids" ] && kill $pids 2>/dev/null || true
  done
  docker rm -f "$PG_CONTAINER" >/dev/null 2>&1 || true
  exit "$code"
}
trap cleanup EXIT INT TERM

for port in "$PG_PORT" "$API_PORT" "$WEB_PORT"; do
  lsof -nP -iTCP:"$port" -sTCP:LISTEN -t >/dev/null 2>&1 && { echo "port $port busy - set DEMO_PG_PORT/DEMO_API_PORT/DEMO_WEB_PORT"; trap - EXIT; exit 1; }
done

log "starting isolated Postgres on :$PG_PORT"
docker rm -f "$PG_CONTAINER" >/dev/null 2>&1 || true
docker run -d --rm --name "$PG_CONTAINER" -e POSTGRES_USER=devdigest -e POSTGRES_PASSWORD=devdigest \
  -e POSTGRES_DB=devdigest -p "127.0.0.1:${PG_PORT}:5432" \
  --health-cmd="pg_isready -U devdigest -d devdigest" --health-interval=2s --health-retries=30 \
  pgvector/pgvector:pg16 >/dev/null
for _ in $(seq 1 60); do
  [ "$(docker inspect -f '{{.State.Health.Status}}' "$PG_CONTAINER" 2>/dev/null)" = healthy ] && break; sleep 1
done

case "$DATABASE_URL" in *":${PG_PORT}/"*) : ;; *) echo "refusing: not the isolated DB"; exit 1 ;; esac
log "migrate + seed (isolated db)"
(cd server && pnpm db:migrate && pnpm db:seed)
if [ -n "${DEMO_FIXTURE:-}" ]; then
  log "applying demo fixture $DEMO_FIXTURE (isolated db only)"
  docker exec -i "$PG_CONTAINER" psql -v ON_ERROR_STOP=1 -q -U devdigest -d devdigest < "$DEMO_FIXTURE"
fi

log "starting API on :$API_PORT"
(cd server && pnpm exec tsx src/server.ts) & SERVER_PID=$!
for _ in $(seq 1 60); do curl -fsS "http://localhost:${API_PORT}/health" >/dev/null 2>&1 && break; sleep 1; done
curl -fsS "http://localhost:${API_PORT}/health" >/dev/null || { echo "API not healthy"; exit 1; }

log "starting web on :$WEB_PORT"
(cd client && pnpm exec next dev -p "$WEB_PORT") & WEB_PID=$!
for _ in $(seq 1 90); do curl -fsS "$BASE" >/dev/null 2>&1 && break; sleep 1; done
curl -fsS "$BASE" >/dev/null || { echo "web not reachable"; exit 1; }

log "running: $*"
"$@"
