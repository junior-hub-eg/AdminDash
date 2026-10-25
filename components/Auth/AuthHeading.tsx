"use client";

import type { ReactNode } from "react";
import { authStyles } from "./auth-styles";

interface AuthHeadingProps {
  title: string;
  subtitle?: ReactNode;
}

export function AuthHeading({ title, subtitle }: AuthHeadingProps) {
  return (
    <div>
      <h1 className={authStyles.title}>{title}</h1>
      {subtitle && <p className={authStyles.subtitle}>{subtitle}</p>}
    </div>
  );
}
