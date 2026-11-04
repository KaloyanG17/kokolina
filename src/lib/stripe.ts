import Stripe from "stripe";
import { site } from "@/data/site";
import { env, has } from "@/lib/env";

let client: Stripe | null = null;

/** Server side Stripe client, or null until STRIPE_SECRET_KEY is set. */
export function stripe() {
  if (!has.stripe) return null;
  client ??= new Stripe(env.stripeSecretKey, { appInfo: { name: "Kokolina shop" } });
  return client;
}

/** Item details stored on the Checkout Session so the webhook can rebuild the order. */
export type CheckoutItem = { slug: string; name: string; size: string; qty: number; unitAmount: number };

/** Countries checkout accepts; set in src/data/site.ts with the delivery prices. */
export const SHIPPING_COUNTRIES = site.shipping.countries;
