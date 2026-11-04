"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { categories } from "@/data/products";
import { requireAdmin, type ActionState } from "@/lib/admin";
import { CATALOG_TAG } from "@/lib/catalog";
import { sendNewsletter } from "@/lib/email";
import { has } from "@/lib/env";
import { userClient } from "@/lib/supabase/server";

/** Storefront pages are statically cached; refresh them after any catalogue change. */
function refreshStore() {
  revalidateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function signIn(_: ActionState, form: FormData): Promise<ActionState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/admin");
  if (!email || !password) return { errors: { form: "Enter your email and password." } };

  const db = await userClient();
  if (!db) return { errors: { form: "Supabase is not configured. Add the keys from SETUP.md." } };
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) return { errors: { form: "That email and password do not match an account." } };
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function signOut() {
  const db = await userClient();
  await db?.auth.signOut();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const ProductInput = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  name: z.string().trim().min(2, "Give the product a name.").max(120),
  slug: z.string().trim().max(80).optional(),
  lot: z.string().trim().min(1, "Add a lot number, for example Lot 014.").max(20),
  category: z.enum(categories.filter((c) => c !== "All") as [string, ...string[]]),
  price: z.coerce.number({ message: "Enter a price." }).min(0, "Price cannot be negative.").max(100000),
  stock: z.coerce.number().int("Stock must be a whole number.").min(0, "Stock cannot be negative.").max(100000),
  colour: z.string().trim().max(60),
  fabric: z.string().trim().max(120),
  description: z.string().trim().max(2000),
  fit: z.string().trim().max(500),
  care: z.string().trim().max(500),
  name_bg: z.string().trim().max(120).default(""),
  colour_bg: z.string().trim().max(60).default(""),
  fabric_bg: z.string().trim().max(120).default(""),
  description_bg: z.string().trim().max(2000).default(""),
  fit_bg: z.string().trim().max(500).default(""),
  care_bg: z.string().trim().max(500).default(""),
  sizes: z.string().trim().min(1, "List at least one size."),
  art: z.enum(["jeans", "trucker", "chore", "western", "dress", "skirt", "overalls", "sweat"]),
  wash: z.enum(["raw", "rinse", "light", "ecru"]),
  sort: z.coerce.number().int().default(0),
});

export async function saveProduct(_: ActionState, form: FormData): Promise<ActionState> {
  const { db } = await requireAdmin();
  const parsed = ProductInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { errors, message: "Some fields need attention." };
  }
  const p = parsed.data;
  const slug = slugify(p.slug || p.name);
  if (!slug) return { errors: { slug: "Use letters or numbers in the web address." } };

  const row = {
    slug,
    lot: p.lot,
    name: p.name,
    category: p.category,
    price_cents: Math.round(p.price * 100),
    stock: p.stock,
    colour: p.colour,
    fabric: p.fabric,
    description: p.description,
    fit: p.fit,
    care: p.care,
    name_bg: p.name_bg,
    colour_bg: p.colour_bg,
    fabric_bg: p.fabric_bg,
    description_bg: p.description_bg,
    fit_bg: p.fit_bg,
    care_bg: p.care_bg,
    sizes: p.sizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    art: p.art,
    wash: p.wash,
    sort: p.sort,
    is_new: form.get("is_new") === "on",
    sold_out: form.get("sold_out") === "on",
    published: form.get("published") === "on",
    exclusive: form.get("exclusive") === "on",
  };

  const query = p.id ? db.from("products").update(row).eq("id", p.id) : db.from("products").insert(row);
  const { data, error } = await query.select("id").single();
  if (error) {
    if (error.code === "23505") return { errors: { slug: "Another product already uses this web address." } };
    return { message: `Could not save: ${error.message}` };
  }
  refreshStore();
  revalidatePath("/admin/products");
  if (!p.id) redirect(`/admin/products/${data.id}?created=1`);
  return { ok: true, message: `Saved ${p.name}.` };
}

