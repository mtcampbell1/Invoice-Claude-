import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

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
