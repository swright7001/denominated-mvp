import Stripe from "stripe";

export const stripeApiVersion = "2026-05-27.dahlia";

export function createStripeClient(secretKey: string) {
  return new Stripe(secretKey, {
    apiVersion: stripeApiVersion,
    typescript: true,
  });
}
