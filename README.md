# Personal Platform & Digital Business Engine

A complete, self-hosted personal platform and digital business operating system engineered with **Next.js (App Router)**, **TypeScript**, **Vanilla CSS**, and **SQLite (`node:sqlite`)**.

It combines a professional portfolio, service marketplace with purchasing workflows, personal publishing platform, interactive technology decision tools, living operating principles, and a secure administrative dashboard.

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│   (Vanilla CSS Design System • Accessible • Responsive)    │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      Public Platform         │ │    Administrative Portal   │
│  - / (Homepage)              │ │  - /admin (Overview KPIs)  │
│  - /portfolio (Case Studies) │ │  - /admin/posts (Blog)     │
│  - /services (Marketplace)   │ │  - /admin/services         │
│  - /checkout/[slug]          │ │  - /admin/orders           │
│  - /orders/[orderNumber]     │ │  - /admin/enquiries        │
│  - /guides (Hardware & Tech) │ │  - /admin/principles       │
│  - /playground (Estimator)   │ │  - /admin/media (Library)  │
│  - /principles & /interests  │ │  - /admin/settings         │
│  - /contact (Inquiries)      │ │  - /admin/logs (Audit)     │
└──────────────┬───────────────┘ └─────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Next.js 16 Server Engine                    │
│   (App Router • API Endpoints • Timing-Safe Scrypt Auth)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌──────────────────────────────┐    ┌─────────────────────────┐
│     Payment Providers        │    │    SQLite (node:sqlite) │
│  - Mock Sandbox Gateway      │    │  - WAL Journal Mode     │
│  - Razorpay (India & Global) │    │  - ACID Transactions    │
│  - Stripe Checkout (Global)  │    │  - Instant Binary Backup│
└──────────────────────────────┘    └─────────────────────────┘
```

---

## 2. Key Features

### 2.1 Public Experience
- **Homepage (`/`)**: Direct, authentic introduction, verified work, core service packages, featured essays, and interactive scope estimator link.
- **Portfolio & Case Studies (`/portfolio`, `/portfolio/[slug]`)**: Documented problem statements, architectural contributions, verified outcomes, and repository links. Filterable by category.
- **Services Marketplace (`/services`, `/services/[slug]`)**: Transparent scope, exact deliverables, explicit exclusions, turnaround days, and refund terms. Supports Fixed-Price, Custom Project, Consultation, Digital Product, and Experimental models.
- **Customer Checkout (`/checkout/[serviceSlug]`)**: Requirements intake form, terms confirmation, and multi-provider payment processing (Mock Sandbox Gateway out-of-the-box + Razorpay/Stripe ready).
- **Order Confirmation & Tracking (`/orders/[orderNumber]`)**: Live transaction receipt, payment status badge, fulfillment milestones, and next steps guidance.
- **Technology & Buying Guides (`/guides`, `/guides/[slug]`)**: Research-backed hardware criteria, tested recommendations by budget tier, pros & cons, and unbiased "What to Avoid" warning lists.
- **Publishing & Blog (`/blog`, `/blog/[slug]`)**: Long-form editorial reading experience, reading time estimates, category filters, and built-in semantic markdown rendering.
- **Operating Principles (`/principles`)**: Practical working rules, societal observations, and evolution history notes.
- **Personal Collections (`/interests`)**: Games, mechanical hardware, daily drivers, and research curiosities.
- **Interactive Playground (`/playground`)**: Real-time **Project Scope & Budget Estimator** and **Tech Stack Decision Matrix** that compute delivery windows and recommend architectures.
- **Contact & Inquiries (`/contact`)**: Category routing, budget/timeline intake, server-side rate limiting, and anti-spam honeypot protection.

### 2.2 Administrative Dashboard (`/admin`)
- **Protected Session Auth**: Secure password hashing with cryptographic `scrypt` salt and timing-safe comparison; HttpOnly secure cookies (`ag_admin_session`).
- **Initial Setup Wizard (`/admin/setup`)**: On first run with an empty database, allows creating the root administrator. Once created, `/admin/setup` is strictly locked.
- **Operations Overview (`/admin`)**: Real-time KPIs for Total Orders, Verified Revenue, Pending Enquiries, Published Posts, and recent transactions.
- **Blog Manager (`/admin/posts`)**: Compose and edit posts with live markdown preview, draft/publish states, tags, and category assignment.
- **Services Manager (`/admin/services`)**: Add, edit, price, and disable services without touching application code.
- **Orders & Bookings Manager (`/admin/orders`)**: View customer requirements, update payment states, and manage fulfillment stages.
- **Inquiries Inbox (`/admin/enquiries`)**: Review customer messages, filter by status (New, Replied, Archived), and reply via email.
- **Principles Editor (`/admin/principles`)**: Add or edit operating rules with revision context notes.
- **Media Library (`/admin/media`)**: Upload images (JPG, PNG, WebP, GIF, SVG) up to 10MB, preview thumbnails, copy markdown embed codes, and safely manage storage.
- **Site Settings (`/admin/settings`)**: Update site branding, bio, contact email, payment provider mode, and download live `.db` snapshots.
- **Security Audit Trail (`/admin/logs`)**: Chronological audit trail of logins, orders, and administrative mutations.

---

## 3. Prerequisites

- **Node.js**: v22.0.0 or higher (v25.9.0 recommended, includes native `node:sqlite`)
- **NPM**: v10.0.0 or higher
- **Git**

---

## 4. Quick Start & Local Development

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run Automated Tests
```bash
npm test
```
Runs unit tests verifying password hashing, session tokens, rate limiting, SQLite schema constraints, payment state transitions, and utilities.

### Step 3: Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Administrator Onboarding
1. Navigate to [http://localhost:3000/admin/setup](http://localhost:3000/admin/setup).
2. Choose your root administrator username, contact email, and a secure password (minimum 8 characters).
3. Click **Initialize Platform & Sign In**.
4. You will be logged in and redirected to the `/admin` Operations Dashboard.

---

## 5. Configuration & Environment Variables

Create a `.env.local` file in the project root:

```env
# Server Runtime
NODE_ENV=development
PORT=3000

