"use client";

import { Eye, LoaderCircle, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import type { AdminRole } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { PANEL } from "../page-parts";

/**
 * The roles as cards (review notes: "صفحة roles تتعدل ل card"): name, users, system or custom,
 * and how many areas it can view / edit / delete. Clicking a card opens its matrix below;
 * a custom role can be deleted from its card.
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
    <section className={`${PANEL} p-[1em]`}>
      <p className="flex items-center justify-between text-[0.7em] font-bold uppercase text-[#14365a]">
        <span className="inline-flex items-center gap-[0.5em]">
          <ShieldCheck className="size-[1.2em] text-[#0b6f86]" /> {t("Role Profiles")}
        </span>
        <span className="font-medium normal-case text-[#8a97a6]">{t("Switch role to inspect permissions matrix")}</span>
      </p>
      <ul className="mt-[0.9em] grid gap-[0.8em] sm:grid-cols-2 xl:grid-cols-4">
        {roles.map((r) => {
          const on = r.id === selectedId;
          const count = (k: "canView" | "canEdit" | "canDelete") => r.permissions.filter((p) => p[k]).length;
          return (
            <li key={r.id} className="relative">
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onSelect(r.id)}
                className={`flex h-full w-full flex-col gap-[0.6em] rounded-[1em] border p-[1em] text-start transition-colors ${
                  on ? "border-[#0b1b2b] bg-[#0b1b2b] text-white" : "border-[#e3ebf3] bg-[#f7faff] text-[#14365a] hover:border-[#06b6d4]"
                }`}
              >
                <span className="flex items-center gap-[0.6em] pe-[2em]">
                  <span className={`grid size-[2.4em] shrink-0 place-items-center rounded-[0.7em] ${on ? "bg-white/15" : "bg-[#e0f6fc] text-[#0b89a6]"}`}>
                    <ShieldCheck className="size-[1.2em]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[0.95em] font-bold">{t(r.name)}</span>
                    <span className={`block text-[0.72em] ${on ? "text-white/70" : "text-[#5b6b7c]"}`}>{r.meta}</span>
                  </span>
                </span>
                <span
                  className={`w-fit rounded-full px-[0.7em] py-[0.1em] text-[0.68em] font-semibold ${
                    r.isSystemRole ? (on ? "bg-white/15" : "bg-[#eef2f7] text-[#5b6b7c]") : on ? "bg-[#06b6d4]" : "bg-[#dff7ea] text-[#17935f]"
                  }`}
                >
                  {r.isSystemRole ? t("System") : t("Custom")}
                </span>
                <span className={`mt-auto grid grid-cols-3 gap-[0.4em] text-[0.72em] ${on ? "text-white/85" : "text-[#3d4f61]"}`}>
                  <span className="inline-flex items-center gap-[0.3em]">
                    <Eye className="size-[1em]" /> {count("canView")}
                  </span>
                  <span className="inline-flex items-center gap-[0.3em]">
                    <Pencil className="size-[1em]" /> {count("canEdit")}
                  </span>
                  <span className="inline-flex items-center gap-[0.3em]">
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
                  className={`absolute end-[0.7em] top-[0.7em] grid size-[2em] place-items-center rounded-full ${
                    on ? "text-white hover:bg-white/15" : "text-[#d04a4a] hover:bg-[#fdecec]"
                  }`}
                >
                  {deletingId === r.id ? <LoaderCircle className="size-[1em] animate-spin" /> : <Trash2 className="size-[1em]" />}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
