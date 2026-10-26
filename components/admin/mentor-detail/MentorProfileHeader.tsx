"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { CalendarDays, Check, LoaderCircle, Mail, MessageSquare, Pencil, Phone, Shuffle } from "lucide-react";
import type { AdminMentor } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { mentorAvatar } from "@/lib/avatars";
import { PANEL, BTN_PRIMARY } from "../page-parts";

const LINK_BTN =
  "inline-flex items-center justify-center gap-[0.5em] rounded-[0.7em] border border-[#e1e8f0] bg-white px-[1.1em] py-[0.6em] text-[0.85em] font-semibold text-[#14365a] hover:bg-[#f1f6fb] disabled:cursor-not-allowed disabled:opacity-50";

/** Photo, name, chips, contact lines and the action buttons; `children` (the KPI strip) sits under them. */
export function MentorProfileHeader({
  mentor: m,
  saving,
  error,
  onToggle,
  onReassign,
  children,
}: {
  mentor: AdminMentor;
  saving: boolean;
  error: string | null;
  onToggle: () => void;
  onReassign: () => void;
  children?: ReactNode;
}) {
  const t = useT();
  const avatar = mentorAvatar(m);
  return (
    <section className={`${PANEL} relative overflow-hidden p-[1.5em]`}>
      <span aria-hidden className="pointer-events-none absolute -bottom-[6em] start-1/3 size-[16em] rounded-full bg-[#c9f5ec] opacity-50 blur-[3em]" />
      <div className="relative flex flex-wrap items-start gap-[1.5em]">
        <span className="relative shrink-0">
          <span className="relative block size-[9em] overflow-hidden rounded-[1em] shadow-[0_8px_20px_rgba(20,54,90,0.15)]" style={{ backgroundColor: avatar.bg }}>
            <Image src={avatar.src} alt="" fill sizes="144px" className="object-cover object-top" />
          </span>
          {m.isActive && (
            <span className="absolute -bottom-[0.3em] -end-[0.3em] grid size-[1.6em] place-items-center rounded-full border-2 border-white bg-[#12937a] text-white">
              <Check className="size-[0.9em]" />
            </span>
          )}
        </span>

        <div className="min-w-0 flex-1">
          <h1 className="text-[2em] font-extrabold leading-tight text-[#0b1b2b]">{m.fullName}</h1>
          <div className="mt-[0.4em] flex flex-col items-start gap-[0.4em] text-[0.7em] font-semibold">
            <span className={`inline-flex items-center gap-[0.4em] rounded-full px-[0.8em] py-[0.2em] ${m.isActive ? "bg-[#d7efe6] text-[#12676b]" : "bg-[#eef2f7] text-[#5b6b7c]"}`}>
              <span className="size-[0.5em] rounded-full bg-current" />
              {m.isActive ? t("Active") : t("On Leave")}
              {m.monitoredSquads > 0 && <> • {t("Squad Monitor")}</>}
            </span>
            <span className="rounded-full bg-[#dff3fb] px-[0.8em] py-[0.2em] text-[#0b6f86]">{t(m.trackName)}</span>
          </div>
          {m.title && <p className="mt-[0.6em] max-w-[28em] text-[0.9em] text-[#14365a]">{m.title}</p>}
          <ul className="mt-[0.5em] grid gap-[0.25em] text-[0.78em] text-[#5b6b7c]">
            <li className="flex items-center gap-[0.5em]">
              <Mail className="size-[1em] shrink-0" /> <span dir="ltr">{m.email ?? "—"}</span>
            </li>
            <li className="flex items-center gap-[0.5em]">
              <Phone className="size-[1em] shrink-0" /> —
            </li>
            <li className="flex items-center gap-[0.5em]">
              <CalendarDays className="size-[1em] shrink-0" />
              {m.yearsOfExperience > 0 ? t("{n} years of experience", { n: m.yearsOfExperience }) : "—"}
            </li>
          </ul>
        </div>

        <div className="flex w-full flex-col gap-[0.6em] sm:w-auto">
          <button type="button" disabled title={t("Editing a mentor's profile isn't available yet.")} className={BTN_PRIMARY}>
            <Pencil className="size-[1em]" /> {t("Edit Mentor Profile")}
          </button>
          {m.email ? (
            <a href={`mailto:${m.email}`} className={LINK_BTN}>
              <MessageSquare className="size-[1em]" /> {t("Message Mentor")}
            </a>
          ) : (
            <button type="button" disabled className={LINK_BTN}>
              <MessageSquare className="size-[1em]" /> {t("Message Mentor")}
            </button>
          )}
          <button type="button" onClick={onReassign} className={LINK_BTN}>
            <Shuffle className="size-[1em]" /> {t("Reassign Squads")}
          </button>
          <button
            type="button"
            onClick={onToggle}
            disabled={saving}
            className={`${LINK_BTN} ${m.isActive ? "!border-[#f0c9c9] !text-[#b83232]" : ""}`}
          >
            {saving && <LoaderCircle className="size-[1em] animate-spin" />}
            {m.isActive ? t("Deactivate") : t("Activate")}
          </button>
        </div>
      </div>
      {error && <p role="alert" className="relative mt-[0.6em] text-[0.8em] text-[#b83232]">{error}</p>}
      {children && <div className="relative mt-[1.3em]">{children}</div>}
    </section>
  );
}