# Payment Gateway Configuration
# Options: mock_sandbox | razorpay | stripe
PAYMENT_PROVIDER=mock_sandbox

# Razorpay (Required only if PAYMENT_PROVIDER=razorpay)
RAZORPAY_KEY_ID=rzp_test_yourKeyIdHere
RAZORPAY_KEY_SECRET=yourRazorpaySecretHere

# Stripe (Required only if PAYMENT_PROVIDER=stripe)
STRIPE_SECRET_KEY=sk_test_yourStripeSecret
STRIPE_WEBHOOK_SECRET=whsec_yourWebhookSecret
```

> **Note on Payment Testing:**  
> The application defaults to `mock_sandbox`. In sandbox mode, customers can complete end-to-end checkout, generate order IDs, and test successful or failed payments immediately with zero third-party merchant accounts!

---

## 6. Database & Persistence

The platform uses SQLite through Node's native `node:sqlite` module in Write-Ahead Logging (`WAL`) mode:
- **Location**: `data/platform.db`
- **Zero External Server Required**: No Docker container or cloud database instances needed.
- **ACID Compliant**: Reliable transaction boundaries for order creation and updates.
- **Automated Seeding**: Default settings, services, projects, blog posts, and principles are automatically initialized on first run.

### Database Backup & Recovery
1. **Via Admin Dashboard**: Go to `/admin/settings` and click **Download Database Snapshot (.db)**.
2. **Via Command Line**: Simply copy the `data/platform.db` file to your backup location:
   ```bash
   cp data/platform.db backups/platform-$(date +%Y-%m-%d).db
   ```
3. **Restoration**: Replace `data/platform.db` with your backup copy and restart the application.

---

## 7. Production Build & Deployment

### Build the Application
```bash
npm run build
```
Generates the optimized production build with type checking.

### Run in Production
```bash
npm start
```

### Hosting Options
- **Node.js VPS (Hetzner, DigitalOcean, Linode, AWS EC2)**:
  Run behind Nginx or Caddy with PM2:
  ```bash
  pm2 start npm --name "personal-platform" -- start
  ```
- **Docker Container**:
  Mount the `data/` and `public/uploads/` directories as persistent volumes.

---

## 8. Verified Test Results

| Check / Workflow | Status | Verification Method |
|---|---|---|
| Native Unit Tests (`node:test`) | Passed (9/9) | `npm test` |
| TypeScript Type Checking | Passed | `next build` |
| Route Compilation (51 routes) | Passed | `next build` |
| Public Navigation & Hero | Verified | Headless Browser Subagent |
| Service Catalogue & Terms | Verified | Headless Browser Subagent |
| Customer Checkout Flow | Verified | Headless Browser Subagent |
| Mock Sandbox Payment Simulation | Verified | Headless Browser Subagent (`ORD-100573-921`) |
| Order Receipt & Tracking Page | Verified | Headless Browser Subagent |
| Initial Administrator Setup | Verified | Headless Browser Subagent (`/admin/setup`) |
| Admin Session Authentication | Verified | Headless Browser Subagent |
| Order Management & Fulfillment | Verified | Headless Browser Subagent (`/admin/orders`) |
| Blog Article Publishing | Verified | Headless Browser Subagent (`/admin/posts/new`) |
