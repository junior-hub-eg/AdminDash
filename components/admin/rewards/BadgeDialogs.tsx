"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { LoaderCircle, X } from "lucide-react";
import { getAdminStudents } from "@/lib/admin-api";
import { ApiError, errorMessage } from "@/lib/api-client";
import {
  awardBadge,
  createBadge,
  updateBadge,
  type AdminBadge,
  type BadgeRarity,
  type BadgeType,
} from "@/lib/admin-rewards-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { useAdminData } from "../admin-data";

const FIELD =
  "w-full rounded-[0.5em] border border-[#d5dee8] bg-white px-[0.8em] py-[0.5em] text-[0.85em] text-[#14365a] outline-none focus:border-[#06b6d4]";

export const RARITIES: BadgeRarity[] = ["Common", "Rare", "Epic", "Legendary"];
const TYPES: BadgeType[] = ["Track", "SubjectLink", "Recruitment"];
export const TYPE_LABEL: Record<BadgeType, string> = {
  Track: tk("Track"),
  SubjectLink: tk("Subject link"),
  Recruitment: tk("Recruitment"),
};

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const t = useT();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <button type="button" aria-label={t("Close")} onClick={onClose} className="absolute inset-0 cursor-default bg-[#14365a]/40 backdrop-blur-[1px]" />
      <div role="dialog" aria-modal="true" aria-label={title} className="relative max-h-[90svh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 text-[#14365a] shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label={t("Close")} className="grid size-8 place-items-center rounded-full hover:bg-[#eef4fa]">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Actions({ busy, label, onClose }: { busy: boolean; label: string; onClose: () => void }) {
  const t = useT();
  return (
    <div className="flex justify-end gap-2 pt-1">
      <button type="button" onClick={onClose} className="rounded-lg border border-[#cfe0ee] px-4 py-2 text-[0.75rem] font-semibold hover:bg-[#eef4fa]">
        {t("Cancel")}
      </button>
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg bg-[#06b6d4] px-4 py-2 text-[0.75rem] font-semibold text-white hover:bg-[#0aa5c0] disabled:opacity-60"
      >
        {busy && <LoaderCircle className="size-3.5 animate-spin" />}
        {label}
      </button>
    </div>
  );
}

function Alert({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <p role="alert" className="rounded-[0.6em] bg-[#fdecec] px-[0.9em] py-[0.6em] text-[0.85em] font-semibold text-[#b83232]">
      {text}
    </p>
  );
}

/** Create New Badge, or edit one. */
export function BadgeDialog({ badge, onClose, onSaved }: { badge: AdminBadge | null; onClose: () => void; onSaved: (b: AdminBadge) => void }) {
  const t = useT();
  const [name, setName] = useState(badge?.name ?? "");
  const [description, setDescription] = useState(badge?.description ?? "");
  const [rarity, setRarity] = useState<BadgeRarity>(badge?.rarity ?? "Common");
  const [type, setType] = useState<BadgeType>(badge?.type ?? "Track");
  const [xpBonus, setXpBonus] = useState(String(badge?.xpBonus ?? 0));
  const [iconKey, setIconKey] = useState(badge?.iconKey ?? "award");
  const [isActive, setIsActive] = useState(badge?.isActive ?? true);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const bonus = Number(xpBonus);
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = tk("The badge name is required.");
    if (!Number.isInteger(bonus) || bonus < 0 || bonus > 10000) errs.xpBonus = tk("Use a whole number from 0 to 10,000.");
    setFields(errs);
    if (Object.keys(errs).length) return;

    const body = { name: name.trim(), description: description.trim() || null, rarity, type, xpBonus: bonus, iconKey: iconKey.trim() || "award", isActive };
    setBusy(true);
    try {
      onSaved(badge ? await updateBadge(badge.id, body) : await createBadge(body));
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length) setFields(err.fieldErrors);
      else setMessage(errorMessage(err, tk("We couldn't save the badge. Please try again.")));
    } finally {
      setBusy(false);
    }
  }

  const field = (key: string, label: string, el: ReactNode) => (
    <label className="grid gap-[0.3em] text-[0.85em]">
      <span className="font-semibold text-[#14365a]">{label}</span>
      {el}
      {fields[key] && <span className="text-[0.9em] text-[#b83232]">{t(fields[key])}</span>}
    </label>
  );

  return (
    <Dialog title={badge ? t("Edit badge") : t("Create New Badge")} onClose={onClose}>
      <form onSubmit={submit} noValidate className="grid gap-[0.9em]">
        {field("name", t("Name"), <input className={FIELD} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />)}
        {field("description", t("Description"), <textarea className={`${FIELD} h-20`} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} />)}
        <div className="grid gap-[0.9em] sm:grid-cols-2">
          {field(
            "rarity",
            t("Rarity"),
            <select className={FIELD} value={rarity} onChange={(e) => setRarity(e.target.value as BadgeRarity)}>
              {RARITIES.map((r) => (
                <option key={r} value={r}>
                  {t(r)}
                </option>
              ))}
            </select>,
          )}
          {field(
            "type",
            t("Type"),
            <select className={FIELD} value={type} onChange={(e) => setType(e.target.value as BadgeType)}>
              {TYPES.map((ty) => (
                <option key={ty} value={ty}>
                  {t(TYPE_LABEL[ty])}
                </option>
              ))}
            </select>,
          )}
          {field("xpBonus", t("XP bonus"), <input className={FIELD} dir="ltr" inputMode="numeric" value={xpBonus} onChange={(e) => setXpBonus(e.target.value)} />)}
          {field("iconKey", t("Icon key"), <input className={FIELD} dir="ltr" value={iconKey} onChange={(e) => setIconKey(e.target.value)} maxLength={40} />)}
        </div>
        <label className="flex items-center gap-[0.6em] text-[0.85em] font-semibold">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="size-[1.1em] accent-[#06b6d4]" />
          {t("Active (students can earn it)")}
        </label>
        <Alert text={message} />
        <Actions busy={busy} label={badge ? t("Save") : t("Create badge")} onClose={onClose} />
      </form>
    </Dialog>
  );
}

