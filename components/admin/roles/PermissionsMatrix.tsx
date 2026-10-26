"use client";

import {
  Award,
  BellRing,
  ChartLine,
  CircleCheck,
  Compass,
  Folder,
  type LucideIcon,
  LayoutGrid,
  Settings,
  Shield,
  ShieldCheck,
  Smile,
  Users,
  UsersRound,
} from "lucide-react";
import type { AdminRole, RolePermission } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { PANEL } from "../page-parts";

export type Right = "canView" | "canEdit" | "canDelete";
type Col = { key: string; label: string; real?: Right };

/** View, Edit and Delete are saved by the API. Create, Approve and Export are not stored yet. */
const COLS: Col[] = [
  { key: "view", label: tk("View"), real: "canView" },
  { key: "create", label: tk("Create") },
  { key: "edit", label: tk("Edit"), real: "canEdit" },
  { key: "delete", label: tk("Delete"), real: "canDelete" },
  { key: "approve", label: tk("Approve") },
  { key: "export", label: tk("Export") },
];

/** What each platform module covers (matched against the area name the API returns). */
const AREAS: { match: string; sub: string; icon: LucideIcon }[] = [
  { match: "student", sub: tk("Profiles, submissions, grades"), icon: Users },
  { match: "squad", sub: tk("Squad formations, sprint boards"), icon: UsersRound },
  { match: "mentor", sub: tk("Office hours, mentor contracts"), icon: Smile },
  { match: "track", sub: tk("Modules, lessons, milestones"), icon: Compass },
  { match: "curriculum", sub: tk("Modules, lessons, milestones"), icon: Compass },
  { match: "project", sub: tk("Project evaluations, criteria"), icon: Folder },
  { match: "certificate", sub: tk("Credential generation & validation"), icon: Award },
  { match: "notification", sub: tk("System-wide push, SMS, email alerts"), icon: BellRing },
  { match: "announcement", sub: tk("System-wide push, SMS, email alerts"), icon: BellRing },
  { match: "report", sub: tk("Cohort KPIs, attrition, completion"), icon: ChartLine },
  { match: "analytic", sub: tk("Cohort KPIs, attrition, completion"), icon: ChartLine },
  { match: "security", sub: tk("MFA logs, IP records, sign-in attempts"), icon: Shield },
  { match: "role", sub: tk("Roles, permissions, admin accounts"), icon: ShieldCheck },
  { match: "setting", sub: tk("Platform settings and preferences"), icon: Settings },
];

const areaInfo = (area: string) => AREAS.find((x) => area.toLowerCase().includes(x.match));

/** The scope chip, from the rights the role really has on the module. */
function scope(p: RolePermission): { label: string; tone: string } {
  if (p.canView && p.canEdit && p.canDelete) return { label: tk("Full Access"), tone: "bg-[#e6eefb] text-[#0b6f86]" };
  if (p.canView && p.canEdit) return { label: tk("View & Edit"), tone: "bg-[#e6eefb] text-[#0b6f86]" };
  if (p.canView && !p.canEdit && !p.canDelete) return { label: tk("Read-Only"), tone: "bg-[#eef2f7] text-[#3d4f61]" };
  if (!p.canView && !p.canEdit && !p.canDelete) return { label: tk("No Access"), tone: "bg-[#fde8e8] text-[#b83232]" };
  return { label: tk("Custom Access"), tone: "bg-[#eef2f7] text-[#3d4f61]" };
}

