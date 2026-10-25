"use client";

import { ExternalLink } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { MOCK_TD_SQUADS } from "../dashboardMock";
import { Section, SOFT } from "../mentor-detail/parts";

export function SquadPerformance({ squads }: { squads: number }) {
  const t = useT();
  return (
    <Section
      title={t("Squad Performance & Capstone Health")}
      sub={t("Real-time sprint velocity, member health scores, and client deliverables.")}
      action={<button type="button" className="text-[0.75em] font-semibold text-[#0b6f86]">{t("View All {n} Workspaces", { n: squads })} →</button>}
    >
      <div className="grid gap-[1em] md:grid-cols-3">
        {MOCK_TD_SQUADS.map((s) => (
          <article key={s.name} className={`${SOFT} text-[0.8em]`}>
            <p className="flex justify-between text-[0.85em]">
              <span className="rounded-full bg-[#d7efe6] px-[0.7em] py-[0.1em] font-bold text-[#12676b]">{s.health}% {t("Health")}</span>
              <span className="text-[#8a97a6]">{t("Sprint")} {s.sprint}</span>
            </p>
            <h3 className="mt-[0.6em] text-[1.1em] font-bold text-[#0b1b2b]">{s.name}</h3>
            <p className="text-[0.9em] font-semibold text-[#0b6f86]">{t("Project")}: {s.project}</p>
            <dl className="mt-[0.8em] grid gap-[0.3em] text-[0.9em]">
              {[[t("Lead"), s.lead], [t("Mentor"), s.mentor], [t("Velocity"), s.velocity]].map(([k, v]) => (
                <div key={k} className="flex justify-between"><dt className="text-[#5b6b7c]">{k}:</dt><dd className="font-semibold text-[#14365a]">{v}</dd></div>
              ))}
            </dl>
            <button type="button" className="mt-[0.8em] ms-auto flex items-center gap-[0.3em] font-semibold text-[#0b6f86]">{t("Workspace")} <ExternalLink className="size-[1em]" /></button>
          </article>
        ))}
      </div>
    </Section>
  );
}