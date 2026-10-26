"use client";

import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, ExternalLink, Monitor, UsersRound } from "lucide-react";
import type { AdminSquad, AdminSquadStatus } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { LoadState } from "../admin-data";
import { Bar, EmptyNote, Section } from "./parts";

const STATUS: Record<AdminSquadStatus, { label: string; cls: string }> = {
  Waiting: { label: tk("Waiting"), cls: "bg-[#fdf0d4] text-[#a8680c]" },
  Active: { label: tk("Active"), cls: "bg-[#dbe8fb] text-[#1d6fe0]" },
  InReview: { label: tk("In Review"), cls: "bg-[#ece8fd] text-[#6a52d9]" },
  Completed: { label: tk("Completed"), cls: "bg-[#d7efe6] text-[#12676b]" },
};

/** The squads this mentor monitors (from the squads list). `full` shows them on their own tab. */
export function ActiveSquadsOversight({
  squads,
  error,
  onRetry,
  full = false,
}: {
  squads: AdminSquad[] | null;
  error: string | null;
  onRetry: () => void;
  full?: boolean;
}) {
  const t = useT();
  return (
    <Section
      title={full ? t("Assigned Squads") : t("Active Squads Oversight")}
      sub={squads ? t("Currently monitoring {count} student project squads", { count: squads.length }) : undefined}
      icon={<UsersRound className="size-[1.1em]" />}
      action={
        <Link href={"/admin/squads" as Route} className="inline-flex items-center gap-[0.3em] text-[0.75em] font-semibold text-[#0b6f86] hover:underline">
          {t("Squad Analytics")} <ArrowRight className="size-[1em]" />
        </Link>
      }
    >
      {!squads ? (
        <LoadState error={error} onRetry={onRetry} />
      ) : squads.length === 0 ? (
        <EmptyNote text={t("This mentor doesn't monitor any squad yet. Use “Assign Additional Squad” to give them one.")} />
      ) : (
        <div className={`grid gap-[1em] md:grid-cols-2 ${full ? "xl:grid-cols-3" : ""}`}>
          {squads.map((s) => (
            <article key={s.id} className="rounded-[0.9em] border-t-[0.25em] border-[#06b6d4] bg-[#f1f5fd] p-[1em]">
              <div className="flex items-start justify-between gap-[0.5em]">
                <div className="min-w-0">
                  <h3 className="text-[1.15em] font-bold text-[#0b1b2b]">{s.name}</h3>
                  <span className={`mt-[0.2em] inline-block rounded-full px-[0.7em] py-[0.1em] text-[0.7em] font-semibold ${STATUS[s.status].cls}`}>
                    {t(STATUS[s.status].label)} • {t(s.level)}
                  </span>
                </div>
                <span className="shrink-0 rounded-[0.4em] bg-[#d7efe6] px-[0.6em] py-[0.2em] text-center text-[0.7em] font-bold leading-tight text-[#12676b]">
                  {Math.round(s.progress)}%
                  <span className="block font-semibold">{t("Progress")}</span>
                </span>
              </div>
              <p className="mt-[0.6em] flex items-center gap-[0.4em] text-[0.75em] text-[#5b6b7c]">
                <Monitor className="size-[1em] shrink-0" /> {t("Capstone")}: {s.projectTitle || "—"}
              </p>
              <div className="mt-[0.8em] flex justify-between text-[0.7em] text-[#5b6b7c]">
                <span>{t("Project Progress")}</span>
                <span className="font-semibold text-[#12676b]">{Math.round(s.progress)}%</span>
              </div>
              <div className="mt-[0.3em]">
                <Bar pct={s.progress} color="#12676b" />
              </div>
              <p className="mt-[0.8em] text-end text-[0.7em] text-[#5b6b7c]">
                {t("{n} / {cap} Active Members", { n: s.students, cap: s.capacity })}
              </p>
              <Link
                href={`/admin/squads/${s.id}` as Route}
                className="mt-[0.6em] flex w-full items-center justify-center gap-[0.4em] rounded-[0.6em] bg-white py-[0.6em] text-[0.8em] font-semibold text-[#0b6f86] hover:bg-[#e6f1fb]"
              >
                {t("Open Squad Workspace")} <ExternalLink className="size-[1em]" />
              </Link>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
