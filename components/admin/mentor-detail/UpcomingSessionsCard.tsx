"use client";

import { CalendarX2, Video } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { EmptyNote, Section } from "./parts";

/** No per-mentor sessions API yet: the designed card with an empty state. */
export function UpcomingSessionsCard() {
  const t = useT();
  return (
    <Section title={t("Upcoming Sessions")} icon={<Video className="size-[1.1em]" />}>
      <EmptyNote icon={<CalendarX2 className="size-[1.6em]" />} text={t("No upcoming sessions")} />
    </Section>
  );
}
