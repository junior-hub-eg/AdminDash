"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { BadgeCheck, ClipboardCheck, Layers, Medal, PenTool, Plus } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";
import { AdminDialog, FIELD } from "./AdminPageFrame";
import CertificateFilters, { type CertTab } from "./certificates/CertificateFilters";
import CertificatePreview from "./certificates/CertificatePreview";
import CertificatesTable from "./certificates/CertificatesTable";
import VerificationGateway from "./certificates/VerificationGateway";
import {
  MOCK_CERTIFICATES,
  MOCK_CERT_COHORTS,
  MOCK_CERT_STATS,
  MOCK_CERT_TRACKS,
  type MockCertificate,
} from "./dashboardMock";
import { AdminSurface } from "./page-parts";

const PAGE_SIZE = 5;

/** Small local stat card. TODO: swap for the shared StatGrid / StatCard if their props fit. */
function Stat({
  label,
  icon,
  children,
  hint,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  hint: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-[#14365a]/60">{label}</p>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e8f2f8] text-[#12676b]">{icon}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">{children}</div>
      <p className="mt-2 text-[0.72rem] text-[#14365a]/60">{hint}</p>
    </div>
  );
}

const BIG = "text-[1.9rem] font-extrabold leading-none text-[#0d2a45]";

export default function CertificatesPage() {
  const { t } = useI18n();

  // TODO(api): replace with list / issue / approve calls. Local state keeps the page working until then.
  const [rows, setRows] = useState<MockCertificate[]>(MOCK_CERTIFICATES);

  const [tab, setTab] = useState<CertTab>("all");
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState("all");
  const [cohort, setCohort] = useState<string>(MOCK_CERT_COHORTS[0]);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_CERTIFICATES[0]?.id ?? null);

  // Issue dialog
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [issueTrack, setIssueTrack] = useState<string>(MOCK_CERT_TRACKS[0]);
  const [capstone, setCapstone] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState(false);

  // Everything except the tab: the tab counts are computed on this.
  const base = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows.filter(
      (r) =>
        (track === "all" || r.track === track) &&
        (cohort === "all" || r.cohort === cohort) &&
        (!q || [r.student, r.studentCode, r.credentialId, r.title].some((v) => v.toLowerCase().includes(q))),
    );
  }, [rows, query, track, cohort]);

  const counts = useMemo<Record<CertTab, number>>(
    () => ({
      all: base.length,
      pending: base.filter((r) => r.status === "pending").length,
      issued: base.filter((r) => r.status === "issued").length,
      revoked: base.filter((r) => r.status === "revoked").length,
    }),
    [base],
  );

  const filtered = useMemo(() => (tab === "all" ? base : base.filter((r) => r.status === tab)), [base, tab]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const selected = rows.find((r) => r.id === selectedId) ?? filtered[0] ?? null;

  const resetFilters = () => {
    setTab("all");
    setQuery("");
    setTrack("all");
    setCohort(MOCK_CERT_COHORTS[0]);
    setPage(1);
  };

  const openDialog = () => {
    setName("");
    setIssueTrack(MOCK_CERT_TRACKS[0]);
    setCapstone("");
    setDate(new Date().toISOString().slice(0, 10));
    setError(false);
    setOpen(true);
  };

  const issue = (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !date) {
      setError(true);

      return;
    }

    const num =
      Math.max(0, ...rows.map((r) => Number(r.credentialId.replace(/\D/g, "")) || 0)) + 1;
    const created: MockCertificate = {
      id: `c${Date.now()}`,
      student: name.trim(),
      studentCode: `CAP-${date.slice(0, 4)}-${String(num % 1000).padStart(3, "0")}`,
      title: capstone.trim() || `${issueTrack} Capstone`,
      track: issueTrack,
      cohort: MOCK_CERT_COHORTS[0],
      date,
      credentialId: `JH-CERT-${num}`,
      // New certificates wait for admin & mentor sign-off ("Approve & Sign").
      status: "pending",
    };

    setRows((prev) => [created, ...prev]);
    // Make sure the new row is visible and selected.
    setTab("all");
    setQuery("");
    setTrack("all");
    setCohort(created.cohort);
    setPage(1);
    setSelectedId(created.id);
    setOpen(false);
  };

  const approve = (id: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "issued" } : r)));

  const S = MOCK_CERT_STATS;

  return (
    // AdminSurface gives the page its padding, top-bar offset and scrolling (same as AdminPageHero).
    <AdminSurface>
      <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-[#14365a]/55">
            {t("Admin")} / {t("Console")} / <span className="text-[#12676b]">{t("Certificates")}</span>
          </p>
          <h1 className="mt-1 text-[1.9rem] font-extrabold leading-tight text-[#0d2a45]">
            {t("Certificates & Credentialing")}
          </h1>
          <p className="mt-1 max-w-md text-[0.85rem] text-[#14365a]/70">
            {t("Issue, design, and verify accredited blockchain-backed capstone and track completion certificates.")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* TODO(api): Template Designer screen does not exist yet. */}
          <button
            type="button"
            disabled
            title={t("Coming soon")}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[0.78rem] font-semibold text-[#14365a] shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PenTool className="size-4 text-[#12676b]" /> {t("Template Designer")}
          </button>

          <button
            type="button"
            onClick={openDialog}
            className="flex items-center gap-2 rounded-xl bg-[#06b6d4] px-4 py-2.5 text-[0.78rem] font-semibold text-white shadow-sm hover:bg-[#0597b1]"
          >
            <Plus className="size-4" /> {t("Issue New Certificate")}
          </button>
        </div>
      </header>

      {/* TODO(api): these 4 numbers come from MOCK_CERT_STATS. */}
      <section aria-label={t("Certificate statistics")} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("Total Issued")} icon={<Medal className="size-4" />} hint={S.totalIssued.hint}>
          <span className={BIG}>{S.totalIssued.value.toLocaleString("en")}</span>
          <span className="rounded-full bg-[#e3f6fb] px-2 py-0.5 text-[0.68rem] font-bold text-[#0a7f99]">
            {S.totalIssued.delta}
          </span>
        </Stat>

        <Stat label={t("Pending Approval")} icon={<ClipboardCheck className="size-4" />} hint={S.pending.hint}>
          <span className={BIG}>{S.pending.value}</span>
          <span className="rounded-md bg-[#ffe6e6] px-2 py-0.5 text-[0.68rem] font-semibold text-[#b42a2a]">
            {S.pending.badge}
          </span>
        </Stat>

        <Stat label={t("Active Templates")} icon={<Layers className="size-4" />} hint={S.templates.hint}>
          <span className={BIG}>{String(S.templates.value).padStart(2, "0")}</span>
          <span className="text-[0.72rem] text-[#14365a]/60">
            {t("Across")} {S.templates.tracks} {t("Tracks")}
          </span>
        </Stat>

        <Stat label={t("Verification Queries")} icon={<BadgeCheck className="size-4" />} hint={S.queries.hint}>
          <span className={BIG}>{S.queries.value.toLocaleString("en")}</span>
          <span className="rounded-full bg-[#e3eaf8] px-2 py-0.5 text-[0.68rem] font-bold text-[#14365a]">
            {S.queries.validRate} {t("valid")}
          </span>
        </Stat>
      </section>

      <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="min-w-0 space-y-3">
          <CertificateFilters
            tab={tab}
            onTab={(v) => {
              setTab(v);
              setPage(1);
            }}
            counts={counts}
            query={query}
            onQuery={(v) => {
              setQuery(v);
              setPage(1);
            }}
            track={track}
            onTrack={(v) => {
              setTrack(v);
              setPage(1);
            }}
            tracks={MOCK_CERT_TRACKS}
            cohort={cohort}
            onCohort={(v) => {
              setCohort(v);
              setPage(1);
            }}
            cohorts={MOCK_CERT_COHORTS}
            onReset={resetFilters}
          />

          <CertificatesTable
            rows={pageRows}
            total={filtered.length}
            page={safePage}
            pageSize={PAGE_SIZE}
            onPage={(p) => setPage(Math.min(Math.max(1, p), pageCount))}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
          />
        </div>

        <div className="min-w-0 space-y-5">
          <CertificatePreview cert={selected} onApprove={approve} />
          <VerificationGateway certs={rows} initialId={MOCK_CERTIFICATES[0]?.credentialId} />
        </div>
      </div>

      <AdminDialog open={open} title="Issue New Certificate" onClose={() => setOpen(false)}>
        <form onSubmit={issue} className="space-y-3 text-sm">
          <label className="block">
            <span className="mb-1 block text-[0.72rem] font-medium">{t("Student name")}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={FIELD} />
          </label>

          <label className="block">
            <span className="mb-1 block text-[0.72rem] font-medium">{t("Track Completed")}</span>
            <select value={issueTrack} onChange={(e) => setIssueTrack(e.target.value)} className={FIELD}>
              {MOCK_CERT_TRACKS.map((x) => (
                <option key={x} value={x}>
                  {t(x)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-[0.72rem] font-medium">{t("Capstone title (optional)")}</span>
            <input value={capstone} onChange={(e) => setCapstone(e.target.value)} className={FIELD} />
          </label>

          <label className="block">
            <span className="mb-1 block text-[0.72rem] font-medium">{t("Completion Date")}</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={FIELD} />
          </label>

          {error && (
            <p role="alert" className="text-[0.75rem] font-medium text-[#e0245e]">
              {t("Please fill in all fields.")}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-[#cfe0ee] px-4 py-2 text-[0.75rem] font-semibold hover:bg-[#eef4fa]"
            >
              {t("Cancel")}
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#06b6d4] px-4 py-2 text-[0.75rem] font-semibold text-white hover:bg-[#0597b1]"
            >
              {t("Issue Certificate")}
            </button>
          </div>
        </form>
      </AdminDialog>
      </div>
    </AdminSurface>
  );
}