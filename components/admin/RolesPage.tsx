"use client";

import { useEffect, useState, type FormEvent } from "react";
import { History, IdCard, LoaderCircle, RefreshCcwDot, SlidersHorizontal, UserPlus, Plus } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import {
  createAdminRole,
  deleteAdminRole,
  getAdminRoles,
  getSystemReport,
  updateAdminRolePermissions,
  type AdminRole,
  type RolePermission,
  type SystemReport,
} from "@/lib/admin-api";
import { BTN_PRIMARY, BTN_SECONDARY, AdminSurface, StatCard, StatGrid } from "./page-parts";
import { ScreenHeader } from "./notifications/ScreenHeader";
import { LoadState, useAdminData } from "./admin-data";
import { AdminDialog, FIELD } from "./AdminPageFrame";
import { RoleTabs } from "./roles/RoleTabs";
import { PermissionsMatrix, RIGHTS, type Right } from "./roles/PermissionsMatrix";
import { getAuditLog } from "@/lib/admin-security-api";
import { AssignedAdministrators } from "./roles/AssignedAdministrators";
import { PermissionAuditEvents } from "./roles/PermissionAuditEvents";

export default function RolesPage() {
  const t = useT();
  const { data, error, reload, setData } = useAdminData(getAdminRoles, tk("Could not load the roles."));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const roles: AdminRole[] = data ?? [];
  const selected = roles.find((r) => r.id === selectedId) ?? roles[0];
  const custom = roles.filter((r) => !r.isSystemRole).length;
  const [report, setReport] = useState<SystemReport | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  /** Bumped after every saved change, so the audit list and its count load again. */
  const [changes, setChanges] = useState(0);
  const [changeCount, setChangeCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    getAuditLog({ module: "Roles", pageSize: 1 }).then(
      (r) => active && setChangeCount(r.total),
      () => {},
    );
    return () => {
      active = false;
    };
  }, [changes]);

  useEffect(() => {
    let active = true;
    getSystemReport().then(
      (r) => active && setReport(r),
      () => {},
    );
    return () => {
      active = false;
    };
  }, []);

  async function remove(role: AdminRole) {
    if (!window.confirm(t("Delete the role \"{name}\"?", { name: role.name }))) return;
    setDeletingId(role.id);
    setSaveError(null);
    try {
      await deleteAdminRole(role.id);
      setData((list) => (list ?? []).filter((r) => r.id !== role.id));
    } catch (e) {
      setSaveError(errorMessage(e, t("Could not delete the role.")));
    } finally {
      setDeletingId(null);
    }
  }

  /** Every click in the matrix is saved at once. */
  async function save(permissions: RolePermission[]) {
    if (!selected || saving) return;
    const before = roles;
    setData(roles.map((r) => (r.id === selected.id ? { ...r, permissions } : r)));
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await updateAdminRolePermissions(selected, permissions);
      setData((list) => (list ?? []).map((r) => (r.id === saved.id ? { ...r, permissions: saved.permissions } : r)));
    } catch (e) {
      setData(before);
      setSaveError(errorMessage(e, t("Could not save the permissions.")));
    } finally {
      setSaving(false);
      setChanges((n) => n + 1);
    }
  }

  const toggle = (area: string, right: Right) =>
    selected && save(selected.permissions.map((p) => (p.area === area ? { ...p, [right]: !p[right] } : p)));

  /** View on for every module, or off for all when every module already has it. */
  const toggleRead = () => {
    if (!selected) return;
    const allOn = selected.permissions.every((p) => p.canView);
    const none = Object.fromEntries(RIGHTS.map((r) => [r, false]));
    void save(selected.permissions.map((p) => (allOn ? { ...p, ...none } : { ...p, canView: true })));
  };

  return (
    <AdminSurface>
      <ScreenHeader
        crumbs={[t("Admin"), t("Console"), t("Roles & Permissions")]}
        title={t("Roles & Permissions")}
        description={t("Configure granular access controls, administrative privileges, and security matrix across platform roles.")}
        actions={
          <>
            <button
              type="button"
              disabled
              title={t("Coming soon")}
              className="inline-flex cursor-not-allowed items-center gap-[0.5em] rounded-[0.7em] bg-white px-[1.1em] py-[0.65em] text-[0.85em] font-semibold text-[#0b1b2b]/70 shadow-[0_4px_14px_rgba(20,54,90,0.08)]"
            >
              <History className="size-[1em]" /> {t("Security Audit Log")}
            </button>
            <button type="button" onClick={() => setCreating(true)} className={BTN_PRIMARY}>
              <Plus className="size-[1em]" /> {t("Create Custom Role")}
            </button>
          </>
        }
      />

      <StatGrid busy={!data}>
        <StatCard
          label={t("Total Roles")}
          icon={IdCard}
          value={data ? String(roles.length).padStart(2, "0") : "—"}
          badge={data ? `${roles.length - custom} ${t("System")}` : undefined}
          badgeTone="neutral"
          hint={data ? `${custom} ${t("Custom configurations")}` : undefined}
        />
        <StatCard
          label={t("Active Users Assigned")}
          icon={UserPlus}
          value={report ? report.users.total.toLocaleString("en") : "—"}
          badge={report ? t("{n} active", { n: report.users.activeLast7Days.toLocaleString("en") }) : undefined}
          badgeTone="neutral"
          hint={t("Accounts on the platform")}
        />
        <StatCard
          label={t("Custom Roles")}
          icon={SlidersHorizontal}
          value={data ? String(custom).padStart(2, "0") : "—"}
          badge={t("Tailored")}
          badgeTone="neutral"
          hint={t("Specific access scopes")}
        />
        <StatCard
          label={t("Permission Changes")}
          icon={RefreshCcwDot}
          value={changeCount === null ? "—" : changeCount.toLocaleString("en")}
          hint={changeCount ? t("Recorded in the audit log") : t("Not recorded yet")}
        />
      </StatGrid>

      {!data ? (
        <LoadState error={error} onRetry={reload} />
      ) : (
        selected && (
          <>
            <RoleTabs roles={roles} selectedId={selected.id} onSelect={setSelectedId} onDelete={remove} deletingId={deletingId} />
            <PermissionsMatrix role={selected} saving={saving} error={saveError} onToggle={toggle} onToggleRead={toggleRead} onDiscard={reload} />
            <div className="grid items-stretch gap-[1.2em] lg:grid-cols-2">
              <AssignedAdministrators roles={roles} onChanged={() => setChanges((n) => n + 1)} />
              <PermissionAuditEvents key={changes} />
            </div>
          </>
        )
      )}

      {creating && (
        <CreateRoleDialog
          areas={roles[0]?.permissions.map((p) => p.area) ?? []}
          onClose={() => setCreating(false)}
          onCreated={(role) => {
            setData((list) => [...(list ?? []), role]);
            setSelectedId(role.id);
          }}
        />
      )}
    </AdminSurface>
  );
}

