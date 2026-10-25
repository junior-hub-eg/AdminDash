import type { Metadata } from "next";
import { Cairo, Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth/auth-context";
import { LanguageProvider } from "@/lib/i18n/client";
import { dirOf } from "@/lib/i18n/config";
import { getLocale, getT } from "@/lib/i18n/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** The Arabic font; globals.css switches the whole page to it when the language is Arabic. */
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("Junior Hub"),
    description: t("Discover your interests, learn tech skills, and build your future with Junior Hub."),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      dir={dirOf(locale)}
      className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider initialLocale={locale}>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
