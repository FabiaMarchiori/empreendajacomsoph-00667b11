#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../../.."

prefix="soph-1c-$(openssl rand -hex 5)"
network="$prefix"
auth_db="$prefix-app-db"
erp_db="$prefix-erp-db"
app_auth="$prefix-app-auth"
erp_auth="$prefix-erp-auth"

cleanup() {
  docker rm -fv "$app_auth" "$erp_auth" "$auth_db" "$erp_db" >/dev/null 2>&1 || true
  docker network rm "$network" >/dev/null 2>&1 || true
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
docker network create "$network" >/dev/null

app_db_password=$(openssl rand -hex 24)
erp_db_password=$(openssl rand -hex 24)
export SOPH_LOCAL_APP_SECRET=$(openssl rand -hex 32)
export SOPH_LOCAL_ERP_SECRET=$(openssl rand -hex 32)
export SOPH_LOCAL_APP_ISSUER="https://$prefix-app.invalid/auth/v1"
export SOPH_LOCAL_ERP_ISSUER="https://$prefix-erp.invalid/auth/v1"
export SOPH_LOCAL_DB_PASSWORD="$erp_db_password"
export SOPH_LOCAL_APP_DB_PASSWORD="$app_db_password"

start_db() {
  local name=$1 password=$2
  docker run -d --network "$network" --name "$name" -p 127.0.0.1::5432 \
    -e "POSTGRES_PASSWORD=$password" postgres:16-alpine >/dev/null
  for _ in {1..60}; do
    if docker exec "$name" pg_isready -h 127.0.0.1 -U postgres >/dev/null 2>&1; then return; fi
    sleep 1
  done
  return 1
}

start_auth() {
  local name=$1 db=$2 password=$3 secret=$4 issuer=$5
  docker run -d --network "$network" --name "$name" -p 127.0.0.1::9999 \
    -e GOTRUE_API_HOST=0.0.0.0 -e GOTRUE_API_PORT=9999 \
    -e "API_EXTERNAL_URL=$issuer" -e "GOTRUE_SITE_URL=$issuer" \
    -e GOTRUE_DB_DRIVER=postgres -e "GOTRUE_DB_DATABASE_URL=postgres://postgres:$password@$db:5432/postgres?sslmode=disable" \
    -e GOTRUE_DB_NAMESPACE=auth -e GOTRUE_EXTERNAL_EMAIL_ENABLED=true -e GOTRUE_MAILER_AUTOCONFIRM=true \
    -e "GOTRUE_JWT_SECRET=$secret" -e "GOTRUE_JWT_ISSUER=$issuer" \
    -e GOTRUE_JWT_AUD=authenticated -e GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated -e GOTRUE_JWT_EXP=12 supabase/gotrue:v2.177.0 >/dev/null
}

start_db "$auth_db" "$app_db_password"
start_db "$erp_db" "$erp_db_password"
for db in "$auth_db" "$erp_db"; do
  docker exec "$db" psql -U postgres -v ON_ERROR_STOP=1 -c 'create schema auth; alter role postgres set search_path = auth, public' >/dev/null
done
start_auth "$app_auth" "$auth_db" "$app_db_password" "$SOPH_LOCAL_APP_SECRET" "$SOPH_LOCAL_APP_ISSUER"
start_auth "$erp_auth" "$erp_db" "$erp_db_password" "$SOPH_LOCAL_ERP_SECRET" "$SOPH_LOCAL_ERP_ISSUER"

export SOPH_LOCAL_APP_URL="http://$(docker port "$app_auth" 9999/tcp)"
export SOPH_LOCAL_ERP_URL="http://$(docker port "$erp_auth" 9999/tcp)"
export SOPH_LOCAL_DB_PORT=$(docker port "$erp_db" 5432/tcp | cut -d: -f2)
export SOPH_LOCAL_APP_DB_PORT=$(docker port "$auth_db" 5432/tcp | cut -d: -f2)
for url in "$SOPH_LOCAL_APP_URL" "$SOPH_LOCAL_ERP_URL"; do
  ready=false
  for _ in {1..60}; do
    if curl -fsS --max-time 1 "$url/health" >/dev/null 2>&1; then ready=true; break; fi
    sleep 1
  done
  if ! "$ready"; then
    printf 'GoTrue local não ficou pronto.\n' >&2
    exit 1
  fi
done

printf 'Duas instâncias GoTrue e dois bancos PostgreSQL descartáveis prontos.\n'
export SOPH_RUN_LOCAL_AUTH=1
npm test -- --config tests/soph-gestao/integration/vitest.config.ts
