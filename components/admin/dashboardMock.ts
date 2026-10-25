import { tk } from "@/lib/i18n/translate";

/**
 * TEMPORARY mock data for the parts of the new dashboard design that the API
 * does not return yet. Replace each export with a real endpoint when it exists
 * (see the TODO above each one) and delete this file when all are gone.
 */

// TODO(api): GET admin/overview should return these 4 stats + deltas.
export const MOCK_STATS = {
  totalStudents: { value: 1248, delta: "+12.6%", hint: tk("vs last month") },
  activeSquads: { value: 42, delta: "+5 new", hint: tk("this cohort cycle") },
  activeMentors: { value: 28, delta: "96%", hint: tk("weekly availability") },
  pendingRequests: { value: 19, delta: "17 urgent", hint: tk("need review") },
};

// TODO(api): weekly engagement summary for the chart header.
export const MOCK_ACTIVITY_SUMMARY = [
  { label: tk("Peak Daily Hours"), value: "412 hrs" },
  { label: tk("Avg. Session Length"), value: "58 mins" },
  { label: tk("Weekly Active Rate"), value: "91.4%" },
];

// TODO(api): enrollment per track (5 tracks).
export const MOCK_TRACKS = [
  { name: tk("UI/UX Design"), count: 330, color: "#12939b" },
  { name: tk("Frontend Web"), count: 310, color: "#12676b" },
  { name: tk("Backend Engineering"), count: 250, color: "#1a2b57" },
  { name: tk("Mobile Development"), count: 224, color: "#7fddc9" },
  { name: tk("Game Dev / Other"), count: 134, color: "#b8c4d0" },
];

// TODO(api): current sprint per squad.
export const MOCK_SQUADS = [
  { name: "Design Masters", track: "UI/UX Design", sprint: "Sprint 4 of 6", progress: 78, points: 82, done: "14/18", members: 5 },
  { name: "Code Crew", track: "Frontend Web", sprint: "Sprint 3 of 6", progress: 85, points: 110, done: "21/25", members: 6 },
  { name: "Server Squad", track: "Backend Eng", sprint: "Sprint 2 of 6", progress: 48, points: 64, done: "6/13", members: 4 },
  { name: "Mobile Stars", track: "iOS / Flutter", sprint: "Sprint 5 of 6", progress: 84, points: 134, done: "26/31", members: 7 },
];

// TODO(api): course milestones.
export const MOCK_MILESTONES = [
  { name: tk("UI/UX Foundations"), sub: tk("142 of 160 students finished"), pct: 89 },
  { name: tk("React Advanced Patterns"), sub: tk("98 of 132 students finished"), pct: 74 },
  { name: tk("Node.js Microservices"), sub: tk("82 of 120 students finished"), pct: 68 },
];

// TODO(api): realtime activity feed.
export const MOCK_FEED = [
  { text: tk("Ahmad Khaled completed Sprint 3 API integration"), time: tk("4 mins ago") },
  { text: tk("Code Crew submitted Project Alpha for mentorship review"), time: tk("22 mins ago") },
  { text: tk("Sara Omar earned Level 4 Badge"), time: tk("1 hr ago") },
  { text: tk("Dr. Hassan Noor scheduled a live cohort workshop for Mobile Stars"), time: tk("2.5 hrs ago") },
];
// TODO(api): mentor detail page extras (the API only returns the basic profile today).
export const MOCK_MENTOR_EXTRAS = {
  hours: "320+",
  responseSla: "1.4h",
  phone: "+20 100 892 4110",
  joined: tk("Joined Cohort Fall 2023 (1.5 Years)"),
  bio: tk("Principal Product Designer & Lead UI/UX Mentor • Capstone Jury Lead"),
};

export const MOCK_MENTOR_CAPACITY = { students: 12, maxStudents: 14, squads: 2, maxSquads: 2, hours: 18, maxHours: 20 };

export const MOCK_MENTOR_SQUADS = [
  { name: "Design Masters", sprint: "Sprint 4 Active", health: 94, capstone: "EduPlay Mobile App", velocity: "24/26 SP", pct: 92, review: "Oct 26, 2:00 PM", members: 5 },
  { name: "Pixel Pioneers", sprint: "Sprint 2 Active", health: 88, capstone: "EcoQuest Web App", velocity: "18/22 SP", pct: 82, review: "Oct 28, 4:30 PM", members: 6 },
];

