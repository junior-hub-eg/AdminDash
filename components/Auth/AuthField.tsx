"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";

export interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
  error?: string;
  trailing?: ReactNode;
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ label, icon: Icon, error, trailing, id, className, ...props }, ref) => {
    const t = useT();
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div>
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border bg-white px-[clamp(12px,1.8cqw,18px)] py-[clamp(7px,1cqw,10px)] transition-colors",
            "border-[#dfe7e5] focus-within:border-[#12939b] focus-within:ring-2 focus-within:ring-[#12939b]/20",
            error && "border-danger focus-within:border-danger focus-within:ring-danger/20"
          )}
        >
          <Icon aria-hidden className="size-[clamp(14px,1.8cqw,18px)] shrink-0 text-[#1b2a5c]" strokeWidth={1.8} />
          <div className="flex min-w-0 flex-1 flex-col">
            <label htmlFor={inputId} className="text-[length:clamp(10px,1.2cqw,12px)] font-semibold leading-tight text-[#1b2a5c]">
              {label}
            </label>
            <input
              ref={ref}
              id={inputId}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className={cn(
                "w-full min-w-0 bg-transparent text-[length:clamp(12px,1.45cqw,14px)] text-[#1b2a5c] outline-none placeholder:text-[#1b2a5c]/45",
                className
              )}
              {...props}
            />
          </div>
          {trailing}
        </div>
        {error && (
          <p id={errorId} role="alert" className="mt-1 px-1 text-xs text-danger">
            {t(error)}
          </p>
        )}
      </div>
    );
  }
);
AuthField.displayName = "AuthField";
