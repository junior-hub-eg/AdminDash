"use client";

import Link from "next/link";
import type { Route } from "next";
import { ShieldUser } from "lucide-react";
import { getAdmins } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";
import { useAdminData } from "../admin-data";
import { Section } from "../mentor-detail/parts";

const COLORS = ["#12676b", "#5b6b88", "#12939b", "#1a2b57", "#06b6d4"];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

/** The admin accounts (GET admin/admins). Only the main admin may list them; others see a short note. */
export function AssignedAdministrators() {
  const t = useT();
  const admins = useAdminData(getAdmins, tk("Only the main admin can see the admin accounts."));
  const list = admins.data ?? [];

  return (
    <Section
      title={t("Assigned Administrators")}
      sub={admins.data ? t("{n} Users currently operating in this role", { n: list.length }) : undefined}
      action={
        <Link href={"/admin/admins" as Route} className="rounded-[0.5em] bg-[#dff3fb] px-[0.9em] py-[0.4em] text-[0.75em] font-semibold text-[#0b6f86]">
          + {t("Assign User")}
        </Link>
      }
    >
      {admins.error ? (
        <p className="text-[0.8em] text-[#5b6b7c]">{admins.error}</p>
      ) : (
        <ul className="grid gap-[0.6em]">
          {list.slice(0, 5).map((a, i) => (
            <li key={a.id} className="flex items-center gap-[0.8em] rounded-[0.8em] bg-[#f1f5fd] p-[0.7em] text-[0.8em]">
              <span
                className="grid size-[2.6em] shrink-0 place-items-center rounded-full font-bold text-white"
                style={{ background: COLORS[i % COLORS.length] }}
              >
                {initials(a.fullName)}
              </span>
              <div className="min-w-0 flex-1">
                <b className="flex flex-wrap items-center gap-[0.5em] text-[#0b1b2b]">
                  {a.fullName}
                  {a.isOwner && (
                    <span className="rounded-full bg-[#dff3fb] px-[0.6em] py-[0.05em] text-[0.8em] font-semibold text-[#0b6f86]">{t("Owner")}</span>
                  )}
                </b>
                <span dir="ltr" className="block truncate text-[0.9em] text-[#5b6b7c] rtl:text-end">
                  {a.email}
                </span>
              </div>
              <span className="shrink-0 text-[0.85em] text-[#5b6b7c]">
                {a.lastLoginUtc
                  ? new Date(a.lastLoginUtc).toLocaleDateString(dateLocale("en-GB"), { day: "numeric", month: "short" })
                  : t("Never signed in")}
              </span>
            </li>
          ))}
        </ul>
      )}
      {admins.data && (
        <p className="mt-[1em] flex justify-between text-[0.75em] text-[#5b6b7c]">
          <span className="inline-flex items-center gap-[0.4em]">
            <ShieldUser className="size-[1em]" /> {t("Displaying {n} of {total} assigned members", { n: Math.min(5, list.length), total: list.length })}
          </span>
          <Link href={"/admin/admins" as Route} className="font-semibold text-[#0b6f86]">
            {t("View All Members")} →
          </Link>
        </p>
      )}
    </Section>
  );
}
