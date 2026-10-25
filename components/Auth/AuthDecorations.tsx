/**
 * Inline SVG decorations for the auth screens.
 * These shapes were not part of the Figma PNG export, so they are redrawn here.
 * If you export the original SVGs from Figma, just replace the <path>s below.
 */
import type { SVGProps } from "react";

const TEAL = "#12939b";
const NAVY = "#1b2a5c";

type Props = SVGProps<SVGSVGElement>;

/** Wavy line with a loop (top-left of the page). */
export function WaveLoop(props: Props) {
  return (
    <svg viewBox="0 0 70 32" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3 26 C 9 6, 22 3, 28 13 C 33 23, 19 28, 17 18 C 15 8, 36 -1, 49 9 C 57 15, 63 14, 67 8"
        stroke={TEAL}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Vertical spring / curl. */
export function Curl(props: Props) {
  return (
    <svg viewBox="0 0 40 72" fill="none" aria-hidden="true" {...props}>
      <path
        d="M8 4 C 32 8, 36 28, 19 31 C 4 34, 6 18, 21 22 C 35 26, 37 52, 14 68"
        stroke={TEAL}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Square made of parallel navy lines. */
export function HatchedSquare(props: Props) {
  const lines = Array.from({ length: 10 }, (_, i) => i * 2.6 + 1);
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true" {...props}>
      <g stroke={NAVY} strokeWidth="1.5" strokeLinecap="round">
        {lines.map((y) => (
          <line key={y} x1={3 + (y - 1) * 0.15} y1={y + 2} x2={25 - (y - 1) * 0.1} y2={y - 1.5} />
        ))}
      </g>
    </svg>
  );
}

/** Four thin strokes forming an "X" with an open centre. */
export function CrossMark(props: Props) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true" {...props}>
      <g stroke={TEAL} strokeWidth="1.4" strokeLinecap="round">
        <line x1="3" y1="3" x2="10" y2="10" />
        <line x1="25" y1="3" x2="18" y2="10" />
        <line x1="3" y1="25" x2="10" y2="18" />
        <line x1="25" y1="25" x2="18" y2="18" />
      </g>
    </svg>
  );
}
