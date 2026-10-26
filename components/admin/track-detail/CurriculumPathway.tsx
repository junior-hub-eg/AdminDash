"use client";

import { Layers, Workflow } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { EmptyNote, Section } from "../mentor-detail/parts";

/** No curriculum-levels API yet: the designed card with an empty state. */
export function CurriculumPathway() {
  const t = useT();
  return (
    <Section
      title={t("Curriculum Pathway & Level Architecture")}
      sub={t("Structured mastery progression across developmental stages.")}
      icon={<Workflow className="size-[1.1em]" />}
    >
      <EmptyNote icon={<Layers className="size-[1.6em]" />} text={t("No curriculum levels have been set up for this track yet.")} />
    </Section>
  );
}
