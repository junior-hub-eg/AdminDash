"use client";

import { Star } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { MOCK_MENTOR_FEEDBACK } from "../dashboardMock";
import { Section, SOFT } from "./parts";

export function RecentStudentFeedback({ total }: { total: number }) {
  const t = useT();
  return (
    <Section
      title={t("Recent Student Feedback")}
      sub={t("Verified qualitative testimonials from sprint reviews and 1:1 clinics")}
      action={<button type="button" className="rounded-[0.5em] bg-[#dff3fb] px-[0.9em] py-[0.35em] text-[0.75em] font-semibold text-[#0b6f86]">{t("Read All {total} Reviews", { total })}</button>}
    >
      <div className="grid gap-[1em] md:grid-cols-3">
        {MOCK_MENTOR_FEEDBACK.map((f) => (
          <figure key={f.by} className={`${SOFT} flex flex-col text-[0.8em]`}>
            <div className="flex items-center justify-between">
              <span className="flex">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`size-[1em] ${i < f.stars ? "fill-[#0b6f86] text-[#0b6f86]" : "text-[#c5d0dc]"}`} />)}</span>
              <span className="text-[0.85em] text-[#8a97a6]">{t(f.when)}</span>
            </div>
            <blockquote className="my-[0.8em] flex-1 text-[#14365a]">“{t(f.text)}”</blockquote>
            <figcaption className="text-[0.85em]"><b className="block text-[#0b1b2b]">{f.by}</b><span className="text-[#8a97a6]">{f.squad}</span></figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}