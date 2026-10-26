"use client";

import Image from "next/image";
import { Globe, LogOut, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n } from "@/lib/i18n/client";
import { AdminSurface, PageHeader, PANEL } from "../page-parts";

const AVATAR = "/images/Intern/char-boy-glasses.png";

const LANGS = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
] as const;

/** The signed-in admin's own card: name, email, role, language and log out. No design PNG, so it follows the admin style. */
export default function AdminProfile() {
  const { user, logout } = useAuth();
  const { t, locale, setLocale } = useI18n();

  const name = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : t("Admin");
  const avatar = (user as { avatarUrl?: string } | null)?.avatarUrl || AVATAR;

  return (
    <AdminSurface>
      <PageHeader eyebrow={t("Account")} title={t("User Profile")} description={t("Your admin account and preferences.")} />

      <div className="grid gap-[1.2em] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className={`${PANEL} p-[1.4em]`}>
          <div className="flex flex-wrap items-center gap-[1em]">
            <span className="relative size-[4.5em] shrink-0 overflow-hidden rounded-full bg-[#ffb52e] ring-4 ring-[#dff3fb]">
              <Image src={avatar} alt="" fill sizes="72px" className="origin-top scale-[1.35] object-cover object-top" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-[1.3em] font-bold text-[#0b1b2b]">{name}</h2>
              <span className="mt-[0.3em] inline-flex items-center gap-[0.4em] rounded-full bg-[#1a2b57] px-[0.8em] py-[0.2em] text-[0.72em] font-medium text-white">
                <ShieldCheck className="size-[1.1em]" />
                {user?.isOwner ? t("Main admin") : t("Admin")}
              </span>
            </div>
          </div>

          <dl className="mt-[1.4em] space-y-[0.8em] text-[0.85em]">
            <div className="flex items-center gap-[0.8em] rounded-[0.8em] bg-[#f4f7fb] px-[1em] py-[0.8em]">
              <Mail className="size-[1.2em] shrink-0 text-[#12939b]" />
              <dt className="sr-only">{t("Email")}</dt>
              <dd dir="ltr" className="min-w-0 truncate font-medium text-[#14365a] rtl:text-end">
                {user?.email ?? "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className={`${PANEL} flex flex-col gap-[1.2em] p-[1.4em]`}>
          <div>
            <h2 className="flex items-center gap-[0.5em] text-[1.05em] font-bold text-[#14365a]">
              <Globe className="size-[1.1em] text-[#12939b]" />
              {t("Language")}
            </h2>
            <p className="mt-[0.2em] text-[0.8em] text-[#8a97a6]">{t("Choose the language of the admin portal.")}</p>
            <div role="radiogroup" aria-label={t("Language")} className="mt-[0.9em] inline-flex rounded-full bg-[#eef3fa] p-[0.25em]">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  role="radio"
                  aria-checked={locale === l.code}
                  onClick={() => locale !== l.code && setLocale(l.code)}
                  lang={l.code}
                  className={`rounded-full px-[1.2em] py-[0.45em] text-[0.85em] font-semibold transition ${
                    locale === l.code ? "bg-white text-[#0e7c86] shadow-sm" : "text-[#5b6b7c] hover:text-[#14365a]"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto border-t border-[#eef2f6] pt-[1.2em]">
            <button type="button" onClick={logout} className="inline-flex items-center justify-center gap-[0.5em] rounded-[0.7em] border border-[#f3d2d2] bg-white px-[1.1em] py-[0.65em] text-[0.85em] font-semibold text-[#c0392b] hover:bg-[#fdf0f0]">
              <LogOut className="size-[1.1em]" />
              {t("Log out")}
            </button>
          </div>
        </section>
      </div>
    </AdminSurface>
  );
}
