"use client";

import {
  Award,
  FolderGit2,
  Globe,
  Mail,
  MessagesSquare,
  Minus,
  Palette,
  Plus,
  Server,
  Sparkles,
  Star,
  Timer,
  Upload,
  Users,
  Video,
  Webhook,
  GraduationCap,
} from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { DASH, Pill, Section, Soon, Switch } from "../reports/ui";
import { BOX, Tile } from "./fields";

/** Squad & Sprint Configurations: designed but not stored by the backend yet. */
export function SquadRules() {
  const t = useT();
  return (
    <Section
      id="settings-squads"
      icon={Users}
      title={t("Squad & Sprint Configurations")}
      description={t("Default squad size, sprint pacing and squad rewards.")}
      aside={<Soon />}
    >
      <div className="mt-[1.2em] grid gap-[0.9em] opacity-70 md:grid-cols-2">
        <Tile>
          <div className="flex items-start justify-between gap-[0.6em]">
            <div>
              <p className="text-[0.85em] font-bold text-[#0b1b2b]">{t("Max Squad Capacity")}</p>
              <p className="text-[0.7em] text-[#8a97a6]">{t("Default number of students per squad")}</p>
            </div>
            <Users className="size-[1.2em] text-[#5b6b7c]" />
          </div>
          <div className="mt-[1em] flex items-center gap-[0.6em]">
            <button type="button" disabled aria-label={t("Decrease")} className="grid size-[2em] place-items-center rounded-[0.5em] bg-white">
              <Minus className="size-[0.9em]" />
            </button>
            <span className="w-[2em] text-center text-[1.5em] font-extrabold text-[#0b89a6]">{DASH}</span>
            <button type="button" disabled aria-label={t("Increase")} className="grid size-[2em] place-items-center rounded-[0.5em] bg-white">
              <Plus className="size-[0.9em]" />
            </button>
          </div>
        </Tile>

        <Tile>
          <div className="flex items-start justify-between gap-[0.6em]">
            <div>
              <p className="text-[0.85em] font-bold text-[#0b1b2b]">{t("Default Sprint Duration")}</p>
              <p className="text-[0.7em] text-[#8a97a6]">{t("Pacing cadence for milestones & retrospectives")}</p>
            </div>
            <Timer className="size-[1.2em] text-[#5b6b7c]" />
          </div>
          <select disabled aria-label={t("Default Sprint Duration")} className={`${BOX} mt-[1em] bg-white`}>
            <option>{DASH}</option>
          </select>
        </Tile>

        <Tile>
          <div className="flex items-start justify-between gap-[0.6em]">
            <div>
              <p className="text-[0.85em] font-bold text-[#0b1b2b]">{t("Automated Task Done Reward")}</p>
              <p className="text-[0.7em] text-[#8a97a6]">{t("XP awarded to the squad on reviewer sign-off")}</p>
            </div>
            <Star className="size-[1.2em] text-[#14b8a6]" />
          </div>
          <p className="mt-[1em] flex items-baseline gap-[0.5em]">
            <span className="text-[1.5em] font-extrabold text-[#0b1b2b]">{DASH}</span>
            <span className="text-[0.72em] font-bold text-[#0b89a6]">{t("XP / Task")}</span>
          </p>
        </Tile>

        <Tile>
          <div className="flex items-start justify-between gap-[0.6em]">
            <div>
              <p className="text-[0.85em] font-bold text-[#0b1b2b]">{t("Evaluation Passing Threshold")}</p>
              <p className="text-[0.7em] text-[#8a97a6]">{t("Minimum aggregate mentor rubric score")}</p>
            </div>
            <span className="text-[1.1em] font-extrabold text-[#0b89a6]">{DASH}</span>
          </div>
          <div className="mt-[1.2em] h-[0.4em] rounded-full bg-[#dfe7f1]" />
        </Tile>
      </div>
    </Section>
  );
}

