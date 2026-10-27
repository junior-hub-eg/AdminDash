"use client";

import { useCallback, useState, type FormEvent } from "react";
import { Check, LoaderCircle, RefreshCw, UserMinus, UserPlus, X } from "lucide-react";
import {
  addClassStudent,
  decideJoinRequest,
  getTeacherClass,
  getTeacherClasses,
  removeClassStudent,
  renewClassCode,
  setClassAutoAccept,
  type TeacherClassDetail,
} from "@/lib/admin-teachers-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { BTN_SECONDARY, INPUT } from "../page-parts";
import { LoadState, useAdminData } from "../admin-data";
import { EmptyNote, Section } from "../mentor-detail/parts";
import { shortDate } from "../mentor-detail/format";

const SMALL = `${BTN_SECONDARY} !px-[0.8em] !py-[0.35em] !text-[0.75em]`;

/** One class as the teacher manages it: students, join requests, the join code and auto-accept. */
function ClassPanel({ id, classId, onChanged }: { id: string; classId: string; onChanged: () => void }) {
  const t = useT();
  const load = useCallback(() => getTeacherClass(id, classId), [id, classId]);
  const data = useAdminData<TeacherClassDetail>(load, tk("We couldn't load the class. Please try again."));
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  async function run(key: string, action: () => Promise<TeacherClassDetail | void>) {
    setBusy(key);
    setError(null);
    try {
      const next = await action();
      if (next) data.setData(next);
      else await data.reload();
      onChanged();
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't save the change. Please try again.")));
    } finally {
      setBusy(null);
    }
  }

  function add(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    void run("add", async () => {
      const next = await addClassStudent(id, classId, email.trim());
      setEmail("");
      return next;
    });
  }

  const c = data.data;
  if (!c) return <LoadState error={data.error} onRetry={data.reload} />;
  const spin = (key: string) => busy === key && <LoaderCircle className="size-[1em] animate-spin" />;

  return (
    <div className="grid gap-[1em]">
      <div className="flex flex-wrap items-center gap-[0.6em] text-[0.8em] text-[#14365a]">
        <span>
          {t("Join code")}: <b dir="ltr" className="tracking-[0.1em]">{c.joinCode}</b>
        </span>
        <button type="button" disabled={!!busy} onClick={() => run("code", () => renewClassCode(id, classId))} className={SMALL}>
          {spin("code") || <RefreshCw className="size-[1em]" />} {t("New Code")}
        </button>
        <label className="ms-auto inline-flex cursor-pointer items-center gap-[0.5em] font-semibold">
          <input
            type="checkbox"
            checked={c.autoAccept}
            disabled={!!busy}
            onChange={(e) => run("auto", () => setClassAutoAccept(id, classId, e.target.checked))}
            className="size-[1.1em] accent-[#06b6d4]"
          />
          {t("Accept join requests automatically")}
        </label>
      </div>

      {c.requests.length > 0 && (
        <div>
          <p className="mb-[0.4em] text-[0.75em] font-bold uppercase tracking-[0.08em] text-[#9a6a00]">{t("Join Requests")}</p>
          <ul className="grid gap-[0.4em] text-[0.8em]">
            {c.requests.map((r) => (
              <li key={r.studentId} className="flex flex-wrap items-center justify-between gap-[0.5em] rounded-[0.7em] bg-[#fff8e6] px-[0.9em] py-[0.5em]">
                <span>
                  <b className="text-[#0b1b2b]">{r.fullName}</b> <span className="text-[#5b6b7c]">• {shortDate(r.requestedUtc)}</span>
                </span>
                <span className="flex gap-[0.4em]">
                  <button type="button" disabled={!!busy} onClick={() => run(`ok-${r.studentId}`, () => decideJoinRequest(id, classId, r.studentId, true))} className={`${SMALL} !text-[#12676b]`}>
                    {spin(`ok-${r.studentId}`) || <Check className="size-[1em]" />} {t("Accept")}
                  </button>
                  <button type="button" disabled={!!busy} onClick={() => run(`no-${r.studentId}`, () => decideJoinRequest(id, classId, r.studentId, false))} className={`${SMALL} !text-[#b83232]`}>
                    {spin(`no-${r.studentId}`) || <X className="size-[1em]" />} {t("Decline")}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={add} className="flex flex-wrap items-center gap-[0.5em] text-[0.8em]">
        <input
          type="email"
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="student@example.com"
          aria-label={t("Student's email")}
          className={`${INPUT} min-w-[16em] flex-1 !text-[1em]`}
        />
        <button type="submit" disabled={!!busy || !email.trim()} className={`${BTN_SECONDARY} !text-[1em]`}>
          {spin("add") || <UserPlus className="size-[1em]" />} {t("Add Student by Email")}
        </button>
      </form>

      {error && <p role="alert" className="text-[0.8em] font-semibold text-[#b83232]">{error}</p>}

      {c.students.length === 0 ? (
        <EmptyNote text={t("No students in this class yet.")} />
      ) : (
        <ul className="grid gap-[0.3em] text-[0.8em]">
          {c.students.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-[0.5em] border-b border-[#eef2f7] py-[0.45em] last:border-0">
              <span className="min-w-0">
                <b className="text-[#0b1b2b]">{s.fullName}</b>{" "}
                <span className="text-[#8a97a6]" dir="ltr">{s.email}</span>
                <span className="block text-[0.9em] text-[#5b6b7c]">
                  {s.joinedVia === "Code" ? t("Joined with the code") : t("From the school record")} • {t("Attendance {n}%", { n: s.attendance })}
                  {s.mastery != null && <> • {t("Mastery {n}%", { n: s.mastery })}</>}
                </span>
              </span>
              {confirm === s.id ? (
                <span className="flex items-center gap-[0.4em]">
                  <span className="text-[#b83232]">{t("Take {name} out of the class?", { name: s.fullName })}</span>
                  <button type="button" onClick={() => setConfirm(null)} className={SMALL}>
                    {t("Cancel")}
                  </button>
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() =>
                      run(`rm-${s.id}`, async () => {
                        await removeClassStudent(id, classId, s.id);
                        setConfirm(null);
                      })
                    }
                    className={`${SMALL} !text-[#b83232]`}
                  >
                    {spin(`rm-${s.id}`)} {t("Remove")}
                  </button>
                </span>
              ) : (
                <button type="button" onClick={() => setConfirm(s.id)} className={`${SMALL} !text-[#b83232]`}>
                  <UserMinus className="size-[1em]" /> {t("Remove")}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The teacher's classes; open one to manage its students, requests, code and auto-accept. */
export function TeacherClassesTab({ id }: { id: string }) {
  const t = useT();
  const load = useCallback(() => getTeacherClasses(id), [id]);
  const classes = useAdminData(load, tk("We couldn't load the classes. Please try again."));
  const [open, setOpen] = useState<string | null>(null);

  if (!classes.data) return <Section title={t("Classes")}><LoadState error={classes.error} onRetry={classes.reload} /></Section>;
  const current = open ?? classes.data[0]?.id ?? null;

  return (
    <Section title={t("Classes")} sub={t("Manage each class as the teacher does: students, join requests, the join code.")}>
      {classes.data.length === 0 ? (
        <EmptyNote text={t("No classes yet.")} />
      ) : (
        <div className="grid gap-[1em] lg:grid-cols-[minmax(0,14em)_minmax(0,1fr)]">
          <ul className="flex gap-[0.4em] overflow-x-auto lg:grid lg:content-start">
            {classes.data.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setOpen(c.id)}
                  aria-pressed={current === c.id}
                  className={`w-full whitespace-nowrap rounded-[0.7em] px-[0.9em] py-[0.6em] text-start text-[0.8em] ${current === c.id ? "bg-[#e0f6fc] text-[#0b6f86]" : "bg-[#f4f8fd] text-[#14365a] hover:bg-[#eaf2fb]"}`}
                >
                  <b className="block">{t("Class {name}", { name: c.name })}</b>
                  <span className="text-[0.9em] text-[#5b6b7c]">
                    {t("{n} students", { n: c.students })}
                    {c.pendingRequests > 0 && <> • <b className="text-[#9a6a00]">{t("{n} join requests", { n: c.pendingRequests })}</b></>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {current && <ClassPanel key={current} id={id} classId={current} onChanged={classes.reload} />}
        </div>
      )}
    </Section>
  );
}