export const MOCK_MENTOR_STUDENTS = [
  { name: "Ahmed Khaled", email: "ahmed.k@student.hub", squad: "Design Masters", level: "L4 Capstone", sp: "8 SP", status: "Done", attendance: "98%", rating: "5.0" },
  { name: "Layla Hassan", email: "layla.h@student.hub", squad: "Design Masters", level: "L3 UX Research", sp: "10 SP", status: "Done", attendance: "95%", rating: "4.9" },
  { name: "Tariq Al-Mansour", email: "tariq.m@student.hub", squad: "Design Masters", level: "L3 UI Prototyping", sp: "5 SP", status: "Assigned", attendance: "91%", rating: "New" },
  { name: "Salma Nour", email: "salma.n@student.hub", squad: "Pixel Pioneers", level: "L2 Wireframing", sp: "6 SP", status: "Done", attendance: "100%", rating: "4.9" },
];

export const MOCK_MENTOR_SESSIONS = [
  { when: tk("Today • 4:00 PM"), mins: 90, title: tk("Design Critique: Checkout Flow"), sub: tk("Squad: Design Masters (EduPlay)"), join: true },
  { when: tk("Tomorrow • 2:00 PM"), mins: 60, title: tk("1-on-1 Portfolio & Capstone Review"), sub: tk("Student: Ahmed Khaled"), join: false },
  { when: tk("Thursday • 5:00 PM"), mins: 90, title: tk("Weekly Sprint Retrospective"), sub: tk("Squad: Design Masters"), join: false },
];

export const MOCK_MENTOR_AVAILABILITY = [
  { day: tk("Mon"), time: "4:00 PM – 6:00 PM", state: "booked" },
  { day: tk("Tue"), time: "2:00 PM – 5:00 PM", state: "booked" },
  { day: tk("Wed"), time: "10:00 AM – 12:00 PM", state: "open" },
  { day: tk("Thu"), time: "5:00 PM – 7:00 PM", state: "booked" },
  { day: tk("Fri"), time: tk("Office Hours Closed"), state: "off" },
];

export const MOCK_MENTOR_FEEDBACK = [
  { stars: 5, when: tk("Yesterday"), text: tk("Dr. Tarek's feedback on our Figma auto-layout and design tokens completely leveled up our squad's sprint velocity!"), by: "Ahmed Khaled", squad: "Design Masters" },
  { stars: 5, when: tk("3d ago"), text: tk("Very thorough critique during our sprint demo. Explained WCAG accessibility with clear real-world examples."), by: "Layla Hassan", squad: "Design Masters" },
  { stars: 4, when: tk("5d ago"), text: tk("Always available in Discord office hours to unblock prototype interactions and micro-animation bugs."), by: "Omar Tarek", squad: "Design Masters" },
];
// TODO(api): Track Management extras. The tracks endpoint only returns name, students, squads and progress.
export const MOCK_TRACK_TOTALS = {
  courses: 48,
  coursesBadge: "+8",
  coursesHint: tk("newly authored this term"),
};

// Used by position (1st track gets the 1st entry...). Replace with real fields when the API has them.
export const MOCK_TRACK_EXTRAS = [
  { audience: tk("Ages 12-18 • High Fidelity Product Design"), desc: tk("From design thinking, qualitative discovery, and low-fi wireframing to high-fidelity Figma components, design tokens, responsive systems, and squad design sprints."), courses: 8, levels: 4, mentors: 5, satisfaction: 84, lead: "Dr. Tarek Fayed", tags: ["Figma", "Design Systems", "Usability Testing"] },
  { audience: tk("Ages 13-18 • Next.js & React Frameworks"), desc: tk("Modern web engineering foundations: semantic HTML5, responsive CSS3 architectures, ECMAScript modern standards, Tailwind CSS UI engines, and production-ready Next.js client applications."), courses: 9, levels: 4, mentors: 6, satisfaction: 79, lead: "Eng. Mona Zaki", tags: ["React", "Tailwind CSS", "Next.js"] },
  { audience: tk("Ages 14-18 • Node.js, Go, SQL & Cloud"), desc: tk("Comprehensive server architecture: RESTful API design, relational PostgreSQL querying, NoSQL patterns, cloud containers, JWT authentication, and resilient microservices."), courses: 8, levels: 4, mentors: 4, satisfaction: 76, lead: "Eng. Omar Farouq", tags: ["Node.js", "PostgreSQL", "Docker"] },
  { audience: tk("Flutter, Dart & Swift native patterns"), desc: tk("Cross-platform mobile applications, reactive state management, device hardware access, and store deployment."), courses: 7, levels: 3, mentors: 3, satisfaction: 81, lead: "Eng. Salma Nour", tags: ["Flutter", "Swift"] },
  { audience: tk("Unity, C# & 2D/3D Mechanics"), desc: tk("Rigid body physics, level architecture, dynamic gameplay loops, custom particle fx, and spatial audio design."), courses: 6, levels: 3, mentors: 2, satisfaction: 77, lead: "Eng. Karim Adel", tags: ["Unity", "C#"] },
];

