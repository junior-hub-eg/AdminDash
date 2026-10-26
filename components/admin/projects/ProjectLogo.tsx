/** The project's logo, or its first letter on a tinted tile when it has none. */
export function ProjectLogo({ src, title, className = "" }: { src: string | null; title: string; className?: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element -- a data URL or any link the admin gave
    <img src={src} alt="" className={`shrink-0 rounded-[0.8em] bg-white object-cover ring-1 ring-[#dfe7f1] ${className}`} />
  ) : (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-[0.8em] bg-[linear-gradient(135deg,#d6e9fb,#cdeef0)] font-extrabold text-[#0b6f86] ${className}`}
    >
      {title.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
