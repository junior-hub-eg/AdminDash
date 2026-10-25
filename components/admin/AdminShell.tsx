"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";

import {
  Bell,
  ChevronDown,
  ClipboardList,
  ShieldCheck,
  Settings,
  LayoutGrid,
  LoaderCircle,
  TrendingUp,
  LogOut,
  Menu,
  Search,
  Users,
  Shield,
  History,
  ClipboardCheck,
  Award,
  KeyRound,
  Languages,
  GraduationCap,
  Terminal,
  Presentation,
  Folder,
  Clock,
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

/**
 * Same order as the new Figma sidebar. Two items the design shows (User Profile, Rewards)
 * are left out because there is no page for them yet.
 * Assignments, Assessment Builder and Activity Log are not in the design but their pages exist.
 */
const NAV_GROUPS = [
  [
    { href: "/admin/dashboard", label: tk("Dashboard"), icon: LayoutGrid },
    { href: "/admin/students", label: tk("Student Management"), icon: GraduationCap },
    { href: "/admin/squads", label: tk("Squad Management"), icon: Users },
  ],
  [
    { href: "/admin/mentors", label: tk("Mentors Management"), icon: Terminal },
    { href: "/admin/tracks", label: tk("Track Management"), icon: Presentation },
    { href: "/admin/grammar", label: tk("Grammar Coach"), icon: Languages },
    { href: "/admin/notifications", label: tk("Notifications"), icon: Bell },
    { href: "/admin/roles", label: tk("Roles & Permissions"), icon: Shield },
    { href: "/admin/projects", label: tk("Projects"), icon: Folder },
    { href: "/admin/assignments", label: tk("Assignments & Submissions"), icon: ClipboardList },
    { href: "/admin/certificates", label: tk("Certificates"), icon: Award },
    { href: "/admin/assessment-builder", label: tk("Assessment Builder"), icon: ClipboardCheck },
    { href: "/admin/reports", label: tk("Analytics"), icon: TrendingUp },
    { href: "/admin/activity-log", label: tk("Activity Log"), icon: History },
    { href: "/admin/approvals", label: tk("Pending Requests"), icon: Clock },
    { href: "/admin/security", label: tk("Security"), icon: KeyRound },
    { href: "/admin/settings", label: tk("Settings"), icon: Settings },
  ],
];

const OWNER_NAV = { href: "/admin/admins", label: tk("Admins"), icon: ShieldCheck };

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

  const navGroups = user?.isOwner
    ? [NAV_GROUPS[0], [...NAV_GROUPS[1], OWNER_NAV]]
    : NAV_GROUPS;

  // The drawer on mobile always shows labels; on desktop it depends on `expanded`.
  const showLabels = isDesktop ? expanded : true;

  const toggleSidebar = () =>
    isDesktop ? setExpanded((v) => !v) : setMobileOpen((v) => !v);

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
        className={`fixed bottom-2 start-2 top-2 z-50 flex w-[15rem] max-w-[calc(100vw-1rem)] shrink-0 flex-col overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_14px_40px_rgba(20,120,180,0.22)] transition-[transform,width] duration-200 lg:relative lg:z-auto lg:max-w-none lg:translate-x-0 lg:rtl:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)] rtl:translate-x-[calc(100%+1rem)]"
        } ${expanded ? "lg:w-[15rem]" : "lg:w-[4.5rem]"}`}
      >
        {/* Frosted glass: light blue gradient with a soft glow on top */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#bdebfb] via-[#a9e3f8] to-[#8fd4f4]"
        />

        <span
          aria-hidden
          className="pointer-events-none absolute -start-16 -top-24 size-64 rounded-full bg-white/35 blur-2xl"
        />

        {/* Waves at the bottom */}
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -start-12 size-64 rounded-full bg-[#c3dcfb]/80"
        />

        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-28 start-8 size-72 rounded-full bg-[#74c9f2]/75"
        />

        {/* Logo */}
        <div className={`relative z-10 flex h-[4.5rem] shrink-0 items-center gap-2.5 ${showLabels ? "px-5" : "justify-center"}`}>
          <Image
            src={CAP_IMG}
            alt=""
            width={30}
            height={30}
            className="size-[1.9rem] shrink-0 object-contain"
          />

          {showLabels && (
            <span className="text-[1.15rem] font-extrabold tracking-tight text-[#14365a]">
              JUNIOR HUB
            </span>
          )}
        </div>

        {/* Nav */}
        <nav
          aria-label={t("Admin")}
          className="relative z-10 flex-1 overflow-y-auto px-2.5 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {gi > 0 && (
                <hr className="mx-2 my-3 border-0 border-t border-[#14365a]/15" />
              )}

              <ul className="space-y-1">
                {group.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href as Route}
                        title={t(item.label)}
                        aria-current={active ? "page" : undefined}
                        className={`relative flex items-center gap-3 rounded-[0.7rem] py-2.5 text-[0.78rem] transition-colors ${
                          showLabels ? "px-3.5" : "justify-center px-0"
                        } ${
                          active
                            ? "bg-gradient-to-r from-[#3fc9ee] to-[#86e8d4] font-semibold text-[#0b2a4a] shadow-[0_6px_16px_rgba(34,190,240,0.35)] rtl:bg-gradient-to-l"
                            : "font-medium text-[#14365a] hover:bg-white/50"
                        }`}
                      >
                        <item.icon className="size-[1.15rem] shrink-0" strokeWidth={1.8} />

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
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom logo */}
        {showLabels && (
          <div className="relative z-10 shrink-0 px-5 pb-5 pt-2 text-center">
            <div className="flex items-center justify-center gap-2.5">
              <Image src={CAP_IMG} alt="" width={26} height={26} className="size-[1.6rem] shrink-0 object-contain" />

              <span className="text-[1.05rem] font-extrabold tracking-tight text-[#14365a]">JUNIOR HUB</span>
            </div>

            <p className="mt-0.5 text-[0.62rem] font-medium uppercase tracking-[0.18em] text-[#14365a]/80">
              {t("Build your dreams")}
            </p>
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
            className="pointer-events-auto grid size-[2.5em] shrink-0 place-items-center rounded-full bg-[#14365a] text-white shadow-md hover:bg-[#0f2a47]"
          >
            <Menu className="size-[1.2em]" />
          </button>

          <label className="pointer-events-auto relative min-w-0 max-w-[32em] flex-1">
            <Search className="pointer-events-none absolute start-[1em] top-1/2 size-[1.1em] -translate-y-1/2 text-[#14365a]/70" />

            <input
              ref={searchRef}
              type="search"
              placeholder={t("Search anything....")}
              className="h-[2.6em] w-full rounded-full border border-white/80 bg-[#d7f2fb]/80 ps-[2.8em] pe-[1em] text-[0.8em] text-[#14365a] shadow-[0_8px_24px_rgba(34,190,240,0.35)] outline-none backdrop-blur placeholder:text-[#14365a]/70 focus:ring-2 focus:ring-[#06b6d4]/50 sm:pe-[4em]"
            />

            <kbd className="pointer-events-none absolute end-[0.9em] top-1/2 hidden -translate-y-1/2 rounded-full bg-[#06b6d4] px-[0.7em] py-[0.15em] text-[0.65em] font-bold text-white sm:block">
              ⌘K
            </kbd>
          </label>

          {/* Language switch */}
          <button
            type="button"
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            aria-label={t("Change language")}
            className="pointer-events-auto flex h-[2.4em] items-center gap-[0.5em] rounded-full border border-white/80 bg-white/70 px-[1.1em] text-[0.8em] font-semibold text-[#14365a] shadow-[0_6px_18px_rgba(60,160,230,0.2)] backdrop-blur"
          >
            {locale === "ar" ? "EN" : "AR"} <ChevronDown className="size-[1em]" />
          </button>

          <div className="ms-auto flex items-center gap-[0.7em]">
            <Link
              href={"/admin/notifications" as Route}
              aria-label={t("Notifications")}
              className="pointer-events-auto relative grid size-[2.4em] place-items-center rounded-full border border-white/80 bg-white/70 text-[#14365a] shadow-[0_6px_18px_rgba(60,160,230,0.2)] backdrop-blur hover:bg-white"
            >
              <Bell className="size-[1.1em]" />
              {unseen > 0 && <span className="absolute end-[0.55em] top-[0.55em] size-[0.55em] rounded-full bg-[#e0245e]" aria-label={t("{n} unread notifications", { n: unseen })} />}
            </Link>

            <div className="pointer-events-auto relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex h-[2.6em] items-center gap-[0.6em] rounded-full border border-white/80 bg-white/70 ps-[0.2em] pe-[0.9em] text-[0.8em] font-semibold text-[#14365a] shadow-[0_6px_18px_rgba(60,160,230,0.2)] backdrop-blur hover:bg-white"
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

                <ChevronDown className="size-[1em]" />
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
                    className="absolute end-0 top-full z-50 mt-2 min-w-[11em] overflow-hidden rounded-[0.9em] border border-[#e1e8f0] bg-white shadow-lg"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-[0.6em] px-[1.1em] py-[0.7em] text-start text-[0.85em] font-semibold text-[#14365a] hover:bg-[#eef4fa]"
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