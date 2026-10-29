import Link from "next/link";
import { headers } from "next/headers";
import TopBar from "@/components/TopBar";
import { requireAdmin } from "@/lib/auth";
import { fill, getI18n, type Dict } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { firstDayOf, monthLabel, nextMonthStart, recentMonths } from "@/lib/months";
import { markMonthPaid, regenerateInvite } from "./actions";
import InviteLink from "./InviteLink";
import CheckinEditor, { CHECKIN_COLUMNS, type Checkin } from "./CheckinEditor";

type Props = { searchParams: Promise<{ month?: string; error?: string }> };

export default async function AdminHome({ searchParams }: Props) {
  const me = await requireAdmin();
  const { t, locale } = await getI18n();
  const months = recentMonths(12);
  const { month: requested, error } = await searchParams;
  const month = requested && months.includes(requested) ? requested : months[0];

  const supabase = await createClient();
  const [{ data: business }, { data: profiles }, { data: pending }, { data: monthRows }] = await Promise.all([
    supabase.from("businesses").select("name, invite_code").eq("id", me.business_id!).single(),
    supabase.from("profiles").select("id, full_name, role").order("full_name"),
    supabase
      .from("checkins")
      .select(CHECKIN_COLUMNS)
      .eq("status", "pending")
      .order("checked_in_at"),
    supabase
      .from("checkins")
      .select("worker_id, status, multiplier, paid, place")
      .gte("work_date", firstDayOf(month))
      .lt("work_date", nextMonthStart(month)),
  ]);

  const names = new Map((profiles ?? []).map((p) => [p.id, p.full_name || t.noName]));
  const rows = monthRows ?? [];

  const overview = (profiles ?? [])
    .filter((p) => p.role === "worker")
    .map((p) => {
      const mine = rows.filter((r) => r.worker_id === p.id);
      const approved = mine.filter((r) => r.status === "approved");
      const days = approved.reduce((sum, r) => sum + Number(r.multiplier), 0);
      const unpaid = approved.filter((r) => !r.paid).length;
      const waiting = mine.filter((r) => r.status === "pending").length;
      const places = [...new Set(approved.map((r) => r.place).filter(Boolean))];
      return { id: p.id, name: p.full_name || t.noName, days, unpaid, waiting, places, approved: approved.length };
    });

  const host = (await headers()).get("host") ?? "";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const inviteUrl = business ? `${protocol}://${host}/join/${business.invite_code}` : "";
  const businessName = business?.name ?? "";

  const totalDays = overview.reduce((sum, w) => sum + w.days, 0);
  const unpaidWorkers = overview.filter((w) => w.unpaid > 0).length;
  const pendingList = (pending ?? []) as Checkin[];

  return (
    <>
      <TopBar name={me.full_name} role={me.role} business={me.business_name} />
      <main>
        {error && (
          <p className="alert alert-error">
            {t.couldNotSave} {error in t ? t[error as keyof Dict] : error}
          </p>
        )}

        <div className="stats">
          <div className="card stat">
            <p className="stat-label">{t.waitingForApproval}</p>
            <p className="stat-value">{pendingList.length}</p>
          </div>
          <div className="card stat">
            <p className="stat-label">{t.workers}</p>
            <p className="stat-value">{overview.length}</p>
          </div>
          <div className="card stat">
            <p className="stat-label">{fill(t.daysIn, { month: monthLabel(month, locale, false) })}</p>
            <p className="stat-value">{totalDays}</p>
          </div>
          <div className="card stat">
            <p className="stat-label">{t.workersToPay}</p>
            <p className="stat-value">{unpaidWorkers}</p>
          </div>
        </div>

        <section className="stack">
          <h2>{t.waitingForApproval}</h2>
          {pendingList.length === 0 && (
            <div className="card empty">{t.allCaughtUp}</div>
          )}
          {pendingList.map((c) => (
            <CheckinEditor key={c.id} checkin={c} workerName={names.get(c.worker_id)} t={t} locale={locale} />
          ))}
        </section>

        <section className="card stack">
          <div className="row between">
            <h2>{t.allWorkers}</h2>
            <form className="row">
              <select name="month" defaultValue={month} aria-label={t.month}>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {monthLabel(m, locale)}
                  </option>
                ))}
              </select>
              <button className="secondary">{t.show}</button>
            </form>
          </div>
          {overview.length === 0 ? (
            <p className="muted">{t.noWorkers}</p>
          ) : (
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>{t.worker}</th>
                    <th className="num">{t.days}</th>
                    <th>{t.where}</th>
                    <th>{t.paid}</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.map((w) => (
                    <tr key={w.id}>
                      <td>
                        <Link className="worker-link" href={`/admin/workers/${w.id}?month=${month}`}>
                          <span className="avatar small" aria-hidden="true">
                            {w.name.charAt(0).toUpperCase()}
                          </span>
                          {w.name}
                        </Link>
                        {w.waiting > 0 && <span className="pill pill-warn">{fill(t.waitingCount, { n: w.waiting })}</span>}
                      </td>
                      <td className="num strong">{w.days}</td>
                      <td className="muted">{w.places.join(", ") || "-"}</td>
                      <td>
                        {w.approved === 0 ? (
                          <span className="muted">-</span>
                        ) : w.unpaid === 0 ? (
                          <span className="pill pill-ok">{t.paid}</span>
                        ) : (
                          <form action={markMonthPaid}>
                            <input type="hidden" name="worker_id" value={w.id} />
                            <input type="hidden" name="month" value={month} />
                            <button className="small">{t.markPaid}</button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <details className="card invite" open={overview.length === 0}>
          <summary>
            <h2>{t.inviteWorkers}</h2>
          </summary>
          <div className="stack">
            <p className="muted">{fill(t.inviteText, { business: businessName })}</p>
            <InviteLink
              link={inviteUrl}
              text={{
                copyLink: t.copyLink,
                copied: t.copied,
                shareWhatsApp: t.shareWhatsApp,
                whatsappMessage: fill(t.whatsappMessage, { business: businessName, link: inviteUrl }),
              }}
            />
            <form action={regenerateInvite} className="row">
              <button className="link small">{t.newLink}</button>
              <span className="muted small">{t.newLinkHint}</span>
            </form>
          </div>
        </details>
      </main>
    </>
  );
}
