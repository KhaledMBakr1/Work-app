import Link from "next/link";
import TopBar from "@/components/TopBar";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { firstDayOf, monthLabel, nextMonthStart, recentMonths } from "@/lib/months";
import { markMonthPaid } from "./actions";
import CheckinEditor, { CHECKIN_COLUMNS, type Checkin } from "./CheckinEditor";

type Props = { searchParams: Promise<{ month?: string; error?: string }> };

export default async function AdminHome({ searchParams }: Props) {
  const me = await requireAdmin();
  const months = recentMonths(12);
  const { month: requested, error } = await searchParams;
  const month = requested && months.includes(requested) ? requested : months[0];

  const supabase = await createClient();
  const [{ data: profiles }, { data: pending }, { data: monthRows }] = await Promise.all([
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

  const names = new Map((profiles ?? []).map((p) => [p.id, p.full_name || "(no name)"]));
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
      return { id: p.id, name: p.full_name || "(no name)", days, unpaid, waiting, places, approved: approved.length };
    });

  const totalDays = overview.reduce((sum, w) => sum + w.days, 0);
  const unpaidWorkers = overview.filter((w) => w.unpaid > 0).length;
  const pendingList = (pending ?? []) as Checkin[];

  return (
    <>
      <TopBar name={me.full_name} role={me.role} />
      <main>
        {error && <p className="alert alert-error">Could not save: {error}</p>}

        <div className="stats">
          <div className="card stat">
            <p className="stat-label">Waiting for approval</p>
            <p className="stat-value">{pendingList.length}</p>
          </div>
          <div className="card stat">
            <p className="stat-label">Workers</p>
            <p className="stat-value">{overview.length}</p>
          </div>
          <div className="card stat">
            <p className="stat-label">Days in {monthLabel(month).split(" ")[0]}</p>
            <p className="stat-value">{totalDays}</p>
          </div>
          <div className="card stat">
            <p className="stat-label">Workers to pay</p>
            <p className="stat-value">{unpaidWorkers}</p>
          </div>
        </div>

        <section className="stack">
          <h2>Waiting for approval</h2>
          {pendingList.length === 0 && (
            <div className="card empty">All caught up. New check-ins will show up here.</div>
          )}
          {pendingList.map((c) => (
            <CheckinEditor key={c.id} checkin={c} workerName={names.get(c.worker_id)} />
          ))}
        </section>

        <section className="card stack">
          <div className="row between">
            <h2>All workers</h2>
            <form className="row">
              <select name="month" defaultValue={month} aria-label="Month">
                {months.map((m) => (
                  <option key={m} value={m}>
                    {monthLabel(m)}
                  </option>
                ))}
              </select>
              <button className="secondary">Show</button>
            </form>
          </div>
          {overview.length === 0 ? (
            <p className="muted">No workers have signed up yet.</p>
          ) : (
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th className="num">Days</th>
                    <th>Where</th>
                    <th>Paid</th>
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
                        {w.waiting > 0 && <span className="pill pill-warn">{w.waiting} waiting</span>}
                      </td>
                      <td className="num strong">{w.days}</td>
                      <td className="muted">{w.places.join(", ") || "-"}</td>
                      <td>
                        {w.approved === 0 ? (
                          <span className="muted">-</span>
                        ) : w.unpaid === 0 ? (
                          <span className="pill pill-ok">Paid</span>
                        ) : (
                          <form action={markMonthPaid}>
                            <input type="hidden" name="worker_id" value={w.id} />
                            <input type="hidden" name="month" value={month} />
                            <button className="small">Mark paid</button>
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
      </main>
    </>
  );
}
