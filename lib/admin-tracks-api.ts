/** Track create / edit / delete for the admin (backend AdminController tracks endpoints). */
import { api } from "@/lib/api-client";
import type { AdminTrack } from "@/lib/admin-api";

/** The public catalog entry of a track: the fields the admin list does not return. */
export interface TrackCatalogItem {
  code: string;
  name: string;
  shortDescription: string;
  iconKey: string;
  hasLessons: boolean;
  videoCount: number;
}

export interface TrackInput {
  name: string;
  shortDescription: string;
  /** What the discovery AI reads to match students to the track. */
  discoveryProfile: string;
  iconKey: string;
  sortOrder: number;
  hasLessons: boolean;
}

/** Ordered by the tracks' sort order, like the admin list. */
export const getTrackCatalog = () => api.get<TrackCatalogItem[]>("/api/v1/public/tracks");

export const createTrack = (body: TrackInput & { code: string }) => api.post<AdminTrack>("/api/v1/admin/tracks", body);

export const updateTrack = (id: string, body: TrackInput) => api.put<AdminTrack>(`/api/v1/admin/tracks/${id}`, body);

/** Refused (TRACK_IN_USE) while the track has students or content. */
export const deleteTrack = (id: string) => api.delete<void>(`/api/v1/admin/tracks/${id}`);

/** The icon keys the seeded tracks use (lucide names). */
export const TRACK_ICON_KEYS = ["monitor", "server", "pen-tool", "smartphone", "brain", "bug", "bar-chart", "gamepad"] as const;
