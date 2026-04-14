import Stripe from "stripe";

export const STRIPE_CURRENCY = (process.env.STRIPE_CURRENCY || "usd").toLowerCase();

type StripeClient = InstanceType<typeof Stripe>;

let stripeClient: StripeClient | null = null;

export const getStripeClient = (): StripeClient => {
  if (!process.env.STRIPE_SECRET_KEY) {
    const error = new Error("STRIPE_SECRET_KEY is not configured") as Error & { statusCode: number };
    error.statusCode = 500;
    throw error;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      maxNetworkRetries: 2,
    });
  }

  return stripeClient;
};

export const getStripePublishableKey = (): string | null => process.env.STRIPE_PUBLISHABLE_KEY || null;
