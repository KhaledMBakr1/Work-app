import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { firstDayOf, monthKey, monthLabel, recentMonths, todayISO } from "@/lib/months";
import TopBar from "@/components/TopBar";
import { CheckIcon, ClockIcon, XIcon } from "@/components/Icons";
import CheckInButton from "./CheckInButton";

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

  const todayLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <TopBar name={profile.full_name} role={profile.role} />
      <main className="narrow">
        <section className="card today stack">
          <div>
            <p className="eyebrow">Today</p>
            <h1>{todayLabel}</h1>
          </div>
          {today ? (
            <div className={`status-panel ${today.status}`}>
              {today.status === "pending" && <ClockIcon />}
              {today.status === "approved" && <CheckIcon />}
              {today.status === "rejected" && <XIcon />}
              <div>
                <strong>
                  {today.status === "pending" && "Checked in, waiting for approval"}
                  {today.status === "approved" && "Approved"}
                  {today.status === "rejected" && "Not approved"}
                </strong>
                <p>
                  {today.status === "pending" && "Your admin will confirm this day soon."}
                  {today.status === "approved" && "This day is counted in your total."}
                  {today.status === "rejected" && "Talk to your admin if this is a mistake."}
                </p>
              </div>
            </div>
          ) : (
            <CheckInButton />
          )}
        </section>

        <section className="stack">
          <h2>Your days</h2>
          <div className="month-list">
            {summary.map((s, i) => (
              <div key={s.month} className={`card month ${i === 0 ? "current" : ""}`}>
                <div>
                  <p className="month-name">{monthLabel(s.month)}</p>
                  {s.pending > 0 && <p className="muted small">{s.pending} waiting for approval</p>}
                </div>
                <div className="month-right">
                  <p className="month-days">
                    {s.days}
                    <span>{s.days === 1 ? "day" : "days"}</span>
                  </p>
                  {s.paid !== "-" && (
                    <span className={`pill ${s.paid === "Paid" ? "pill-ok" : "pill-warn"}`}>{s.paid}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
