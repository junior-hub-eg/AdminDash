"use client";

import Image from "next/image";
import { dateLocale } from "@/lib/i18n/translate";

/** A member's photo, or their initials on a cyan circle. */
export function Avatar({ name, photoUrl, className = "size-[2.2em]" }: { name: string; photoUrl: string | null; className?: string }) {
  if (photoUrl) {
    return (
      <span className={`relative inline-block shrink-0 overflow-hidden rounded-full bg-[#e8f2f8] ring-2 ring-white ${className}`}>
        <Image src={photoUrl} alt="" fill sizes="48px" className="object-cover" unoptimized />
      </span>
    );
  }
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full bg-[#0b89a6] text-[0.7em] font-bold text-white ring-2 ring-white ${className}`}
    >
      {initials}
    </span>
  );
}

/** Thin progress bar, 0-100. */
export function Bar({ value, color = "bg-[#06b6d4]" }: { value: number; color?: string }) {
  return (
    <div className="h-[0.45em] w-full overflow-hidden rounded-full bg-[#e7eef6]">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export const shortDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(dateLocale("en-GB"), { day: "numeric", month: "short" }) : "—";
