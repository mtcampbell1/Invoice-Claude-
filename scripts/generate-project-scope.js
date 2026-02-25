const PDFDocument = require('/tmp/pdftools/node_modules/pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ margin: 60, size: 'LETTER' });
const out = path.join('/home/user/Invoice-Claude-', 'InvoiceClaude-ProjectScope.pdf');
doc.pipe(fs.createWriteStream(out));

// ─── Colors & helpers ──────────────────────────────────────────────────────
const INDIGO   = '#4f46e5';
const INDIGO_L = '#e0e7ff';
const GRAY     = '#374151';
const LGRAY    = '#6b7280';
const BLACK    = '#111827';
const WHITE    = '#ffffff';

let y = doc.y;

function newPage() {
  doc.addPage();
}

function sectionHeading(title) {
  doc.moveDown(0.5);
  const ty = doc.y;
  doc.rect(60, ty - 4, 492, 24).fill(INDIGO).stroke(INDIGO);
  doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(12)
    .text(title, 68, ty + 2, { width: 476 });
  doc.fillColor(BLACK).font('Helvetica').fontSize(10);
  doc.moveDown(1.2);
}

function subHeading(title) {
  doc.moveDown(0.4);
  doc.fillColor(INDIGO).font('Helvetica-Bold').fontSize(10.5).text(title);
  doc.fillColor(GRAY).font('Helvetica').fontSize(9.5);
  doc.moveDown(0.3);
}

function body(text, opts = {}) {
  doc.fillColor(GRAY).font('Helvetica').fontSize(9.5).text(text, { lineGap: 2, ...opts });
}

function bullet(text) {
  const bx = doc.x;
  doc.fillColor(INDIGO).text('•', bx, doc.y, { continued: true, width: 10 });
  doc.fillColor(GRAY).text('  ' + text, { lineGap: 2 });
}

function kv(key, val) {
  doc.fillColor(BLACK).font('Helvetica-Bold').fontSize(9.5)
    .text(key + '  ', { continued: true });
  doc.fillColor(LGRAY).font('Helvetica').fontSize(9.5).text(val, { lineGap: 3 });
}

function divider() {
  doc.moveDown(0.4);
  doc.moveTo(60, doc.y).lineTo(552, doc.y).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
  doc.moveDown(0.4);
}

function codeBlock(lines) {
  doc.moveDown(0.3);
  const startY = doc.y;
  const textH = lines.length * 13 + 10;
  doc.rect(60, startY, 492, textH).fill('#f3f4f6').stroke('#e5e7eb');
  doc.fillColor('#374151').font('Courier').fontSize(8);
  lines.forEach((line, i) => {
    doc.text(line, 70, startY + 5 + i * 13, { lineBreak: false });
  });
  doc.font('Helvetica').fillColor(GRAY);
  doc.y = startY + textH + 6;
  doc.moveDown(0.3);
}

function tableRow(cols, widths, isHeader = false) {
  const startX = 60;
  const rowH = 18;
  const startY = doc.y;
  if (isHeader) {
    doc.rect(startX, startY, widths.reduce((a,b)=>a+b,0), rowH).fill(INDIGO_L).stroke('#c7d2fe');
    doc.fillColor(INDIGO).font('Helvetica-Bold').fontSize(8.5);
  } else {
    doc.fillColor(GRAY).font('Helvetica').fontSize(8.5);
  }
  let cx = startX + 4;
  cols.forEach((col, i) => {
    doc.text(col, cx, startY + 4, { width: widths[i] - 8, lineBreak: false });
    cx += widths[i];
  });
  doc.y = startY + rowH;
  doc.font('Helvetica').fillColor(GRAY);
}

// ─────────────────────────────────────────────────────────────────────────────
// COVER PAGE
// ─────────────────────────────────────────────────────────────────────────────
doc.rect(0, 0, 612, 280).fill(INDIGO);
doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(32)
  .text('InvoiceClaude', 60, 90, { align: 'center' });
doc.fontSize(15).font('Helvetica')
  .text('Project Scope & Architecture Document', 60, 140, { align: 'center' });
doc.fontSize(10).fillColor('#c7d2fe')
  .text('AI-powered invoice, receipt & statement generator', 60, 170, { align: 'center' });

doc.fillColor(GRAY).fontSize(9).font('Helvetica')
  .text('Prepared: February 25, 2026', 60, 300, { align: 'center' });
doc.text('Stack: Next.js 14 · TypeScript · Prisma · PostgreSQL · Stripe · NextAuth · @react-pdf/renderer', 60, 316, { align: 'center' });

doc.fillColor(LGRAY).fontSize(8)
  .text('For use in AI-assisted optimization conversations', 60, 360, { align: 'center' });

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 2 — Overview & Tech Stack
// ─────────────────────────────────────────────────────────────────────────────
newPage();
sectionHeading('1. PROJECT OVERVIEW');
body('InvoiceClaude is a SaaS web application that lets users (logged-in or anonymous) generate professional invoices, receipts, and statements. The "AI" layer currently acts as a document assembly engine (data normalisation, date formatting, totals). Users can download a PDF instantly, and logged-in users have their documents saved for later retrieval.');
doc.moveDown(0.5);
body('Key differentiators:');
bullet('No-signup required — guests get 3 free documents/week tracked by IP.');
bullet('Token-based monetisation — one-time packs (never expire) plus monthly subscriptions.');
bullet('Business profile & logo — paid users can embed their logo in every PDF.');
bullet('Contact book — saved billing contacts auto-populate the form.');
bullet('Instant PDF — rendered client-side via @react-pdf/renderer (no server PDF step).');

sectionHeading('2. TECHNOLOGY STACK');
const stackCols = ['Layer', 'Technology', 'Version / Notes'];
const stackWidths = [110, 150, 232];
tableRow(stackCols, stackWidths, true);
[
  ['Framework',      'Next.js (App Router)',      '14 — server components + API routes'],
  ['Language',       'TypeScript',                'Strict mode throughout'],
  ['Database',       'PostgreSQL (Supabase)',      'Hosted, connected via DATABASE_URL'],
  ['ORM',            'Prisma',                    'v7 — lazy singleton in lib/db.ts'],
  ['Auth',           'NextAuth.js',               'Credentials provider, JWT strategy'],
  ['Payments',       'Stripe',                    'Subscriptions + one-time checkout'],
  ['AI / Docs',      'lib/claude.ts',             'Template assembly (no live AI call yet)'],
  ['PDF Rendering',  '@react-pdf/renderer',       'Client-side, document-pdf.tsx'],
  ['Styling',        'Tailwind CSS',              'v3'],
  ['Deployment',     'Vercel',                    'Auto-deploy from main branch'],
].forEach(r => tableRow(r, stackWidths));

doc.moveDown(0.5);
body('Note: Despite the name "InvoiceClaude" and the Anthropic SDK being installed, lib/claude.ts currently does not make live Anthropic API calls — it is a pure TypeScript document-assembly function. The ANTHROPIC_API_KEY env var is present but unused at runtime. This is an identified growth opportunity.', { lineGap: 2 });

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 3 — Directory Structure & Routes
// ─────────────────────────────────────────────────────────────────────────────
newPage();
sectionHeading('3. DIRECTORY STRUCTURE');
codeBlock([
  'Invoice-Claude-/',
  '  app/',
  '    (auth)/            sign-in/page.tsx   sign-up/page.tsx',
  '    (dashboard)/       create/page.tsx    dashboard/page.tsx',
  '                       contacts/page.tsx  settings/page.tsx',
  '                       upgrade/page.tsx',
  '    api/',
  '      auth/            [...nextauth]/route.ts   register/route.ts',
  '      generate/        route.ts                 (core document generation)',
  '      documents/       route.ts  [id]/route.ts',
  '      contacts/        route.ts  [id]/route.ts',
  '      business/        route.ts',
  '      tokens/          route.ts',
  '      stripe/          checkout/route.ts  webhook/route.ts',
  '    page.tsx           (public landing page)',
  '    layout.tsx         (root layout + SessionProvider)',
  '  components/',
  '    document-form.tsx  (multi-step form for creating documents)',
  '    document-pdf.tsx   (@react-pdf renderer)',
  '    nav.tsx            (authenticated top nav)',
  '    token-badge.tsx    (token counter widget)',
  '    ui/                button, card, input (shadcn-style)',
  '  lib/',
  '    auth.ts   claude.ts   db.ts   stripe.ts   tokens.ts',
  '  prisma/',
  '    schema.prisma   migrations/',
  '  types/',
  '    next-auth.d.ts',
]);

sectionHeading('4. PAGE ROUTES');
const pagesCols = ['Route', 'Auth Required', 'Description'];
const pagesWidths = [160, 100, 232];
tableRow(pagesCols, pagesWidths, true);
[
  ['/ (landing)',          'No',  'Marketing page: hero, features, pricing, token-pack purchase CTA'],
  ['/sign-in',             'No',  'NextAuth credentials sign-in. Supports ?redirect= param'],
  ['/sign-up',             'No',  'Register + auto-sign-in. Supports ?redirect= param'],
  ['/create',              'No*', 'Document form — guests and users both allowed'],
  ['/dashboard',           'Yes', 'Lists saved documents (invoice/receipt/statement tabs)'],
  ['/contacts',            'Yes', 'CRUD for saved billing contacts'],
  ['/settings',            'Yes', 'Business profile (name, address, logo upload)'],
  ['/upgrade',             'Yes', 'Token packs + subscription plan purchase via Stripe'],
].forEach(r => tableRow(r, pagesWidths));
doc.moveDown(0.3);
body('* /create is accessible without login but uses guest tokens (IP-rate-limited). Logged-in users have their documents saved.');

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 4 — Data Models
// ─────────────────────────────────────────────────────────────────────────────
newPage();
sectionHeading('5. DATABASE SCHEMA (Prisma / PostgreSQL)');

subHeading('User');
const userCols = ['Field', 'Type', 'Default', 'Notes'];
const userWidths = [130, 85, 85, 192];
tableRow(userCols, userWidths, true);
[
  ['id',                   'String (cuid)', '—',          'Primary key'],
  ['email',                'String',        '—',          'Unique'],
  ['password',             'String?',       'null',       'Bcrypt hashed'],
  ['name',                 'String?',       'null',       ''],
  ['plan',                 'String',        '"free"',     'free | basic | pro | business'],
  ['tokens',               'Int',           '3',          'Recurring allocation, resets periodically'],
  ['bonusTokens',          'Int',           '0',          'From one-time packs, never reset'],
  ['tokenPackPurchased',   'Boolean',       'false',      'Unlocks Pro perks (logo, unlimited contacts)'],
  ['tokensResetAt',        'DateTime',      'now()',      'Timestamp of last token reset'],
  ['stripeCustomerId',     'String?',       'null',       ''],
  ['stripeSubscriptionId', 'String?',       'null',       ''],
].forEach(r => tableRow(r, userWidths));

doc.moveDown(0.5);
subHeading('Business (1-to-1 with User)');
const bizCols = ['Field', 'Type', 'Notes'];
const bizWidths = [130, 100, 262];
tableRow(bizCols, bizWidths, true);
[
  ['id',      'String (cuid)', 'Primary key'],
  ['userId',  'String',        'Unique FK → User'],
  ['name',    'String',        'Business name (required)'],
  ['address/city/state/zip/country', 'String?', 'Location fields'],
  ['phone/email/website/taxId',      'String?', 'Contact / tax fields'],
  ['logoUrl', 'String?',       'URL to uploaded logo image'],
].forEach(r => tableRow(r, bizWidths));

doc.moveDown(0.5);
subHeading('Contact (many-to-1 with User)');
body('Fields: id, userId, name, company?, email?, phone?, address?, city?, state?, zip?, country?, notes?, createdAt. Free plan capped at 3 contacts; paid / tokenPackPurchased = unlimited.');

doc.moveDown(0.5);
subHeading('Document (many-to-1 with User)');
const docCols = ['Field', 'Type', 'Notes'];
const docWidths = [130, 100, 262];
tableRow(docCols, docWidths, true);
[
  ['id',         'String (cuid)', 'Primary key'],
  ['userId',     'String',        'FK → User'],
  ['type',       'String',        'invoice | receipt | statement'],
  ['number',     'String?',       'Document number (e.g. INV-001)'],
  ['clientName', 'String?',       'Denormalised for list display'],
  ['total',      'Float?',        'Denormalised for list display'],
  ['data',       'String',        'Full DocumentData JSON blob'],
  ['status',     'String',        'draft | sent | paid (default: draft)'],
  ['createdAt',  'DateTime',      ''],
].forEach(r => tableRow(r, docWidths));

doc.moveDown(0.5);
subHeading('GuestUsage');
body('Tracks anonymous document usage by IP. Fields: id, ip (unique), tokens (Int, default 3), weekStart (DateTime), createdAt. Resets automatically each week.');

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 5 — User Flows
// ─────────────────────────────────────────────────────────────────────────────
newPage();
sectionHeading('6. KEY USER FLOWS');

subHeading('A. Guest Creates a Document');
[
  '1. Lands on / (landing page) → clicks "Create Invoice / Receipt / Statement" hero CTA',
  '2. Goes to /create — no auth required',
  '3. Fills in DocumentForm (from, to, line items, dates)',
  '4. Submits → POST /api/generate',
  '5. Server resolves client IP → calls deductGuestToken(ip)',
  '   • First use: creates GuestUsage row, tokens = 2',
  '   • Subsequent: decrements. At 0 → 429 with reset date',
  '6. generateDocument() assembles DocumentData (normalises dates, computes totals)',
  '7. DocumentData returned to client (not saved to DB for guests)',
  '8. Client renders PDF via @react-pdf/renderer → user downloads',
].forEach(l => body(l, { lineGap: 3 }));

doc.moveDown(0.5);
subHeading('B. New User Registers via "Buy" CTA');
[
  '1. Clicks "Buy [Pack] Pack" on landing page',
  '   → href="/sign-up?redirect=/upgrade"',
  '2. Fills sign-up form → POST /api/auth/register (bcrypt hash, create User row)',
  '3. Auto-sign-in via NextAuth credentials signIn()',
  '4. Redirects to /upgrade (not /dashboard) — preserving purchase intent',
  '5. Selects pack → POST /api/stripe/checkout { pack: "tokens_25" }',
  '6. Server creates Stripe Checkout session (mode: payment)',
  '   success_url = /dashboard?tokens_added=25',
  '7. User completes Stripe payment',
  '8. Stripe fires checkout.session.completed webhook',
  '9. /api/stripe/webhook: bonusTokens += 25, tokenPackPurchased = true',
  '10. Redirect to /dashboard with tokens_added=25 query (UI shows confirmation)',
].forEach(l => body(l, { lineGap: 3 }));

doc.moveDown(0.5);
subHeading('C. Subscription Purchase');
[
  '1. User on /upgrade → "Plans" tab → "Get Pro"',
  '2. POST /api/stripe/checkout { plan: "pro" }',
  '3. Stripe Checkout session (mode: subscription)',
  '4. On success webhook: plan = "pro", tokens = 30, tokensResetAt = now',
  '5. Monthly renewal: invoice.payment_succeeded → tokens reset to plan allowance',
  '6. Cancellation: customer.subscription.deleted → plan reverts to "free", tokens = 3',
].forEach(l => body(l, { lineGap: 3 }));

doc.moveDown(0.5);
subHeading('D. Authenticated Document Creation');
[
  '1. /create → user fills form → POST /api/generate',
  '2. deductToken(userId): checkAndResetTokens first (weekly/monthly), then decrement',
  '   • tokens > 0: deduct from tokens field',
  '   • tokens = 0 but bonusTokens > 0: deduct from bonusTokens',
  '   • both = 0: 402 error "No tokens remaining"',
  '3. getUserPerms(): checks plan + tokenPackPurchased → decides canUploadLogo',
  '4. If canUploadLogo and business.logoUrl exists → attach to document',
  '5. Save Document record to DB (type, number, clientName, total, JSON data)',
  '6. Return { document, id } → client renders PDF',
  '7. Document appears in /dashboard list',
].forEach(l => body(l, { lineGap: 3 }));

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 6 — API Reference
// ─────────────────────────────────────────────────────────────────────────────
newPage();
sectionHeading('7. API ENDPOINTS');

const apiCols = ['Method + Route', 'Auth', 'Description'];
const apiWidths = [190, 55, 247];
tableRow(apiCols, apiWidths, true);
[
  ['POST /api/auth/register',           'No',  'Create user account (name, email, password)'],
  ['GET/POST /api/auth/[...nextauth]',  'No',  'NextAuth session + credentials sign-in'],
  ['POST /api/generate',               'No*', 'Core: generate document, deduct token, save to DB'],
  ['GET /api/tokens',                   'Yes', 'Returns token count, plan, reset date for nav badge'],
  ['GET /api/documents',               'Yes', 'List all documents for authenticated user'],
  ['GET /api/documents/[id]',          'Yes', 'Fetch single document (owner check)'],
  ['DELETE /api/documents/[id]',       'Yes', 'Delete document (owner check)'],
  ['GET /api/contacts',                'Yes', 'List contacts for user'],
  ['POST /api/contacts',               'Yes', 'Create contact (enforces maxContacts limit)'],
  ['PATCH /api/contacts/[id]',         'Yes', 'Update contact'],
  ['DELETE /api/contacts/[id]',        'Yes', 'Delete contact'],
  ['GET /api/business',                'Yes', 'Get business profile + logoUrl'],
  ['POST/PATCH /api/business',         'Yes', 'Upsert business profile; handles logo upload'],
  ['POST /api/stripe/checkout',        'Yes', 'Create Stripe session (pack or subscription)'],
  ['POST /api/stripe/webhook',         'No',  'Stripe webhook: fulfill purchases, handle renewals'],
].forEach(r => tableRow(r, apiWidths));
doc.moveDown(0.3);
body('* /api/generate accepts unauthenticated requests (guest mode with IP rate limiting).');

sectionHeading('8. TOKEN SYSTEM');
subHeading('Token Buckets');
body('Each user has two separate token buckets:');
bullet('tokens — recurring plan allocation. Resets weekly (free) or monthly (paid plans).');
bullet('bonusTokens — from one-time pack purchases. Never reset. Consumed after recurring tokens.');
doc.moveDown(0.3);
body('Deduction order: recurring tokens first → bonus tokens → 402 error.');

doc.moveDown(0.3);
subHeading('Plan Allocations');
const planCols = ['Plan', 'Tokens', 'Reset', 'Price', 'Logo', 'Contacts'];
const planWidths = [70, 60, 60, 65, 55, 182];
tableRow(planCols, planWidths, true);
[
  ['Free',     '3',   'Weekly',  'Free',   'No',  'Up to 3'],
  ['Basic',    '15',  'Monthly', '$2.99',  'Yes', 'Unlimited'],
  ['Pro',      '30',  'Monthly', '$5.99',  'Yes', 'Unlimited + priority support'],
  ['Business', '100', 'Monthly', '$19.99', 'Yes', 'Unlimited + priority support'],
].forEach(r => tableRow(r, planWidths));

doc.moveDown(0.3);
subHeading('One-Time Token Packs');
const packsCols = ['Pack ID', 'Tokens', 'Price', 'Notes'];
const packsWidths = [100, 65, 65, 262];
tableRow(packsCols, packsWidths, true);
[
  ['tokens_10', '10', '$2.99',  'Starter Pack — unlocks Pro perks (logo, unlimited contacts)'],
  ['tokens_25', '25', '$5.99',  'Value Pack — best value badge'],
  ['tokens_50', '50', '$9.99',  'Pro Pack'],
].forEach(r => tableRow(r, packsWidths));
doc.moveDown(0.3);
body('tokenPackPurchased flag: once set, grants logo upload + unlimited contacts regardless of plan. This is checked via getUserPerms() on every generation request.');

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 7 — Auth, Components, Env Vars
// ─────────────────────────────────────────────────────────────────────────────
newPage();
sectionHeading('9. AUTHENTICATION');
body('NextAuth.js with CredentialsProvider (email + bcrypt password). JWT strategy — no database sessions. The JWT includes { id, email, name, plan } and is refreshed on each request via the session callback.');
doc.moveDown(0.3);
subHeading('Auth Flow');
[
  '• Registration: POST /api/auth/register → bcrypt hash → prisma.user.create → auto-signIn',
  '• Sign-in: NextAuth verifies bcrypt → signs JWT → stores in HttpOnly cookie',
  '• Session: getServerSession(authOptions) in API routes; useSession() in client components',
  '• Redirect param: /sign-in?redirect=X and /sign-up?redirect=X — only relative paths honoured',
  '• Protected routes: middleware.ts (if present) or per-route session checks',
].forEach(l => body(l, { lineGap: 3 }));

sectionHeading('10. COMPONENTS');
const compCols = ['Component', 'Location', 'Description'];
const compWidths = [140, 170, 182];
tableRow(compCols, compWidths, true);
[
  ['DocumentForm',     'components/document-form.tsx', 'Multi-section form: from, to, line items, settings. Calls /api/generate on submit.'],
  ['DocumentPdf',      'components/document-pdf.tsx',  '@react-pdf/renderer component. Renders invoice/receipt/statement from DocumentData.'],
  ['Nav',              'components/nav.tsx',            'Top navigation for dashboard layout. Shows TokenBadge, links to create/dashboard/contacts/settings/upgrade.'],
  ['TokenBadge',       'components/token-badge.tsx',   'Fetches /api/tokens and displays remaining count with low-token warning and progress bar.'],
  ['Button',           'components/ui/button.tsx',     'Tailwind button with variant (default/outline/ghost/destructive), size, loading spinner.'],
  ['Card',             'components/ui/card.tsx',        'Simple rounded card wrapper with CardContent/CardHeader.'],
  ['Input',            'components/ui/input.tsx',       'Labelled input with error state support.'],
].forEach(r => tableRow(r, compWidths));

sectionHeading('11. ENVIRONMENT VARIABLES');
const envCols = ['Variable', 'Used In', 'Notes'];
const envWidths = [180, 120, 192];
tableRow(envCols, envWidths, true);
[
  ['DATABASE_URL',              'lib/db.ts (Prisma)',       'PostgreSQL connection string'],
  ['NEXTAUTH_URL',              'NextAuth',                 'Full app URL (e.g. https://app.com)'],
  ['NEXTAUTH_SECRET',           'NextAuth',                 'JWT signing secret'],
  ['ANTHROPIC_API_KEY',         'Installed, unused*',       'Reserved for future AI integration'],
  ['STRIPE_SECRET_KEY',         'lib/stripe.ts',            'Stripe server-side key'],
  ['STRIPE_PUBLISHABLE_KEY',    'Client (if needed)',       'Stripe publishable key'],
  ['STRIPE_WEBHOOK_SECRET',     'api/stripe/webhook',       'Validates Stripe webhook signatures'],
  ['STRIPE_PRICE_BASIC',        'lib/stripe.ts',            'Stripe Price ID for Basic plan'],
  ['STRIPE_PRICE_PRO',          'lib/stripe.ts',            'Stripe Price ID for Pro plan'],
  ['STRIPE_PRICE_BUSINESS',     'lib/stripe.ts',            'Stripe Price ID for Business plan'],
  ['STRIPE_PRICE_TOKENS_10',    'lib/stripe.ts',            'Price ID for 10-token pack'],
  ['STRIPE_PRICE_TOKENS_25',    'lib/stripe.ts',            'Price ID for 25-token pack'],
  ['STRIPE_PRICE_TOKENS_50',    'lib/stripe.ts',            'Price ID for 50-token pack'],
  ['NEXT_PUBLIC_APP_URL',       'api/stripe/checkout',      'Used in Stripe success/cancel URLs'],
].forEach(r => tableRow(r, envWidths));
doc.moveDown(0.3);
body('* ANTHROPIC_API_KEY is imported by the project but lib/claude.ts currently contains no Anthropic SDK call. It performs pure TypeScript document assembly.');

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 8 — Known Issues & Opportunities
// ─────────────────────────────────────────────────────────────────────────────
newPage();
sectionHeading('12. KNOWN ISSUES & GAPS (as of Feb 2026)');

subHeading('Critical / Recently Fixed');
bullet('Post-auth redirect: "Buy" buttons on landing → sign-up → was redirecting to /dashboard instead of /upgrade. Fixed: ?redirect=/upgrade param now propagates through both sign-up and sign-in pages.');
bullet('Mobile nav layout: dashboard nav overflow on small screens. Fixed: responsive flex layout with mobile-compact TokenBadge.');

doc.moveDown(0.3);
subHeading('Open Issues');
bullet('No live Anthropic API call — despite the product name and installed SDK, documents are assembled by a template function. No NLP/AI parsing of unstructured input.');
bullet('No email verification — users register without verifying their email address.');
bullet('No password reset flow — /forgot-password does not exist.');
bullet('Document status is always "draft" — sent/paid status transitions not implemented.');
bullet('Logo upload mechanism — /api/business references logoUrl but the upload handling (e.g. presigned S3 URL or Supabase Storage) is not fully visible in the reviewed files.');
bullet('No billing portal — users cannot manage/cancel subscriptions from the app. Must go direct to Stripe.');
bullet('No Stripe price IDs in repo — STRIPE_PRICE_* env vars must be manually configured; no seed script or Stripe CLI setup documented.');
bullet('Guest → user token continuity — if a guest signs up after using guest tokens, their IP-based usage is not linked to their new account.');
bullet('Document list pagination — /api/documents returns all documents with no limit/cursor.');

doc.moveDown(0.3);
subHeading('Growth & Optimisation Opportunities');
bullet('Activate Anthropic integration: accept a natural-language prompt ("Invoice Acme Corp for 5 hours consulting at $150/hr, net 30") and parse into DocumentData using Claude.');
bullet('Email delivery: send invoices as PDF attachments via Resend or SendGrid.');
bullet('Stripe Customer Portal: link from /settings so users can self-serve cancel/upgrade.');
bullet('Document templates: multiple PDF layouts / colour schemes.');
bullet('Team accounts: shared workspace with multiple users under one billing entity.');
bullet('Webhook reliability: add idempotency key checks to prevent double-crediting tokens on replay.');
bullet('SEO & marketing: landing page lacks meta tags, OG image, and sitemap.');
bullet('Analytics: no usage analytics (PostHog, Plausible etc.) to track conversion funnels.');
bullet('Error monitoring: no Sentry or similar — console.warn is the current fallback.');

sectionHeading('13. BUILD & DEPLOY');
subHeading('Local Development');
codeBlock([
  'cp .env.example .env.local   # fill in all env vars',
  'npm install',
  'npx prisma migrate dev        # creates tables',
  'npm run dev                   # starts on http://localhost:3000',
  '',
  '# For Stripe webhooks locally:',
  'stripe listen --forward-to localhost:3000/api/stripe/webhook',
]);

subHeading('Production (Vercel)');
[
  '• Pushes to main auto-deploy via vercel.json.',
  '• Build command: prisma generate && next build.',
  '• All env vars must be set in Vercel dashboard.',
  '• Stripe webhook endpoint: https://<domain>/api/stripe/webhook (add in Stripe dashboard).',
  '• DATABASE_URL must point to a pooled Supabase connection string for serverless.',
].forEach(l => body(l, { lineGap: 3 }));

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 9 — Data Flow Diagram (ASCII)
// ─────────────────────────────────────────────────────────────────────────────
newPage();
sectionHeading('14. SYSTEM DATA FLOW');
body('Document Generation Request:');
codeBlock([
  'Browser                   Next.js Server               External',
  '─────────────────────────────────────────────────────────────────',
  'POST /api/generate ──────► getServerSession()          ',
  '  { type, data }              │                        ',
  '                          Authenticated?               ',
  '                          ├─ Yes ──► deductToken(userId)',
  '                          │           checkAndResetTokens()',
  '                          │           tokens>0 OR bonusTokens>0',
  '                          └─ No ───► deductGuestToken(ip)',
  '                                      GuestUsage table',
  '                              │                        ',
  '                          generateDocument(data, type)',
  '                          (TypeScript assembly, no API call)',
  '                              │                        ',
  '                          getUserPerms() → canUploadLogo?',
  '                              │                        ',
  '                          prisma.document.create()     ',
  '                              │                        ',
  '◄────────────────────────── { document, id }           ',
  '                                                       ',
  '@react-pdf renders PDF in browser (client-side)        ',
]);

doc.moveDown(0.4);
body('Stripe Purchase Flow:');
codeBlock([
  'Browser                  Next.js Server               Stripe',
  '─────────────────────────────────────────────────────────────────',
  'POST /api/stripe/checkout ──► validate session        ',
  '  { pack: "tokens_25" }       prisma.user.findUnique()',
  '                              stripe.checkout.sessions',
  '                               .create(mode:"payment") ──► Stripe',
  '◄────────── { url } ◄────────                         ',
  'window.location = url ──────────────────────────────► Stripe Checkout',
  '                                                       User pays',
  '                                       Stripe webhook ──► POST /api/stripe/webhook',
  '                                                         verify signature',
  '                                                         bonusTokens += 25',
  '                                                         tokenPackPurchased = true',
  '◄── redirect success_url /dashboard?tokens_added=25 ◄──',
]);

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER on each page
// ─────────────────────────────────────────────────────────────────────────────
const pages = doc.bufferedPageRange();
for (let i = 0; i < pages.count; i++) {
  doc.switchToPage(pages.start + i);
  doc.fillColor('#9ca3af').fontSize(7.5).font('Helvetica')
    .text(
      `InvoiceClaude — Project Scope Document — Feb 2026 — Page ${i + 1} of ${pages.count}`,
      60, 740, { align: 'center', width: 492 }
    );
}

doc.end();
console.log('PDF written to:', out);
