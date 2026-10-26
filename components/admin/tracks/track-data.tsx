import { createElement } from "react";
import { BarChart3, BookOpen, Brain, Bug, Gamepad2, Monitor, PenTool, Server, Smartphone, type LucideIcon } from "lucide-react";
import { getAdminMentors, getAdminTracks, type AdminMentor, type AdminTrack, type AdminTracksPage } from "@/lib/admin-api";
import { getTrackCatalog, type TrackCatalogItem } from "@/lib/admin-tracks-api";

const ICONS: Record<string, LucideIcon> = {
  monitor: Monitor,
  server: Server,
  "pen-tool": PenTool,
  smartphone: Smartphone,
  brain: Brain,
  bug: Bug,
  "bar-chart": BarChart3,
  gamepad: Gamepad2,
};

/** The track's icon from its icon key (a book when the key is unknown). */
export function TrackIcon({ iconKey, className }: { iconKey?: string | null; className?: string }) {
  return createElement((iconKey && ICONS[iconKey]) || BookOpen, { className });
}

/** A track with its catalog fields and the mentors who teach it. */
export interface TrackItem {
  track: AdminTrack;
  /** Description, icon, lessons flag and video count; null if the public catalog did not load. */
  info: TrackCatalogItem | null;
  /** Position in the sort order (0 = first). */
  order: number;
  /** All mentors of the track (null when the mentors list did not load). */
  mentors: AdminMentor[] | null;
  /** The active mentor with the most students; null when there is none. */
  lead: AdminMentor | null;
}

export interface TrackBoard {
  stats: AdminTracksPage["stats"];
  items: TrackItem[];
  totalStudents: number;
}

/** Admin tracks + the public catalog (descriptions) + mentors, joined by track code. */
export async function loadTrackBoard(): Promise<TrackBoard> {
  const [page, catalog, mentors] = await Promise.all([
    getAdminTracks(),
    getTrackCatalog().catch(() => null),
    getAdminMentors()
      .then((p) => p.mentors)
      .catch(() => null),
  ]);
  const items = page.tracks.map((track, i): TrackItem => {
    const own = mentors?.filter((m) => m.trackCode.toUpperCase() === track.code.toUpperCase()) ?? null;
    const lead =
      own
        ?.filter((m) => m.isActive)
        .sort((a, b) => b.students - a.students || b.monitoredSquads - a.monitoredSquads || b.rating - a.rating)[0] ?? null;
    return {
      track,
      info: catalog?.find((c) => c.code.toUpperCase() === track.code.toUpperCase()) ?? null,
      order: i,
      mentors: own,
      lead,
    };
  });
  return { stats: page.stats, items, totalStudents: page.tracks.reduce((s, x) => s + x.students, 0) };
}

export const initials = (name: string) =>
  name
    .replace(/^(Dr\.|Eng\.)\s*/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
