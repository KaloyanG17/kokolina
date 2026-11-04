import { NextResponse } from "next/server";
import { z } from "zod";
import { sendWelcome } from "@/lib/email";
import { getLocale } from "@/i18n/server";
import { serviceClient } from "@/lib/supabase/server";

const Body = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  source: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }
  const { email, source = "footer" } = parsed.data;

  const db = serviceClient();
  if (!db) {
    return NextResponse.json({ error: "Signups are not open yet. Try again soon." }, { status: 503 });
  }

  const { data: existing } = await db
    .from("subscribers")
    .select("status, unsubscribe_token")
    .eq("email", email)
    .maybeSingle();

  // Already subscribed: succeed quietly without sending another welcome
  if (existing?.status === "subscribed") return NextResponse.json({ ok: true });

  const { data, error } = await db
    .from("subscribers")
    .upsert({ email, source, status: "subscribed", unsubscribed_at: null }, { onConflict: "email" })
    .select("unsubscribe_token")
    .single();

  if (error || !data) {
    console.error("[subscribe]", error?.message);
    return NextResponse.json({ error: "We could not save your email. Try again in a moment." }, { status: 500 });
  }

  try {
    await sendWelcome(email, data.unsubscribe_token, await getLocale());
  } catch (e) {
    // The signup is saved; a failed welcome email should not fail the request
    console.error("[subscribe] welcome email failed", e);
  }

  return NextResponse.json({ ok: true });
}
