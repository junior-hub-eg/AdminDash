import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva("w-full rounded-lg border p-4 text-sm", {
  variants: {
    variant: {
      default: "border-border bg-muted text-foreground",
      danger: "border-danger/30 bg-danger/5 text-danger",
      success: "border-success/30 bg-success/5 text-success",
      warning: "border-warning/30 bg-warning/5 text-warning",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface AlertProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}