export const MOCK_TRACK_BLUEPRINT = [
  { title: tk("Level 1: Design Foundations"), desc: tk("Color theory, layout grid principles, typography basics, and visual hierarchy."), meta: tk("18 Lessons • 4 Practical Tasks"), courses: 3, state: "done" },
  { title: tk("Level 2: Wireframing & UX"), desc: tk("User research methodologies, empathy mapping, journey mapping, and mid-fidelity Figma wireframes."), meta: tk("22 Lessons • Squad Workshop"), courses: 3, state: "done" },
  { title: tk("Level 3: Design Systems"), desc: tk("Component architecture, auto-layout variants, interactive micro-prototyping, design tokens."), meta: tk("16 Lessons • Component Audit"), courses: 2, state: "current" },
  { title: tk("Level 4: Capstone Squad"), desc: tk("Collaborative real-world student product sprint, peer design critique, and live portfolio presentation."), meta: tk("Capstone"), courses: 0, state: "locked" },
];
// TODO(api): Track Details extras. The API returns only name, students, squads and progress for a track.
export const MOCK_TD_HEADER = {
  cohort: tk("Cohort 2024.B Live"),
  activeLevel: tk("Level 4 Active"),
  lead: "Dr.Tarek Fayed",
  weeks: 16,
  levels: 4,
  csat: "4.92",
  reviews: 320,
};

export const MOCK_TD_LEVELS = [
  { phase: tk("LEVEL 1 • PHASE FOUNDATION"), badge: tk("100% Cohort Pass"), title: tk("Design Foundations & Visual Hierarchy"), desc: tk("3 Courses • 18 Interactive Lessons • 4 Practical Design Tasks. Typography, Optical Weight, Grid Layout Systems & Token intro."), meta: tk("3 Weeks Duration • 350 Submissions Graded"), state: "done", scoreLabel: tk("Score Median"), score: "96.4%", note: tk("Zero Incomplete") },
  { phase: tk("LEVEL 2 • USER DISCOVERY"), badge: tk("92% Pass Rate"), title: tk("User Research, Wireframing & UX Heuristics"), desc: tk("3 Courses • 22 Lessons • 5 Collaborative Squad Workshops. User Personas, Journey Maps, Lo-fi Wireframes & Heuristic Evaluation."), meta: tk("4 Weeks Duration • 6 Squad Research Decks"), state: "done", scoreLabel: tk("Score Median"), score: "91.8%", note: tk("Peer Reviewed") },
  { phase: tk("LEVEL 3 • DESIGN ENGINEERING"), badge: tk("In Progress (78% Avg)"), title: tk("Design Systems & Interactive Prototyping"), desc: tk("2 Specialized Courses • 16 Deep Dive Lessons. Component Audits, Micro-animations, Figma Auto-layout v5 & Variable modes."), meta: tk("Current Active Milestone: Component Library Delivery"), state: "current", scoreLabel: tk("Active Unit"), score: tk("Week 11"), note: tk("Due in 4 days"), done: 282, total: 350 },
  { phase: tk("LEVEL 4 • REAL CLIENT SPRINT"), badge: tk("Current Cohort Focus"), title: tk("Capstone Squad Collaboration (Live Products)"), desc: tk("Multi-squad cross-functional client challenges (EduPlay, EcoQuest). 2-week agile design sprints, mentor design critiques, jury presentation, and full Figma spec delivery."), meta: tk("Capstone Director: Dr. Tarek Fayed • Defense Date: Nov 05, 2024"), state: "focus", scoreLabel: tk("Sprint 4 Active"), score: "", note: tk("6 Squads Engaged") },
];

