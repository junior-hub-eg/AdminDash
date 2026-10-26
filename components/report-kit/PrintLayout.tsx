"use client";

/**
 * Print / "Save as PDF" helpers. The print rules live in app/globals.css (@media print, "Reports").
 *
 * PrintRoot: wrap the report page in it (class jh-report). While it is on the page, printing hides the
 *   app sidebar and top bar, lets the page grow past the screen, uses A4 and keeps colors.
 * PrintHeader: shown only on paper: logo + brand, title, date range, generated time (filled in at
 *   print time, so Ctrl+P works too). Props: title, range (text), logoSrc?, brand?, extra?.
 * PrintSection: a block that starts on a new page when `breakBefore`, and stays together when it fits.
 * printReport(): opens the browser's print dialog (the user picks "Save as PDF").
 * Hide anything else on paper with Tailwind's `print:hidden`.
 */

import { useEffect, useRef, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n/client";

export function printReport() {
  window.print();
}

export function PrintRoot({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`jh-report flex flex-col gap-[1.4em] ${className}`}>{children}</div>;
}

export function PrintSection({ children, breakBefore = false, className = "" }: { children: ReactNode; breakBefore?: boolean; className?: string }) {
  return <div className={`${breakBefore ? "jh-print-break" : ""} ${className}`}>{children}</div>;
}

export function PrintHeader({
  title,
  range,
  logoSrc = "/images/admin/reicon_grad-cap-filled.png",
  brand = "JUNIOR HUB",
  extra,
}: {
  title: string;
  range: string;
  logoSrc?: string;
  brand?: string;
  extra?: string;
}) {
  const { t, intl } = useI18n();
  const stamp = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Written straight into the DOM: a state update might not render before the print snapshot.
    const fill = () => {
      if (stamp.current) {
        stamp.current.textContent = new Date().toLocaleString(intl, {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    };
    fill();
    window.addEventListener("beforeprint", fill);
    return () => window.removeEventListener("beforeprint", fill);
  }, [intl]);

  return (
    <header className="jh-print-header hidden items-center justify-between gap-[1em] border-b-2 border-[#06b6d4] pb-[0.8em] print:flex">
      <div className="flex items-center gap-[0.8em]">
        {/* eslint-disable-next-line @next/next/no-img-element -- a plain img prints reliably */}
        <img src={logoSrc} alt="" width={40} height={40} className="size-[2.6em] object-contain" />
        <div>
          <p className="text-[0.7em] font-bold tracking-[0.08em] text-[#0b6f86]">{brand}</p>
          <h1 className="text-[1.5em] font-extrabold leading-tight text-[#0b1b2b]">{title}</h1>
          {extra && <p className="text-[0.75em] text-[#5b6b7c]">{extra}</p>}
        </div>
      </div>
      <dl className="text-end text-[0.75em] text-[#5b6b7c]">
        <dt className="font-semibold">{t("Date range")}</dt>
        <dd className="font-bold text-[#0b1b2b]" suppressHydrationWarning>
          {range}
        </dd>
        <dt className="mt-[0.3em] font-semibold">{t("Generated")}</dt>
        <dd className="font-bold text-[#0b1b2b]">
          <span ref={stamp} />
        </dd>
      </dl>
    </header>
  );
}
