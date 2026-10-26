"use client";

import { Crown, LogIn } from "lucide-react";
import type { AdminAccount } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { dateLocale, type TFunction } from "@/lib/i18n/translate";
import { LoadState } from "../admin-data";
import { Empty, Initials, Pill } from "../reports/ui";

/** "3h ago", "Yesterday"... for the last sign-in. */
export function ago(t: TFunction, iso: string, now: number) {
  const minutes = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return t("Just now");
  if (minutes < 60) return t("{count}m ago", { count: minutes });
  if (minutes < 1440) return t("{count}h ago", { count: Math.floor(minutes / 60) });
  const days = Math.floor(minutes / 1440);
  return days === 1 ? t("Yesterday") : t("{count}d ago", { count: days });
}

const stamp = (iso: string) =>
  new Date(iso).toLocaleString(dateLocale("en-GB"), { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Login History: every admin account with its last sign-in (from GET admin/admins). */
export function AdminSignIns({
  admins,
  error,
  onRetry,
  now,
}: {
  admins: AdminAccount[] | null;
  error: string | null;
  onRetry: () => void;
  now: number;
}) {
  const t = useT();
  if (!admins) return <LoadState error={error} onRetry={onRetry} />;
  if (admins.length === 0) return <Empty icon={LogIn} title={t("No admin accounts")} />;

  // Most recent sign-in first; accounts that never signed in go last.
  const sorted = [...admins].sort((a, b) => (b.lastLoginUtc ?? "").localeCompare(a.lastLoginUtc ?? ""));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36em] text-[0.78em]">
        <thead>
          <tr className="text-[0.82em] uppercase tracking-[0.05em] text-[#5b6b7c]">
            <th className="px-[0.9em] py-[0.7em] text-start font-bold">{t("Administrator")}</th>
            <th className="px-[0.9em] py-[0.7em] text-start font-bold">{t("Role")}</th>
            <th className="px-[0.9em] py-[0.7em] text-start font-bold">{t("Last sign-in")}</th>
            <th className="px-[0.9em] py-[0.7em] text-start font-bold">{t("Account created")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e6edf3] bg-white">
          {sorted.map((a) => (
            <tr key={a.id}>
              <td className="px-[0.9em] py-[0.8em]">
                <span className="flex items-center gap-[0.6em]">
                  <Initials name={a.fullName} />
                  <span className="min-w-0">
                    <span className="block font-semibold text-[#0b1b2b]">{a.fullName}</span>
                    <span dir="ltr" className="block truncate text-[0.9em] text-[#8a97a6] rtl:text-end">
                      {a.email}
                    </span>
                  </span>
                </span>
              </td>
              <td className="px-[0.9em] py-[0.8em]">
                {a.isOwner ? (
                  <Pill tone="amber">
                    <Crown className="size-[1em]" /> {t("Main admin")}
                  </Pill>
                ) : (
                  <Pill tone="cyan">{t("Admin")}</Pill>
                )}
              </td>
              <td className="px-[0.9em] py-[0.8em]">
                {a.lastLoginUtc ? (
                  <>
                    <span className="block font-semibold text-[#0b1b2b]">{ago(t, a.lastLoginUtc, now)}</span>
                    <span className="block text-[0.9em] text-[#8a97a6]">{stamp(a.lastLoginUtc)}</span>
                  </>
                ) : (
                  <span className="text-[#8a97a6]">{t("Never signed in")}</span>
                )}
              </td>
              <td className="px-[0.9em] py-[0.8em] text-[#5b6b7c]">{stamp(a.createdUtc)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
