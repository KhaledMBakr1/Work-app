import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, PhoneIcon } from "@/components/Icons";
import TopBar from "@/components/TopBar";
import { requireAdmin } from "@/lib/auth";
import { fill, getI18n, type Dict } from "@/lib/i18n";
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
  const { t, locale } = await getI18n();
  const { id } = await params;
  const months = recentMonths(12);
  const { month: requested, error } = await searchParams;
  const month = requested && months.includes(requested) ? requested : months[0];

  const supabase = await createClient();
  const { data: worker } = await supabase
    .from("profiles")
    .select("*")
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

  const name = worker.full_name || t.noName;

  return (
    <>
      <TopBar name={me.full_name} role={me.role} />
      <main>
        <Link className="back-link" href={`/admin?month=${month}`}>
          <ArrowLeftIcon className="flip-rtl" /> {t.allWorkers}
        </Link>

        <section className="card profile">
          <span className="avatar large" aria-hidden="true">
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="profile-info">
            <h1>{name}</h1>
            <p className="muted">
              {worker.role === "admin" ? t.admin : t.worker}
              {worker.phone && (
                <>
                  {" · "}
                  <a href={`tel:${worker.phone}`}>
                    <PhoneIcon /> {worker.phone}
                  </a>
                </>
              )}
            </p>
          </div>
          <div className="profile-days">
            <p className="stat-value">{days}</p>
            <p className="stat-label">{fill(t.daysInMonth, { month: monthLabel(month, locale) })}</p>
          </div>
        </section>

        {error && (
          <p className="alert alert-error">
            {t.couldNotSave} {error in t ? t[error as keyof Dict] : error}
          </p>
        )}

        <div className="row between">
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
          {worker.id !== me.id && (
            <form action={setRole}>
              <input type="hidden" name="id" value={worker.id} />
              <input type="hidden" name="role" value={worker.role === "admin" ? "worker" : "admin"} />
              <button className="link">{worker.role === "admin" ? t.removeAdmin : t.makeAdmin}</button>
            </form>
          )}
        </div>

        <section className="stack">
          {checkins.length === 0 && <div className="card empty">{t.noCheckinsMonth}</div>}
          {checkins.map((c) => (
            <div key={c.id} className="checkin-group">
              <CheckinEditor checkin={c} t={t} locale={locale} />
              {c.status === "approved" && (
                <form action={setPaid} className="paid-bar">
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="paid" value={String(!c.paid)} />
                  <span className={`pill ${c.paid ? "pill-ok" : "pill-warn"}`}>
                    {c.paid ? t.paid : t.notPaid}
                  </span>
                  <button className="small secondary">{c.paid ? t.markUnpaid : t.markPaid}</button>
                </form>
              )}
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
