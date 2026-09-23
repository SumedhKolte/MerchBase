import type { Session } from "@/types/auth";
import { SESSION_TTL_MINUTES, TOKEN_COOKIE } from "./constants";
import { createStore } from "./createStore";

const USER_STORAGE_KEY = "mb_user";

function readCookie(name: string): string | null {
  const match = document.cookie.split("; ").find((entry) => entry.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  const token = readCookie(TOKEN_COOKIE);
  const rawUser = localStorage.getItem(USER_STORAGE_KEY);
  if (!token || !rawUser) return null;
  try {
    return { token, user: JSON.parse(rawUser) };
  } catch {
    return null;
  }
}

function saveSession(session: Session | null) {
  if (session) {
    writeCookie(TOKEN_COOKIE, session.token, SESSION_TTL_MINUTES * 60);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user));
  } else {
    writeCookie(TOKEN_COOKIE, "", 0);
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

/** Single source of truth for the session — read by AuthContext and the Axios interceptors. */
export const sessionStore = createStore<Session | null>({
  load: loadSession,
  save: saveSession,
});
