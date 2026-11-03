import Stripe from "stripe";
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

/** Countries the shop ships to. Adjust to match your shipping rates. */
export const SHIPPING_COUNTRIES = [
  "BG", "AT", "BE", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "GB",
] as const;
