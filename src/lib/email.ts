import { Resend } from "resend";
import { site } from "@/data/site";
import { env, has } from "@/lib/env";
import { formatPrice } from "@/lib/format";

/**
 * Transactional and newsletter email through Resend. Every send is a no-op
 * returning { skipped: true } until RESEND_API_KEY and EMAIL_FROM are set.
 */

let client: Resend | null = null;
function resend() {
  if (!has.resend) return null;
  client ??= new Resend(env.resendApiKey);
  return client;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Turns plain text with blank line paragraphs into safe HTML paragraphs. */
export function textToHtml(text: string) {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:24px;">${esc(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

/** Shared layout: cotton paper, a black woven label wordmark and a copper stitch rule. */
function layout(body: string, footer: string) {
  return `<!doctype html><html><body style="margin:0;background:#f3efe6;color:#141b2e;font-family:Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3efe6;padding:32px 16px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#faf7f0;border:1px solid #d6cdb9;">
<tr><td style="padding:24px 24px 0;">
  <span style="display:inline-block;background:#141414;color:#f3efe6;padding:8px 16px;font-size:14px;letter-spacing:2px;font-weight:600;border-left:2px dashed #d68a2e;border-right:2px dashed #d68a2e;">&quot;${esc(site.brand.toUpperCase())}&quot;</span>
</td></tr>
<tr><td style="padding:24px;">${body}</td></tr>
<tr><td style="padding:0 24px;"><div style="border-top:2px dashed #d68a2e;"></div></td></tr>
<tr><td style="padding:16px 24px 24px;font-size:12px;line-height:16px;color:#5c6070;">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

function unsubscribeUrl(token: string) {
  return `${env.siteUrl}/unsubscribe?token=${encodeURIComponent(token)}`;
}

/** Target of the List-Unsubscribe header; accepts the one click POST. */
function unsubscribeHeader(token: string) {
  return `<${env.siteUrl}/api/unsubscribe?token=${encodeURIComponent(token)}>`;
}

function newsletterFooter(token: string) {
  return `You are receiving this because you joined the ${esc(site.brand)} list. <a href="${unsubscribeUrl(token)}" style="color:#23366e;">Unsubscribe</a>.`;
}

export async function sendWelcome(to: string, token: string) {
  const r = resend();
  if (!r) return { skipped: true as const };
  const body = `<h1 style="margin:0 0 16px;font-size:24px;line-height:32px;">You are on the list</h1>
${textToHtml(`Thanks for joining. We will write when the next lot comes off the cutting table, and not much more often than that.\n\nEvery piece is cut in small numbered runs, so the list hears first.`)}
<a href="${env.siteUrl}/shop" style="display:inline-block;background:#141414;color:#f3efe6;padding:8px 16px;text-decoration:none;font-weight:600;letter-spacing:1px;">&quot;SHOP THE DENIM&quot;</a>`;
  return r.emails.send({
    from: env.emailFrom,
    to,
    subject: `Welcome to ${site.brand}`,
    html: layout(body, newsletterFooter(token)),
    headers: { "List-Unsubscribe": unsubscribeHeader(token), "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  });
}

export type OrderEmailItem = { name: string; size: string; qty: number; unitAmount: number };

export async function sendOrderConfirmation(to: string, order: { reference: string; items: OrderEmailItem[]; total: number }) {
  const r = resend();
  if (!r) return { skipped: true as const };
  const rows = order.items
    .map(
      (i) => `<tr><td style="padding:8px 0;border-bottom:1px dashed #d6cdb9;">${esc(i.name)}<br/><span style="color:#5c6070;font-size:12px;">Size ${esc(i.size)} · Qty ${i.qty}</span></td>
<td align="right" style="padding:8px 0;border-bottom:1px dashed #d6cdb9;font-family:monospace;">${formatPrice(i.unitAmount * i.qty)}</td></tr>`,
    )
    .join("");
  const body = `<h1 style="margin:0 0 16px;font-size:24px;line-height:32px;">Thank you, your order is in</h1>
${textToHtml(`We have your order and will pack it in the studio. You will get another email with tracking when it leaves, within ${site.shippingDays}.`)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:20px;">${rows}
<tr><td style="padding:12px 0;font-weight:600;">Total</td><td align="right" style="padding:12px 0;font-weight:600;font-family:monospace;">${formatPrice(order.total)}</td></tr></table>
<p style="margin:16px 0 0;font-size:12px;color:#5c6070;font-family:monospace;">Reference ${esc(order.reference)}</p>`;
  return r.emails.send({
    from: env.emailFrom,
    to,
    subject: `Your ${site.brand} order is confirmed`,
    html: layout(body, `Questions about your order? Reply to this email. Free returns within ${esc(site.returnWindow)}.`),
  });
}

export async function notifyAdminOfOrder(order: { reference: string; email: string; total: number; itemCount: number }) {
  const r = resend();
  if (!r || !env.adminNotifyEmail) return { skipped: true as const };
  return r.emails.send({
    from: env.emailFrom,
    to: env.adminNotifyEmail,
    subject: `New order: ${formatPrice(order.total)} from ${order.email}`,
    html: layout(
      textToHtml(`${order.itemCount} piece(s), ${formatPrice(order.total)}.\n\nReference ${order.reference}.\n\nOpen the admin to pack it: ${env.siteUrl}/admin/orders`),
      "Sent to the shop owner only.",
    ),
  });
}

/**
 * Sends one newsletter to many subscribers, 100 per Resend batch call.
 * Each recipient gets their own unsubscribe link.
 */
export async function sendNewsletter(
  subject: string,
  text: string,
  recipients: { email: string; unsubscribe_token: string }[],
) {
  const r = resend();
  if (!r) return { sent: 0, failed: recipients.length, skipped: true };
  const html = textToHtml(text);
  let sent = 0;
  let failed = 0;
  for (let i = 0; i < recipients.length; i += 100) {
    const chunk = recipients.slice(i, i + 100);
    const { error } = await r.batch.send(
      chunk.map((s) => ({
        from: env.emailFrom,
        to: s.email,
        subject,
        html: layout(html, newsletterFooter(s.unsubscribe_token)),
        headers: {
          "List-Unsubscribe": unsubscribeHeader(s.unsubscribe_token),
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      })),
    );
    if (error) failed += chunk.length;
    else sent += chunk.length;
  }
  return { sent, failed, skipped: false };
}
