"use client";

import { useT } from "@/lib/i18n/client";
import { MOCK_MENTOR_AVAILABILITY } from "../dashboardMock";
import { Section } from "./parts";

const ROW: Record<string, string> = { booked: "bg-[#f1f5fd]", open: "bg-[#c9f5e8]", off: "bg-[#f1f5fd] text-[#8a97a6]" };

export function WeeklyAvailabilityCard() {
  const t = useT();
  const label = (s: string) => (s === "booked" ? t("Booked") : s === "open" ? t("Open Slot") : t("Off"));
  return (
    <Section title={t("Weekly Availability")} action={<span className="text-[0.7em] text-[#0b6f86]">{t("Current Week")}</span>}>
      <ul className="grid gap-[0.5em] text-[0.8em]">
        {MOCK_MENTOR_AVAILABILITY.map((a) => (
          <li key={a.day} className={`flex items-center gap-[0.8em] rounded-[0.7em] px-[0.9em] py-[0.7em] ${ROW[a.state]}`}>
            <b className="w-[2.5em]">{a.day}</b>
            <span className="flex-1">{a.state === "off" ? t(a.time) : a.time}</span>
            <span className="text-[0.85em]">{label(a.state)}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="mt-[0.8em] w-full rounded-[0.7em] bg-[#e6edfb] py-[0.7em] text-[0.8em] font-semibold text-[#14365a]">{t("Manage Availability Slots")}</button>
    </Section>
  );
}