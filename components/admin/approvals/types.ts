export type ApprovalKind = "squad" | "session" | "milestone" | "certificate" | "signup";

export type Priority = "urgent" | "medium" | "normal";

export type ApprovalTab = "all" | ApprovalKind;

/** What the "Selected Inspector" card shows for one request. */
export type InspectorInfo = {
  ticket: string;
  idLabel: string;
  chips: string[];
  /** Two-column info cards (e.g. current squad / target squad). */
  cards: { label: string; value: string; accent?: boolean }[];
  progress?: { label: string; pct: number; note: string };
  quote?: { title: string; by: string; text: string };
  approveLabel: string;
};

/** Which API a request comes from: a sign-up, a student's mentor change, a mentor's new track. */
export type RequestSource = "signup" | "mentorChange" | "trackRequest";

/** One row of the queue, from one of the three request APIs. */
export type QueueItem = {
  id: string;
  source: RequestSource;
  /** For an approved mentor sign-up: offer them the students who wait for a mentor. */
  mentor?: { id: string; name: string; trackCode: string };
  kind: ApprovalKind;
  priority: Priority;
  name: string;
  /** "Student • Code Crew" */
  subtitle: string;
  /** The short quoted line under the name. */
  note: string;
  typeLabel: string;
  context: string;
  submitted: string;
  sla: string;
  /** Show the SLA line in red (blocked). */
  slaAlert?: boolean;
  /** Label of the main button on the row. */
  primaryLabel: string;
  inspector: InspectorInfo;
};