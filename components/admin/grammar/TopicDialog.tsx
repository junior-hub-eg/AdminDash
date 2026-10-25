"use client";

import { useEffect, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { LoaderCircle, X } from "lucide-react";
import { ApiError, errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { createGrammarTopic, updateGrammarTopic, type AdminGrammarTopic, type SaveGrammarTopic } from "@/lib/grammar-api";

export const FIELD =
  "w-full rounded-[0.5em] border border-[#d5dee8] bg-white px-[0.8em] py-[0.5em] text-[0.85em] text-[#14365a] outline-none focus:border-[#1d6fe0]";

const KEY_PATTERN = /^[a-z0-9-]+$/;

/** Splits "a, b، c" into roles (English or Arabic commas). */
const splitRoles = (s: string) =>
  s
    .split(/[,،]/)
    .map((x) => x.trim())
    .filter(Boolean);

/** Add or edit a grammar topic (US-01). The backend answers with the whole ordered list. */
export function TopicDialog({
  topic,
  onClose,
  onSaved,
}: {
  topic: AdminGrammarTopic | null;
  onClose: () => void;
  onSaved: (topics: AdminGrammarTopic[]) => void;
}) {
  const t = useT();
  const [key, setKey] = useState(topic?.key ?? "");
  const [titleAr, setTitleAr] = useState(topic?.titleAr ?? "");
  const [titleEn, setTitleEn] = useState(topic?.titleEn ?? "");
  const [descriptionAr, setDescriptionAr] = useState(topic?.descriptionAr ?? "");
  const [roles, setRoles] = useState<string[]>(topic?.roles ?? []);
  const [roleInput, setRoleInput] = useState("");
  const [videoUrl, setVideoUrl] = useState(topic?.videoUrl ?? "");
  const [notes, setNotes] = useState((topic?.notes ?? []).join("\n"));
  const [isActive, setIsActive] = useState(topic?.isActive ?? true);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function addRoles(text: string) {
    const next = splitRoles(text).filter((r) => !roles.includes(r));
    if (next.length) setRoles([...roles, ...next].slice(0, 8));
    setRoleInput("");
  }

  function onRoleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addRoles(roleInput);
    } else if (e.key === "Backspace" && !roleInput && roles.length) {
      setRoles(roles.slice(0, -1));
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const allRoles = [...roles, ...splitRoles(roleInput).filter((r) => !roles.includes(r))];
    const noteLines = notes
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    const errs: Record<string, string> = {};
    if (!topic && !KEY_PATTERN.test(key.trim())) errs.key = tk("Use lowercase letters, numbers and dashes only.");
    if (!titleAr.trim()) errs.titleAr = tk("The Arabic title is required.");
    if (!titleEn.trim()) errs.titleEn = tk("The English title is required.");
    if (allRoles.length < 2 || allRoles.length > 8) errs.roles = tk("Add between 2 and 8 roles.");
    if (noteLines.length > 6) errs.notes = tk("Use at most 6 notes.");
    setFields(errs);
    if (Object.keys(errs).length) return;

    const body: SaveGrammarTopic = {
      titleAr: titleAr.trim(),
      titleEn: titleEn.trim(),
      descriptionAr: descriptionAr.trim() || null,
      roles: allRoles,
      videoUrl: videoUrl.trim() || null,
      notes: noteLines,
      isActive,
      ...(topic ? {} : { key: key.trim() }),
    };
    setBusy(true);
    try {
      onSaved(topic ? await updateGrammarTopic(topic.id, body) : await createGrammarTopic(body));
    } catch (err) {
      if (err instanceof ApiError && (err.status === 409 || err.code === "TOPIC_EXISTS")) {
        setFields({ key: tk("A topic with this key already exists.") });
      } else if (err instanceof ApiError && Object.keys(err.fieldErrors).length) {
        setFields(Object.fromEntries(Object.entries(err.fieldErrors).map(([k, v]) => [k.charAt(0).toLowerCase() + k.slice(1).split(/[.[]/)[0], v])));
      } else {
        setMessage(errorMessage(err, tk("We couldn't save the topic. Please try again.")));
      }
    } finally {
      setBusy(false);
    }
  }

  const field = (name: string, label: string, el: ReactNode, hint?: string) => (
    <label className="grid gap-[0.3em] text-[0.85em]">
      <span className="font-semibold text-[#14365a]">{label}</span>
      {el}
      {hint && !fields[name] && <span className="text-[0.85em] text-[#8a97a6]">{hint}</span>}
      {fields[name] && <span className="text-[0.9em] text-[#b83232]">{t(fields[name])}</span>}
    </label>
  );

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <button type="button" aria-label={t("Close")} onClick={onClose} className="absolute inset-0 cursor-default bg-[#14365a]/40 backdrop-blur-[1px]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={topic ? t("Edit topic") : t("Add topic")}
        className="relative max-h-[90svh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 text-[#14365a] shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold">{topic ? t("Edit topic") : t("Add topic")}</h2>
          <button type="button" onClick={onClose} aria-label={t("Close")} className="grid size-8 place-items-center rounded-full hover:bg-[#eef4fa]">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={submit} noValidate className="grid gap-[0.9em]">
          {topic
            ? field("key", t("Key"), <p dir="ltr" className="font-mono text-[0.95em] text-[#5b6b7c] rtl:text-end">{topic.key}</p>)
            : field(
                "key",
                t("Key"),
                <input className={FIELD} dir="ltr" value={key} onChange={(e) => setKey(e.target.value.toLowerCase())} maxLength={60} placeholder="kana-sisters" />,
                t("Lowercase letters, numbers and dashes. It can't be changed later."),
              )}
          <div className="grid gap-[0.9em] sm:grid-cols-2">
            {field("titleAr", t("Arabic title"), <input className={FIELD} dir="rtl" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} maxLength={150} />)}
            {field("titleEn", t("English title"), <input className={FIELD} dir="ltr" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} maxLength={150} />)}
          </div>
          {field(
            "descriptionAr",
            t("Arabic description"),
            <textarea className={`${FIELD} h-20`} dir="rtl" value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} maxLength={1000} />,
          )}
          {field(
            "roles",
            t("Roles"),
            <div className="flex flex-wrap items-center gap-[0.4em] rounded-[0.5em] border border-[#d5dee8] px-[0.6em] py-[0.4em] focus-within:border-[#1d6fe0]" dir="rtl">
              {roles.map((r) => (
                <span key={r} className="inline-flex items-center gap-[0.3em] rounded-full bg-[#e6f1fb] px-[0.7em] py-[0.15em] text-[0.85em] font-semibold text-[#1d5fb8]">
                  {r}
                  <button type="button" onClick={() => setRoles(roles.filter((x) => x !== r))} aria-label={t("Remove {role}", { role: r })}>
                    <X className="size-[0.9em]" />
                  </button>
                </span>
              ))}
              <input
                className="min-w-[6em] flex-1 py-[0.2em] text-[0.85em] outline-none"
                value={roleInput}
                onChange={(e) => (/[,،]/.test(e.target.value) ? addRoles(e.target.value) : setRoleInput(e.target.value))}
                onKeyDown={onRoleKey}
                onBlur={() => roleInput.trim() && addRoles(roleInput)}
                placeholder={roles.length ? "" : "مبتدأ، خبر"}
              />
            </div>,
            t("2 to 8 roles. Press Enter or a comma after each one."),
          )}
          {field(
            "videoUrl",
            t("Video URL (optional)"),
            <input className={FIELD} dir="ltr" type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} maxLength={500} placeholder="https://" />,
          )}
          {field(
            "notes",
            t("Notes"),
            <textarea className={`${FIELD} h-24`} dir="rtl" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} />,
            t("One note per line, up to 6."),
          )}
          <label className="flex items-center gap-[0.6em] text-[0.85em] font-semibold">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="size-[1.1em] accent-[#0f8a86]" />
            {t("Active (students can see it)")}
          </label>

          {message && (
            <p role="alert" className="rounded-[0.6em] bg-[#fdecec] px-[0.9em] py-[0.6em] text-[0.85em] font-semibold text-[#b83232]">
              {message}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-lg border border-[#cfe0ee] px-4 py-2 text-[0.75rem] font-semibold hover:bg-[#eef4fa]">
              {t("Cancel")}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1d5bd8] px-4 py-2 text-[0.75rem] font-semibold text-white hover:bg-[#1749ad] disabled:opacity-60"
            >
              {busy && <LoaderCircle className="size-3.5 animate-spin" />}
              {topic ? t("Save") : t("Add topic")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
