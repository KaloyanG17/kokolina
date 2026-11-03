import Link from "next/link";
import { getAdmin } from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import { PageHeader } from "@/components/admin/ui";

export default async function AdminOverview() {
  const result = await getAdmin();
  if (result.status !== "ok") return null;
  const { db } = result.admin;

  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const [products, lowStock, subscribers, orders] = await Promise.all([
    db.from("products").select("id", { count: "exact", head: true }),
    db.from("products").select("id, name, stock").lte("stock", 3).eq("published", true).order("stock").limit(5),
    db.from("subscribers").select("id", { count: "exact", head: true }).eq("status", "subscribed"),
    db.from("orders").select("amount_total_cents, status, created_at").gte("created_at", since),
  ]);

  const paid = (orders.data ?? []).filter((o) => o.status !== "refunded" && o.status !== "cancelled");
  const revenue = paid.reduce((sum, o) => sum + o.amount_total_cents, 0) / 100;
  const toPack = (orders.data ?? []).filter((o) => o.status === "paid").length;

  const stats = [
    { label: "Revenue, last 30 days", value: formatPrice(revenue), href: "/admin/orders" },
    { label: "Orders to pack", value: String(toPack), href: "/admin/orders" },
    { label: "Products", value: String(products.count ?? 0), href: "/admin/products" },
    { label: "Subscribers", value: String(subscribers.count ?? 0), href: "/admin/newsletter" },
  ];

  return (
    <>
      <PageHeader title="Overview" intro="What needs attention in the shop today." />
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label}>
            <Link
              href={s.href}
              className="focus-ring flex h-full flex-col gap-2 rounded-md border border-line bg-surface p-4 transition-colors duration-300 ease-brand hover:border-ink/40"
            >
              <span className="caption-4 text-muted">{s.label}</span>
              <span className="heading-5 font-mono tabular-nums">{s.value}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="low-title" className="flex flex-col gap-4 rounded-md border border-line bg-surface p-6">
        <h2 id="low-title" className="title-2">
          Running low
        </h2>
        {lowStock.data?.length ? (
          <ul className="flex flex-col gap-2">
            {lowStock.data.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4">
                <Link href={`/admin/products/${p.id}`} className="body-5 focus-ring rounded hover:text-ink">
                  {p.name}
                </Link>
                <span className={`caption-3 font-mono ${p.stock === 0 ? "text-danger" : "text-muted"}`}>
                  {p.stock === 0 ? "Sold out" : `${p.stock} left`}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="body-6 text-muted">Every published product has more than 3 in stock.</p>
        )}
      </section>
    </>
  );
}
