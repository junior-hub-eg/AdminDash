import type { UserRole } from "@/lib/types";

export const APP_NAME = "Junior Hub";

/** Landing route per role after login. Keep in sync with the app/<role> folders. */
export const ROLE_HOME: Record<UserRole, string> = {
  learner: "/learner/dashboard",
  guardian: "/guardian/dashboard",
  mentor: "/mentor/dashboard",
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
};

/** Path prefix each role is allowed under — used by proxy.ts for route guarding. */
export const ROLE_PATH_PREFIX: Record<UserRole, string> = {
  learner: "/learner",
  guardian: "/guardian",
  mentor: "/mentor",
  admin: "/admin",
  teacher: "/teacher",
};

export const TRACKS = [
  "Frontend",
  "Backend",
  "AI/ML",
  "Data Analysis",
  "Mobile",
  "Design",
] as const;
