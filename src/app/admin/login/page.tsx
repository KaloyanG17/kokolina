import type { Metadata } from "next";
import Link from "next/link";
import { has } from "@/lib/env";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-md border border-line bg-surface p-8">
        <span className="label-tag patch title-4 self-start">&quot;Kokolina&quot;</span>
        <div className="flex flex-col gap-2">
          <h1 className="heading-5">Admin sign in</h1>
          <p className="body-6 text-muted">For the studio team. Products, pictures, orders and the newsletter.</p>
        </div>
        {has.supabase ? (
          <LoginForm next={next ?? "/admin"} />
        ) : (
          <p className="body-6 rounded-sm border border-line bg-surface-2 p-4">
            Supabase is not connected yet. Follow SETUP.md to add the project keys, then reload this page.
          </p>
        )}
        <Link href="/" className="caption-1 focus-ring self-start rounded text-muted hover:text-fg">
          Back to the shop
        </Link>
      </div>
    </main>
  );
}
