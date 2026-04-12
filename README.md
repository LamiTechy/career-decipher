# 🧭 Career Decipher — Career Consulting Website

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

| Page | URL | Description |
|------|-----|-------------|
| Homepage | `/` | Landing page with hero, services preview, testimonials |
| Services | `/services` | Full services grid with pricing, FAQ |
| Book | `/book` | 4-step booking: service → date/time → info → payment |
| Admin | `/admin` | Dashboard with booking list, stats, status management |

---

## 💳 Payment Simulation

The booking system includes a **Stripe-style simulated payment UI**.

### Test Cards:
| Card Number | Result |
|------------|--------|
| `4242 4242 4242 4242` | ✅ Payment succeeds |
| `4000 0000 0000 0002` | ❌ Card declined |

> **Note:** No real payments are processed. To integrate real Stripe:
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

Email confirmation is currently **mocked** (logged to console). To enable real emails:

1. `npm install nodemailer`
2. Add to `.env.local`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your@gmail.com
   SMTP_PASS=your_app_password
   ```
3. Add a `sendConfirmationEmail()` call in `pages/api/bookings.js`

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | `#3D7A55` (Forest Green) |
| Accent | `#D4A843` (Gold) |
| Background | `#FDFAF5` (Warm Cream) |
| Dark | `#0F1720` |
| Display Font | Playfair Display (Google Fonts) |
| Body Font | DM Sans (Google Fonts) |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + React 18 |
| Styling | Tailwind CSS v3 |
| Animations | CSS keyframes + IntersectionObserver |
| Calendar | react-calendar |
| Toasts | react-hot-toast |
| Database | JSON file (`data/bookings.json`) |
| API | Next.js API Routes |

---

## 📦 Services & Pricing

| Service | Duration | Price |
|---------|----------|-------|
| Career Consultation | 30 mins | $45 |
| Resume Review | 30 mins | $45 |
| Resume & Cover Letter Review | 1 hr | $70 |
| Cover Letter Review | 30 mins | $45 |
| Interview Preparation | 1 hr | $70 |
| LinkedIn Optimization | Custom | Custom |
| On-the-Job Mentorship | 1 hr | $120 |
| Bundle Package | 5 hrs | $250 |

---

## 🔧 Environment Variables (Optional)

Create a `.env.local` file for production:

```env
# Paystack
NEXT_PUBLIC_PAYSTACK_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_USD_TO_NGN_RATE=1500

# Stripe (when ready for real payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hello@careerdecipher.com
SMTP_PASS=your_app_password

# Admin
ADMIN_KEY=your_secure_admin_key
```

The app now fetches the USD → NGN exchange rate automatically at runtime using `/api/exchange-rate`.

`NEXT_PUBLIC_USD_TO_NGN_RATE` is optional and is used only as a fallback or manual override if the live fetch fails.

---

## 🚢 Deployment (Vercel)

```bash
npm install -g vercel
vercel
```

> Note: JSON file storage won't persist on Vercel (serverless). For production, swap to **MongoDB Atlas**, **Supabase**, or **PlanetScale**.

---

Built with ❤️ for Career Decipher
