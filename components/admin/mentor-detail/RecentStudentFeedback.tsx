"use client";

import { MessageSquareQuote } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { EmptyNote, Section } from "./parts";

/** No reviews API yet: the designed card with an empty state. */
export function RecentStudentFeedback() {
  const t = useT();
  return (
    <Section
      title={t("Recent Student Feedback")}
      sub={t("Verified qualitative testimonials from sprint reviews and 1:1 clinics")}
      icon={<MessageSquareQuote className="size-[1.1em]" />}
    >
      <EmptyNote text={t("No student reviews to show yet.")} />
    </Section>
  );
}
