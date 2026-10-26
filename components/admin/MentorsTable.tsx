"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, List, LoaderCircle, Search, SlidersHorizontal, Star } from "lucide-react";
import { setMentorActive, type AdminMentor } from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { mentorAvatar } from "@/lib/avatars";

/* ---- These two are used by other pages (e.g. the mentor profile): keep them exported. ---- */

export function MentorPicture({ mentor, size }: { mentor: { id: string; photoUrl?: string | null }; size: string }) {
  const avatar = mentorAvatar(mentor);
  return (
    <span className="relative shrink-0 overflow-hidden rounded-full" style={{ width: size, height: size, backgroundColor: avatar.bg }}>
      <Image src={avatar.src} alt="" fill sizes="64px" className="object-cover object-top" />
    </span>
  );
}

export function MentorStatus({ active }: { active: boolean }) {
  const t = useT();
  return (
    <span
      className={`inline-flex items-center gap-[0.4em] rounded-full px-[0.8em] py-[0.2em] text-[0.85em] font-medium ${active ? "bg-[#d7efe6] text-[#12676b]" : "bg-[#e6ebf1] text-[#5b6b7c]"}`}
    >
      <span className={`size-[0.45em] rounded-full ${active ? "bg-[#12676b]" : "bg-[#8a97a6]"}`} />
      {active ? t("Active") : t("Inactive")}
    </span>
  );
}

/* ---------------------------------------------------------------------------------------- */

const PAGE_SIZE = 6;

/** Available = active with no monitored squad; On Leave = deactivated. */
export type MentorState = "active" | "available" | "leave";
export const mentorState = (m: AdminMentor): MentorState => (!m.isActive ? "leave" : m.monitoredSquads === 0 ? "available" : "active");

type Tab = "all" | MentorState;
/** Workload from monitored squads: none, 1-2, more than 2. */
type Load = "" | "free" | "balanced" | "high";
const loadOf = (m: AdminMentor): Load => (m.monitoredSquads === 0 ? "free" : m.monitoredSquads > 2 ? "high" : "balanced");

const STATE_LABEL: Record<MentorState, string> = { active: tk("Active"), available: tk("Available"), leave: tk("On Leave") };
const STATE_STYLE: Record<MentorState, string> = {
  active: "bg-[#ddf5ee] text-[#12676b]",
  available: "bg-[#dff3fb] text-[#0b89a6]",
  leave: "bg-[#eef2f7] text-[#5b6b7c]",
};

function StateChip({ m }: { m: AdminMentor }) {
  const t = useT();
  const s = mentorState(m);
  return (
    <span className={`inline-flex items-center gap-[0.4em] rounded-full px-[0.8em] py-[0.25em] text-[0.9em] font-semibold ${STATE_STYLE[s]}`}>
      <span className="size-[0.45em] shrink-0 rounded-full bg-current" />
      {t(STATE_LABEL[s])}
    </span>
  );
}

/** A table cell: a labelled row on phones, a normal cell from md up. */
const TD =
  "flex items-center justify-between gap-[1em] px-[0.6em] py-[0.5em] before:shrink-0 before:text-[0.8em] before:font-semibold before:text-[#8a97a6] before:content-[attr(data-label)] md:table-cell md:px-[1em] md:py-[1.1em] md:before:hidden";

const SELECT =
  "h-[2.8em] w-full appearance-none rounded-[0.7em] border border-[#e1e8f0] bg-white ps-[1em] pe-[2.4em] text-[#14365a] outline-none focus:ring-2 focus:ring-[#06b6d4]/40";

function MentorActions({ m, onChanged }: { m: AdminMentor; onChanged: (m: AdminMentor) => void }) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      onChanged(await setMentorActive(m.id, !m.isActive));
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't save the change. Please try again.")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-[0.4em]">
      <Link
        href={`/admin/mentors/${m.id}` as Route}
        className="rounded-[0.5em] border border-[#d6e4f5] bg-[#f3f8fe] px-[0.9em] py-[0.35em] text-[0.9em] font-semibold text-[#1d6fe0] hover:bg-[#e6f0fc]"
      >
        {t("Profile")}
      </Link>
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className="inline-flex items-center gap-[0.3em] rounded-[0.5em] border border-[#e1e8f0] bg-white px-[0.9em] py-[0.35em] text-[0.9em] font-semibold text-[#5b6b7c] hover:bg-[#f1f6fb] disabled:opacity-50"
      >
        {busy && <LoaderCircle className="size-[1em] animate-spin" />} {m.isActive ? t("Deactivate") : t("Activate")}
      </button>
      {error && (
        <span role="alert" className="basis-full text-end text-[0.8em] text-[#b83232]">
          {error}
        </span>
      )}
    </span>
  );
}

