# Nepal Shop — Next.js E-commerce Starter

A fast, production-ready e-commerce starter built for the Nepali market.
Guest checkout, eSewa + Khalti + Fonepay payments, Postgres + Drizzle, full admin panel.

## ✨ Features

**Storefront**
- Server-rendered product catalog with categories
- Product detail pages with image gallery (ISR, statically generated)
- Search, category filters, price range, sorting
- Persistent cart (localStorage, survives refresh)
- Guest checkout — no signup required
- Nepal-specific address fields (Province / District / Municipality / Ward)
- Three payment gateways: **eSewa**, **Khalti**, **Fonepay**
- Order confirmation page

**Admin Panel** (`/admin`)
- Password-protected login (JWT-based session)
- Dashboard with order/revenue stats
- Product CRUD (with image URLs, stock, categories, featured flag)
- Category management
- Order list + detail with status updates

**Performance**
- Next.js 15 App Router with React Server Components
- Incremental Static Regeneration for product pages
- Image optimization via next/image
- Indexed Postgres queries

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn-style components |
| Database | PostgreSQL via [Neon](https://neon.tech) (free tier) |
| ORM | [Drizzle](https://orm.drizzle.team) |
| Cart state | Zustand + localStorage |
| Validation | Zod |
| Forms | React Hook Form (where needed) |
| Auth | JWT (jose) — admin only |
| Email (optional) | Resend |
| Payments | eSewa ePay v2, Khalti KPG-2, Fonepay |
| Icons | lucide-react |
| Toasts | sonner |

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18.18+ or 20+
- A free [Neon](https://neon.tech) account (or any Postgres instance)
- A free [Cloudinary](https://cloudinary.com) account for product images (optional but recommended)

### 2. Install

```bash
git clone <your-repo-url> nepal-shop
cd nepal-shop
npm install
cp .env.example .env
```

### 3. Set up the database

1. Create a free Postgres project on [Neon](https://neon.tech).
2. Copy the connection string into `.env` as `DATABASE_URL`.
3. Push the schema:

```bash
npm run db:push
```

4. Seed sample categories and products:

```bash
npm run db:seed
```

### 4. Configure environment variables

Open `.env` and fill in:

```bash
# Required to run locally
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=any_random_string_at_least_32_characters_long_xxxxx
```

For payments — use sandbox credentials initially:

**eSewa** — sandbox values are already set in `.env.example`. To go live, register at [developer.esewa.com.np](https://developer.esewa.com.np) and replace `ESEWA_MERCHANT_CODE` and `ESEWA_SECRET_KEY`.

**Khalti** — sign up at [khalti.com](https://khalti.com), enable Merchant, and copy your test secret/public keys from the dashboard.

**Fonepay** — apply for a merchant account at [merchant.fonepay.com](https://merchant.fonepay.com); they'll give you a merchant code and secret key.

### 5. Run

```bash
npm run dev
```

Visit:
- Storefront: **http://localhost:3000**
- Admin: **http://localhost:3000/admin/login** (use `ADMIN_PASSWORD`)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (shop)/                  # Public storefront
│   │   ├── page.tsx             # Homepage
│   │   ├── products/            # Listing + [slug] detail
│   │   ├── category/[slug]/     # Category pages
│   │   ├── cart/                # Cart page
│   │   ├── checkout/            # Checkout + pay/{esewa,fonepay}
│   │   └── order/[id]/          # Order confirmation
│   ├── (admin)/admin/
│   │   ├── login/               # Admin login (public)
│   │   └── (protected)/         # Auth-gated admin pages
│   │       ├── page.tsx         # Dashboard
│   │       ├── products/
│   │       ├── categories/
│   │       └── orders/
│   ├── api/payment/             # Payment verification routes
│   │   ├── esewa/verify/
│   │   ├── khalti/verify/
│   │   └── fonepay/verify/
│   ├── layout.tsx               # Root layout
│   ├── not-found.tsx
│   └── globals.css
├── components/
│   ├── ui/                      # Button, Input, Card, etc.
│   └── shop/                    # ProductCard, Header, CartDrawer, etc.
├── lib/
│   ├── db/
│   │   ├── schema.ts            # Drizzle schema
│   │   ├── index.ts             # DB client
│   │   └── seed.ts              # Sample data
│   ├── cart/store.ts            # Zustand cart
│   ├── payments/
│   │   ├── esewa.ts
│   │   ├── khalti.ts
│   │   └── fonepay.ts
│   ├── auth.ts                  # Admin JWT helpers
│   └── utils/index.ts
└── middleware.ts                # Protects /admin/**
```

---

## 💳 How Payments Work

All three gateways follow the same high-level flow:

1. **Customer submits checkout** → server creates an `orders` row with `paymentStatus: 'pending'` and decrements product stock.
2. **Server redirects to the gateway:**
   - eSewa & Fonepay: HTML form auto-submit (HMAC-signed fields)
   - Khalti: server initiates a payment, gets back a hosted `payment_url`, redirects browser
3. **Customer pays on the gateway's site.**
4. **Gateway redirects back** to `/api/payment/{gateway}/verify?orderId=...`
5. **Server verifies** the payment server-to-server (status-check API or hash verification) — never trusts redirect params alone.
6. **Order status updated** to `paid` / `confirmed` (success) or `failed`.

### Going live with eSewa

1. Apply for a Merchant account at [esewa.com.np](https://esewa.com.np).
2. Once approved, get your production `MERCHANT_CODE` and `SECRET_KEY`.
3. Update `.env`:
   ```
   ESEWA_MERCHANT_CODE=your_real_code
   ESEWA_SECRET_KEY=your_real_secret
   ESEWA_GATEWAY_URL=https://epay.esewa.com.np/api/epay/main/v2/form
   ESEWA_VERIFY_URL=https://epay.esewa.com.np/api/epay/transaction/status/
   ```

### Going live with Khalti

1. Apply at [khalti.com/join/merchant](https://khalti.com/join/merchant).
2. Get your live secret + public keys.
3. Update `.env`:
   ```
   KHALTI_SECRET_KEY=live_secret_xxx
   NEXT_PUBLIC_KHALTI_PUBLIC_KEY=live_public_xxx
   KHALTI_GATEWAY_URL=https://khalti.com/api/v2/epayment/initiate/
   KHALTI_LOOKUP_URL=https://khalti.com/api/v2/epayment/lookup/
   ```

### Going live with Fonepay

1. Apply for a merchant account at [merchant.fonepay.com](https://merchant.fonepay.com).
2. Update `.env`:
   ```
   FONEPAY_MERCHANT_CODE=your_merchant_code
   FONEPAY_SECRET_KEY=your_secret
   FONEPAY_GATEWAY_URL=https://clientapi.fonepay.com/api/merchantRequest
   ```

> **⚠️ Important:** Always test the full payment flow in sandbox mode before going live with real money. Place a small test order, verify the order status updates correctly, and confirm money lands in your merchant dashboard.

---

## 🌐 Deploying for free

### Option A — Vercel (easiest)

1. Push your repo to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Add all `.env` variables in the Vercel project settings.
4. Set `NEXT_PUBLIC_APP_URL` to your Vercel URL (e.g., `https://nepal-shop.vercel.app`).
5. Deploy.

> Vercel's Hobby plan is technically non-commercial; once you start taking real orders, upgrade to Pro ($20/mo) or move to Cloudflare Pages.

### Option B — Cloudflare Pages (free, commercial-friendly)

1. Push your repo to GitHub.
2. In Cloudflare dashboard → Pages → "Create a project" → connect Git.
3. Build settings:
   - **Framework preset:** Next.js
   - **Build command:** `npx @cloudflare/next-on-pages@1`
   - **Output directory:** `.vercel/output/static`
4. Add a `compatibility_flags = ["nodejs_compat"]` setting.
5. Add all environment variables.
6. Deploy.

### Database (Neon) — free tier

- Up to 0.5 GB storage
- Autoscaling Postgres
- More than enough for ~1k products + thousands of orders

### Images (Cloudinary) — free tier

- 25 GB storage + 25 GB monthly bandwidth
- Auto WebP/AVIF + CDN
- For now, paste image URLs into the product form. You can later add an upload widget via `next-cloudinary` (already in dependencies).

### Email (Resend) — free tier

- 3,000 emails/month
- Used for order confirmation emails (not yet wired up — see "Roadmap" below).

---

## 🧰 Common commands

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run start         # Run production build locally
npm run db:push       # Push schema to DB (dev)
npm run db:generate   # Generate SQL migrations
npm run db:migrate    # Apply migrations
npm run db:studio     # Open Drizzle Studio (visual DB explorer)
npm run db:seed       # Reset sample data
npm run lint          # ESLint
```

---

## 🗺 Roadmap (suggested next steps)

- [ ] Wire up Resend for order confirmation emails
- [ ] SMS notifications via Sparrow SMS (Nepal-specific)
- [ ] Cloudinary image upload widget in the admin
- [ ] Product variants UI (the schema already supports it)
- [ ] Cash on Delivery (COD) as a 4th payment method
- [ ] Coupon / discount codes
- [ ] Customer order tracking by email + order number
- [ ] Reviews & ratings
- [ ] Stock reservation on checkout (currently decrements immediately)
- [ ] Better admin auth (multiple users, bcrypt-hashed passwords)
- [ ] Add Meilisearch for instant product search when you outgrow Postgres `ILIKE`

---

## 📝 Notes & caveats

- **Prices are stored in paisa** (NPR × 100) to avoid floating-point math issues. Use `formatPrice()` / `toPaisa()` / `fromPaisa()` from `@/lib/utils`.
- **Stock is decremented immediately when an order is created**, not after payment. If a payment fails, the stock isn't automatically returned. For low-volume stores this is fine; consider a stock-reservation pattern as you grow.
- **Admin auth is intentionally simple** — single password, JWT cookie. Fine for one admin; upgrade before adding staff.
- **Webhooks are not implemented** — payment confirmation relies on the redirect-back flow. For production, set up gateway webhooks where supported, especially Khalti.
- **Search uses Postgres `ILIKE`** — fast for under ~5k products. Beyond that, plug in Meilisearch.

---

## 🐛 Troubleshooting

**"DATABASE_URL is not set"** — Make sure `.env` exists in the project root and contains your Neon connection string. Restart `npm run dev` after changes.

**"Invalid password" on admin login** — Check `ADMIN_PASSWORD` in `.env` matches what you typed.

**eSewa returns "Signature mismatch"** — Make sure your `ESEWA_MERCHANT_CODE` and `ESEWA_SECRET_KEY` match. In sandbox, use `EPAYTEST` / `8gBm/:&EnhH.1/q`.

**Khalti "Authentication credentials were not provided"** — Your `KHALTI_SECRET_KEY` is missing or wrong. The header format is `Authorization: Key <secret_key>` (note the word "Key").

**Images don't load** — Add the image's hostname to `next.config.mjs` under `images.remotePatterns`.

**`db:push` fails** — Confirm the database is reachable and that `?sslmode=require` is in the URL for Neon.

---

## 📜 License

MIT — use this freely for your own store. Attribution appreciated but not required.
