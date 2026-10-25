"use client";

import { useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ShieldCheck } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { AuthButton } from "@/components/Auth/AuthButton";
import { AuthField } from "@/components/Auth/AuthField";
import { AuthHeading } from "@/components/Auth/AuthHeading";
import { PasswordField } from "@/components/Auth/PasswordField";
import { authStyles } from "@/components/Auth/auth-styles";
import { useAuth } from "@/lib/auth/auth-context";
import { ROLE_HOME } from "@/lib/constants";
import { ApiError, errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

const schema = z.object({
  email: z.string().min(1, tk("Email is required")).email(tk("Invalid email address")),
  password: z.string().min(1, tk("Password is required")),
  rememberMe: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

/** Sign-in for the admin only. Students and mentors are refused by the backend (NOT_AN_ADMIN) and pointed to /login. */
/** The students' and mentors' site (NEXT_PUBLIC_MAIN_SITE_URL); the link to it is hidden when it is not set. */
const MAIN_SITE_URL = process.env.NEXT_PUBLIC_MAIN_SITE_URL?.replace(/\/$/, "") ?? "";

export function AdminLoginForm() {
  const t = useT();
  const { adminLogin } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
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

  return (
    <>
      <p className="mx-auto mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#14365a] px-3 py-1 text-xs font-semibold text-white">
        <ShieldCheck className="size-3.5" /> {t("Admin")}
      </p>
      <AuthHeading title={t("Admin sign in")} subtitle={t("Sign in to manage students, squads, mentors and tracks")} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className={authStyles.form}>
        {error && <Alert variant="danger">{error}</Alert>}

        <AuthField
          label={t("Email")}
          icon={Mail}
          type="email"
          autoComplete="username"
          placeholder="admin@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          label={t("Password")}
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <label className={`flex cursor-pointer items-center gap-2 ${authStyles.smallText}`}>
          <input type="checkbox" className="size-3.5 accent-[#12939b]" {...register("rememberMe")} />
          {t("Remember me")}
        </label>

        <AuthButton type="submit" disabled={isSubmitting}>
          {t("Sign in")}
        </AuthButton>
      </form>

      {MAIN_SITE_URL && (
        <p className={`mt-4 text-center ${authStyles.smallText}`}>
          {t("Student or mentor?")}{" "}
          <a href={`${MAIN_SITE_URL}/login`} className={authStyles.link}>
            {t("Sign in here")}
          </a>
        </p>
      )}
    </>
  );
}
