"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, LoaderCircle, Mail, X } from "lucide-react";
import { api, errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";

/** POST /api/v1/auth/password/forgot — the backend answers 202 whether or not the email exists. */
function requestPasswordReset(email: string) {
  return api.post<void>("/api/v1/auth/password/forgot", { email });
}

/** Small inline panel under the sign-in form: asks for the email and sends the reset code. */
export function ForgotPasswordPanel({ initialEmail, onClose }: { initialEmail: string; onClose: () => void }) {
  const t = useT();
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError(t("Invalid email address"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-label={t("Reset your password")}
      className="relative rounded-[14px] border border-[#d9e7ee] bg-[#f4f9fb] p-4"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t("Close")}
        className="absolute end-3 top-3 grid size-7 place-items-center rounded-full text-[#5b6b7c] hover:bg-white"
      >
        <X className="size-4" />
      </button>

      <h2 className="pe-8 text-[15px] font-semibold text-[#1a2b57]">{t("Reset your password")}</h2>

      {sent ? (
        <p role="status" className="mt-2 flex items-start gap-2 text-[13px] leading-relaxed text-[#12676b]">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          {t("If an admin account exists for this email, we sent a reset code to it.")}
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="mt-2 space-y-3">
          <p className="text-[13px] leading-relaxed text-[#6b7686]">
            {t("Enter your admin email and we will send you a code to reset your password.")}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">{t("Admin email")}</span>
              <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[#5b6b7c]" />
              <input
                type="email"
                dir="ltr"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@juniorhub.com"
                className="h-11 w-full rounded-[10px] border border-[#dfe5ec] bg-white ps-9 pe-3 text-[14px] text-[#1a2b57] outline-none placeholder:text-[#9aa5b1] focus:border-[#12939b] focus:ring-2 focus:ring-[#12939b]/20 rtl:text-end"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#1a2b57] px-4 text-[14px] font-semibold text-white hover:bg-[#14223f] disabled:opacity-60"
            >
              {busy && <LoaderCircle className="size-4 animate-spin" />}
              {t("Send reset code")}
            </button>
          </div>
          {error && (
            <p role="alert" className="text-[13px] text-[#c0392b]">
              {error}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
