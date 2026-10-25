"use client";

import { useState } from "react";
import { ChevronRight, Download, UserPlus } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { Section } from "./parts";

export function AdminDirectControls() {
  const t = useT();
  const [paused, setPaused] = useState(false); // TODO(api): persist "pause intake"
  const row = "flex w-full items-center gap-[0.7em] rounded-[0.7em] bg-[#f1f5fd] px-[0.9em] py-[0.8em] text-start text-[0.8em] font-semibold text-[#14365a]";
  return (
    <Section title={t("Admin Direct Controls")}>
      <div className="grid gap-[0.6em]">
        <div className={`${row} justify-between`}>
          <span><b className="block">{t("Pause New Student Intake")}</b><span className="text-[0.85em] font-normal text-[#8a97a6]">{t("Mentor near 90% threshold")}</span></span>
          <button type="button" role="switch" aria-checked={paused} onClick={() => setPaused(!paused)} className={`h-[1.5em] w-[2.7em] shrink-0 rounded-full p-[0.2em] ${paused ? "bg-[#06b6d4]" : "bg-[#c5d0dc]"}`}>
            <span className={`block size-[1.1em] rounded-full bg-white transition-transform ${paused ? "translate-x-[1.2em] rtl:-translate-x-[1.2em]" : ""}`} />
          </button>
        </div>
        <button type="button" className={row}><UserPlus className="size-[1.1em]" /><span className="flex-1">{t("Assign Additional Squad")}</span><ChevronRight className="size-[1em] rtl:rotate-180" /></button>
        <button type="button" className={row}><Download className="size-[1.1em]" /><span className="flex-1">{t("Export Coaching PDF Report")}</span><ChevronRight className="size-[1em] rtl:rotate-180" /></button>
      </div>
    </Section>
  );
}