export const MOCK_TD_SQUADS = [
  { name: "Design Masters", project: "EduPlay Capstone", health: 94, sprint: 4, lead: "Ahmed Khaled", mentor: "Dr. Tarek Fayed", velocity: "48 / 62 SP" },
  { name: "Pixel Pioneers", project: "EcoQuest UI", health: 88, sprint: 2, lead: "Salma Nour", mentor: "Sarah Jenkins", velocity: "42 / 50 SP" },
  { name: "Creative Minds", project: "HealthSync App", health: 91, sprint: 1, lead: "Omar Farooq", mentor: "Tariq Mansour", velocity: "39 / 45 SP" },
];

export const MOCK_TD_DELIVERABLES = [
  { title: "EduPlay - Gamified Learning Experience", tag: "Figma Spec v2.4", by: "Squad Design Masters", evaluator: "Dr. Tarek Fayed", status: "review", label: tk("Under Review (36/40)"), action: tk("Evaluate") },
  { title: "EcoQuest - Environmental Habit Tracker", tag: "Prototype v1.1", by: "Squad Pixel Pioneers", evaluator: "Sarah Jenkins", status: "progress", label: tk("In Progress"), action: tk("Inspect") },
  { title: "FinKid - Financial Literacy for Teens", tag: "Component Library", by: "Squad Creative Minds", evaluator: "Final Assessment", status: "approved", label: tk("Approved (39/40)"), action: tk("View Rubric") },
];

export const MOCK_TD_MENTORS = [
  { name: "Dr. Tarek Fayed", role: tk("Lead Mentor • 2 Squads"), rating: "4.95" },
  { name: "Sarah Jenkins", role: tk("UX Research Lead • 1 Squad"), rating: "4.85" },
  { name: "Tariq Mansour", role: tk("Interaction & Micro-anim"), rating: "4.90" },
];

export const MOCK_TD_TOOLS = [
  { name: "Figma & Auto-Layout", pct: 96 },
  { name: "FigJam Research Mapping", pct: 92 },
  { name: "Adobe After Effects", pct: 44 },
  { name: "Spline / 3D Asset Integration", pct: 30 },
];
// TODO(api): Projects & Submissions. There is no Projects API yet (Sprint 4-5 backend).
export const MOCK_PROJECT_STATS = { total: 38, inDev: 24, awaiting: 7, approved: 62 };

export const MOCK_PROJECT_TABS = { all: 38, review: 7, approved: 62, revisions: 3 };

export type MockProject = {
  id: string;
  code: string;
  title: string;
  status: "review" | "revisions" | "approved";
  statusLabel: string;
  squad: string;
  track: string;
  mentor: string;
  files: string;
  note: string;
  members: string[];
  action: string;
};

export const MOCK_PROJECTS: MockProject[] = [
  { id: "p1", code: "CAP-2026-904", title: "EduPlay - Gamified Learning Mobile App", status: "review", statusLabel: "Under Review", squad: "Design Masters", track: "UI/UX Track", mentor: "Dr. Tarek Fayed", files: "Figma Prototype + Design Spec PDF (14.2 MB)", note: "Submitted Oct 24, 2026", members: ["AK", "YM", "SN"], action: "Selected" },
  { id: "p2", code: "CAP-2026-871", title: "HealthPulse Patient Portal", status: "revisions", statusLabel: "Revisions Requested", squad: "Code Crew", track: "Frontend Track", mentor: "Eng. Mona Zaki", files: "Next.js GitHub Repo + Vercel Preview", note: "2 blocking remarks", members: ["LI", "MA"], action: "View Feedback" },
  { id: "p3", code: "CAP-2026-886", title: "CloudScale API Gateway", status: "review", statusLabel: "Under Review", squad: "Server Squad", track: "Backend Track", mentor: "Eng. Khaled Mostafa", files: "Docker Compose + Swagger Docs + Redis Bench", note: "Submitted Oct 22, 2026", members: ["OI", "KA"], action: "Review" },
  { id: "p4", code: "CAP-2026-812", title: "FinKid - Youth Money Manager", status: "approved", statusLabel: "Approved (+500 XP)", squad: "Mobile Stars", track: "Mobile Track", mentor: "Eng. Rania Salem", files: "Flutter Release APK + TestFlight Build 1.0.4", note: "Score: 96 / 100", members: ["HI", "RS"], action: "View Certificate" },
];

