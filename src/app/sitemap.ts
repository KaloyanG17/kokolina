import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";
import { env } from "@/lib/env";

export const revalidate = 3600;

/** Every public page and product, for search engines. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl.replace(/\/$/, "");
  const now = new Date();
  const pages = [
    { path: "/", priority: 1 },
    { path: "/shop", priority: 0.9 },
    { path: "/exclusive", priority: 0.8 },
    { path: "/returns", priority: 0.3 },
    { path: "/terms", priority: 0.2 },
    { path: "/privacy", priority: 0.2 },
  ];
  const products = await getProducts();
  return [
    ...pages.map((p) => ({ url: `${base}${p.path}`, lastModified: now, changeFrequency: "weekly" as const, priority: p.priority })),
    ...products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: p.images?.[0] ? [p.images[0].url] : undefined,
    })),
  ];
}
