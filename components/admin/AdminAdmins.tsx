"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { createAdmin, getAdmins } from "@/lib/admin-api";
import { useAuth } from "@/lib/auth/auth-context";
import { ApiError, errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";
import { AdminPage, PageHero } from "./AdminPage";
import { LoadState, useAdminData } from "./admin-data";

const schema = z.object({
  fullName: z.string().trim().min(1, tk("Full name is required.")).max(100),
  email: z.string().trim().min(1, tk("Email is required.")).email(tk("Enter a valid email address.")),
  password: z
    .string()
    .min(8, tk("Use at least 8 characters."))
    .refine((p) => /[a-z]/i.test(p) && /\d/.test(p), tk("Use letters and numbers."))
    .refine((p) => /[^a-z0-9]/i.test(p), tk("Include a special character, for example ! @ # $.")),
});
type FormValues = z.infer<typeof schema>;

const card = "rounded-[1.1em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]";
const input = "w-full rounded-[0.5em] border border-[#d5dee8] bg-white px-[0.8em] py-[0.5em] outline-none focus:border-[#1d6fe0]";

const date = (iso: string) => new Date(iso).toLocaleDateString(dateLocale("en-GB"), { day: "numeric", month: "short", year: "numeric" });

/** The main admin's page: the admins, and the form to add one. Other admins get NOT_THE_OWNER from the backend. */
export default function AdminAdmins() {
  const t = useT();
  const { user } = useAuth();
  if (user && !user.isOwner) {
    return (
      <AdminPage>
        <PageHero title={t("Admins")} contentClassName="pb-[3em]" pictureTop />
        <p role="status" className="mx-auto mt-[1.5em] w-full max-w-[36em] rounded-[1em] bg-white p-[1.2em] text-center text-[0.9em] text-[#14365a] shadow-[0_6px_22px_rgba(20,54,90,0.07)]">
          {t("Only the main admin can manage admins.")}
        </p>
      </AdminPage>
    );
  }
  return <OwnerAdmins />;
}

function OwnerAdmins() {
  const t = useT();
  const admins = useAdminData(getAdmins, tk("We couldn't load the admins. Please try again."));
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { fullName: "", email: "", password: "" } });

  async function onSubmit(values: FormValues) {
    setError(null);
    setAdded(null);
    try {
      const admin = await createAdmin(values);
      admins.setData((list) => (list ? [...list, admin] : list));
      setAdded(admin.email);
      reset();
    } catch (e) {
      if (e instanceof ApiError && e.code === "VALIDATION_FAILED") {
        Object.entries(e.fieldErrors).forEach(([field, message]) => setFieldError(field as keyof FormValues, { message }));
        return;
      }
      setError(errorMessage(e, tk("We couldn't add the admin. Please try again.")));
    }
  }

  const field = (name: keyof FormValues, label: string, el: React.ReactNode) => (
    <label className="grid gap-[0.3em] text-[0.85em]">
      <span className="font-semibold text-[#14365a]">{label}</span>
      {el}
      {errors[name] && <span className="text-[0.9em] text-[#b83232]">{t(errors[name]!.message ?? "")}</span>}
    </label>
  );

  return (
    <AdminPage>
      <PageHero title={t("Admins")} contentClassName="pb-[3em]" pictureTop>
        <p className="mt-[0.6em] max-w-[40em] text-[0.9em] text-[#14365a]">
          {t("Only you, the main admin, can add admins. They sign in on the admin sign-in page.")}
        </p>
      </PageHero>

      <div className="mx-auto mt-[1.5em] grid w-full gap-[1.2em] lg:w-[85%] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className={card}>
          <h2 className="text-[1em] font-bold text-[#14365a]">{t("Admins")}</h2>
          {admins.data ? (
            <ul className="mt-[0.8em] divide-y divide-[#e6edf3] text-[0.85em]">
              {admins.data.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-[0.6em] py-[0.7em]">
                  <span className="grid size-[2.2em] shrink-0 place-items-center rounded-full bg-[#14365a] text-white">
                    <ShieldCheck className="size-[1.1em]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-[#0b1b2b]">
                      {a.fullName}{" "}
                      {a.isOwner && (
                        <span className="ms-[0.3em] rounded-full bg-[#fdeec2] px-[0.6em] py-[0.1em] text-[0.8em] font-medium text-[#a8740a]">
                          {t("Main admin")}
                        </span>
                      )}
                    </span>
                    <span dir="ltr" className="block truncate text-[#5b6b7c] rtl:text-end">
                      {a.email}
                    </span>
                  </span>
                  <span className="text-[0.85em] text-[#8a97a6]">
                    {a.lastLoginUtc ? t("Last sign-in {date}", { date: date(a.lastLoginUtc) }) : t("Never signed in")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <LoadState error={admins.error} onRetry={admins.reload} />
          )}
        </section>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className={`${card} grid content-start gap-[0.9em]`}>
          <h2 className="text-[1em] font-bold text-[#14365a]">{t("Add an admin")}</h2>
          {error && <p role="alert" className="rounded-[0.6em] bg-[#fdecec] px-[0.9em] py-[0.6em] text-[0.85em] font-semibold text-[#b83232]">{error}</p>}
          {added && (
            <p role="status" className="rounded-[0.6em] bg-[#d7efe6] px-[0.9em] py-[0.6em] text-[0.85em] font-semibold text-[#12676b]">
              {t("{email} is now an admin.", { email: added })}
            </p>
          )}
          {field("fullName", t("Full Name"), <input className={input} autoComplete="off" {...register("fullName")} />)}
          {field("email", t("Email"), <input className={input} type="email" dir="ltr" autoComplete="off" {...register("email")} />)}
          {field("password", t("Password"), <input className={input} type="password" dir="ltr" autoComplete="new-password" {...register("password")} />)}
          <button
            type="submit"
            disabled={isSubmitting || !admins.data}
            className="inline-flex w-fit items-center gap-[0.4em] rounded-[0.5em] bg-[#1d6fe0] px-[1.4em] py-[0.6em] text-[0.85em] font-semibold text-white disabled:opacity-50"
          >
            {isSubmitting && <LoaderCircle className="size-[1em] animate-spin" />} {t("Add admin")}
          </button>
        </form>
      </div>
    </AdminPage>
  );
}
