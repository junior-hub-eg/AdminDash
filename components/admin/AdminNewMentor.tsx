"use client";

import { useCallback, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Eye, EyeOff, ImageIcon, LoaderCircle, Mail, Briefcase, Lock, User } from "lucide-react";
import { createMentor, getAdminTracks, type AdminMentor, type NewMentor } from "@/lib/admin-api";
import { ApiError, errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminPage } from "./AdminPage";
import { LoadState, useAdminData } from "./admin-data";
import { StarterStudents } from "./StarterStudents";

const card = "rounded-[1.1em] bg-white p-[1.4em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]";
const box =
  "flex h-[2.8em] items-center gap-[0.7em] rounded-[0.7em] border border-[#d5dee8] bg-white px-[1em] text-[0.85em] text-[#14365a] focus-within:border-[#1d6fe0] focus-within:ring-2 focus-within:ring-[#1d6fe0]/20";
const input = "min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#14365a]/40";

function Field({ label, icon, error, hint, children }: { label: string; icon: ReactNode; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[0.85em] font-semibold text-[#0b1b2b]">{label}</span>
      <span className={`mt-[0.4em] ${box} ${error ? "!border-[#b83232]" : ""}`}>
        <span className="shrink-0 text-[#14365a]/50">{icon}</span>
        {children}
      </span>
      {error ? (
        <span role="alert" className="mt-[0.3em] block text-[0.75em] text-[#b83232]">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-[0.3em] block text-[0.75em] text-[#8a97a6]">{hint}</span>
      ) : null}
    </label>
  );
}

export default function AdminNewMentor() {
  const { t } = useI18n();
  const router = useRouter();
  const tracks = useAdminData(getAdminTracks, tk("We couldn't load the tracks. Please try again."));

  const [form, setForm] = useState({ fullName: "", email: "", password: "", title: "", trackCode: "", photoUrl: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<AdminMentor | null>(null);
  const toMentors = useCallback(() => router.push("/admin/mentors" as Route), [router]);

  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const fieldError = (key: string) => {
    const message = Object.entries(fieldErrors).find(([k]) => k.toLowerCase() === key.toLowerCase())?.[1];
    return message ? t(message) : undefined;
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const missing: Record<string, string> = {};
    if (!form.fullName.trim()) missing.fullName = tk("Please fill in all fields.");
    if (!form.email.trim()) missing.email = tk("Please fill in all fields.");
    if (!form.password) missing.password = tk("Please fill in all fields.");
    if (!form.title.trim()) missing.title = tk("Please fill in all fields.");
    if (!form.trackCode) missing.trackCode = tk("Please fill in all fields.");
    if (Object.keys(missing).length > 0) {
      setFieldErrors(missing);
      return;
    }

    const body: NewMentor = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
      title: form.title.trim(),
      trackCode: form.trackCode,
      ...(form.photoUrl.trim() ? { photoUrl: form.photoUrl.trim() } : {}),
    };

    setSaving(true);
    try {
      // Next: offer the students of this track who wait for a mentor (StarterStudents).
      setCreated(await createMentor(body));
    } catch (err) {
      if (err instanceof ApiError && err.code === "VALIDATION_FAILED") setFieldErrors(err.fieldErrors);
      setError(errorMessage(err, tk("We couldn't add the mentor. Please try again.")));
      setSaving(false);
    }
  }

  return (
    <AdminPage>
      <div className="pt-[calc(var(--u)*5.4)]">
        <nav aria-label={t("Breadcrumb")} className="text-[0.7em] font-medium text-[#5b6b7c]">
          <Link href={"/admin/dashboard" as Route} className="hover:underline">
            {t("Admin")}
          </Link>{" "}
          <span aria-hidden>›</span>{" "}
          <Link href={"/admin/mentors" as Route} className="hover:underline">
            {t("Mentors Management")}
          </Link>{" "}
          <span aria-hidden>›</span> <span className="text-[#14365a]">{t("Add Mentor")}</span>
        </nav>
        <h1 className="text-[2em] font-extrabold leading-tight text-[#0b1b2b]">{t("Add Mentor")}</h1>
        <p className="max-w-[34em] text-[0.85em] text-[#5b6b7c]">
          {t("Create a mentor account. The mentor can sign in right away with the email and password you set.")}
        </p>

        {created && (
          <section className={`${card} mx-auto mt-[1.2em] max-w-[46em]`}>
            <p className="mb-[1em] rounded-[0.6em] bg-[#dff7ea] px-[1em] py-[0.6em] text-[0.85em] font-semibold text-[#17935f]">
              {t("{name} was added as a mentor.", { name: created.fullName })}
            </p>
            <StarterStudents mentorId={created.id} mentorName={created.fullName} trackCode={created.trackCode} onDone={toMentors} />
          </section>
        )}

        <form onSubmit={submit} noValidate hidden={!!created} className={`${card} mx-auto mt-[1.2em] max-w-[46em]`}>
          <div className="grid gap-[1em] sm:grid-cols-2">
            <Field label={t("Full name")} icon={<User className="size-[1.1em]" />} error={fieldError("fullName")}>
              <input value={form.fullName} onChange={(e) => set("fullName")(e.target.value)} className={input} autoComplete="off" />
            </Field>

            <Field label={t("Job title")} icon={<Briefcase className="size-[1.1em]" />} error={fieldError("title")}>
              <input
                value={form.title}
                onChange={(e) => set("title")(e.target.value)}
                placeholder={t("e.g. Senior Frontend Engineer")}
                className={input}
              />
            </Field>

            <Field label={t("Email")} icon={<Mail className="size-[1.1em]" />} error={fieldError("email")}>
              <input
                type="email"
                dir="ltr"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
                placeholder="mentor@example.com"
                className={input}
                autoComplete="off"
              />
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

            <Field label={t("Track")} icon={<Briefcase className="size-[1.1em]" />} error={fieldError("trackCode")}>
              <select
                value={form.trackCode}
                onChange={(e) => set("trackCode")(e.target.value)}
                disabled={!tracks.data}
                className={`${input} cursor-pointer`}
              >
                <option value="">{tracks.data ? t("Choose a track") : t("Loading")}</option>
                {tracks.data?.tracks.map((tr) => (
                  <option key={tr.id} value={tr.code}>
                    {t(tr.name)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={t("Photo URL (optional)")} icon={<ImageIcon className="size-[1.1em]" />} error={fieldError("photoUrl")}>
              <input
                type="url"
                dir="ltr"
                value={form.photoUrl}
                onChange={(e) => set("photoUrl")(e.target.value)}
                placeholder="https://..."
                className={input}
              />
            </Field>
          </div>

          {!tracks.data && tracks.error && <LoadState error={tracks.error} onRetry={tracks.reload} className="mt-[1em]" />}

          {error && (
            <p role="alert" className="mt-[1em] rounded-[0.8em] bg-[#fdecec] px-[1em] py-[0.6em] text-center text-[0.85em] font-semibold text-[#b83232]">
              {error}
            </p>
          )}

          <div className="mt-[1.4em] flex flex-wrap justify-end gap-[0.6em] text-[0.85em]">
            <Link
              href={"/admin/mentors" as Route}
              className="rounded-[0.6em] border border-[#d5dee8] px-[1.2em] py-[0.6em] font-semibold text-[#14365a] hover:bg-[#eef4fa]"
            >
              {t("Cancel")}
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-[0.4em] rounded-[0.6em] bg-[#1d6fe0] px-[1.4em] py-[0.6em] font-semibold text-white hover:bg-[#1859b5] disabled:opacity-50"
            >
              {saving && <LoaderCircle className="size-[1em] animate-spin" />} {t("Add Mentor")}
            </button>
          </div>
        </form>
      </div>
    </AdminPage>
  );
}