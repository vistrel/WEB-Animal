-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "revokedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "RefreshToken_revokedAt_idx" ON "RefreshToken"("revokedAt");
