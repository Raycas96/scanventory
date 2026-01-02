---
description: "Backend must follow Shopify protected customer data guidelines and security best practices"
alwaysApply: true
globs: ["app/**/*.server.ts", "app/routes/**/*.tsx", "app/**/*.ts"]
---

# Shopify Backend Security & Protected Customer Data

## Protected Customer Data Compliance

**ALWAYS follow Shopify's protected customer data guidelines** for all backend code.

### Reference Documentation
- [Protected Customer Data](https://shopify.dev/docs/apps/launch/protected-customer-data)
- [Shopify App Security](https://shopify.dev/docs/apps/security)

## Key Requirements

### 1. Data Storage

- ✅ **DO**: Store only product/variant IDs, barcodes, and inventory data
- ✅ **DO**: Encrypt sensitive data at rest (tokens, API keys)
- ❌ **DON'T**: Store customer personal information (names, emails, addresses)
- ❌ **DON'T**: Store payment information
- ❌ **DON'T**: Store order details beyond what's needed for inventory

### 2. API Authentication

Always authenticate API requests:

```typescript
// ✅ CORRECT - Authenticate before API calls
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  
  // Use admin.graphql() or admin.rest() for authenticated calls
  const response = await admin.graphql(`
    query {
      products(first: 10) {
        nodes {
          id
          title
        }
      }
    }
  `);
  
  return response;
};
```

### 3. Webhook Security

Always validate webhook HMAC signatures:

```typescript
// ✅ CORRECT - Validate webhook HMAC
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);
  
  // Process webhook payload
  // topic is validated, payload is verified
};
```

Reference: [Webhook security](https://shopify.dev/docs/apps/security/webhooks)

### 4. Session Management

Use secure session storage:

```typescript
// ✅ CORRECT - Use Prisma session storage
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

const sessionStorage = new PrismaSessionStorage(prisma);
```

### 5. Data Deletion

Implement app uninstall webhook to delete merchant data:

```typescript
// ✅ CORRECT - Delete data on uninstall
export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop } = await authenticate.webhook(request);
  
  if (topic === "APP_UNINSTALLED") {
    // Delete all merchant data within 30 days
    await prisma.scanLog.deleteMany({ where: { shop } });
    await prisma.merchant.deleteMany({ where: { shop } });
  }
};
```

### 6. Error Handling

Never expose sensitive information in error messages:

```typescript
// ✅ CORRECT - Generic error messages
try {
  await admin.graphql(query);
} catch (error) {
  console.error("API error:", error); // Log full error
  throw new Response("Failed to update inventory", { status: 500 }); // Generic message
}

// ❌ WRONG - Exposing internal details
catch (error) {
  throw new Response(`Database error: ${error.message}`, { status: 500 });
}
```

### 7. Environment Variables

Never commit secrets to version control:

```typescript
// ✅ CORRECT - Use environment variables
const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;

// ❌ WRONG - Hardcoded secrets
const apiKey = "abc123";
```

### 8. API Scopes

Request only necessary scopes:

```typescript
// ✅ CORRECT - Minimal scopes
scopes: ["read_products", "write_inventory", "read_locations"]

// ❌ WRONG - Excessive scopes
scopes: ["read_all", "write_all"]
```

Reference: [API scopes](https://shopify.dev/docs/apps/tools/cli/configuration#access_scopes)

### 9. Database Encryption

Encrypt sensitive fields in database:

```prisma
// Example: Encrypt access tokens (handled by Prisma Session Storage)
model Session {
  id          String   @id
  shop        String
  accessToken String   // Encrypted by session storage adapter
}
```

### 10. Rate Limiting

Respect Shopify API rate limits:

```typescript
// ✅ CORRECT - Handle rate limits
try {
  await admin.graphql(query);
} catch (error) {
  if (error.extensions?.code === "THROTTLED") {
    // Implement retry with exponential backoff
    await retryWithBackoff(() => admin.graphql(query));
  }
}
```

Reference: [API rate limits](https://shopify.dev/docs/api/usage/rate-limits)

## Code Examples

### Secure API Call Pattern

```typescript
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    
    const response = await admin.graphql(`
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
    `, {
      variables: {
        input: {
          reason: "correction",
          changes: [{
            delta: quantity,
            inventoryItemId: inventoryItemId,
            locationId: locationId
          }]
        }
      }
    });
    
    const data = await response.json();
    
    if (data.data?.inventoryAdjustQuantities?.userErrors?.length > 0) {
      throw new Error(data.data.inventoryAdjustQuantities.userErrors[0].message);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Inventory update error:", error);
    throw boundary.error(error, { status: 500 });
  }
};
```

