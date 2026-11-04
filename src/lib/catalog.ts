import { unstable_cache } from "next/cache";
import { categories, sampleProducts, type Category, type Product } from "@/data/products";
import type { GarmentKind, Wash } from "@/components/product-art";
import { defaultLocale, type Locale } from "@/i18n/config";
import { mediaUrl, publicClient } from "@/lib/supabase/server";

/** Cache tag for everything read from the catalogue; admin saves revalidate it. */
export const CATALOG_TAG = "catalog";

/** Text fields with a Bulgarian copy in <field>_bg. Empty copies fall back to English. */
type Translated = "name" | "colour" | "fabric" | "description" | "fit" | "care";

/** Row shape of public.products joined with its images. */
export type ProductRow = {
  id: string;
  slug: string;
  lot: string;
  name: string;
  category: string;
  price_cents: number;
  colour: string;
  fabric: string;
  description: string;
  fit: string;
  care: string;
  sizes: string[];
  art: string;
  wash: string;
  stock: number;
  size_stock?: Record<string, number> | null;
  is_new: boolean;
  sold_out: boolean;
  published: boolean;
  exclusive?: boolean;
  sort: number;
  product_images?: { path: string; alt: string; sort: number }[];
} & Partial<Record<`${Translated}_bg`, string | null>>;

export function rowToProduct(r: ProductRow, locale: Locale = "en"): Product {
  // Only sizes the product is still sold in count towards per size stock
  const sizeStock = Object.fromEntries(
    Object.entries(r.size_stock ?? {})
      .filter(([size]) => r.sizes.includes(size))
      .map(([size, n]) => [size, Math.max(0, Number(n) || 0)]),
  );
  const tracksSizes = Object.keys(sizeStock).length > 0;
  const allSizesGone = tracksSizes && r.sizes.every((size) => (sizeStock[size] ?? 0) <= 0);
  const text = (field: Translated) => (locale === "bg" && r[`${field}_bg`]?.trim()) || r[field];
  const images = [...(r.product_images ?? [])]
    .sort((a, b) => a.sort - b.sort)
    .map((i) => ({ url: mediaUrl(i.path)!, alt: i.alt }));
  return {
    id: r.id,
    slug: r.slug,
    lot: r.lot,
    name: text("name"),
    category: (categories as readonly string[]).includes(r.category) ? (r.category as Category) : "Jeans",
    price: r.price_cents / 100,
    colour: text("colour"),
    fabric: text("fabric"),
    description: text("description"),
    fit: text("fit"),
    care: text("care"),
    sizes: r.sizes,
    art: r.art as GarmentKind,
    wash: r.wash as Wash,
    stock: r.stock,
    sizeStock: tracksSizes ? sizeStock : undefined,
    images,
    isNew: r.is_new,
    soldOut: r.sold_out || r.stock <= 0 || allSizesGone,
    exclusive: Boolean(r.exclusive),
  };
}

export const PRODUCT_SELECT = "*, product_images(path, alt, sort)";

// Pages render per language, so the rows are cached here instead of in the page cache.
// A failed read throws, which keeps it out of the cache.
const publishedRows = unstable_cache(
  async () => {
    const db = publicClient();
    if (!db) return null;
    const { data, error } = await db
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("published", true)
      .order("sort")
      .order("created_at");
    if (error) throw new Error(error.message);
    return data as ProductRow[];
  },
  ["published-products"],
  { revalidate: 60, tags: [CATALOG_TAG] },
);

/**
 * Published products in admin sort order, in the given language. Falls back
 * to the sample catalogue when Supabase is not configured or unreachable, so
 * the shop always renders.
 */
export async function getProducts(locale: Locale = defaultLocale): Promise<Product[]> {
  try {
    const rows = await publishedRows();
    return rows ? rows.map((r) => rowToProduct(r, locale)) : sampleProducts;
  } catch (e) {
    console.error("[catalog] falling back to sample products:", e instanceof Error ? e.message : e);
    return sampleProducts;
  }
}

export async function getProduct(slug: string, locale: Locale = defaultLocale) {
  return (await getProducts(locale)).find((p) => p.slug === slug);
}

export function relatedTo(product: Product, all: Product[], count = 4) {
  const others = all.filter((p) => p.slug !== product.slug);
  return [...others.filter((p) => p.category === product.category), ...others.filter((p) => p.category !== product.category)].slice(0, count);
}

export type SiteImages = Record<string, { url?: string; alt: string }>;

const siteImageRows = unstable_cache(
  async (): Promise<SiteImages> => {
    const db = publicClient();
    if (!db) return {};
    const { data, error } = await db.from("site_images").select("key, path, alt");
    if (error) throw new Error(error.message);
    return Object.fromEntries((data ?? []).map((r) => [r.key, { url: mediaUrl(r.path), alt: r.alt }]));
  },
  ["site-images"],
  { revalidate: 60, tags: [CATALOG_TAG] },
);

export async function getSiteImages(): Promise<SiteImages> {
  try {
    return await siteImageRows();
  } catch (e) {
    console.error("[catalog] site images unavailable:", e instanceof Error ? e.message : e);
    return {};
  }
}