/** A new role starts with "view" on every area; the matrix sets the rest. */
function CreateRoleDialog({ areas, onClose, onCreated }: { areas: string[]; onClose: () => void; onCreated: (role: AdminRole) => void }) {
  const t = useT();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      onCreated(
        await createAdminRole({
          name: name.trim(),
          description: description.trim(),
          permissions: areas.map((area) => ({ area, canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canExport: false })),
        }),
      );
      onClose();
    } catch (err) {
      setError(errorMessage(err, t("Could not create the role.")));
      setSaving(false);
    }
  }

  return (
    <AdminDialog open title="Create Custom Role" onClose={onClose}>
      <form onSubmit={submit} className="grid gap-3 text-[0.8rem]">
        <label className="grid gap-1 font-semibold">
          {t("Role name")}
          <input required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} className={FIELD} />
        </label>
        <label className="grid gap-1 font-semibold">
          {t("Description")}
          <input required maxLength={200} value={description} onChange={(e) => setDescription(e.target.value)} className={FIELD} />
        </label>
        {error && <p role="alert" className="rounded-lg bg-[#fdecec] px-3 py-2 font-semibold text-[#b83232]">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>{t("Cancel")}</button>
          <button type="submit" disabled={saving} className={BTN_PRIMARY}>
            {saving && <LoaderCircle className="size-4 animate-spin" />} {t("Create Custom Role")}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}