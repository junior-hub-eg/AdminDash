"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types";
import * as apiAuth from "@/lib/auth/api-auth";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  /** The admin login page (/admin/login). */
  adminLogin: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useSyncExternalStore(apiAuth.subscribe, apiAuth.getCurrentUserSnapshot, apiAuth.getServerUserSnapshot);

  // "Remember me": sign back in from the refresh cookie when the page opens without a valid token.
  useEffect(() => {
    void apiAuth.restoreSession();
  }, []);

  function login(email: string, password: string, rememberMe?: boolean) {
    return apiAuth.login(email, password, rememberMe);
  }

  function adminLogin(email: string, password: string, rememberMe?: boolean) {
    return apiAuth.adminLogin(email, password, rememberMe);
  }

  function logout() {
    apiAuth.logout();
    router.push("/admin/login");
  }

  return <AuthContext.Provider value={{ user, login, adminLogin, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
