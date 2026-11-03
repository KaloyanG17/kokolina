import type { Metadata } from "next";
import { BagPageContent } from "@/components/bag-page";

export const metadata: Metadata = {
  title: "Your bag",
  robots: { index: false },
};

export default function BagPage() {
  return (
    <div className="px-4 pb-24 pt-24 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 pt-12">
        <h1 className="heading-3 md:heading-2 text-hero-gradient">Your bag</h1>
        <BagPageContent />
      </div>
    </div>
  );
}
