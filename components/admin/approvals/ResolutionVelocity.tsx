"use client";

import { CircleCheck, Gauge, Hourglass } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";
import { ageHours, shortSpan, SLA_HOURS } from "./age";

/**
 * Queue health read from the requests still waiting (no history API exists): average wait,
 * oldest wait, the share decided-in-time candidates (younger than the SLA) and how many are late.
 */
export default function ResolutionVelocity({ created, now, ready }: { created: string[]; now: number; ready: boolean }) {
  const { t } = useI18n();

  const ages = created.map((c) => ageHours(c, now));
  const waiting = ages.length;
  const avg = waiting ? ages.reduce((n, h) => n + h, 0) / waiting : 0;
  const oldest = waiting ? Math.max(...ages) : 0;
  const late = ages.filter((h) => h >= SLA_HOURS).length;
  const within = waiting - late;
  const health = waiting ? Math.round((within / waiting) * 100) : 100;

  const R = 26;
  const C = 2 * Math.PI * R;
  const show = ready && waiting > 0;

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm" aria-labelledby="approval-velocity-title">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="approval-velocity-title" className="flex items-center gap-2 text-[0.95rem] font-bold text-[#0d2a45]">
          <Gauge className="size-4 text-[#0a7f99]" />
          {t("Resolution Velocity")}
        </h2>
        <span className="rounded-md bg-[#e8edf8] px-2.5 py-1 text-[0.66rem] font-semibold text-[#14365a]">
          {t("{count} waiting", { count: ready ? waiting : "—" })}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0 rounded-2xl bg-[#eef4fa] p-4">
          <p className="text-[0.64rem] font-semibold uppercase tracking-wide text-[#14365a]/60">{t("Avg Wait")}</p>
          <p dir="ltr" className="mt-1 text-[1.7rem] font-extrabold leading-none text-[#0d2a45] rtl:text-end">
            {show ? shortSpan(avg) : "—"}
          </p>
          <p className="mt-2 flex items-start gap-1 text-[0.68rem] text-[#12676b]">
            <Hourglass className="mt-px size-3.5 shrink-0" />
            {show ? t("Oldest: {time}", { time: shortSpan(oldest) }) : t("No requests waiting")}
          </p>
        </div>

        <div className="min-w-0 rounded-2xl bg-[#eef4fa] p-4">
          <p className="text-[0.64rem] font-semibold uppercase tracking-wide text-[#14365a]/60">{t("SLA Compliance")}</p>
          <p dir="ltr" className={`mt-1 text-[1.7rem] font-extrabold leading-none rtl:text-end ${late ? "text-[#c0263f]" : "text-[#12676b]"}`}>
            {show ? `${health}%` : "—"}
          </p>
          <p className="mt-2 flex items-start gap-1 text-[0.68rem] text-[#12676b]">
            <CircleCheck className="mt-px size-3.5 shrink-0" />
            {show ? t("{count} older than {hours}h", { count: late, hours: SLA_HOURS }) : t("Under {hours}h target", { hours: SLA_HOURS })}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 rounded-2xl bg-[#eef4fa] p-4">
        <div className="min-w-0">
          <p className="text-[0.78rem] font-bold text-[#0d2a45]">{t("Queue Health Status")}</p>
          <p className="mt-0.5 text-[0.7rem] text-[#14365a]/60">
            {ready
              ? t("{within} of {total} within the {hours}h SLA", { within, total: waiting, hours: SLA_HOURS })
              : t("Loading")}
          </p>
        </div>

        <div className="relative size-16 shrink-0">
          <svg viewBox="0 0 64 64" className="size-full -rotate-90" aria-hidden="true">
            <circle cx="32" cy="32" r={R} fill="none" stroke="#d5e3ee" strokeWidth="6" />
            <circle
              cx="32"
              cy="32"
              r={R}
              fill="none"
              stroke={late ? "#e0a020" : "#06b6d4"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - (ready ? health : 0) / 100)}
            />
          </svg>
          <span dir="ltr" className="absolute inset-0 grid place-items-center text-[0.74rem] font-bold text-[#0d2a45]">
            {ready ? `${health}%` : "—"}
          </span>
        </div>
      </div>
    </section>
  );
}
