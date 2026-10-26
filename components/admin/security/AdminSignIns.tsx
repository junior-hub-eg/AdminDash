"use client";

import { useCallback, useState } from "react";
import { CircleCheck, CircleX, LogIn } from "lucide-react";
import { getLoginAttempts } from "@/lib/admin-security-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { LoadState, useAdminData } from "../admin-data";
import { INPUT } from "../page-parts";
import { DASH, Empty, Pill, fmt } from "../reports/ui";
import { ago, deviceOf, stamp } from "./audit-ui";
import { Pager } from "./SecurityPanels";


const PAGE_SIZE = 15;

/** Why a sign-in failed, from the backend's error code. */
const REASON: Record<string, string> = {
  INVALID_CREDENTIALS: tk("Wrong email or password"),
  ACCOUNT_LOCKED: tk("Account locked"),
  NOT_AN_ADMIN: tk("Not an admin account"),
  EMAIL_NOT_CONFIRMED: tk("Email not confirmed"),
  ACCOUNT_PENDING_APPROVAL: tk("Waiting for approval"),
  ACCOUNT_REJECTED: tk("Sign-up rejected"),
  VALIDATION_FAILED: tk("Missing email or password"),
  NOT_A_STUDENT: tk("No profile for this account"),
};

/** Login History: every sign-in attempt on both login pages (GET admin/security/logins). */
export function AdminSignIns({ now }: { now: number }) {
  const t = useT();
  const [status, setStatus] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);
  const load = useCallback(
    () => getLoginAttempts(status === "" ? undefined : status === "true", page, PAGE_SIZE),
    [status, page],
  );
  const logins = useAdminData(load, tk("We couldn't load the sign-in history. Please try again."));
  const pages = logins.data ? Math.max(1, Math.ceil(logins.data.total / PAGE_SIZE)) : 1;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-[0.6em]">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as "" | "true" | "false");
            setPage(1);
          }}
          aria-label={t("Filter by result")}
          className={`${INPUT} sm:w-[14em]`}
        >
          <option value="">{t("All attempts")}</option>
          <option value="true">{t("Successful")}</option>
          <option value="false">{t("Failed")}</option>
        </select>
        <span className="text-[0.72em] text-[#5b6b7c]">{t("{count} attempts", { count: fmt(logins.data?.total ?? 0) })}</span>
      </div>

      {!logins.data ? (
        <LoadState error={logins.error} onRetry={logins.reload} />
      ) : logins.data.items.length === 0 ? (
        <Empty icon={LogIn} title={t("No sign-in attempts yet")} className="mt-[1em]" />
      ) : (
        <div className="mt-[1em] overflow-x-auto">
          <table className="w-full min-w-[40em] text-[0.78em]">
            <thead>
              <tr className="text-[0.82em] uppercase tracking-[0.05em] text-[#5b6b7c]">
                <th className="px-[0.9em] py-[0.7em] text-start font-bold">{t("Account")}</th>
                <th className="px-[0.9em] py-[0.7em] text-start font-bold">{t("Result")}</th>
                <th className="px-[0.9em] py-[0.7em] text-start font-bold">{t("When")}</th>
                <th className="px-[0.9em] py-[0.7em] text-start font-bold">{t("IP & Client")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6edf3] bg-white">
              {logins.data.items.map((a) => (
                <tr key={a.id} className="align-top">
                  <td className="px-[0.9em] py-[0.8em]">
                    <span dir="ltr" className="block truncate font-semibold text-[#0b1b2b] rtl:text-end">
                      {a.email || DASH}
                    </span>
                    <span className="block text-[0.9em] text-[#8a97a6]">
                      {a.role ? t(a.role) : t("Unknown account")} · {a.adminLogin ? t("Admin login") : t("Main login")}
                    </span>
                  </td>
                  <td className="px-[0.9em] py-[0.8em]">
                    {a.succeeded ? (
                      <Pill tone="green">
                        <CircleCheck className="size-[1em]" /> {t("Successful")}
                      </Pill>
                    ) : (
                      <>
                        <Pill tone="red">
                          <CircleX className="size-[1em]" /> {t("Failed")}
                        </Pill>
                        {a.failureReason && <span className="mt-[0.3em] block text-[0.9em] text-[#8a97a6]">{t(REASON[a.failureReason] ?? a.failureReason)}</span>}
                      </>
                    )}
                  </td>
                  <td className="px-[0.9em] py-[0.8em]">
                    <span className="block font-semibold text-[#0b1b2b]">{ago(t, a.createdUtc, now)}</span>
                    <span className="block text-[0.9em] text-[#8a97a6]">{stamp(a.createdUtc)}</span>
                  </td>
                  <td className="px-[0.9em] py-[0.8em] text-[#5b6b7c]">
                    <span dir="ltr" className="block font-mono rtl:text-end">
                      {a.ip ?? DASH}
                    </span>
                    <span className="block text-[0.9em] text-[#8a97a6]">{deviceOf(t, a.userAgent)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-[0.8em] flex justify-end text-[0.72em] text-[#5b6b7c]">
        <Pager page={page} pages={pages} onChange={setPage} />
      </div>
    </>
  );
}
