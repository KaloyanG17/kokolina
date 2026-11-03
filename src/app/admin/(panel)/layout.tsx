import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin";
import { has } from "@/lib/env";
import { signOut } from "../actions";
import { AdminNav } from "./admin-nav";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const result = await getAdmin();

  if (result.status === "signed-out") redirect("/admin/login");

  if (result.status !== "ok") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="flex max-w-md flex-col gap-4 rounded-md border border-line bg-surface p-8">
          <h1 className="heading-5">
            {result.status === "unconfigured" ? "Connect Supabase first" : "This account is not an admin"}
          </h1>
          <p className="body-6 text-muted">
            {result.status === "unconfigured"
              ? "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY as described in SETUP.md, then reload."
              : `${result.email} is signed in but is not on the admin list. Add it in Supabase: insert into public.admins (email) values ('${result.email}');`}
          </p>
          {result.status === "forbidden" && (
            <form action={signOut}>
              <button type="submit" className="btn-secondary">
                Sign out
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  const services = [
    { name: "Supabase", on: has.supabase && has.supabaseAdmin },
    { name: "Stripe", on: has.stripe },
    { name: "Resend", on: has.resend },
    { name: "Sentry", on: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN) },
    { name: "PostHog", on: Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY) },
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex flex-col gap-6 border border-x-0 border-t-0 border-line bg-surface p-4 md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r md:p-6">
        <div className="flex items-center justify-between gap-2">
          <Link href="/admin" className="label-tag patch title-4 focus-ring">
            &quot;Kokolina&quot;
          </Link>
          <span className="caption-3 font-mono uppercase tracking-widest text-muted">Admin</span>
        </div>
        <AdminNav />
        <div className="mt-auto hidden flex-col gap-4 md:flex">
          <ul className="flex flex-col gap-1" aria-label="Connected services">
            {services.map((s) => (
              <li key={s.name} className="caption-4 flex items-center justify-between font-mono">
                <span className="text-muted">{s.name}</span>
                <span className={s.on ? "text-ink" : "text-muted"}>{s.on ? "connected" : "not set"}</span>
              </li>
            ))}
          </ul>
          <p className="caption-5 truncate text-muted" title={result.admin.email}>
            {result.admin.email}
          </p>
          <div className="flex gap-2">
            <Link href="/" className="btn-secondary button-sm flex-1">
              View shop
            </Link>
            <form action={signOut}>
              <button type="submit" className="btn-secondary button-sm">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main id="main" className="flex-1 px-4 py-8 md:px-12 md:py-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">{children}</div>
      </main>
    </div>
  );
}
