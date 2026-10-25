"use client";

import { useI18n } from "@/lib/i18n/client";
import type { ApprovalTab } from "./types";

type Props = {
  tab: ApprovalTab;
  onTab: (tab: ApprovalTab) => void;
  counts: Record<ApprovalTab, number>;
};

const TABS: { key: ApprovalTab; label: string }[] = [
  { key: "all", label: "All Requests" },
  { key: "squad", label: "Squad Joins & Transfers" },
  // Students asking for another mentor, and mentors asking to teach another track.
  { key: "session", label: "Mentor Changes & Track Requests" },
  { key: "milestone", label: "Capstone Milestone Reviews" },
  { key: "certificate", label: "Certificate Approvals" },
  { key: "signup", label: "Mentor & Teacher Sign-ups" },
];

export default function ApprovalTabs({ tab, onTab, counts }: Props) {
  const { t } = useI18n();

  return (
    <div role="tablist" aria-label={t("Request type")} className="flex flex-wrap gap-2">
      {TABS.map(({ key, label }) => {
        const active = tab === key;

        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onTab(key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[0.8rem] font-semibold shadow-sm transition-colors ${
              active ? "bg-[#0d2a45] text-white" : "bg-white text-[#14365a] hover:bg-[#eef4fa]"
            }`}
          >
            {t(label)}
            <span
              className={`rounded-full px-2 py-0.5 text-[0.66rem] font-bold ${
                active ? "bg-[#06b6d4] text-white" : "bg-[#e8eef4] text-[#14365a]/70"
              }`}
            >
              {counts[key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}