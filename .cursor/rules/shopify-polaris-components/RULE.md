---
description: "Always use Shopify Polaris web components for all UI elements in the frontend"
alwaysApply: true
globs: ["app/routes/**/*.tsx", "app/**/*.tsx"]
---

# Shopify Polaris Web Components Rule

## Frontend UI Components

**ALWAYS use Shopify Polaris web components** for all UI elements in the frontend. Never use React components from `@shopify/polaris` or custom HTML elements when Polaris web components are available.

### Reference Documentation
- [Using Polaris web components](https://shopify.dev/docs/api/app-home/using-polaris-components)
- [Polaris web components documentation](https://shopify.dev/docs/api/app-home/polaris-web-components)

### Available Components

Use these Polaris web components:

- `<s-page>` - Main page container with heading
- `<s-button>` - Buttons with variants (primary, secondary, tertiary)
- `<s-card>` or `<s-section>` - Content sections
- `<s-text-field>` - Input fields
- `<s-select>` - Dropdown selects
- `<s-data-table>` - Tables for data display
- `<s-stack>` - Layout component for spacing
- `<s-box>` - Container with padding/borders
- `<s-heading>`, `<s-paragraph>`, `<s-text>` - Typography
- `<s-link>` - Links
- `<s-toast>` - Toast notifications (via App Bridge)

### Examples

```tsx
// ✅ CORRECT - Using Polaris web components
import { useAppBridge } from "@shopify/app-bridge-react";

export default function ScanView() {
  return (
    <s-page heading="Scan Inventory">
      <s-section heading="Camera Scanner">
        <s-button slot="primary-action" onClick={startScan}>
          Start Scanning
        </s-button>
        <s-stack direction="block" gap="base">
          <s-text-field 
            label="Barcode" 
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />
        </s-stack>
      </s-section>
    </s-page>
  );
}

// ❌ WRONG - Using React Polaris components
import { Page, Button, Card } from "@shopify/polaris";

export default function ScanView() {
  return (
    <Page title="Scan Inventory">
      <Card>
        <Button onClick={startScan}>Start Scanning</Button>
      </Card>
    </Page>
  );
}
```

### App Bridge Integration

When using Polaris web components, wrap the app with App Bridge Provider:

```tsx
import { useAppBridge } from "@shopify/app-bridge-react";

const shopify = useAppBridge();
// Use shopify.toast.show(), shopify.intents.invoke(), etc.
```

Reference: [Getting started with App Bridge React](https://shopify.dev/docs/api/app-bridge/previous-versions/app-bridge-from-npm/using-react)

### Event Handling

Polaris web components use standard React event handlers:

```tsx
<s-button onClick={handleClick}>Click me</s-button>
<s-text-field 
  onChange={(e) => setValue(e.target.value)}
  onBlur={handleBlur}
/>
```

### Properties vs Attributes

- Use **properties** for dynamic values: `value={state}`, `loading={isLoading}`
- Use **attributes** for static values: `variant="primary"`, `direction="block"`

Reference: [Properties vs Attributes](https://shopify.dev/docs/api/app-home/using-polaris-components#properties-vs-attributes)

### Accessibility

Always include:
- `label` prop on form inputs
- `aria-label` for icon-only buttons
- Proper heading hierarchy
- Semantic HTML structure

Reference: [Accessibility guidelines](https://shopify.dev/docs/api/app-home/using-polaris-components#accessibility)

