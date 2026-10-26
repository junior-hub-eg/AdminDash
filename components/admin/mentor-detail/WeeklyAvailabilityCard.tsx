"use client";

import { CalendarRange } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { EmptyNote, Section } from "./parts";

/** No availability API yet: the designed card with an empty state. */
export function WeeklyAvailabilityCard() {
  const t = useT();
  return (
    <Section title={t("Weekly Availability")} icon={<CalendarRange className="size-[1.1em]" />}>
      <EmptyNote text={t("This mentor hasn't shared a weekly schedule yet.")} />
    </Section>
  );
}
