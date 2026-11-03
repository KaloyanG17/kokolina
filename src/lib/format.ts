import { site } from "@/data/site";

export function formatPrice(amount: number) {
  return new Intl.NumberFormat(site.locale, {
    style: "currency",
    currency: site.currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
