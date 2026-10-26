"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { Ban, ClipboardList, GraduationCap, ListPlus, ListTodo, MessageSquareText, Presentation, Sparkles, Star } from "lucide-react";
import { getAdminSquadFull, type AdminSquad, type AdminSquadFull } from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { PANEL, BTN_PRIMARY } from "../page-parts";
import { LoadState } from "../admin-data";

const COLORS = ["#06b6d4", "#5b6b88", "#12676b", "#1a2b57"];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

/**
 * The selected squad's project (GET admin/squads/{id}/full): description, members, sprints, use cases.
 * Rubric scores and mentor feedback have no API yet, so they show empty states; reviewing is the
 * mentors' job, so the review buttons stay disabled for the admin.
 */
export function ProjectEvaluationPanel({ squad }: { squad: AdminSquad | null }) {
  const t = useT();
  const [full, setFull] = useState<AdminSquadFull | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const id = squad?.id;

  useEffect(() => {
    if (!id) return;
    let active = true;
    getAdminSquadFull(id).then(
      (v) => active && setFull(v),
      (e) => active && setError(errorMessage(e, tk("We couldn't load this project. Please try again."))),
    );
    return () => {
      active = false;
    };
  }, [id, attempt]);

  if (!squad) {
    return (
      <aside className={`${PANEL} grid min-h-[16em] place-items-center p-[1.3em] text-center text-[0.85em] text-[#5b6b7c]`}>
        {t("Select a project to evaluate it.")}
      </aside>
    );
  }

  const members = full?.members ?? [];
  const closed = full?.sprints.filter((s) => s.status === "Closed").length ?? 0;
  const reviewTip = t("Mentors review projects");

  return (
    <aside className={`${PANEL} min-w-0 p-[1.3em]`}>
      <p className="flex flex-wrap items-center justify-between gap-[0.5em] text-[0.68em]">
        <span className="inline-flex items-center gap-[0.4em] rounded-[0.4em] bg-[#dbe8fb] px-[0.7em] py-[0.25em] font-bold uppercase text-[#14365a]">
          <Presentation className="size-[1.1em]" /> {t("Capstone Evaluation")}
        </span>
        <span className="font-medium text-[#5b6b7c]" dir="ltr">
          ID: {squad.id.slice(0, 8).toUpperCase()}
        </span>
      </p>
      <h2 className="mt-[0.6em] text-[1.35em] font-bold leading-snug text-[#0b1b2b]">{squad.projectTitle || t("Untitled project")}</h2>
      {full?.projectDescription && <p className="mt-[0.3em] line-clamp-3 text-[0.78em] text-[#5b6b7c]">{full.projectDescription}</p>}

      <div className="mt-[0.8em] flex items-center gap-[0.7em] rounded-[0.7em] bg-[#f1f5fd] p-[0.6em] text-[0.75em]">
        <span className="grid size-[2.6em] shrink-0 place-items-center rounded-[0.5em] bg-[#0b1b2b] font-bold text-white">{initials(squad.name)}</span>
        <div className="min-w-0 flex-1">
          <Link href={`/admin/squads/${squad.id}` as Route} className="block truncate font-semibold text-[#0b1b2b] hover:underline">
            {t("Squad")}: {squad.name}
          </Link>
          <span className="text-[#5b6b7c]">{t("{n} Student Contributors", { n: full ? members.length : squad.students })}</span>
        </div>
        {members.length > 0 && (
          <span className="flex shrink-0 -space-x-[0.5em] rtl:space-x-reverse">
            {members.slice(0, 3).map((m, i) => (
              <span
                key={m.studentId}
                title={m.fullName}
                className="grid size-[2.1em] place-items-center rounded-full border-2 border-white text-[0.78em] font-bold text-white"
                style={{ background: COLORS[i % COLORS.length] }}
              >
                {initials(m.fullName)}
              </span>
            ))}
            {members.length > 3 && (
              <span className="grid size-[2.1em] place-items-center rounded-full border-2 border-white bg-[#e6eefb] text-[0.75em] font-bold text-[#14365a]">
                +{members.length - 3}
              </span>
            )}
          </span>
        )}
      </div>

      {!full ? (
        <LoadState
          error={error}
          onRetry={() => {
            setError(null);
            setAttempt((n) => n + 1);
          }}
          className="mt-[1em]"
        />
      ) : (
        <>
          <p className="mb-[0.5em] mt-[1.2em] text-[0.68em] font-semibold uppercase tracking-[0.04em] text-[#3d4f61]">{t("Attached Deliverables")}</p>
          <div className="grid grid-cols-2 gap-[0.6em] text-[0.72em]">
            <div className="flex items-center gap-[0.6em] rounded-[0.6em] bg-[#f1f5fd] p-[0.7em]">
              <span className="grid size-[2.2em] shrink-0 place-items-center rounded-[0.5em] bg-[#fde4ef] text-[#d0457f]">
                <ClipboardList className="size-[1.1em]" />
              </span>
              <span className="min-w-0">
                <b className="block font-semibold text-[#14365a]">{t("Use Cases")}</b>
                <span className="text-[#5b6b7c]">{t("{n} documented", { n: full.useCases.length })}</span>
              </span>
            </div>
            <div className="flex items-center gap-[0.6em] rounded-[0.6em] bg-[#f1f5fd] p-[0.7em]">
              <span className="grid size-[2.2em] shrink-0 place-items-center rounded-[0.5em] bg-[#fde4e4] text-[#d04a4a]">
                <ListTodo className="size-[1.1em]" />
              </span>
              <span className="min-w-0">
                <b className="block font-semibold text-[#14365a]">{t("Sprints")}</b>
                <span className="text-[#5b6b7c]">{t("{done} of {total} closed", { done: closed, total: full.sprints.length })}</span>
              </span>
            </div>
          </div>
        </>
      )}

      <div className="mt-[1.3em] flex items-end justify-between">
        <h3 className="font-bold text-[#0b1b2b]">{t("Sprint Rubric Assessment")}</h3>
        <p>
          <b className="text-[2em] text-[#0b6f86]">—</b> <span className="text-[0.75em] text-[#5b6b7c]">{t("pts")}</span>
        </p>
      </div>
      <div className="mt-[0.6em] rounded-[0.8em] border border-dashed border-[#d5dfeb] bg-[#f7faff] px-[1em] py-[1.4em] text-center">
        <span className="flex justify-center gap-[0.15em]" aria-hidden>
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className="size-[1.1em] text-[#c5d0dc]" />
          ))}
        </span>
        <p className="mt-[0.5em] text-[0.8em] font-semibold text-[#0b1b2b]">{t("No rubric scores yet")}</p>
        <p className="text-[0.72em] text-[#5b6b7c]">{t("Scores appear here once the monitor grades the sprint rubric.")}</p>
      </div>

      <figure className="mt-[1em] rounded-[0.8em] bg-[#f1f5fd] p-[1em] text-[0.8em]">
        <figcaption className="flex items-center gap-[0.5em] font-semibold text-[#0b1b2b]">
          <span className="grid size-[2em] place-items-center rounded-full bg-[#0b6f86] text-white">
            <GraduationCap className="size-[1em]" />
          </span>
          {t("Mentor Feedback")}: {squad.monitor?.fullName ?? t("Not assigned")}
        </figcaption>
        <p className="mt-[0.6em] flex items-center gap-[0.5em] border-s-[0.2em] border-[#c9d6e6] ps-[0.8em] text-[#5b6b7c]">
          <MessageSquareText className="size-[1em] shrink-0" /> {t("No feedback yet")}
        </p>
      </figure>

      <button type="button" disabled title={reviewTip} className={`${BTN_PRIMARY} mt-[1em] w-full !py-[0.85em]`}>
        <Sparkles className="size-[1em]" /> {t("Approve & Award Squad XP")}
      </button>
      <div className="mt-[0.6em] grid grid-cols-2 gap-[0.6em] text-[0.78em] font-semibold">
        <button
          type="button"
          disabled
          title={reviewTip}
          className="inline-flex cursor-not-allowed items-center justify-center gap-[0.4em] rounded-[0.6em] bg-[#fdf3dc] py-[0.65em] text-[#a8680c] opacity-70"
        >
          <ListPlus className="size-[1em]" /> {t("Request Changes")}
        </button>
        <button
          type="button"
          disabled
          title={reviewTip}
          className="inline-flex cursor-not-allowed items-center justify-center gap-[0.4em] rounded-[0.6em] bg-[#fde8e8] py-[0.65em] text-[#d04a4a] opacity-70"
        >
          <Ban className="size-[1em]" /> {t("Reject")}
        </button>
      </div>
      <p className="mt-[0.5em] text-center text-[0.7em] text-[#8a97a6]">{reviewTip}</p>
    </aside>
  );
}
