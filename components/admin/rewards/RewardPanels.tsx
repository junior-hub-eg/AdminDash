"use client";

import { useEffect, useState } from "react";
import { Award, Download, Gem, Gift, ListChecks, Pencil, Power, Radio, RotateCcw, Save, Sparkles, UserPlus } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import {
  downloadXpLedgerCsv,
  getXpLedger,
  getXpRules,
  updateXpRule,
  type AdminBadge,
  type BadgeRarity,
  type XpReason,
  type XpRule,
} from "@/lib/admin-rewards-api";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";
import { LoadState, useAdminData } from "../admin-data";
import { Empty, fmt, Pill, Section, Soon, Switch, type PillTone } from "../reports/ui";

/** The action behind each XP reason, as the rulebook shows it. */
export const REASON_LABEL: Record<XpReason, string> = {
  VideoWatched: tk("Track video watched"),
  TrackQuizPassed: tk("Track quiz passed"),
  LessonPassed: tk("Lesson passed"),
  TaskDone: tk("Squad task moved to Done"),
  SimulationCompleted: tk("Interview simulation completed"),
  ProjectCompleted: tk("Squad project approved"),
  LevelExamPassed: tk("Level exam passed"),
  VideoLinkChecked: tk("Linked video Quick Check (per right answer)"),
  GrammarSentenceRight: tk("Grammar sentence parsed right"),
  GrammarQuickCheck: tk("Grammar Quick Check (per right answer)"),
  BadgeBonus: tk("Badge XP bonus"),
};

const REASON_CATEGORY: Record<XpReason, string> = {
  VideoWatched: tk("Tracks"),
  TrackQuizPassed: tk("Tracks"),
  LessonPassed: tk("Learning"),
  LevelExamPassed: tk("Learning"),
  TaskDone: tk("Internship"),
  ProjectCompleted: tk("Internship"),
  SimulationCompleted: tk("Recruitment"),
  VideoLinkChecked: tk("Teaching"),
  GrammarSentenceRight: tk("Teaching"),
  GrammarQuickCheck: tk("Teaching"),
  BadgeBonus: tk("Badges"),
};

export const RARITY_TONE: Record<BadgeRarity, PillTone> = { Common: "gray", Rare: "cyan", Epic: "violet", Legendary: "amber" };
const RARITY_ICON_BG: Record<BadgeRarity, string> = {
  Common: "bg-[#eef2f7] text-[#5b6b7c]",
  Rare: "bg-[#dff3fb] text-[#0b6f86]",
  Epic: "bg-[#ece8fd] text-[#5b44c9]",
  Legendary: "bg-[#fdf0d4] text-[#a8680c]",
};

