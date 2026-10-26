"use client";

import { FileText } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { EmptyNote, Section } from "../mentor-detail/parts";

/** No per-track deliverables API yet: the designed card with an empty state. */
export function CapstoneDeliverables() {
  const t = useT();
  return (
    <Section
      title={t("Capstone Deliverables & Artifact Reviews")}
      sub={t("Jury assessments, Figma prototype links, and benchmark evaluation scores.")}
      icon={<FileText className="size-[1.1em]" />}
    >
      <EmptyNote text={t("No capstone deliverables have been submitted for this track yet.")} />
    </Section>
  );
}
