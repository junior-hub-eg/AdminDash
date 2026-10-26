"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { addStudent, type AdminStudentDetail } from "@/lib/admin-api";
import { ApiError, errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminDialog, FIELD } from "../AdminPageFrame";
import { BTN_PRIMARY, BTN_SECONDARY } from "../page-parts";

/** "+ Add Student": an independent student account, active at once with the password the admin sets. */
export function AddStudentDialog({ onClose, onAdded }: { onClose: () => void; onAdded: (s: AdminStudentDetail) => void }) {
  const t = useT();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "", gender: "" as "" | "Male" | "Female" });
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const fieldError = (k: string) => {
    const m = Object.entries(fields).find(([key]) => key.toLowerCase() === k.toLowerCase())?.[1];
    return m ? <span className="text-[0.72rem] font-normal text-[#b83232]">{t(m)}</span> : null;
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.gender) return setError(tk("Choose boy or girl."));
    setSaving(true);
    setError(null);
    setFields({});
    try {
      onAdded(
        await addStudent({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          gender: form.gender,
          ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
        }),
      );
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.code === "VALIDATION_FAILED") setFields(err.fieldErrors);
      setError(errorMessage(err, tk("We couldn't add the student. Please try again.")));
      setSaving(false);
    }
  }

  return (
    <AdminDialog open title="Add Student" onClose={onClose}>
      <form onSubmit={submit} noValidate className="grid gap-3 text-[0.8rem]">
        <p className="text-[#5b6b7c]">{t("The account is active right away. Share the email and password with the student.")}</p>
        <label className="grid gap-1 font-semibold">
          {t("Full name")}
          <input required maxLength={100} value={form.fullName} onChange={set("fullName")} className={FIELD} />
          {fieldError("fullName")}
        </label>
        <label className="grid gap-1 font-semibold">
          {t("Email")}
          <input required type="email" dir="ltr" value={form.email} onChange={set("email")} className={FIELD} autoComplete="off" />
          {fieldError("email")}
        </label>
        <label className="grid gap-1 font-semibold">
          {t("Password")}
          <span className="relative">
            <input
              required
              type={show ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              className={`${FIELD} pe-9`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? t("Hide password") : t("Show password")}
              className="absolute end-2 top-1/2 -translate-y-1/2 text-[#5b6b7c]"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </span>
          {fieldError("password")}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 font-semibold">
            {t("Boy or girl")}
            <select required value={form.gender} onChange={set("gender")} className={FIELD}>
              <option value="">{t("Choose")}</option>
              <option value="Male">{t("Boy")}</option>
              <option value="Female">{t("Girl")}</option>
            </select>
          </label>
          <label className="grid gap-1 font-semibold">
            {t("Phone (optional)")}
            <input dir="ltr" maxLength={30} value={form.phone} onChange={set("phone")} className={FIELD} />
          </label>
        </div>
        {error && <p role="alert" className="rounded-lg bg-[#fdecec] px-3 py-2 font-semibold text-[#b83232]">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>
            {t("Cancel")}
          </button>
          <button type="submit" disabled={saving} className={BTN_PRIMARY}>
            {saving && <LoaderCircle className="size-4 animate-spin" />} {t("Add Student")}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}
