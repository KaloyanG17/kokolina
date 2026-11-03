import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { getAdmin } from "@/lib/admin";
import { PRODUCT_SELECT, rowToProduct, type ProductRow } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { Notice, PageHeader } from "@/components/admin/ui";
import { ProductPicture } from "@/components/product-picture";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const result = await getAdmin();
  if (result.status !== "ok") return null;
  const { deleted } = await searchParams;

  const { data, error } = await result.admin.db.from("products").select(PRODUCT_SELECT).order("sort").order("created_at");
  const rows = (data as (ProductRow & { published: boolean })[] | null) ?? [];

  return (
    <>
      <PageHeader title="Products" intro="Everything in the catalogue. Unpublished products are hidden from the shop.">
        <Link href="/admin/products/new" className="btn-primary">
          <Plus size={16} weight="bold" aria-hidden />
          New product
        </Link>
      </PageHeader>
      {deleted && <Notice tone="ok">Product deleted.</Notice>}
      {error && <Notice tone="error">Could not load products: {error.message}</Notice>}

      {rows.length === 0 && !error ? (
        <div className="flex flex-col items-start gap-4 rounded-md border border-line bg-surface p-8">
          <p className="title-2">No products yet</p>
          <p className="body-6 text-muted">Add your first lot, or run supabase/seed.sql to load the 12 test products.</p>
          <Link href="/admin/products/new" className="btn-primary">
            Add a product
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-line bg-surface">
          <table className="w-full min-w-[640px] text-left">
            <thead className="caption-3 font-mono uppercase tracking-wider text-muted">
              <tr>
                <th scope="col" className="p-4">Product</th>
                <th scope="col" className="p-4">Category</th>
                <th scope="col" className="p-4 text-right">Price</th>
                <th scope="col" className="p-4 text-right">Stock</th>
                <th scope="col" className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const p = rowToProduct(r);
                return (
                  <tr key={r.id} className="border-t border-line transition-colors duration-300 ease-brand hover:bg-surface-2">
                    <td className="p-4">
                      <Link href={`/admin/products/${r.id}`} className="focus-ring flex items-center gap-4 rounded-sm">
                        <span className="h-16 w-12 shrink-0 overflow-hidden rounded-sm bg-surface-2">
                          <ProductPicture product={p} idPrefix="admin-list" sizes="48px" className="h-full w-full" />
                        </span>
                        <span className="flex flex-col">
                          <span className="title-4">{r.name}</span>
                          <span className="caption-5 font-mono text-muted">{r.lot} · /{r.slug}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="body-6 p-4">{r.category}</td>
                    <td className="body-6 p-4 text-right font-mono tabular-nums">{formatPrice(r.price_cents / 100)}</td>
                    <td className={`body-6 p-4 text-right font-mono tabular-nums ${r.stock === 0 ? "text-danger" : ""}`}>{r.stock}</td>
                    <td className="p-4">
                      <span className="caption-3 flex flex-wrap gap-1 font-mono uppercase">
                        <span className={`rounded-sm px-2 py-1 ${r.published ? "bg-ink-soft text-ink" : "bg-surface-3 text-muted"}`}>
                          {r.published ? "Live" : "Hidden"}
                        </span>
                        {p.soldOut && <span className="rounded-sm bg-surface-3 px-2 py-1 text-danger">Sold out</span>}
                        {r.is_new && <span className="rounded-sm bg-thread px-2 py-1 text-ink-deep">New</span>}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
