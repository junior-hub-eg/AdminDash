"use client";

import { Gauge, TrendingDown, TrendingUp } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";
import { MOCK_APPROVAL_VELOCITY } from "./approvalsMock";

/** TODO(api): all the numbers here come from MOCK_APPROVAL_VELOCITY. */
export default function ResolutionVelocity() {
  const { t } = useI18n();
  const v = MOCK_APPROVAL_VELOCITY;

  const R = 26;
  const C = 2 * Math.PI * R;

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm" aria-labelledby="approval-velocity-title">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="approval-velocity-title" className="flex items-center gap-2 text-[0.95rem] font-bold text-[#0d2a45]">
          <Gauge className="size-4 text-[#0a7f99]" />
          {t("Resolution Velocity")}
        </h2>
        <span className="rounded-md bg-[#e8edf8] px-2.5 py-1 text-[0.66rem] font-semibold text-[#14365a]">
          {t("This Week")}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#eef4fa] p-4">
          <p className="text-[0.64rem] font-semibold uppercase tracking-wide text-[#14365a]/60">{t("Avg Response")}</p>
          <p className="mt-1 text-[1.7rem] font-extrabold leading-none text-[#0d2a45]">{v.avgResponse}</p>
          <p className="mt-2 flex items-center gap-1 text-[0.68rem] text-[#12676b]">
            <TrendingDown className="size-3.5" />
            {v.avgDelta}
          </p>
        </div>

        <div className="rounded-2xl bg-[#eef4fa] p-4">
          <p className="text-[0.64rem] font-semibold uppercase tracking-wide text-[#14365a]/60">{t("SLA Compliance")}</p>
          <p className="mt-1 text-[1.7rem] font-extrabold leading-none text-[#12676b]">{v.sla}</p>
          <p className="mt-2 flex items-center gap-1 text-[0.68rem] text-[#12676b]">
            <TrendingUp className="size-3.5" />
            {v.slaDelta}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 rounded-2xl bg-[#eef4fa] p-4">
        <div className="min-w-0">
          <p className="text-[0.78rem] font-bold text-[#0d2a45]">{t("Queue Health Status")}</p>
          <p className="mt-0.5 text-[0.7rem] text-[#14365a]/60">{t(v.healthNote)}</p>
        </div>

        <div className="relative size-16 shrink-0">
          <svg viewBox="0 0 64 64" className="size-full -rotate-90" aria-hidden="true">
            <circle cx="32" cy="32" r={R} fill="none" stroke="#d5e3ee" strokeWidth="6" />
            <circle
              cx="32"
              cy="32"
              r={R}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - v.health / 100)}
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-[0.74rem] font-bold text-[#0d2a45]">
            {v.health}%
          </span>
        </div>
      </div>
    </section>
  );
}