-- CreateEnum
CREATE TYPE "ShopTier" AS ENUM ('TRIAL', 'FREE', 'STARTER', 'PRO');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('PRODUCT_SYNC', 'PRODUCT_RE_SYNC', 'CLEANUP_SCAN_LOGS', 'CLEANUP_SESSIONS', 'ANALYTICS_AGGREGATION', 'LOW_STOCK_ALERT', 'OFFLINE_SCAN_SYNC');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'RETRYING');

-- CreateEnum
CREATE TYPE "JobPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpires" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopSettings" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "tier" "ShopTier" NOT NULL DEFAULT 'FREE',
    "defaultLocationId" TEXT,
    "enableBatchMode" BOOLEAN NOT NULL DEFAULT false,
    "cameraPreference" TEXT,

    CONSTRAINT "ShopSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producthistory" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "shopifyProductId" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "quantityChange" INTEGER NOT NULL,
    "locationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "producthistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCache" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "shopifyProductId" TEXT NOT NULL,
    "shopifyVariantId" TEXT,
    "barcode" TEXT,
    "sku" TEXT,
    "productTitle" TEXT NOT NULL,
    "variantTitle" TEXT,
    "productImage" TEXT,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationCache" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "shopifyLocationId" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "province" TEXT,
    "country" TEXT,
    "zip" TEXT,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocationCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "shopId" TEXT,
    "jobType" "JobType" NOT NULL,
    "jobName" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "JobPriority" NOT NULL DEFAULT 'NORMAL',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "itemsProcessed" INTEGER NOT NULL DEFAULT 0,
    "itemsTotal" INTEGER,
    "itemsSucceeded" INTEGER NOT NULL DEFAULT 0,
    "itemsFailed" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "estimatedCompletionAt" TIMESTAMP(3),
    "error" TEXT,
    "errorCode" TEXT,
    "errorDetails" JSONB,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "nextRetryAt" TIMESTAMP(3),
    "jobData" JSONB,
    "resultData" JSONB,
    "triggeredBy" TEXT,
    "triggeredById" TEXT,
    "parentJobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shop_shop_key" ON "Shop"("shop");

-- CreateIndex
CREATE INDEX "Shop_shop_idx" ON "Shop"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "ShopSettings_shopId_key" ON "ShopSettings"("shopId");

-- CreateIndex
CREATE INDEX "producthistory_shopId_idx" ON "producthistory"("shopId");

-- CreateIndex
CREATE INDEX "producthistory_createdAt_idx" ON "producthistory"("createdAt");

-- CreateIndex
CREATE INDEX "ProductCache_shopId_idx" ON "ProductCache"("shopId");

-- CreateIndex
CREATE INDEX "ProductCache_shopId_barcode_idx" ON "ProductCache"("shopId", "barcode");

-- CreateIndex
CREATE INDEX "ProductCache_shopId_sku_idx" ON "ProductCache"("shopId", "sku");

-- CreateIndex
CREATE INDEX "ProductCache_shopifyProductId_idx" ON "ProductCache"("shopifyProductId");

-- CreateIndex
CREATE INDEX "ProductCache_syncedAt_idx" ON "ProductCache"("syncedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCache_shopId_shopifyVariantId_key" ON "ProductCache"("shopId", "shopifyVariantId");

-- CreateIndex
CREATE INDEX "LocationCache_shopId_idx" ON "LocationCache"("shopId");

-- CreateIndex
CREATE INDEX "LocationCache_syncedAt_idx" ON "LocationCache"("syncedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LocationCache_shopId_shopifyLocationId_key" ON "LocationCache"("shopId", "shopifyLocationId");

-- CreateIndex
CREATE INDEX "Job_shopId_idx" ON "Job"("shopId");

-- CreateIndex
CREATE INDEX "Job_shopId_jobType_idx" ON "Job"("shopId", "jobType");

-- CreateIndex
CREATE INDEX "Job_shopId_status_idx" ON "Job"("shopId", "status");

-- CreateIndex
CREATE INDEX "Job_status_createdAt_idx" ON "Job"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Job_jobType_status_idx" ON "Job"("jobType", "status");

-- CreateIndex
CREATE INDEX "Job_scheduledAt_idx" ON "Job"("scheduledAt");

-- CreateIndex
CREATE INDEX "Job_nextRetryAt_idx" ON "Job"("nextRetryAt");

-- CreateIndex
CREATE INDEX "Job_parentJobId_idx" ON "Job"("parentJobId");

-- AddForeignKey
ALTER TABLE "ShopSettings" ADD CONSTRAINT "ShopSettings_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producthistory" ADD CONSTRAINT "producthistory_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCache" ADD CONSTRAINT "ProductCache_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationCache" ADD CONSTRAINT "LocationCache_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_parentJobId_fkey" FOREIGN KEY ("parentJobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
