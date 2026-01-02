# Scanventory Development Roadmap

**Solo Developer – 8–12 Weeks**

This document tracks the development progress of Scanventory, a Shopify app for instant inventory updates via barcode scanning, manual entry, and file imports (PDF/Excel).

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

- [x] Implement OAuth flow with required scopes:
      [x] `read_products` - [API scopes](https://shopify.dev/docs/apps/tools/cli/configuration#access_scopes)
      [x] `write_inventory` - [Inventory API](https://shopify.dev/docs/api/admin-graphql/latest/mutations/inventoryAdjustQuantities)
      [x] `read_locations` - [Locations API](https://shopify.dev/docs/api/admin-graphql/latest/queries/locations)
- [x] Build secure session storage with encrypted cookies/PostgreSQL
- [x] Set up PostgreSQL locally with Prisma
- [x] Define and create database tables:
  - `shop` - Shop settings and metadata
  - `product_history` - All inventory changes (scan, PDF, Excel, manual)
  - `product_import_history` - Tracks bulk imports (PDF, Excel) with metadata
  - `shop_settings` - App preferences and configuration
  - `product_cache` - Cached product data for faster lookups
  - `location_cache` - Cached location data
  - `job` - Generic job table for background tasks (v2)
- [x] Build reusable API client module for Shopify REST and GraphQL
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
- [ ] Implement table to show recent product history using Polaris DataTable
  - Display input method (scan, manual, pdf, excel)
  - Show product details, quantity changes, timestamps
- [ ] Add input method selector/toggle:
  - Scan mode (primary feature)
  - Manual entry mode
  - Import mode (PDF/Excel - if in v1)
- [ ] Add batch mode toggle for scanning (Single Scan vs Batch Scan)

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

### Phase 5: Inventory Adjustments & Multiple Input Methods (Week 5–6)

**Status**: ⏳ Pending

**Goals**: Let merchants adjust inventory through multiple methods: scanning, manual entry, PDF/Excel import.

**Tasks**:

#### Core Inventory Update

- [ ] Build reusable inventory update service:
  - Call `inventoryAdjustQuantities` mutation
  - [inventoryAdjustQuantities mutation](https://shopify.dev/docs/api/admin-graphql/latest/mutations/inventoryAdjustQuantities)
  - Use correct `locationId` from selected location
  - Handle errors and retries
- [ ] Save all inventory changes to `product_history` table:
  - Timestamp
  - Product ID
  - Barcode/SKU
  - Quantity change
  - Location ID
  - Input method (scan, manual, pdf, excel)
  - User ID (from session)
  - Source file/reference (for imports)

#### Scanning Method (Primary Feature)

- [ ] Build Polaris form with quantity input (+/- buttons) for scanned items
- [ ] On scan confirmation, update inventory via service
- [ ] Save scan record with `inputMethod: "scan"`

#### Manual Entry Method

- [ ] Build manual entry form:
  - Product search/select (by name, SKU, or barcode)
  - Quantity input field
  - Location selector
- [ ] On submit, update inventory via service
- [ ] Save record with `inputMethod: "manual"`

#### PDF Import (v1 or v2)

- [ ] Add PDF upload component
- [ ] Parse PDF to extract product data (barcode/SKU + quantity)
- [ ] Validate and preview import data
- [ ] Batch update inventory for all items
- [ ] Save records with `inputMethod: "pdf"` and source file reference

#### Excel/CSV Import (v1 or v2)

- [ ] Add Excel/CSV upload component
- [ ] Parse file to extract product data (barcode/SKU + quantity)
- [ ] Validate column mapping and data
- [ ] Preview import with validation errors
- [ ] Batch update inventory for all items
- [ ] Save records with `inputMethod: "excel"` and source file reference

#### History & Export

- [ ] Add server-side route to export product history to CSV
- [ ] Implement toast notifications for success/failure
  - [App Bridge toast](https://shopify.dev/docs/api/app-bridge-library/reference/toast)
- [ ] Add product history filtering:
  - By date range
  - By product
  - By location
  - By input method (scan, manual, pdf, excel)
  - By user

**Resources**:

- [Inventory API documentation](https://shopify.dev/docs/api/admin-graphql/latest/mutations/inventoryAdjustQuantities)
- [REST Inventory API](https://shopify.dev/docs/api/admin-rest/latest/resources/inventorylevel)

---

### Phase 6: Import Features - PDF & Excel Support (Week 6)

**Status**: ⏳ Pending

**Goals**: Add PDF and Excel/CSV import capabilities for bulk inventory updates.

**Tasks**:

- [ ] Build PDF import feature:
  - Add PDF upload component using Polaris file upload
  - Parse PDF to extract product data (barcode/SKU + quantity)
  - Use PDF parsing library (pdf-parse, pdfjs-dist, or similar)
  - Validate extracted data format
  - Preview import data before applying
  - Handle parsing errors gracefully
- [ ] Build Excel/CSV import feature:
  - Add Excel/CSV upload component
  - Parse Excel files (xlsx, xls) using library (xlsx, exceljs)
  - Parse CSV files
  - Support column mapping (barcode, SKU, quantity, location)
  - Validate data types and required fields
  - Preview import with validation errors highlighted
  - Support large files (streaming/chunked processing)
- [ ] Implement batch inventory update:
  - Process import data in batches (respect Shopify rate limits)
  - Show progress during import
  - Handle partial failures (some items succeed, some fail)
  - Generate import report (successful vs failed items)
- [ ] Save import records to product history:
  - Track source file name
  - Track input method ("pdf" or "excel")
  - Link all records from same import
  - Store import metadata (file size, row count, etc.)
- [ ] Add import history view:
  - List all imports with status
  - View import details and results
  - Re-import failed items
  - Download import templates

**Resources**:

- [PDF parsing libraries](https://www.npmjs.com/package/pdf-parse)
- [Excel parsing libraries](https://www.npmjs.com/package/xlsx)
- [Shopify Rate Limits](https://shopify.dev/docs/api/usage/rate-limits)
- [Polaris file upload components](https://shopify.dev/docs/api/app-home/using-polaris-components#working-with-forms)

---

### Phase 7: Settings & Multi-Location Support (Week 7)

**Status**: ⏳ Pending

**Goals**: Add merchant settings and support multi-location inventory control.

**Tasks**:

- [ ] Build Settings page using Polaris web components
- [ ] Add settings fields:
  - Default location selection
  - Enable/disable batch mode toggle
  - Camera vs scanner input preference
- [ ] Extend database schema to store merchant preferences
- [ ] Update inventory update workflow to reflect location and settings in real time
  - Works for all input methods (scan, manual, import)
- [ ] Add ability to switch locations dynamically from dashboard
- [ ] Query merchant locations on app load
  - [Locations query](https://shopify.dev/docs/api/admin-graphql/latest/queries/locations)

**Resources**:

- [Multi-location inventory](https://shopify.dev/docs/api/admin-graphql/latest/queries/locations)
- [Polaris form components](https://shopify.dev/docs/api/app-home/using-polaris-components#working-with-forms)

---

### Phase 8: Offline Queue & Sync (Optional, Week 8)

**Status**: ⏳ Pending

**Goals**: Add offline support so users can queue inventory updates (all methods) without internet.

**Tasks**:

- [ ] Add IndexedDB support using Dexie.js or native IndexedDB API
- [ ] Detect offline status using `navigator.onLine` API
- [ ] Trigger offline UI mode when disconnected
- [ ] Queue unsynced inventory updates in IndexedDB:
  - Product ID
  - Barcode/SKU
  - Quantity change
  - Input method (scan, manual, pdf, excel)
  - Location ID
  - Timestamp
  - Source file reference (for imports)
- [ ] On reconnect, send queued inventory updates to Shopify via background job
- [ ] Show sync status in product history:
  - Pending
  - Synced
  - Failed (with retry option)
- [ ] Support offline queue for all input methods:
  - Scanning (primary feature)
  - Manual entry
  - PDF/Excel imports (if implemented)
- [ ] Handle batch imports offline (queue entire import for later sync)

**Resources**:

- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Dexie.js library](https://dexie.org/)
- [Service Workers for offline support](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

### Phase 9: Polish, Performance & Testing (Week 9)

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

### Phase 10: Deployment & App Submission (Week 10–11)

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

### Phase 11: Marketing & Launch (Week 12)

**Status**: ⏳ Pending

**Goals**: Launch publicly and onboard first users.

**Tasks**:

- [ ] Record demo video showing:
  - Barcode scanning process (primary feature)
  - Manual entry workflow
  - PDF/Excel import (if in v1)
  - Inventory update flow
  - History and CSV export feature
- [ ] Take polished screenshots:
  - Dashboard view
  - Scanner interface (primary feature)
  - Manual entry form
  - Import interface (PDF/Excel)
  - Product history view
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

## 🚀 Version 2 Features (Post-Launch)

### Phase 12: Scheduled Jobs & Background Processing (v2)

**Status**: ⏳ Pending

**Goals**: Implement scheduled jobs and background processing for advanced features.

**Tasks**:

- [ ] Set up job queue infrastructure:
  - Choose job queue solution (BullMQ + Redis recommended)
  - Set up Redis instance (local dev + production)
  - Install and configure job queue library
- [ ] Implement scheduled cleanup job:
  - Delete product history older than 90 days (weekly)
  - Clean up expired sessions
  - Archive old shop data
- [ ] Implement low-stock alerts (scheduled):
  - Daily/hourly inventory checks for PRO tier merchants
  - Compare current stock vs. threshold
  - Send notifications via App Bridge or email
- [ ] Implement analytics aggregation (scheduled):
  - Nightly aggregation of inventory change statistics
  - Calculate most-updated products (by all methods)
  - Generate inventory change trend reports
  - Track input method usage (scan vs manual vs import)
- [ ] Implement periodic product re-sync:
  - Weekly re-sync for PRO tier merchants
  - Incremental sync for STARTER tier (limited products)
  - Handle rate limiting and retries
- [ ] Add job monitoring and dashboard:
  - View job status and history
  - Retry failed jobs
  - Monitor job queue health
- [ ] Implement retry logic for failed jobs:
  - Exponential backoff for retries
  - Max retry attempts configuration
  - Dead letter queue for permanently failed jobs
- [ ] Add job queue to Docker Compose:
  - Redis service for job queue
  - Worker service for processing jobs
  - Separate worker process or container

**Resources**:

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Redis Documentation](https://redis.io/docs/)
- [Node.js Cron Jobs](https://nodejs.org/en/docs/guides/timers-in-node/)
- [Shopify Rate Limits](https://shopify.dev/docs/api/usage/rate-limits)

**Architecture Notes**:

- Start with simple cron-accessible routes for v1 (optional)
- Upgrade to proper job queue when you have:
  - > 100 active merchants
  - Need for retry logic
  - Scheduled jobs requirement
  - Complex background workflows

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

**Completed Phases**: 1/12
**In Progress**: Phase 2
**Pending Phases**: 10 (v1: 9, v2: 1)

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

**Version History**:

- v1: Phases 1-10 (Core features, launch)
- v2: Phase 11 (Scheduled jobs, background processing)
