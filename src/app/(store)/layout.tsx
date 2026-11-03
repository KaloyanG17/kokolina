import { BagProvider } from "@/components/bag-provider";
import { BagDrawer } from "@/components/bag-drawer";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { LoadingScreen } from "@/components/stitch-loader";
import { ScrollRail } from "@/components/scroll-rail";
import { ConsentBanner } from "@/components/consent-banner";
import type { Metadata } from "next";
import { getProducts, getSiteImages } from "@/lib/catalog";
import { has } from "@/lib/env";

export const revalidate = 60;

/** Uses the sharing picture from the admin when one is uploaded. */
export async function generateMetadata(): Promise<Metadata> {
  const og = (await getSiteImages()).og;
  return og?.url ? { openGraph: { images: [{ url: og.url, alt: og.alt }] }, twitter: { images: [og.url] } } : {};
}

/** Storefront chrome: loader, nav, bag, footer and the stitched scroll rail. */
export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const catalog = await getProducts();
  return (
    <>
      <LoadingScreen />
      <BagProvider catalog={catalog} checkoutEnabled={has.stripe}>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <BagDrawer />
      </BagProvider>
      <ScrollRail />
      <ConsentBanner />
    </>
  );
}
