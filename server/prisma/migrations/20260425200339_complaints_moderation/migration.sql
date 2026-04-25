/*
  Warnings:

  - The values [OPEN,IN_REVIEW] on the enum `ComplaintStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `authorId` on the `Complaint` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `Complaint` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `revokedAt` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `SiteText` table. All the data in the column will be lost.
  - You are about to drop the `ModerationLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `reporterId` to the `Complaint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetType` to the `Complaint` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `reason` on the `Complaint` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ComplaintTargetType" AS ENUM ('AD', 'USER', 'MESSAGE');

-- CreateEnum
CREATE TYPE "ComplaintReason" AS ENUM ('SPAM', 'FRAUD', 'INAPPROPRIATE', 'DANGEROUS', 'WRONG_INFO', 'OTHER');

-- AlterEnum
BEGIN;
CREATE TYPE "ComplaintStatus_new" AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');
ALTER TABLE "public"."Complaint" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Complaint" ALTER COLUMN "status" TYPE "ComplaintStatus_new" USING ("status"::text::"ComplaintStatus_new");
ALTER TYPE "ComplaintStatus" RENAME TO "ComplaintStatus_old";
ALTER TYPE "ComplaintStatus_new" RENAME TO "ComplaintStatus";
DROP TYPE "public"."ComplaintStatus_old";
ALTER TABLE "Complaint" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- AlterEnum
ALTER TYPE "ReviewStatus" ADD VALUE 'DELETED';

-- DropForeignKey
ALTER TABLE "Complaint" DROP CONSTRAINT "Complaint_authorId_fkey";

-- DropForeignKey
ALTER TABLE "ModerationLog" DROP CONSTRAINT "ModerationLog_adId_fkey";

-- DropForeignKey
ALTER TABLE "ModerationLog" DROP CONSTRAINT "ModerationLog_complaintId_fkey";

-- DropForeignKey
ALTER TABLE "ModerationLog" DROP CONSTRAINT "ModerationLog_moderatorId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "SiteText" DROP CONSTRAINT "SiteText_updatedById_fkey";

-- DropIndex
DROP INDEX "Ad_price_idx";

-- DropIndex
DROP INDEX "Ad_publishedAt_idx";

-- DropIndex
DROP INDEX "Breed_petTypeId_name_key";

-- DropIndex
DROP INDEX "Complaint_authorId_idx";

-- DropIndex
DROP INDEX "Favorite_userId_idx";

-- DropIndex
DROP INDEX "Message_createdAt_idx";

-- DropIndex
DROP INDEX "PetType_name_key";

-- DropIndex
DROP INDEX "RefreshToken_expiresAt_idx";

-- AlterTable
ALTER TABLE "Ad" ALTER COLUMN "animalGender" DROP DEFAULT,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Complaint" DROP COLUMN "authorId",
DROP COLUMN "details",
ADD COLUMN     "moderatorId" TEXT,
ADD COLUMN     "moderatorNote" TEXT,
ADD COLUMN     "reporterId" TEXT NOT NULL,
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "targetType" "ComplaintTargetType" NOT NULL,
ADD COLUMN     "text" TEXT,
DROP COLUMN "reason",
ADD COLUMN     "reason" "ComplaintReason" NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "ipAddress",
DROP COLUMN "revokedAt",
DROP COLUMN "userAgent";

-- AlterTable
ALTER TABLE "SiteText" DROP COLUMN "updatedById",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "ModerationLog";

-- DropTable
DROP TABLE "Notification";

-- DropEnum
DROP TYPE "NotificationType";

-- CreateIndex
CREATE INDEX "Complaint_reporterId_idx" ON "Complaint"("reporterId");

-- CreateIndex
CREATE INDEX "Complaint_targetType_idx" ON "Complaint"("targetType");

-- CreateIndex
CREATE INDEX "Message_status_idx" ON "Message"("status");

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