export const MOCK_PROJECT_RUBRIC = [
  { name: "1. User Research & Empathy Mapping", score: 9 },
  { name: "2. Visual Hierarchy & Design System", score: 10 },
  { name: "3. Interactive Prototype Fidelity", score: 8 },
  { name: "4. Accessibility & Color Contrast", score: 9 },
];

export const MOCK_PROJECT_FEEDBACK = {
  by: "Dr. Tarek Fayed",
  when: tk("2h ago"),
  text: tk("Excellent component architecture and micro-interactions. Please tighten the mobile drawer padding before final production sign-off."),
};

export const MOCK_REVIEW_METRICS = [
  { label: tk("Average Review Turnaround"), value: "18.4 Hours", hint: tk("4.2h faster than Cohort 2025") },
  { label: tk("First-Pass Approval Rate"), value: "78.5%", hint: tk("Across all 4 technical tracks") },
  { label: tk("Total Squad XP Granted"), value: "31,000 XP", hint: tk("Distributed to 62 certified squads") },
];

export const MOCK_TD_MILESTONES = [
  { tag: tk("Sprint Review"), when: "Oct 26 • 2:00 PM", title: tk("Sprint 4 Final Capstone Review"), sub: tk("Google Meet Room Link") },
  { tag: tk("Masterclass"), when: "Oct 29 • 5:00 PM", title: tk("Guest Lecture: Micro-animations in Production"), sub: tk("Special speaker from Stripe design team.") },
  { tag: tk("Grand Defense"), when: "Nov 05 • 10:00 AM", title: tk("Jury Evaluation & Demo Day"), sub: tk("Live client presentations and award ceremony.") },
];
// TODO(api): Notifications Center (broadcasts). There is no broadcast API yet.
export const MOCK_NOTIF_STATS = { total: 1420, scheduled: 14, sent: 1388, failed: 18 };

export const MOCK_NOTIF_TABS = { all: 1420, sent: 1388, scheduled: 14, drafts: 18 };

export type MockBroadcast = {
  id: string;
  title: string;
  meta: string;
  audience: string;
  audienceSub: string;
  channels: ("In-App" | "Email" | "Push")[];
  status: "scheduled" | "delivered" | "draft";
  statusLabel: string;
  date: string;
};

export const MOCK_BROADCASTS: MockBroadcast[] = [
  { id: "BRD-9402", title: "Sprint 4 Final Capstone Submission Reminder", meta: "Priority: High", audience: "All Capstone Squads", audienceSub: "24 squads (96 students)", channels: ["In-App", "Email"], status: "scheduled", statusLabel: "Scheduled", date: "Oct 26, 09:00 AM" },
  { id: "BRD-9390", title: "Mentor Sync: Bi-Weekly Cohort Check-in", meta: "Tag: Mentorship", audience: "Active Mentors", audienceSub: "24 mentors verified", channels: ["Email"], status: "delivered", statusLabel: "Delivered (100%)", date: "Oct 22, 02:30 PM" },
  { id: "BRD-9381", title: "System Maintenance Notice", meta: "Tag: Infra Notice", audience: "All Platform Users", audienceSub: "1,248 students + staff", channels: ["In-App"], status: "delivered", statusLabel: "Delivered (99.2%)", date: "Oct 20, 11:00 AM" },
  { id: "BRD-9355", title: "New Level 4 Capstone Rubric Published", meta: "Curriculum Review", audience: "UI/UX & Frontend Tracks", audienceSub: "340 students", channels: ["Push", "In-App"], status: "delivered", statusLabel: "Delivered", date: "Oct 18, 04:15 PM" },
  { id: "BRD-9310", title: "Welcome Onboarding & Orientation Guide", meta: "Cohort Launch", audience: "Cohort Fall-24 New Intake", audienceSub: "512 registered members", channels: ["Email", "Push"], status: "delivered", statusLabel: "Delivered", date: "Oct 15, 10:00 AM" },
];

export const MOCK_ENGAGEMENT = [
  { label: tk("In-App Click-Through (CTR)"), value: 72.4, bench: 55, color: "#06b6d4" },
  { label: tk("Email Open Rate"), value: 58.2, bench: 42, color: "#12676b" },
  { label: tk("Push Response Rate"), value: 41.5, bench: 30, color: "#5b6b88" },
];

