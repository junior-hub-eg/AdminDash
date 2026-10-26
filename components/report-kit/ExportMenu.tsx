"use client";

/**
 * ExportMenu: "Export" button with Excel (English / Arabic) and PDF items.
 *   onExport(format: "xlsx" | "pdf", lang: "en" | "ar"): may return a promise; while it runs the
 *     button shows a spinner, and a rejected promise's message is shown under the button.
 *   excelLanguages? (default both), pdfLanguages? (default both): which items to offer. A dashboard
 *     that can only print in the page language passes just that one; the item then says so.
 *   disabled?: e.g. while the report is still loading.
 */

import { useState } from "react";
import { ChevronDown, Download, FileSpreadsheet, FileText, LoaderCircle } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { BTN_PRIMARY } from "./tokens";

export type ExportFormat = "xlsx" | "pdf";
export type ExportLang = "en" | "ar";

const LANG_NAME: Record<ExportLang, string> = { en: "English", ar: "العربية" };

export function ExportMenu({
  onExport,
  excelLanguages = ["en", "ar"],
  pdfLanguages = ["en", "ar"],
  disabled,
}: {
  onExport: (format: ExportFormat, lang: ExportLang) => Promise<void> | void;
  excelLanguages?: ExportLang[];
  pdfLanguages?: ExportLang[];
  disabled?: boolean;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (format: ExportFormat, lang: ExportLang) => {
    setOpen(false);
    setError(null);
    setBusy(true);
    try {
      await onExport(format, lang);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : t("The export failed. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const items = [
    ...excelLanguages.map((lang) => ({ format: "xlsx" as const, lang, icon: FileSpreadsheet, label: t("Excel ({language})", { language: LANG_NAME[lang] }) })),
    ...pdfLanguages.map((lang) => ({ format: "pdf" as const, lang, icon: FileText, label: t("PDF ({language})", { language: LANG_NAME[lang] }) })),
  ];

  return (
    <div className="relative print:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || busy}
        aria-haspopup="menu"
        aria-expanded={open}
        className={BTN_PRIMARY}
      >
        {busy ? <LoaderCircle className="size-[1.1em] animate-spin" /> : <Download className="size-[1.1em]" />}
        {busy ? t("Preparing…") : t("Export")}
        <ChevronDown className="size-[1em]" />
      </button>
      {open && (
        <>
          <button type="button" aria-label={t("Close menu")} className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />
          <div role="menu" className="absolute end-0 top-full z-50 mt-[0.4em] min-w-[14em] overflow-hidden rounded-[0.9em] border border-[#e1e8f0] bg-white py-[0.3em] shadow-lg">
            {items.map((it, i) => (
              <button
                key={`${it.format}-${it.lang}`}
                type="button"
                role="menuitem"
                onClick={() => run(it.format, it.lang)}
                className={`flex w-full items-center gap-[0.6em] px-[1em] py-[0.6em] text-start text-[0.82em] font-semibold text-[#14365a] hover:bg-[#eef4fa] ${
                  i > 0 && items[i - 1].format !== it.format ? "border-t border-[#eef2f7]" : ""
                }`}
              >
                <it.icon className={`size-[1.1em] ${it.format === "xlsx" ? "text-[#17935f]" : "text-[#d04a4a]"}`} />
                {it.label}
              </button>
            ))}
          </div>
        </>
      )}
      {error && (
        <p role="alert" className="absolute end-0 top-full z-30 mt-[0.4em] w-max max-w-[22em] rounded-[0.6em] bg-[#fdecec] px-[0.8em] py-[0.4em] text-[0.72em] font-semibold text-[#b83232]">
          {error}
        </p>
      )}
    </div>
  );
}
