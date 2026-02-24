import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe, STRIPE_PLANS, TOKEN_PACKS, type TokenPackId } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan, pack } = await req.json();

  if (!plan && !pack) {
    return NextResponse.json({ error: "plan or pack is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // ── One-time token pack ──────────────────────────────────────────────────
  if (pack) {
    const packConfig = TOKEN_PACKS[pack as TokenPackId];
    if (!packConfig) {
      return NextResponse.json({ error: "Invalid token pack" }, { status: 400 });
    }
    if (!packConfig.priceId) {
      return NextResponse.json(
        { error: "Token pack not configured. Please contact support." },
        { status: 500 }
      );
    }

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: packConfig.priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?tokens_added=${packConfig.tokens}`,
      cancel_url: `${appUrl}/upgrade`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        type: "token_pack",
        pack,
        tokens: String(packConfig.tokens),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  }

  // ── Subscription ─────────────────────────────────────────────────────────
  const planConfig = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS];
  if (!planConfig) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/upgrade`,
    customer_email: user.email,
    metadata: {
      userId: user.id,
      type: "subscription",
      plan,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
