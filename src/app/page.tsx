import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { firstDayOf, monthKey, monthLabel, recentMonths, todayISO } from "@/lib/months";
import CheckInButton from "./CheckInButton";
import { signOut } from "./login/actions";

type Row = {
  work_date: string;
  status: "pending" | "approved" | "rejected";
  multiplier: number;
  paid: boolean;
};

export default async function WorkerHome() {
  const profile = await requireProfile();
  if (profile.role === "admin") redirect("/admin");

  const months = recentMonths(3);
  const supabase = await createClient();
  const { data } = await supabase
    .from("checkins")
    .select("work_date, status, multiplier, paid")
    .eq("worker_id", profile.id)
    .gte("work_date", firstDayOf(months[months.length - 1]));
  const rows = (data ?? []) as Row[];

  const today = rows.find((r) => r.work_date === todayISO());

  const summary = months.map((month) => {
    const inMonth = rows.filter((r) => monthKey(r.work_date) === month);
    const approved = inMonth.filter((r) => r.status === "approved");
    const days = approved.reduce((sum, r) => sum + Number(r.multiplier), 0);
    const paidCount = approved.filter((r) => r.paid).length;
    const pending = inMonth.filter((r) => r.status === "pending").length;
    let paid = "Not paid yet";
    if (approved.length === 0) paid = "-";
    else if (paidCount === approved.length) paid = "Paid";
    else if (paidCount > 0) paid = "Partly paid";
    return { month, days, pending, paid };
  });

  return (
    <main className="narrow">
      <header className="topbar">
        <h1>Hi {profile.full_name || "there"}</h1>
        <form action={signOut}>
          <button className="link">Log out</button>
        </form>
      </header>

      <section className="card stack">
        <h2>Today</h2>
        {today ? (
          <p>
            You checked in today.{" "}
            {today.status === "pending" && "Waiting for the admin to approve."}
            {today.status === "approved" && "Approved."}
            {today.status === "rejected" && "The admin did not approve this day."}
          </p>
        ) : (
          <CheckInButton />
        )}
      </section>

      <section className="card">
        <h2>Your days</h2>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Days</th>
              <th>Paid</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((s) => (
              <tr key={s.month}>
                <td>{monthLabel(s.month)}</td>
                <td>
                  {s.days}
                  {s.pending > 0 && <span className="muted"> (+{s.pending} waiting)</span>}
                </td>
                <td>{s.paid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
