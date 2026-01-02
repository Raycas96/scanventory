---
description: "Ensure all code follows Built for Shopify standards and best practices"
alwaysApply: true
---

# Built for Shopify Compliance

## Overview

**ALWAYS ensure the app meets Built for Shopify standards** for performance, security, and user experience.

### Reference Documentation
- [Built for Shopify](https://shopify.dev/docs/built-for-shopify)
- [Built for Shopify criteria](https://shopify.com/partners/blog/built-for-shopify-updates)

## Key Requirements

### 1. Performance

#### Load Time
- ✅ Initial load must be < 2 seconds
- ✅ Use code splitting and lazy loading
- ✅ Minimize bundle size
- ✅ Optimize images and assets

```typescript
// ✅ CORRECT - Lazy load heavy components
import { lazy, Suspense } from "react";

const BarcodeScanner = lazy(() => import("./BarcodeScanner"));

export default function ScanView() {
  return (
    <Suspense fallback={<s-spinner />}>
      <BarcodeScanner />
    </Suspense>
  );
}
```

#### API Performance
- ✅ Use GraphQL for efficient queries (request only needed fields)
- ✅ Implement proper caching where appropriate
- ✅ Handle API rate limits gracefully

```typescript
// ✅ CORRECT - Request only needed fields
const query = `
  query getProduct($barcode: String!) {
    products(first: 1, query: $barcode) {
      nodes {
        id
        title
        variants(first: 1) {
          nodes {
            id
            barcode
            inventoryQuantity
          }
        }
      }
    }
  }
`;

// ❌ WRONG - Requesting all fields
const query = `
  query {
    products {
      nodes {
        # ... all fields
      }
    }
  }
`;
```

### 2. UI/UX Standards

#### Polaris Components
- ✅ Use Polaris web components for consistent UI
- ✅ Follow Shopify design patterns
- ✅ Ensure mobile responsiveness

Reference: [Using Polaris web components](https://shopify.dev/docs/api/app-home/using-polaris-components)

#### Navigation
- ✅ Use App Bridge navigation (not regular links)
- ✅ Maintain embedded app context
- ✅ Provide clear user feedback

```typescript
// ✅ CORRECT - Use App Bridge navigation
import { useAppBridge } from "@shopify/app-bridge-react";

const shopify = useAppBridge();
shopify.intents.invoke?.("edit:shopify/Product", {
  value: productId
});
```

### 3. Security

#### Scopes
- ✅ Request only necessary API scopes
- ✅ Document why each scope is needed
- ✅ Handle scope updates gracefully

```typescript
// ✅ CORRECT - Minimal scopes
scopes: [
  "read_products",    // To match products by barcode
  "write_inventory",  // To update inventory levels
  "read_locations"    // To support multi-location
]
```

#### Data Protection
- ✅ Encrypt sensitive data
- ✅ Follow protected customer data guidelines
- ✅ Implement secure session management

Reference: [Protected Customer Data](https://shopify.dev/docs/apps/launch/protected-customer-data)

### 4. Error Handling

#### User-Friendly Errors
- ✅ Show clear, actionable error messages
- ✅ Use toast notifications for feedback
- ✅ Handle edge cases gracefully

```typescript
// ✅ CORRECT - User-friendly error handling
import { useAppBridge } from "@shopify/app-bridge-react";

try {
  await updateInventory(quantity);
  shopify.toast.show("Inventory updated successfully");
} catch (error) {
  shopify.toast.show("Failed to update inventory. Please try again.", {
    isError: true
  });
  console.error("Inventory update error:", error);
}
```

#### API Error Handling
- ✅ Handle GraphQL errors properly
- ✅ Validate user input
- ✅ Provide fallback behavior

```typescript
// ✅ CORRECT - Handle GraphQL errors
const response = await admin.graphql(query);
const data = await response.json();

if (data.errors) {
  throw new Error(data.errors[0].message);
}

if (data.data?.inventoryAdjustQuantities?.userErrors?.length > 0) {
  const error = data.data.inventoryAdjustQuantities.userErrors[0];
  throw new Error(error.message);
}
```

### 5. Accessibility

- ✅ Use semantic HTML
- ✅ Include ARIA labels where needed
- ✅ Ensure keyboard navigation works
- ✅ Test with screen readers

Reference: [Accessibility guidelines](https://shopify.dev/docs/api/app-home/using-polaris-components#accessibility)

### 6. Mobile Support

- ✅ Ensure responsive design
- ✅ Test on mobile devices
- ✅ Optimize touch interactions
- ✅ Handle camera permissions properly

### 7. Documentation

- ✅ Document API usage
- ✅ Provide clear error messages
- ✅ Include code comments for complex logic
- ✅ Maintain README with setup instructions

### 8. Testing

- ✅ Test all user flows
- ✅ Test error scenarios
- ✅ Test on different devices/browsers
- ✅ Verify API integrations

## Checklist

Before submitting for Built for Shopify review:

- [ ] Load time < 2 seconds
- [ ] All UI uses Polaris web components
- [ ] Only necessary API scopes requested
- [ ] Secure data handling (encryption, no customer data)
- [ ] Proper error handling and user feedback
- [ ] Mobile responsive design
- [ ] Accessibility standards met
- [ ] Webhook security implemented
- [ ] App uninstall cleanup implemented
- [ ] Documentation complete

## Code Review Checklist

When reviewing code, ensure:

1. **Performance**: No unnecessary API calls, lazy loading for heavy components
2. **Security**: Proper authentication, no exposed secrets, secure data storage
3. **UI**: Polaris components used, consistent styling, mobile-friendly
4. **Errors**: User-friendly messages, proper error boundaries
5. **Accessibility**: ARIA labels, keyboard navigation, semantic HTML
6. **Documentation**: Code comments, API documentation, README updates

