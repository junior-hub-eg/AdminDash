/** In-app notifications for every role (backend NotificationsController). */
import { api } from "@/lib/api-client";
import type { Locale } from "@/lib/i18n/config";
import { dateLocale } from "@/lib/i18n/translate";

export interface AppNotification {
  id: string;
  type: string;
  textAr: string | null;
  textEn: string | null;
  link: string | null;
  extraText: string | null;
  createdUtc: string;
  isRead: boolean;
}

export const getNotifications = (options: { unread?: boolean; limit?: number } = {}) => {
  const query = new URLSearchParams();
  if (options.unread) query.set("unread", "true");
  if (options.limit) query.set("limit", String(options.limit));
  return api.get<AppNotification[]>(`/api/v1/notifications${query.size ? `?${query}` : ""}`);
};
export const getUnreadNotificationCount = () => api.get<{ count: number }>("/api/v1/notifications/unread-count").then((r) => r.count);
export const markNotificationRead = (id: string) => api.post<AppNotification>(`/api/v1/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.post<void>("/api/v1/notifications/all-read");

/** The text in the page's language, falling back to the other one, then to the type ("NewMessage" -> "New message"). */
export function notificationText(n: AppNotification, locale: Locale): string {
  const text = locale === "ar" ? n.textAr || n.textEn : n.textEn || n.textAr;
  if (text) return text;
  const words = n.type.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** "1 hour ago" / "منذ ساعة" in the page's language. */
export function timeAgo(utc: string, now = Date.now()): string {
  const seconds = Math.round((new Date(utc).getTime() - now) / 1000);
  const format = new Intl.RelativeTimeFormat(dateLocale(), { numeric: "auto" });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [["year", 31_536_000], ["month", 2_592_000], ["week", 604_800], ["day", 86_400], ["hour", 3_600], ["minute", 60]];
  for (const [unit, size] of steps) if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  return format.format(seconds, "second");
}
