import type { Metadata } from "next";
import { getAdmin } from "@/lib/admin";
import { mediaUrl } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { SiteImageForm } from "./site-image-form";

export const metadata: Metadata = { title: "Site pictures" };

export default async function SiteImages() {
  const result = await getAdmin();
  if (result.status !== "ok") return null;
  const { data } = await result.admin.db.from("site_images").select("key, label, path, alt, updated_at").order("key");

  return (
    <>
      <PageHeader
        title="Site pictures"
        intro="Named pictures used around the shop. Leave a slot empty to keep the engraved illustration."
      />
      {data?.length ? (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {data.map((img) => (
            <li key={img.key}>
              <SiteImageForm slot={{ key: img.key, label: img.label, alt: img.alt, url: mediaUrl(img.path) }} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="body-6 rounded-md border border-line bg-surface p-6 text-muted">
          No picture slots yet. Run supabase/seed.sql to create the hero, campaign and sharing slots.
        </p>
      )}
    </>
  );
}
