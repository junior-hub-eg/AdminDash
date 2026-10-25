"use client";

import type { AdminTrack } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { Section } from "../mentor-detail/parts";

const COLORS = ["#06b6d4", "#12939b", "#12676b", "#1a2b57", "#7fddc9", "#b8c4d0"];

export function EnrollmentRatioCard({ tracks, total }: { tracks: AdminTrack[]; total: number }) {
  const t = useT();
  const r = 40;
  const len = 2 * Math.PI * r;
  const frac = (n: number) => (total > 0 ? n / total : 0);
  const parts = tracks.map((tr, i) => {
    const before = tracks.slice(0, i).reduce((a, x) => a + frac(x.students), 0);
    return { tr, color: COLORS[i % COLORS.length], dash: frac(tr.students) * len, offset: -before * len, pct: Math.round(frac(tr.students) * 100) };
  });

  return (
    <Section title={t("Enrollment Ratio")}>
      <div className="relative mx-auto size-[11em]">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#eef3fa" strokeWidth="10" />
          {parts.map((p) => (
            <circle key={p.tr.id} cx="50" cy="50" r={r} fill="none" stroke={p.color} strokeWidth="10" strokeDasharray={`${p.dash} ${len - p.dash}`} strokeDashoffset={p.offset} />
          ))}
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center">
          <b className="text-[1.5em] text-[#0b1b2b]">{total.toLocaleString()}</b>
          <span className="text-[0.75em] text-[#8a97a6]">{t("Students")}</span>
        </div>
      </div>
      <ul className="mt-[1em] grid gap-[0.5em] text-[0.8em]">
        {parts.map((p) => (
          <li key={p.tr.id} className="flex items-center gap-[0.6em]">
            <span className="size-[0.7em] rounded-full" style={{ background: p.color }} />
            <span className="flex-1 text-[#14365a]">{p.tr.name}</span>
            <b className="text-[#0b1b2b]">{p.tr.students} ({p.pct}%)</b>
          </li>
        ))}
      </ul>
    </Section>
  );
}