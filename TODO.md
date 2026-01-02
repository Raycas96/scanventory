# Scanventory Development Roadmap

**Solo Developer – 8–12 Weeks**

This document tracks the development progress of Scanventory, a Shopify app for instant inventory updates via barcode scanning.

## 📋 Development Phases

### Phase 1: Project Setup & Planning (Week 1)

**Status**: ✅ Complete

**Goals**: Prepare the development environment, project tools, and base repository.

**Tasks**:

- [x] Create GitHub repository
- [x] Set up Shopify Partner account
- [x] Create development store
- [x] Install Shopify CLI
- [x] Initialize Remix/React Router app template
- [x] Organize project structure
- [x] Install Polaris, App Bridge dependencies
- [x] Configure Shopify context with App Bridge
- [x] Set up `.env` file for secrets
- [x] Document database schema
- [x] Create README with stack overview

**Resources**:

- [Shopify CLI Getting Started](https://shopify.dev/docs/apps/tools/cli/getting-started)
- [Shopify App React Router Template](https://github.com/Shopify/shopify-app-template-react-router)
- [Using Polaris web components](https://shopify.dev/docs/api/app-home/using-polaris-components)

---

### Phase 2: Core Infrastructure & Auth (Week 2)

**Status**: 🔄 In Progress

**Goals**: Build the base authentication and data foundation for the app.

**Tasks**:

- [ ] Implement OAuth flow with required scopes:
      [x] `read_products` - [API scopes](https://shopify.dev/docs/apps/tools/cli/configuration#access_scopes)
      [x] `write_inventory` - [Inventory API](https://shopify.dev/docs/api/admin-graphql/latest/mutations/inventoryAdjustQuantities)
      [x] `read_locations` - [Locations API](https://shopify.dev/docs/api/admin-graphql/latest/queries/locations)
- [ ] Build secure session storage with encrypted cookies/PostgreSQL
- [ ] Set up PostgreSQL locally with Prisma
- [ ] Define and create database tables:
  - `merchants` - Merchant settings
  - `scan_logs` - Scan history
  - `settings` - App preferences
- [ ] Build reusable API client module for Shopify REST and GraphQL
- [ ] Implement uninstall webhook endpoint
  - [Webhook security](https://shopify.dev/docs/apps/security/webhooks)
  - [App uninstalled webhook](https://shopify.dev/docs/apps/build/webhooks/subscribe)

**Resources**:

- [Shopify App React Router Authentication](https://shopify.dev/docs/api/shopify-app-react-router)
- [Protected Customer Data](https://shopify.dev/docs/apps/launch/protected-customer-data)
- [Prisma Documentation](https://www.prisma.io/docs)

---

### Phase 3: UI Scaffolding with Polaris (Week 3)

**Status**: ⏳ Pending

**Goals**: Build a functional Polaris-based UI foundation.

**Tasks**:

- [ ] Create main dashboard layout with Polaris web components
  - [Polaris web components](https://shopify.dev/docs/api/app-home/using-polaris-components)
- [ ] Add top navigation bar with shop name
- [ ] Add active location selector dropdown
- [ ] Add sidebar menu with links:
  - "Scan" route
  - "History" route
  - "Settings" route
- [ ] Design scanner view page with placeholder for camera and product info
- [ ] Implement table to show recent scan logs using Polaris DataTable
- [ ] Add Scan Mode toggle (Single Scan vs Batch Scan)

**Resources**:

- [Polaris web components documentation](https://shopify.dev/docs/api/app-home/polaris-web-components)
- [App Bridge React](https://shopify.dev/docs/api/app-bridge/previous-versions/app-bridge-from-npm/using-react)

---

### Phase 4: Camera & Barcode Scanner Integration (Week 4–5)

**Status**: ⏳ Pending

**Goals**: Enable barcode scanning using the device camera and identify matching products.

**Tasks**:

- [ ] Research and select barcode library (ZXing-js or Dynamsoft)
- [ ] Install barcode scanning library
- [ ] Build React component to handle camera access
- [ ] Implement live barcode scanning from camera feed
- [ ] Add support for barcode cooldown to avoid duplicate reads
- [ ] Handle errors:
  - Camera permission denied
  - Barcode not recognized
  - Camera not available
- [ ] On successful scan, call Shopify GraphQL API to match product
  - [Product queries](https://shopify.dev/docs/api/admin-graphql/latest/queries/products)
  - Query by barcode or SKU
- [ ] Display product information:
  - Product name
  - Product image thumbnail
  - Current stock at selected location
  - Variant details

**Resources**:

- [ZXing-js library](https://github.com/zxing-js/library)
- [Dynamsoft Barcode Reader](https://www.dynamsoft.com/barcode-reader/sdk-javascript/)
- [HTML5 getUserMedia API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Shopify Admin GraphQL API](https://shopify.dev/docs/api/admin-graphql)

---

### Phase 5: Inventory Adjustments (Week 5–6)

**Status**: ⏳ Pending

**Goals**: Let merchants adjust inventory by scanning items and editing quantity.

**Tasks**:

- [ ] Build Polaris form with quantity input (+/- buttons)
- [ ] On confirm, call `inventoryAdjustQuantities` mutation
  - [inventoryAdjustQuantities mutation](https://shopify.dev/docs/api/admin-graphql/latest/mutations/inventoryAdjustQuantities)
  - Use correct `locationId` from selected location
- [ ] Save each scan record to `scan_logs` table:
  - Timestamp
  - Product ID
  - Barcode
  - Quantity change
  - Location ID
  - User ID (from session)
- [ ] Add server-side route to export scan history to CSV
- [ ] Implement toast notifications for success/failure
  - [App Bridge toast](https://shopify.dev/docs/api/app-bridge-library/reference/toast)
- [ ] Add scan log filtering:
  - By date range
  - By product
  - By location

**Resources**:

- [Inventory API documentation](https://shopify.dev/docs/api/admin-graphql/latest/mutations/inventoryAdjustQuantities)
- [REST Inventory API](https://shopify.dev/docs/api/admin-rest/latest/resources/inventorylevel)

---

### Phase 6: Settings & Multi-Location Support (Week 6–7)

**Status**: ⏳ Pending

**Goals**: Add merchant settings and support multi-location inventory control.

**Tasks**:

- [ ] Build Settings page using Polaris web components
- [ ] Add settings fields:
  - Default location selection
  - Enable/disable batch mode toggle
  - Camera vs scanner input preference
- [ ] Extend database schema to store merchant preferences
- [ ] Update scanner workflow to reflect location and settings in real time
- [ ] Add ability to switch locations dynamically from dashboard
- [ ] Query merchant locations on app load
  - [Locations query](https://shopify.dev/docs/api/admin-graphql/latest/queries/locations)

**Resources**:

- [Multi-location inventory](https://shopify.dev/docs/api/admin-graphql/latest/queries/locations)
- [Polaris form components](https://shopify.dev/docs/api/app-home/using-polaris-components#working-with-forms)

---

### Phase 7: Offline Queue & Sync (Optional, Week 8)

**Status**: ⏳ Pending

**Goals**: Add offline support so users can queue scans without internet.

**Tasks**:

- [ ] Add IndexedDB support using Dexie.js or native IndexedDB API
- [ ] Detect offline status using `navigator.onLine` API
- [ ] Trigger offline UI mode when disconnected
- [ ] Queue unsynced scans in IndexedDB:
  - Product ID
  - Barcode
  - Quantity change
  - Timestamp
- [ ] On reconnect, send queued scans to Shopify via background job
- [ ] Show scan sync status in scan history:
  - Pending
  - Synced
  - Failed (with retry option)

**Resources**:

- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Dexie.js library](https://dexie.org/)
- [Service Workers for offline support](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

### Phase 8: Polish, Performance & Testing (Week 9)

**Status**: ⏳ Pending

**Goals**: Final QA, performance tuning, and error handling.

**Tasks**:

- [ ] Minimize JS bundles:
  - Code splitting
  - Lazy loading for barcode scanner
  - Tree shaking
- [ ] Add try/catch blocks and error boundaries in major components
- [ ] Test camera performance across:
  - Desktop browsers (Chrome, Firefox, Safari, Edge)
  - Mobile browsers (iOS Safari, Chrome Android)
- [ ] Use Lighthouse to benchmark:
  - Performance score
  - Accessibility score
  - Best practices score
- [ ] Review app against Built for Shopify checklist
  - [Built for Shopify criteria](https://shopify.dev/docs/built-for-shopify)
- [ ] Performance optimization:
  - API call optimization
  - Image optimization
  - Bundle size reduction

**Resources**:

- [Built for Shopify](https://shopify.dev/docs/built-for-shopify)
- [Shopify Performance Best Practices](https://shopify.dev/docs/apps/best-practices/performance)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

### Phase 9: Deployment & App Submission (Week 10–11)

**Status**: ⏳ Pending

**Goals**: Deploy the app in production and submit to Shopify App Store.

**Tasks**:

- [ ] Choose hosting platform:
  - [Fly.io](https://fly.io/docs/js/shopify/)
  - [Vercel](https://vercel.com/docs)
  - [Render](https://render.com/docs/deploy-shopify-app)
  - [Google Cloud Run](https://shopify.dev/docs/apps/launch/deployment/deploy-to-google-cloud-run)
- [ ] Set up production environment variables
- [ ] Run production database migration
- [ ] Configure production webhook URLs
- [ ] Update app settings in Shopify Partners dashboard
- [ ] Enable monitoring:
  - Error tracking (Sentry, LogRocket)
  - Performance monitoring
  - Uptime monitoring
- [ ] Submit app for review in Shopify App Store
- [ ] Address feedback from Shopify review team
- [ ] Fix any issues found during review

**Resources**:

- [Shopify Deployment Guide](https://shopify.dev/docs/apps/launch/deployment)
- [App Store Submission](https://shopify.dev/docs/apps/launch/app-store)
- [Shopify Partners Dashboard](https://partners.shopify.com/)

---

### Phase 10: Marketing & Launch (Week 12)

**Status**: ⏳ Pending

**Goals**: Launch publicly and onboard first users.

**Tasks**:

- [ ] Record demo video showing:
  - Scanning process
  - Inventory update flow
  - CSV export feature
- [ ] Take polished screenshots:
  - Dashboard view
  - Scanner interface
  - Scan history
  - Settings page
- [ ] Write App Store listing:
  - Title and description
  - Feature bullets
  - FAQs
  - Use cases
- [ ] Post launch announcements:
  - Shopify Community forums
  - Reddit (r/shopify)
  - LinkedIn
  - Twitter/X
- [ ] Set up free trial:
  - 14-30 day free trial period
  - Usage tier limits
- [ ] Collect early user feedback
- [ ] Iterate quickly on reported issues

**Resources**:

- [Shopify App Store Guidelines](https://shopify.dev/docs/apps/launch/app-store)
- [Marketing Your App](https://shopify.dev/docs/apps/launch/marketing)

---

## 🔗 Key Documentation Links

### Shopify APIs

- [Admin GraphQL API](https://shopify.dev/docs/api/admin-graphql)
- [Admin REST API](https://shopify.dev/docs/api/admin-rest)
- [inventoryAdjustQuantities mutation](https://shopify.dev/docs/api/admin-graphql/latest/mutations/inventoryAdjustQuantities)
- [Product queries](https://shopify.dev/docs/api/admin-graphql/latest/queries/products)
- [Locations queries](https://shopify.dev/docs/api/admin-graphql/latest/queries/locations)

### Frontend

- [Polaris web components](https://shopify.dev/docs/api/app-home/using-polaris-components)
- [App Bridge React](https://shopify.dev/docs/api/app-bridge/previous-versions/app-bridge-from-npm/using-react)
- [React Router](https://reactrouter.com/)

### Backend & Security

- [Protected Customer Data](https://shopify.dev/docs/apps/launch/protected-customer-data)
- [Built for Shopify](https://shopify.dev/docs/built-for-shopify)
- [Webhook Security](https://shopify.dev/docs/apps/security/webhooks)
- [API Scopes](https://shopify.dev/docs/apps/tools/cli/configuration#access_scopes)

### Development

- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [Shopify App React Router](https://shopify.dev/docs/api/shopify-app-react-router)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## 📊 Progress Tracking

**Overall Progress**: 10% (Phase 1 complete, Phase 2 in progress)

**Completed Phases**: 1/10
**In Progress**: Phase 2
**Pending Phases**: 8

---

## 📝 Notes

- All tasks should follow [Built for Shopify](https://shopify.dev/docs/built-for-shopify) standards
- Frontend must use [Polaris web components](https://shopify.dev/docs/api/app-home/using-polaris-components)
- Backend must follow [Protected Customer Data](https://shopify.dev/docs/apps/launch/protected-customer-data) guidelines
- All Shopify API calls should be authenticated and use minimal scopes
- Test thoroughly on both desktop and mobile devices
- Ensure accessibility standards are met

---

**Last Updated**: 2025-01-27
