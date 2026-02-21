import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { PLANS } from "@/lib/tokens";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as { metadata?: { userId?: string; plan?: string }; subscription?: string; customer?: string };
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as keyof typeof PLANS;

      if (userId && plan && PLANS[plan]) {
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
        // Reset tokens on successful renewal
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: invoice.subscription as string },
        });
        if (user && user.plan !== "free") {
          const plan = PLANS[user.plan as keyof typeof PLANS];
          if (plan) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                tokens: plan.tokens,
                tokensResetAt: new Date(),
              },
            });
          }
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
