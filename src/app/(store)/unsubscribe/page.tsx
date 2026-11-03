import type { Metadata } from "next";
import Link from "next/link";
import { serviceClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  let outcome: "done" | "invalid" | "unavailable" = "invalid";

  const db = serviceClient();
  if (!db) outcome = "unavailable";
  else if (token && UUID.test(token)) {
    const { data } = await db
      .from("subscribers")
      .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
      .eq("unsubscribe_token", token)
      .select("email")
      .maybeSingle();
    outcome = data ? "done" : "invalid";
  }

  const copy = {
    done: ["You are unsubscribed", "You will not get any more newsletters from us. Order emails still arrive if you buy something."],
    invalid: ["That link did not work", "The unsubscribe link is incomplete or has already been used. Reply to any of our emails and we will remove you by hand."],
    unavailable: ["Unsubscribing is offline", "Try the link again in a few minutes."],
  }[outcome];

  return (
    <section className="px-4 pb-24 pt-24 md:px-8">
      <div className="mx-auto flex max-w-xl flex-col items-start gap-6 pt-16">
        <p className="caption-3 font-mono uppercase tracking-widest text-ink">&quot;Newsletter&quot;</p>
        <h1 className="heading-4 md:heading-3 text-hero-gradient">{copy[0]}</h1>
        <p className="body-3 text-muted">{copy[1]}</p>
        <Link href="/shop" className="btn-primary">
          Back to the shop
        </Link>
      </div>
    </section>
  );
}
