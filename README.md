# 🌌 AstroSpectrum

<div align="center">

**A next-generation astrophotography & cinematic photography gallery, creator community, and film simulation platform.**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](./LICENSE)

</div>

---

## 📖 Overview

**AstroSpectrum** is a unified full-stack monolithic platform built for astrophotographers, night-sky explorers, and cinematic photography enthusiasts. Combining automated camera EXIF telemetry, authentic analog film stock emulation, and real-time community engagement into a single unified process.

---

## 🛠️ Monolithic Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Monolith Framework** | [Next.js 16 App Router](https://nextjs.org/) (Server Components & Native Route Handlers), [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict mode) |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) (Compatible with Neon & Supabase), [Kysely](https://kysely.dev/) (Type-safe SQL query builder) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/) |
| **Animations & Effects** | [Framer Motion](https://www.framer.com/motion/), [Lenis](https://lenis.darkroom.engineering/) |
| **Image Storage & Uploads**| [UploadThing](https://uploadthing.com/) |
| **Authentication** | [NextAuth.js v4](https://next-auth.js.org/), Telegram Login API, Nodemailer (OTP) |
| **Payments** | [Stripe](https://stripe.com/) |
| **Bot Protection** | [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) |
| **Content Moderation** | [Sightengine API](https://sightengine.com/) |

---

## 📂 Project Architecture

The entire application runs as a single cohesive monolith:

```
astro-project/
├── app/                    # App Router pages and API route handlers
│   ├── api/                # Native Route Handlers (auth, photos, comments, likes, payments, etc.)
│   ├── admin/              # Admin moderation dashboard
│   ├── creator/            # Creator studio & photo management
│   ├── leaderboard/        # Community rankings & trending photos
│   ├── photos/             # In-memory server-rendered gallery & detail views
│   ├── profile/            # User profiles & creator streams
│   ├── layout.tsx          # Root layout, theme, and font providers
│   └── page.tsx            # Cinematic hero landing view
├── components/             # Reusable UI & client components
├── hooks/                  # Custom React hooks (useLenis, etc.)
├── lib/                    # Shared utilities (db, auth, otp, moderation, types)
├── migrations/             # Kysely database migrations
├── public/                 # Static assets, fallback avatars, sample photos
├── server/                 # Pure in-memory services (photos, payments, uploadthing, auth)
├── utils/                  # UploadThing React helpers
├── .env                    # Environment secrets
├── next.config.ts          # Standalone Next.js monolithic configuration
├── package.json            # Unified scripts & dependencies
└── tsconfig.json           # Path aliasing (@/* -> ./*)
```

---

## 🚀 Getting Started

One command starts the entire application (frontend, backend APIs, database connections, and uploads).

### 1. Environment Configuration

```bash
cp .env.example .env
```

Ensure your `.env` contains your `DATABASE_URL` and `NEXTAUTH_SECRET`.

### 2. Install & Start Development

```bash
npm install
npm run dev
```

- Application & APIs are live at **`http://localhost:3000`**.
- Both client UI and API routes (`/api/*`) are served by the same process with zero cross-network latency.

### 3. Production Build & Start

```bash
npm run build
npm start
```

---

## 📜 Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `dev` | `npm run dev` | **One command starts all**: runs Next.js monolith server in dev mode |
| `build` | `npm run build` | Compiles the unified production monolith bundle |
| `start` | `npm start` | Runs the compiled production monolith server |
| `lint` | `npm run lint` | Runs ESLint across the codebase |
| `clean` | `npm run clean` | Cleans `.next` build caches and output directories |
| `db:generate`| `npm run db:generate` | Generates TypeScript database types via `kysely-codegen` |

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.
