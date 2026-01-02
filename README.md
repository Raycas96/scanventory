# Scanventory — Instant Inventory Updates with a Scan

> **Fast, hardware-free inventory management for Shopify merchants**

Scanventory is a Shopify embedded app that enables merchants to update inventory instantly by scanning barcodes (UPC, EAN, QR, SKU) using their phone camera or webcam. No extra hardware required.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Development](#development)
- [Shopify Integration](#shopify-integration)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

Scanventory helps physical product sellers (warehouses, retail shops, stockrooms) manage inventory accurately and efficiently. By leveraging barcode scanning technology, merchants can:

- **Save time**: Eliminate manual data entry and spreadsheets
- **Reduce errors**: Automated scanning prevents human mistakes
- **Stay accurate**: Real-time inventory updates prevent oversells and stockouts
- **Work anywhere**: Mobile-friendly interface works on any device

### App Store Positioning

Scanventory is positioned as a fast, hardware-free solution for inventory management. Our messaging emphasizes:

- "No more spreadsheets or manual counts"
- "Works with your phone camera (no extra hardware needed)"
- "Accurate, fast inventory control from your phone"

**Target Audience**: Physical product sellers who need accurate, up-to-date inventory without bulky hardware.

## ✨ Features

### Must-Have (v1)

- ✅ **Barcode Scanner UI (Camera/Webcam)**: Live scan view using device camera or webcam to decode barcodes (UPC, EAN, QR, SKU)
- ✅ **Product Matching via Shopify API**: Automatic product lookup using scanned barcode or SKU
- ✅ **Real-Time Inventory Updates**: Adjust inventory quantities and commit changes immediately via Shopify Admin API
- ✅ **Scan Log**: On-screen history of recent scans with product names, barcodes, and adjustments
- ✅ **Multi-Location Support**: Select active location for inventory updates
- ✅ **CSV Export**: Download scan logs for analysis and record-keeping

### Nice-to-Have (v2+)

- 🔄 **Bulk Scanning (Batch Mode)**: Queue multiple scans before applying updates
- 🔔 **Low-Stock Alerts**: Set thresholds and receive notifications when stock falls below levels
- 🏷️ **Custom Scan Actions**: Mark items as damaged, transfer stock, or log received shipments
- 📊 **Scan History Analytics**: Charts and summaries of scan trends and frequently scanned items
- 🖨️ **SKU/Label Printing Integration**: Generate barcode labels after scanning

## 🛠️ Tech Stack

### Frontend

- **Framework**: [React Router](https://reactrouter.com/) (v7.9.3)
- **UI Components**: [Shopify Polaris Web Components](https://shopify.dev/docs/api/app-home/using-polaris-components)
- **App Bridge**: [@shopify/app-bridge-react](https://shopify.dev/docs/api/app-bridge/previous-versions/app-bridge-from-npm/using-react) (v4.2.4)
- **Barcode Scanning**: ZXing-js or Dynamsoft Web SDK (client-side)

### Backend

- **Runtime**: Node.js (v20.19+ or v22.12+)
- **Framework**: React Router Server (via @react-router/node)
- **Database**: PostgreSQL (production) / SQLite (development)
- **ORM**: [Prisma](https://www.prisma.io/) (v6.16.3)
- **Session Storage**: [@shopify/shopify-app-session-storage-prisma](https://github.com/Shopify/shopify-api-js/tree/main/packages/shopify-app-session-storage-prisma)

### Development Tools

- **Shopify CLI**: For local development and deployment
- **TypeScript**: Full type safety
- **Vite**: Build tool and dev server
- **ESLint**: Code linting

## 🏗️ Architecture

### Frontend Architecture

The app is built as an embedded Shopify admin app using:

- **Polaris Web Components**: All UI elements use Shopify's Polaris web components for consistent admin feel
  - Reference: [Using Polaris web components](https://shopify.dev/docs/api/app-home/using-polaris-components)
- **App Bridge**: Handles authentication, routing, and Shopify context
  - Reference: [Getting started with App Bridge React](https://shopify.dev/docs/api/app-bridge/previous-versions/app-bridge-from-npm/using-react)
- **Barcode Scanner**: Client-side JavaScript library (ZXing-js or Dynamsoft) processes camera feed
- **Offline Support**: IndexedDB for queuing scans when offline, auto-sync when online

### Backend Architecture

- **OAuth Flow**: Shopify OAuth 2.0 for authentication
- **Session Management**: Encrypted session storage via Prisma
- **API Client**: Reusable module for Shopify REST and GraphQL calls
- **Webhooks**: Handle app uninstall and scope updates
- **Database**: PostgreSQL for scan logs, merchant settings, and audit trails

### Data Flow

1. **Scan**: User scans barcode with camera → JavaScript library decodes → Extract barcode value
2. **Match**: Send barcode to Shopify Admin API → Query products by barcode/SKU → Return product details
3. **Update**: User adjusts quantity → Call `inventoryAdjustQuantities` mutation → Update Shopify inventory
4. **Log**: Save scan record to database → Display in scan history → Enable CSV export

## 🚀 Getting Started

### Prerequisites

1. **Node.js**: v20.19+ or v22.12+ ([Download](https://nodejs.org/en/download/))
2. **Shopify Partner Account**: [Create account](https://partners.shopify.com/signup)
3. **Development Store**: [Create development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store)
4. **Shopify CLI**: [Install CLI](https://shopify.dev/docs/apps/tools/cli/getting-started)
   ```bash
npm install -g @shopify/cli@latest
```

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd scanventory
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   SHOPIFY_API_KEY=your_api_key
   SHOPIFY_API_SECRET=your_api_secret
   SCOPES=read_products,write_inventory,read_locations
   SHOPIFY_APP_URL=https://your-app-url.com
   DATABASE_URL=file:./dev.sqlite
   ```

4. **Set up database**:
   ```bash
   pnpm prisma generate
   pnpm prisma migrate dev
   ```

5. **Start development server**:
   ```bash
   pnpm dev
   ```

   Press `P` to open the URL to your app. Once you click install, you can start development.

## 💻 Development

### Project Structure

```
scanventory/
├── app/
│   ├── routes/              # React Router routes
│   │   ├── app._index.tsx   # Main dashboard
│   │   ├── app.tsx          # App layout with Polaris
│   │   └── auth.$.tsx       # OAuth handler
│   ├── shopify.server.ts    # Shopify app configuration
│   ├── db.server.ts         # Prisma client
│   └── root.tsx             # Root component
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── public/                  # Static assets
├── extensions/              # Shopify app extensions
├── shopify.app.toml         # App configuration
└── package.json
```

### Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run database migrations
pnpm prisma migrate dev

# Generate Prisma client
pnpm prisma generate

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Deploy to Shopify
pnpm deploy
```

### Code Style Guidelines

- **Frontend**: Always use [Polaris web components](https://shopify.dev/docs/api/app-home/using-polaris-components) for UI elements
- **Backend**: Follow [Shopify protected customer data guidelines](https://shopify.dev/docs/apps/launch/protected-customer-data)
- **Overall**: Adhere to [Built for Shopify standards](https://shopify.dev/docs/built-for-shopify)
- **TypeScript**: Strict mode enabled, prefer type safety
- **Error Handling**: Use try/catch blocks and error boundaries

## 🔌 Shopify Integration

### Required Scopes

- `read_products`: Query products by barcode or SKU
- `write_inventory`: Update inventory levels via `inventoryAdjustQuantities` mutation
- `read_locations`: List merchant locations for multi-location support

Reference: [Shopify API scopes](https://shopify.dev/docs/apps/tools/cli/configuration#access_scopes)

### Shopify APIs Used

#### GraphQL Admin API

- **Product Lookup**: Query products by barcode or SKU
  - Reference: [Product queries](https://shopify.dev/docs/api/admin-graphql/latest/queries/products)
- **Inventory Updates**: `inventoryAdjustQuantities` mutation
  - Reference: [inventoryAdjustQuantities mutation](https://shopify.dev/docs/api/admin-graphql/latest/mutations/inventoryAdjustQuantities)
- **Locations**: Query merchant locations
  - Reference: [Location queries](https://shopify.dev/docs/api/admin-graphql/latest/queries/locations)

#### REST Admin API (Alternative)

- **Inventory Levels**: `POST /admin/api/{version}/inventory_levels/adjust.json`
  - Reference: [InventoryLevel resource](https://shopify.dev/docs/api/admin-rest/latest/resources/inventorylevel)

### Webhooks

- **app/uninstalled**: Delete merchant data when app is uninstalled
- **app/scopes_update**: Handle scope changes

Reference: [Webhook subscriptions](https://shopify.dev/docs/apps/build/webhooks/subscribe)

### Authentication

The app uses Shopify OAuth 2.0 flow via `@shopify/shopify-app-react-router`:

```typescript
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  // Use admin.graphql() or admin.rest() for API calls
};
```

Reference: [Shopify App React Router docs](https://shopify.dev/docs/api/shopify-app-react-router)

## 📚 API Documentation

### Internal API Routes

#### Scan Routes

- `POST /app/scan` - Process barcode scan and match product
- `POST /app/inventory/adjust` - Update inventory quantity
- `GET /app/scans` - Get scan history
- `GET /app/scans/export` - Export scan log as CSV

#### Settings Routes

- `GET /app/settings` - Get merchant settings
- `POST /app/settings` - Update merchant settings (default location, etc.)

### Database Schema

See `prisma/schema.prisma` for complete schema. Key models:

- `Session` - Shopify OAuth sessions (managed by Prisma Session Storage)
- `Merchant` - Merchant settings and preferences
- `ScanLog` - Scan history records
- `Location` - Cached location data

## 🚢 Deployment

### Prerequisites

1. Production database (PostgreSQL recommended)
2. Hosting platform (Fly.io, Vercel, Railway, etc.)
3. Environment variables configured

### Deployment Steps

1. **Update database URL** in `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Set environment variables** in your hosting platform:
   - `SHOPIFY_API_KEY`
   - `SHOPIFY_API_SECRET`
   - `SCOPES`
   - `SHOPIFY_APP_URL`
   - `DATABASE_URL`
   - `NODE_ENV=production`

3. **Run database migrations**:
   ```bash
   pnpm prisma migrate deploy
   ```

4. **Build and deploy**:
   ```bash
   pnpm build
   # Deploy using your hosting platform's CLI
   ```

### Hosting Options

- **Fly.io**: [Deploy to Fly.io](https://fly.io/docs/js/shopify/)
- **Vercel**: [Deploy to Vercel](https://vercel.com/docs)
- **Render**: [Deploy to Render](https://render.com/docs/deploy-shopify-app)
- **Google Cloud Run**: [Deploy to Google Cloud Run](https://shopify.dev/docs/apps/launch/deployment/deploy-to-google-cloud-run)

Reference: [Shopify deployment documentation](https://shopify.dev/docs/apps/launch/deployment)

### Built for Shopify Compliance

To maintain "Built for Shopify" status, ensure:

- ✅ Fast load times (< 2s initial load)
- ✅ Minimal API scopes (only what's needed)
- ✅ Secure data practices (encrypted storage, secure OAuth)
- ✅ Polaris UI components for native feel
- ✅ Proper error handling and user feedback
- ✅ Mobile-responsive design

Reference: [Built for Shopify criteria](https://shopify.dev/docs/built-for-shopify)

## 🔒 Security & Privacy

### Data Protection

- **Encryption**: All sensitive data encrypted at rest
- **Session Security**: Secure OAuth tokens via Shopify
- **Data Deletion**: Automatic cleanup on app uninstall (within 30 days)
- **No Customer Data**: App only stores product/variant IDs and barcodes

### Protected Customer Data

The app follows [Shopify's protected customer data guidelines](https://shopify.dev/docs/apps/launch/protected-customer-data):

- ✅ No customer personal data stored
- ✅ Secure API calls with proper authentication
- ✅ Data encryption at rest
- ✅ Proper webhook HMAC validation

## 📖 Additional Resources

### Shopify Documentation

- [Shopify App Development](https://shopify.dev/docs/apps/getting-started)
- [Polaris Web Components](https://shopify.dev/docs/api/app-home/using-polaris-components)
- [App Bridge React](https://shopify.dev/docs/api/app-bridge/previous-versions/app-bridge-from-npm/using-react)
- [Admin GraphQL API](https://shopify.dev/docs/api/admin-graphql)
- [Built for Shopify](https://shopify.dev/docs/built-for-shopify)
- [Protected Customer Data](https://shopify.dev/docs/apps/launch/protected-customer-data)

### Development Resources

- [React Router Docs](https://reactrouter.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Shopify CLI Docs](https://shopify.dev/docs/apps/tools/cli)

## 🤝 Contributing

This is a solo project, but contributions and feedback are welcome! Please:

1. Follow the code style guidelines
2. Use Polaris web components for UI
3. Ensure all Shopify API calls follow best practices
4. Test thoroughly before submitting changes

## 📝 License

[Add your license here]

## 👤 Author

**raycas**

---

**Built with ❤️ for Shopify merchants**
