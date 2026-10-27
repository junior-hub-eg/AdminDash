"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Eye, EyeOff, LoaderCircle, Lock, Mail, Phone, School, User } from "lucide-react";
import { getSchools, SUBJECTS, type NewTeacher, type TeacherAccount } from "@/lib/admin-teachers-api";
import { ApiError, errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { LoadState, useAdminData } from "../admin-data";

const box =
  "flex h-[2.8em] items-center gap-[0.7em] rounded-[0.7em] border border-[#d5dee8] bg-white px-[1em] text-[0.85em] text-[#14365a] focus-within:border-[#1d6fe0] focus-within:ring-2 focus-within:ring-[#1d6fe0]/20";
const input = "min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#14365a]/40";
const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);

function Field({ label, icon, error, children }: { label: string; icon: ReactNode; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[0.85em] font-semibold text-[#0b1b2b]">{label}</span>
      <span className={`mt-[0.4em] ${box} ${error ? "!border-[#b83232]" : ""}`}>
        <span className="shrink-0 text-[#14365a]/50">{icon}</span>
        {children}
      </span>
      {error && <span role="alert" className="mt-[0.3em] block text-[0.75em] text-[#b83232]">{error}</span>}
    </label>
  );
}

function Chips<T extends string | number>({
  label,
  options,
  value,
  onChange,
  error,
  render,
}: {
  label: string;
  options: readonly T[];
  value: T[];
  onChange: (v: T[]) => void;
  error?: string;
  render: (v: T) => string;
}) {
  return (
    <fieldset className="sm:col-span-2">
      <legend className="text-[0.85em] font-semibold text-[#0b1b2b]">{label}</legend>
      <div className="mt-[0.4em] flex flex-wrap gap-[0.4em] text-[0.8em]">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <button
              key={String(o)}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((v) => v !== o) : [...value, o])}
              className={`rounded-full border px-[0.9em] py-[0.3em] font-semibold ${on ? "border-[#06b6d4] bg-[#e0f6fc] text-[#0b6f86]" : "border-[#d5dee8] bg-white text-[#14365a]"}`}
            >
              {render(o)}
            </button>
          );
        })}
      </div>
      {error && <span role="alert" className="mt-[0.3em] block text-[0.75em] text-[#b83232]">{error}</span>}
    </fieldset>
  );
}

/**
 * The teacher's account: name, school, subjects and grades; with `create`, also the email, password and phone.
 * `onSave` sends it and throws ApiError like the api calls.
 */
export function TeacherForm({
  create,
  initial,
  submitLabel,
  onSave,
  onCancel,
}: {
  create?: boolean;
  initial?: TeacherAccount;
  submitLabel: string;
  onSave: (body: NewTeacher) => Promise<void>;
  onCancel: () => void;
}) {
  const t = useT();
  const schools = useAdminData(getSchools, tk("We couldn't load the schools. Please try again."));
  const [form, setForm] = useState({
    fullName: initial?.fullName ?? "",
    email: "",
    password: "",
    phone: "",
    schoolId: initial?.schoolId ?? "",
  });
  const [subjects, setSubjects] = useState<string[]>(initial?.subjects ?? []);
  const [grades, setGrades] = useState<number[]>(initial?.grades ?? []);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));
  const fieldError = (key: string) => {
    const message = Object.entries(fieldErrors).find(([k]) => k.toLowerCase() === key.toLowerCase())?.[1];
    return message ? t(message) : undefined;
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const missing: Record<string, string> = {};
    const fill = tk("Please fill in all fields.");
    if (!form.fullName.trim()) missing.fullName = fill;
    if (create && !form.email.trim()) missing.email = fill;
    if (create && !form.password) missing.password = fill;
    if (!form.schoolId) missing.schoolId = fill;
    if (subjects.length === 0) missing.subjects = tk("Choose at least one subject.");
    if (grades.length === 0) missing.grades = tk("Choose at least one grade from 1 to 12.");
    setFieldErrors(missing);
    if (Object.keys(missing).length > 0) return;

    setSaving(true);
    try {
      await onSave({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
        schoolId: form.schoolId,
        subjects,
        grades: [...grades].sort((a, b) => a - b),
      });
    } catch (err) {
      if (err instanceof ApiError && err.code === "VALIDATION_FAILED") setFieldErrors(err.fieldErrors);
      setError(errorMessage(err, tk("We couldn't save the teacher. Please try again.")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid gap-[1em] sm:grid-cols-2">
        <Field label={t("Full name")} icon={<User className="size-[1.1em]" />} error={fieldError("fullName")}>
          <input value={form.fullName} onChange={(e) => set("fullName")(e.target.value)} className={input} autoComplete="off" />
        </Field>
        <Field label={t("School")} icon={<School className="size-[1.1em]" />} error={fieldError("schoolId")}>
          <select value={form.schoolId} onChange={(e) => set("schoolId")(e.target.value)} disabled={!schools.data} className={`${input} cursor-pointer`}>
            <option value="">{schools.data ? t("Choose the school") : t("Loading")}</option>
            {schools.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        {create && (
          <>
            <Field label={t("Email")} icon={<Mail className="size-[1.1em]" />} error={fieldError("email")}>
              <input type="email" dir="ltr" value={form.email} onChange={(e) => set("email")(e.target.value)} placeholder="teacher@example.com" className={input} autoComplete="off" />
            </Field>
            <Field label={t("Password")} icon={<Lock className="size-[1.1em]" />} error={fieldError("password")}>
              <input
                type={showPassword ? "text" : "password"}
                dir="ltr"
                value={form.password}
                onChange={(e) => set("password")(e.target.value)}
                className={input}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t("Hide password") : t("Show password")}
                className="shrink-0 text-[#14365a]/60 hover:text-[#14365a]"
              >
                {showPassword ? <EyeOff className="size-[1.1em]" /> : <Eye className="size-[1.1em]" />}
              </button>
            </Field>
            <Field label={t("Phone (optional)")} icon={<Phone className="size-[1.1em]" />} error={fieldError("phone")}>
              <input type="tel" dir="ltr" value={form.phone} onChange={(e) => set("phone")(e.target.value)} className={input} />
            </Field>
          </>
        )}
        <Chips label={t("Subjects")} options={SUBJECTS} value={subjects} onChange={setSubjects} error={fieldError("subjects")} render={(s) => t(s)} />
        <Chips label={t("Grades")} options={GRADES} value={grades} onChange={setGrades} error={fieldError("grades")} render={(g) => String(g)} />
      </div>

      {!schools.data && schools.error && <LoadState error={schools.error} onRetry={schools.reload} className="mt-[1em]" />}
      {error && (
        <p role="alert" className="mt-[1em] rounded-[0.8em] bg-[#fdecec] px-[1em] py-[0.6em] text-center text-[0.85em] font-semibold text-[#b83232]">
          {error}
        </p>
      )}

      <div className="mt-[1.4em] flex flex-wrap justify-end gap-[0.6em] text-[0.85em]">
        <button type="button" onClick={onCancel} className="rounded-[0.6em] border border-[#d5dee8] px-[1.2em] py-[0.6em] font-semibold text-[#14365a] hover:bg-[#eef4fa]">
          {t("Cancel")}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-[0.4em] rounded-[0.6em] bg-[#1d6fe0] px-[1.4em] py-[0.6em] font-semibold text-white hover:bg-[#1859b5] disabled:opacity-50"
        >
          {saving && <LoaderCircle className="size-[1em] animate-spin" />} {submitLabel}
        </button>
      </div>
    </form>
  );
}
