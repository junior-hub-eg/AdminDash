"use client";

import { useState } from "react";
import { Search, Star } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { INPUT } from "../page-parts";
import { MOCK_MENTOR_STUDENTS } from "../dashboardMock";
import { Section } from "./parts";

export function MentoredStudentsRoster({ total }: { total: number }) {
  const t = useT();
  const [q, setQ] = useState("");
  const rows = MOCK_MENTOR_STUDENTS.filter((s) => s.name.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Section
      title={t("Mentored Students Roster")}
      sub={t("Tracking individual student milestones, story points, and 1:1 engagement")}
      action={
        <label className="relative">
          <Search className="pointer-events-none absolute start-[0.8em] top-1/2 size-[1em] -translate-y-1/2 text-[#8a97a6]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Filter student...")} className={`${INPUT} ps-[2.3em]`} />
        </label>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40em] text-start text-[0.8em]">
          <thead>
            <tr className="bg-[#eaf1fd] text-[0.8em] font-bold uppercase text-[#14365a]/70">
              {["Student Profile", "Squad & Level", "Sprint SP", "Attendance", "Rating", "Quick Actions"].map((h) => (
                <th key={h} className="px-[1em] py-[0.8em] text-start">{t(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[#14365a]">
            {rows.map((s) => (
              <tr key={s.email} className="border-b border-[#eef2f6] last:border-0">
                <td className="px-[1em] py-[0.9em]"><b className="block text-[#0b1b2b]">{s.name}</b><span dir="ltr" className="text-[0.85em] text-[#8a97a6]">{s.email}</span></td>
                <td className="px-[1em]"><b className="block">{s.squad}</b><span className="text-[0.85em] text-[#8a97a6]">{s.level}</span></td>
                <td className="px-[1em]">{s.sp} <span className="text-[#12676b]">{s.status}</span></td>
                <td className="px-[1em] font-semibold text-[#12676b]">{s.attendance}</td>
                <td className="px-[1em]">{s.rating === "New" ? s.rating : <span className="inline-flex items-center gap-[0.3em]"><Star className="size-[0.9em] fill-[#f5b72b] text-[#f5b72b]" />{s.rating}</span>}</td>
                <td className="px-[1em]">
                  <span className="inline-flex gap-[0.4em]">
                    <button type="button" className="rounded-[0.4em] bg-[#eaf1fd] px-[0.8em] py-[0.35em] font-semibold text-[#1d6fe0]">{t("Progress")}</button>
                    <button type="button" className="rounded-[0.4em] bg-[#dff3fb] px-[0.8em] py-[0.35em] font-semibold text-[#0b6f86]">{t("Book 1:1")}</button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-[1em] flex justify-between text-[0.75em] text-[#5b6b7c]">
        <span>{t("Showing {n} of {total} active students", { n: rows.length, total })}</span>
        <button type="button" className="font-semibold text-[#0b6f86]">{t("View All {total} Mentored Students", { total })} ›</button>
      </p>
    </Section>
  );
}