-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "costKobo" INTEGER,
ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "options" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "sellWhenSoldOut" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trackStock" BOOLEAN NOT NULL DEFAULT true;

-- Backfill: option keys become display names ("size" -> "Size"), each product's option groups
-- are derived from its variants (values in first-seen order) and variants are numbered.
UPDATE "product_variants" v
SET "options" = (
  SELECT COALESCE(jsonb_object_agg(initcap(e.key), e.value), '{}'::jsonb)
  FROM jsonb_each(v."options") e
)
WHERE v."options" <> '{}'::jsonb;

UPDATE "products" p
SET "options" = groups.opts
FROM (
  SELECT k."productId", jsonb_agg(jsonb_build_object('name', k.key, 'values', k.vals) ORDER BY k.key) AS opts
  FROM (
    SELECT s."productId", s.key, jsonb_agg(s.value ORDER BY s.first_seen) AS vals
    FROM (
      SELECT v."productId", e.key, e.value, min(v."createdAt") AS first_seen
      FROM "product_variants" v, jsonb_each(v."options") e
      GROUP BY v."productId", e.key, e.value
    ) s
    GROUP BY s."productId", s.key
  ) k
  GROUP BY k."productId"
) groups
WHERE p.id = groups."productId";

UPDATE "product_variants" v
SET "position" = n.pos
FROM (
  SELECT id, row_number() OVER (PARTITION BY "productId" ORDER BY "createdAt", id) - 1 AS pos
  FROM "product_variants"
) n
WHERE v.id = n.id;
