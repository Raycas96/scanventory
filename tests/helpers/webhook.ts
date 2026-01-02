import { createHmac } from "crypto";

/**
 * Create a mock Shopify webhook request with valid HMAC signature
 */
export function createMockWebhookRequest(
  shop: string,
  topic: string,
  payload: unknown,
  secret: string = process.env.SHOPIFY_API_SECRET || "test-secret",
): Request {
  const body = JSON.stringify(payload);
  const hmac = createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");

  const headers = new Headers({
    "Content-Type": "application/json",
    "X-Shopify-Shop-Domain": shop,
    "X-Shopify-Topic": topic,
    "X-Shopify-Hmac-Sha256": hmac,
    "X-Shopify-Webhook-Id": "test-webhook-id",
  });

  return new Request("http://localhost/webhooks/app/uninstalled", {
    method: "POST",
    headers,
    body,
  });
}

/**
 * Create mock session data
 */
export function createMockSession(shop: string) {
  return {
    id: `session-${shop}`,
    shop,
    state: "test-state",
    isOnline: false,
    accessToken: "test-access-token",
    scope: "read_products,write_inventory,read_locations",
    expires: new Date(Date.now() + 86400000), // 24 hours from now
  };
}
