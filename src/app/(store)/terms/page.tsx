import type { Metadata } from "next";
import { site } from "@/data/site";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Terms of sale" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of sale"
      sections={[
        { heading: "Orders", body: "{{when a contract is formed and how orders are confirmed}}" },
        { heading: "Prices and payment", body: "{{currency, taxes and accepted payment methods}}" },
        { heading: "Shipping", body: `Orders leave the studio within ${site.shippingDays}. {{regions and costs}}` },
        {
          heading: "Returns and refunds",
          body: `Unworn pieces with their tags can be returned within ${site.returnWindow} of delivery. {{how to start a return and who pays return shipping}}`,
        },
        { heading: "Contact", body: "{{studio contact details}}" },
      ]}
    />
  );
}
