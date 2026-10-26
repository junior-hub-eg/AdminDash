"use client";

import { GraduationCap, Medal, QrCode, ShieldCheck } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";
import { PANEL } from "../page-parts";

/**
 * The designed certificate card. No certificates are issued from the admin yet, so it shows the
 * layout with placeholders (no invented recipient, signer or QR) and an empty-state note.
 */
export default function CertificatePreview() {
  const { t } = useI18n();

  return (
    <section className={`${PANEL} p-[1.3em]`} aria-labelledby="cert-preview-title">
      <div className="mb-[1em] flex items-center justify-between gap-[0.8em]">
        <h2 id="cert-preview-title" className="flex items-center gap-[0.5em] text-[1.05em] font-bold text-[#0b1b2b]">
          <ShieldCheck className="size-[1.1em] text-[#0b6f86]" />
          {t("Live Preview Inspector")}
        </h2>
        <span className="rounded-[0.35em] bg-[#e6eefb] px-[0.7em] py-[0.3em] text-[0.66em] font-semibold text-[#3d4f61]">{t("Template preview")}</span>
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
          <p className="text-[0.6em] font-semibold uppercase tracking-[0.22em] text-white/85">{t("Certificate of Completion")}</p>
          <span className="mx-auto mt-[0.4em] block h-[0.12em] w-[2em] rounded bg-[#06b6d4]" />
          <p className="mt-[0.8em] text-[0.62em] italic text-white/70">{t("This is proudly awarded to")}</p>
          <p className="mx-auto mt-[0.3em] h-[1.4em] w-[11em] rounded-[0.3em] bg-white/10" aria-hidden />
          <p className="mx-auto mt-[0.6em] max-w-[18em] text-[0.62em] leading-relaxed text-white/75">
            {t("for exemplary fulfillment and defense of all curriculum milestones in the")}
          </p>
          <p className="mx-auto mt-[0.3em] h-[0.9em] w-[9em] rounded-[0.3em] bg-white/10" aria-hidden />
        </div>

        <div className="relative mt-[1.4em] grid grid-cols-[1fr_auto_1fr] items-end gap-[0.8em]">
          {[t("Program Director"), t("Lead Mentor")].map((role, i) => (
            <div key={role} className={`text-center ${i === 1 ? "order-3" : ""}`}>
              <span className="mx-auto mb-[0.3em] block h-px w-full bg-white/25" />
              <p className="text-[0.52em] text-white/65">{role}</p>
            </div>
          ))}
          <span className="order-2 grid size-[3.2em] place-items-center rounded-[0.4em] bg-white/90 text-[#0a1f2e]/40">
            <QrCode className="size-[2em]" />
          </span>
        </div>

        <div className="absolute inset-0 grid place-items-center bg-[#0a1f2e]/55 p-[1em]">
          <p className="rounded-[0.6em] bg-white px-[1em] py-[0.6em] text-center text-[0.75em] font-semibold text-[#0b1b2b] shadow-lg">
            {t("No certificates issued yet")}
          </p>
        </div>
      </div>

      <div className="mt-[0.9em] flex flex-wrap items-center justify-between gap-[0.6em]">
        <p className="text-[0.7em] text-[#5b6b7c]">{t("Issuing capstone certificates from the admin is coming soon.")}</p>
        <button
          type="button"
          disabled
          title={t("Coming soon")}
          className="cursor-not-allowed rounded-[0.5em] bg-[#06b6d4] px-[1em] py-[0.5em] text-[0.72em] font-semibold text-white opacity-50"
        >
          {t("Approve & Sign")}
        </button>
      </div>
    </section>
  );
}
