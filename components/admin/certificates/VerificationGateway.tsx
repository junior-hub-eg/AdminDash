"use client";

import { useState, type FormEvent } from "react";
import { CircleCheck, CircleX, LoaderCircle, ScanQrCode, ScanLine } from "lucide-react";

import { ApiError, errorMessage } from "@/lib/api-client";
import { verifyCertificate, type VerifiedCertificate } from "@/lib/admin-certificates-api";
import { useI18n } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";
import { PANEL } from "../page-parts";

type Result = { kind: "valid"; cert: VerifiedCertificate } | { kind: "missing" } | { kind: "error"; message: string } | null;

const normalize = (v: string) => v.replace(/[#\s]/g, "").toUpperCase();

/** Checks a certificate code against the public verify endpoint (GET recruitment/certificates/{code}). */
export default function VerificationGateway() {
  const { t } = useI18n();

  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>(null);

  const verify = async (e: FormEvent) => {
    e.preventDefault();
    const code = normalize(value);
    if (!code) return;
    setBusy(true);
    setResult(null);
    try {
      setResult({ kind: "valid", cert: await verifyCertificate(code) });
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 400)) setResult({ kind: "missing" });
      else setResult({ kind: "error", message: errorMessage(err, tk("We couldn't check this certificate. Please try again.")) });
    } finally {
      setBusy(false);
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(dateLocale("en-US"), { dateStyle: "medium" });

  return (
    <section className={`${PANEL} p-[1.3em]`} aria-labelledby="cert-verify-title">
      <div className="mb-[1em] flex items-center gap-[0.8em]">
        <span className="grid size-[2.3em] shrink-0 place-items-center rounded-[0.6em] bg-[#e6eefb] text-[#14365a]">
          <ScanQrCode className="size-[1.15em]" />
        </span>
        <div>
          <h2 id="cert-verify-title" className="text-[1.05em] font-bold text-[#0b1b2b]">
            {t("Public Verification Gateway")}
          </h2>
          <p className="text-[0.72em] text-[#5b6b7c]">{t("Validate authenticity via tamper-proof hash")}</p>
        </div>
      </div>

      <form onSubmit={verify} className="flex gap-[0.6em]">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">{t("Credential ID")}</span>
          <input
            dir="ltr"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setResult(null);
            }}
            placeholder="#JH-SIM-4F7K2Q"
            className="h-[2.9em] w-full rounded-[0.6em] bg-[#eef3fb] pe-[2.6em] ps-[0.9em] text-[0.8em] text-[#0b1b2b] outline-none placeholder:text-[#8a97a6] focus:ring-2 focus:ring-[#06b6d4]/40"
          />
          <ScanLine className="pointer-events-none absolute end-[0.8em] top-1/2 size-[1.05em] -translate-y-1/2 text-[#5b6b7c]" aria-hidden />
        </label>

        <button
          type="submit"
          disabled={busy || !normalize(value)}
          className="inline-flex h-[2.9em] shrink-0 items-center gap-[0.4em] rounded-[0.6em] bg-[#06b6d4] px-[1.1em] text-[0.8em] font-semibold text-white hover:bg-[#0aa5c0] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy && <LoaderCircle className="size-[1em] animate-spin" />} {t("Instant Verify")}
        </button>
      </form>

      <div role="status" aria-live="polite">
        {result?.kind === "valid" && (
          <div className="mt-[0.9em] flex items-start gap-[0.8em] rounded-[0.6em] bg-[#dbe8ff] p-[0.9em] text-[#14365a]">
            <span className="grid size-[2em] shrink-0 place-items-center rounded-full bg-[#0f6b57] text-white">
              <CircleCheck className="size-[1.1em]" />
            </span>
            <div className="min-w-0 text-[0.75em]">
              <p className="font-semibold text-[#0b6f86]">
                {t("Valid & Authenticated Certificate")}
                {result.cert.isSimulation && (
                  <>
                    <span className="mx-[0.4em] text-[#14365a]/50">•</span>
                    <span className="font-medium text-[#3d4f61]">{t("Simulation")}</span>
                  </>
                )}
              </p>
              <p className="mt-[0.2em] font-semibold text-[#0b1b2b]">
                {result.cert.studentName} — {result.cert.role} · {result.cert.companyName}
              </p>
              <p className="mt-[0.2em] text-[#3d4f61]">
                {t("Issued")} {formatDate(result.cert.issuedUtc)} • {result.cert.trackName} • {t("Score")} {result.cert.scorePercent}%
              </p>
              <p className="mt-[0.2em] text-[#3d4f61]" dir="ltr">
                #{result.cert.code}
              </p>
              {result.cert.disclaimer && <p className="mt-[0.3em] italic text-[#5b6b7c]">{result.cert.disclaimer}</p>}
            </div>
          </div>
        )}

        {result?.kind === "missing" && (
          <div className="mt-[0.9em] flex items-start gap-[0.7em] rounded-[0.6em] bg-[#eef2f7] p-[0.9em] text-[#14365a]">
            <CircleX className="mt-[0.1em] size-[1.2em] shrink-0 text-[#5b6b7c]" />
            <p className="text-[0.75em] font-medium">{t("No certificate was found for this credential ID.")}</p>
          </div>
        )}

        {result?.kind === "error" && (
          <div className="mt-[0.9em] flex items-start gap-[0.7em] rounded-[0.6em] bg-[#fdecec] p-[0.9em] text-[#b83232]">
            <CircleX className="mt-[0.1em] size-[1.2em] shrink-0" />
            <p className="text-[0.75em] font-medium">{result.message}</p>
          </div>
        )}
      </div>
    </section>
  );
}
