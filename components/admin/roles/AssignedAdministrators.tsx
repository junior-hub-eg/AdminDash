"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import { UserCog } from "lucide-react";
import { getAdmins } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk, type TFunction } from "@/lib/i18n/translate";
import { PANEL } from "../page-parts";
import { useAdminData } from "../admin-data";

const COLORS = ["#12676b", "#5b6b88", "#0f6b57", "#1a2b57", "#06b6d4"];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

/** "4m ago", "2h ago", "Yesterday", or the date. */
function lastActive(iso: string, now: number, t: TFunction) {
  const mins = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (mins < 60) return t("Active {n}m ago", { n: mins });
  const hours = Math.round(mins / 60);
  if (hours < 24) return t("Active {n}h ago", { n: hours });
  if (hours < 48) return t("Active Yesterday");
  return t("Active {date}", { date: new Date(iso).toLocaleDateString(dateLocale("en-GB"), { day: "numeric", month: "short" }) });
}

/** The admin accounts (GET admin/admins). Only the main admin may list them; others see a short note. */
export function AssignedAdministrators() {
  const t = useT();
  const admins = useAdminData(getAdmins, tk("Only the main admin can see the admin accounts."));
  const [now] = useState(() => Date.now());
  const list = admins.data ?? [];

  return (
    <section className={`${PANEL} flex min-w-0 flex-col p-[1.3em]`}>
      <header className="mb-[1em] flex items-start justify-between gap-[0.6em]">
        <div className="flex items-center gap-[0.8em]">
          <span className="grid size-[2.4em] shrink-0 place-items-center rounded-[0.6em] bg-[#e6eefb] text-[#14365a]">
            <UserCog className="size-[1.15em]" />
          </span>
          <div>
            <h2 className="text-[1.05em] font-bold text-[#0b1b2b]">{t("Assigned Administrators")}</h2>
            {admins.data && <p className="text-[0.75em] text-[#5b6b7c]">{t("{n} Users currently operating in Admin role", { n: list.length })}</p>}
          </div>
        </div>
        <Link
          href={"/admin/admins" as Route}
          className="shrink-0 rounded-[0.5em] bg-[#eef3fb] px-[0.9em] py-[0.45em] text-[0.72em] font-semibold text-[#0b6f86] hover:bg-[#e6eefb]"
        >
          + {t("Assign User")}
        </Link>
      </header>

      {admins.error ? (
        <p className="rounded-[0.7em] bg-[#f1f5fd] p-[1em] text-[0.8em] text-[#5b6b7c]">{admins.error}</p>
      ) : !admins.data ? (
        <p className="py-[1.5em] text-center text-[0.8em] text-[#8a97a6]">{t("Loading")}…</p>
      ) : (
        <ul className="grid gap-[0.5em]">
          {list.slice(0, 5).map((a, i) => (
            <li key={a.id} className="flex items-center gap-[0.8em] rounded-[0.6em] bg-[#f1f5fd] px-[0.8em] py-[0.65em] text-[0.8em]">
              <span
                className="grid size-[2.6em] shrink-0 place-items-center rounded-full text-[0.9em] font-bold text-white"
                style={{ background: COLORS[i % COLORS.length] }}
              >
                {initials(a.fullName)}
              </span>
              <div className="min-w-0 flex-1">
                <b className="flex flex-wrap items-center gap-[0.5em] text-[1.05em] font-semibold text-[#0b1b2b]">
                  {a.fullName}
                  {a.isOwner && (
                    <span className="rounded-[0.35em] bg-[#e1e9f6] px-[0.6em] py-[0.05em] text-[0.72em] font-semibold text-[#0b6f86]">{t("Lead Admin")}</span>
                  )}
                </b>
                <span className="block truncate text-[0.88em] text-[#5b6b7c]">
                  <span dir="ltr">{a.email}</span> · {a.lastLoginUtc ? lastActive(a.lastLoginUtc, now, t) : t("Never signed in")}
                </span>
              </div>
              <button
                type="button"
                disabled
                title={t("Coming soon")}
                className="hidden shrink-0 cursor-not-allowed text-[0.85em] font-medium text-[#5b6b7c] sm:inline"
              >
                {t("Reassign Role")}
              </button>
            </li>
          ))}
        </ul>
      )}

      {admins.data && (
        <p className="mt-auto flex flex-wrap justify-between gap-[0.5em] pt-[1.2em] text-[0.75em] text-[#5b6b7c]">
          <span>{t("Displaying {n} of {total} assigned members", { n: Math.min(5, list.length), total: list.length })}</span>
          <Link href={"/admin/admins" as Route} className="font-semibold text-[#0b6f86] hover:underline">
            {t("View All Members")} <span className="inline-block rtl:rotate-180">→</span>
          </Link>
        </p>
      )}
    </section>
  );
}
