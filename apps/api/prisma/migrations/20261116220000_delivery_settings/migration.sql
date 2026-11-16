-- AlterTable
ALTER TABLE "delivery_zones" ADD COLUMN     "eta" VARCHAR(40),
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;
-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "deliveryEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "freeDeliveryOverKobo" INTEGER,
ADD COLUMN     "orderConfirmationNote" TEXT,
ADD COLUMN     "orderReadyIn" TEXT,
ADD COLUMN     "pickupHours" TEXT,
ADD COLUMN     "sameDayCutoff" TEXT;
