"use client";

import { MessagesPage } from "@/components/chat/ChatWorkspace";
import { useI18n } from "@/lib/i18n/client";
import { AdminSurface, PageHeader } from "./page-parts";

/** Messages (27 Oct 2026): technical support from every user, broadcasts to everyone or one role, and any conversation. */
export default function AdminMessages({ conversationId, withUserId }: { conversationId?: string; withUserId?: string }) {
  const { t } = useI18n();
  return (
    <AdminSurface>
      <PageHeader
        eyebrow={t("Notifications")}
        title={t("Messages")}
        description={t("Answer technical support, broadcast to everyone, students, mentors or teachers, or message anyone.")}
      />
      <MessagesPage conversationId={conversationId} withUserId={withUserId} />
    </AdminSurface>
  );
}
