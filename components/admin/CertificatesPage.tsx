"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState, type ReactNode } from "react";
import { Ban, CalendarCheck, CirclePlus, ClipboardClock, LoaderCircle, Medal, PenTool, UserSearch } from "lucide-react";

import { getAdminTracks } from "@/lib/admin-api";
import {
  getAdminCertificateStats,
  getAdminCertificates,
  scanCertificates,
  type AdminCertificate,
  type AdminCertificatePage,
} from "@/lib/admin-certificates-api";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { LoadState, useAdminData } from "./admin-data";
import CertificateFilters, { TAB_STATUS, type CertificateFilterValues, type CertificateTab } from "./certificates/CertificateFilters";
import CertificatePreview from "./certificates/CertificatePreview";
import CertificatesTable from "./certificates/CertificatesTable";
import IssueCertificateDialog from "./certificates/IssueCertificateDialog";
import VerificationGateway from "./certificates/VerificationGateway";
import { ScreenHeader } from "./notifications/ScreenHeader";
import { AdminSurface, BTN_PRIMARY, PANEL } from "./page-parts";

const PAGE_SIZE = 10;

/** The design's stat card: uppercase label, round icon, big value, a short line under it. */
function Stat({ label, icon, value, hint }: { label: string; icon: ReactNode; value: ReactNode; hint: string }) {
  return (
    <li className={`${PANEL} relative flex min-h-[8.5em] flex-col overflow-hidden p-[1.2em]`}>
      <span aria-hidden className="pointer-events-none absolute -bottom-[3em] -end-[2em] size-[8em] rounded-full bg-[#dff3fb] opacity-60 blur-[1em]" />
      <div className="relative flex items-start justify-between gap-[0.6em]">
        <p className="max-w-[9em] text-[0.7em] font-semibold uppercase tracking-[0.06em] text-[#3d4f61]">{label}</p>
        <span className="grid size-[2.4em] shrink-0 place-items-center rounded-full bg-[#eef3fb] text-[#0b6f86]">{icon}</span>
      </div>
      <p className="relative mt-[0.6em] text-[2em] font-extrabold leading-none text-[#0b1b2b]">{value}</p>
      <p className="relative mt-auto pt-[0.6em] text-[0.72em] text-[#5b6b7c]">{hint}</p>
    </li>
  );
}

/**
 * Certificates & Credentialing (admin certificates, 26 Oct 2026): stats, the certificates by status with filters and
 * pages, the selected certificate's preview with Approve & Sign and Revoke, issuing by hand, the scan for eligible
 * students, and the public Verification Gateway. The Template Designer is not built yet.
 */