export function PermissionsMatrix({
  role,
  saving,
  error,
  onToggle,
  onToggleRead,
  onDiscard,
}: {
  role: AdminRole;
  saving: boolean;
  error: string | null;
  onToggle: (area: string, right: Right) => void;
  /** Turns View on for every module, or off when all of them already have it. */
  onToggleRead: () => void;
  onDiscard: () => void;
}) {
  const t = useT();

  return (
    <section className={`${PANEL} min-w-0 overflow-hidden`}>
      <header className="flex flex-wrap items-center justify-between gap-[0.8em] p-[1.3em]">
        <div className="flex min-w-0 items-center gap-[0.8em]">
          <span className="grid size-[2.6em] shrink-0 place-items-center rounded-[0.7em] bg-[#e6eefb] text-[#0b6f86]">
            <ShieldCheck className="size-[1.2em]" />
          </span>
          <div className="min-w-0">
            <h2 className="flex flex-wrap items-center gap-[0.5em] text-[1.05em] font-bold text-[#0b1b2b]">
              {t("Permissions Matrix: {role}", { role: t(role.name) })}
              <span className="rounded-[0.4em] bg-[#e6eefb] px-[0.6em] py-[0.1em] text-[0.68em] font-semibold text-[#0b6f86]">
                {role.isSystemRole ? t("System Role") : t("Custom Role")}
              </span>
            </h2>
            <p className="text-[0.75em] text-[#5b6b7c]">{t("Define actions this role is authorized to perform across system modules.")}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-[0.8em] text-[0.72em]">
          <button
            type="button"
            onClick={onToggleRead}
            disabled={saving || role.permissions.length === 0}
            className="rounded-[0.5em] bg-[#eef3fb] px-[0.9em] py-[0.5em] font-semibold text-[#0b1b2b] hover:bg-[#e6eefb] disabled:cursor-wait disabled:opacity-60"
          >
            {t("Toggle Read Access")}
          </button>
          <span className="border-s border-[#c9d2dc] ps-[0.8em] font-medium text-[#3d4f61]">{role.meta}</span>
        </div>
      </header>

      {error && (
        <p role="alert" className="mx-[1.3em] mb-[0.8em] rounded-[0.6em] bg-[#fdecec] px-[1em] py-[0.5em] text-[0.75em] font-semibold text-[#b83232]">
          {error}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[52em] text-start text-[0.8em]">
          <thead>
            <tr className="bg-[#eaf1fd] text-[0.78em] font-semibold uppercase tracking-[0.04em] text-[#3d4f61]">
              <th className="px-[1.3em] py-[1.2em] text-start ps-[3.5em]">{t("Platform Module")}</th>
              {COLS.map((c) => (
                <th key={c.key} className="px-[0.6em] py-[1.2em] text-center">
                  {t(c.label)}
                </th>
              ))}
              <th className="px-[1.3em] py-[1.2em] text-start">{t("Scope / Restriction")}</th>
            </tr>
          </thead>
          <tbody>
            {role.permissions.length === 0 && (
              <tr>
                <td colSpan={8} className="py-[2em] text-center text-[#5b6b7c]">
                  {t("No permissions left.")}
                </td>
              </tr>
            )}
            {role.permissions.map((p) => {
              const info = areaInfo(p.area);
              const Icon = info?.icon ?? LayoutGrid;
              const sc = scope(p);
              return (
                <tr key={p.area}>
                  <td className="px-[1.3em] py-[0.9em]">
                    <div className="flex items-start gap-[0.8em]">
                      <Icon className="mt-[0.15em] size-[1.15em] shrink-0 text-[#14365a]" />
                      <div>
                        <b className="block text-[1.05em] font-semibold text-[#0b1b2b]">{t(p.area)}</b>
                        {info && <span className="text-[0.88em] text-[#5b6b7c]">{t(info.sub)}</span>}
                      </div>
                    </div>
                  </td>
                  {COLS.map((c) => {
                    if (!c.real) {
                      return (
                        <td key={c.key} className="px-[0.6em] text-center">
                          <span
                            role="checkbox"
                            aria-checked={false}
                            aria-disabled
                            aria-label={`${t(c.label)} - ${t(p.area)} (${t("Coming soon")})`}
                            title={t("Coming soon")}
                            className="inline-block size-[1.3em] cursor-not-allowed rounded-[0.25em] border-2 border-[#dfe5ec] bg-[#f4f6f9]"
                          />
                        </td>
                      );
                    }
                    const on = p[c.real];
                    return (
                      <td key={c.key} className="px-[0.6em] text-center">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={on}
                          aria-label={`${t(c.label)} - ${t(p.area)}`}
                          disabled={saving}
                          onClick={() => onToggle(p.area, c.real!)}
                          className={`size-[1.3em] rounded-[0.25em] border-2 align-middle disabled:cursor-wait ${
                            on ? "border-[#06b6d4] bg-[#06b6d4]" : "border-[#9aa7b5] bg-white hover:border-[#06b6d4]"
                          }`}
                        />
                      </td>
                    );
                  })}
                  <td className="px-[1.3em]">
                    <span className={`inline-block rounded-full px-[0.8em] py-[0.25em] text-[0.88em] font-semibold ${sc.tone}`}>{t(sc.label)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-[0.8em] bg-[#eaf1fd] px-[1.3em] py-[0.9em] text-[0.75em] text-[#3d4f61]">
        <span className="inline-flex items-center gap-[0.5em]">
          <CircleCheck className="size-[1.2em] text-[#12676b]" /> {saving ? t("Saving...") : t("Changes auto-saved on every toggle")}
        </span>
        <span className="flex gap-[0.6em] font-semibold">
          <button type="button" onClick={onDiscard} className="rounded-[0.5em] bg-[#e1e9f6] px-[1.1em] py-[0.65em] text-[#0b1b2b] hover:bg-[#d6e1f2]">
            {t("Discard Changes")}
          </button>
          <button
            type="button"
            disabled
            title={t("Changes are saved automatically")}
            className="rounded-[0.5em] bg-[#0b6f86] px-[1.1em] py-[0.65em] text-white disabled:cursor-default"
          >
            {t("Save Role Privileges")}
          </button>
        </span>
      </footer>
    </section>
  );
}
