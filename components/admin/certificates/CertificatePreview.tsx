"use client";

import { certificateTitle } from "@/lib/certificate-title";
import { useState, type FormEvent } from "react";
import { Ban, GraduationCap, LoaderCircle, Medal, QrCode, ShieldCheck } from "lucide-react";

import { errorMessage } from "@/lib/api-client";
import { approveCertificate, revokeCertificate, type AdminCertificate } from "@/lib/admin-certificates-api";
import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { PANEL } from "../page-parts";
import { formatCertificateDate, KIND_LABEL, STATUS_LABEL, STATUS_STYLE } from "./CertificatesTable";

/**
 * The certificate card for the selected row: student, title, track, credential id, date and signer. A pending one can be
 * approved and signed; a pending or issued one can be revoked with a reason. The page gives it a key per certificate,
 * so the revoke form starts fresh for each one.
 */
export default function CertificatePreview({
  certificate,
  onChanged,
}: {
  certificate: AdminCertificate | null;
  onChanged: (certificate: AdminCertificate) => void;
}) {
  const { t } = useI18n();
  const [busy, setBusy] = useState<"approve" | "revoke" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [reason, setReason] = useState("");

  const approve = async () => {
    if (!certificate) return;
    setBusy("approve");
    setError(null);
    try {
      onChanged(await approveCertificate(certificate.id));
    } catch (err) {
      setError(errorMessage(err, tk("We couldn't approve this certificate. Please try again.")));
    } finally {
      setBusy(null);
    }
  };

  const revoke = async (e: FormEvent) => {
    e.preventDefault();
    if (!certificate || !reason.trim()) return;
    setBusy("revoke");
    setError(null);
    try {
      onChanged(await revokeCertificate(certificate.id, reason.trim()));
      setRevoking(false);
      setReason("");
    } catch (err) {
      setError(errorMessage(err, tk("We couldn't revoke this certificate. Please try again.")));
    } finally {
      setBusy(null);
    }
  };

  const c = certificate;
  const signer = c?.signerName ?? null;

  return (
    <section className={`${PANEL} p-[1.3em]`} aria-labelledby="cert-preview-title">
      <div className="mb-[1em] flex items-center justify-between gap-[0.8em]">
        <h2 id="cert-preview-title" className="flex items-center gap-[0.5em] text-[1.05em] font-bold text-[#0b1b2b]">
          <ShieldCheck className="size-[1.1em] text-[#0b6f86]" />
          {t("Live Preview Inspector")}
        </h2>
        {c ? (
          <span className={`rounded-[0.35em] px-[0.7em] py-[0.3em] text-[0.66em] font-semibold ${STATUS_STYLE[c.status]}`}>{t(STATUS_LABEL[c.status])}</span>
        ) : (
          <span className="rounded-[0.35em] bg-[#e6eefb] px-[0.7em] py-[0.3em] text-[0.66em] font-semibold text-[#3d4f61]">{t("Template preview")}</span>
        )}
      </div>

      <div className="relative overflow-hidden rounded-[0.9em] bg-[#0a1f2e] p-[1.2em] text-white shadow-[0_18px_40px_-18px_rgba(8,32,46,0.8)]">
        <div className="pointer-events-none absolute inset-[0.6em] rounded-[0.6em] border border-[#12939b]/40" />
        <span aria-hidden className="pointer-events-none absolute left-1/2 top-[40%] size-[12em] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />

        <div className="relative flex items-start justify-between gap-[0.8em]">
          <div className="flex items-center gap-[0.6em]">
            <span className="grid size-[2em] place-items-center rounded-[0.5em] bg-white/10">
              <GraduationCap className="size-[1em] text-[#2fe0d0]" />
            </span>
            <div>
              <p className="text-[0.62em] font-bold uppercase tracking-[0.14em] text-[#2fe0d0]">Junior Hub Academy</p>
              <p className="text-[0.52em] uppercase tracking-[0.1em] text-white/60">{t("Accredited Technology Institute")}</p>
            </div>
          </div>
          <span className="grid size-[2em] place-items-center rounded-full bg-[#f2c12e] text-[#5a4200]">
            <Medal className="size-[1em]" />
          </span>
        </div>

        <div className="relative mt-[1.6em] text-center">
          <p className="text-[0.6em] font-semibold uppercase tracking-[0.22em] text-white/85">
            {c?.kind === "Capstone" ? t("Capstone Certificate") : t("Certificate of Completion")}
          </p>
          <span className="mx-auto mt-[0.4em] block h-[0.12em] w-[2em] rounded bg-[#06b6d4]" />
          <p className="mt-[0.8em] text-[0.62em] italic text-white/70">{t("This is proudly awarded to")}</p>
          {c ? (
            <p className="mt-[0.3em] text-[1.05em] font-bold text-white">{c.studentName}</p>
          ) : (
            <p className="mx-auto mt-[0.3em] h-[1.4em] w-[11em] rounded-[0.3em] bg-white/10" aria-hidden />
          )}
          <p className="mx-auto mt-[0.6em] max-w-[18em] text-[0.62em] leading-relaxed text-white/75">
            {t("for exemplary fulfillment and defense of all curriculum milestones in the")}
          </p>
          {c ? (
            <>
              <p className="mt-[0.3em] text-[0.8em] font-semibold text-[#2fe0d0]">{c.trackName}</p>
              <p className="mt-[0.2em] text-[0.62em] text-white/80">{certificateTitle(c.title, t)}</p>
            </>
          ) : (
            <p className="mx-auto mt-[0.3em] h-[0.9em] w-[9em] rounded-[0.3em] bg-white/10" aria-hidden />
          )}
        </div>

        <div className="relative mt-[1.4em] grid grid-cols-[1fr_auto_1fr] items-end gap-[0.8em]">
          <div className="text-center">
            <p className="text-[0.62em] font-semibold text-white/90">{c ? formatCertificateDate(c.issuedUtc ?? c.requestedUtc) : ""}</p>
            <span className="mx-auto mb-[0.3em] mt-[0.2em] block h-px w-full bg-white/25" />
            <p className="text-[0.52em] text-white/65">{c?.issuedUtc ? t("Date of Issue") : t("Requested on")}</p>
          </div>
          <span className="grid size-[3.2em] place-items-center rounded-[0.4em] bg-white/90 text-[#0a1f2e]/40">
            <QrCode className="size-[2em]" />
          </span>
          <div className="text-center">
            <p className="truncate text-[0.62em] font-semibold italic text-white/90">{signer ?? ""}</p>
            <span className="mx-auto mb-[0.3em] mt-[0.2em] block h-px w-full bg-white/25" />
            <p className="text-[0.52em] text-white/65">{c?.signerTitle ? t(c.signerTitle) : t("Junior Hub Admin")}</p>
          </div>
        </div>

        {c && (
          <p className="relative mt-[0.9em] text-center font-mono text-[0.56em] tracking-[0.1em] text-white/60" dir="ltr">
            #{c.credentialId}
          </p>
        )}

        {!c && (
          <div className="absolute inset-0 grid place-items-center bg-[#0a1f2e]/55 p-[1em]">
            <p className="rounded-[0.6em] bg-white px-[1em] py-[0.6em] text-center text-[0.75em] font-semibold text-[#0b1b2b] shadow-lg">
              {t("Select a certificate to preview it")}
            </p>
          </div>
        )}
        {c?.status === "Revoked" && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="-rotate-12 rounded-[0.4em] border-2 border-[#ff6b6b] px-[0.8em] py-[0.2em] text-[1.1em] font-extrabold uppercase tracking-[0.2em] text-[#ff6b6b]">
              {t("Revoked")}
            </span>
          </div>
        )}
      </div>

      {c && (
        <dl className="mt-[0.9em] grid grid-cols-2 gap-x-[1em] gap-y-[0.4em] text-[0.72em]">
          <dt className="text-[#5b6b7c]">{t("Type")}</dt>
          <dd className="font-semibold text-[#0b1b2b]">{t(KIND_LABEL[c.kind])}</dd>
          {c.score !== null && (
            <>
              <dt className="text-[#5b6b7c]">{t("Score")}</dt>
              <dd className="font-semibold text-[#0b1b2b]">{Math.round(c.score)}%</dd>
            </>
          )}
          {c.courseTitle && (
            <>
              <dt className="text-[#5b6b7c]">{t("Course")}</dt>
              <dd className="font-semibold text-[#0b1b2b]">{c.courseTitle}</dd>
            </>
          )}
          {c.level && (
            <>
              <dt className="text-[#5b6b7c]">{t("Level")}</dt>
              <dd className="font-semibold text-[#0b1b2b]">{t(c.level)}</dd>
            </>
          )}
          {c.squadName && (
            <>
              <dt className="text-[#5b6b7c]">{t("Squad")}</dt>
              <dd className="font-semibold text-[#0b1b2b]">{c.squadName}</dd>
            </>
          )}
          {c.status === "Revoked" && (
            <>
              <dt className="text-[#5b6b7c]">{t("Revoked on")}</dt>
              <dd className="font-semibold text-[#b83232]">{formatCertificateDate(c.revokedUtc)}</dd>
              {c.revokeReason && (
                <>
                  <dt className="text-[#5b6b7c]">{t("Reason")}</dt>
                  <dd className="font-semibold text-[#0b1b2b]">{c.revokeReason}</dd>
                </>
              )}
            </>
          )}
        </dl>
      )}

      {error && (
        <p role="alert" className="mt-[0.8em] rounded-[0.6em] bg-[#fdecec] px-[0.9em] py-[0.6em] text-[0.72em] font-semibold text-[#b83232]">
          {error}
        </p>
      )}

      {c && revoking && (
        <form onSubmit={revoke} className="mt-[0.9em] space-y-[0.5em]">
          <label className="grid gap-[0.3em] text-[0.72em]">
            <span className="font-semibold text-[#14365a]">{t("Why is this certificate revoked?")}</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              required
              autoFocus
              className="h-[5em] w-full rounded-[0.5em] border border-[#d5dee8] bg-white px-[0.8em] py-[0.5em] text-[#14365a] outline-none focus:border-[#1d6fe0]"
            />
          </label>
          <div className="flex justify-end gap-[0.5em]">
            <button
              type="button"
              onClick={() => setRevoking(false)}
              className="rounded-[0.5em] border border-[#cfe0ee] px-[1em] py-[0.5em] text-[0.72em] font-semibold text-[#14365a] hover:bg-[#eef4fa]"
            >
              {t("Cancel")}
            </button>
            <button
              type="submit"
              disabled={busy !== null || !reason.trim()}
              className="inline-flex items-center gap-[0.4em] rounded-[0.5em] bg-[#d64545] px-[1em] py-[0.5em] text-[0.72em] font-semibold text-white hover:bg-[#c23a3a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === "revoke" && <LoaderCircle className="size-[1em] animate-spin" />}
              {t("Revoke Certificate")}
            </button>
          </div>
        </form>
      )}

      <div className="mt-[0.9em] flex flex-wrap items-center justify-between gap-[0.6em]">
        <p className="text-[0.7em] text-[#5b6b7c]">
          {!c
            ? t("Pick a row in the table to inspect and sign it.")
            : c.status === "Pending"
              ? t("Approving signs the certificate with your name and notifies the student.")
              : c.status === "Issued"
                ? t("Issued {date} • signed by {name}", { date: formatCertificateDate(c.issuedUtc), name: signer ?? "—" })
                : t("This certificate is no longer valid.")}
        </p>
        <div className="flex gap-[0.5em]">
          {c && c.status !== "Revoked" && !revoking && (
            <button
              type="button"
              onClick={() => setRevoking(true)}
              disabled={busy !== null}
              className="inline-flex items-center gap-[0.4em] rounded-[0.5em] border border-[#f3c7c7] bg-white px-[1em] py-[0.5em] text-[0.72em] font-semibold text-[#b83232] hover:bg-[#fdf3f3] disabled:opacity-50"
            >
              <Ban className="size-[1em]" /> {t("Revoke")}
            </button>
          )}
          <button
            type="button"
            onClick={approve}
            disabled={!c || c.status !== "Pending" || busy !== null}
            className="inline-flex items-center gap-[0.4em] rounded-[0.5em] bg-[#06b6d4] px-[1em] py-[0.5em] text-[0.72em] font-semibold text-white hover:bg-[#0aa5c0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy === "approve" && <LoaderCircle className="size-[1em] animate-spin" />}
            {t("Approve & Sign")}
          </button>
        </div>
      </div>
    </section>
  );
}