export const MOCK_VELOCITY = { rate: "99.1%", days: ["M", "T", "W", "T", "F", "S", "S"], bars: [70, 85, 95, 100, 80, 25, 25] };
// TODO(api): Roles & Permissions extras. The roles API returns only View / Edit / Delete per area.
export const MOCK_ROLES_STATS = { users: 1286, changes: 12 };

/** Matched against the area name that the API returns (lowercase, "includes"). */
export const MOCK_ROLE_AREA_INFO = [
  { match: "student", sub: tk("Profiles, submissions, grades"), scope: tk("All Tracks") },
  { match: "squad", sub: tk("Squad formations, sprint boards"), scope: tk("All Squads") },
  { match: "mentor", sub: tk("Office hours, mentor contracts"), scope: tk("Department Only") },
  { match: "track", sub: tk("Modules, lessons, milestones"), scope: tk("Assigned Tracks") },
  { match: "project", sub: tk("Project evaluations, criteria"), scope: tk("Full Cohort") },
  { match: "certificate", sub: tk("Credential generation & validation"), scope: tk("Verified Only") },
  { match: "notification", sub: tk("System-wide push, SMS, email alerts"), scope: tk("Global") },
  { match: "report", sub: tk("Cohort KPIs, attrition, completion"), scope: tk("Read-Only Export") },
  { match: "analytic", sub: tk("Cohort KPIs, attrition, completion"), scope: tk("Read-Only Export") },
  { match: "security", sub: tk("MFA logs, IP records, sign-in attempts"), scope: tk("View Logs Only") },
];

export const MOCK_ROLE_ADMINS = [
  { initials: "MY", name: "Mohammed Yasser", email: "m.yasser@juniorhub.edu", active: tk("Active 4m ago"), badge: tk("Lead Admin") },
  { initials: "SJ", name: "Sarah Jenkins", email: "s.jenkins@juniorhub.edu", active: tk("Active 32m ago") },
  { initials: "ET", name: "Eng. Tarek Mansour", email: "tarek.m@juniorhub.edu", active: tk("Active 2h ago") },
  { initials: "DK", name: "Dr. Khaled Adel", email: "k.adel@juniorhub.edu", active: tk("Active 5h ago") },
  { initials: "NR", name: "Nourhan Rashed", email: "n.rashed@juniorhub.edu", active: tk("Active Yesterday") },
];

export const MOCK_ROLE_AUDIT = [
  { color: "#06b6d4", title: tk("Mohammed Yasser granted Export"), text: tk("Enabled CSV/XLS Export on Capstone Projects for Curriculum Manager."), hash: "9e4a..b12", tag: tk("2FA Verified"), when: tk("2h ago") },
  { color: "#d04a4a", title: tk("Super Admin revoked Delete privilege"), text: tk("Revoked Delete Squad permissions from Mentor Manager role globally."), hash: "3c71..ff9", tag: tk("Sys Policy #84"), when: tk("1d ago") },
  { color: "#12676b", title: tk("New Custom Role Provisioned"), text: tk("Role Curriculum Architect created with scoped read/write permissions on learning paths."), hash: "88fa..1a0", tag: tk("Active (5 Users)"), when: tk("3d ago") },
  { color: "#12676b", title: tk("Bulk Role Elevation"), text: tk("Promoted 4 Senior Mentors to Technical Mentor Tier 2 for Fall Batch approval pipeline."), hash: "", tag: "", when: tk("5d ago") },
];
// ============================================================================
// الصق الجزء ده في آخر components/admin/dashboardMock.ts
// (الـ import بتاع tk موجود فوق في الملف أصلاً)
// ============================================================================

// TODO(api): Certificates & Credentialing. There is no certificates API yet
// (only AdminReport.stats.certificatesIssued exists). Needs: list / issue /
// approve / revoke / public verify-by-credential-id endpoints.
export const MOCK_CERT_STATS = {
  totalIssued: { value: 486, delta: "+64", hint: tk("Cohort Fall 2026 completion cycle") },
  pending: { value: 15, badge: tk("Action req."), hint: tk("Awaiting admin & mentor sign-off") },
  templates: { value: 8, tracks: 5, hint: tk("UI/UX, Frontend, Backend & Cloud") },
  queries: { value: 1842, validRate: "99.8%", hint: tk("Public on-chain verification hits") },
};

export type CertStatus = "issued" | "pending" | "revoked";