/** One editable row of the rulebook: points, daily limit and the on/off switch, saved together. */
function RuleRow({ rule, onSaved }: { rule: XpRule; onSaved: (r: XpRule) => void }) {
  const t = useT();
  const [points, setPoints] = useState(String(rule.points));
  const [limit, setLimit] = useState(rule.dailyLimit == null ? "" : String(rule.dailyLimit));
  const [active, setActive] = useState(rule.isActive);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const p = Number(points);
  const l = limit.trim() === "" ? null : Number(limit);
  const valid = Number.isInteger(p) && p >= 0 && p <= 10000 && (l == null || (Number.isInteger(l) && l >= 1 && l <= 1000));
  const dirty = p !== rule.points || l !== rule.dailyLimit || active !== rule.isActive;

  async function save(nextActive = active) {
    if (!valid) {
      setError(tk("Points 0–10,000; daily limit empty or 1–1,000."));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      onSaved(await updateXpRule(rule.reason, { points: p, dailyLimit: l, isActive: nextActive }));
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't save the rule. Please try again.")));
    } finally {
      setBusy(false);
    }
  }

  const input = "h-[2.2em] w-[5.5em] rounded-[0.5em] border border-[#e1e8f0] bg-white px-[0.6em] text-[#14365a] outline-none focus:ring-2 focus:ring-[#06b6d4]/40";
  return (
    <tr className="border-b border-[#eef2f7] last:border-0 align-middle">
      <td className="px-[0.9em] py-[0.7em]">
        <span className="block font-bold text-[#0b1b2b]">{t(REASON_LABEL[rule.reason])}</span>
        {rule.points !== rule.defaultPoints && (
          <span className="block text-[0.85em] text-[#8a97a6]">{t("Default: {count} XP", { count: rule.defaultPoints })}</span>
        )}
        {error && <span className="block text-[0.85em] text-[#b83232]">{t(error)}</span>}
      </td>
      <td className="px-[0.9em] py-[0.7em]">
        <Pill tone="gray">{t(REASON_CATEGORY[rule.reason])}</Pill>
      </td>
      <td className="px-[0.9em] py-[0.7em]">
        <span className="inline-flex items-center gap-[0.3em]">
          <input className={input} dir="ltr" inputMode="numeric" aria-label={t("Award value")} value={points} onChange={(e) => setPoints(e.target.value)} />
          <span className="font-bold text-[#5b6b7c]">XP</span>
        </span>
      </td>
      <td className="px-[0.9em] py-[0.7em]">
        <input className={input} dir="ltr" inputMode="numeric" aria-label={t("Daily limit")} placeholder={t("No limit")} value={limit} onChange={(e) => setLimit(e.target.value)} />
      </td>
      <td className="px-[0.9em] py-[0.7em]">
        <span className="inline-flex items-center gap-[0.5em]">
          <Switch
            checked={active}
            label={t("Active")}
            disabled={busy}
            onChange={(v) => {
              setActive(v);
              // Only the switch changed: save at once; otherwise the row's Save sends everything.
              if (p === rule.points && l === rule.dailyLimit) void save(v);
            }}
          />
          <span className="text-[0.9em] font-semibold text-[#5b6b7c]">{active ? t("Active") : t("Paused")}</span>
        </span>
      </td>
      <td className="px-[0.9em] py-[0.7em]">
        <button
          type="button"
          onClick={() => save()}
          disabled={!dirty || busy}
          className="inline-flex items-center gap-[0.3em] rounded-[0.5em] bg-[#06b6d4] px-[0.8em] py-[0.4em] font-bold text-white disabled:cursor-not-allowed disabled:bg-[#c4cfdb]"
        >
          <Save className="size-[1em]" /> {busy ? t("Saving...") : t("Save")}
        </button>
      </td>
    </tr>
  );
}

