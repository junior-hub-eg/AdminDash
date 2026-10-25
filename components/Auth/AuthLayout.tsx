"use client";

import Image from "next/image";
import { Poppins } from "next/font/google";
import type { ReactNode } from "react";
import styles from "./AuthLayout.module.css";
import { Curl, CrossMark, HatchedSquare, WaveLoop } from "./AuthDecorations";
import { useI18n } from "@/lib/i18n/client";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

interface AuthLayoutProps {
  /** Page content (login / register form, ...) rendered in the right panel. */
  children?: ReactNode;
}

/**
 * Shared decoration layout for all auth pages.
 * Only decoration lives here — put the form inside `children`.
 *
 * The layout is always LTR so the artwork stays on the left; the form panel
 * follows the page language (right-to-left in Arabic).
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  const { t, dir } = useI18n();
  return (
    <div dir="ltr" className={`${poppins.variable} ${styles.pageWrapper}`}>
      {/* ---------- Outer decorations (around the card) ---------- */}
      <WaveLoop className={`${styles.outer} ${styles.waveTopLeft}`} />
      <Image
        src="/images/Auth/Group-decoration.png"
        alt=""
        width={71}
        height={70}
        className={`${styles.outer} ${styles.halfTop}`}
      />
      <Image
        src="/images/Auth/Vector-decoration.png"
        alt=""
        width={84}
        height={84}
        className={`${styles.outer} ${styles.burstTopRight}`}
      />
      <Image
        src="/images/Auth/Group-decoration.png"
        alt=""
        width={71}
        height={70}
        className={`${styles.outer} ${styles.halfLeft}`}
      />
      <Curl className={`${styles.outer} ${styles.curlRight}`} />
      <Curl className={`${styles.outer} ${styles.curlBottomLeft}`} />
      <Image
        src="/images/Auth/Vector-decoration.png"
        alt=""
        width={84}
        height={84}
        className={`${styles.outer} ${styles.burstBottomRight}`}
      />

      {/* ---------- Main card ---------- */}
      <div className={styles.card}>
        {/* Left: artwork */}
        <div className={styles.visual}>
          <Image
            src="/images/Auth/auth-background.png"
            alt=""
            fill
            priority
            sizes="(max-width: 900px) 0px, 50vw"
            className={styles.background}
          />

          <div className={styles.brand}>
            <Image
              src="/images/Auth/logo.png"
              alt={t("Junior Hub")}
              width={305}
              height={60}
              priority
              className={styles.logo}
            />
            <p className={styles.tagline}>
              {t("Platform built For")}
              <br />
              {t("Your Future")}
            </p>
          </div>

          <Curl className={`${styles.inner} ${styles.curlLeft}`} />

          <Image
            src="/images/Auth/students.png"
            alt={t("Students")}
            width={1062}
            height={832}
            priority
            sizes="(max-width: 900px) 0px, 45vw"
            className={styles.students}
          />
        </div>

        {/* Decorations that sit across the edge between the two halves */}
        <HatchedSquare className={`${styles.inner} ${styles.hatched}`} />
        <CrossMark className={`${styles.inner} ${styles.cross}`} />
        <Curl className={`${styles.inner} ${styles.curlEdge}`} />

        {/* Right: form area */}
        <div className={styles.panel} dir={dir}>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </div>
  );
}
