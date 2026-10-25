"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { AdminStudent, AdminStudentStatus } from "@/lib/admin-api";
import { avatarOrDefault } from "@/lib/avatars";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

export const STUDENT_STATUS_STYLE: Record<AdminStudentStatus, string> = {
  Active: "bg-[#d7efe6] text-[#12676b]",
  Inactive: "bg-[#e6ebf1] text-[#5b6b7c]",
  Pending: "bg-[#fdeec2] text-[#a8740a]",
};

export const STUDENT_STATUS_LABEL: Record<AdminStudentStatus, string> = {
  Active: tk("Active"),
  Inactive: tk("Inactive"),
  Pending: tk("Pending"),
};

export function StudentAvatar({ student, index, size = "2em" }: { student: Pick<AdminStudent, "photoUrl" | "gender">; index: number; size?: string }) {
  const avatar = avatarOrDefault(student.photoUrl, index, student.gender);
  return (
    <span className="relative shrink-0 overflow-hidden rounded-full" style={{ width: size, height: size, backgroundColor: avatar.bg }}>
      <Image src={avatar.src} alt="" fill sizes="48px" className="object-cover" />
    </span>
  );
}

/** Every student; ?track=CODE (from a track card) shows one track's students. */
export function StudentsTable({ students }: { students: AdminStudent[] }) {
  const t = useT();
  const params = useSearchParams();
  const track = params.get("track");
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter(
      (s) => (!track || s.trackCode === track) && (!q || s.fullName.toLowerCase().includes(q) || s.squadName?.toLowerCase().includes(q)),
    );
  }, [students, track, query]);
  const trackName = track ? students.find((s) => s.trackCode === track)?.trackName ?? track : null;

  return (
    <section className="rounded-[1.1em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]">
      <header className="flex flex-wrap items-center justify-between gap-[0.8em]">
        <h2 className="text-[1em] font-bold text-[#14365a]">
          {t("Master Student Table")}{" "}
          <span className="text-[0.8em] font-medium text-[#8a97a6]">({shown.length})</span>
        </h2>
        <label className="flex items-center gap-[0.5em] rounded-[0.5em] border border-[#d5dee8] px-[0.8em] py-[0.4em] text-[0.8em]">
          <Search className="size-[1em] text-[#8a97a6]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Search by name or squad")}
            aria-label={t("Search by name or squad")}
            className="w-[14em] bg-transparent outline-none"
          />
        </label>
      </header>

      {trackName && (
        <p className="mt-[0.6em] text-[0.8em] text-[#5b6b7c]">
          {t("Showing students of {track}.", { track: trackName })}{" "}
          <Link href={"/admin/students" as Route} className="font-semibold text-[#1d6fe0] hover:underline">
            {t("Show all")}
          </Link>
        </p>
      )}

      <div className="mt-[1em] overflow-x-auto rounded-[0.7em] border border-[#e6edf3]">
        <table className="w-full min-w-[40em] text-start text-[0.8em]">
          <thead>
            <tr className="bg-[#f4f7fb] text-[0.85em] text-[#5b6b7c]">
              <th className="px-[1.1em] py-[0.7em] text-start font-medium">{t("Student Name")}</th>
              <th className="px-[1.1em] py-[0.7em] text-start font-medium">{t("Track")}</th>
              <th className="px-[1.1em] py-[0.7em] text-start font-medium">{t("Squad")}</th>
              <th className="px-[1.1em] py-[0.7em] text-start font-medium">{t("Status")}</th>
              <th className="px-[1.1em] py-[0.7em] text-end font-medium">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody className="text-[#14365a]">
            {shown.map((s, i) => (
              <tr key={s.id} className="border-t border-[#e6edf3] hover:bg-[#f9fbfd]">
                <td className="px-[1.1em] py-[0.7em]">
                  <span className="flex items-center gap-[0.7em] font-semibold">
                    <StudentAvatar student={s} index={i} />
                    {s.fullName}
                  </span>
                </td>
                <td className="px-[1.1em] py-[0.7em] text-[#5b6b7c]">{s.trackName ?? t("No track yet")}</td>
                <td className="px-[1.1em] py-[0.7em] text-[#5b6b7c]">{s.squadName ?? "—"}</td>
                <td className="px-[1.1em] py-[0.7em]">
                  <span className={`rounded-full px-[0.8em] py-[0.2em] text-[0.85em] font-medium ${STUDENT_STATUS_STYLE[s.status]}`}>
                    {t(STUDENT_STATUS_LABEL[s.status])}
                  </span>
                </td>
                <td className="px-[1.1em] py-[0.7em] text-end">
                  <Link
                    href={`/admin/students/${s.id}` as Route}
                    className="rounded-[0.5em] border border-[#d5dee8] px-[0.9em] py-[0.35em] text-[0.85em] font-medium hover:bg-[#eef4fa]"
                  >
                    {t("View Profile")}
                  </Link>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={5} className="px-[1.1em] py-[1.5em] text-center text-[#8a97a6]">
                  {t("No students match.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
