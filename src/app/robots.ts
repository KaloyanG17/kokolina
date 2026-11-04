import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/** Lets search engines index the shop but not the admin, bag, checkout or API. */
export default function robots(): MetadataRoute.Robots {
  const base = env.siteUrl.replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/bag", "/checkout", "/unsubscribe"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
