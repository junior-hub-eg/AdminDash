/**
 * JWT access token storage for the real backend (lib/auth/api-auth.ts).
 *
 * The token lives in localStorage (read by lib/api-client.ts for the Bearer
 * header) and is mirrored into the `jh_token` cookie so proxy.ts can guard
 * routes on the server. The cookie expires together with the token.
 */
const TOKEN_KEY = "jh_token";
export const TOKEN_COOKIE = "jh_token";

/** Fired on window whenever the token is set or cleared, so the signed-in state re-renders. */
export const TOKEN_CHANGE_EVENT = "jh-token-change";

export interface TokenClaims {
  sub?: string;
  exp?: number;
  role?: string;
  [key: string]: unknown;
}

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

/** Decodes the JWT payload without verifying the signature (the backend does that). */
export function decodeToken(token: string): TokenClaims | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const json = decodeURIComponent(
      Array.from(atob(base64), (c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`).join("")
    );
    const claims = JSON.parse(json) as TokenClaims;
    const role = claims.role ?? claims[ROLE_CLAIM];
    return { ...claims, role: typeof role === "string" ? role : undefined };
  } catch {
    return null;
  }
}

export function isTokenExpired(claims: TokenClaims): boolean {
  return typeof claims.exp === "number" && claims.exp * 1000 <= Date.now();
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = window.localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const claims = decodeToken(token);
  return claims && !isTokenExpired(claims) ? token : null;
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
    const exp = decodeToken(token)?.exp;
    const maxAge = exp ? Math.max(0, Math.floor(exp - Date.now() / 1000)) : 60 * 60;
    document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${maxAge}; samesite=lax${secure}`;
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; samesite=lax${secure}`;
  }
  window.dispatchEvent(new Event(TOKEN_CHANGE_EVENT));
}
