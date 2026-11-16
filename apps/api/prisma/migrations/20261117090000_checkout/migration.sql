-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "imagePublicId" TEXT;
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "customerEmail" TEXT,
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "customerPhone" TEXT;
-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "lastOrderNumber" INTEGER NOT NULL DEFAULT 1000;

-- Existing stores continue from their highest order number.
UPDATE "stores" s SET "lastOrderNumber" = GREATEST(1000, COALESCE((SELECT MAX(o."number") FROM "orders" o WHERE o."storeId" = s.id), 1000));
