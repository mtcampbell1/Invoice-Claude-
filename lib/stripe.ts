import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-01-28.clover",
    });
  }
  return _stripe;
}

export const STRIPE_PLANS = {
  basic: {
    priceId: process.env.STRIPE_PRICE_BASIC!,
    name: "Basic",
    price: 2.99,
  },
  pro: {
    priceId: process.env.STRIPE_PRICE_PRO!,
    name: "Pro",
    price: 5.99,
  },
  business: {
    priceId: process.env.STRIPE_PRICE_BUSINESS!,
    name: "Business",
    price: 19.99,
  },
};

// One-time token packs. Tokens are credited to bonusTokens and never expire.
export const TOKEN_PACKS = {
  tokens_10: {
    tokens: 10,
    price: 2.99,
    label: "Starter Pack",
    priceId: process.env.STRIPE_PRICE_TOKENS_10!,
  },
  tokens_25: {
    tokens: 25,
    price: 5.99,
    label: "Value Pack",
    priceId: process.env.STRIPE_PRICE_TOKENS_25!,
  },
  tokens_50: {
    tokens: 50,
    price: 9.99,
    label: "Pro Pack",
    priceId: process.env.STRIPE_PRICE_TOKENS_50!,
  },
} as const;

export type TokenPackId = keyof typeof TOKEN_PACKS;
