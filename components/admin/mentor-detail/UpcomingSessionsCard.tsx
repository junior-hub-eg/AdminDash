"use client";

import { Plus, Video } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { BTN_PRIMARY } from "../page-parts";
import { MOCK_MENTOR_SESSIONS } from "../dashboardMock";
import { Section, SOFT } from "./parts";

export function UpcomingSessionsCard() {
  const t = useT();
  return (
    <Section title={t("Upcoming Sessions")} action={<span className="text-[0.7em] text-[#0b6f86]">{MOCK_MENTOR_SESSIONS.length} {t("Scheduled")}</span>}>
      <ul className="grid gap-[0.8em]">
        {MOCK_MENTOR_SESSIONS.map((s) => (
          <li key={s.title} className={`${SOFT} text-[0.85em]`}>
            <p className="flex justify-between text-[0.8em]"><span className="rounded-[0.4em] bg-white px-[0.6em] py-[0.1em] font-semibold">{t(s.when)}</span><span className="text-[#8a97a6]">{s.mins} {t("mins")}</span></p>
            <h3 className="mt-[0.5em] font-bold text-[#0b1b2b]">{t(s.title)}</h3>
            <p className="text-[0.85em] text-[#5b6b7c]">{t(s.sub)}</p>
            {s.join && <button type="button" className={`${BTN_PRIMARY} mt-[0.6em] !py-[0.4em] !text-[0.8em]`}><Video className="size-[1em]" /> {t("Join Google Meet")}</button>}
          </li>
        ))}
      </ul>
      <button type="button" className="mt-[0.8em] flex w-full items-center justify-center gap-[0.4em] rounded-[0.7em] bg-[#e6edfb] py-[0.7em] text-[0.8em] font-semibold text-[#14365a]"><Plus className="size-[1em]" /> {t("Schedule New Session")}</button>
    </Section>
  );
}