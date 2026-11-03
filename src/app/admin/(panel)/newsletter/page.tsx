import type { Metadata } from "next";
import { getAdmin } from "@/lib/admin";
import { has } from "@/lib/env";
import { Notice, PageHeader } from "@/components/admin/ui";
import { setSubscriberStatus } from "../../actions";
import { NewsletterForm } from "./newsletter-form";

export const metadata: Metadata = { title: "Newsletter" };

const dateFmt = new Intl.DateTimeFormat("en-IE", { dateStyle: "medium", timeStyle: "short" });

export default async function Newsletter() {
  const result = await getAdmin();
  if (result.status !== "ok") return null;
  const { db, email } = result.admin;

  const [{ count }, { data: subscribers }, { data: history }] = await Promise.all([
    db.from("subscribers").select("id", { count: "exact", head: true }).eq("status", "subscribed"),
    db.from("subscribers").select("id, email, status, source, created_at").order("created_at", { ascending: false }).limit(50),
    db.from("newsletters").select("id, subject, recipient_count, sent_by, sent_at").order("sent_at", { ascending: false }).limit(10),
  ]);

  return (
    <>
      <PageHeader title="Newsletter" intro={`${count ?? 0} people are subscribed. Every email includes their own unsubscribe link.`} />
      {!has.resend && <Notice>Resend is not connected. Add RESEND_API_KEY and EMAIL_FROM to send emails.</Notice>}

      <NewsletterForm subscriberCount={count ?? 0} adminEmail={email} />

      <section aria-labelledby="history-title" className="flex flex-col gap-4 rounded-md border border-line bg-surface p-6">
        <h2 id="history-title" className="title-2">
          Sent
        </h2>
        {history?.length ? (
          <ul className="flex flex-col divide-y divide-line">
            {history.map((n) => (
              <li key={n.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                <span className="body-5">{n.subject}</span>
                <span className="caption-5 font-mono text-muted">
                  {n.recipient_count} recipients · {dateFmt.format(new Date(n.sent_at))}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="body-6 text-muted">Nothing sent yet. Your first newsletter will be listed here.</p>
        )}
      </section>

      <section aria-labelledby="subs-title" className="flex flex-col gap-4 rounded-md border border-line bg-surface p-6">
        <h2 id="subs-title" className="title-2">
          Latest subscribers
        </h2>
        {subscribers?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead className="caption-3 font-mono uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="py-2 pr-4">Email</th>
                  <th scope="col" className="py-2 pr-4">Joined</th>
                  <th scope="col" className="py-2 pr-4">Status</th>
                  <th scope="col" className="py-2"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.id} className="border-t border-line">
                    <td className="body-6 py-2 pr-4">{s.email}</td>
                    <td className="caption-5 py-2 pr-4 font-mono text-muted">{dateFmt.format(new Date(s.created_at))}</td>
                    <td className={`caption-3 py-2 pr-4 font-mono uppercase ${s.status === "subscribed" ? "text-ink" : "text-muted"}`}>{s.status}</td>
                    <td className="py-2 text-right">
                      <form action={setSubscriberStatus}>
                        <input type="hidden" name="id" value={s.id} />
                        <button
                          type="submit"
                          name="status"
                          value={s.status === "subscribed" ? "unsubscribed" : "subscribed"}
                          className="caption-4 focus-ring rounded text-muted underline underline-offset-4 hover:text-fg"
                        >
                          {s.status === "subscribed" ? "Unsubscribe" : "Resubscribe"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="body-6 text-muted">No subscribers yet. Signups from the footer form appear here.</p>
        )}
      </section>
    </>
  );
}
