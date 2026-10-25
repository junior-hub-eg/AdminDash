import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AuthButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      className={cn(
        "h-[clamp(44px,5.4cqw,52px)] w-full rounded-xl bg-linear-to-r from-[#14757d] to-[#1b2a5c] text-[length:clamp(13px,1.6cqw,15px)] font-semibold text-white hover:opacity-90",
        className
      )}
      {...props}
    />
  );
}