/** Award a badge to one student. Awarding a badge the student already holds changes nothing. */
export function AwardDialog({ badge, onClose, onAwarded }: { badge: AdminBadge; onClose: () => void; onAwarded: (note: string) => void }) {
  const t = useT();
  const students = useAdminData(getAdminStudents, tk("We couldn't load the students. Please try again."));
  const [search, setSearch] = useState("");
  const [studentId, setStudentId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const options = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (students.data ?? []).filter((s) => !q || s.fullName.toLowerCase().includes(q) || (s.email ?? "").toLowerCase().includes(q)).slice(0, 50);
  }, [students.data, search]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!studentId) {
      setMessage(tk("Choose a student."));
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const result = await awardBadge(badge.id, studentId);
      const who = students.data?.find((s) => s.id === studentId)?.fullName ?? "";
      onAwarded(
        result.awarded
          ? t("Badge awarded to {name} (+{xp} XP).", { name: who, xp: result.xpAwarded })
          : t("{name} already holds this badge.", { name: who }),
      );
    } catch (err) {
      setMessage(errorMessage(err, tk("We couldn't award the badge. Please try again.")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog title={t("Award “{badge}”", { badge: badge.name })} onClose={onClose}>
      <form onSubmit={submit} noValidate className="grid gap-[0.9em]">
        <input className={FIELD} placeholder={t("Search students by name or email")} value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={FIELD} size={8} value={studentId} onChange={(e) => setStudentId(e.target.value)} aria-label={t("Student")}>
          {!students.data && <option disabled>{students.error ?? t("Loading")}</option>}
          {options.map((s) => (
            <option key={s.id} value={s.id}>
              {s.fullName} · {s.totalXp.toLocaleString("en")} XP
            </option>
          ))}
        </select>
        {badge.xpBonus > 0 && <p className="text-[0.75em] text-[#5b6b7c]">{t("The student also gets {xp} XP once.", { xp: badge.xpBonus })}</p>}
        <Alert text={message ? t(message) : null} />
        <Actions busy={busy} label={t("Award badge")} onClose={onClose} />
      </form>
    </Dialog>
  );
}
