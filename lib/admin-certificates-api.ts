/**
 * Certificates for the admin Certificates screen (AdminCertificatesController, 26 Oct 2026): track completion and
 * capstone certificates the admin approves, issues by hand or revokes, plus the public check of a credential id
 * (RecruitmentController.Verify), which anyone may call, e.g. JH-CRT-4F7K2Q or JH-SIM-4F7K2Q.
 */
import { api } from "@/lib/api-client";

export type CertificateKind = "TrackCompletion" | "Capstone";
export type CertificateStatus = "Pending" | "Issued" | "Revoked";

export interface AdminCertificate {
  id: string;
  studentId: string;
  studentName: string;
  photoUrl: string | null;
  trackId: string;
  trackCode: string;
  trackName: string;
  kind: CertificateKind;
  title: string;
  credentialId: string;
  status: CertificateStatus;
  requestedUtc: string;
  issuedUtc: string | null;
  revokedUtc: string | null;
  revokeReason: string | null;
  /** Track progress or the project's score, in percent, when known. */
  score: number | null;
  squadId: string | null;
  squadName: string | null;
  signerName: string | null;
  signerTitle: string | null;
}

export interface AdminCertificateCounts {
  all: number;
  pending: number;
  issued: number;
  revoked: number;
}

export interface AdminCertificatePage {
  items: AdminCertificate[];
  total: number;
  page: number;
  pageSize: number;
  /** Counts per status with the same track, kind and search filters (for the tabs). */
  counts: AdminCertificateCounts;
}

export interface AdminCertificateStats {
  issued: number;
  pending: number;
  revoked: number;
  issuedThisMonth: number;
  byTrack: { trackCode: string; trackName: string; issued: number; pending: number; revoked: number }[];
}

export interface CertificateQuery {
  status?: CertificateStatus | null;
  trackCode?: string | null;
  kind?: CertificateKind | null;
  q?: string | null;
  page?: number;
  pageSize?: number;
}

export interface IssueCertificate {
  studentId: string;
  trackCode: string;
  kind: CertificateKind;
  title?: string | null;
}

/** GET /api/v1/admin/certificates: newest first. */
export function getAdminCertificates(query: CertificateQuery = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return api.get<AdminCertificatePage>(`/api/v1/admin/certificates${qs ? `?${qs}` : ""}`);
}

export const getAdminCertificateStats = () => api.get<AdminCertificateStats>("/api/v1/admin/certificates/stats");
export const getAdminCertificate = (id: string) => api.get<AdminCertificate>(`/api/v1/admin/certificates/${id}`);
/** Issues and signs a certificate by hand; 409 CERTIFICATE_EXISTS when one is pending or issued already. */
export const issueCertificate = (body: IssueCertificate) => api.post<AdminCertificate>("/api/v1/admin/certificates", body);
/** Pending → Issued, signed by the signed-in admin; the student is notified. */
export const approveCertificate = (id: string) => api.post<AdminCertificate>(`/api/v1/admin/certificates/${id}/approve`, {});
export const revokeCertificate = (id: string, reason: string) =>
  api.post<AdminCertificate>(`/api/v1/admin/certificates/${id}/revoke`, { reason });
/** Adds a pending certificate for every eligible student who has none yet; returns how many were added. */
export const scanCertificates = () => api.post<{ added: number }>("/api/v1/admin/certificates/scan", {});

export interface VerifiedCertificate {
  code: string;
  studentName: string;
  role: string;
  companyName: string;
  trackName: string;
  scorePercent: number;
  issuedUtc: string;
  /** Practice-interview certificates are simulations, not job offers. */
  isSimulation: boolean;
  disclaimer: string;
  /** Simulation, TrackCompletion or Capstone (older servers send none: a simulation). */
  kind?: "Simulation" | CertificateKind;
  /** Issued or Revoked. */
  status?: "Issued" | "Revoked";
  title?: string | null;
  trackCode?: string | null;
  revokedUtc?: string | null;
  signerName?: string | null;
  signerTitle?: string | null;
}

/** GET /api/v1/recruitment/certificates/{code}: 404 when no certificate has that code (a pending one is not public). */
export const verifyCertificate = (code: string) =>
  api.get<VerifiedCertificate>(`/api/v1/recruitment/certificates/${encodeURIComponent(code)}`);
