"use client";

import type { ReactNode } from "react";
import { useT } from "@/lib/i18n/client";

/** A big light input box as in the Platform Settings design. */
export const BOX =
  "flex h-[2.9em] w-full min-w-0 items-center gap-[0.6em] rounded-[0.7em] bg-[#eef4fb] px-[1em] text-[0.85em] text-[#0b1b2b] focus-within:ring-2 focus-within:ring-[#06b6d4]/40";

export function Field({
  label,
  children,
  hint,
  error,
  soon,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string | null;
  soon?: boolean;
}) {
  const t = useT();
  return (
    <label className={`block min-w-0 ${soon ? "opacity-60" : ""}`}>
      <span className="mb-[0.4em] flex items-center gap-[0.5em] text-[0.75em] font-semibold text-[#0b1b2b]">
        {label}
        {soon && <span className="text-[0.85em] font-medium text-[#8a97a6]">· {t("Coming soon")}</span>}
      </span>
      {children}
      {hint && <span className="mt-[0.35em] block text-[0.68em] text-[#8a97a6]">{hint}</span>}
      {error && <span className="mt-[0.35em] block text-[0.72em] text-[#b83232]">{error}</span>}
    </label>
  );
}

/** A soft tile used for the squad rules, languages and integrations. */
export function Tile({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`min-w-0 rounded-[0.9em] bg-[#f3f7fc] p-[1em] ${className}`}>{children}</div>;
}
