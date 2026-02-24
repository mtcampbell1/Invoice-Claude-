import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { PLANS } from "@/lib/tokens";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as {
        metadata?: { userId?: string; type?: string; plan?: string; tokens?: string };
        subscription?: string;
        customer?: string;
      };
      const userId = session.metadata?.userId;

      if (!userId) break;

      if (session.metadata?.type === "token_pack") {
        // One-time purchase: credit bonus tokens (never expire/reset)
        const tokensToAdd = parseInt(session.metadata?.tokens ?? "0", 10);
        if (tokensToAdd > 0) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              bonusTokens: { increment: tokensToAdd },
              tokenPackPurchased: true,
              stripeCustomerId: session.customer as string,
            },
          });
        }
      } else {
        // Subscription
        const plan = session.metadata?.plan as keyof typeof PLANS;
        if (plan && PLANS[plan]) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan,
              tokens: PLANS[plan].tokens,
              tokensResetAt: new Date(),
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
            },
          });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as { id: string };
      await prisma.user.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          plan: "free",
          tokens: PLANS.free.tokens,
          tokensResetAt: new Date(),
          stripeSubscriptionId: null,
        },
      });
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as { subscription?: string };
      if (invoice.subscription) {
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: invoice.subscription as string },
        });
        if (user && user.plan !== "free") {
          const plan = PLANS[user.plan as keyof typeof PLANS];
          if (plan) {
            await prisma.user.update({
              where: { id: user.id },
              data: { tokens: plan.tokens, tokensResetAt: new Date() },
            });
          }
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
