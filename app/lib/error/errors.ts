export class ShopifyApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public userErrors?: Array<{ field: string[]; message: string }>,
  ) {
    super(message);
    this.name = "ShopifyApiError";
  }
}

export class RateLimitError extends Error {
  constructor(message: string = "Rate limit exceeded") {
    super(message);
    this.name = "RateLimitError";
  }
}
