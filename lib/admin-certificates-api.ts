/**
 * Certificates for the admin Certificates screen. There is no admin certificates API yet;
 * the only one is the public check of a certificate code (RecruitmentController.Verify),
 * which anyone may call, e.g. JH-SIM-4F7K2Q.
 */
import { api } from "@/lib/api-client";

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
}

/** GET /api/v1/recruitment/certificates/{code}: 404 when no certificate has that code. */
export const verifyCertificate = (code: string) =>
  api.get<VerifiedCertificate>(`/api/v1/recruitment/certificates/${encodeURIComponent(code)}`);
