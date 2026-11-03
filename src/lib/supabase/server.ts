import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env, has } from "@/lib/env";

/** Anonymous client for public storefront reads. Cookie free, so pages can stay static. */
export function publicClient() {
  if (!has.supabase) return null;
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Client acting as the signed in user (admin pages and server actions). */
export async function userClient() {
  if (!has.supabase) return null;
  const store = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a server component: the middleware refreshes cookies instead
        }
      },
    },
  });
}

/**
 * Service role client. Bypasses row level security, so only use it in server
 * code for writes the public cannot make directly (subscriptions, orders).
 */
export function serviceClient() {
  if (!has.supabaseAdmin) return null;
  return createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function mediaUrl(path: string | null | undefined) {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${env.supabaseUrl}/storage/v1/object/public/media/${path}`;
}
