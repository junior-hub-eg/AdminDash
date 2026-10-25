"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/lib/i18n/client";
import { Badge } from "@/components/ui/badge";

interface PlaceholderPageProps {
  title: string;
  description: string;
  /** What this screen is blocked on, e.g. "UI/UX designs" or "Projects API (Sprint 4-5)". */
  waitingOn: string;
  prdSection?: string;
}

/**
 * Stand-in for screens whose real UI or backend contract isn't ready yet
 * (see AGENTS.md / sprint plan dependencies). Keeps every route in the sprint
 * plan navigable now, so routing + role access can be tested end-to-end
 * before designs/APIs land — swap the body for the real screen in place.
 */
export function PlaceholderPage({ title, description, waitingOn, prdSection }: PlaceholderPageProps) {
  const t = useT();
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t(title)}</h1>
        <p className="mt-1 text-muted-foreground">{t(description)}</p>
      </div>
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="warning">{t("Under construction")}</Badge>
            {prdSection && <Badge variant="default">PRD {prdSection}</Badge>}
          </div>
          <CardTitle className="mt-2">{t("This screen is still waiting")}</CardTitle>
          <CardDescription>{t(waitingOn)}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {t("Routing and permissions already work — this part will be replaced with the real design and data once they arrive.")}
        </CardContent>
      </Card>
    </div>
  );
}
