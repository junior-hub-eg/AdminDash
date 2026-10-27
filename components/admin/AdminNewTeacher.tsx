"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { createTeacher } from "@/lib/admin-teachers-api";
import { useI18n } from "@/lib/i18n/client";
import { AdminPage } from "./AdminPage";
import { TeacherForm } from "./teacher-detail/TeacherForm";

/** "Add Teacher": an active teacher account; the teacher signs in with the email and password the admin sets. */
export default function AdminNewTeacher() {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <AdminPage>
      <div className="pt-[calc(var(--u)*5.4)] lg:px-[calc(var(--u)*1.6)]">
        <nav aria-label={t("Breadcrumb")} className="text-[0.7em] font-medium text-[#5b6b7c]">
          <Link href={"/admin/dashboard" as Route} className="hover:underline">
            {t("Admin")}
          </Link>{" "}
          <span aria-hidden className="rtl:inline-block rtl:rotate-180">›</span>{" "}
          <Link href={"/admin/teachers" as Route} className="hover:underline">
            {t("Teachers Management")}
          </Link>{" "}
          <span aria-hidden className="rtl:inline-block rtl:rotate-180">›</span> <span className="text-[#14365a]">{t("Add Teacher")}</span>
        </nav>
        <h1 className="text-[2em] font-extrabold leading-tight text-[#0b1b2b]">{t("Add Teacher")}</h1>
        <p className="max-w-[36em] text-[0.85em] text-[#5b6b7c]">
          {t("Create a teacher account. The teacher can sign in right away with the email and password you set.")}
        </p>

        <section className="mx-auto mt-[1.2em] max-w-[46em] rounded-[1.1em] bg-white p-[1.4em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]">
          <TeacherForm
            create
            submitLabel={t("Add Teacher")}
            onCancel={() => router.push("/admin/teachers" as Route)}
            onSave={async (body) => {
              const created = await createTeacher(body);
              router.push(`/admin/teachers/${created.id}` as Route);
            }}
          />
        </section>
      </div>
    </AdminPage>
  );
}
