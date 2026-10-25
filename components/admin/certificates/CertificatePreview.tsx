"use client";

import { GraduationCap, Medal, ShieldCheck } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";
import { MOCK_CERT_SIGNERS, type CertStatus, type MockCertificate } from "../dashboardMock";

type Props = {
  cert: MockCertificate | null;
  /** Approve & sign a certificate that is awaiting approval. */
  onApprove: (id: string) => void;
};

const BADGE: Record<CertStatus, { label: string; cls: string }> = {
  pending: { label: "Ready to Sign", cls: "bg-[#e3f6fb] text-[#0a7f99]" },
  issued: { label: "Signed & Sealed", cls: "bg-[#e1f6ea] text-[#16794a]" },
  revoked: { label: "Revoked", cls: "bg-[#ffe6e6] text-[#b42a2a]" },
};

/**
 * Decorative QR-style mark, generated from the credential id.
 * TODO(api): replace with the real QR that points at the public verify URL.
 */
function QrMark({ seed }: { seed: string }) {
  const N = 21;
  let s = 2166136261;

  for (const ch of seed) s = Math.imul(s ^ ch.charCodeAt(0), 16777619) >>> 0;

  const rand = () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;

    return s / 4294967296;
  };

  const finder = (x: number, y: number): boolean | null => {
    for (const [ox, oy] of [[0, 0], [N - 7, 0], [0, N - 7]]) {
      const dx = x - ox;
      const dy = y - oy;

      if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7) {
        return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
      }
    }

    return null;
  };

  const cells: { x: number; y: number }[] = [];

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const f = finder(x, y);
      const dark = f === null ? rand() > 0.52 : f;

      if (dark) cells.push({ x, y });
    }
  }

  return (
    <svg viewBox={`-1 -1 ${N + 2} ${N + 2}`} className="size-full" aria-hidden="true" shapeRendering="crispEdges">
      <rect x="-1" y="-1" width={N + 2} height={N + 2} fill="#fff" />
      {cells.map(({ x, y }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0a1f2e" />
      ))}
    </svg>
  );
}

export default function CertificatePreview({ cert, onApprove }: Props) {
  const { t } = useI18n();

  const badge = cert ? BADGE[cert.status] : null;

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm" aria-labelledby="cert-preview-title">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="cert-preview-title" className="flex items-center gap-2 text-[0.95rem] font-bold text-[#0d2a45]">
          <ShieldCheck className="size-4 text-[#12676b]" />
          {t("Live Preview Inspector")}
        </h2>

        {badge && (
          <span className={`rounded-md px-2.5 py-1 text-[0.66rem] font-semibold ${badge.cls}`}>{t(badge.label)}</span>
        )}
      </div>

      {!cert ? (
        <div className="grid h-56 place-items-center rounded-2xl border border-dashed border-[#cfe0ee] text-[0.78rem] text-[#14365a]/55">
          {t("Select a certificate to preview it.")}
        </div>
      ) : (
        <>
          <div
            dir="ltr"
            className="relative overflow-hidden rounded-2xl bg-[#08202e] p-5 text-white shadow-[0_18px_40px_-18px_rgba(8,32,46,0.8)]"
          >
            <div className="pointer-events-none absolute inset-2.5 rounded-xl border border-[#12939b]/40" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-white/10">
                  <GraduationCap className="size-4 text-[#2fe0d0]" />
                </span>
                <div>
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#2fe0d0]">
                    {MOCK_CERT_SIGNERS.institute}
                  </p>
                  <p className="text-[0.52rem] uppercase tracking-[0.1em] text-white/60">
                    {MOCK_CERT_SIGNERS.accreditation}
                  </p>
                </div>
              </div>

              <span className="grid size-8 place-items-center rounded-full bg-[#f2c12e] text-[#5a4200]">
                <Medal className="size-4" />
              </span>
            </div>

            <div className="relative mt-5 text-center">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-white/85">
                Certificate of Completion
              </p>
              <span className="mx-auto mt-1.5 block h-0.5 w-8 rounded bg-[#06b6d4]" />

              <p className="mt-3 text-[0.62rem] italic text-white/70">This is proudly awarded to</p>
              <p className="mt-1 text-[1.45rem] font-bold leading-tight text-[#2fe0a8]">{cert.student}</p>

              <p className="mx-auto mt-2 max-w-[18rem] text-[0.62rem] leading-relaxed text-white/75">
                for exemplary fulfillment and defense of all curriculum milestones in the
              </p>
              <p className="mt-0.5 text-[0.72rem] font-bold text-white">{cert.title}</p>
            </div>

            <div className="relative mt-5 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
              <div className="text-center">
                <p className="font-serif text-[0.8rem] italic text-white/85">{MOCK_CERT_SIGNERS.left.sign}</p>
                <span className="mx-auto my-1 block h-px w-full bg-white/25" />
                <p className="text-[0.52rem] text-white/65">{MOCK_CERT_SIGNERS.left.name}</p>
              </div>

              <div className="size-14 overflow-hidden rounded-md">
                <QrMark seed={cert.credentialId} />
              </div>

              <div className="text-center">
                <p className="font-serif text-[0.8rem] italic text-white/85">{MOCK_CERT_SIGNERS.right.sign}</p>
                <span className="mx-auto my-1 block h-px w-full bg-white/25" />
                <p className="text-[0.52rem] text-white/65">{MOCK_CERT_SIGNERS.right.name}</p>
              </div>
            </div>

            {cert.status === "revoked" && (
              <div className="absolute inset-0 grid place-items-center bg-[#08202e]/70">
                <span className="-rotate-12 rounded-lg border-2 border-[#ff6b6b] px-4 py-1 text-lg font-extrabold uppercase tracking-widest text-[#ff6b6b]">
                  {t("Revoked")}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p dir="ltr" className="font-mono text-[0.7rem] font-semibold text-[#14365a]/65">
              #{cert.credentialId}
            </p>

            {cert.status === "pending" && (
              <button
                type="button"
                onClick={() => onApprove(cert.id)}
                className="rounded-lg bg-[#06b6d4] px-4 py-2 text-[0.75rem] font-semibold text-white hover:bg-[#0597b1]"
              >
                {t("Approve & Sign")}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}