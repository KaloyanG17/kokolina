import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).legal.terms.title };
}

export default function TermsPage() {
  return <LegalPage page="terms" />;
}
