"use client";

import { useState } from "react";
import { Boxes, CircleCheck } from "lucide-react";
import type { AdminRole } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { PANEL } from "../page-parts";
import { MOCK_ROLE_AREA_INFO } from "../dashboardMock";

export type Right = "canView" | "canEdit" | "canDelete";
type Col = { key: string; label: string; real?: Right };

// View, Edit and Delete are saved by the API. Create, Approve and Export are visual only (TODO(api)).
const COLS: Col[] = [
  { key: "view", label: "View", real: "canView" },
  { key: "create", label: "Create" },
  { key: "edit", label: "Edit", real: "canEdit" },
  { key: "delete", label: "Delete", real: "canDelete" },
  { key: "approve", label: "Approve" },
  { key: "export", label: "Export" },
];

function info(area: string) {
  const a = area.toLowerCase();
  return MOCK_ROLE_AREA_INFO.find((x) => a.includes(x.match));
}

export function PermissionsMatrix({
  role,
  saving,
  error,
  onToggle,
  onDiscard,
}: {
  role: AdminRole;
  saving: boolean;
  error: string | null;
  onToggle: (area: string, right: Right) => void;
  onDiscard: () => void;
}) {
  const t = useT();
  // Visual-only columns: remembered per role while the page is open.
  const [local, setLocal] = useState<Record<string, boolean>>({});
  const fake = (area: string, col: string, p: AdminRole["permissions"][number]) =>
    local[`${role.id}:${area}:${col}`] ?? (col === "export" ? p.canView : p.canEdit);

  return (
    <section className={`${PANEL} min-w-0 overflow-hidden`}>
      <header className="flex flex-wrap items-center justify-between gap-[0.8em] p-[1.2em]">
        <div className="flex items-center gap-[0.8em]">
          <span className="grid size-[2.8em] place-items-center rounded-[0.8em] bg-[#eef3fa] text-[#0b6f86]"><Boxes className="size-[1.3em]" /></span>
          <div>
            <h2 className="flex flex-wrap items-center gap-[0.5em] font-bold text-[#0b1b2b]">
              {t("Permissions Matrix: {role}", { role: t(role.name) })}
              <span className="rounded-full bg-[#dff3fb] px-[0.7em] py-[0.1em] text-[0.7em] font-semibold text-[#0b6f86]">{role.isSystemRole ? t("System Role") : t("Custom Role")}</span>
            </h2>
            <p className="text-[0.75em] text-[#5b6b7c]">{t("Define actions this role is authorized to perform across system modules.")}</p>
          </div>
        </div>
        <p className="text-[0.75em] text-[#5b6b7c]">{role.meta}</p>
      </header>

      {error && <p role="alert" className="mx-[1.2em] mb-[0.8em] rounded-[0.6em] bg-[#fdecec] px-[1em] py-[0.5em] text-[0.75em] font-semibold text-[#b83232]">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[46em] text-start text-[0.8em]">
          <thead>
            <tr className="bg-[#eaf1fd] text-[0.75em] font-bold uppercase text-[#14365a]/70">
              <th className="px-[1.2em] py-[0.9em] text-start">{t("Platform Module")}</th>
              {COLS.map((c) => <th key={c.key} className="px-[0.6em] py-[0.9em] text-center">{t(c.label)}</th>)}
              <th className="px-[1.2em] py-[0.9em] text-start">{t("Scope / Restriction")}</th>
            </tr>
          </thead>
          <tbody>
            {role.permissions.length === 0 && <tr><td colSpan={8} className="py-[2em] text-center text-[#5b6b7c]">{t("No permissions left.")}</td></tr>}
            {role.permissions.map((p) => {
              const i = info(p.area);
              return (
                <tr key={p.area} className="border-b border-[#eef2f6] last:border-0">
                  <td className="px-[1.2em] py-[0.9em]"><b className="block text-[#0b1b2b]">{t(p.area)}</b>{i && <span className="text-[0.85em] text-[#8a97a6]">{t(i.sub)}</span>}</td>
                  {COLS.map((c) => {
                    const on = c.real ? p[c.real] : fake(p.area, c.key, p);
                    return (
                      <td key={c.key} className="px-[0.6em] text-center">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={on}
                          aria-label={`${t(c.label)} - ${t(p.area)}`}
                          disabled={saving && !!c.real}
                          onClick={() => (c.real ? onToggle(p.area, c.real) : setLocal((s) => ({ ...s, [`${role.id}:${p.area}:${c.key}`]: !on })))}
                          className={`size-[1.4em] rounded-[0.3em] border-2 disabled:cursor-wait ${on ? "border-[#06b6d4] bg-[#06b6d4]" : "border-[#c9d2dc] bg-white hover:border-[#06b6d4]"}`}
                        />
                      </td>
                    );
                  })}
                  <td className="px-[1.2em]">{i && <span className="rounded-full bg-[#e6edfb] px-[0.9em] py-[0.25em] text-[0.85em] font-semibold text-[#14365a]">{t(i.scope)}</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-[0.8em] bg-[#eaf1fd] px-[1.2em] py-[0.9em] text-[0.75em] text-[#5b6b7c]">
        <span className="inline-flex items-center gap-[0.5em]"><CircleCheck className="size-[1.2em] text-[#12676b]" /> {t("Changes auto-saved with audit stamp")}</span>
        <span className="flex gap-[0.6em] font-semibold">
          <button type="button" onClick={onDiscard} className="rounded-[0.6em] bg-white px-[1.1em] py-[0.6em] text-[#14365a]">{t("Discard Changes")}</button>
          <button type="button" disabled className="rounded-[0.6em] bg-[#0b6f86] px-[1.1em] py-[0.6em] text-white disabled:opacity-80">{saving ? t("Saving...") : t("Save Role Privileges")}</button>
        </span>
      </footer>
    </section>
  );
}