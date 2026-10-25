"use client";

import { useRef, useState } from "react";
import { CircleHelp, Flame, Leaf, Plus, Star, Trash2 } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";
import { AdminCard, AdminPageHero, FIELD, type HeroStat } from "./AdminPageFrame";

type QType = "mcq" | "tf" | "code";
type Difficulty = "easy" | "medium" | "hard";

type Question = {
  id: string;
  type: QType;
  text: string;
  difficulty: Difficulty;
  points: number;
  options: string[]; // mcq only
  answer: number; // mcq: option index, tf: 0 = True / 1 = False
};

const TYPE_LABEL: Record<QType, string> = {
  mcq: "Multiple Choice",
  tf: "True / False",
  code: "Coding",
};

const DIFF_LABEL: Record<Difficulty, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };

const DIFF_STYLE: Record<Difficulty, string> = {
  easy: "bg-[#8cc63f] text-[#14365a]",
  medium: "bg-[#ffc531] text-[#14365a]",
  hard: "bg-[#e0453f] text-white",
};

// Mock question bank: replace with your API.
const BANK: Omit<Question, "id">[] = [
  { type: "tf", text: "Is python a statically typed language?", difficulty: "easy", points: 5, options: [], answer: 1 },
  {
    type: "mcq",
    text: "What is the time complexity of the binary search ?",
    difficulty: "medium",
    points: 10,
    options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
    answer: 1,
  },
  {
    type: "mcq",
    text: "Which data structure uses a Last In , First Out order?",
    difficulty: "hard",
    points: 15,
    options: ["Queue", "Stack", "Array", "Heap"],
    answer: 1,
  },
  {
    type: "code",
    text: "Upload a python script that takes user input and prints the sum of all even numbers up to that input.",
    difficulty: "medium",
    points: 20,
    options: [],
    answer: 0,
  },
];

const initialQuestions: Question[] = BANK.map((q, i) => ({ ...q, id: `q${i + 1}` }));

function validate(title: string, qs: Question[]): string | null {
  if (!title.trim()) return "Please enter an assessment title.";
  if (qs.length === 0) return "Add at least one question.";

  for (const q of qs) {
    if (!q.text.trim()) return "Every question needs text.";
    if (q.type === "mcq" && q.options.some((o) => !o.trim())) return "Fill in all answer options.";
  }

  return null;
}

