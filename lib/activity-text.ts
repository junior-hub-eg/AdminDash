/**
 * The backend writes a student's activity events in English ("Finished the task X"). These patterns give the Arabic
 * sentence with the same names and titles; any other text is shown as sent.
 */
import type { TFunction } from "@/lib/i18n/translate";

const PATTERNS: [RegExp, string][] = [
  [/^Finished the task (.+)$/, "Finished the task {x}"],
  [/^Passed the lesson (.+)$/, "Passed the lesson {x}"],
  [/^Passed the (.+) track quiz$/, "Passed the {x} track quiz"],
  [/^Passed the (.+) quiz$/, "Passed the {x} quiz"],
  [/^Earned the badge (.+)$/, "Earned the badge {x}"],
  [/^Chose (.+) as mentor$/, "Chose {x} as mentor"],
  [/^Got (.+) as mentor$/, "Got {x} as mentor"],
  [/^Matched with (.+) as mentor$/, "Matched with {x} as mentor"],
  [/^Booked a session with (.+)$/, "Booked a session with {x}"],
  [/^Completed the project (.+)$/, "Completed the project {x}"],
  [/^Submitted their work on (.+)$/, "Submitted their work on {x}"],
  [/^Switched to the (.+) track$/, "Switched to the {x} track"],
  [/^Chose the (.+) track$/, "Chose the {x} track"],
  [/^Passed the practice interview for (.+)$/, "Passed the practice interview for {x}"],
  [/^Practised the interview for (.+)$/, "Practised the interview for {x}"],
  [/^Moved to the (.+) squad$/, "Moved to the {x} squad"],
];

export function activityText(text: string, t: TFunction): string {
  for (const [re, template] of PATTERNS) {
    const m = re.exec(text);
    if (m) return t(template, { x: t(m[1]) });
  }
  return t(text);
}
