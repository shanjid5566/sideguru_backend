import Stripe from "stripe";

export const STRIPE_CURRENCY = (process.env.STRIPE_CURRENCY || "usd").toLowerCase();

type StripeClient = InstanceType<typeof Stripe>;

let stripeClient: StripeClient | null = null;

export const getStripeClient = (): StripeClient => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
};

export const getStripePublishableKey = (): string => process.env.STRIPE_PUBLISHABLE_KEY || "";
