import { account } from "./ar/account";
import { admin } from "./ar/admin";
import { adminManage } from "./ar/admin-manage";
import { adminStudents } from "./ar/admin-students";
import { adminMentorSessions } from "./ar/admin-mentor-sessions";
import { adminRewards } from "./ar/admin-rewards";
import { adminSecurity } from "./ar/admin-security";
import { adminUiA } from "./ar/admin-ui-a";
import { adminUiB } from "./ar/admin-ui-b";
import { adminUiC } from "./ar/admin-ui-c";
import { adminUiD } from "./ar/admin-ui-d";
import { adminUiE } from "./ar/admin-ui-e";
import { adminPermissions } from "./ar/admin-permissions";
import { auth } from "./ar/auth";
import { backend } from "./ar/backend";
import { calendar } from "./ar/calendar";
import { common } from "./ar/common";
import { courses } from "./ar/courses";
import { errors } from "./ar/errors";
import { internship } from "./ar/internship";
import { interns } from "./ar/interns";
import { landing } from "./ar/landing";
import { math } from "./ar/math";
import { learner } from "./ar/learner";
import { lesson } from "./ar/lesson";
import { mentors } from "./ar/mentors";
import { mentorWorkspace } from "./ar/mentor-workspace";
import { recruitment } from "./ar/recruitment";
import { teacher } from "./ar/teacher";
import { students } from "./ar/students";
import { curriculum } from "./ar/curriculum";
import { assignments } from "./ar/assignments";
import { teacherWorkspace } from "./ar/teacher-workspace";
import { teacherMessages } from "./ar/teacher-messages";
import { teacherCalendar } from "./ar/teacher-calendar";
import { teacherProgress } from "./ar/teacher-progress";
import { grammarCoach } from "./ar/grammar-coach";
import { adminGrammar } from "./ar/admin-grammar";
import { adminCertificates } from "./ar/admin-certificates";
import { teacherGrammar } from "./ar/teacher-grammar";
import { mentorArea } from "./ar/mentor-area";
import { adminReports } from "./ar/admin-reports";
import { adminProjects } from "./ar/admin-projects";

/** Arabic translations, keyed by the English text. `node scripts/i18n-check.mjs` lists missing ones. */
export const ar: Record<string, string> = {
  // First, so the older dictionaries keep their own wording for the texts they share.
  ...mentorArea,
  ...common,
  ...landing,
  ...auth,
  ...errors,
  ...backend,
  ...learner,
  ...courses,
  ...mentors,
  ...mentorWorkspace,
  ...internship,
  ...recruitment,
  ...math,
  ...account,
  ...interns,
  ...lesson,
  ...calendar,
  ...admin,
  ...adminManage,
  ...adminStudents,
  ...adminMentorSessions,
  ...adminRewards,
  ...adminSecurity,
  ...adminUiA,
  ...adminUiB,
  ...adminUiC,
  ...adminUiD,
  ...adminUiE,
  ...adminProjects,
  ...adminPermissions,
  ...teacher,
  ...students,
  ...curriculum,
  ...assignments,
  ...teacherWorkspace,
  ...teacherMessages,
  ...teacherCalendar,
  ...teacherProgress,
  ...grammarCoach,
  ...adminGrammar,
  ...adminCertificates,
  ...teacherGrammar,
  ...adminReports,
};
