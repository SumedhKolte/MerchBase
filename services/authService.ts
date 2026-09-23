import { SESSION_TTL_MINUTES } from "@/lib/constants";
import type { LoginResponse } from "@/types/auth";
import { api } from "./api";

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", {
    username,
    password,
    expiresInMins: SESSION_TTL_MINUTES,
  });
  return data;
}
