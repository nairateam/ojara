-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "category" VARCHAR(32),
ADD COLUMN     "instagramHandle" VARCHAR(30),
ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "onboardingStep" INTEGER NOT NULL DEFAULT 1;

-- Stores that already went live finished onboarding before it was tracked.
UPDATE "stores"
SET "onboardingStep" = 6, "onboardingCompletedAt" = "createdAt"
WHERE "status" <> 'DRAFT';
