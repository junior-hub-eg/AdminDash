"use client";

import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, RotateCcw } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";

/** Loads one admin API call on mount. `reload` fetches again; `setData` takes the value a save returned. */
export function useAdminData<T>(load: () => Promise<T>, failMessage: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      setData(await load());
    } catch (e) {
      setError(errorMessage(e, failMessage));
    }
  }, [load, failMessage]);

  useEffect(() => {
    let active = true;
    load().then(
      (value) => active && setData(value),
      (e) => active && setError(errorMessage(e, failMessage)),
    );
    return () => {
      active = false;
    };
  }, [load, failMessage]);

  return { data, error, reload, setData };
}

/** The spinner while loading, or the error with a retry button. */
export function LoadState({ error, onRetry, className = "" }: { error: string | null; onRetry: () => void; className?: string }) {
  const t = useT();
  if (!error) {
    return (
      <div role="status" aria-label={t("Loading")} className={`grid place-items-center py-[2.5em] ${className}`}>
        <LoaderCircle className="size-[2em] animate-spin text-[#0f7378]" />
      </div>
    );
  }
  return (
    <div role="alert" className={`flex flex-wrap items-center justify-center gap-[0.8em] rounded-[0.8em] bg-[#fdecec] px-[1em] py-[0.8em] text-[0.85em] font-semibold text-[#b83232] ${className}`}>
      <span>{error}</span>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-[0.4em] rounded-full bg-white px-[0.9em] py-[0.3em] text-[#14365a] shadow-sm hover:bg-[#eef4fa]"
      >
        <RotateCcw className="size-[1em]" /> {t("Try again")}
      </button>
    </div>
  );
}
