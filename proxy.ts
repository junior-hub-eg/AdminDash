import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_COOKIE, decodeToken, isTokenExpired } from "@/lib/auth/token";

/**
 * Route guard for the admin dashboard (its own app since 26 Oct 2026).
 *
 * Reads the backend JWT from the `jh_token` cookie (written by lib/auth/token.ts on login) and checks its
 * expiry and role claim. The signature is NOT verified here — this is only routing UX; every API call is
 * still authorised by the .NET backend, which does verify it.
 *
 * Every page needs a signed-in admin, except the sign-in page; a signed-in admin who opens it goes to the dashboard.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = readIsAdmin(request);

  if (pathname === ADMIN_LOGIN) {
    return isAdmin ? NextResponse.redirect(new URL(ADMIN_HOME, request.url)) : NextResponse.next();
  }
  if (!isAdmin) return NextResponse.redirect(new URL(ADMIN_LOGIN, request.url));
  if (pathname === "/") return NextResponse.redirect(new URL(ADMIN_HOME, request.url));
  return NextResponse.next();
}

const ADMIN_LOGIN = "/admin/login";
const ADMIN_HOME = "/admin/dashboard";

function readIsAdmin(request: NextRequest): boolean {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) return false;
  const claims = decodeToken(token);
  return !!claims?.sub && !isTokenExpired(claims) && claims.role === "Admin";
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
