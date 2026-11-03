import { redirect } from "next/navigation";
import { has } from "@/lib/env";
import { userClient } from "@/lib/supabase/server";

export type AdminSession = {
  db: NonNullable<Awaited<ReturnType<typeof userClient>>>;
  email: string;
};

/**
 * Returns the signed in admin, or why there is none. Pages render the
 * reason; server actions use requireAdmin() which throws instead.
 */
export async function getAdmin(): Promise<
  { status: "ok"; admin: AdminSession } | { status: "unconfigured" | "signed-out" | "forbidden"; email?: string }
> {
  if (!has.supabase) return { status: "unconfigured" };
  const db = await userClient();
  if (!db) return { status: "unconfigured" };
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user?.email) return { status: "signed-out" };
  const { data: isAdmin } = await db.rpc("is_admin");
  if (!isAdmin) return { status: "forbidden", email: user.email };
  return { status: "ok", admin: { db, email: user.email } };
}

/** For server actions: the admin, or a redirect to the login page. */
export async function requireAdmin(): Promise<AdminSession> {
  const result = await getAdmin();
  if (result.status === "ok") return result.admin;
  if (result.status === "signed-out") redirect("/admin/login");
  throw new Error(result.status === "forbidden" ? "This account is not an admin." : "Supabase is not configured.");
}

export type ActionState = { ok?: boolean; message?: string; errors?: Record<string, string> };