/** XP Economy Rulebook: every XP reason with its points, daily limit and switch. */
export function XpRulebook() {
  const t = useT();
  const rules = useAdminData(getXpRules, tk("We couldn't load the XP rules. Please try again."));
  const heads = [tk("Event trigger rule"), tk("Category"), tk("Award value"), tk("Daily limit"), tk("Status"), tk("Action")];
  const replace = (r: XpRule) => rules.setData((rules.data ?? []).map((x) => (x.reason === r.reason ? r : x)));

  return (
    <Section
      id="rewards-rules"
      title={t("XP Economy Rulebook")}
      description={t("Automated incentives that reward student progress with XP.")}
      aside={rules.data ? <Pill tone="cyan">{t("{count} active rules", { count: rules.data.filter((r) => r.isActive).length })}</Pill> : undefined}
    >
      <div className="mt-[1em] overflow-x-auto">
        <table className="w-full min-w-[44em] text-[0.75em]">
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
            {!rules.data ? (
              <tr>
                <td colSpan={heads.length}>
                  <LoadState error={rules.error} onRetry={rules.reload} />
                </td>
              </tr>
            ) : rules.data.length === 0 ? (
              <tr>
                <td colSpan={heads.length} className="pt-[0.8em]">
                  <Empty icon={ListChecks} title={t("No XP rules yet")} />
                </td>
              </tr>
            ) : (
              rules.data.map((r) => <RuleRow key={`${r.reason}-${r.updatedUtc ?? ""}`} rule={r} onSaved={replace} />)
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-[0.6em] flex items-center gap-[0.4em] text-[0.7em] text-[#8a97a6]">
        <Pencil className="size-[1em]" /> {t("Changes apply to the next XP award. An empty daily limit means no limit.")}
      </p>
    </Section>
  );
}

/** Badge Collection: the catalogue with rarity and holders; full mode adds edit, (de)activate and award. */
export function BadgeCollection({
  badges,
  error,
  onRetry,
  compact,
  onManage,
  onCreate,
  onEdit,
  onToggle,
  onAward,
}: {
  badges: AdminBadge[] | null;
  error: string | null;
  onRetry: () => void;
  compact?: boolean;
  onManage?: () => void;
  onCreate: () => void;
  onEdit: (b: AdminBadge) => void;
  onToggle: (b: AdminBadge) => void;
  onAward: (b: AdminBadge) => void;
}) {
  const t = useT();
  const shown = compact ? (badges ?? []).filter((b) => b.isActive).sort((a, b) => b.holders - a.holders).slice(0, 4) : (badges ?? []);
  const iconBtn = "grid size-[2em] place-items-center rounded-[0.5em] text-[#5b6b7c] hover:bg-[#eef4fa] hover:text-[#14365a]";

  return (
    <Section
      id="rewards-badges"
      title={t("Badge Collection")}
      description={t("Tiered achievement assets")}
      aside={
        compact ? (
          <button type="button" onClick={onManage} className="text-[0.72em] font-bold text-[#0b89a6] hover:underline">
            {t("Manage All")}
          </button>
        ) : (
          <button type="button" onClick={onCreate} className="inline-flex items-center gap-[0.3em] rounded-[0.6em] border border-[#dfe7f1] px-[0.8em] py-[0.4em] text-[0.72em] font-bold text-[#0b89a6] hover:bg-[#f1f6fb]">
            <Sparkles className="size-[1em]" /> {t("Create New Badge")}
          </button>
        )
      }
    >
      {!badges ? (
        <LoadState error={error} onRetry={onRetry} />
      ) : shown.length === 0 ? (
        <Empty icon={Award} title={t("No badges yet")} text={t("Create the first badge students can earn.")} className="mt-[1em]" />
      ) : (
        <ul className={`mt-[1em] grid gap-[0.8em] ${compact ? "grid-cols-2" : "sm:grid-cols-2 2xl:grid-cols-3"}`}>
          {shown.map((b) => (
            <li key={b.id} className={`flex flex-col gap-[0.5em] rounded-[0.9em] bg-[#f5f8fe] p-[0.9em] ${b.isActive ? "" : "opacity-60"}`}>
              <div className="flex items-start gap-[0.6em]">
                <span className={`grid size-[2.4em] shrink-0 place-items-center rounded-[0.7em] ${RARITY_ICON_BG[b.rarity]}`}>
                  {b.rarity === "Legendary" || b.rarity === "Epic" ? <Gem className="size-[1.2em]" /> : <Award className="size-[1.2em]" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.88em] font-bold text-[#0b1b2b]" title={b.name}>
                    {b.name}
                  </span>
                  <span className="mt-[0.2em] flex flex-wrap gap-[0.3em]">
                    <Pill tone={RARITY_TONE[b.rarity]}>{t(b.rarity)}</Pill>
                    {!b.isActive && <Pill tone="red">{t("Inactive")}</Pill>}
                  </span>
                </span>
              </div>
              {!compact && b.description && <p className="line-clamp-2 text-[0.72em] text-[#5b6b7c]">{b.description}</p>}
              <div className="flex flex-wrap items-center justify-between gap-[0.4em] text-[0.7em] text-[#5b6b7c]">
                <span>{t("{count} holders", { count: fmt(b.holders) })}</span>
                {b.xpBonus > 0 && <span className="font-bold text-[#0b6f86]">+{fmt(b.xpBonus)} XP</span>}
              </div>
              {!compact && (
                <div className="flex items-center justify-end gap-[0.2em] border-t border-[#e6edf5] pt-[0.4em]">
                  <button type="button" className={iconBtn} title={t("Award to a student")} aria-label={t("Award to a student")} disabled={!b.isActive} onClick={() => onAward(b)}>
                    <UserPlus className="size-[1em]" />
                  </button>
                  <button type="button" className={iconBtn} title={t("Edit")} aria-label={t("Edit")} onClick={() => onEdit(b)}>
                    <Pencil className="size-[1em]" />
                  </button>
                  <button
                    type="button"
                    className={iconBtn}
                    title={b.isActive ? t("Deactivate") : t("Activate")}
                    aria-label={b.isActive ? t("Deactivate") : t("Activate")}
                    onClick={() => onToggle(b)}
                  >
                    {b.isActive ? <Power className="size-[1em]" /> : <RotateCcw className="size-[1em]" />}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
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

const loadLedger = () => getXpLedger({ pageSize: 8 });

/** Live XP Ledger: the newest XP awards (refreshed every 30 s) and the full ledger as CSV. */
export function XpLedger({ refreshKey }: { refreshKey: number }) {
  const t = useT();
  const ledger = useAdminData(loadLedger, tk("We couldn't load the XP ledger. Please try again."));
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const { reload } = ledger;

  useEffect(() => {
    if (refreshKey) void reload();
  }, [refreshKey, reload]);
  useEffect(() => {
    const id = window.setInterval(() => void reload(), 30_000);
    return () => window.clearInterval(id);
  }, [reload]);

  async function exportCsv() {
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadXpLedgerCsv();
    } catch (e) {
      setDownloadError(errorMessage(e, tk("We couldn't download the ledger. Please try again.")));
    } finally {
      setDownloading(false);
    }
  }

  const time = (iso: string) => new Date(iso).toLocaleString(dateLocale("en-GB"), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <Section
      title={t("Live XP Ledger")}
      aside={
        <span className="inline-flex items-center gap-[0.35em] text-[0.7em] font-bold text-[#17935f]">
          <Radio className="size-[1em]" /> {t("Live")}
        </span>
      }
    >
      {!ledger.data ? (
        <LoadState error={ledger.error} onRetry={ledger.reload} />
      ) : ledger.data.items.length === 0 ? (
        <Empty icon={Radio} title={t("No XP awarded yet")} className="mt-[1em]" />
      ) : (
        <ul className="mt-[0.9em] divide-y divide-[#eef2f7]">
          {ledger.data.items.map((e) => (
            <li key={e.id} className="flex items-center gap-[0.7em] py-[0.55em]">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.8em] font-bold text-[#0b1b2b]">{e.studentName}</span>
                <span className="block truncate text-[0.68em] text-[#8a97a6]">
                  {t(REASON_LABEL[e.reason])} · {time(e.createdUtc)}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-[#dff7ea] px-[0.7em] py-[0.15em] text-[0.72em] font-extrabold text-[#17935f]">+{fmt(e.points)} XP</span>
            </li>
          ))}
        </ul>
      )}
      {ledger.data && ledger.data.total > ledger.data.items.length && (
        <p className="mt-[0.4em] text-[0.68em] text-[#8a97a6]">{t("{count} awards in total", { count: fmt(ledger.data.total) })}</p>
      )}
      {downloadError && <p role="alert" className="mt-[0.6em] text-[0.72em] font-semibold text-[#b83232]">{downloadError}</p>}
      <button
        type="button"
        onClick={exportCsv}
        disabled={downloading || !ledger.data || ledger.data.total === 0}
        className="mt-[0.9em] inline-flex w-full items-center justify-center gap-[0.4em] rounded-[0.7em] bg-[#f1f6fb] px-[1em] py-[0.6em] text-[0.75em] font-bold text-[#14365a] hover:bg-[#e6eef7] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download className="size-[1em]" /> {downloading ? t("Downloading...") : t("Download XP Ledger (CSV)")}
      </button>
    </Section>
  );
}
