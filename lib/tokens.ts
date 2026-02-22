import { prisma } from "@/lib/db";

export const PLANS = {
  free: {
    name: "Free",
    tokens: 3,
    resetPeriod: "weekly" as const,
    price: 0,
    features: ["3 tokens/week", "Invoices, receipts, statements", "PDF export"],
    canSaveContacts: false,
    canSaveBusiness: false,
    canUploadLogo: false,
  },
  basic: {
    name: "Basic",
    tokens: 15,
    resetPeriod: "monthly" as const,
    price: 2.99,
    features: ["15 tokens/month", "All document types", "PDF export"],
    canSaveContacts: false,
    canSaveBusiness: false,
    canUploadLogo: false,
  },
  pro: {
    name: "Pro",
    tokens: 30,
    resetPeriod: "monthly" as const,
    price: 5.99,
    features: [
      "30 tokens/month",
      "All document types",
      "PDF export",
      "Save client contacts",
      "Save business info",
      "Upload business logo",
    ],
    canSaveContacts: true,
    canSaveBusiness: true,
    canUploadLogo: true,
  },
  business: {
    name: "Business",
    tokens: 100,
    resetPeriod: "monthly" as const,
    price: 19.99,
    features: [
      "100 tokens/month",
      "All document types",
      "PDF export",
      "Save client contacts",
      "Save business info",
      "Upload business logo",
      "Priority support",
    ],
    canSaveContacts: true,
    canSaveBusiness: true,
    canUploadLogo: true,
  },
} as const;

export type PlanName = keyof typeof PLANS;

/**
 * Check if user's tokens need to be reset and reset if necessary.
 * Returns the user with up-to-date token count.
 */
export async function checkAndResetTokens(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const plan = PLANS[user.plan as PlanName] ?? PLANS.free;
  const now = new Date();
  const resetAt = new Date(user.tokensResetAt);

  let needsReset = false;

  if (plan.resetPeriod === "weekly") {
    const msInWeek = 7 * 24 * 60 * 60 * 1000;
    needsReset = now.getTime() - resetAt.getTime() >= msInWeek;
  } else {
    // monthly: check if we're in a new calendar month
    needsReset =
      now.getMonth() !== resetAt.getMonth() ||
      now.getFullYear() !== resetAt.getFullYear();
  }

  if (needsReset) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        tokens: plan.tokens,
        tokensResetAt: now,
      },
    });
  }

  return user;
}

/**
 * Deduct one token from the user. Returns false if no tokens available.
 */
export async function deductToken(userId: string): Promise<boolean> {
  const user = await checkAndResetTokens(userId);

  if (user.tokens <= 0) {
    return false;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { tokens: { decrement: 1 } },
  });

  return true;
}

const GUEST_WEEKLY_TOKENS = 3;

function currentWeekStart(): Date {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday
  const diff = now.getUTCDate() - day;
  const weekStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff));
  weekStart.setUTCHours(0, 0, 0, 0);
  return weekStart;
}

/**
 * Check and deduct a token for an anonymous guest identified by IP.
 * Returns { allowed: true } or { allowed: false, tokensRemaining: 0, resetsAt: Date }
 */
export async function deductGuestToken(
  ip: string
): Promise<{ allowed: boolean; tokensRemaining: number; resetsAt: Date }> {
  const weekStart = currentWeekStart();
  const resetsAt = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Find or create the record for this IP
  const existing = await prisma.guestUsage.findUnique({ where: { ip } });

  if (!existing) {
    // First use ever — create with 2 remaining (just used 1)
    await prisma.guestUsage.create({
      data: { ip, tokens: GUEST_WEEKLY_TOKENS - 1, weekStart },
    });
    return { allowed: true, tokensRemaining: GUEST_WEEKLY_TOKENS - 1, resetsAt };
  }

  // Check if a new week has started since their last use
  const needsReset = existing.weekStart < weekStart;
  const currentTokens = needsReset ? GUEST_WEEKLY_TOKENS : existing.tokens;

  if (currentTokens <= 0) {
    return { allowed: false, tokensRemaining: 0, resetsAt };
  }

  await prisma.guestUsage.update({
    where: { ip },
    data: {
      tokens: currentTokens - 1,
      weekStart: needsReset ? weekStart : undefined,
    },
  });

  return { allowed: true, tokensRemaining: currentTokens - 1, resetsAt };
}

/**
 * Get token status for a user.
 */
export async function getTokenStatus(userId: string) {
  const user = await checkAndResetTokens(userId);
  const plan = PLANS[user.plan as PlanName] ?? PLANS.free;

  return {
    tokens: user.tokens,
    plan: user.plan,
    planName: plan.name,
    maxTokens: plan.tokens,
    resetPeriod: plan.resetPeriod,
    tokensResetAt: user.tokensResetAt,
  };
}
