"use client";

import Link from "next/link";
import { ArrowRight, Gauge, Trophy } from "lucide-react";
import type { AdminSquad } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { STATUS_LABEL } from "../SquadCard";
import { LoadState } from "../admin-data";
import { CardFooter, Empty, Pill, Section } from "./ui";

/** Squad Velocity Index: the squads furthest along their project. */
export function SquadVelocity({ squads, error, onRetry }: { squads: AdminSquad[] | null; error: string | null; onRetry: () => void }) {
  const t = useT();
  const list = squads ?? [];
  const top = [...list].sort((a, b) => b.progress - a.progress).slice(0, 4);
  const mean = list.length ? Math.round(list.reduce((a, s) => a + s.progress, 0) / list.length) : null;

  return (
    <Section
      icon={Gauge}
      title={t("Squad Velocity Index")}
      description={t("Project progress of each squad, from its use cases and tasks.")}
      aside={squads && <Pill>{t("Leaderboard")}</Pill>}
      className="flex flex-col"
    >
      {!squads ? (
        <LoadState error={error} onRetry={onRetry} />
      ) : top.length === 0 ? (
        <Empty icon={Gauge} title={t("No squads yet.")} className="mt-[1em] flex-1" />
      ) : (
        <ol className="mt-[1em] flex-1 space-y-[0.6em]">
          {top.map((s, i) => (
            <li key={s.id}>
              <Link
                href={`/admin/squads/${s.id}`}
                className="flex items-center gap-[0.8em] rounded-[0.8em] bg-[#f5f8fe] px-[0.8em] py-[0.65em] hover:bg-[#ecf3fb]"
              >
                <span className="grid size-[2em] shrink-0 place-items-center rounded-full bg-[#dff3fb] text-[0.75em] font-bold text-[#0b6f86]">
                  #{i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.85em] font-bold text-[#0b1b2b]">{s.name}</span>
                  <span className="block truncate text-[0.68em] text-[#8a97a6]">
                    {s.monitor ? t("Monitor: {name}", { name: s.monitor.fullName }) : t("No monitor")} •{" "}
                    {t("{count} members", { count: s.students })}
                  </span>
                </span>
                <span className="text-end">
                  <span dir="ltr" className="block text-[0.95em] font-extrabold text-[#0b89a6]">
                    {s.progress}%
                  </span>
                  <span className="block text-[0.65em] text-[#8a97a6]">{t(STATUS_LABEL[s.status])}</span>
                </span>
                {i === 0 && <Trophy className="size-[1.1em] shrink-0 text-[#c7851a]" />}
              </Link>
            </li>
          ))}
        </ol>
      )}

      <CardFooter>
        <span>
          {t("Average squad progress")}: <b className="text-[#0b1b2b]">{mean != null ? `${mean}%` : "—"}</b>
        </span>
        <Link href="/admin/squads" className="inline-flex items-center gap-[0.3em] font-bold text-[#0b89a6] hover:underline">
          {t("All {count} squads", { count: list.length })} <ArrowRight className="size-[1em] rtl:rotate-180" />
        </Link>
      </CardFooter>
    </Section>
  );
}