export default function AssessmentBuilderPage() {
  const { t } = useI18n();

  const nextId = useRef(100);

  const [title, setTitle] = useState("Software Engineer Assessment");
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [tab, setTab] = useState<"library" | "mine">("mine");
  const [libFilter, setLibFilter] = useState<"all" | QType>("all");
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const newId = () => `q${nextId.current++}`;

  const change = (next: Question[]) => {
    setQuestions(next);
    setStatus(null);
  };

  const update = (id: string, patch: Partial<Question>) =>
    change(questions.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const remove = (id: string) => change(questions.filter((q) => q.id !== id));

  const addBlank = (type: QType) =>
    change([
      ...questions,
      {
        id: newId(),
        type,
        text: "",
        difficulty: "easy",
        points: type === "code" ? 20 : 5,
        options: type === "mcq" ? ["", "", "", ""] : [],
        answer: 0,
      },
    ]);

  const addFromBank = (q: Omit<Question, "id">) => {
    change([...questions, { ...q, id: newId() }]);
    setTab("mine");
  };

  const save = () => {
    const err = validate(title, questions);

    if (err) {
      setStatus({ kind: "error", text: err });

      return;
    }

    // TODO: send { title, questions } to your API here.
    setStatus({ kind: "ok", text: "Assessment saved" });
  };

  const total = questions.reduce((sum, q) => sum + q.points, 0);

  const stats: HeroStat[] = [
    { label: "Questions", value: String(questions.length), icon: CircleHelp },
    { label: "Total Points", value: String(total), icon: Star, valueClass: "text-[#0f8a86]" },
    {
      label: "Easy",
      value: String(questions.filter((q) => q.difficulty === "easy").length),
      icon: Leaf,
      valueClass: "text-[#1b9a4a]",
    },
    {
      label: "Hard",
      value: String(questions.filter((q) => q.difficulty === "hard").length),
      icon: Flame,
      valueClass: "text-[#e0245e]",
    },
  ];

  const library = BANK.filter((q) => libFilter === "all" || q.type === libFilter);

  return (
    <AdminPageHero title="Assessment Builder" stats={stats}>
      <div className="mx-auto max-w-3xl space-y-3">
        <label className="block">
          <span className="sr-only">{t("Assessment title")}</span>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setStatus(null);
            }}
            placeholder={t("Assessment title")}
            className="w-full bg-transparent text-[clamp(1.1rem,calc(var(--u)*1.7),1.6rem)] font-bold text-[#14365a] outline-none placeholder:text-[#14365a]/40 focus:underline"
          />
        </label>

        <div role="tablist" className="grid grid-cols-2 gap-2">
          {(
            [
              ["library", "Question library"],
              ["mine", "My Questions"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`rounded-xl border px-4 py-2.5 text-start text-sm font-semibold transition-colors ${
                tab === key
                  ? "border-white bg-white text-[#14365a] shadow"
                  : "border-white/70 bg-white/50 text-[#14365a]/70 hover:bg-white/70"
              }`}
            >
              {t(label)}
              {key === "mine" && ` (${questions.length})`}
            </button>
          ))}
        </div>

        {tab === "library" ? (
          <AdminCard>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-[#14365a]">{t("Question library")}</h2>

              <select
                value={libFilter}
                onChange={(e) => setLibFilter(e.target.value as "all" | QType)}
                aria-label={t("Filter by type")}
                className={`${FIELD} sm:w-44`}
              >
                <option value="all">{t("All types")}</option>
                {(Object.keys(TYPE_LABEL) as QType[]).map((k) => (
                  <option key={k} value={k}>
                    {t(TYPE_LABEL[k])}
                  </option>
                ))}
              </select>
            </div>

            <ul className="space-y-2">
              {library.map((q) => {
                const added = questions.some((x) => x.text === q.text);

                return (
                  <li
                    key={q.text}
                    className="flex flex-wrap items-center gap-3 rounded-xl bg-[#f4f8fc] px-3 py-2.5 text-[0.8rem] text-[#14365a]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{q.text}</span>
                      <span className="text-[0.68rem] text-[#14365a]/55">{t(TYPE_LABEL[q.type])}</span>
                    </span>

                    <span className={`rounded-md px-2.5 py-0.5 text-[0.7rem] font-bold ${DIFF_STYLE[q.difficulty]}`}>
                      {t(DIFF_LABEL[q.difficulty])}
                    </span>
                    <span className="w-7 text-center font-bold">{q.points}</span>

                    <button
                      type="button"
                      disabled={added}
                      onClick={() => addFromBank(q)}
                      className="rounded-full border border-[#cfe0ee] bg-white px-3 py-1 text-[0.7rem] font-semibold hover:bg-[#eef4fa] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {t(added ? "Added" : "Add")}
                    </button>
                  </li>
                );
              })}
            </ul>
          </AdminCard>
        ) : (
          <>
            <ul className="space-y-3">
              {questions.map((q, i) => (
                <li key={q.id}>
                  <AdminCard className="space-y-3 text-[#14365a]">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="me-auto text-sm font-bold text-[#0f8a86]">
                        {i + 1} | {t(TYPE_LABEL[q.type])}
                      </h3>

                      <select
                        value={q.difficulty}
                        onChange={(e) => update(q.id, { difficulty: e.target.value as Difficulty })}
                        aria-label={t("Difficulty")}
                        className={`h-8 rounded-md border-0 px-2 text-[0.72rem] font-bold outline-none ${DIFF_STYLE[q.difficulty]}`}
                      >
                        {(Object.keys(DIFF_LABEL) as Difficulty[]).map((d) => (
                          <option key={d} value={d} className="bg-white text-[#14365a]">
                            {t(DIFF_LABEL[d])}
                          </option>
                        ))}
                      </select>

                      <label className="flex items-center gap-1.5 text-[0.7rem] text-[#14365a]/60">
                        {t("Points")}
                        <input
                          type="number"
                          min={1}
                          value={q.points}
                          onChange={(e) => update(q.id, { points: Math.max(1, Number(e.target.value) || 1) })}
                          className="h-8 w-16 rounded-md border border-[#cfe0ee] px-2 text-center text-[0.8rem] font-bold text-[#14365a] outline-none focus:ring-2 focus:ring-[#12939b]/40"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => remove(q.id)}
                        aria-label={t("Delete question")}
                        className="grid size-8 place-items-center rounded-full text-[#e0245e] hover:bg-[#fde8ef]"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <textarea
                      value={q.text}
                      onChange={(e) => update(q.id, { text: e.target.value })}
                      rows={2}
                      placeholder={t("Write the question here")}
                      aria-label={t("Question text")}
                      className="w-full resize-y rounded-xl border border-[#cfe0ee] px-3 py-2 text-[0.85rem] font-medium outline-none focus:ring-2 focus:ring-[#12939b]/40"
                    />

                    {q.type === "mcq" && (
                      <ul className="space-y-2">
                        {q.options.map((opt, oi) => (
                          <li key={oi} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`answer-${q.id}`}
                              checked={q.answer === oi}
                              onChange={() => update(q.id, { answer: oi })}
                              aria-label={t("Correct answer")}
                              className="size-4 accent-[#12939b]"
                            />
                            <span className="w-4 text-[0.8rem] font-semibold text-[#14365a]/60">
                              {String.fromCharCode(65 + oi)}
                            </span>
                            <input
                              value={opt}
                              onChange={(e) =>
                                update(q.id, {
                                  options: q.options.map((o, k) => (k === oi ? e.target.value : o)),
                                })
                              }
                              className={FIELD}
                            />
                          </li>
                        ))}
                      </ul>
                    )}

                    {q.type === "tf" && (
                      <div role="radiogroup" aria-label={t("Correct answer")} className="flex gap-2">
                        {[
                          ["True", 0, "bg-[#c9f0d2] text-[#1b7a3a]"],
                          ["False", 1, "bg-[#fde0e0] text-[#c0392b]"],
                        ].map(([label, val, tone]) => (
                          <button
                            key={label as string}
                            type="button"
                            role="radio"
                            aria-checked={q.answer === val}
                            onClick={() => update(q.id, { answer: val as number })}
                            className={`rounded-full px-5 py-1.5 text-[0.78rem] font-semibold ${tone} ${
                              q.answer === val ? "ring-2 ring-[#14365a]" : "opacity-60"
                            }`}
                          >
                            {t(label as string)}
                          </button>
                        ))}
                      </div>
                    )}

                    {q.type === "code" && (
                      <p className="rounded-xl bg-[#f4f8fc] px-3 py-2 text-[0.75rem] text-[#14365a]/65">
                        {t("Students will upload their script as a file.")}
                      </p>
                    )}
                  </AdminCard>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[0.75rem] font-semibold text-[#14365a]/70">{t("Add question")}:</span>
              {(Object.keys(TYPE_LABEL) as QType[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => addBlank(k)}
                  className="flex items-center gap-1 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-[0.72rem] font-semibold text-[#14365a] hover:bg-white"
                >
                  <Plus className="size-3.5" /> {t(TYPE_LABEL[k])}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          type="button"
          onClick={save}
          className="h-11 w-full rounded-full bg-[#14365a] text-sm font-semibold text-white shadow-md hover:bg-[#0f2a47]"
        >
          {t("Save Assessment")}
        </button>

        {status && (
          <p
            role={status.kind === "error" ? "alert" : "status"}
            className={`text-center text-[0.8rem] font-semibold ${
              status.kind === "error" ? "text-[#e0245e]" : "text-[#1b7a3a]"
            }`}
          >
            {t(status.text)}
          </p>
        )}
      </div>
    </AdminPageHero>
  );
}