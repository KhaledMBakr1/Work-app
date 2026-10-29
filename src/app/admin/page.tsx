import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { firstDayOf, monthLabel, nextMonthStart, recentMonths } from "@/lib/months";
import { signOut } from "../login/actions";
import { markMonthPaid } from "./actions";
import CheckinEditor, { CHECKIN_COLUMNS, type Checkin } from "./CheckinEditor";

type Props = { searchParams: Promise<{ month?: string; error?: string }> };

export default async function AdminHome({ searchParams }: Props) {
  await requireAdmin();
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

  return (
    <main>
      <header className="topbar">
        <h1>Admin</h1>
        <form action={signOut}>
          <button className="link">Log out</button>
        </form>
      </header>
      {error && <p className="card error">Could not save: {error}</p>}

      <section className="stack">
        <h2>Waiting for approval ({pending?.length ?? 0})</h2>
        {(pending ?? []).length === 0 && <p className="muted">Nothing to approve right now.</p>}
        {(pending as Checkin[] | null)?.map((c) => (
          <CheckinEditor key={c.id} checkin={c} workerName={names.get(c.worker_id)} />
        ))}
      </section>

      <section className="card">
        <div className="row between">
          <h2>All workers</h2>
          <form className="row">
            <select name="month" defaultValue={month}>
              {months.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
            <button className="secondary">Show</button>
          </form>
        </div>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Worker</th>
                <th>Days</th>
                <th>Waiting</th>
                <th>Where</th>
                <th>Paid</th>
              </tr>
            </thead>
            <tbody>
              {overview.map((w) => (
                <tr key={w.id}>
                  <td>
                    <Link href={`/admin/workers/${w.id}?month=${month}`}>{w.name}</Link>
                  </td>
                  <td>{w.days}</td>
                  <td>{w.waiting || ""}</td>
                  <td>{w.places.join(", ")}</td>
                  <td>
                    {w.approved === 0 ? (
                      "-"
                    ) : w.unpaid === 0 ? (
                      "Paid"
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
        {overview.length === 0 && <p className="muted">No workers have signed up yet.</p>}
      </section>
    </main>
  );
}