export type MockCertificate = {
  id: string;
  student: string;
  /** Capstone / student code shown under the name. */
  studentCode: string;
  /** Capstone title printed on the certificate. */
  title: string;
  /** One of MOCK_CERT_TRACKS. */
  track: string;
  /** One of MOCK_CERT_COHORTS. */
  cohort: string;
  /** ISO yyyy-mm-dd */
  date: string;
  /** Without the leading "#". */
  credentialId: string;
  status: CertStatus;
};

export const MOCK_CERT_TRACKS = ["UI/UX Track", "Frontend Track", "Backend Track", "Mobile Track", "Game Dev"];

export const MOCK_CERT_COHORTS = ["Cohort 2026", "Cohort 2025"];

/** Printed on every certificate. TODO(api): comes from the template. */
export const MOCK_CERT_SIGNERS = {
  institute: "Junior Hub Academy",
  accreditation: "Accredited Technology Institute",
  left: { sign: "M. Yasser", name: "Mohammed Yasser" },
  right: { sign: "T. Fayed", name: "Dr. Tarek Fayed" },
};

export const MOCK_CERTIFICATES: MockCertificate[] = [
  { id: "c1", student: "Ahmed Khaled", studentCode: "CAP-2026-904", title: "Advanced UI/UX Product Design Capstone", track: "UI/UX Track", cohort: "Cohort 2026", date: "2026-10-24", credentialId: "JH-CERT-8841", status: "issued" },
  { id: "c2", student: "Laila Hassan", studentCode: "CAP-2026-812", title: "Full-Stack Next.js Commerce Capstone", track: "Frontend Track", cohort: "Cohort 2026", date: "2026-10-23", credentialId: "JH-CERT-8840", status: "issued" },
  { id: "c3", student: "Omar Tarek", studentCode: "CAP-2026-750", title: "Distributed Microservices Capstone", track: "Backend Track", cohort: "Cohort 2026", date: "2026-10-22", credentialId: "JH-CERT-8839", status: "pending" },
  { id: "c4", student: "Mariam Ali", studentCode: "CAP-2026-619", title: "Flutter Cross-Platform Health App Capstone", track: "Mobile Track", cohort: "Cohort 2026", date: "2026-10-20", credentialId: "JH-CERT-8838", status: "issued" },
  { id: "c5", student: "Youssef Mohamed", studentCode: "CAP-2026-512", title: "Gamified Learning Platform Capstone", track: "Game Dev", cohort: "Cohort 2026", date: "2026-10-18", credentialId: "JH-CERT-8837", status: "revoked" },
  { id: "c6", student: "Nour Adel", studentCode: "CAP-2026-498", title: "EcoQuest UI Design System Capstone", track: "UI/UX Track", cohort: "Cohort 2026", date: "2026-10-17", credentialId: "JH-CERT-8836", status: "issued" },
  { id: "c7", student: "Karim Samy", studentCode: "CAP-2026-455", title: "Realtime Dashboard Frontend Capstone", track: "Frontend Track", cohort: "Cohort 2026", date: "2026-10-16", credentialId: "JH-CERT-8835", status: "pending" },
  { id: "c8", student: "Hana Ibrahim", studentCode: "CAP-2026-431", title: "REST API & PostgreSQL Capstone", track: "Backend Track", cohort: "Cohort 2026", date: "2026-10-15", credentialId: "JH-CERT-8834", status: "issued" },
  { id: "c9", student: "Salma Nour", studentCode: "CAP-2026-402", title: "Pixel Pioneers Wireframing Capstone", track: "UI/UX Track", cohort: "Cohort 2026", date: "2026-10-14", credentialId: "JH-CERT-8833", status: "pending" },
  { id: "c10", student: "Tariq Mansour", studentCode: "CAP-2026-377", title: "Unity 2D Platformer Capstone", track: "Game Dev", cohort: "Cohort 2026", date: "2026-10-12", credentialId: "JH-CERT-8832", status: "issued" },
  { id: "c11", student: "Sara Omar", studentCode: "CAP-2025-288", title: "Mobile Banking UX Capstone", track: "UI/UX Track", cohort: "Cohort 2025", date: "2025-10-20", credentialId: "JH-CERT-7410", status: "issued" },
  { id: "c12", student: "Ziad Mahmoud", studentCode: "CAP-2025-251", title: "Node.js Auth Service Capstone", track: "Backend Track", cohort: "Cohort 2025", date: "2025-10-19", credentialId: "JH-CERT-7409", status: "issued" },
];