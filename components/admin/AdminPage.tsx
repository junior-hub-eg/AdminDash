import Image from "next/image";
import type { ReactNode } from "react";

/** Side padding for content that sits under the hero. */
export const bodyPad = "px-0 lg:px-[4%] xl:px-[6%]";

/**
 * < xl : normal flow, the shell scrolls (Quick Management comes at the end)
 * xl+  : scrolls by itself above the pinned Quick Management
 */
export function AdminPage({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative min-w-0 flex-1 bg-[#eef3fa] xl:absolute xl:inset-0 xl:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" }}
    >
      <div className="px-3 pb-2 sm:px-4 lg:px-0 lg:pb-[1.5em]">{children}</div>
    </div>
  );
}

export function PageHero({
  title,
  children,
  contentClassName = "pb-[1.5em]",
  pictureTop = false,
}: {
  title: string;
  children?: ReactNode;
  /** Bottom padding of the hero content (use "pb-0" + negative margin to let cards overlap the hero) */
  contentClassName?: string;
  /** Show the top of the park picture (the sky), so the title stays readable on a short hero. */
  pictureTop?: boolean;
}) {
  return (
    <section className="relative">
      {/* The picture has its own clipped layer so children can overflow the hero */}
      <div aria-hidden className="absolute inset-0 overflow-hidden rounded-[1.2em] lg:rounded-none">
        <Image src="/images/Intern/bg-park.png" alt="" fill priority sizes="100vw" className={`object-cover ${pictureTop ? "object-top" : ""}`} />
      </div>

      <div className={`relative z-10 px-[1.2em] pt-[calc(var(--u)*5.4)] sm:px-[1.6em] lg:px-[9%] ${contentClassName}`}>
        <h1 className="text-[1.9em] font-extrabold leading-none text-[#0f7378] sm:text-[2.2em] xl:text-[2.5em]">
          {title}
        </h1>
        {children}
      </div>
    </section>
  );
}