/** Localization & Multi-language: the site is English + Arabic (RTL) today; the switches are not configurable yet. */
export function Localization() {
  const t = useT();
  return (
    <Section
      id="settings-localization"
      icon={Globe}
      title={t("Localization & Multi-language")}
      description={t("Platform languages and bilingual content.")}
      aside={<Pill tone="cyan">{t("Bi-directional")}</Pill>}
    >
      <div className="mt-[1.2em] grid gap-[0.9em] md:grid-cols-2">
        <Tile className="flex items-center gap-[0.8em]">
          <span className="grid size-[2.4em] shrink-0 place-items-center rounded-[0.6em] bg-white text-[0.8em] font-extrabold text-[#0b89a6]">EN</span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.85em] font-bold text-[#0b1b2b]">{t("English")}</p>
            <p className="text-[0.7em] text-[#8a97a6]">{t("Left to right")}</p>
          </div>
          <Pill tone="gray">{t("Available")}</Pill>
        </Tile>
        <Tile className="flex items-center gap-[0.8em]">
          <span className="grid size-[2.4em] shrink-0 place-items-center rounded-[0.6em] bg-white text-[0.8em] font-extrabold text-[#0b89a6]">AR</span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.85em] font-bold text-[#0b1b2b]">{t("Arabic")}</p>
            <p className="text-[0.7em] text-[#8a97a6]">{t("Right to left")}</p>
          </div>
          <Pill tone="green">{t("RTL active")}</Pill>
        </Tile>
      </div>
      <Tile className="mt-[0.9em] flex items-center gap-[0.8em]">
        <Sparkles className="size-[1.2em] shrink-0 text-[#06b6d4]" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-[0.5em] text-[0.85em] font-bold text-[#0b1b2b]">
            {t("Automated Translation for Student Submissions")} <Soon />
          </p>
          <p className="text-[0.7em] text-[#8a97a6]">{t("English ↔ Arabic side-by-side transcripts for briefs and reviews.")}</p>
        </div>
        <Switch checked={false} disabled label={t("Automated Translation for Student Submissions")} />
      </Tile>
    </Section>
  );
}

const INTEGRATIONS = [
  { icon: MessagesSquare, name: "Discord", text: tk("Squad auto-roles & private rooms") },
  { icon: FolderGit2, name: "GitHub Classroom", text: tk("Repo generation & CI evaluation") },
  { icon: Video, name: "Google Meet / Zoom", text: tk("Mentor 1-on-1 & calendar links") },
  { icon: Mail, name: tk("Email Gateway"), text: tk("Transactional receipts & invitations") },
];

export function Integrations() {
  const t = useT();
  return (
    <Section
      id="settings-integrations"
      icon={Webhook}
      title={t("Integrations & API Webhooks")}
      description={t("External synchronizations, classroom relays and webhooks.")}
      aside={
        <button type="button" disabled className="inline-flex items-center gap-[0.3em] rounded-[0.6em] bg-[#eef4fb] px-[0.8em] py-[0.4em] text-[0.72em] font-bold text-[#0b89a6] opacity-60">
          <Plus className="size-[1em]" /> {t("New Endpoint")}
        </button>
      }
    >
      <div className="mt-[1.2em] grid gap-[0.9em] md:grid-cols-2">
        {INTEGRATIONS.map((i) => (
          <Tile key={i.name}>
            <div className="flex items-start gap-[0.7em]">
              <span className="grid size-[2.2em] shrink-0 place-items-center rounded-[0.6em] bg-white text-[#5b6b7c]">
                <i.icon className="size-[1.1em]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.88em] font-bold text-[#0b1b2b]">{t(i.name)}</p>
                <p className="text-[0.7em] text-[#8a97a6]">{t(i.text)}</p>
              </div>
              <Soon />
            </div>
            <div className="mt-[0.9em] flex items-center justify-between text-[0.7em]">
              <span className="text-[#8a97a6]">{t("Not connected")}</span>
              <button type="button" disabled className="font-bold text-[#0b89a6] opacity-50">
                {t("Configure")}
              </button>
            </div>
          </Tile>
        ))}
      </div>
    </Section>
  );
}

/** The brand colours the admin uses today (shown, not editable yet). */
const PALETTE = [
  { name: tk("Primary Accent Cyan"), hex: "#06B6D4" },
  { name: tk("Deep Midnight Frame"), hex: "#0B1B2B" },
  { name: tk("Success Emerald"), hex: "#17935F" },
];

export function VisualIdentity({ platformName }: { platformName: string }) {
  const t = useT();
  return (
    <Section icon={Palette} title={t("Visual Identity")} description={t("Brand assets & themes")} aside={<Soon />}>
      <p className="mt-[1.2em] text-[0.72em] font-semibold text-[#0b1b2b]">{t("Active Platform Emblem")}</p>
      <div className="mt-[0.5em] flex items-center gap-[0.8em] rounded-[0.9em] bg-[#13233a] p-[1em] text-white">
        <span className="grid size-[2.6em] shrink-0 place-items-center rounded-[0.6em] bg-white/10 text-[#5ee0f5]">
          <GraduationCap className="size-[1.4em]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[1em] font-extrabold uppercase text-[#5ee0f5]">{platformName || DASH}</p>
          <p className="text-[0.65em] font-semibold uppercase tracking-[0.08em] text-white/70">{t("Master emblem")}</p>
        </div>
        <button type="button" disabled aria-label={t("Upload emblem")} className="opacity-50">
          <Upload className="size-[1.1em]" />
        </button>
      </div>
      <p className="mt-[0.4em] text-[0.65em] text-[#8a97a6]">{t("Recommended: SVG or PNG with transparent background, at least 512×512px.")}</p>

      <p className="mt-[1.2em] text-[0.72em] font-semibold text-[#0b1b2b]">{t("Brand Palette")}</p>
      <ul className="mt-[0.5em] space-y-[0.5em]">
        {PALETTE.map((c) => (
          <li key={c.hex} className="flex items-center gap-[0.7em] rounded-[0.8em] bg-[#f3f7fc] px-[0.8em] py-[0.6em]">
            <span className="size-[1.6em] shrink-0 rounded-full" style={{ backgroundColor: c.hex }} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.78em] font-semibold text-[#0b1b2b]">{t(c.name)}</span>
              <span dir="ltr" className="block font-mono text-[0.68em] text-[#8a97a6] rtl:text-end">
                {c.hex}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-[1.2em] text-[0.72em] font-semibold text-[#0b1b2b]">{t("Certificate Seal & Authority")}</p>
      <div className="mt-[0.5em] flex items-center gap-[0.7em] rounded-[0.8em] bg-[#f3f7fc] px-[0.8em] py-[0.8em] text-[0.72em] text-[#8a97a6]">
        <Award className="size-[1.4em] shrink-0 text-[#0b89a6]" />
        {t("Certificate signatory and seal settings are coming soon.")}
      </div>
    </Section>
  );
}

export function RuntimeEnvironment() {
  const t = useT();
  const rows = [tk("Database Replication"), tk("Webhook Dispatch Latency"), tk("Storage")];
  return (
    <Section icon={Server} title={t("Runtime Environment")} aside={<Soon />}>
      <dl className="mt-[1em] space-y-[0.6em] text-[0.75em]">
        {rows.map((r) => (
          <div key={r} className="flex justify-between gap-[0.8em]">
            <dt className="text-[#5b6b7c]">{t(r)}</dt>
            <dd className="font-semibold text-[#0b1b2b]">{DASH}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