export default function CertificatesPage() {
  const { t } = useI18n();
  const tracksData = useAdminData(getAdminTracks, tk("We couldn't load the tracks. Please try again."));
  const stats = useAdminData(getAdminCertificateStats, tk("We couldn't load the certificate statistics. Please try again."));
  const tracks = useMemo(() => (tracksData.data?.tracks ?? []).map((x) => ({ code: x.code, name: x.name })), [tracksData.data]);

  const [tab, setTab] = useState<CertificateTab>("all");
  const [filters, setFilters] = useState<CertificateFilterValues>({ search: "", trackCode: "", kind: "" });
  const search = useDeferredValue(filters.search.trim());
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);

  const queryKey = JSON.stringify([tab, search, filters.trackCode, filters.kind, page, version]);
  const [list, setList] = useState<{ key: string; data: AdminCertificatePage | null; error: string | null } | null>(null);
  const loading = list?.key !== queryKey;

  useEffect(() => {
    let active = true;
    getAdminCertificates({
      status: TAB_STATUS[tab],
      trackCode: filters.trackCode || null,
      kind: filters.kind || null,
      q: search || null,
      page,
      pageSize: PAGE_SIZE,
    }).then(
      (data) => active && setList({ key: queryKey, data, error: null }),
      (e) => active && setList((old) => ({ key: queryKey, data: old?.data ?? null, error: errorMessage(e, tk("We couldn't load the certificates. Please try again.")) })),
    );
    return () => {
      active = false;
    };
  }, [queryKey, tab, filters.trackCode, filters.kind, search, page]);

  const [selected, setSelected] = useState<AdminCertificate | null>(null);
  // The preview is never empty: until a row is picked it shows the first certificate of the list.
  const shown = selected ?? list?.data?.items[0] ?? null;
  const [issuing, setIssuing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
    void stats.reload();
  }, [stats]);

  const onChanged = (certificate: AdminCertificate) => {
    setSelected(certificate);
    refresh();
  };

  const scan = async () => {
    setScanning(true);
    setNotice(null);
    try {
      const { added } = await scanCertificates();
      setNotice({
        ok: true,
        text: added === 0 ? t("No new eligible students were found.") : t("{count} certificates are now awaiting approval.", { count: added }),
      });
      if (added > 0) {
        setTab("pending");
        setPage(1);
      }
      refresh();
    } catch (e) {
      setNotice({ ok: false, text: errorMessage(e, tk("We couldn't look for eligible students. Please try again.")) });
    } finally {
      setScanning(false);
    }
  };

  const s = stats.data;
  const icon = "size-[1.1em]";
  const topTrack = s?.byTrack.find((x) => x.issued > 0);

  return (
    <AdminSurface>
      <ScreenHeader
        crumbs={[t("Admin"), t("Console"), t("Certificates")]}
        title={t("Certificates & Credentialing")}
        description={t("Issue, approve, revoke and verify capstone and track completion certificates.")}
        actions={
          <>
            <button
              type="button"
              disabled
              title={t("Coming soon")}
              className="inline-flex cursor-not-allowed items-center gap-[0.5em] rounded-[0.7em] bg-white px-[1.1em] py-[0.65em] text-[0.85em] font-semibold text-[#0b1b2b]/70 shadow-[0_4px_14px_rgba(20,54,90,0.08)]"
            >
              <PenTool className="size-[1em] text-[#0b6f86]" /> {t("Template Designer")}
            </button>
            <button
              type="button"
              onClick={scan}
              disabled={scanning}
              className="inline-flex items-center gap-[0.5em] rounded-[0.7em] bg-white px-[1.1em] py-[0.65em] text-[0.85em] font-semibold text-[#0b1b2b] shadow-[0_4px_14px_rgba(20,54,90,0.08)] hover:bg-[#f1f6fb] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {scanning ? <LoaderCircle className="size-[1em] animate-spin text-[#0b6f86]" /> : <UserSearch className="size-[1em] text-[#0b6f86]" />}
              {t("Find eligible students")}
            </button>
            <button type="button" onClick={() => setIssuing(true)} className={BTN_PRIMARY}>
              <CirclePlus className="size-[1em]" /> {t("Issue New Certificate")}
            </button>
          </>
        }
      />

      {notice && (
        <p
          role="status"
          className={`rounded-[0.7em] px-[1em] py-[0.7em] text-[0.8em] font-semibold ${notice.ok ? "bg-[#d7efe6] text-[#12676b]" : "bg-[#fdecec] text-[#b83232]"}`}
        >
          {notice.text}
        </p>
      )}

      {stats.error && !s ? (
        <LoadState error={stats.error} onRetry={stats.reload} />
      ) : (
        <ul aria-label={t("Certificate statistics")} className="grid grid-cols-1 gap-[1.1em] sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            label={t("Total Issued")}
            icon={<Medal className={icon} />}
            value={s ? s.issued : "—"}
            hint={topTrack ? t("Most in {track}", { track: topTrack.trackName }) : t("No certificates issued yet")}
          />
          <Stat
            label={t("Pending Approval")}
            icon={<ClipboardClock className={icon} />}
            value={s ? s.pending : "—"}
            hint={s && s.pending > 0 ? t("Waiting for your signature") : t("Nothing awaiting sign-off")}
          />
          <Stat label={t("Issued This Month")} icon={<CalendarCheck className={icon} />} value={s ? s.issuedThisMonth : "—"} hint={t("Signed since the 1st")} />
          <Stat label={t("Revoked")} icon={<Ban className={icon} />} value={s ? s.revoked : "—"} hint={t("No longer valid")} />
        </ul>
      )}

      <div className="grid items-start gap-[1.2em] xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-[0.8em]">
          <CertificateFilters
            tab={tab}
            onTab={(next) => {
              setTab(next);
              setPage(1);
            }}
            counts={list?.data?.counts ?? null}
            tracks={tracks}
            values={filters}
            onChange={(next) => {
              setFilters(next);
              setPage(1);
            }}
          />
          {list?.error && list.key === queryKey && <LoadState error={list.error} onRetry={() => setVersion((v) => v + 1)} />}
          <CertificatesTable data={list?.data ?? null} loading={loading} selectedId={shown?.id ?? null} onSelect={setSelected} onPage={setPage} />
        </div>

        <div className="min-w-0 space-y-[1.2em]">
          <CertificatePreview key={shown?.id ?? "none"} certificate={shown} onChanged={onChanged} />
          <VerificationGateway />
        </div>
      </div>

      {issuing && (
        <IssueCertificateDialog
          tracks={tracks}
          onClose={() => setIssuing(false)}
          onIssued={(certificate) => {
            setIssuing(false);
            setNotice({ ok: true, text: t("Certificate {id} was issued to {name}.", { id: certificate.credentialId, name: certificate.studentName }) });
            onChanged(certificate);
          }}
        />
      )}
    </AdminSurface>
  );
}
