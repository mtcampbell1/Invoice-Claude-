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
