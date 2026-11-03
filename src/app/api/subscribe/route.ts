import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  // TODO: send `email` to the mailing list provider (Klaviyo, Mailchimp, Buttondown...).
  console.info("[subscribe] new signup");

  return NextResponse.json({ ok: true });
}
