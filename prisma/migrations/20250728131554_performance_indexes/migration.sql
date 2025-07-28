/*
  Warnings:

  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.
  - The `emailVerified` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar",
ADD COLUMN     "image" TEXT,
ADD COLUMN     "password" TEXT,
ALTER COLUMN "name" DROP NOT NULL,
DROP COLUMN "emailVerified",
ADD COLUMN     "emailVerified" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Click_country_idx" ON "Click"("country");

-- CreateIndex
CREATE INDEX "Click_shortUrlId_clickedAt_idx" ON "Click"("shortUrlId", "clickedAt");

-- CreateIndex
CREATE INDEX "Click_shortUrlId_country_idx" ON "Click"("shortUrlId", "country");

-- CreateIndex
CREATE INDEX "ShortUrl_isActive_idx" ON "ShortUrl"("isActive");

-- CreateIndex
CREATE INDEX "ShortUrl_clickCount_idx" ON "ShortUrl"("clickCount");

-- CreateIndex
CREATE INDEX "ShortUrl_createdAt_idx" ON "ShortUrl"("createdAt");

-- CreateIndex
CREATE INDEX "ShortUrl_createdBy_isActive_idx" ON "ShortUrl"("createdBy", "isActive");

-- CreateIndex
CREATE INDEX "ShortUrl_clickCount_createdAt_idx" ON "ShortUrl"("clickCount", "createdAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
