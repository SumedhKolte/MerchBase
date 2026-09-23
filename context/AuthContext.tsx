"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { sessionStore } from "@/lib/session";
import { login as loginRequest } from "@/services/authService";
import type { AuthUser, Session } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  /** True until the session has been restored from browser storage. */
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** The server can't see browser storage, so it renders the "still loading" state. */
const getServerSnapshot = (): Session | null | undefined => undefined;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const session = useSyncExternalStore<Session | null | undefined>(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
    getServerSnapshot,
  );

  const login = useCallback(async (username: string, password: string) => {
    const { accessToken, id, email, firstName, lastName, image } = await loginRequest(
      username,
      password,
    );
    sessionStore.setState({
      token: accessToken,
      user: { id, username, email, firstName, lastName, image },
    });
  }, []);

  const logout = useCallback(() => {
    sessionStore.setState(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session),
      isLoading: session === undefined,
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within <AuthProvider>");
  return context;
}
