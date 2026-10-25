"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/client";

export default function NotFound() {
  const t = useT();
  const router = useRouter();

  // Back to the page the user came from; straight to the home page when there is none.
  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
      <h1 className="text-3xl font-semibold">{t("Page not found")}</h1>
      <p className="text-muted-foreground">{t("This link doesn't exist or has changed.")}</p>
      <Button type="button" onClick={goBack}>
        {t("Go back to the page you were on")}
      </Button>
    </div>
  );
}
