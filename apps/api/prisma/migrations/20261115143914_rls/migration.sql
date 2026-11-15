-- Row-Level Security for tenant-owned tables.
--
-- The API connects as `ojara_app` (NOSUPERUSER, NOBYPASSRLS). Every tenant-scoped query runs in a
-- transaction that first calls:
--     SELECT set_config('app.current_store_id', '<storeId>', true);   -- SET LOCAL semantics
-- Platform-admin and system jobs instead set `app.bypass_rls = 'on'` (also transaction-local).
-- With neither setting, tenant tables return no rows and reject all writes.
--
-- NOTE: `app.bypass_rls` is a defence against application bugs, not against a compromised app
-- process (which already holds DB credentials). See docs/DECISIONS.md.

-- 1. Runtime role (normally created by infra/postgres/init; created here NOLOGIN if missing so the
--    migration also works on databases provisioned differently).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ojara_app') THEN
    CREATE ROLE ojara_app NOLOGIN NOSUPERUSER NOBYPASSRLS;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO ojara_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ojara_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ojara_app;
DO $$
BEGIN
  -- Absent in Prisma's shadow database.
  IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
    REVOKE ALL ON TABLE "_prisma_migrations" FROM ojara_app;
  END IF;
END
$$;
-- Tables created by later migrations (run by the same owner) get the same grants.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ojara_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ojara_app;

-- 2. Helpers. current_setting(..., true) returns NULL/'' when unset instead of raising.
CREATE OR REPLACE FUNCTION app_current_store_id() RETURNS text
  LANGUAGE sql STABLE
  AS $$ SELECT NULLIF(current_setting('app.current_store_id', true), '') $$;

CREATE OR REPLACE FUNCTION app_rls_bypass() RETURNS boolean
  LANGUAGE sql STABLE
  AS $$ SELECT COALESCE(current_setting('app.bypass_rls', true), '') = 'on' $$;

-- 3. Stores: a tenant can only see its own store row.
ALTER TABLE "stores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stores" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "stores"
  USING (app_rls_bypass() OR "id" = app_current_store_id())
  WITH CHECK (app_rls_bypass() OR "id" = app_current_store_id());

-- 4. Every table with a storeId column.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'store_members', 'domains', 'subscriptions', 'categories', 'products', 'product_variants',
    'product_images', 'customers', 'orders', 'order_items', 'payments', 'delivery_zones',
    'audit_logs'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I
         USING (app_rls_bypass() OR "storeId" = app_current_store_id())
         WITH CHECK (app_rls_bypass() OR "storeId" = app_current_store_id())',
      t
    );
  END LOOP;
END
$$;
