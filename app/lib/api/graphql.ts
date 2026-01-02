import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";
import { RateLimitError, ShopifyApiError } from "@/lib/error";
/**
 * Base GraphQL query helper with error handling and type safety
 */
async function graphqlQuery<T = unknown>(
  admin: AdminApiContext["graphql"],
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  try {
    const response = await admin(query, { variables });
    const { data } = await response.json();

    // Check for GraphQL errors
    if (data?.errors) {
      const errorMessages = data.errors
        .map((e: { message: string }) => e.message)
        .join(", ");
      throw new ShopifyApiError(`GraphQL error: ${errorMessages}`);
    }

    // Check for rate limiting
    if (data.extensions?.cost?.throttleStatus?.currentlyAvailable === 0) {
      throw new RateLimitError("Shopify API rate limit exceeded");
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof RateLimitError || error instanceof ShopifyApiError) {
      throw error;
    }
    throw new ShopifyApiError(
      `API request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Find product by barcode or SKU
 *
 * @param graphql - Authenticated Shopify admin API context
 * @param barcode - Barcode (UPC, EAN, etc.) or SKU to search for
 * @returns Product with matching variant, or null if not found
 *
 * Reference: [Product queries](https://shopify.dev/docs/api/admin-graphql/latest/queries/products)
 */
export async function findProductByBarcode(
  graphql: AdminApiContext["graphql"],
  barcode: string,
) {
  const query = `#graphql
    query findProductByBarcode($query: String!) {
      products(first: 10, query: $query) {
        edges {
          node {
            id
            title
            handle
            variants(first: 10) {
              edges {
                node {
                  id
                  barcode
                  sku
                  price
                  inventoryItem {
                    id
                  }
                }
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                }
              }
            }
          }
        }
      }
    }
  `;

  // Search by barcode or SKU
  const searchQuery = `barcode:${barcode} OR sku:${barcode}`;

  type FindProductByBarcodeQuery = {
    products: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          handle: string;
          variants: {
            edges: Array<{
              node: {
                id: string;
                barcode: string | null;
                sku: string | null;
                price: string;
                inventoryItem: {
                  id: string;
                };
              };
            }>;
          };
          images: {
            edges: Array<{
              node: {
                url: string;
              };
            }>;
          };
        };
      }>;
    };
  };

  const data = await graphqlQuery<FindProductByBarcodeQuery>(graphql, query, {
    query: searchQuery,
  });

  const product = data.products.edges[0]?.node;
  return product || null;
}

/**
 * Adjust inventory quantity for a product variant
 *
 * @param graphql - Authenticated Shopify admin API context
 * @param inventoryItemId - Shopify inventory item ID (from variant.inventoryItem.id)
 * @param locationId - Shopify location ID
 * @param quantityDelta - Quantity change (positive to increase, negative to decrease)
 * @param reason - Reason for adjustment (default: "correction")
 * @returns Inventory adjustment result
 *
 * Reference: [inventoryAdjustQuantities mutation](https://shopify.dev/docs/api/admin-graphql/latest/mutations/inventoryAdjustQuantities)
 */
export async function adjustInventory(
  graphql: AdminApiContext["graphql"],
  inventoryItemId: string,
  locationId: string,
  quantityDelta: number,
  reason:
    | "correction"
    | "damaged"
    | "received"
    | "returned"
    | "other" = "correction",
) {
  const mutation = `#graphql
    mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
      inventoryAdjustQuantities(input: $input) {
        userErrors {
          field
          message
        }
        inventoryAdjustmentGroup {
          reason
          changes {
            name
            delta
          }
        }
      }
    }
  `;

  type InventoryAdjustQuantitiesMutation = {
    inventoryAdjustQuantities: {
      userErrors: Array<{ field: string[]; message: string }>;
      inventoryAdjustmentGroup?: {
        reason: string;
        changes: Array<{ name: string; delta: number }>;
      };
    };
  };

  const data = await graphqlQuery<InventoryAdjustQuantitiesMutation>(
    graphql,
    mutation,
    {
      input: {
        reason,
        changes: [
          {
            delta: quantityDelta,
            inventoryItemId,
            locationId,
          },
        ],
      },
    },
  );

  const result = data.inventoryAdjustQuantities;

  // Check for user errors (validation errors from Shopify)
  if (result.userErrors.length > 0) {
    const error = result.userErrors[0];
    throw new ShopifyApiError(error.message, "USER_ERROR", result.userErrors);
  }

  return {
    success: true,
    inventoryAdjustmentGroup: result.inventoryAdjustmentGroup,
  };
}

/**
 * Get all locations for the shop
 *
 * @param graphql - Authenticated Shopify admin API context
 * @returns Array of locations
 *
 * Reference: [Location queries](https://shopify.dev/docs/api/admin-graphql/latest/queries/locations)
 */
export async function getLocations(graphql: AdminApiContext["graphql"]) {
  const query = `#graphql
    query getLocations {
      locations(first: 50) {
        edges {
          node {
            id
            name
            address {
              address1
              city
              province
              country
              zip
            }
          }
        }
      }
    }
  `;

  type GetLocationsQuery = {
    locations: {
      edges: Array<{
        node: {
          id: string;
          name: string;
          address: {
            address1: string | null;
            city: string | null;
            province: string | null;
            country: string | null;
            zip: string | null;
          };
        };
      }>;
    };
  };

  const data = await graphqlQuery<GetLocationsQuery>(graphql, query);

  return data.locations.edges.map((edge) => edge.node);
}

/**
 * Get inventory levels for a product variant at a specific location
 *
 * @param graphql - Authenticated Shopify admin API context
 * @param inventoryItemId - Shopify inventory item ID
 * @param locationId - Shopify location ID
 * @returns Current inventory quantity, or null if not found
 */
export async function getInventoryLevel(
  graphql: AdminApiContext["graphql"],
  inventoryItemId: string,
  locationId: string,
) {
  const query = `#graphql
    query getInventoryLevel($inventoryItemId: ID!, $locationId: ID!) {
      inventoryItem(id: $inventoryItemId) {
        inventoryLevel(locationId: $locationId) {
          quantities(names: ["available"]) {
            name
            quantity
          }
        }
      }
    }
  `;

  type GetInventoryLevelQuery = {
    inventoryItem: {
      inventoryLevel: {
        quantities: Array<{
          name: string;
          quantity: number;
        }>;
      } | null;
    } | null;
  };

  const data = await graphqlQuery<GetInventoryLevelQuery>(graphql, query, {
    inventoryItemId,
    locationId,
  });

  const quantity = data.inventoryItem?.inventoryLevel?.quantities.find(
    (q) => q.name === "available",
  );

  return quantity?.quantity ?? null;
}

/**
 * Retry helper with exponential backoff for rate-limited requests
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (error instanceof RateLimitError && attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  throw lastError!;
}
