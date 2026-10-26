import { Fragment, type ReactNode } from "react";

/**
 * The page header of the Figma exports: a small uppercase trail ("ADMIN / CONSOLE / PAGE",
 * the last part in teal), a big title, a short description and the action buttons on the other side.
 * Used by the Notifications, Roles and Certificates screens.
 */
export function ScreenHeader({
  crumbs,
  sep = "/",
  title,
  description,
  actions,
}: {
  crumbs: string[];
  sep?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-[1.5em] gap-y-[1em]">
      <div className="min-w-0 max-w-[40em]">
        <p className="flex flex-wrap items-center gap-x-[0.45em] text-[0.66em] font-bold uppercase tracking-[0.08em] text-[#3d4f61]">
          {crumbs.map((c, i) => (
            <Fragment key={c}>
              {i > 0 && <span aria-hidden>{sep}</span>}
              <span className={i === crumbs.length - 1 ? "text-[#0b6f86]" : ""}>{c}</span>
            </Fragment>
          ))}
        </p>
        <h1 className="mt-[0.3em] text-[1.9em] font-extrabold leading-tight tracking-[-0.01em] text-[#0b1b2b] xl:text-[2.2em]">{title}</h1>
        {description && <p className="mt-[0.4em] max-w-[34em] text-[0.85em] leading-snug text-[#3d4f61]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-[0.6em]">{actions}</div>}
    </header>
  );
}
