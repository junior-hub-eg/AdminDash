"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, BookA, FileText, LoaderCircle, Pencil, Plus, Users, Video, Wand2 } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";
import {
  getAdminGrammarTopics,
  getGrammarCorrections,
  reorderGrammarTopics,
  updateGrammarTopic,
  type AdminGrammarTopic,
  type GrammarCorrectionsReport,
} from "@/lib/grammar-api";
import { AdminPage, PageHero } from "../AdminPage";
import { LoadState, useAdminData } from "../admin-data";
import { TopicDialog } from "./TopicDialog";

const card = "rounded-[1.1em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]";

type Tab = "topics" | "corrections";
const TABS: { key: Tab; label: string; icon: typeof BookA }[] = [
  { key: "topics", label: tk("Topics"), icon: BookA },
  { key: "corrections", label: tk("AI corrections"), icon: Wand2 },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(dateLocale("en-GB"), { day: "numeric", month: "short", year: "numeric" });

/** The grammar coach for admins: the topic list (US-01) and the teachers' corrections of the AI (US-14). */
export default function AdminGrammar() {
  const t = useT();
  const [tab, setTab] = useState<Tab>("topics");

  return (
    <AdminPage>
      <PageHero title={t("Grammar Coach")} contentClassName="pb-[3em]" pictureTop>
        <p className="mt-[0.6em] max-w-[44em] text-[0.9em] text-[#14365a]">
          {t("Manage the grammar topics students practice, and see where teachers corrected the AI's parsing.")}
        </p>
      </PageHero>

      <div className="mx-auto mt-[1.5em] grid w-full gap-[1.2em] lg:w-[85%]">
        <div role="tablist" className="flex w-fit flex-wrap gap-[0.4em] rounded-full bg-white p-[0.3em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]">
          {TABS.map((x) => (
            <button
              key={x.key}
              type="button"
              role="tab"
              aria-selected={tab === x.key}
              onClick={() => setTab(x.key)}
              className={`inline-flex items-center gap-[0.4em] rounded-full px-[1.1em] py-[0.45em] text-[0.85em] font-semibold transition-colors ${
                tab === x.key ? "bg-[#14365a] text-white" : "text-[#14365a]/70 hover:bg-[#eef4fa]"
              }`}
            >
              <x.icon className="size-[1em]" /> {t(x.label)}
            </button>
          ))}
        </div>

        {tab === "topics" ? <TopicsTab /> : <CorrectionsTab />}
      </div>
    </AdminPage>
  );
}

function TopicsTab() {
  const t = useT();
  const topics = useAdminData(getAdminGrammarTopics, tk("We couldn't load the grammar topics. Please try again."));
  const [dialog, setDialog] = useState<{ topic: AdminGrammarTopic | null } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const list = topics.data ? [...topics.data].sort((a, b) => a.order - b.order) : null;

  async function move(index: number, by: -1 | 1) {
    if (!list) return;
    const ids = list.map((x) => x.id);
    [ids[index], ids[index + by]] = [ids[index + by], ids[index]];
    setError(null);
    setBusy(list[index].id);
    try {
      topics.setData(await reorderGrammarTopics(ids));
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't change the order. Please try again.")));
    } finally {
      setBusy(null);
    }
  }

  async function toggle(topic: AdminGrammarTopic) {
    setError(null);
    setBusy(topic.id);
    try {
      topics.setData(await updateGrammarTopic(topic.id, { isActive: !topic.isActive }));
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't update the topic. Please try again.")));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className={card}>
      <div className="mb-[0.8em] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[1em] font-bold text-[#14365a]">{t("Grammar topics")}</h2>
          <p className="text-[0.8em] text-[#5b6b7c]">{t("Students see the active topics in this order.")}</p>
        </div>
        <button
          type="button"
          onClick={() => setDialog({ topic: null })}
          className="flex items-center gap-1.5 rounded-lg bg-[#1d5bd8] px-3.5 py-2 text-[0.72rem] font-semibold text-white hover:bg-[#1749ad]"
        >
          <Plus className="size-3.5" /> {t("Add topic")}
        </button>
      </div>

      {error && (
        <p role="alert" className="mb-[0.8em] rounded-[0.6em] bg-[#fdecec] px-[0.9em] py-[0.6em] text-[0.85em] font-semibold text-[#b83232]">
          {error}
        </p>
      )}

      {!list ? (
        <LoadState error={topics.error} onRetry={topics.reload} />
      ) : list.length === 0 ? (
        <p className="py-[2em] text-center text-[0.85em] text-[#5b6b7c]">{t("No grammar topics yet. Add the first one.")}</p>
      ) : (
        <ol className="divide-y divide-[#e6edf3]">
          {list.map((topic, i) => (
            <li key={topic.id} className={`flex flex-wrap items-center gap-x-[1em] gap-y-[0.6em] py-[0.8em] ${topic.isActive ? "" : "opacity-60"}`}>
              <div className="flex items-center gap-[0.4em]">
                <span className="grid size-[2em] shrink-0 place-items-center rounded-full bg-[#14365a] text-[0.8em] font-bold text-white">{i + 1}</span>
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0 || busy !== null}
                    aria-label={t("Move up")}
                    className="grid size-[1.5em] place-items-center rounded hover:bg-[#eef4fa] disabled:opacity-30"
                  >
                    <ArrowUp className="size-[0.9em]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === list.length - 1 || busy !== null}
                    aria-label={t("Move down")}
                    className="grid size-[1.5em] place-items-center rounded hover:bg-[#eef4fa] disabled:opacity-30"
                  >
                    <ArrowDown className="size-[0.9em]" />
                  </button>
                </div>
              </div>

              <div className="min-w-[12em] flex-1">
                <p className="flex flex-wrap items-baseline gap-x-[0.6em]">
                  <span dir="rtl" className="text-[1em] font-bold text-[#0b1b2b]">
                    {topic.titleAr}
                  </span>
                  <span dir="ltr" className="text-[0.85em] text-[#5b6b7c]">
                    {topic.titleEn}
                  </span>
                  <span dir="ltr" className="font-mono text-[0.75em] text-[#8a97a6]">
                    {topic.key}
                  </span>
                </p>
                <div className="mt-[0.4em] flex flex-wrap gap-[0.3em]">
                  {topic.roles.map((r) => (
                    <span key={r} dir="rtl" className="rounded-full bg-[#e6f1fb] px-[0.6em] py-[0.1em] text-[0.75em] font-semibold text-[#1d5fb8]">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-[0.8em] text-[0.8em] text-[#5b6b7c]">
                <span>{t("{count} practicing", { count: topic.practicing })}</span>
                <span className="text-[#0f8a86]">{t("{count} mastered", { count: topic.mastered })}</span>
                <span className={`inline-flex items-center gap-[0.3em] ${topic.videoUrl ? "text-[#14365a]" : "text-[#8a97a6]"}`}>
                  <Video className="size-[1.1em]" /> {topic.videoUrl ? t("Video") : t("No video")}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={topic.isActive}
                  aria-label={t("Active")}
                  onClick={() => toggle(topic)}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-[0.4em] disabled:cursor-wait"
                >
                  <span className={`relative h-[1.2em] w-[2.1em] rounded-full transition-colors ${topic.isActive ? "bg-[#0f8a86]" : "bg-[#cfd8e2]"}`}>
                    <span
                      className={`absolute top-[0.15em] size-[0.9em] rounded-full bg-white shadow transition-all ${
                        topic.isActive ? "start-[1.05em]" : "start-[0.15em]"
                      }`}
                    />
                  </span>
                  {busy === topic.id ? <LoaderCircle className="size-[1em] animate-spin" /> : topic.isActive ? t("Active") : t("Hidden")}
                </button>
                <button
                  type="button"
                  onClick={() => setDialog({ topic })}
                  className="inline-flex items-center gap-[0.3em] rounded-full border border-[#cfe0ee] px-3 py-1 text-[0.85em] font-semibold text-[#14365a] hover:bg-[#eef4fa]"
                >
                  <Pencil className="size-[1em]" /> {t("Edit")}
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {dialog && (
        <TopicDialog
          topic={dialog.topic}
          onClose={() => setDialog(null)}
          onSaved={(all) => {
            topics.setData(all);
            setDialog(null);
          }}
        />
      )}
    </section>
  );
}

/** The sentence with the corrected word highlighted. */
function HighlightedSentence({ sentence, word }: { sentence: string; word: string }) {
  const at = word ? sentence.indexOf(word) : -1;
  if (at < 0) return <>{sentence}</>;
  return (
    <>
      {sentence.slice(0, at)}
      <mark className="rounded bg-[#fde7b0] px-[0.2em] font-bold text-[#14365a]">{word}</mark>
      {sentence.slice(at + word.length)}
    </>
  );
}

function CorrectionsTab() {
  const t = useT();
  const report = useAdminData(getGrammarCorrections, tk("We couldn't load the AI corrections. Please try again."));
  const d: GrammarCorrectionsReport | null = report.data;

  if (!d) return <LoadState error={report.error} onRetry={report.reload} />;

  const stats = [
    { label: tk("Total corrections"), value: d.total, icon: Wand2 },
    { label: tk("Passages"), value: d.passages, icon: FileText },
    { label: tk("Teachers"), value: d.teachers, icon: Users },
  ];

  return (
    <>
      <ul className="grid gap-[1em] sm:grid-cols-3">
        {stats.map((s) => (
          <li key={s.label} className={`${card} flex items-center gap-[0.8em]`}>
            <span className="grid size-[2.6em] place-items-center rounded-[0.7em] bg-[#eef4fa] text-[#14365a]">
              <s.icon className="size-[1.2em]" />
            </span>
            <span className="leading-tight">
              <span className="block text-[0.8em] text-[#5b6b7c]">{t(s.label)}</span>
              <span className="block text-[1.5em] font-bold text-[#14365a]">{s.value.toLocaleString("en")}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="grid gap-[1.2em] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <section className={card}>
          <h2 className="text-[1em] font-bold text-[#14365a]">{t("Most common AI mistakes")}</h2>
          <p className="text-[0.8em] text-[#5b6b7c]">{t("Use these to improve the AI's instructions.")}</p>
          {d.topMistakes.length === 0 ? (
            <p className="py-[2em] text-center text-[0.85em] text-[#5b6b7c]">{t("No corrections yet.")}</p>
          ) : (
            <div className="mt-[0.8em] overflow-x-auto">
              <table className="w-full min-w-[18rem] text-[0.82em] text-[#14365a]">
                <thead>
                  <tr className="border-b border-[#e1e8f0] text-[0.85em] text-[#14365a]/55">
                    <th scope="col" className="py-2 pe-3 text-start font-medium">{t("AI said")}</th>
                    <th scope="col" className="py-2 pe-3 text-start font-medium">{t("Teacher corrected to")}</th>
                    <th scope="col" className="py-2 text-end font-medium">{t("Times")}</th>
                  </tr>
                </thead>
                <tbody>
                  {d.topMistakes.map((m) => (
                    <tr key={`${m.aiRole}>${m.teacherRole}`} className="border-b border-[#eef2f7] last:border-0">
                      <td dir="rtl" className="py-2.5 pe-3 text-start text-[#b83232]">{m.aiRole}</td>
                      <td dir="rtl" className="py-2.5 pe-3 text-start font-semibold text-[#1b7a3a]">{m.teacherRole}</td>
                      <td className="py-2.5 text-end font-bold">{m.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className={card}>
          <h2 className="text-[1em] font-bold text-[#14365a]">{t("Recent corrections")}</h2>
          {d.recent.length === 0 ? (
            <p className="py-[2em] text-center text-[0.85em] text-[#5b6b7c]">{t("No corrections yet.")}</p>
          ) : (
            <ul className="mt-[0.6em] divide-y divide-[#e6edf3]">
              {d.recent.map((c) => (
                <li key={c.id} className="grid gap-[0.4em] py-[0.8em] text-[0.85em]">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-[0.8em]">
                    <span dir="auto" className="font-semibold text-[#0b1b2b]">
                      {c.passageTitle || t("Untitled passage")}
                    </span>
                    <span className="text-[0.85em] text-[#8a97a6]">
                      {t("{name} • {date}", { name: c.teacherName, date: formatDate(c.createdUtc) })}
                    </span>
                  </div>
                  <p dir="rtl" className="rounded-[0.6em] bg-[#f5f8fb] px-[0.8em] py-[0.5em] leading-relaxed text-[#14365a]">
                    <HighlightedSentence sentence={c.sentence} word={c.word} />
                  </p>
                  <p className="flex flex-wrap items-center gap-[0.5em] text-[0.9em]">
                    <span className="text-[#5b6b7c]">{t("AI:")}</span>
                    <span dir="rtl" className="rounded-full bg-[#fdecec] px-[0.6em] text-[#b83232] line-through">
                      {c.aiRole}
                    </span>
                    <span className="text-[#5b6b7c]">{t("Teacher:")}</span>
                    <span dir="rtl" className="rounded-full bg-[#c9f0d2] px-[0.6em] font-semibold text-[#1b7a3a]">
                      {c.teacherRole}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
