"use client";

import Link from "next/link";
import { ArrowRight, Gauge } from "lucide-react";
import type { AdminSquad } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { DataTable, ReportCard, StateBlock } from "@/components/report-kit";
import { STATUS_LABEL } from "../SquadCard";
import { CardFooter, Pill } from "./ui";

/** Squad velocity: every squad's project progress, sortable. Squads are not tied to a track, so the track filter does not apply. */
export function SquadVelocity({ squads, error, onRetry }: { squads: AdminSquad[] | null; error: string | null; onRetry: () => void }) {
  const t = useT();
  const list = squads ?? [];
  const mean = list.length ? Math.round(list.reduce((a, s) => a + s.progress, 0) / list.length) : null;

  return (
    <ReportCard
      icon={Gauge}
      title={t("Squad Velocity Index")}
      description={t("Project progress of each squad, from its use cases and tasks.")}
      aside={squads && <Pill>{t("All tracks")}</Pill>}
      className="flex flex-col"
    >
      <div className="flex-1">
        {!squads ? (
          <StateBlock error={error} onRetry={onRetry} className="mt-[1em]" />
        ) : (
          <DataTable
            label={t("Squad Velocity Index")}
            rows={list}
            rowKey={(s) => s.id}
            defaultSort={{ key: "progress", dir: "desc" }}
            empty={{ icon: Gauge, title: t("No squads yet.") }}
            columns={[
              {
                key: "name",
                header: t("Squad"),
                sort: (s) => s.name,
                cell: (s) => (
                  <Link href={`/admin/squads/${s.id}`} className="font-bold text-[#0b1b2b] hover:underline">
                    {s.name}
                  </Link>
                ),
              },
              { key: "monitor", header: t("Monitor"), sort: (s) => s.monitor?.fullName ?? "", cell: (s) => s.monitor?.fullName ?? t("No monitor") },
              { key: "members", header: t("Members"), align: "end", sort: (s) => s.students, cell: (s) => <span dir="ltr">{`${s.students}/${s.capacity}`}</span> },
              { key: "status", header: t("Status"), sort: (s) => s.status, cell: (s) => t(STATUS_LABEL[s.status]) },
              {
                key: "progress",
                header: t("Progress"),
                align: "end",
                sort: (s) => s.progress,
                cell: (s) => (
                  <span className="inline-flex items-center gap-[0.5em]">
                    <span className="hidden h-[0.45em] w-[4em] overflow-hidden rounded-full bg-[#e8eef5] sm:block">
                      <span className="block h-full rounded-full bg-[#06b6d4]" style={{ width: `${Math.max(0, Math.min(100, s.progress))}%` }} />
                    </span>
                    <b dir="ltr" className="text-[#0b89a6]">{s.progress}%</b>
                  </span>
                ),
              },
            ]}
          />
        )}
      </div>
      <CardFooter>
        <span>
          {t("Average squad progress")}: <b className="text-[#0b1b2b]">{mean != null ? `${mean}%` : "—"}</b>
        </span>
        <Link href="/admin/squads" className="inline-flex items-center gap-[0.3em] font-bold text-[#0b89a6] hover:underline print:hidden">
          {t("All {count} squads", { count: list.length })} <ArrowRight className="size-[1em]" />
        </Link>
      </CardFooter>
    </ReportCard>
  );
}
