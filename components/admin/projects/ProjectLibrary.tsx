"use client";

import { useState } from "react";
import { CalendarClock, ExternalLink, LoaderCircle, Pencil, Search, Trash2, Users } from "lucide-react";
import { deleteProject, parseSeats, SQUAD_ROLES, type AdminProject, type TrackLevel } from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { PANEL } from "../page-parts";
import { LINK_LABEL } from "./ProjectFormDialog";
import { ProjectLogo } from "./ProjectLogo";

const LEVELS: TrackLevel[] = ["Beginner", "Intermediate", "Advanced"];

const LEVEL_TONE: Record<TrackLevel, string> = {
  Beginner: "bg-[#d7efe6] text-[#12676b]",
  Intermediate: "bg-[#dbe8fb] text-[#14365a]",
  Advanced: "bg-[#efe3fb] text-[#6b3fa0]",
};

/**
 * The project library (27 Oct 2026): the catalog new squads get their project from, one of their level at random.
 * Each card shows the logo, level, team, time, links and how many squads got it; a project no squad got can be deleted.
 */
export function ProjectLibrary({
  projects,
  onEdit,
  onDeleted,
}: {
  projects: AdminProject[];
  onEdit: (project: AdminProject) => void;
  onDeleted: (id: string) => void;
}) {
  const t = useT();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<TrackLevel | "all">("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const items = projects
    .filter((p) => (level === "all" || p.level === level) && (!q || `${p.title} ${p.description}`.toLowerCase().includes(q)))
    .sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || a.title.localeCompare(b.title));

  async function remove(p: AdminProject) {
    if (!window.confirm(t("Delete the project \"{title}\"?", { title: p.title }))) return;
    setBusy(p.id);
    setError(null);
    try {
      await deleteProject(p.id);
      onDeleted(p.id);
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't delete the project. Please try again.")));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="grid gap-[0.8em]">
      <div className={`${PANEL} flex flex-wrap items-center gap-[0.6em] p-[0.6em]`}>
        <div role="tablist" className="flex flex-wrap gap-[0.3em] text-[0.78em]">
          {(["all", ...LEVELS] as const).map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={level === l}
              onClick={() => setLevel(l)}
              className={`rounded-[0.6em] px-[1em] py-[0.6em] font-semibold ${
                level === l ? "bg-[#0b1b2b] text-white" : "text-[#14365a] hover:bg-[#eef3fa]"
              }`}
            >
              {l === "all" ? t("All levels") : t(l)}
              <span className="ms-[0.4em] opacity-70">{l === "all" ? projects.length : projects.filter((p) => p.level === l).length}</span>
            </button>
          ))}
        </div>
        <label className="ms-auto flex min-w-[14em] flex-1 items-center gap-[0.5em] rounded-[0.6em] bg-[#f1f5fd] px-[0.8em] py-[0.5em] text-[0.78em] sm:max-w-[20em]">
          <Search className="size-[1em] text-[#8a97a6]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Search projects")}
            className="w-full bg-transparent outline-none"
          />
        </label>
      </div>

      {error && <p role="alert" className="rounded-lg bg-[#fdecec] px-3 py-2 text-[0.8em] font-semibold text-[#b83232]">{error}</p>}

      {items.length === 0 ? (
        <p className={`${PANEL} p-[2em] text-center text-[0.85em] text-[#5b6b7c]`}>{t("No projects match your filters.")}</p>
      ) : (
        <div className="grid gap-[1em] md:grid-cols-2 2xl:grid-cols-3">
          {items.map((p) => {
            const seats = parseSeats(p.seats);
            return (
              <article key={p.id} className={`${PANEL} flex flex-col gap-[0.8em] p-[1.1em]`}>
                <div className="flex items-start gap-[0.9em]">
                  <ProjectLogo src={p.logoUrl} title={p.title} className="size-[3.2em] text-[1.1em]" />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[1.02em] font-semibold leading-snug text-[#0b1b2b]">{p.title}</h3>
                    <p className="mt-[0.3em] flex flex-wrap items-center gap-[0.4em] text-[0.72em] text-[#5b6b7c]">
                      <span className={`rounded-[0.4em] px-[0.6em] py-[0.1em] font-semibold ${LEVEL_TONE[p.level]}`}>{t(p.level)}</span>
                      <span className="inline-flex items-center gap-[0.3em]">
                        <Users className="size-[1.05em]" /> {t("{n} members", { n: p.teamSize })}
                      </span>
                      <span className="inline-flex items-center gap-[0.3em]">
                        <CalendarClock className="size-[1.05em]" /> {t("{n} weeks", { n: p.durationWeeks })}
                      </span>
                    </p>
                  </div>
                </div>

                <p className="line-clamp-3 text-[0.8em] leading-relaxed text-[#3d4f61]">{p.description}</p>

                <div className="flex flex-wrap gap-[0.3em] text-[0.66em]">
                  {SQUAD_ROLES.filter((r) => seats[r]).map((r) => (
                    <span key={r} className="rounded-full bg-[#f1f5fd] px-[0.7em] py-[0.2em] font-semibold text-[#14365a]">
                      {t(r)} × {seats[r]}
                    </span>
                  ))}
                </div>

                {p.links.length > 0 && (
                  <div className="flex flex-wrap gap-[0.4em] text-[0.7em]">
                    {p.links.map((l, i) => (
                      <a
                        key={i}
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-[0.3em] rounded-[0.5em] bg-[#e6f6f9] px-[0.7em] py-[0.25em] font-semibold text-[#0b6f86] hover:bg-[#d3eff4]"
                      >
                        <ExternalLink className="size-[1em]" /> {l.label || t(LINK_LABEL[l.kind])}
                      </a>
                    ))}
                  </div>
                )}

                <footer className="mt-auto flex items-center justify-between gap-[0.6em] border-t border-[#eef2f8] pt-[0.7em] text-[0.72em] text-[#5b6b7c]">
                  <span>
                    {p.squads === 0
                      ? t("No squad yet")
                      : t("{n} squads · {active} building it", { n: p.squads, active: p.activeSquads })}
                  </span>
                  <span className="flex gap-[0.3em]">
                    <button
                      type="button"
                      onClick={() => onEdit(p)}
                      className="inline-flex items-center gap-[0.3em] rounded-[0.5em] bg-[#eef3fb] px-[0.8em] py-[0.35em] font-semibold text-[#0b1b2b] hover:bg-[#e6eefb]"
                    >
                      <Pencil className="size-[1em]" /> {t("Edit")}
                    </button>
                    <button
                      type="button"
                      disabled={p.squads > 0 || busy === p.id}
                      title={p.squads > 0 ? t("Squads have worked on this project, so it cannot be deleted.") : undefined}
                      aria-label={t("Delete")}
                      onClick={() => remove(p)}
                      className="grid size-[2em] place-items-center rounded-[0.5em] text-[#b83232] hover:bg-[#fdecec] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      {busy === p.id ? <LoaderCircle className="size-[1em] animate-spin" /> : <Trash2 className="size-[1em]" />}
                    </button>
                  </span>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
