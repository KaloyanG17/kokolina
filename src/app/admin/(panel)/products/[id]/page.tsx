import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/admin";
import type { ProductRow } from "@/lib/catalog";
import { mediaUrl } from "@/lib/supabase/server";
import { Notice, PageHeader } from "@/components/admin/ui";
import { ProductArt, type GarmentKind, type Wash } from "@/components/product-art";
import { deleteProduct, updateProductImage } from "../../../actions";
import { ProductForm } from "../product-form";
import { ImageUpload } from "./image-upload";

export const metadata: Metadata = { title: "Edit product" };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function EditProduct({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const result = await getAdmin();
  if (result.status !== "ok") return null;
  const { id } = await params;
  const { created } = await searchParams;
  if (!UUID.test(id)) notFound();

  const { db } = result.admin;
  const [{ data: product }, { data: images }] = await Promise.all([
    db.from("products").select("*").eq("id", id).maybeSingle(),
    db.from("product_images").select("id, path, alt, sort").eq("product_id", id).order("sort"),
  ]);
  if (!product) notFound();
  const p = product as ProductRow;

  return (
    <>
      <Link href="/admin/products" className="caption-1 focus-ring self-start rounded text-muted hover:text-fg">
        All products
      </Link>
      <PageHeader title={p.name} intro={`${p.lot} · ${p.category}`}>
        <Link href={`/products/${p.slug}`} className="btn-secondary button-sm" target="_blank">
          View in shop
        </Link>
      </PageHeader>
      {created && <Notice tone="ok">Product created. Add photos below.</Notice>}

      <section aria-labelledby="photos-title" className="flex flex-col gap-4 rounded-md border border-line bg-surface p-6">
        <div className="flex flex-col gap-1">
          <h2 id="photos-title" className="title-2">
            Photos
          </h2>
          <p className="body-6 text-muted">
            The main photo hangs on the hook in the shop, exactly as previewed here. Without photos, the engraved drawing is used.
          </p>
        </div>

        {images?.length ? (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((img, i) => (
              <li key={img.id} className="flex flex-col gap-2 rounded-sm border border-line bg-base p-2">
                <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-surface-2">
                  <ProductArt
                    kind={p.art as GarmentKind}
                    wash={p.wash as Wash}
                    id={`admin-${img.id}`}
                    photo={mediaUrl(img.path)!}
                    label={img.alt || p.name}
                    className="h-full w-full"
                  />
                  {i === 0 && (
                    <span className="caption-3 absolute left-2 top-2 rounded-sm bg-ink-deep px-2 py-1 font-mono uppercase text-cotton">
                      Main
                    </span>
                  )}
                </div>
                <form action={updateProductImage} className="flex gap-1">
                  <input type="hidden" name="id" value={img.id} />
                  <input type="hidden" name="product_id" value={id} />
                  <input type="hidden" name="intent" value="alt" />
                  <label className="sr-only" htmlFor={`alt-${img.id}`}>
                    Description for screen readers
                  </label>
                  <input
                    id={`alt-${img.id}`}
                    name="alt"
                    defaultValue={img.alt}
                    placeholder="Describe the photo"
                    className="caption-2 min-w-0 flex-1 rounded-sm border border-line bg-surface px-2 py-1"
                  />
                  <button type="submit" className="btn-secondary button-sm px-2 py-1">
                    Save
                  </button>
                </form>
                <div className="flex gap-1">
                  {i > 0 && (
                    <form action={updateProductImage} className="flex-1">
                      <input type="hidden" name="id" value={img.id} />
                      <input type="hidden" name="product_id" value={id} />
                      <input type="hidden" name="intent" value="first" />
                      <button type="submit" className="btn-secondary button-sm w-full px-2 py-1">
                        Make main
                      </button>
                    </form>
                  )}
                  <form action={updateProductImage} className="flex-1">
                    <input type="hidden" name="id" value={img.id} />
                    <input type="hidden" name="product_id" value={id} />
                    <input type="hidden" name="intent" value="delete" />
                    <button type="submit" className="btn-secondary button-sm w-full px-2 py-1 text-danger">
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="body-6 rounded-sm border border-dashed border-line p-4 text-muted">No photos yet. The shop shows the {p.art} drawing.</p>
        )}

        <ImageUpload productId={id} />
      </section>

      <ProductForm product={p} />

      <section aria-labelledby="danger-title" className="flex flex-col gap-4 rounded-md border border-danger/40 bg-surface p-6">
        <h2 id="danger-title" className="title-2">
          Delete product
        </h2>
        <p className="body-6 text-muted">Removes the product and its photos. Past orders keep their records. To hide it instead, untick Published.</p>
        <form action={deleteProduct}>
          <input type="hidden" name="id" value={id} />
          <button type="submit" className="btn-secondary text-danger">
            Delete {p.name}
          </button>
        </form>
      </section>
    </>
  );
}
