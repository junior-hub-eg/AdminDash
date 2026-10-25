"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ChevronLeft, ChevronRight, LayoutGrid, List, LoaderCircle, Search, Star } from "lucide-react";
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

type Tab = "all" | "active" | "inactive";

/** A table cell: a labelled row on phones, a normal cell from md up. */
const TD =
  "flex items-center justify-between gap-[1em] px-[0.6em] py-[0.5em] before:shrink-0 before:text-[0.8em] before:font-semibold before:text-[#8a97a6] before:content-[attr(data-label)] md:table-cell md:px-[1em] md:py-[1em] md:before:hidden";

function squadsLabel(n: number, t: (k: string) => string) {
  return `${n} ${n === 1 ? t("Squad") : t("Squads")}`;
}

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
        className="rounded-[0.4em] bg-[#eaf1fd] px-[0.9em] py-[0.35em] text-[0.9em] font-semibold text-[#1d6fe0] hover:bg-[#dbe8fb]"
      >
        {t("Profile")}
      </Link>
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className="inline-flex items-center gap-[0.3em] rounded-[0.4em] bg-[#e7edf8] px-[0.9em] py-[0.35em] text-[0.9em] font-semibold text-[#5b6b7c] hover:bg-[#dbe4f3] disabled:opacity-50"
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
    <span className="inline-flex items-center gap-[0.3em] font-semibold">
      <Star className="size-[1em] fill-[#f5b72b] text-[#f5b72b]" /> {value.toFixed(2)}
    </span>
  );
}

