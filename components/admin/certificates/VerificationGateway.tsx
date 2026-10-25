"use client";

import { useState, type FormEvent } from "react";
import { CircleAlert, CircleCheck, CircleX, QrCode } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";
import { dateLocale } from "@/lib/i18n/translate";
import type { MockCertificate } from "../dashboardMock";

type Props = {
  certs: MockCertificate[];
  /** Pre-filled credential id (without #), e.g. the selected certificate. */
  initialId?: string;
};

type Result = { kind: "valid" | "pending" | "revoked"; cert: MockCertificate } | { kind: "missing" } | null;

const normalize = (v: string) => v.replace(/[#\s]/g, "").toUpperCase();

export default function VerificationGateway({ certs, initialId = "" }: Props) {
  const { t } = useI18n();

  const [value, setValue] = useState(initialId ? `#${initialId}` : "");
  const [result, setResult] = useState<Result>(null);

  // TODO(api): GET public verify-by-credential-id (on-chain hash lookup).
  const verify = (e: FormEvent) => {
    e.preventDefault();

    const id = normalize(value);

    if (!id) {
      setResult(null);

      return;
    }

    const cert = certs.find((c) => normalize(c.credentialId) === id);

    if (!cert) setResult({ kind: "missing" });
    else setResult({ kind: cert.status === "issued" ? "valid" : cert.status, cert });
  };

  const formatDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(dateLocale(), { dateStyle: "medium" });

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm" aria-labelledby="cert-verify-title">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-[#e3f6fb] text-[#0a7f99]">
          <QrCode className="size-[18px]" />
        </span>
        <div>
          <h2 id="cert-verify-title" className="text-[0.95rem] font-bold text-[#0d2a45]">
            {t("Public Verification Gateway")}
          </h2>
          <p className="text-[0.72rem] text-[#14365a]/60">{t("Validate authenticity via tamper-proof hash")}</p>
        </div>
      </div>

      <form onSubmit={verify} className="flex gap-2.5">
        <label className="min-w-0 flex-1">
          <span className="sr-only">{t("Credential ID")}</span>
          <input
            dir="ltr"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setResult(null);
            }}
            placeholder="#JH-CERT-0000"
            className="h-10 w-full rounded-xl border border-[#e1e8f0] bg-[#eef6fb] px-3.5 font-mono text-[0.78rem] text-[#14365a] outline-none placeholder:text-[#14365a]/40 focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
          />
        </label>

        <button
          type="submit"
          className="h-10 shrink-0 rounded-xl bg-[#06b6d4] px-4 text-[0.78rem] font-semibold text-white hover:bg-[#0597b1]"
        >
          {t("Instant Verify")}
        </button>
      </form>

      <div role="status" aria-live="polite">
        {result?.kind === "valid" && (
          <div className="mt-3 flex items-start gap-3 rounded-xl bg-[#dbe8ff] p-3.5 text-[#14365a]">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#0f6b57] text-white">
              <CircleCheck className="size-[18px]" />
            </span>
            <div className="text-[0.74rem]">
              <p className="font-semibold">
                {t("Valid & Authenticated Certificate")} <span className="mx-1 text-[#14365a]/50">•</span>
                <span className="font-medium text-[#14365a]/70">{t("On-Chain")}</span>
              </p>
              <p className="mt-0.5 text-[#14365a]/75">
                {t("Issued")} {formatDate(result.cert.date)} • {t("Cryptographically Sealed")} • {t("SHA-256 Validated")}
              </p>
              <p className="mt-0.5 font-medium">
                {result.cert.student} — {result.cert.title}
              </p>
            </div>
          </div>
        )}

        {result?.kind === "pending" && (
          <div className="mt-3 flex items-start gap-3 rounded-xl bg-[#fff1da] p-3.5 text-[#7a4a0a]">
            <CircleAlert className="mt-0.5 size-5 shrink-0" />
            <p className="text-[0.74rem] font-medium">
              {t("This certificate exists but is still awaiting admin & mentor sign-off, so it is not verifiable yet.")}
            </p>
          </div>
        )}

        {result?.kind === "revoked" && (
          <div className="mt-3 flex items-start gap-3 rounded-xl bg-[#ffe6e6] p-3.5 text-[#8f1f1f]">
            <CircleX className="mt-0.5 size-5 shrink-0" />
            <p className="text-[0.74rem] font-medium">{t("This certificate has been revoked and is no longer valid.")}</p>
          </div>
        )}

        {result?.kind === "missing" && (
          <div className="mt-3 flex items-start gap-3 rounded-xl bg-[#eef2f7] p-3.5 text-[#14365a]">
            <CircleX className="mt-0.5 size-5 shrink-0 text-[#14365a]/60" />
            <p className="text-[0.74rem] font-medium">{t("No certificate was found for this credential ID.")}</p>
          </div>
        )}
      </div>
    </section>
  );
}