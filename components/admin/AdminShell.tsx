"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";

import {
  Bell,
  ChartLine,
  ChevronDown,
  Clock,
  FileBadge,
  Folder,
  Gift,
  GraduationCap,
  KeyRound,
  Languages,
  LayoutGrid,
  LoaderCircle,
  LogOut,
  Menu,
  MoreHorizontal,
  Presentation,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  SquareTerminal,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { landingFont } from "@/components/Landing/font";
import { APPROVALS_CHANGED, getApprovals, getMentorRequests, getTrackRequests } from "@/lib/admin-api";
import { getUnreadNotificationCount } from "@/lib/notifications-api";
import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === "true" && process.env.NODE_ENV !== "production";

const CAP_IMG = "/images/admin/reicon_grad-cap-filled.png";
const AVATAR = "/images/Intern/char-boy-glasses.png";

/** How the picture sits inside the round avatar. Change these four numbers only. */
const AVATAR_FIT = {
  scale: 1.35, // zoom: higher = the face gets bigger
  originY: 0, // % from the top the zoom grows from (0 = top of the picture)
  posX: 50, // % left/right shift of the picture
  posY: 0, // % up/down shift of the picture (0 = shows the top of the cap)
};

type NavItem = { href: string; label: string; icon: LucideIcon };

/** Same order, labels and icons as the Figma sidebar (Frame 2147225918). */
const NAV_GROUPS: NavItem[][] = [
  [
    { href: "/admin/dashboard", label: tk("Dashboard"), icon: LayoutGrid },
    { href: "/admin/students", label: tk("Student Management"), icon: GraduationCap },
    { href: "/admin/squads", label: tk("Squad Management"), icon: Users },
  ],
  [
    { href: "/admin/mentors", label: tk("Mentors Management"), icon: SquareTerminal },
    { href: "/admin/tracks", label: tk("Track Management"), icon: Presentation },
    { href: "/admin/notifications", label: tk("Notifications"), icon: Bell },
    { href: "/admin/roles", label: tk("Roles & Permissions"), icon: Shield },
    { href: "/admin/projects", label: tk("Projects"), icon: Folder },
    { href: "/admin/certificates", label: tk("Certificates"), icon: FileBadge },
    { href: "/admin/reports", label: tk("Analytics"), icon: ChartLine },
    { href: "/admin/approvals", label: tk("Pending Requests"), icon: Clock },
    { href: "/admin/profile", label: tk("User Profile"), icon: UserRound },
    { href: "/admin/rewards", label: tk("Rewards"), icon: Gift },
    { href: "/admin/security", label: tk("Security"), icon: KeyRound },
    { href: "/admin/settings", label: tk("Settings"), icon: Settings },
  ],
];

/** Pages that exist but are not in the design: kept reachable under "More". */
const MORE_NAV: NavItem[] = [
  { href: "/admin/grammar", label: tk("Grammar Coach"), icon: Languages },
];

const OWNER_NAV: NavItem = { href: "/admin/admins", label: tk("Admins"), icon: ShieldCheck };

const LOCALES = [
  { code: "en", short: "EN", name: "English" },
  { code: "ar", short: "AR", name: "العربية" },
] as const;

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

const vars = {
  "--u": "clamp(10px, 0.9vw, 16px)",
  "--hl": "calc(var(--u) * 1.6)",
} as CSSProperties;

const baseFont = { fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" } as CSSProperties;

const noopSubscribe = () => () => {};

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t, locale, setLocale } = useI18n();

  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [waiting, setWaiting] = useState(0);
  const [unseen, setUnseen] = useState(0);

  const searchRef = useRef<HTMLInputElement>(null);

  // Track the lg breakpoint (1024px)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);

    update();
    mq.addEventListener("change", update);

    return () => mq.removeEventListener("change", update);
  }, []);

  // Close the drawer when the page changes or the screen grows to desktop (adjusted while rendering, not in an effect).
  const drawerKey = `${pathname}|${isDesktop}`;
  const [lastDrawerKey, setLastDrawerKey] = useState(drawerKey);
  if (drawerKey !== lastDrawerKey) {
    setLastDrawerKey(drawerKey);
    setMobileOpen(false);
  }

  // Count the requests waiting for the admin (sign-ups, mentor changes, new tracks) on every page change.
  useEffect(() => {
    if (user?.role !== "admin") return;

    let active = true;

    const count = () =>
      Promise.all([getApprovals(), getMentorRequests(), getTrackRequests()]).then(
        (lists) => active && setWaiting(lists.reduce((n, l) => n + l.length, 0)),
        () => {},
      );

    void count();
    getUnreadNotificationCount().then(
      (n) => active && setUnseen(n),
      () => {},
    );
    window.addEventListener(APPROVALS_CHANGED, count);

    return () => {
      active = false;
      window.removeEventListener(APPROVALS_CHANGED, count);
    };
  }, [pathname, user?.role]);

  // Esc closes the drawer
  useEffect(() => {
    if (!mobileOpen) return;

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // Ctrl/Cmd + K focuses the search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const allowed = SKIP_AUTH || (!!user && String(user.role) === "admin");

  // The signed-in user is only known after hydration, so redirect only then.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  useEffect(() => {
    if (hydrated && !allowed) router.replace("/admin/login");
  }, [hydrated, allowed, router]);

  if (!allowed) {
    return (
      <div className="grid min-h-svh place-items-center" role="status" aria-label={t("Loading")}>
        <LoaderCircle className="size-8 animate-spin text-[#12939b]" />
      </div>
    );
  }

  const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : t("Admin");

  // The user's own picture if the API sends one, otherwise the cartoon character.
  const avatarSrc = (user as { avatarUrl?: string } | null)?.avatarUrl || AVATAR;

  const moreItems = user?.isOwner ? [...MORE_NAV, OWNER_NAV] : MORE_NAV;
  const moreActive = moreItems.some((item) => isActive(pathname, item.href));
  const showMore = moreOpen || moreActive;

  // The drawer on mobile always shows labels; on desktop it depends on `expanded`.
  const showLabels = isDesktop ? expanded : true;

  const toggleSidebar = () =>
    isDesktop ? setExpanded((v) => !v) : setMobileOpen((v) => !v);

  const currentLocale = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  const renderItem = (item: NavItem, small = false) => {
    const active = isActive(pathname, item.href);

    return (
      <li key={item.href}>
        <Link
          href={item.href as Route}
          title={t(item.label)}
          aria-current={active ? "page" : undefined}
          className={`relative flex items-center gap-3 rounded-[0.75rem] transition-colors ${small ? "py-2 text-[0.74rem]" : "py-[0.6rem] text-[0.8rem]"} ${
            showLabels ? "px-3.5" : "justify-center px-0"
          } ${
            active
              ? showLabels
                ? "bg-gradient-to-r from-[#5ccbf2] to-[#8ae3d2] font-semibold text-[#0b2a4a] shadow-[0_6px_16px_rgba(34,190,240,0.3)] rtl:bg-gradient-to-l"
                : "bg-white/55 text-[#0e7c86]"
              : "font-medium text-[#14365a] hover:bg-white/45"
          }`}
        >
          <item.icon className={`${small ? "size-[1.05rem]" : "size-[1.2rem]"} shrink-0`} strokeWidth={1.7} />

          {showLabels && <span className="truncate">{t(item.label)}</span>}

          {item.href === "/admin/approvals" && waiting > 0 && (
            <span
              aria-label={t("{count} waiting", { count: waiting })}
              className={`grid min-w-[1.3rem] place-items-center rounded-full bg-[#e0245e] px-1 text-[0.65rem] font-bold text-white ${
                showLabels ? "ms-auto" : "absolute end-1 top-1"
              }`}
            >
              {waiting}
            </span>
          )}
        </Link>
      </li>
    );
  };

  /** Shared look of the glass pills in the top bar. */
  const glass =
    "pointer-events-auto border border-white/80 bg-white/75 text-[#14365a] shadow-[0_8px_22px_rgba(60,170,235,0.25)] backdrop-blur hover:bg-white";

  return (
    <div
      className={`${landingFont.variable} flex h-svh gap-2 overflow-hidden bg-[#eef3fb] p-2 font-[family-name:var(--font-poppins)]`}
      style={vars}
    >
      {/* Dark backdrop behind the mobile drawer */}
      {mobileOpen && (
        <button
          type="button"
          aria-label={t("Close sidebar")}
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-[#14365a]/35 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {/* ================= Sidebar ================= */}
      <aside
        aria-label={t("Sidebar")}
        className={`fixed bottom-2 start-2 top-2 z-50 flex w-[16rem] max-w-[calc(100vw-1rem)] shrink-0 flex-col overflow-hidden rounded-[1.4rem] rounded-e-[2.6rem] border border-white/70 shadow-[0_14px_40px_rgba(20,120,180,0.22)] transition-[transform,width] duration-200 lg:relative lg:z-auto lg:max-w-none lg:translate-x-0 lg:rtl:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)] rtl:translate-x-[calc(100%+1rem)]"
        } ${expanded ? "lg:w-[16rem]" : "lg:w-[5rem]"}`}
      >
        {/* Frosted glass: light cyan gradient with a soft glow on top */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#d6f3fd] via-[#b8e9fa] to-[#9adbf6]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -start-16 -top-24 size-64 rounded-full bg-white/40 blur-2xl"
        />

        {/* Logo */}
        <div className={`relative z-10 flex h-[5rem] shrink-0 items-center gap-2.5 ${showLabels ? "px-6" : "justify-center"}`}>
          <Image src={CAP_IMG} alt="" width={36} height={36} className="size-[2.2rem] shrink-0 object-contain" />
          {showLabels && (
            <span className="text-[1.25rem] font-bold tracking-tight text-[#14365a]">JUNIOR HUB</span>
          )}
        </div>

        {/* Nav */}
        <nav
          aria-label={t("Admin")}
          className="relative z-10 min-h-0 flex-1 overflow-y-auto px-3 pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi}>
              {gi > 0 && <hr className="mx-2.5 my-3 border-0 border-t border-[#14365a]/20" />}
              <ul className="space-y-1">{group.map((item) => renderItem(item))}</ul>
            </div>
          ))}

          {/* Pages that are not in the design */}
          <hr className="mx-2.5 my-3 border-0 border-t border-[#14365a]/15" />
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={showMore}
            title={t("More")}
            className={`flex w-full items-center gap-3 rounded-[0.75rem] py-2 text-[0.74rem] font-semibold uppercase tracking-[0.08em] text-[#14365a]/70 hover:bg-white/45 ${
              showLabels ? "px-3.5" : "justify-center px-0"
            }`}
          >
            <MoreHorizontal className="size-[1.05rem] shrink-0" />
            {showLabels && (
              <>
                <span className="flex-1 text-start">{t("More")}</span>
                <ChevronDown className={`size-4 transition-transform ${showMore ? "rotate-180" : ""}`} />
              </>
            )}
          </button>
          {showMore && <ul className="mt-1 space-y-0.5">{moreItems.map((item) => renderItem(item, true))}</ul>}

          {/* Room so the last items can scroll above the waves */}
          {showLabels && <div aria-hidden className="h-[7.5rem]" />}
        </nav>

        {/* Bottom waves + logo */}
        {showLabels && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[9.5rem]">
            <svg viewBox="0 0 256 152" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
              <path d="M0 152 V70 C40 20 80 8 110 40 C140 72 150 152 150 152 Z" fill="#c4e0fb" />
              <path d="M90 152 C120 90 150 20 200 18 C232 16 256 40 256 40 V152 Z" fill="#62c3ee" />
              <path d="M0 152 V118 C60 90 150 70 256 62 V152 Z" fill="#7fd3f5" />
            </svg>
            <div className="absolute inset-x-0 bottom-5 text-center">
              <div className="flex items-center justify-center gap-2.5">
                <Image src={CAP_IMG} alt="" width={30} height={30} className="size-[1.8rem] shrink-0 object-contain" />
                <span className="text-[1.15rem] font-bold tracking-tight text-[#14365a]">JUNIOR HUB</span>
              </div>
              <p className="mt-1 text-[0.82rem] font-medium uppercase tracking-[0.04em] text-[#14365a]">
                {t("Build your dreams")}
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* ================= Main ================= */}
      <main className="relative flex min-w-0 flex-1 flex-col overflow-y-auto rounded-[1.4rem] bg-[#f5f8fe] xl:overflow-hidden">
        {/* ---------- Top bar ---------- */}
        <header
          className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center gap-[0.7em] px-[calc(var(--u)*1.6)] pt-[calc(var(--u)*1.1)]"
          style={baseFont}
        >
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={t(isDesktop ? (expanded ? "Collapse sidebar" : "Expand sidebar") : mobileOpen ? "Close sidebar" : "Open sidebar")}
            aria-expanded={isDesktop ? expanded : mobileOpen}
            className="pointer-events-auto grid size-[2.7em] shrink-0 place-items-center rounded-full bg-[#1a2b57] text-white shadow-[0_8px_18px_rgba(26,43,87,0.35)] hover:bg-[#14223f]"
          >
            <Menu className="size-[1.15em]" />
          </button>

          <label className="pointer-events-auto relative min-w-0 max-w-[34em] flex-1">
            <span className="sr-only">{t("Search anything....")}</span>
            <Search className="pointer-events-none absolute start-[1em] top-1/2 size-[1.1em] -translate-y-1/2 text-[#14365a]/80" />
            <input
              ref={searchRef}
              type="search"
              placeholder={t("Search anything....")}
              className="h-[2.7em] w-full rounded-full border border-white/80 bg-gradient-to-r from-[#d3f1fc]/90 to-[#c4ecfb]/90 ps-[2.8em] pe-[1em] text-[0.85em] text-[#14365a] shadow-[0_10px_26px_rgba(34,190,240,0.35)] outline-none backdrop-blur placeholder:text-[#14365a]/80 focus:ring-2 focus:ring-[#06b6d4]/50 sm:pe-[4.2em] rtl:bg-gradient-to-l"
            />
            <kbd className="pointer-events-none absolute right-[0.6em] rtl:right-auto rtl:left-[0.6em] top-1/2 hidden -translate-y-1/2 rounded-full bg-[#38bdf8] px-[0.75em] py-[0.25em] font-sans text-[0.65em] font-semibold text-white shadow-[0_0_12px_rgba(56,189,248,0.8)] sm:block">
              ⌘K
            </kbd>
          </label>

          {/* Language switch */}
          <div className="pointer-events-auto relative">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={langOpen}
              aria-label={t("Change language")}
              className={`${glass} flex h-[2.7em] items-center gap-[0.6em] rounded-full px-[1em] text-[0.85em] font-semibold`}
            >
              {currentLocale.short} <ChevronDown className="size-[1.1em]" />
            </button>
            {langOpen && (
              <>
                <button type="button" aria-label={t("Close menu")} className="fixed inset-0 z-40 cursor-default" onClick={() => setLangOpen(false)} />
                <div role="menu" className="absolute start-0 top-full z-50 mt-2 min-w-[9em] overflow-hidden rounded-[0.9em] border border-[#e1e8f0] bg-white py-1 shadow-lg">
                  {LOCALES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      role="menuitemradio"
                      aria-checked={l.code === locale}
                      onClick={() => {
                        setLangOpen(false);
                        if (l.code !== locale) setLocale(l.code);
                      }}
                      className={`flex w-full items-center justify-between gap-[1em] px-[1em] py-[0.6em] text-start text-[0.85em] hover:bg-[#eef4fa] ${
                        l.code === locale ? "font-semibold text-[#0e7c86]" : "text-[#14365a]"
                      }`}
                    >
                      <span lang={l.code}>{l.name}</span>
                      <span className="text-[0.8em] text-[#8a97a6]">{l.short}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="ms-auto flex items-center gap-[0.8em]">
            <Link
              href={"/admin/notifications" as Route}
              aria-label={t("Notifications")}
              className={`${glass} relative grid size-[2.7em] place-items-center rounded-full`}
            >
              <Bell className="size-[1.15em]" />
              {unseen > 0 && (
                <span
                  className="absolute end-[0.6em] top-[0.55em] size-[0.5em] rounded-full bg-[#e0245e] ring-2 ring-white"
                  aria-label={t("{n} unread notifications", { n: unseen })}
                />
              )}
            </Link>

            <div className="pointer-events-auto relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className={`${glass} flex h-[2.7em] items-center gap-[0.6em] rounded-full ps-[0.25em] pe-[0.9em] text-[0.85em] font-semibold`}
              >
                {/* Avatar: the head with the cap fills the circle, like the Figma pill */}
                <span className="relative size-[2.2em] shrink-0 overflow-hidden rounded-full bg-[#ffb52e]">
                  <Image
                    src={avatarSrc}
                    alt=""
                    fill
                    sizes="36px"
                    className="object-cover"
                    style={{
                      objectPosition: `${AVATAR_FIT.posX}% ${AVATAR_FIT.posY}%`,
                      transform: `scale(${AVATAR_FIT.scale})`,
                      transformOrigin: `50% ${AVATAR_FIT.originY}%`,
                    }}
                  />
                </span>
                <span className="hidden max-w-[10em] truncate sm:block">{displayName}</span>
                <ChevronDown className="size-[1.1em]" />
              </button>

              {menuOpen && (
                <>
                  <button
                    type="button"
                    aria-label={t("Close menu")}
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div
                    role="menu"
                    className="absolute end-0 top-full z-50 mt-2 min-w-[14em] overflow-hidden rounded-[0.9em] border border-[#e1e8f0] bg-white shadow-lg"
                  >
                    <div className="border-b border-[#eef2f6] px-[1.1em] py-[0.8em]">
                      <p className="truncate text-[0.85em] font-semibold text-[#14365a]">{displayName}</p>
                      {user?.email && (
                        <p dir="ltr" className="truncate text-[0.75em] text-[#8a97a6] rtl:text-end">
                          {user.email}
                        </p>
                      )}
                    </div>
                    <Link
                      href={"/admin/profile" as Route}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-[0.6em] px-[1.1em] py-[0.7em] text-[0.85em] font-semibold text-[#14365a] hover:bg-[#eef4fa]"
                    >
                      <UserRound className="size-[1.1em]" /> {t("Profile")}
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-[0.6em] px-[1.1em] py-[0.7em] text-start text-[0.85em] font-semibold text-[#c0392b] hover:bg-[#fdf0f0]"
                    >
                      <LogOut className="size-[1.1em]" /> {t("Log out")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ---------- Page content ---------- */}
        <div className="relative flex shrink-0 flex-col xl:min-h-0 xl:flex-1 xl:shrink">
          {children}
        </div>
      </main>
    </div>
  );
}
