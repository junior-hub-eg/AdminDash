"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { AuthField, type AuthFieldProps } from "./AuthField";
import { useT } from "@/lib/i18n/client";

type PasswordFieldProps = Omit<AuthFieldProps, "icon" | "type" | "trailing">;

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>((props, ref) => {
  const t = useT();
  const [visible, setVisible] = useState(false);
  const EyeIcon = visible ? EyeOff : Eye;

  return (
    <AuthField
      ref={ref}
      icon={Lock}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t("Hide password") : t("Show password")}
          className="shrink-0 text-[#1b2a5c] transition-opacity hover:opacity-70"
        >
          <EyeIcon aria-hidden className="size-[clamp(14px,1.8cqw,18px)]" strokeWidth={1.8} />
        </button>
      }
      {...props}
    />
  );
});
PasswordField.displayName = "PasswordField";
