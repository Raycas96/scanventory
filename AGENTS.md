# Scanventory Agent Instructions

This document provides instructions for AI agents working on the Scanventory project.

## Project Overview

Scanventory is a Shopify embedded app that enables merchants to update inventory instantly by scanning barcodes using their phone camera or webcam. The app is built with React Router, Polaris web components, and follows Shopify's best practices.

## Core Principles

### 1. Always Use Polaris Web Components

**CRITICAL**: All frontend UI must use Shopify Polaris web components, not React components from `@shopify/polaris`.

- Use `<s-page>`, `<s-button>`, `<s-section>`, etc.
- Reference: [Using Polaris web components](https://shopify.dev/docs/api/app-home/using-polaris-components)
- Never use `@shopify/polaris` React components

### 2. Backend Security

**ALWAYS** follow Shopify's protected customer data guidelines:

- Never store customer personal information
- Encrypt sensitive data at rest
- Validate webhook HMAC signatures
- Use secure session storage
- Reference: [Protected Customer Data](https://shopify.dev/docs/apps/launch/protected-customer-data)

### 3. Built for Shopify Compliance

Ensure all code meets Built for Shopify standards:

- Load time < 2 seconds
- Minimal API scopes
- Secure data practices
- Polaris UI components
- Proper error handling
- Reference: [Built for Shopify](https://shopify.dev/docs/built-for-shopify)

## Code Patterns

### Frontend Pattern

```tsx
import { useAppBridge } from "@shopify/app-bridge-react";

export default function MyComponent() {
  const shopify = useAppBridge();
  
  return (
    <s-page heading="Page Title">
      <s-section heading="Section Title">
        <s-button 
          slot="primary-action" 
          onClick={handleAction}
        >
          Action
        </s-button>
        <s-stack direction="block" gap="base">
          {/* Content */}
        </s-stack>
      </s-section>
    </s-page>
  );
}
```

### Backend Pattern

```typescript
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { admin } = await authenticate.admin(request);
    
    const response = await admin.graphql(`
      query {
        # GraphQL query
      }
    `);
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("Error:", error);
    throw boundary.error(error, { status: 500 });
  }
};
```

### API Scopes

Only request these scopes:
- `read_products` - To match products by barcode
- `write_inventory` - To update inventory levels
- `read_locations` - To support multi-location

Reference: [API scopes](https://shopify.dev/docs/apps/tools/cli/configuration#access_scopes)

## File Structure

```
app/
  routes/          # React Router routes
  shopify.server.ts # Shopify app config
  db.server.ts     # Prisma client
prisma/
  schema.prisma    # Database schema
.cursor/
  rules/           # Cursor rules
```

## Key Technologies

- **Frontend**: React Router, Polaris web components, App Bridge
- **Backend**: Node.js, React Router Server, Prisma
- **Database**: PostgreSQL (production), SQLite (development)
- **APIs**: Shopify Admin GraphQL API

## Important Links

- [Polaris web components](https://shopify.dev/docs/api/app-home/using-polaris-components)
- [App Bridge React](https://shopify.dev/docs/api/app-bridge/previous-versions/app-bridge-from-npm/using-react)
- [Protected Customer Data](https://shopify.dev/docs/apps/launch/protected-customer-data)
- [Built for Shopify](https://shopify.dev/docs/built-for-shopify)
- [Shopify Admin GraphQL API](https://shopify.dev/docs/api/admin-graphql)
- [inventoryAdjustQuantities mutation](https://shopify.dev/docs/api/admin-graphql/latest/mutations/inventoryAdjustQuantities)

## Common Tasks

### Adding a New Route

1. Create file in `app/routes/`
2. Use `authenticate.admin(request)` in loader/action
3. Use Polaris web components for UI
4. Handle errors with boundary.error()

### Making API Calls

1. Authenticate with `authenticate.admin(request)`
2. Use `admin.graphql()` or `admin.rest()`
3. Handle errors and user errors from GraphQL
4. Never expose internal errors to users

### Adding Database Models

1. Update `prisma/schema.prisma`
2. Run `pnpm prisma migrate dev`
3. Use Prisma client from `app/db.server.ts`

## Error Handling

- Always use try/catch blocks
- Use `boundary.error()` for route errors
- Show user-friendly error messages
- Log full errors to console
- Use App Bridge toast for user feedback

## Testing Checklist

Before submitting code:

- [ ] Uses Polaris web components (not React Polaris)
- [ ] Follows protected customer data guidelines
- [ ] Meets Built for Shopify standards
- [ ] Handles errors gracefully
- [ ] Includes proper TypeScript types
- [ ] Works on mobile and desktop
- [ ] Accessible (ARIA labels, keyboard nav)

