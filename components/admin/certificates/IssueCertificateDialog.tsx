"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { LoaderCircle, X } from "lucide-react";

import { getAdminStudents } from "@/lib/admin-api";
import { ApiError, errorMessage } from "@/lib/api-client";
import { issueCertificate, type AdminCertificate, type CertificateKind } from "@/lib/admin-certificates-api";
import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { LoadState, useAdminData } from "../admin-data";

const FIELD =
  "w-full rounded-[0.5em] border border-[#d5dee8] bg-white px-[0.8em] py-[0.5em] text-[0.85em] text-[#14365a] outline-none focus:border-[#1d6fe0]";

/** Issue New Certificate: the admin picks a student, a track and a type; it is issued and signed at once. */
export default function IssueCertificateDialog({
  tracks,
  onClose,
  onIssued,
}: {
  tracks: { code: string; name: string }[];
  onClose: () => void;
  onIssued: (certificate: AdminCertificate) => void;
}) {
  const { t } = useI18n();
  const students = useAdminData(getAdminStudents, tk("We couldn't load the students. Please try again."));
  const [search, setSearch] = useState("");
  const [studentId, setStudentId] = useState("");
  const [trackCode, setTrackCode] = useState("");
  const [kind, setKind] = useState<CertificateKind>("TrackCompletion");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    const all = students.data ?? [];
    return (q ? all.filter((s) => s.fullName.toLowerCase().includes(q) || (s.email ?? "").toLowerCase().includes(q)) : all).slice(0, 200);
  }, [students.data, search]);

  const pickStudent = (id: string) => {
    setStudentId(id);
    const student = students.data?.find((s) => s.id === id);
    if (student?.trackCode && !trackCode) setTrackCode(student.trackCode);
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!studentId || !trackCode) {
      setMessage(t("Choose a student and a track."));
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      onIssued(await issueCertificate({ studentId, trackCode, kind, title: title.trim() || null }));
    } catch (err) {
      setMessage(
        err instanceof ApiError && err.code === "CERTIFICATE_EXISTS"
          ? t("This student already has a pending or issued certificate of this type for this track.")
          : errorMessage(err, tk("We couldn't issue the certificate. Please try again.")),
      );
    } finally {
      setBusy(false);
    }
  }

  const label = "grid gap-[0.3em] text-[0.85em]";
  const caption = "font-semibold text-[#14365a]";

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <button type="button" aria-label={t("Close")} onClick={onClose} className="absolute inset-0 cursor-default bg-[#14365a]/40 backdrop-blur-[1px]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("Issue New Certificate")}
        className="relative max-h-[90svh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 text-[#14365a] shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold">{t("Issue New Certificate")}</h2>
          <button type="button" onClick={onClose} aria-label={t("Close")} className="grid size-8 place-items-center rounded-full hover:bg-[#eef4fa]">
            <X className="size-4" />
          </button>
        </div>

        {!students.data ? (
          <LoadState error={students.error} onRetry={students.reload} />
        ) : (
          <form onSubmit={submit} noValidate className="grid gap-[0.9em]">
            <div className={label}>
              <span className={caption}>{t("Student")}</span>
              <input
                type="search"
                className={FIELD}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("Search students by name or email")}
                aria-label={t("Search students by name or email")}
              />
              <select className={FIELD} size={6} value={studentId} onChange={(e) => pickStudent(e.target.value)} aria-label={t("Student")}>
                {matches.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName}
                    {s.trackName ? ` — ${s.trackName}` : ""}
                  </option>
                ))}
              </select>
              {matches.length === 0 && <span className="text-[0.85em] text-[#8a97a6]">{t("No students match your search.")}</span>}
            </div>

            <div className="grid gap-[0.9em] sm:grid-cols-2">
              <label className={label}>
                <span className={caption}>{t("Track")}</span>
                <select className={FIELD} value={trackCode} onChange={(e) => setTrackCode(e.target.value)}>
                  <option value="">{t("Choose a track")}</option>
                  {tracks.map((x) => (
                    <option key={x.code} value={x.code}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={label}>
                <span className={caption}>{t("Certificate type")}</span>
                <select className={FIELD} value={kind} onChange={(e) => setKind(e.target.value as CertificateKind)}>
                  <option value="TrackCompletion">{t("Track Completion")}</option>
                  <option value="Capstone">{t("Capstone")}</option>
                </select>
              </label>
            </div>

            <label className={label}>
              <span className={caption}>{t("Title (optional)")}</span>
              <input className={FIELD} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
              <span className="text-[0.85em] text-[#8a97a6]">{t("Left empty, the title is made from the track or the capstone project.")}</span>
            </label>

            {message && (
              <p role="alert" className="rounded-[0.6em] bg-[#fdecec] px-[0.9em] py-[0.6em] text-[0.85em] font-semibold text-[#b83232]">
                {message}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={onClose} className="rounded-lg border border-[#cfe0ee] px-4 py-2 text-[0.75rem] font-semibold hover:bg-[#eef4fa]">
                {t("Cancel")}
              </button>
              <button
                type="submit"
                disabled={busy || !studentId || !trackCode}
                className="inline-flex items-center gap-2 rounded-lg bg-[#06b6d4] px-4 py-2 text-[0.75rem] font-semibold text-white hover:bg-[#0aa5c0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy && <LoaderCircle className="size-4 animate-spin" />}
                {t("Issue & Sign")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
