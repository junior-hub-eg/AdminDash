import { PlaceholderPage } from "@/components/shared/placeholder-page";

export default function AdminModerationPage() {
  return (
    <PlaceholderPage
      title="Chat moderation"
      description="Review reported messages or messages with personal data (PII) before delivery — a top safety priority"
      waitingOn="PII Filter Service (Sprint 5 AI) + Chat moderation queue API"
      prdSection="§8"
    />
  );
}
