import type { Metadata } from "next";
import { getAdmin } from "@/lib/admin";
import { has } from "@/lib/env";
import { formatPrice } from "@/lib/format";
import { getProducts } from "@/lib/catalog";
import { ProductPicture } from "@/components/product-picture";
import { Notice, PageHeader } from "@/components/admin/ui";
import { LiveRefresh } from "@/components/admin/live-refresh";
import { setOrderStatus } from "../../actions";

export const metadata: Metadata = { title: "Orders" };

const dateFmt = new Intl.DateTimeFormat("en-IE", { dateStyle: "medium", timeStyle: "short" });
const STATUSES = ["paid", "fulfilled", "refunded", "cancelled"] as const;

type OrderItem = { slug?: string; name: string; size: string; qty: number; unitAmount: number };
type Address = { name?: string; address?: { line1?: string; line2?: string; city?: string; postal_code?: string; country?: string } } & {
  line1?: string;
  city?: string;
  postal_code?: string;
  country?: string;
};

export default async function Orders() {
  const result = await getAdmin();
  if (result.status !== "ok") return null;
  const [{ data: orders, error }, catalog] = await Promise.all([
    result.admin.db.from("orders").select("*").order("created_at", { ascending: false }).limit(100),
    getProducts("en"),
  ]);

  return (
    <>
      <PageHeader title="Orders" intro="Paid orders arrive here from Stripe. Mark them fulfilled once they are posted." />
      <LiveRefresh />
      {!has.stripe && <Notice>Stripe is not connected yet. Orders appear once checkout and the webhook are set up.</Notice>}
      {error && <Notice tone="error">Could not load orders: {error.message}</Notice>}

      {!orders?.length ? (
        <p className="body-6 rounded-md border border-line bg-surface p-6 text-muted">
          No orders yet. Place a test order with card 4242 4242 4242 4242 once Stripe is connected.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((o) => {
            const items = (o.items ?? []) as OrderItem[];
            const ship = (o.shipping ?? {}) as Address;
            const addr = ship.address ?? ship;
            return (
              <li key={o.id} className="flex flex-col gap-4 rounded-md border border-line bg-surface p-4 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-col gap-2">
                  <p className="title-3">
                    {o.name ?? o.email ?? "Customer"}{" "}
                    <span className="caption-5 font-mono text-muted">#{String(o.stripe_session_id).slice(-10).toUpperCase()}</span>
                  </p>
                  <p className="caption-5 font-mono text-muted">
                    {dateFmt.format(new Date(o.created_at))} · {o.email}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {items.map((i, n) => {
                      const product = catalog.find((p) => p.slug === i.slug);
                      return (
                        <li key={n} className="body-6 flex items-center gap-3">
                          <span className="h-14 w-10 shrink-0 overflow-hidden rounded-sm bg-surface-2">
                            {product && (
                              <ProductPicture product={product} idPrefix={`order-${o.id}-${n}`} sizes="40px" className="h-full w-full" />
                            )}
                          </span>
                          <span>
                            {i.qty} × {i.name} <span className="text-muted">size {i.size}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  {addr?.line1 && (
                    <p className="caption-2 text-muted">
                      {[addr.line1, addr.city, addr.postal_code, addr.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 md:flex-col md:items-end">
                  <span className="title-2 font-mono tabular-nums">{formatPrice(o.amount_total_cents / 100)}</span>
                  <form action={setOrderStatus} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={o.id} />
                    <label htmlFor={`status-${o.id}`} className="sr-only">
                      Order status
                    </label>
                    <select
                      id={`status-${o.id}`}
                      name="status"
                      defaultValue={o.status}
                      className="caption-1 rounded-sm border border-line bg-surface px-2 py-1"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn-secondary button-sm px-3 py-1">
                      Update
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
