"use client";

import { Award, Download, Gift, ListChecks, Pencil, Plus, Radio } from "lucide-react";
import type { AdminStudent } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { downloadCsv, Empty, Section, Soon } from "../reports/ui";

/** XP Economy Rulebook: the table as designed; rules are not configurable on the server yet. */
export function XpRulebook() {
  const t = useT();
  const heads = [tk("Event trigger rule"), tk("Category"), tk("Award value"), tk("Daily limit"), tk("Status"), tk("Action")];
  return (
    <Section
      id="rewards-rules"
      title={t("XP Economy Rulebook")}
      description={t("Automated incentives that reward student progress with XP.")}
      aside={
        <button type="button" disabled className="inline-flex items-center gap-[0.3em] rounded-[0.6em] border border-[#dfe7f1] px-[0.8em] py-[0.4em] text-[0.72em] font-bold text-[#0b89a6] opacity-60">
          <Plus className="size-[1em]" /> {t("Add Event Trigger")}
        </button>
      }
    >
      <div className="mt-[1em] overflow-x-auto">
        <table className="w-full min-w-[36em] text-[0.75em]">
          <thead>
            <tr className="bg-[#f1f6fb] text-[0.85em] uppercase tracking-[0.05em] text-[#5b6b7c]">
              {heads.map((h, i) => (
                <th
                  key={h}
                  className={`px-[0.9em] py-[0.8em] text-start font-bold ${i === 0 ? "rounded-s-[0.6em]" : ""} ${i === heads.length - 1 ? "rounded-e-[0.6em]" : ""}`}
                >
                  {t(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={heads.length} className="pt-[0.8em]">
                <Empty
                  icon={ListChecks}
                  title={t("XP rules are not configurable yet")}
                  text={t("XP is awarded by the platform's built-in rules today; editing them from here is coming soon.")}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-[0.6em] flex items-center gap-[0.4em] text-[0.7em] text-[#8a97a6]">
        <Pencil className="size-[1em]" /> {t("Editing rules")}: <Soon />
      </p>
    </Section>
  );
}

/** Badge Collection: no badge catalogue API yet. */
export function BadgeCollection({ badgesEarned }: { badgesEarned: number | null }) {
  const t = useT();
  return (
    <Section
      id="rewards-badges"
      title={t("Badge Collection")}
      description={t("Tiered achievement assets")}
      aside={
        <button type="button" disabled className="text-[0.72em] font-bold text-[#0b89a6] opacity-50">
          {t("Manage All")}
        </button>
      }
    >
      <Empty
        icon={Award}
        title={t("Badge catalogue coming soon")}
        text={
          badgesEarned != null
            ? t("Students have earned {count} badges so far; the catalogue of badges will be listed here.", { count: badgesEarned.toLocaleString("en") })
            : undefined
        }
        className="mt-[1em]"
      />
    </Section>
  );
}

/** Store Redemptions: no rewards store yet. */
export function StoreRedemptions() {
  const t = useT();
  return (
    <Section title={t("Store Redemptions")} description={t("Gear, passes and 1-on-1s students claim with their XP.")} aside={<Soon />}>
      <Empty icon={Gift} title={t("No redemptions yet")} text={t("The rewards store is coming soon.")} className="mt-[1em]" />
    </Section>
  );
}

/** Live XP Ledger: there is no per-event XP feed, so it stays empty; the CSV exports the student XP standings. */
export function XpLedger({ ranked }: { ranked: AdminStudent[] | null }) {
  const t = useT();
  const exportCsv = () => {
    if (!ranked) return;
    downloadCsv("junior-hub-xp-leaderboard.csv", [
      [t("Rank"), t("Student"), t("Track"), t("Squad"), t("Total XP")],
      ...ranked.map((s, i) => [i + 1, s.fullName, s.trackName ?? "", s.squadName ?? "", s.totalXp]),
    ]);
  };
  return (
    <Section
      title={t("Live XP Ledger")}
      aside={
        <span className="inline-flex items-center gap-[0.35em] text-[0.7em] text-[#8a97a6]">
          <Radio className="size-[1em]" /> <Soon />
        </span>
      }
    >
      <Empty icon={Radio} title={t("No live XP feed yet")} text={t("Each XP award will stream here once the ledger is available.")} className="mt-[1em]" />
      <button
        type="button"
        onClick={exportCsv}
        disabled={!ranked || ranked.length === 0}
        className="mt-[0.9em] inline-flex w-full items-center justify-center gap-[0.4em] rounded-[0.7em] bg-[#f1f6fb] px-[1em] py-[0.6em] text-[0.75em] font-bold text-[#14365a] hover:bg-[#e6eef7] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download className="size-[1em]" /> {t("Download XP Leaderboard (CSV)")}
      </button>
    </Section>
  );
}