export async function deleteProduct(form: FormData) {
  const { db } = await requireAdmin();
  const id = String(form.get("id"));
  const { data: images } = await db.from("product_images").select("path").eq("product_id", id);
  if (images?.length) await db.storage.from("media").remove(images.map((i) => i.path));
  await db.from("products").delete().eq("id", id);
  refreshStore();
  redirect("/admin/products?deleted=1");
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGE = 8 * 1024 * 1024;

function checkImage(file: unknown): string | null {
  if (!(file instanceof File) || file.size === 0) return "Choose an image to upload.";
  if (!IMAGE_TYPES.includes(file.type)) return `${file.name} is not a JPEG, PNG, WebP or AVIF image.`;
  if (file.size > MAX_IMAGE) return `${file.name} is over 8 MB. Export it smaller and try again.`;
  return null;
}

export async function uploadProductImages(_: ActionState, form: FormData): Promise<ActionState> {
  const { db } = await requireAdmin();
  const productId = String(form.get("product_id"));
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { errors: { files: "Choose at least one image." } };
  for (const f of files) {
    const problem = checkImage(f);
    if (problem) return { errors: { files: problem } };
  }

  const { data: last } = await db
    .from("product_images")
    .select("sort")
    .eq("product_id", productId)
    .order("sort", { ascending: false })
    .limit(1)
    .maybeSingle();
  let sort = (last?.sort ?? -1) + 1;

  for (const file of files) {
    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const path = `products/${productId}/${randomUUID()}.${ext}`;
    const { error: upErr } = await db.storage.from("media").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
    if (upErr) return { errors: { files: `Upload failed for ${file.name}: ${upErr.message}` } };
    const alt = String(form.get("alt") ?? "").trim();
    await db.from("product_images").insert({ product_id: productId, path, alt, sort: sort++ });
  }
  refreshStore();
  revalidatePath(`/admin/products/${productId}`);
  return { ok: true, message: files.length === 1 ? "Photo added." : `${files.length} photos added.` };
}

export async function updateProductImage(form: FormData) {
  const { db } = await requireAdmin();
  const id = String(form.get("id"));
  const productId = String(form.get("product_id"));
  const intent = String(form.get("intent"));

  if (intent === "delete") {
    const { data } = await db.from("product_images").select("path").eq("id", id).single();
    const { error } = await db.from("product_images").delete().eq("id", id);
    if (error) throw new Error(`Could not delete the photo: ${error.message}`);
    if (data) await db.storage.from("media").remove([data.path]);
  } else if (intent === "first") {
    const { data: imgs } = await db.from("product_images").select("id").eq("product_id", productId).order("sort");
    const ordered = [id, ...(imgs ?? []).map((i) => i.id).filter((x) => x !== id)];
    await Promise.all(ordered.map((imgId, i) => db.from("product_images").update({ sort: i }).eq("id", imgId)));
  } else if (intent === "alt") {
    await db.from("product_images").update({ alt: String(form.get("alt") ?? "").slice(0, 200) }).eq("id", id);
  } else {
    throw new Error(`Unknown photo action: ${intent}`);
  }
  refreshStore();
  revalidatePath(`/admin/products/${productId}`);
}

// ---------------------------------------------------------------------------
// Site pictures
// ---------------------------------------------------------------------------

export async function saveSiteImage(_: ActionState, form: FormData): Promise<ActionState> {
  const { db } = await requireAdmin();
  const key = String(form.get("key"));
  const alt = String(form.get("alt") ?? "").trim().slice(0, 200);
  const file = form.get("file");
  const update: { alt: string; path?: string | null } = { alt };

  if (form.get("intent") === "clear") {
    const { data } = await db.from("site_images").select("path").eq("key", key).single();
    if (data?.path) await db.storage.from("media").remove([data.path]);
    update.path = null;
  } else if (file instanceof File && file.size > 0) {
    const problem = checkImage(file);
    if (problem) return { errors: { file: problem } };
    const { data: current } = await db.from("site_images").select("path").eq("key", key).single();
    const path = `site/${key}-${randomUUID()}.${file.type.split("/")[1].replace("jpeg", "jpg")}`;
    const { error } = await db.storage.from("media").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
    if (error) return { errors: { file: `Upload failed: ${error.message}` } };
    if (current?.path) await db.storage.from("media").remove([current.path]);
    update.path = path;
  }

  const { error } = await db.from("site_images").update(update).eq("key", key);
  if (error) return { message: `Could not save: ${error.message}` };
  refreshStore();
  revalidatePath("/admin/images");
  return { ok: true, message: "Picture saved." };
}

// ---------------------------------------------------------------------------
// Newsletter
// ---------------------------------------------------------------------------

const NewsletterInput = z.object({
  subject: z.string().trim().min(3, "Write a subject line.").max(150),
  body: z.string().trim().min(20, "Write a little more before sending.").max(20000),
});

export async function sendNewsletterAction(_: ActionState, form: FormData): Promise<ActionState> {
  const { db, email } = await requireAdmin();
  if (!has.resend) return { message: "Resend is not configured. Add RESEND_API_KEY and EMAIL_FROM." };

  const parsed = NewsletterInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { errors };
  }
  const { subject, body } = parsed.data;
  const mode = String(form.get("mode"));

  if (mode === "test") {
    const result = await sendNewsletter(`[Test] ${subject}`, body, [{ email, unsubscribe_token: "00000000-0000-0000-0000-000000000000" }]);
    return result.sent
      ? { ok: true, message: `Test sent to ${email}.` }
      : { message: "The test email failed. Check the Resend dashboard for the reason." };
  }

  if (form.get("confirm") !== "on") return { errors: { confirm: "Tick the box to confirm you want to send to everyone." } };

  const { data: recipients, error } = await db
    .from("subscribers")
    .select("email, unsubscribe_token")
    .eq("status", "subscribed");
  if (error) return { message: `Could not load subscribers: ${error.message}` };
  if (!recipients?.length) return { message: "There are no subscribers yet." };

  const result = await sendNewsletter(subject, body, recipients);
  await db.from("newsletters").insert({ subject, body, recipient_count: result.sent, sent_by: email });
  revalidatePath("/admin/newsletter");
  return result.failed
    ? { message: `Sent to ${result.sent}. ${result.failed} failed; check the Resend dashboard.` }
    : { ok: true, message: `Sent to ${result.sent} subscriber${result.sent === 1 ? "" : "s"}.` };
}

export async function setSubscriberStatus(form: FormData) {
  const { db } = await requireAdmin();
  const status = form.get("status") === "subscribed" ? "subscribed" : "unsubscribed";
  await db
    .from("subscribers")
    .update({ status, unsubscribed_at: status === "unsubscribed" ? new Date().toISOString() : null })
    .eq("id", String(form.get("id")));
  revalidatePath("/admin/newsletter");
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export async function setOrderStatus(form: FormData) {
  const { db } = await requireAdmin();
  const status = String(form.get("status"));
  if (!["paid", "fulfilled", "refunded", "cancelled"].includes(status)) return;
  await db.from("orders").update({ status }).eq("id", String(form.get("id")));
  revalidatePath("/admin/orders");
}