export function MentorsTable({ mentors, onChanged }: { mentors: AdminMentor[]; onChanged: (m: AdminMentor) => void }) {
  const t = useT();
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);

  const activeCount = mentors.filter((m) => m.isActive).length;
  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: t("All Mentors"), count: mentors.length },
    { key: "active", label: t("Active"), count: activeCount },
    { key: "inactive", label: t("Inactive"), count: mentors.length - activeCount },
  ];
  const tracks = Array.from(new Set(mentors.map((m) => m.trackName))).sort();

  const q = query.trim().toLowerCase();
  const rows = mentors.filter(
    (m) =>
      (tab === "all" || (tab === "active") === m.isActive) &&
      (!track || m.trackName === track) &&
      (!q || [m.fullName, m.email ?? "", m.title, m.trackName].some((s) => s.toLowerCase().includes(q))),
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

  return (
    <section className="min-w-0 rounded-[1.1em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]">
      {/* Tabs + view switch */}
      <div className="flex flex-wrap items-center justify-between gap-[0.8em]">
        <div className="flex flex-wrap gap-[0.4em] text-[0.8em]" role="tablist">
          {tabs.map((x) => (
            <button
              key={x.key}
              type="button"
              role="tab"
              aria-selected={tab === x.key}
              onClick={() => change(setTab)(x.key)}
              className={`rounded-[0.5em] px-[1em] py-[0.5em] font-semibold ${
                tab === x.key ? "bg-[#0b1b2b] text-white" : "bg-[#eef3fa] text-[#14365a] hover:bg-[#e1eaf7]"
              }`}
            >
              {x.label} <span className={tab === x.key ? "text-[#7fddc9]" : "text-[#8a97a6]"}>{x.count}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-[0.3em] rounded-[0.5em] bg-[#eef3fa] p-[0.25em]">
          {(["list", "grid"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              aria-label={v === "list" ? t("List view") : t("Grid view")}
              onClick={() => setView(v)}
              className={`grid size-[2em] place-items-center rounded-[0.4em] ${view === v ? "bg-white text-[#14365a] shadow-sm" : "text-[#8a97a6]"}`}
            >
              {v === "list" ? <List className="size-[1.1em]" /> : <LayoutGrid className="size-[1.1em]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Search + track filter */}
      <div className="mt-[1em] grid gap-[0.6em] text-[0.8em] sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <label className="relative block">
          <Search className="pointer-events-none absolute start-[0.9em] top-1/2 size-[1.1em] -translate-y-1/2 text-[#8a97a6]" />
          <input
            type="search"
            value={query}
            onChange={(e) => change(setQuery)(e.target.value)}
            placeholder={t("Search mentor by name, skill...")}
            className="h-[2.6em] w-full rounded-[0.6em] border border-[#d5dee8] bg-white ps-[2.5em] pe-[1em] text-[#14365a] outline-none focus:border-[#1d6fe0]"
          />
        </label>
        <select
          value={track}
          onChange={(e) => change(setTrack)(e.target.value)}
          aria-label={t("All Tracks")}
          className="h-[2.6em] rounded-[0.6em] border border-[#d5dee8] bg-white px-[1em] text-[#14365a] outline-none focus:border-[#1d6fe0]"
        >
          <option value="">{t("All Tracks")}</option>
          {tracks.map((x) => (
            <option key={x} value={x}>
              {t(x)}
            </option>
          ))}
        </select>
      </div>

      {rows.length === 0 ? (
        <p className="py-[3em] text-center text-[0.85em] text-[#5b6b7c]">{t("No mentors match your filters.")}</p>
      ) : view === "list" ? (
        <div className="mt-[1em] overflow-x-auto">
          <table className="block w-full text-start text-[0.8em] md:table">
            <thead className="hidden md:table-header-group">
              <tr className="bg-[#eaf1fd] text-[0.8em] font-bold uppercase tracking-wide text-[#14365a]/70">
                <th className="rounded-s-[0.6em] px-[1em] py-[0.9em] text-start font-bold">{t("Mentor")}</th>
                <th className="px-[1em] py-[0.9em] text-start font-bold">{t("Track & Specialization")}</th>
                <th className="px-[1em] py-[0.9em] text-start font-bold">{t("Squads")}</th>
                <th className="px-[1em] py-[0.9em] text-start font-bold">{t("Students")}</th>
                <th className="px-[1em] py-[0.9em] text-start font-bold">{t("Rating")}</th>
                <th className="px-[1em] py-[0.9em] text-start font-bold">{t("Status")}</th>
                <th className="rounded-e-[0.6em] px-[1em] py-[0.9em] text-end font-bold">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody className="block text-[#14365a] md:table-row-group">
              {shown.map((m) => (
                <tr
                  key={m.id}
                  className="mb-[0.8em] block rounded-[0.9em] border border-[#e6edf3] p-[0.4em] md:mb-0 md:table-row md:rounded-none md:border-0 md:border-b md:border-[#eef2f6] md:p-0 md:last:border-b-0"
                >
                  <td data-label={t("Mentor")} className={TD}>
                    <span className="flex min-w-0 items-center gap-[0.8em]">
                      <MentorPicture mentor={m} size="2.8em" />
                      <span className="min-w-0">
                        <span className="block font-bold text-[#0b1b2b]">{m.fullName}</span>
                        <span dir="ltr" className="block truncate text-[0.85em] text-[#8a97a6] rtl:text-end">
                          {m.email ?? "—"}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td data-label={t("Track & Specialization")} className={TD}>
                    <span className="block">
                      <span className="inline-block rounded-[0.5em] bg-[#dbe8fb] px-[0.7em] py-[0.2em] text-[0.85em] font-bold text-[#14365a]">
                        {t(m.trackName)}
                      </span>
                      <span className="mt-[0.3em] block text-[0.85em] text-[#8a97a6]">{m.title}</span>
                    </span>
                  </td>
                  <td data-label={t("Squads")} className={TD}>
                    <span
                      className="rounded-[0.5em] bg-[#eef3fa] px-[0.8em] py-[0.3em] text-center font-semibold"
                      title={m.squadNames.join(", ")}
                    >
                      {squadsLabel(m.monitoredSquads, t)}
                    </span>
                  </td>
                  <td data-label={t("Students")} className={`${TD} font-semibold`}>
                    {m.students}
                  </td>
                  <td data-label={t("Rating")} className={TD}>
                    <Rating value={m.rating} />
                  </td>
                  <td data-label={t("Status")} className={TD}>
                    <MentorStatus active={m.isActive} />
                  </td>
                  <td data-label={t("Actions")} className={`${TD} md:text-end`}>
                    <MentorActions m={m} onChanged={onChanged} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="mt-[1em] grid gap-[0.9em] sm:grid-cols-2 2xl:grid-cols-3">
          {shown.map((m) => (
            <li key={m.id} className="rounded-[0.9em] border border-[#e6edf3] p-[1em] text-[0.85em] text-[#14365a]">
              <div className="flex items-center gap-[0.8em]">
                <MentorPicture mentor={m} size="3em" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-[#0b1b2b]">{m.fullName}</p>
                  <p className="truncate text-[0.85em] text-[#8a97a6]">{m.title}</p>
                </div>
                <MentorStatus active={m.isActive} />
              </div>
              <p className="mt-[0.8em]">
                <span className="rounded-[0.5em] bg-[#dbe8fb] px-[0.7em] py-[0.2em] text-[0.85em] font-bold">{t(m.trackName)}</span>
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
      <footer className="mt-[1em] flex flex-wrap items-center justify-between gap-[0.8em] rounded-[0.7em] bg-[#f4f7fb] px-[1em] py-[0.7em] text-[0.75em] text-[#5b6b7c]">
        <span>{t("Showing {from}-{to} of {total} registered mentors", { from, to, total: rows.length })}</span>
        <nav aria-label={t("Pagination")} className="flex items-center gap-[0.3em]">
          <button
            type="button"
            onClick={() => setPage(current - 1)}
            disabled={current <= 1}
            aria-label={t("Previous page")}
            className="grid size-[2.2em] place-items-center rounded-[0.4em] bg-white shadow-sm disabled:opacity-40 rtl:rotate-180"
          >
            <ChevronLeft className="size-[1.1em]" />
          </button>
          {numbers.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              aria-current={n === current ? "page" : undefined}
              className={`grid size-[2.2em] place-items-center rounded-[0.4em] font-semibold ${
                n === current ? "bg-[#06b6d4] text-white" : "bg-white text-[#14365a] shadow-sm hover:bg-[#eaf1fd]"
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
            className="grid size-[2.2em] place-items-center rounded-[0.4em] bg-white shadow-sm disabled:opacity-40 rtl:rotate-180"
          >
            <ChevronRight className="size-[1.1em]" />
          </button>
        </nav>
      </footer>
    </section>
  );
}