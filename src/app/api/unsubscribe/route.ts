import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** One click unsubscribe (RFC 8058): mail apps POST here from the List-Unsubscribe header. */
export async function POST(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const db = serviceClient();
  if (!db || !UUID.test(token)) return new NextResponse(null, { status: 400 });
  await db
    .from("subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("unsubscribe_token", token);
  return new NextResponse(null, { status: 200 });
}

/** A person opening the header link in a browser lands on the confirmation page. */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  return NextResponse.redirect(new URL(`/unsubscribe?token=${encodeURIComponent(token)}`, req.url));
}
