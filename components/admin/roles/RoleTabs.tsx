"use client";

import { Eye, LoaderCircle, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import type { AdminRole } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { PANEL } from "../page-parts";

/**
 * The roles as cards (review notes: "صفحة roles تتعدل ل card"), laid out where the design has its
 * role pills: one scrolling row inside the "Role Profiles" panel. Each card shows the name, the
 * API's meta line, system or custom, and how many modules it can view / edit / delete.
 * Clicking a card opens its matrix below; a custom role can be deleted from its card.
 */
export function RoleTabs({
  roles,
  selectedId,
  onSelect,
  onDelete,
  deletingId,
}: {
  roles: AdminRole[];
  selectedId: string;
  onSelect: (id: string) => void;
  onDelete: (role: AdminRole) => void;
  deletingId: string | null;
}) {
  const t = useT();
  return (
    <section className={`${PANEL} min-w-0 px-[1em] pb-[1em] pt-[1.1em]`}>
      <p className="flex flex-wrap items-center justify-between gap-[0.5em] text-[0.7em] font-semibold uppercase tracking-[0.04em] text-[#0b1b2b]">
        <span className="inline-flex items-center gap-[0.5em]">
          <ShieldCheck className="size-[1.25em] text-[#0b6f86]" /> {t("Role Profiles")}
        </span>
        <span className="font-normal normal-case tracking-normal text-[#5b6b7c]">{t("Switch role to inspect permissions matrix")}</span>
      </p>
      <ul className="mt-[0.8em] flex snap-x gap-[0.7em] overflow-x-auto pb-[0.3em] [scrollbar-width:thin]">
        {roles.map((r) => {
          const on = r.id === selectedId;
          const count = (k: "canView" | "canEdit" | "canDelete") => r.permissions.filter((p) => p[k]).length;
          return (
            <li key={r.id} className="relative w-[15.5em] shrink-0 snap-start">
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onSelect(r.id)}
                className={`flex h-full w-full flex-col gap-[0.55em] rounded-[0.7em] px-[1em] py-[0.8em] text-start transition-colors ${
                  on ? "bg-[#0b1b2b] text-white shadow-[0_8px_20px_rgba(11,27,43,0.25)]" : "bg-[#f1f5fd] text-[#0b1b2b] hover:bg-[#e6eefb]"
                }`}
              >
                <span className="flex items-center gap-[0.55em] pe-[1.8em]">
                  <span className={`size-[0.5em] shrink-0 rounded-full ${on ? "bg-[#22d3ee]" : "bg-[#14365a]"}`} />
                  <span className="min-w-0 truncate text-[0.95em] font-semibold">{t(r.name)}</span>
                </span>
                <span className="flex flex-wrap items-center gap-[0.4em]">
                  <span
                    className={`max-w-full truncate rounded-[0.35em] px-[0.6em] py-[0.15em] text-[0.66em] font-semibold ${
                      on ? "bg-[#0b6f86] text-white" : "bg-[#e1e9f6] text-[#0b6f86]"
                    }`}
                  >
                    {r.meta}
                  </span>
                  <span
                    className={`rounded-[0.35em] px-[0.6em] py-[0.15em] text-[0.66em] font-semibold ${
                      r.isSystemRole ? (on ? "bg-white/15" : "bg-[#eef2f7] text-[#5b6b7c]") : on ? "bg-[#06b6d4]" : "bg-[#dff7ea] text-[#17935f]"
                    }`}
                  >
                    {r.isSystemRole ? t("System") : t("Custom")}
                  </span>
                </span>
                <span className={`flex gap-[0.9em] text-[0.7em] ${on ? "text-white/80" : "text-[#5b6b7c]"}`}>
                  <span className="inline-flex items-center gap-[0.3em]" title={t("View")}>
                    <Eye className="size-[1em]" /> {count("canView")}
                  </span>
                  <span className="inline-flex items-center gap-[0.3em]" title={t("Edit")}>
                    <Pencil className="size-[1em]" /> {count("canEdit")}
                  </span>
                  <span className="inline-flex items-center gap-[0.3em]" title={t("Delete")}>
                    <Trash2 className="size-[1em]" /> {count("canDelete")}
                  </span>
                </span>
              </button>
              {!r.isSystemRole && (
                <button
                  type="button"
                  onClick={() => onDelete(r)}
                  disabled={deletingId === r.id}
                  aria-label={t("Delete")}
                  title={t("Delete")}
                  className={`absolute end-[0.5em] top-[0.55em] grid size-[1.9em] place-items-center rounded-full ${
                    on ? "text-white hover:bg-white/15" : "text-[#d04a4a] hover:bg-[#fdecec]"
                  }`}
                >
                  {deletingId === r.id ? <LoaderCircle className="size-[0.95em] animate-spin" /> : <Trash2 className="size-[0.95em]" />}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
