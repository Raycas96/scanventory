import { vi } from "vitest";
import type { Session } from "@prisma/client";

/**
 * Mock the authenticate.webhook function
 */
export function mockAuthenticateWebhook(session: Session | null) {
  return vi.fn().mockResolvedValue({
    shop: session?.shop || "test-shop.myshopify.com",
    session,
    topic: "app/uninstalled",
    payload: {},
  });
}
