"use client";

import { CheckCheck, Medal, Timer } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { PANEL } from "../page-parts";
import { MOCK_REVIEW_METRICS } from "../dashboardMock";

const ICONS = [Timer, CheckCheck, Medal];

export function ReviewMetrics() {
  const t = useT();
  return (
    <ul className="grid gap-[1em] md:grid-cols-3">
      {MOCK_REVIEW_METRICS.map((m, i) => {
        const Icon = ICONS[i];
        return (
          <li key={m.label} className={`${PANEL} flex items-center gap-[1em] p-[1.1em]`}>
            <span className="grid size-[3em] shrink-0 place-items-center rounded-[0.8em] bg-[#eef3fa] text-[#14365a]"><Icon className="size-[1.3em]" /></span>
            <div>
              <p className="text-[0.65em] font-bold uppercase text-[#8a97a6]">{t(m.label)}</p>
              <p className="text-[1.3em] font-extrabold text-[#0b1b2b]">{m.value}</p>
              <p className="text-[0.75em] font-medium text-[#12676b]">{t(m.hint)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}