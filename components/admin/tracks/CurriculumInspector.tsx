"use client";

import { Layers, Pencil } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { PANEL } from "../page-parts";
import { EmptyNote } from "../mentor-detail/parts";
import type { TrackItem } from "./track-data";

/** The selected track's blueprint. There is no curriculum-levels API yet, so the level list is an empty state. */
export function CurriculumInspector({ item, onEdit }: { item: TrackItem; onEdit: () => void }) {
  const t = useT();
  return (
    <section id="curriculum-inspector" className={`${PANEL} min-w-0 p-[1.3em]`}>
      <header className="flex items-start justify-between gap-[0.6em]">
        <div className="min-w-0">
          <p className="text-[0.65em] font-bold uppercase tracking-[0.1em] text-[#0b89a6]">{t("Curriculum Inspector")}</p>
          <h2 className="text-[1.15em] font-bold text-[#0b1b2b]">{t("{name} Blueprint", { name: t(item.track.name) })}</h2>
          {item.info?.shortDescription && <p className="mt-[0.3em] text-[0.75em] text-[#5b6b7c]">{item.info.shortDescription}</p>}
        </div>
        <button type="button" onClick={onEdit} aria-label={t("Edit Track Details")} className="grid size-[2.2em] shrink-0 place-items-center rounded-[0.6em] bg-[#eef3fa] text-[#14365a] hover:bg-[#e1eaf7]">
          <Pencil className="size-[1em]" />
        </button>
      </header>
      <div className="mt-[1em]">
        <EmptyNote icon={<Layers className="size-[1.6em]" />} text={t("No curriculum levels have been set up for this track yet.")} />
      </div>
    </section>
  );
}
