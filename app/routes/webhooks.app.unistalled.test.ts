import { describe, it, expect, vi, beforeEach } from "vitest";
import { action } from "./webhooks.app.uninstalled";
import {
  createTestShopWithAllData,
  createTestSession,
  createTestShop,
} from "../../tests/helpers/database";
import { createMockWebhookRequest } from "../../tests/helpers/webhook";
import * as shopifyServer from "../shopify.server";
import {
  AdminApiContext,
  ApiVersion,
} from "@shopify/shopify-app-react-router/server";
import { ActionFunctionArgs } from "react-router";
import { getTestPrisma } from "tests/helpers/test-db";

// Mock the entire shopify.server module
vi.mock("../shopify.server", () => ({
  authenticate: {
    webhook: vi.fn(),
    admin: vi.fn(),
    flow: vi.fn(),
    fulfillmentService: vi.fn(),
    pos: vi.fn(),
    public: vi.fn(),
  },
  boundary: {
    error: vi.fn(() => new Response(null, { status: 200 })),
  },
}));

describe("webhooks.app.uninstalled", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  describe("when shop has all data", () => {
    it("should delete all shop-related data and sessions", async () => {
      // Arrange
      const testPrisma = getTestPrisma();
      const testData = await createTestShopWithAllData();
      const session = await createTestSession(testData.shop.shop);

      // Configure the already-mocked authenticate.webhook
      vi.mocked(shopifyServer.authenticate.webhook).mockResolvedValue({
        shop: testData.shop.shop,
        session,
        admin: vi.fn() as unknown as AdminApiContext,
        apiVersion: ApiVersion.October25,
        webhookId: "test-webhook-id",
        topic: "app/uninstalled",
        payload: {},
      });

      const request = createMockWebhookRequest(
        testData.shop.shop,
        "app/uninstalled",
        {},
      );

      // Act
      const response = await action({ request } as ActionFunctionArgs);

      // Assert
      expect((response as Response).status).toBe(200);

      // Verify shop is deleted
      const shop = await testPrisma.shop.findUnique({
        where: { shop: testData.shop.shop },
      });
      expect(shop).toBeNull();

      // Verify settings are deleted (cascade)
      const settings = await testPrisma.shopSettings.findUnique({
        where: { shopId: testData.shop.id },
      });
      expect(settings).toBeNull();

      // Verify product history is deleted (cascade)
      const productHistory = await testPrisma.producthistory.findMany({
        where: { shopId: testData.shop.id },
      });
      expect(productHistory).toHaveLength(0);

      // Verify product cache is deleted (cascade)
      const productCache = await testPrisma.productCache.findMany({
        where: { shopId: testData.shop.id },
      });
      expect(productCache).toHaveLength(0);

      // Verify location cache is deleted (cascade)
      const locationCache = await testPrisma.locationCache.findMany({
        where: { shopId: testData.shop.id },
      });
      expect(locationCache).toHaveLength(0);

      // Verify jobs are deleted (cascade)
      const jobs = await testPrisma.job.findMany({
        where: { shopId: testData.shop.id },
      });
      expect(jobs).toHaveLength(0);

      // Verify session is deleted
      const deletedSession = await testPrisma.session.findUnique({
        where: { id: session.id },
      });
      expect(deletedSession).toBeNull();
    });
  });

  describe("when shop has no data", () => {
    it("should delete shop and session even if no related data exists", async () => {
      // Arrange
      const shop = await createTestShop();
      const session = await createTestSession(shop.shop);
      const testPrisma = getTestPrisma();

      vi.mocked(shopifyServer.authenticate.webhook).mockResolvedValue({
        shop: shop.shop,
        session,
        topic: "app/uninstalled",
        payload: {},
        admin: vi.fn() as unknown as AdminApiContext,
        apiVersion: ApiVersion.October25,
        webhookId: "test-webhook-id",
      });

      const request = createMockWebhookRequest(
        shop.shop,
        "app/uninstalled",
        {},
      );

      // Act
      const response = await action({ request } as ActionFunctionArgs);

      // Assert
      expect((response as Response).status).toBe(200);

      const deletedShop = await testPrisma.shop.findUnique({
        where: { shop: shop.shop },
      });
      expect(deletedShop).toBeNull();

      const deletedSession = await testPrisma.session.findUnique({
        where: { id: session.id },
      });
      expect(deletedSession).toBeNull();
    });
  });

  describe("when session is null (already uninstalled)", () => {
    it("should return 200 without errors", async () => {
      // Arrange
      const shop = await createTestShop();

      vi.mocked(shopifyServer.authenticate.webhook).mockResolvedValue({
        shop: shop.shop,
        session: undefined,
        topic: "app/uninstalled",
        payload: {},
        admin: undefined,
        apiVersion: ApiVersion.October25,
        webhookId: "test-webhook-id",
      });

      const request = createMockWebhookRequest(
        shop.shop,
        "app/uninstalled",
        {},
      );

      // Act
      const response = await action({ request } as ActionFunctionArgs);

      // Assert
      expect((response as Response).status).toBe(200);
    });
  });

  describe("when shop record does not exist", () => {
    it("should delete session and return 200", async () => {
      // Arrange
      const testPrisma = getTestPrisma();
      const shopDomain = "non-existent-shop.myshopify.com";
      const session = await createTestSession(shopDomain);

      vi.mocked(shopifyServer.authenticate.webhook).mockResolvedValue({
        shop: shopDomain,
        session,
        topic: "app/uninstalled",
        payload: {},
        admin: vi.fn() as unknown as AdminApiContext,
        apiVersion: ApiVersion.October25,
        webhookId: "test-webhook-id",
      });

      const request = createMockWebhookRequest(
        shopDomain,
        "app/uninstalled",
        {},
      );

      // Act
      const response = await action({ request } as ActionFunctionArgs);

      // Assert
      expect((response as Response).status).toBe(200);

      const deletedSession = await testPrisma.session.findUnique({
        where: { id: session.id },
      });
      expect(deletedSession).toBeNull();
    });
  });
});
