"use client";

import type { ReactNode } from "react";
import { BadgeCheck, CirclePlus, ClipboardClock, Layers, Medal, PenTool } from "lucide-react";

import { getAdminTracks } from "@/lib/admin-api";
import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { useAdminData } from "./admin-data";
import CertificateFilters from "./certificates/CertificateFilters";
import CertificatePreview from "./certificates/CertificatePreview";
import CertificatesTable from "./certificates/CertificatesTable";
import VerificationGateway from "./certificates/VerificationGateway";
import { ScreenHeader } from "./notifications/ScreenHeader";
import { AdminSurface, BTN_PRIMARY, PANEL } from "./page-parts";

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
 * Certificates & Credentialing. There is no admin certificates API yet (list / issue / approve /
 * templates), so the designed layout shows empty states and disabled actions. The Verification
 * Gateway is live: it checks a code against the public verify endpoint.
 */
export default function CertificatesPage() {
  const { t } = useI18n();
  const tracks = useAdminData(getAdminTracks, tk("We couldn't load the tracks. Please try again."));
  const soon = t("Coming soon");
  const icon = "size-[1.1em]";

  return (
    <AdminSurface>
      <ScreenHeader
        crumbs={[t("Admin"), t("Console"), t("Certificates")]}
        title={t("Certificates & Credentialing")}
        description={t("Issue, design, and verify accredited blockchain-backed capstone and track completion certificates.")}
        actions={
          <>
            <button
              type="button"
              disabled
              title={soon}
              className="inline-flex cursor-not-allowed items-center gap-[0.5em] rounded-[0.7em] bg-white px-[1.1em] py-[0.65em] text-[0.85em] font-semibold text-[#0b1b2b]/70 shadow-[0_4px_14px_rgba(20,54,90,0.08)]"
            >
              <PenTool className="size-[1em] text-[#0b6f86]" /> {t("Template Designer")}
            </button>
            <button type="button" disabled title={soon} className={BTN_PRIMARY}>
              <CirclePlus className="size-[1em]" /> {t("Issue New Certificate")}
            </button>
          </>
        }
      />

      <ul aria-label={t("Certificate statistics")} className="grid grid-cols-1 gap-[1.1em] sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("Total Issued")} icon={<Medal className={icon} />} value="—" hint={t("No certificates issued yet")} />
        <Stat label={t("Pending Approval")} icon={<ClipboardClock className={icon} />} value="—" hint={t("Nothing awaiting sign-off")} />
        <Stat label={t("Active Templates")} icon={<Layers className={icon} />} value="—" hint={t("No templates created yet")} />
        <Stat label={t("Verification Queries")} icon={<BadgeCheck className={icon} />} value="—" hint={t("Lookups are not counted yet")} />
      </ul>

      <div className="grid items-start gap-[1.2em] xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-[0.8em]">
          <CertificateFilters tracks={(tracks.data?.tracks ?? []).map((x) => x.name)} />
          <CertificatesTable />
        </div>

        <div className="min-w-0 space-y-[1.2em]">
          <CertificatePreview />
          <VerificationGateway />
        </div>
      </div>
    </AdminSurface>
  );
}
