-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "description" TEXT,
ADD COLUMN     "showInMenu" BOOLEAN NOT NULL DEFAULT true;
