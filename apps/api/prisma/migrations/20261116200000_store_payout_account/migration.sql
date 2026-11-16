-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "payoutAccountLast4" VARCHAR(4),
ADD COLUMN     "payoutAccountName" TEXT,
ADD COLUMN     "payoutBankCode" TEXT,
ADD COLUMN     "payoutBankName" TEXT,
ADD COLUMN     "payoutConnectedAt" TIMESTAMP(3);
