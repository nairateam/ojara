#!/bin/sh
# Runs once, on first start of an empty Postgres volume (docker-entrypoint-initdb.d).
# Creates the runtime role the API connects as. It is NOT a superuser and does NOT have
# BYPASSRLS, so row-level security policies are enforced for every query it runs.
# Table privileges are granted by the RLS migration (prisma/migrations/*_rls).
set -eu

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ojara_app') THEN
    CREATE ROLE ojara_app LOGIN PASSWORD '${OJARA_APP_PASSWORD}' NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
  END IF;
END
\$\$;
GRANT CONNECT ON DATABASE "$POSTGRES_DB" TO ojara_app;
GRANT USAGE ON SCHEMA public TO ojara_app;
SQL
