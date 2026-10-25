import { tk } from "@/lib/i18n/translate";
/**
 * The cartoon avatars. A student picks one of the young characters and one of its faces; the backend
 * (PUT /api/v1/me/avatar) accepts these keys only and stores the image path as the student's photoUrl.
 * Mentors use the grown-up characters. Files come from scripts/build-avatars.mjs.
 */
export interface Avatar {
  /** "{character}-{emotion}", e.g. "girl-1-strong". */
  key: string;
  character: string;
  emotion: string;
  /** Alt text / button label, e.g. "Girl with an orange cap, strong". */
  label: string;
  src: string;
  /** Circle colour behind the transparent character. */
  bg: string;
}

/** Boy or girl, as the backend stores it. */
export type Gender = "Male" | "Female";

interface Character {
  id: string;
  gender: Gender;
  label: string;
  bg: string;
}

/** The young characters students choose from (same ids as the backend's ChangeAvatarHandler). */
export const CHARACTERS: Character[] = [
  { id: "boy-1", gender: "Male", label: tk("Boy with a purple cap"), bg: "#ffc107" },
  { id: "boy-2", gender: "Male", label: tk("Boy with a blue cap"), bg: "#ffb38a" },
  { id: "boy-3", gender: "Male", label: tk("Boy with brown hair"), bg: "#9ad9c8" },
  { id: "boy-4", gender: "Male", label: tk("Boy in a dark jacket"), bg: "#8fd3ff" },
  { id: "girl-1", gender: "Female", label: tk("Girl with an orange cap"), bg: "#bde4ff" },
  { id: "girl-2", gender: "Female", label: tk("Girl with a purple cap"), bg: "#ffe0a3" },
  { id: "girl-3", gender: "Female", label: tk("Girl in a yellow hoodie"), bg: "#c9b8f5" },
  { id: "girl-4", gender: "Female", label: tk("Girl in a mustard hoodie"), bg: "#f7b2b0" },
];

/** Every character has each of these faces, happiest first. */
export const EMOTIONS: { id: string; label: string }[] = [
  { id: "smile", label: tk("Smile") },
  { id: "happy", label: tk("Happy") },
  { id: "laughs", label: tk("Laughing") },
  { id: "good", label: tk("Thumbs up") },
  { id: "ok", label: tk("OK") },
  { id: "in-love", label: tk("Heart") },
  { id: "reading", label: tk("Reading") },
  { id: "thinking", label: tk("Thinking") },
  { id: "listening", label: tk("Music") },
  { id: "texting", label: tk("Texting") },
  { id: "strong", label: tk("Strong") },
  { id: "surprised", label: tk("Surprised") },
  { id: "neutral", label: tk("Calm") },
  { id: "sad", label: tk("Sad") },
  { id: "scared", label: tk("Scared") },
  { id: "crying", label: tk("Crying") },
];

export const DEFAULT_EMOTION = "smile";

export const AVATARS: Avatar[] = CHARACTERS.flatMap((c) =>
  EMOTIONS.map((e) => ({
    key: `${c.id}-${e.id}`,
    character: c.id,
    emotion: e.id,
    label: `${c.label}, ${e.label.toLowerCase()}`,
    src: `/images/avatars/${c.id}-${e.id}.webp`,
    bg: c.bg,
  })),
);

const BY_KEY = new Map(AVATARS.map((a) => [a.key, a]));
const BY_SRC = new Map(AVATARS.map((a) => [a.src, a]));

/** A character's face, e.g. avatarOf("girl-1", "strong"). */
export function avatarOf(character: string, emotion = DEFAULT_EMOTION): Avatar {
  return BY_KEY.get(`${character}-${emotion}`) ?? AVATARS[0];
}

/** The characters a student of this gender can pick; all of them while the gender is not known. */
export function charactersFor(gender: Gender | null | undefined): Character[] {
  return gender ? CHARACTERS.filter((c) => c.gender === gender) : CHARACTERS;
}

/** The sign-up choices, each with the avatar it starts with (same as the backend's default). */
export const GENDERS: { id: Gender; label: string; avatar: Avatar }[] = [
  { id: "Male", label: tk("Boy"), avatar: avatarOf("boy-1") },
  { id: "Female", label: tk("Girl"), avatar: avatarOf("girl-1") },
];

/** Smiling faces, boys and girls mixed, used when a student has not chosen one yet. */
export const DEFAULT_AVATARS: Avatar[] = CHARACTERS.slice(0, 4).flatMap((boy, i) => [
  avatarOf(boy.id),
  avatarOf(CHARACTERS[i + 4].id),
]);

/** Paths saved by the first catalogue, mapped to the same character in the new pack. */
const LEGACY: Record<string, string> = {
  "/images/avatars/boy-laughing.png": "boy-1-laughs",
  "/images/avatars/boy-reading.png": "boy-1-reading",
  "/images/avatars/boy-thinking.png": "boy-1-thinking",
  "/images/avatars/boy-blue-cap.png": "boy-2-neutral",
  "/images/avatars/girl-orange.png": "girl-1-neutral",
  "/images/avatars/girl-dumbbells.png": "girl-1-strong",
  "/images/avatars/girl-purple-cap.png": "girl-2-smile",
};

/** The catalogue avatar for a stored photoUrl, if it is one. */
export function catalogueAvatar(photoUrl: string | null | undefined): Avatar | undefined {
  if (!photoUrl) return undefined;
  return BY_SRC.get(photoUrl) ?? BY_KEY.get(LEGACY[photoUrl] ?? "");
}

/**
 * The avatar to draw: the chosen one, or a default. With a gender, the default is that gender's;
 * otherwise it is picked by position so a list looks varied.
 */
export function avatarOrDefault(photoUrl: string | null | undefined, index = 0, gender?: Gender | null): Avatar {
  const chosen = catalogueAvatar(photoUrl);
  if (chosen) return chosen;
  // An unknown gender (an old cached profile) falls back to the default instead of breaking the page.
  const byGender = gender ? GENDERS.find((g) => g.id === gender)?.avatar : undefined;
  if (byGender) return byGender;
  return DEFAULT_AVATARS[((index % DEFAULT_AVATARS.length) + DEFAULT_AVATARS.length) % DEFAULT_AVATARS.length];
}

/** Grown-up characters for mentors (no photos uploaded yet), always smiling. */
export const MENTOR_AVATARS: { src: string; bg: string }[] = [
  "man-1", "woman-1", "man-2", "woman-2", "man-3", "woman-3", "man-4", "woman-4",
  "man-5", "woman-5", "man-6", "woman-6", "man-7", "woman-7", "man-8", "woman-8",
].map((id, i) => ({
  src: `/images/avatars/mentors/${id}.webp`,
  bg: ["#dbeafe", "#fde68a", "#c7f0d8", "#fbcfe8", "#e9d5ff", "#fed7aa", "#bae6fd", "#d9f99d"][i % 8],
}));

/**
 * A mentor's grown-up avatar: the one the backend saved for them (it matches the mentor, a man or a woman), else one picked
 * from the id so it is the same everywhere.
 */
export function mentorAvatar(mentor: { id: string; photoUrl?: string | null }) {
  const saved = MENTOR_AVATARS.find((a) => a.src === mentor.photoUrl);
  if (saved) return saved;
  let hash = 0;
  for (const ch of mentor.id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return MENTOR_AVATARS[hash % MENTOR_AVATARS.length];
}
