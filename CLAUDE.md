# Invoice-Claude

Next.js 14 (App Router) + TypeScript + Prisma 7 (PostgreSQL/Supabase) + Tailwind 3 + NextAuth (JWT/credentials) + Stripe + Anthropic SDK + @react-pdf/renderer

## Commands
- `npm run dev` — local dev server
- `npm run build` — `prisma generate && next build`
- `npm run lint` — ESLint

## Structure
- `app/(auth)/` — sign-in, sign-up
- `app/(dashboard)/` — create/, dashboard/, contacts/, settings/, upgrade/
- `app/api/` — auth, generate, documents, contacts, business, tokens, stripe
- `components/` — document-form, document-pdf, nav, token-badge, ui/
- `lib/` — auth.ts, claude.ts, db.ts (Prisma singleton), stripe.ts, tokens.ts
- `prisma/` — schema + migrations
- `types/` — TypeScript definitions

## Key Patterns
- Prisma client: lazy singleton in lib/db.ts (build-safe)
- Auth: NextAuth credentials provider, JWT strategy
- Token system: free=3/week, tiers via Stripe (Basic/Pro/Business)
- Guest usage tracked by IP in GuestUsage table
- PDF: @react-pdf/renderer in document-pdf.tsx
- Path alias: `@/*` maps to project root

## Env Vars
DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, ANTHROPIC_API_KEY, STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_BASIC, STRIPE_PRICE_PRO, STRIPE_PRICE_BUSINESS, NEXT_PUBLIC_APP_URL

## Deploy
Vercel (vercel.json) — pushes to main auto-deploy

## Session Notes / Decisions
- Hero CTA: 3 buttons (Invoice / Receipt / Statement) instead of single "Start for free". "Start for free" is now tagline text above buttons. "View pricing" demoted to small text link below buttons.
- Supabase DB password ALWAYS contains special characters (Supabase requires them). Never ask user to remove special chars. URL-encode the password in DATABASE_URL; lib/db.ts reads it via `new URL().password` which auto-decodes it.
- Supabase connection: use transaction pooler `aws-1-us-east-1.pooler.supabase.com:6543` (NOT direct host, NOT aws-0). Username format for pooler: `postgres.vrnbmanfjdosurbjhbae`. DATABASE_PASSWORD env var is redundant — password comes from DATABASE_URL parsing.
- Supabase free plan auto-pauses after 7 days inactivity — if DB unreachable, user must resume at supabase.com first.