function Rating({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-[0.3em] font-semibold text-[#14365a]">
      <Star className="size-[1em] text-[#f5a524]" /> {value.toFixed(2)}
    </span>
  );
}

function SquadsPill({ m }: { m: AdminMentor }) {
  const t = useT();
  const none = m.monitoredSquads === 0;
  return (
    <span
      title={m.squadNames.join(", ")}
      className={`inline-grid min-w-[4.5em] place-items-center rounded-[0.6em] px-[0.8em] py-[0.35em] text-center leading-tight ${none ? "bg-[#f4f7fb] text-[#8a97a6]" : "bg-[#eaf1fd] font-semibold text-[#14365a]"}`}
    >
      <span>{m.monitoredSquads}</span>
      <span className="text-[0.9em]">{m.monitoredSquads === 1 ? t("Squad") : t("Squads")}</span>
    </span>
  );
}

export function MentorsTable({ mentors, onChanged }: { mentors: AdminMentor[]; onChanged: (m: AdminMentor) => void }) {
  const t = useT();
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState("");
  const [load, setLoad] = useState<Load>("");
  const [showFilters, setShowFilters] = useState(true);
  const [view, setView] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);

  const count = (s: MentorState) => mentors.filter((m) => mentorState(m) === s).length;
  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: t("All Mentors"), count: mentors.length },
    { key: "active", label: t("Active"), count: count("active") },
    { key: "available", label: t("Available"), count: count("available") },
    { key: "leave", label: t("On Leave"), count: count("leave") },
  ];
  const tracks = Array.from(new Map(mentors.map((m) => [m.trackCode, m.trackName])).entries()).sort((a, b) => a[1].localeCompare(b[1]));

  const q = query.trim().toLowerCase();
  const rows = mentors.filter(
    (m) =>
      (tab === "all" || mentorState(m) === tab) &&
      (!track || m.trackCode === track) &&
      (!load || loadOf(m) === load) &&
      (!q || [m.fullName, m.email ?? "", m.title, m.trackName, ...m.squadNames].some((s) => s.toLowerCase().includes(q))),
  );

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const from = rows.length === 0 ? 0 : (current - 1) * PAGE_SIZE + 1;
  const to = Math.min(current * PAGE_SIZE, rows.length);
  const shown = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const start = Math.max(1, Math.min(current - 2, pages - 4));
  const numbers = Array.from({ length: Math.min(5, pages) }, (_, i) => start + i);

  const change = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };
  const filtered = Boolean(track || load || q);

  return (
    <div className="grid min-w-0 content-start gap-[1em]">
      {/* Tabs + view switch + filters */}
      <div className="flex flex-wrap items-center justify-between gap-[0.8em] rounded-[1.1em] bg-white p-[0.8em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]">
        <div className="flex flex-wrap gap-[0.4em] text-[0.8em]" role="tablist" aria-label={t("Mentor status")}>
          {tabs.map((x) => (
            <button
              key={x.key}
              type="button"
              role="tab"
              aria-selected={tab === x.key}
              onClick={() => change(setTab)(x.key)}
              className={`rounded-[0.6em] border px-[1em] py-[0.5em] font-semibold ${
                tab === x.key ? "border-[#0b1b2b] bg-[#0b1b2b] text-white" : "border-[#e6edf3] bg-white text-[#14365a] hover:bg-[#f1f6fb]"
              }`}
            >
              {x.label} <span className={`ms-[0.3em] ${tab === x.key ? "text-[#2be3c4]" : "text-[#5b6b7c]"}`}>{x.count}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-[0.4em] text-[0.8em]">
          <div className="flex gap-[0.2em] rounded-[0.6em] bg-[#eef3fa] p-[0.2em]">
            {(["list", "grid"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                aria-label={v === "list" ? t("List view") : t("Grid view")}
                onClick={() => setView(v)}
                className={`grid size-[2.2em] place-items-center rounded-[0.45em] ${view === v ? "bg-white text-[#14365a] shadow-sm" : "text-[#8a97a6]"}`}
              >
                {v === "list" ? <List className="size-[1.1em]" /> : <LayoutGrid className="size-[1.1em]" />}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            aria-expanded={showFilters}
            className={`inline-flex h-[2.6em] items-center gap-[0.4em] rounded-[0.6em] px-[0.9em] font-semibold ${
              showFilters || filtered ? "bg-[#e0f6fc] text-[#0b6f86]" : "bg-[#eef3fa] text-[#5b6b7c]"
            }`}
          >
            <SlidersHorizontal className="size-[1em]" /> {t("Filters")}
          </button>
        </div>
      </div>

      {/* Search + track + availability */}
      {showFilters && (
        <div className="grid gap-[0.6em] text-[0.8em] sm:grid-cols-3">
          <label className="relative block">
            <Search className="pointer-events-none absolute start-[0.9em] top-1/2 size-[1.1em] -translate-y-1/2 text-[#8a97a6]" />
            <input
              type="search"
              value={query}
              onChange={(e) => change(setQuery)(e.target.value)}
              placeholder={t("Search mentor by name, skill...")}
              className="h-[2.8em] w-full rounded-[0.7em] border border-[#e1e8f0] bg-white ps-[2.6em] pe-[1em] text-[#14365a] outline-none placeholder:text-[#8a97a6] focus:ring-2 focus:ring-[#06b6d4]/40"
            />
          </label>
          <label className="relative block">
            <select value={track} onChange={(e) => change(setTrack)(e.target.value)} aria-label={t("Track")} className={SELECT}>
              <option value="">{t("All Tracks")}</option>
              {tracks.map(([code, name]) => (
                <option key={code} value={code}>
                  {t(name)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-[0.9em] top-1/2 size-[1em] -translate-y-1/2 text-[#5b6b7c]" />
          </label>
          <label className="relative block">
            <select value={load} onChange={(e) => change(setLoad)(e.target.value as Load)} aria-label={t("Availability")} className={SELECT}>
              <option value="">{t("All Availability")}</option>
              <option value="free">{t("Available (no squad)")}</option>
              <option value="balanced">{t("Balanced (1-2 Squads)")}</option>
              <option value="high">{t("High Load (>2 Squads)")}</option>
            </select>
            <ChevronDown className="pointer-events-none absolute end-[0.9em] top-1/2 size-[1em] -translate-y-1/2 text-[#5b6b7c]" />
          </label>
        </div>
      )}

      <section className="min-w-0 overflow-hidden rounded-[1.1em] bg-white shadow-[0_6px_22px_rgba(20,54,90,0.07)]">
        {rows.length === 0 ? (
          <p className="py-[3em] text-center text-[0.85em] text-[#5b6b7c]">{t("No mentors match your filters.")}</p>
        ) : view === "list" ? (
          <div className="overflow-x-auto p-[0.6em] md:p-0">
            <table className="block w-full text-start text-[0.8em] md:table">
              <thead className="hidden md:table-header-group">
                <tr className="bg-[#eef4fb] text-[0.8em] font-bold uppercase tracking-[0.06em] text-[#14365a]/75">
                  <th className="px-[1.2em] py-[1.1em] text-start font-bold">{t("Mentor")}</th>
                  <th className="px-[1em] py-[1.1em] text-start font-bold">{t("Track & Specialization")}</th>
                  <th className="px-[1em] py-[1.1em] text-center font-bold">{t("Squads")}</th>
                  <th className="px-[1em] py-[1.1em] text-center font-bold">{t("Students")}</th>
                  <th className="px-[1em] py-[1.1em] text-start font-bold">{t("Rating")}</th>
                  <th className="px-[1em] py-[1.1em] text-start font-bold">{t("Status")}</th>
                  <th className="px-[1.2em] py-[1.1em] text-end font-bold">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody className="block text-[#14365a] md:table-row-group">
                {shown.map((m) => (
                  <tr
                    key={m.id}
                    className="mb-[0.8em] block rounded-[0.9em] border border-[#e6edf3] p-[0.4em] md:mb-0 md:table-row md:rounded-none md:border-0 md:border-b md:border-[#eef2f6] md:p-0 md:last:border-b-0"
                  >
                    <td data-label={t("Mentor")} className={`${TD} md:ps-[1.2em]`}>
                      <span className="flex min-w-0 items-center gap-[0.8em]">
                        <MentorPicture mentor={m} size="2.9em" />
                        <span className="min-w-0">
                          <span className="block text-[1.12em] font-bold text-[#0b1b2b]">{m.fullName}</span>
                          <span dir="ltr" className="block truncate text-[0.9em] text-[#5b6b7c] rtl:text-end">
                            {m.email ?? "—"}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td data-label={t("Track & Specialization")} className={TD}>
                      <span className="block max-w-[11em]">
                        <span className="inline-block rounded-[0.6em] bg-[#e0f0fd] px-[0.7em] py-[0.2em] text-[0.88em] font-bold text-[#0b6f86]">
                          {t(m.trackName)}
                        </span>
                        {m.title && <span className="mt-[0.3em] block text-[0.88em] text-[#5b6b7c]">{m.title}</span>}
                      </span>
                    </td>
                    <td data-label={t("Squads")} className={`${TD} md:text-center`}>
                      <SquadsPill m={m} />
                    </td>
                    <td data-label={t("Students")} className={`${TD} font-semibold md:text-center`}>
                      {m.students}
                    </td>
                    <td data-label={t("Rating")} className={TD}>
                      <Rating value={m.rating} />
                    </td>
                    <td data-label={t("Status")} className={TD}>
                      <StateChip m={m} />
                    </td>
                    <td data-label={t("Actions")} className={`${TD} md:pe-[1.2em] md:text-end`}>
                      <MentorActions m={m} onChanged={onChanged} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ul className="grid gap-[0.9em] p-[1em] sm:grid-cols-2 2xl:grid-cols-3">
            {shown.map((m) => (
              <li key={m.id} className="rounded-[0.9em] border border-[#e6edf3] p-[1em] text-[0.85em] text-[#14365a]">
                <div className="flex items-center gap-[0.8em]">
                  <MentorPicture mentor={m} size="3em" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-[#0b1b2b]">{m.fullName}</p>
                    <p className="truncate text-[0.85em] text-[#8a97a6]">{m.title}</p>
                  </div>
                  <StateChip m={m} />
                </div>
                <p className="mt-[0.8em]">
                  <span className="rounded-[0.5em] bg-[#e0f0fd] px-[0.7em] py-[0.2em] text-[0.85em] font-bold text-[#0b6f86]">{t(m.trackName)}</span>
                </p>
                <dl className="mt-[0.8em] grid grid-cols-3 gap-[0.5em] text-center">
                  <div className="rounded-[0.6em] bg-[#f4f7fb] py-[0.5em]">
                    <dt className="text-[0.75em] text-[#8a97a6]">{t("Squads")}</dt>
                    <dd className="font-bold">{m.monitoredSquads}</dd>
                  </div>
                  <div className="rounded-[0.6em] bg-[#f4f7fb] py-[0.5em]">
                    <dt className="text-[0.75em] text-[#8a97a6]">{t("Students")}</dt>
                    <dd className="font-bold">{m.students}</dd>
                  </div>
                  <div className="rounded-[0.6em] bg-[#f4f7fb] py-[0.5em]">
                    <dt className="text-[0.75em] text-[#8a97a6]">{t("Rating")}</dt>
                    <dd className="font-bold">{m.rating.toFixed(2)}</dd>
                  </div>
                </dl>
                <div className="mt-[0.8em] text-end">
                  <MentorActions m={m} onChanged={onChanged} />
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        <footer className="flex flex-wrap items-center justify-between gap-[0.8em] bg-[#f4f8fd] px-[1.2em] py-[0.8em] text-[0.75em] text-[#5b6b7c]">
          <span>{t("Showing {from}-{to} of {total} registered mentors", { from, to, total: rows.length })}</span>
          <nav aria-label={t("Pagination")} className="flex items-center gap-[0.3em]">
            <button
              type="button"
              onClick={() => setPage(current - 1)}
              disabled={current <= 1}
              aria-label={t("Previous page")}
              className="grid size-[2.3em] place-items-center rounded-[0.5em] border border-[#e1e8f0] bg-white disabled:opacity-40"
            >
              <ChevronLeft className="size-[1.1em] rtl:rotate-180" />
            </button>
            {numbers.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                aria-current={n === current ? "page" : undefined}
                className={`grid size-[2.3em] place-items-center rounded-[0.5em] font-semibold ${
                  n === current ? "bg-[#06b6d4] text-white" : "border border-[#e1e8f0] bg-white text-[#14365a] hover:bg-[#eaf1fd]"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage(current + 1)}
              disabled={current >= pages}
              aria-label={t("Next page")}
              className="grid size-[2.3em] place-items-center rounded-[0.5em] border border-[#e1e8f0] bg-white disabled:opacity-40"
            >
              <ChevronRight className="size-[1.1em] rtl:rotate-180" />
            </button>
          </nav>
        </footer>
      </section>
    </div>
  );
}
