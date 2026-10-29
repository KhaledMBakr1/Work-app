import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { firstDayOf, monthKey, monthLabel, recentMonths, todayISO } from "@/lib/months";
import TopBar from "@/components/TopBar";
import { CheckIcon, ClockIcon, XIcon } from "@/components/Icons";
import { fill, getI18n, TIME_ZONE } from "@/lib/i18n";
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

  const { t, locale } = await getI18n();
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
    let paid: "none" | "paid" | "partly" | "unpaid" = "unpaid";
    if (approved.length === 0) paid = "none";
    else if (paidCount === approved.length) paid = "paid";
    else if (paidCount > 0) paid = "partly";
    return { month, days, pending, paid };
  });

  const todayLabel = new Date().toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TIME_ZONE,
  });

  return (
    <>
      <TopBar name={profile.full_name} role={profile.role} />
      <main className="narrow">
        <section className="card today stack">
          <div>
            <p className="eyebrow">{t.today}</p>
            <h1>{todayLabel}</h1>
          </div>
          {today ? (
            <div className={`status-panel ${today.status}`}>
              {today.status === "pending" && <ClockIcon />}
              {today.status === "approved" && <CheckIcon />}
              {today.status === "rejected" && <XIcon />}
              <div>
                <strong>
                  {today.status === "pending" && t.pendingTitle}
                  {today.status === "approved" && t.approvedTitle}
                  {today.status === "rejected" && t.rejectedTitle}
                </strong>
                <p>
                  {today.status === "pending" && t.pendingText}
                  {today.status === "approved" && t.approvedText}
                  {today.status === "rejected" && t.rejectedText}
                </p>
              </div>
            </div>
          ) : (
            <CheckInButton
              text={{
                noGeolocation: t.noGeolocation,
                allowLocation: t.allowLocation,
                gettingLocation: t.gettingLocation,
                arrived: t.arrived,
                locationSaved: t.locationSaved,
                alreadyCheckedIn: t.alreadyCheckedIn,
              }}
            />
          )}
        </section>

        <section className="stack">
          <h2>{t.yourDays}</h2>
          <div className="month-list">
            {summary.map((s, i) => (
              <div key={s.month} className={`card month ${i === 0 ? "current" : ""}`}>
                <div>
                  <p className="month-name">{monthLabel(s.month, locale)}</p>
                  {s.pending > 0 && (
                    <p className="muted small">{fill(t.waitingForApprovalCount, { n: s.pending })}</p>
                  )}
                </div>
                <div className="month-right">
                  <p className="month-days">
                    {s.days}
                    <span>{s.days === 1 ? t.day : t.days}</span>
                  </p>
                  {s.paid !== "none" && (
                    <span className={`pill ${s.paid === "paid" ? "pill-ok" : "pill-warn"}`}>
                      {s.paid === "paid" ? t.paid : s.paid === "partly" ? t.partlyPaid : t.notPaidYet}
                    </span>
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
