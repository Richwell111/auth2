

# **Master Auth — Full Authentication System with Better Auth, Stripe & Organizations**

A modern, production-ready authentication system built with **Next.js 15**, **Better Auth**, **PostgreSQL**, **Drizzle ORM**, **Stripe subscriptions**, and **organization / role-based access control**.
This project demonstrates an advanced, enterprise-grade auth architecture suitable for SaaS platforms.

🌍 **Live Demo:** [https://master-auth-jade.vercel.app/](https://master-auth-jade.vercel.app/)

---

## 🚀 **Features**

### 🔐 **Authentication**

* Email + password sign-up / login
* OAuth (Google, Discord, GitHub)
* Secure session management
* Passkeys / WebAuthn
* Email verification
* Password reset

### 🏢 **Organization System**

* Create / join organizations
* Invite members via email
* Role-based permissions (owner, admin, user)
* Active organization switching
* Access control middleware

### 👥 **User Management**

* Admin dashboard
* Impersonation (Admin → act as user)
* Indicators + toast notifications
* Membership handling hooks

### 💳 **Stripe Billing**

* Subscription plans (basic, pro)
* Billing portal redirection
* Trialing, renewal, period end logic
* Upgrade, downgrade, cancellation
* Webhook support

### 🛠 **Tech Stack**

* **Next.js 15**
* **Better Auth v1**
* **Drizzle ORM**
* **PostgreSQL (Neon)**
* **Stripe SDK**
* **ShadCN/UI**
* **React Hooks & Server Components**

---

## 📂 **Project Structure**

```
lib/auth/
  ├─ auth.ts               # Better Auth main config
  ├─ stripe.ts             # Stripe plans + logic
  ├─ auth-client.ts        # Client-side auth usage

components/
  ├─ auth/                 # Auth UI components
  ├─ ui/                   # ShadCN components
  ├─ subscriptions/        # Billing UI

app/
 ├─ api/
 │   └─ auth/stripe/webhook # Stripe webhook handler
 ├─ dashboard/             # Main dashboard
 ├─ admin/                 # Admin tools
 └─ settings/subscription  # Subscription management
```

---

## 🧪 **Environment Variables**

```env
# Database
DATABASE_URL="postgres://..."
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_BASIC_PRICE_ID=
STRIPE_PRO_PRICE_ID=

# Social Auth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Email
EMAIL_USER=
EMAIL_PASS=
POSTMARK_SERVER_TOKEN=
POSTMARK_FROM_EMAIL=
```

---

## 🧰 **Scripts**

```
npm run dev            # Start development server
npm run build          # Build for production
npm run start          # Start production server
npm run auth:generate  # Generate DB schema from Better Auth
```

---

## 📦 **Stripe CLI (for webhook testing)**

Install Stripe CLI:

```
npm install -g stripe
```

Listen for webhooks:

```
stripe listen --forward-to localhost:3000/api/auth/stripe/webhook
```

---

## 📝 **Subscription Plans**

### Defined in `stripe.ts`

```ts
export const STRIPE_PLANS = [
  {
    name: "basic",
    priceId: process.env.STRIPE_BASIC_PRICE_ID!,
    limits: { projects: 10 }
  },
  {
    name: "pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    limits: { projects: 50 }
  }
];

export const PLAN_TO_PRICE = {
  basic: 19,
  pro: 49,
};

