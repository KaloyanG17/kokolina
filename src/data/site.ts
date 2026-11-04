/**
 * Facts about the shop that the site, checkout and emails rely on. Text in
 * both languages lives in src/i18n/dictionaries.ts and reads these values.
 */

export const site = {
  brand: "Kokolina",
  url: "https://kokolina.vercel.app", // overridden by NEXT_PUBLIC_SITE_URL
  currency: "EUR",
  locale: "en-IE",
  city: { en: "Varna", bg: "Варна" },
  contactEmail: "kokolina2026@gmail.com" as string | null,
  // Leave null to hide the link in the footer.
  instagram: null as string | null,

  /** Working days between payment and the parcel leaving the studio. */
  dispatchDays: { min: 3, max: 5 },
  /** Days to return an unworn piece. EU law requires at least 14. The customer pays return shipping. */
  returnDays: 14,
  /** Prices include VAT at this rate. */
  vatRate: 20,
  shipping: {
    /** ISO country codes checkout accepts. */
    countries: ["BG"] as const,
    /** Courier delivery in euros, and the order total from which it is free. */
    fee: 5,
    freeFrom: 150,
  },

  /**
   * The trader's legal details, required on the terms and privacy pages under
   * Bulgarian consumer law. Fill in once the business is registered; until
   * then the legal pages show a notice instead.
   */
  seller: null as null | { name: string; eik: string; vatNumber?: string; address: string },
};

/** Shipping for an order subtotal in euros: free from the threshold, otherwise the flat fee. */
export function shippingFor(subtotal: number) {
  return subtotal >= site.shipping.freeFrom ? 0 : site.shipping.fee;
}
