import { Resend } from "resend";
import { site } from "@/data/site";
import { env, has } from "@/lib/env";
import { formatPrice } from "@/lib/format";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

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
  <span style="display:inline-block;background:#141414;color:#f3efe6;padding:8px 16px;font-size:14px;letter-spacing:2px;font-weight:600;border:2px dashed #d68a2e;outline:4px solid #141414;">${esc(site.brand.toUpperCase().replace("I", "İ"))}</span>
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

/** Customer facing email text in both shop languages. */
const copy = {
  en: {
    listFooter: (url: string) =>
      `You are receiving this because you joined the ${esc(site.brand)} list. <a href="${url}" style="color:#23366e;">Unsubscribe</a>.`,
    welcomeSubject: `Welcome to ${site.brand}`,
    welcomeTitle: "You are on the list",
    welcomeBody:
      "Thanks for joining. We will write when the next lot comes off the cutting table, and not much more often than that.\n\nEvery piece is cut in small numbered runs, so the list hears first.",
    shopCta: "SHOP THE DENIM",
    orderSubject: `Your ${site.brand} order is confirmed`,
    orderTitle: "Thank you, your order is in",
    orderBody: `We have your order and will pack it in the studio. You will get another email with tracking when it leaves, within ${site.shippingDays}.`,
    size: "Size",
    qty: "Qty",
    total: "Total",
    reference: "Reference",
    orderFooter: `Questions about your order? Reply to this email. Free returns within ${esc(site.returnWindow)}.`,
  },
  bg: {
    listFooter: (url: string) =>
      `Получаваш този имейл, защото се абонира за бюлетина на ${esc(site.brand)}. <a href="${url}" style="color:#23366e;">Отписване</a>.`,
    welcomeSubject: `Добре дошъл в ${site.brand}`,
    welcomeTitle: "Вече си в списъка",
    welcomeBody:
      "Благодарим, че се присъедини. Ще пишем, когато следващият лот слезе от кроячната маса, и не много по-често от това.\n\nВсеки модел се крои в малки номерирани серии, затова списъкът научава първи.",
    shopCta: "РАЗГЛЕДАЙ ДЕНИМА",
    orderSubject: `Поръчката ти от ${site.brand} е потвърдена`,
    orderTitle: "Благодарим, поръчката ти е приета",
    orderBody: `Получихме поръчката ти и ще я опаковаме в ателието. Ще получиш още един имейл с номер за проследяване, когато тръгне, до ${site.shippingDays}.`,
    size: "Размер",
    qty: "Брой",
    total: "Общо",
    reference: "Номер",
    orderFooter: `Въпроси за поръчката? Отговори на този имейл. Безплатно връщане до ${esc(site.returnWindow)}.`,
  },
};

const copyFor = (locale: unknown) => copy[isLocale(locale) ? locale : defaultLocale];

function newsletterFooter(token: string, locale: Locale = defaultLocale) {
  return copy[locale].listFooter(unsubscribeUrl(token));
}

export async function sendWelcome(to: string, token: string, locale: Locale = defaultLocale) {
  const r = resend();
  if (!r) return { skipped: true as const };
  const c = copy[locale];
  const body = `<h1 style="margin:0 0 16px;font-size:24px;line-height:32px;">${c.welcomeTitle}</h1>
${textToHtml(c.welcomeBody)}
<a href="${env.siteUrl}/shop" style="display:inline-block;background:#141414;color:#f3efe6;padding:8px 16px;text-decoration:none;font-weight:600;letter-spacing:1px;border:2px dashed #d68a2e;outline:3px solid #141414;">${c.shopCta}</a>`;
  return r.emails.send({
    from: env.emailFrom,
    to,
    subject: c.welcomeSubject,
    html: layout(body, newsletterFooter(token, locale)),
    headers: { "List-Unsubscribe": unsubscribeHeader(token), "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  });
}

export type OrderEmailItem = { name: string; size: string; qty: number; unitAmount: number; image?: string | null };

export async function sendOrderConfirmation(
  to: string,
  order: { reference: string; items: OrderEmailItem[]; total: number },
  locale?: unknown,
) {
  const r = resend();
  if (!r) return { skipped: true as const };
  const c = copyFor(locale);
  const rows = order.items
    .map(
      (i) => `<tr><td width="64" style="padding:8px 12px 8px 0;border-bottom:1px dashed #d6cdb9;">${
        i.image
          ? `<img src="${esc(i.image)}" width="56" height="75" alt="${esc(i.name)}" style="display:block;width:56px;height:75px;object-fit:cover;border:1px solid #d6cdb9;background:#ebe5d8;" />`
          : ""
      }</td>
<td style="padding:8px 0;border-bottom:1px dashed #d6cdb9;">${esc(i.name)}<br/><span style="color:#5c6070;font-size:12px;">${c.size} ${esc(i.size)} · ${c.qty} ${i.qty}</span></td>
<td align="right" style="padding:8px 0;border-bottom:1px dashed #d6cdb9;font-family:monospace;">${formatPrice(i.unitAmount * i.qty)}</td></tr>`,
    )
    .join("");
  const body = `<h1 style="margin:0 0 16px;font-size:24px;line-height:32px;">${c.orderTitle}</h1>
${textToHtml(c.orderBody)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:20px;">${rows}
<tr><td colspan="2" style="padding:12px 0;font-weight:600;">${c.total}</td><td align="right" style="padding:12px 0;font-weight:600;font-family:monospace;">${formatPrice(order.total)}</td></tr></table>
<p style="margin:16px 0 0;font-size:12px;color:#5c6070;font-family:monospace;">${c.reference} ${esc(order.reference)}</p>`;
  return r.emails.send({
    from: env.emailFrom,
    to,
    subject: c.orderSubject,
    html: layout(body, c.orderFooter),
  });
}

export async function notifyAdminOfOrder(order: { reference: string; email: string; total: number; itemCount: number }) {
  const r = resend();
  // ADMIN_NOTIFY_EMAIL may list several addresses separated by commas
  const recipients = env.adminNotifyEmail.split(",").map((e) => e.trim()).filter(Boolean);
  if (!r || !recipients.length) return { skipped: true as const };
  const html = layout(
    textToHtml(`${order.itemCount} piece(s), ${formatPrice(order.total)}.\n\nReference ${order.reference}.\n\nOpen the admin to pack it: ${env.siteUrl}/admin/orders`),
    "Sent to the shop team only.",
  );
  // One send per person, so an address Resend refuses does not block the others
  return Promise.all(
    recipients.map((to) =>
      r.emails.send({ from: env.emailFrom, to, subject: `New order: ${formatPrice(order.total)} from ${order.email}`, html }),
    ),
  );
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
