#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../../.."
release=release/soph-gestao-catalogo
tests=tests/soph-gestao/migrations
container="soph-catalogo-sql-$(openssl rand -hex 5)"
trap 'docker rm -fv "$container" >/dev/null 2>&1 || true' EXIT
docker run -d --network none --name "$container" -e POSTGRES_PASSWORD="$(openssl rand -hex 24)" postgres:16-alpine >/dev/null

sql() { docker exec -i "$container" psql -X -q -v ON_ERROR_STOP=1 -U postgres -d postgres "$@"; }
for _ in {1..35}; do
  if docker exec "$container" pg_isready -h 127.0.0.1 -U postgres >/dev/null 2>&1; then break; fi
  sleep 1
done
sql < "$tests/legacy-fixture.sql"
sql < "$release/00_preflight.sql"
sql < "$release/01_campos_aditivos.sql"
sql < "$release/02_vinculos_privados.sql"

# Prove that PUBLIC EXECUTE blocks the package without leaving any new grants.
sql -c 'create function public.rpc_fixture() returns integer language sql security definer as $$ select 1 $$'
for path in 00_preflight.sql 03_rls_e_grants.sql; do
  if output=$(sql < "$release/$path" 2>&1); then
    printf 'Falha: %s aceitou RPC privilegiada pública.\n' "$path" >&2
    exit 1
  fi
  [[ "$output" == *"SECURITY DEFINER"* ]]
done
sql -c 'drop function public.rpc_fixture()'
sql < "$release/03_rls_e_grants.sql"
sql < "$release/04_verificacao.sql"
sql < "$tests/catalogo_rls.test.sql"
sql < "$release/90_reversao.sql"
sql <<'SQL'
do $test$
begin
  if has_any_column_privilege('soph_catalogo_backend','public.produtos','SELECT')
    or has_any_column_privilege('soph_catalogo_backend','public.contatos','SELECT')
    or (select count(*) from public.produtos where sku='ABC') <> 2
    or (select count(*) from public.contatos where status='em_negociacao') <> 2
  then raise exception 'Reversão não preservou dados ou deixou acessos ativos'; end if;
end
$test$;
set role authenticated;
set fixture.legacy_empresa = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
do $test$
begin
  if not exists (select 1 from public.contatos where nome='Legado A' and instagram='@fixture')
    then raise exception 'Legado perdeu acesso após reversão'; end if;
end
$test$;
SQL
printf 'OK: preflight, bloqueio de RPC, campos, legado, RLS nas duas direções, restrições e reversão.\n'
