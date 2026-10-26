"use client";

import { useState } from "react";
import Image from "next/image";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, LoaderCircle, Lock, Mail, ShieldCheck } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth/auth-context";
import { ROLE_HOME } from "@/lib/constants";
import { ApiError, errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { ForgotPasswordPanel } from "./login/ForgotPasswordPanel";

const schema = z.object({
  email: z.string().min(1, tk("Email is required")).email(tk("Invalid email address")),
  password: z.string().min(1, tk("Password is required")),
  rememberMe: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const LOGO = "/images/admin/reicon_grad-cap-filled.png";

const INPUT =
  "h-12 w-full rounded-[12px] border bg-[#f7f9fb] ps-11 text-[15px] text-[#1a2b57] outline-none transition placeholder:text-[#9aa5b1] focus:bg-white focus:ring-2 focus:ring-[#12939b]/20";

/** Sign-in for the admin only (Admin Login design). Students and mentors are refused by the backend (NOT_AN_ADMIN). */
export function AdminLoginForm() {
  const t = useT();
  const { adminLogin } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", rememberMe: false } });

  async function onSubmit(values: FormValues) {
    try {
      setError(null);
      await adminLogin(values.email, values.password, values.rememberMe);
      router.push(ROLE_HOME.admin as Route);
    } catch (e) {
      if (e instanceof ApiError && e.code === "VALIDATION_FAILED") {
        Object.entries(e.fieldErrors).forEach(([field, message]) => setFieldError(field as keyof FormValues, { message }));
        return;
      }
      setError(errorMessage(e));
    }
  }

  const fieldBorder = (bad: boolean) => (bad ? "border-[#e5484d]" : "border-[#e1e6ec] focus:border-[#12939b]");

  return (
    <div className="w-full max-w-[556px] rounded-[28px] bg-white px-6 py-8 shadow-[0_24px_60px_rgba(26,43,87,0.14)] sm:px-11 sm:py-11">
      {/* Logo + Admin portal pill */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="flex items-center gap-2.5">
          <Image src={LOGO} alt="" width={44} height={44} className="h-[34px] w-[44px] object-contain" priority />
          <span className="text-[21px] font-bold tracking-tight text-[#12808a]">Junior Hub</span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1a2b57] px-2.5 py-1 text-[11.5px] font-medium text-white">
          <ShieldCheck className="size-3.5" />
          {t("Admin portal")}
        </span>
      </div>

      <h1 className="mt-7 text-[32px] font-bold leading-tight tracking-tight text-[#1a2b57]">{t("Welcome back")}</h1>
      <p className="mt-4 text-[14.5px] leading-relaxed text-[#6b7686]">
        {t("Sign in with your administrator account to manage squads, mentors and tracks.")}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
        {error && <Alert variant="danger">{error}</Alert>}

        <div>
          <label htmlFor="admin-email" className="mb-2 block text-[13.5px] font-medium text-[#1a2b57]">
            {t("Admin email")}
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute start-4 top-1/2 size-[18px] -translate-y-1/2 text-[#5b6b7c]" />
            <input
              id="admin-email"
              type="email"
              dir="ltr"
              autoComplete="username"
              placeholder="admin@juniorhub.com"
              aria-invalid={!!errors.email}
              className={`${INPUT} pe-4 rtl:text-end ${fieldBorder(!!errors.email)}`}
              {...register("email")}
            />
          </div>
          {errors.email?.message && <p className="mt-1.5 text-[12.5px] text-[#c0392b]">{t(errors.email.message)}</p>}
        </div>

        <div>
          <label htmlFor="admin-password" className="mb-2 block text-[13.5px] font-medium text-[#1a2b57]">
            {t("Password")}
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute start-4 top-1/2 size-[18px] -translate-y-1/2 text-[#5b6b7c]" />
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder={t("Enter your password")}
              aria-invalid={!!errors.password}
              className={`${INPUT} pe-12 ${fieldBorder(!!errors.password)}`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={t(showPassword ? "Hide password" : "Show password")}
              className="absolute end-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-[#5b6b7c] hover:bg-[#eef2f6]"
            >
              {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
            </button>
          </div>
          {errors.password?.message && <p className="mt-1.5 text-[12.5px] text-[#c0392b]">{t(errors.password.message)}</p>}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px] text-[#5b6b7c]">
            <input type="checkbox" className="size-[18px] rounded accent-[#12808a]" {...register("rememberMe")} />
            {t("Remember me")}
          </label>
          <button
            type="button"
            onClick={() => setForgotOpen((v) => !v)}
            aria-expanded={forgotOpen}
            className="text-[13.5px] font-semibold text-[#12808a] hover:underline"
          >
            {t("Forgot password?")}
          </button>
        </div>

        {forgotOpen && <ForgotPasswordPanel initialEmail={getValues("email")} onClose={() => setForgotOpen(false)} />}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#12808a] to-[#1a2b57] text-[15.5px] font-semibold text-white shadow-[0_10px_24px_rgba(26,43,87,0.25)] transition hover:brightness-110 disabled:opacity-60 rtl:bg-gradient-to-l"
        >
          {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
          {t("Sign in")}
        </button>
      </form>

      <p className="mt-5 flex items-start gap-3 rounded-[12px] bg-[#edf6f6] px-4 py-3.5 text-[12.5px] leading-relaxed text-[#3d4a5c]">
        <Lock className="mt-1 size-[18px] shrink-0 text-[#12808a]" />
        {t("This login is separate from the student and mentor portals. Only authorized admins can sign in.")}
      </p>
    </div>
  );
}
