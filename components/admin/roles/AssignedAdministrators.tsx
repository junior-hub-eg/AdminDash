"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState, type FormEvent } from "react";
import { LoaderCircle, UserCog } from "lucide-react";
import { assignAdminRole, getAdmins, SYSTEM_ADMIN_ROLE, type AdminAccount, type AdminRole } from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk, type TFunction } from "@/lib/i18n/translate";
import { PANEL } from "../page-parts";
import { useAdminData } from "../admin-data";
import { AdminDialog, FIELD } from "../AdminPageFrame";
import { BTN_PRIMARY, BTN_SECONDARY } from "../page-parts";

const COLORS = ["#12676b", "#5b6b88", "#0f6b57", "#1a2b57", "#06b6d4"];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

/** "4m ago", "2h ago", "Yesterday", or the date. */
function lastActive(iso: string, now: number, t: TFunction) {
  const mins = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (mins < 60) return t("Active {n}m ago", { n: mins });
  const hours = Math.round(mins / 60);
  if (hours < 24) return t("Active {n}h ago", { n: hours });
  if (hours < 48) return t("Active Yesterday");
  return t("Active {date}", { date: new Date(iso).toLocaleDateString(dateLocale("en-GB"), { day: "numeric", month: "short" }) });
}

/**
 * The admin accounts (GET admin/admins). Only the main admin may list them; others see a short note. "Reassign Role"
 * gives an admin a role of the matrix, which the API then enforces; the main admin always keeps full access.
 */
export function AssignedAdministrators({ roles, onChanged }: { roles: AdminRole[]; onChanged: () => void }) {
  const t = useT();
  const admins = useAdminData(getAdmins, tk("Only the main admin can see the admin accounts."));
  const [now] = useState(() => Date.now());
  const [reassigning, setReassigning] = useState<AdminAccount | null>(null);
  const list = admins.data ?? [];
  const systemAdmin = roles.find((r) => r.isSystemRole && r.name === SYSTEM_ADMIN_ROLE);
  const roleOf = (a: AdminAccount) => roles.find((r) => r.id === a.customRoleId) ?? systemAdmin;

  return (
    <section className={`${PANEL} flex min-w-0 flex-col p-[1.3em]`}>
      <header className="mb-[1em] flex items-start justify-between gap-[0.6em]">
        <div className="flex items-center gap-[0.8em]">
          <span className="grid size-[2.4em] shrink-0 place-items-center rounded-[0.6em] bg-[#e6eefb] text-[#14365a]">
            <UserCog className="size-[1.15em]" />
          </span>
          <div>
            <h2 className="text-[1.05em] font-bold text-[#0b1b2b]">{t("Assigned Administrators")}</h2>
            {admins.data && <p className="text-[0.75em] text-[#5b6b7c]">{t("{n} Users currently operating in Admin role", { n: list.length })}</p>}
          </div>
        </div>
        <Link
          href={"/admin/admins" as Route}
          className="shrink-0 rounded-[0.5em] bg-[#eef3fb] px-[0.9em] py-[0.45em] text-[0.72em] font-semibold text-[#0b6f86] hover:bg-[#e6eefb]"
        >
          + {t("Assign User")}
        </Link>
      </header>

      {admins.error ? (
        <p className="rounded-[0.7em] bg-[#f1f5fd] p-[1em] text-[0.8em] text-[#5b6b7c]">{admins.error}</p>
      ) : !admins.data ? (
        <p className="py-[1.5em] text-center text-[0.8em] text-[#8a97a6]">{t("Loading")}…</p>
      ) : (
        <ul className="grid gap-[0.5em]">
          {list.slice(0, 5).map((a, i) => (
            <li key={a.id} className="flex items-center gap-[0.8em] rounded-[0.6em] bg-[#f1f5fd] px-[0.8em] py-[0.65em] text-[0.8em]">
              <span
                className="grid size-[2.6em] shrink-0 place-items-center rounded-full text-[0.9em] font-bold text-white"
                style={{ background: COLORS[i % COLORS.length] }}
              >
                {initials(a.fullName)}
              </span>
              <div className="min-w-0 flex-1">
                <b className="flex flex-wrap items-center gap-[0.5em] text-[1.05em] font-semibold text-[#0b1b2b]">
                  {a.fullName}
                  {a.isOwner && (
                    <span className="rounded-[0.35em] bg-[#e1e9f6] px-[0.6em] py-[0.05em] text-[0.72em] font-semibold text-[#0b6f86]">{t("Lead Admin")}</span>
                  )}
                </b>
                <span className="block truncate text-[0.88em] text-[#5b6b7c]">
                  <span dir="ltr">{a.email}</span> · {a.lastLoginUtc ? lastActive(a.lastLoginUtc, now, t) : t("Never signed in")}
                </span>
                {roleOf(a) && <span className="block truncate text-[0.85em] font-semibold text-[#0b6f86]">{t(roleOf(a)!.name)}</span>}
              </div>
              {!a.isOwner && (
                <button
                  type="button"
                  onClick={() => setReassigning(a)}
                  className="shrink-0 text-[0.85em] font-medium text-[#5b6b7c] hover:text-[#0b6f86] hover:underline"
                >
                  {t("Reassign Role")}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {admins.data && (
        <p className="mt-auto flex flex-wrap justify-between gap-[0.5em] pt-[1.2em] text-[0.75em] text-[#5b6b7c]">
          <span>{t("Displaying {n} of {total} assigned members", { n: Math.min(5, list.length), total: list.length })}</span>
          <Link href={"/admin/admins" as Route} className="font-semibold text-[#0b6f86] hover:underline">
            {t("View All Members")} <span className="inline-block rtl:rotate-180">→</span>
          </Link>
        </p>
      )}
      {reassigning && (
        <ReassignRoleDialog
          admin={reassigning}
          roles={roles}
          current={roleOf(reassigning)?.id ?? ""}
          onClose={() => setReassigning(null)}
          onSaved={() => {
            admins.reload();
            onChanged();
          }}
        />
      )}
    </section>
  );
}

function ReassignRoleDialog({
  admin,
  roles,
  current,
  onClose,
  onSaved,
}: {
  admin: AdminAccount;
  roles: AdminRole[];
  current: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useT();
  const [roleId, setRoleId] = useState(current);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const role = roles.find((r) => r.id === roleId);
    setSaving(true);
    setError(null);
    try {
      await assignAdminRole(admin.id, !role || (role.isSystemRole && role.name === SYSTEM_ADMIN_ROLE) ? null : role.id);
      onSaved();
      onClose();
    } catch (err) {
      setError(errorMessage(err, t("Could not change the role.")));
      setSaving(false);
    }
  }

  return (
    <AdminDialog open title="Reassign Role" onClose={onClose}>
      <form onSubmit={submit} className="grid gap-3 text-[0.8rem]">
        <p className="text-[#5b6b7c]">{t("{name} will only be able to do what this role allows.", { name: admin.fullName })}</p>
        <label className="grid gap-1 font-semibold">
          {t("Role")}
          <select required value={roleId} onChange={(e) => setRoleId(e.target.value)} className={FIELD}>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {t(r.name)}
              </option>
            ))}
          </select>
        </label>
        {error && <p role="alert" className="rounded-lg bg-[#fdecec] px-3 py-2 font-semibold text-[#b83232]">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>{t("Cancel")}</button>
          <button type="submit" disabled={saving || roleId === current} className={BTN_PRIMARY}>
            {saving && <LoaderCircle className="size-4 animate-spin" />} {t("Save")}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}
