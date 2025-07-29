-- CreateTable
CREATE TABLE "BlacklistedIP" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdBy" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlacklistedIP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlacklistedIP_ipAddress_key" ON "BlacklistedIP"("ipAddress");

-- CreateIndex
CREATE INDEX "BlacklistedIP_ipAddress_idx" ON "BlacklistedIP"("ipAddress");

-- CreateIndex
CREATE INDEX "BlacklistedIP_isActive_idx" ON "BlacklistedIP"("isActive");

-- CreateIndex
CREATE INDEX "BlacklistedIP_expiresAt_idx" ON "BlacklistedIP"("expiresAt");

-- CreateIndex
CREATE INDEX "SecurityEvent_type_idx" ON "SecurityEvent"("type");

-- CreateIndex
CREATE INDEX "SecurityEvent_ipAddress_idx" ON "SecurityEvent"("ipAddress");

-- CreateIndex
CREATE INDEX "SecurityEvent_timestamp_idx" ON "SecurityEvent"("timestamp");

-- AddForeignKey
ALTER TABLE "BlacklistedIP" ADD CONSTRAINT "BlacklistedIP_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
