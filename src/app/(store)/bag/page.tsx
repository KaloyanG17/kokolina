import type { Metadata } from "next";
import { BagPageContent } from "@/components/bag-page";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).bag.title, robots: { index: false } };
}

export default async function BagPage() {
  const { bag } = await getT();
  return (
    <div className="px-4 pb-24 pt-24 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 pt-12">
        <h1 className="heading-3 md:heading-2 text-hero-gradient">{bag.title}</h1>
        <BagPageContent />
      </div>
    </div>
  );
}
