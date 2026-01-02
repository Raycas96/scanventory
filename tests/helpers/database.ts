import { faker } from "@faker-js/faker";
import type { Shop, ShopSettings } from "@prisma/client";
import { vi } from "vitest";
import { Session } from "@shopify/shopify-app-react-router/server";
import { getTestPrisma } from "./test-db";

/**
 * Create a test shop with all related data
 */
export async function createTestShop(overrides?: Partial<Shop>) {
  const testPrisma = getTestPrisma();
  const shop = await testPrisma.shop.create({
    data: {
      id: "test-shop-id",
      shop:
        overrides?.shop ||
        `test-shop-${faker.string.alphanumeric(10)}.myshopify.com`,
      ...overrides,
    },
  });

  return shop;
}

/**
 * Create test shop with settings
 */
export async function createTestShopWithSettings(
  shopOverrides?: Partial<Shop>,
  settingsOverrides?: Partial<ShopSettings>,
) {
  const shop = await createTestShop(shopOverrides);
  const testPrisma = getTestPrisma();

  const settings = await testPrisma.shopSettings.create({
    data: {
      shopId: shop.id,
      tier: "FREE",
      ...settingsOverrides,
    },
  });

  return { shop, settings };
}

/**
 * Create test shop with all related data
 */
export async function createTestShopWithAllData(shopOverrides?: Partial<Shop>) {
  const shop = await createTestShop(shopOverrides);
  const testPrisma = getTestPrisma();

  // Create settings
  const settings = await testPrisma.shopSettings.create({
    data: {
      shopId: shop.id,
      tier: "FREE",
    },
  });

  // Create product history
  const productHistory = await testPrisma.producthistory.createMany({
    data: [
      {
        shopId: shop.id,
        shopifyProductId: faker.string.uuid(),
        barcode: faker.string.numeric(12),
        quantityChange: 10,
        locationId: faker.string.uuid(),
      },
      {
        shopId: shop.id,
        shopifyProductId: faker.string.uuid(),
        barcode: faker.string.numeric(12),
        quantityChange: -5,
        locationId: faker.string.uuid(),
      },
    ],
  });

  // Create product cache
  const productCache = await testPrisma.productCache.createMany({
    data: [
      {
        shopId: shop.id,
        shopifyProductId: faker.string.uuid(),
        barcode: faker.string.numeric(12),
        sku: faker.string.alphanumeric(10),
        productTitle: faker.commerce.productName(),
      },
    ],
  });

  // Create location cache
  const locationCache = await testPrisma.locationCache.createMany({
    data: [
      {
        shopId: shop.id,
        shopifyLocationId: faker.string.uuid(),
        locationName: faker.location.city(),
      },
    ],
  });

  // Create jobs
  const jobs = await testPrisma.job.createMany({
    data: [
      {
        shopId: shop.id,
        jobType: "PRODUCT_SYNC",
        status: "COMPLETED",
        jobName: "Test Product Sync",
      },
    ],
  });

  return {
    shop,
    settings,
    productHistoryCount: productHistory.count,
    productCacheCount: productCache.count,
    locationCacheCount: locationCache.count,
    jobsCount: jobs.count,
  };
}

/**
 * Create test session
 */
export async function createTestSession(shop: string): Promise<Session> {
  const testPrisma = getTestPrisma();
  const session = await testPrisma.session.create({
    data: {
      id: `session-${shop}`,
      shop,
      state: "test-state",
      isOnline: false,
      accessToken: "test-access-token",
      scope: "read_products,write_inventory,read_locations",
      expires: new Date(Date.now() + 86400000), // 24 hours from now
    },
  });

  return {
    ...session,
    isActive: vi.fn(() => true),
    isScopeChanged: vi.fn(() => false),
    isScopeIncluded: vi.fn(() => true),
    isExpired: vi.fn(() => false),
    toObject: vi.fn(),
    equals: vi.fn(),
    toPropertyArray: vi.fn(),
    scope: session.scope || undefined,
    expires: session.expires || undefined,
    accessToken: session.accessToken || undefined,
    refreshToken: session.refreshToken || undefined,
    refreshTokenExpires: session.refreshTokenExpires || undefined,
  };
}
