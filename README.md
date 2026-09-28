# 🧭 Hanot Hub — Career Consulting Website

A modern, full-stack career consulting website built with **Next.js 14**, **Tailwind CSS**, and a **JSON file-based database**.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

Visit: **http://localhost:3000**

### 3. Build for production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
career-decipher/
├── pages/
│   ├── index.js          # Homepage (landing page)
│   ├── services.js       # Services & Pricing page
│   ├── book.js           # Multi-step Booking page
│   ├── admin.js          # Admin Dashboard
│   └── api/
│       └── bookings.js   # REST API (GET / POST / PATCH)
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── ServiceCard.jsx
├── data/
│   ├── services.js       # Service definitions & pricing
│   └── bookings.json     # Bookings database (auto-created)
├── lib/
│   └── bookings.js       # DB read/write helpers
└── styles/
    └── globals.css       # Tailwind + Google Fonts + Calendar styles
```

---

## 📄 Pages Overview

| Page     | URL         | Description                                            |
| -------- | ----------- | ------------------------------------------------------ |
| Homepage | `/`         | Landing page with hero, services preview, testimonials |
| Services | `/services` | Full services grid with pricing, FAQ                   |
| Book     | `/book`     | 4-step booking: service → date/time → info → payment   |
| Admin    | `/admin`    | Dashboard with booking list, stats, status management  |

---

## 💳 Payment Simulation

The booking system includes a **Stripe-style simulated payment UI**.

### Test Cards:

| Card Number           | Result              |
| --------------------- | ------------------- |
| `4242 4242 4242 4242` | ✅ Payment succeeds |
| `4000 0000 0000 0002` | ❌ Card declined    |

> **Note:** No real payments are processed. To integrate real Stripe:
>
> 1. `npm install stripe @stripe/stripe-js @stripe/react-stripe-js`
> 2. Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env.local`
> 3. Replace the mock payment handler in `pages/book.js` with Stripe's PaymentElement

---

## 🔐 Admin Access

Visit `/admin` and enter the admin key: **`admin123`**

Leave the field blank to enter directly in development.

**Admin Features:**

- View all bookings with search & filter
- Update booking status: confirmed / pending / completed / cancelled
- Revenue stats and booking counts
- Detailed booking view with client notes

---

## 📧 Email Confirmation

Confirmation and meeting-invite emails are sent with **Brevo (ex-Sendinblue) SMTP** via `lib/sendBookingEmail.js` and `lib/sendMeetingEmail.js`.

Add to `.env.local`:

```
BREVO_SMTP_USER=your-brevo-login-email
BREVO_SMTP_KEY=your-smtp-key
BREVO_SENDER_EMAIL=bookings@yourdomain.com
```

---

## 🎨 Design System

| Token        | Value                           |
| ------------ | ------------------------------- |
| Primary      | `#3D7A55` (Forest Green)        |
| Accent       | `#D4A843` (Gold)                |
| Background   | `#FDFAF5` (Warm Cream)          |
| Dark         | `#0F1720`                       |
| Display Font | Playfair Display (Google Fonts) |
| Body Font    | DM Sans (Google Fonts)          |

---

## 🛠 Tech Stack

| Layer      | Technology                           |
| ---------- | ------------------------------------ |
| Frontend   | Next.js 14 + React 18                |
| Styling    | Tailwind CSS v3                      |
| Animations | CSS keyframes + IntersectionObserver |
| Calendar   | react-calendar                       |
| Toasts     | react-hot-toast                      |
| Database   | Neon (Postgres, `lib/db.js`)        |
| API        | Next.js API Routes                   |

---

## 📦 Services & Pricing

| Service                      | Duration | Price  | Price (NGN) |
| ---------------------------- | -------- | ------ | ----------- |
| Career Consultation          | 30 mins  | $45    | ₦45,000     |
| Resume Review                | 30 mins  | $45    | ₦45,000     |
| Resume & Cover Letter Review | 1 hr     | $70    | ₦70,000     |
| Cover Letter Review          | 30 mins  | $45    | ₦45,000     |
| Interview Preparation        | 1 hr     | $70    | ₦70,000     |
| LinkedIn Optimization        | Custom   | Custom | Custom      |
| On-the-Job Mentorship        | 1 hr     | $120   | ₦120,000    |
| Bundle Package               | 5 hrs    | $250   | ₦250,000    |

Naira prices are derived from the USD price in `lib/currency.js`: **USD × 1000, rounded up to the nearest ₦1,000** (override the rate with `NEXT_PUBLIC_USD_TO_NGN_RATE`).

---

## 🔧 Environment Variables

All variables the code reads — copy into `.env.local`:

```env
# Neon/Postgres — bookings, apartment availability, admin, emails
DATABASE_URL=

# Paystack - buyers detected in Nigeria, charged in NGN
PAYSTACK_SECRET_KEY=

# Stripe - buyers everywhere else, charged in USD (Stripe converts to local currency)
STRIPE_SECRET_KEY=

# Optional: USD to NGN rate for Naira prices (default 1000)
NEXT_PUBLIC_USD_TO_NGN_RATE=

# Brevo SMTP — booking confirmation + meeting invite emails
BREVO_SMTP_USER=
BREVO_SMTP_KEY=
BREVO_SENDER_EMAIL=
```

Checkout auto-detects the buyer's location: **Nigeria → Paystack (charged in ₦)**, everywhere else → **Stripe (charged in USD)**. Prices are stored in USD in `/data` and converted for display and charging by `lib/currency.js`; only one currency is shown per visitor, based on their location. Stripe shows the buyer's local currency at checkout.

---

## 🚢 Deployment (Vercel)

```bash
npm install -g vercel
vercel
```

> Note: bookings live in Neon Postgres (`DATABASE_URL`), which persists on Vercel — just set the env vars in the project settings.

---

Built with ❤️ for Hanot Hub
