import { categories, sampleProducts, type Category, type Product } from "@/data/products";
import type { GarmentKind, Wash } from "@/components/product-art";
import { mediaUrl, publicClient } from "@/lib/supabase/server";

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
  is_new: boolean;
  sold_out: boolean;
  published: boolean;
  sort: number;
  product_images?: { path: string; alt: string; sort: number }[];
};

export function rowToProduct(r: ProductRow): Product {
  const images = [...(r.product_images ?? [])]
    .sort((a, b) => a.sort - b.sort)
    .map((i) => ({ url: mediaUrl(i.path)!, alt: i.alt }));
  return {
    id: r.id,
    slug: r.slug,
    lot: r.lot,
    name: r.name,
    category: (categories as readonly string[]).includes(r.category) ? (r.category as Category) : "Jeans",
    price: r.price_cents / 100,
    colour: r.colour,
    fabric: r.fabric,
    description: r.description,
    fit: r.fit,
    care: r.care,
    sizes: r.sizes,
    art: r.art as GarmentKind,
    wash: r.wash as Wash,
    stock: r.stock,
    images,
    isNew: r.is_new,
    soldOut: r.sold_out || r.stock <= 0,
  };
}

export const PRODUCT_SELECT = "*, product_images(path, alt, sort)";

/**
 * Published products, in admin sort order. Falls back to the sample
 * catalogue when Supabase is not configured or unreachable, so the shop
 * always renders.
 */
export async function getProducts(): Promise<Product[]> {
  const db = publicClient();
  if (!db) return sampleProducts;
  const { data, error } = await db
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("published", true)
    .order("sort")
    .order("created_at");
  if (error) {
    console.error("[catalog] falling back to sample products:", error.message);
    return sampleProducts;
  }
  return (data as ProductRow[]).map(rowToProduct);
}

export async function getProduct(slug: string) {
  return (await getProducts()).find((p) => p.slug === slug);
}

export function relatedTo(product: Product, all: Product[], count = 4) {
  const others = all.filter((p) => p.slug !== product.slug);
  return [...others.filter((p) => p.category === product.category), ...others.filter((p) => p.category !== product.category)].slice(0, count);
}

export type SiteImages = Record<string, { url?: string; alt: string }>;

export async function getSiteImages(): Promise<SiteImages> {
  const db = publicClient();
  if (!db) return {};
  const { data } = await db.from("site_images").select("key, path, alt");
  return Object.fromEntries((data ?? []).map((r) => [r.key, { url: mediaUrl(r.path), alt: r.alt }]));
}
