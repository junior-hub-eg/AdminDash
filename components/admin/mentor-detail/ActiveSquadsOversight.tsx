"use client";

import { ExternalLink } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { BTN_SECONDARY } from "../page-parts";
import { MOCK_MENTOR_SQUADS } from "../dashboardMock";
import { Bar, Section, SOFT } from "./parts";

export function ActiveSquadsOversight() {
  const t = useT();
  return (
    <Section title={t("Active Squads Oversight")} sub={t("Currently mentoring {count} active student project capstone squads", { count: MOCK_MENTOR_SQUADS.length })}>
      <div className="grid gap-[1em] md:grid-cols-2">
        {MOCK_MENTOR_SQUADS.map((s) => (
          <article key={s.name} className={`${SOFT} border-t-[0.25em] border-[#06b6d4]`}>
            <div className="flex items-start justify-between gap-[0.5em]">
              <div>
                <h3 className="font-bold text-[#0b1b2b]">{s.name}</h3>
                <span className="rounded-full bg-[#dbe8fb] px-[0.7em] py-[0.1em] text-[0.7em] font-semibold text-[#1d6fe0]">{s.sprint}</span>
              </div>
              <span className="rounded-[0.4em] bg-[#d7efe6] px-[0.6em] py-[0.2em] text-[0.7em] font-bold text-[#12676b]">{s.health}% {t("Health")}</span>
            </div>
            <p className="mt-[0.6em] text-[0.75em] text-[#5b6b7c]">{t("Capstone")}: {s.capstone}</p>
            <div className="mt-[0.8em] flex justify-between text-[0.7em] text-[#5b6b7c]"><span>{t("Sprint Velocity")}: {s.velocity}</span><span className="font-semibold text-[#12676b]">{t("On Track")}</span></div>
            <Bar pct={s.pct} />
            <p className="mt-[0.8em] rounded-[0.6em] bg-white px-[0.8em] py-[0.5em] text-[0.75em]">{t("Next Review")}: <b>{s.review}</b></p>
            <p className="mt-[0.6em] text-end text-[0.7em] text-[#8a97a6]">{s.members} {t("Active Members")}</p>
            <button type="button" className={`${BTN_SECONDARY} mt-[0.6em] w-full`}>{t("Open Squad Workspace")} <ExternalLink className="size-[1em]" /></button>
          </article>
        ))}
      </div>
    </Section>
  );
}