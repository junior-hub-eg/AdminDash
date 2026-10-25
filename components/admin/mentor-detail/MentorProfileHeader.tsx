"use client";

import { LoaderCircle, Mail, MessageSquare, Phone, Pencil, Shuffle, CalendarDays } from "lucide-react";
import type { AdminMentor } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { MentorPicture, MentorStatus } from "../MentorsTable";
import { PANEL, BTN_PRIMARY, BTN_SECONDARY } from "../page-parts";
import { MOCK_MENTOR_EXTRAS as X } from "../dashboardMock";

export function MentorProfileHeader({ mentor: m, saving, error, onToggle }: { mentor: AdminMentor; saving: boolean; error: string | null; onToggle: () => void }) {
  const t = useT();
  return (
    <section className={`${PANEL} p-[1.5em]`}>
      <div className="flex flex-wrap items-start gap-[1.5em]">
        <MentorPicture mentor={m} size="9em" />
        <div className="min-w-0 flex-1">
          <h1 className="text-[2em] font-extrabold leading-tight text-[#0b1b2b]">{m.fullName}</h1>
          <div className="mt-[0.5em] flex flex-wrap items-center gap-[0.5em] text-[0.75em]">
            <MentorStatus active={m.isActive} />
            <span className="rounded-full bg-[#dff3fb] px-[0.8em] py-[0.2em] font-semibold text-[#0b6f86]">{t(m.trackName)}</span>
          </div>
          <p className="mt-[0.7em] max-w-[28em] text-[0.9em] text-[#14365a]">{m.title || t(X.bio)}</p>
          <ul className="mt-[0.6em] grid gap-[0.3em] text-[0.8em] text-[#5b6b7c]">
            {m.email && <li dir="ltr" className="flex items-center gap-[0.5em]"><Mail className="size-[1em]" /> {m.email}</li>}
            <li dir="ltr" className="flex items-center gap-[0.5em]"><Phone className="size-[1em]" /> {X.phone}</li>
            <li className="flex items-center gap-[0.5em]"><CalendarDays className="size-[1em]" /> {t(X.joined)}</li>
          </ul>
        </div>

        <div className="flex w-full flex-col gap-[0.6em] sm:w-auto">
          <button type="button" className={BTN_PRIMARY}><Pencil className="size-[1em]" /> {t("Edit Mentor Profile")}</button>
          <button type="button" className={BTN_SECONDARY}><MessageSquare className="size-[1em]" /> {t("Message Mentor")}</button>
          <button type="button" className={BTN_SECONDARY}><Shuffle className="size-[1em]" /> {t("Reassign Squads")}</button>
          <button
            type="button"
            onClick={onToggle}
            disabled={saving}
            className={`${BTN_SECONDARY} ${m.isActive ? "!border-[#e3b4b4] !text-[#b83232]" : ""}`}
          >
            {saving && <LoaderCircle className="size-[1em] animate-spin" />}
            {m.isActive ? t("Deactivate") : t("Activate")}
          </button>
        </div>
      </div>
      {error && <p role="alert" className="mt-[0.6em] text-[0.8em] text-[#b83232]">{error}</p>}
    </section>
  );
}