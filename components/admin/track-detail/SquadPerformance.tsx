"use client";

import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, ExternalLink, UsersRound } from "lucide-react";
import type { AdminSquad } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { LoadState } from "../admin-data";
import { Bar, EmptyNote, Section, SOFT } from "../mentor-detail/parts";

/** Squads monitored by this track's mentors (the API can't list squads by track). `total` is the track's own squad count. */
export function SquadPerformance({ squads, total, error, onRetry }: { squads: AdminSquad[] | null; total: number; error: string | null; onRetry: () => void }) {
  const t = useT();
  return (
    <Section
      title={t("Squad Performance & Capstone Health")}
      sub={t("Squads monitored by this track's mentors. The track has {n} squads with members in its role.", { n: total })}
      icon={<UsersRound className="size-[1.1em]" />}
      action={
        <Link href={"/admin/squads" as Route} className="inline-flex items-center gap-[0.3em] text-[0.75em] font-semibold text-[#0b6f86] hover:underline">
          {t("View All Workspaces")} <ArrowRight className="size-[1em]" />
        </Link>
      }
    >
      {!squads ? (
        <LoadState error={error} onRetry={onRetry} />
      ) : squads.length === 0 ? (
        <EmptyNote text={t("No squad is monitored by this track's mentors yet.")} />
      ) : (
        <div className="grid gap-[1em] md:grid-cols-2 2xl:grid-cols-3">
          {squads.map((s) => (
            <article key={s.id} className={`${SOFT} flex flex-col text-[0.8em]`}>
              <p className="flex justify-between gap-[0.5em] text-[0.85em]">
                <span className="rounded-full bg-[#d7efe6] px-[0.7em] py-[0.1em] font-bold text-[#12676b]">
                  {Math.round(s.progress)}% {t("Progress")}
                </span>
                <span className="text-[#5b6b7c]">{t(s.level)}</span>
              </p>
              <h3 className="mt-[0.6em] text-[1.1em] font-bold text-[#0b1b2b]">{s.name}</h3>
              <p className="text-[0.9em] font-semibold text-[#0b6f86]">
                {t("Project")}: {s.projectTitle || "—"}
              </p>
              <dl className="mt-[0.8em] grid gap-[0.3em] text-[0.9em]">
                <div className="flex justify-between gap-[0.5em]">
                  <dt className="text-[#5b6b7c]">{t("Mentor")}:</dt>
                  <dd className="font-semibold text-[#0b6f86]">{s.monitor?.fullName ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-[0.5em]">
                  <dt className="text-[#5b6b7c]">{t("Members")}:</dt>
                  <dd className="font-semibold text-[#14365a]">
                    {s.students} / {s.capacity}
                  </dd>
                </div>
              </dl>
              <div className="mt-[0.7em]">
                <Bar pct={s.progress} color="#12676b" />
              </div>
              <Link href={`/admin/squads/${s.id}` as Route} className="mt-[0.8em] ms-auto inline-flex items-center gap-[0.3em] font-semibold text-[#0b6f86] hover:underline">
                {t("Workspace")} <ExternalLink className="size-[1em]" />
              </Link>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
