import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { firstDayOf, monthLabel, nextMonthStart, recentMonths } from "@/lib/months";
import { setPaid, setRole } from "../../actions";
import CheckinEditor, { CHECKIN_COLUMNS, type Checkin } from "../../CheckinEditor";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string; error?: string }>;
};

export default async function WorkerDetail({ params, searchParams }: Props) {
  const me = await requireAdmin();
  const { id } = await params;
  const months = recentMonths(12);
  const { month: requested, error } = await searchParams;
  const month = requested && months.includes(requested) ? requested : months[0];

  const supabase = await createClient();
  const { data: worker } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", id)
    .single();
  if (!worker) notFound();

  const { data } = await supabase
    .from("checkins")
    .select(CHECKIN_COLUMNS)
    .eq("worker_id", id)
    .gte("work_date", firstDayOf(month))
    .lt("work_date", nextMonthStart(month))
    .order("work_date");
  const checkins = (data ?? []) as Checkin[];
  const days = checkins
    .filter((c) => c.status === "approved")
    .reduce((sum, c) => sum + Number(c.multiplier), 0);

  return (
    <main>
      <p>
        <Link href={`/admin?month=${month}`}>← All workers</Link>
      </p>
      <header className="topbar">
        <h1>{worker.full_name || "(no name)"}</h1>
        {worker.id !== me.id && (
          <form action={setRole}>
            <input type="hidden" name="id" value={worker.id} />
            <input type="hidden" name="role" value={worker.role === "admin" ? "worker" : "admin"} />
            <button className="link">{worker.role === "admin" ? "Remove admin" : "Make admin"}</button>
          </form>
        )}
      </header>
      {error && <p className="card error">Could not save: {error}</p>}

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

      <p>
        <strong>{days}</strong> approved days in {monthLabel(month)}.
      </p>

      <section className="stack">
        {checkins.length === 0 && <p className="muted">No check-ins this month.</p>}
        {checkins.map((c) => (
          <div key={c.id} className="stack">
            <CheckinEditor checkin={c} />
            {c.status === "approved" && (
              <form action={setPaid} className="row">
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="paid" value={String(!c.paid)} />
                <span>{c.paid ? "Paid" : "Not paid"}</span>
                <button className="small secondary">{c.paid ? "Mark unpaid" : "Mark paid"}</button>
              </form>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
