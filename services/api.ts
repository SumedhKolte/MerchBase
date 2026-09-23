import axios, { AxiosError } from "axios";
import { sessionStore } from "@/lib/session";

/** Optional artificial latency (DummyJSON `?delay=`) for demoing race-condition handling. */
const SIMULATED_DELAY_MS = Number(process.env.NEXT_PUBLIC_API_DELAY_MS) || 0;

export const api = axios.create({
  baseURL: "https://dummyjson.com",
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

/** Normalized error every UI surface can render without knowing about Axios. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

api.interceptors.request.use((config) => {
  const token = sessionStore.getSnapshot()?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (SIMULATED_DELAY_MS && config.method === "get") {
    config.params = { ...config.params, delay: SIMULATED_DELAY_MS };
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // Aborted requests are expected (superseded searches) — let callers ignore them.
    if (axios.isCancel(error) || !(error instanceof AxiosError)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const isLoginRequest = error.config?.url?.startsWith("/auth/login");
    if (status === 401 && !isLoginRequest) {
      sessionStore.setState(null);
      // Interceptors live outside React (no router), and a full reload is what we
      // want anyway: it discards every piece of in-memory state from the old session.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/login?reason=expired");
    }

    return Promise.reject(new ApiError(toMessage(error), status));
  },
);

function toMessage(error: AxiosError<{ message?: unknown }>): string {
  const serverMessage = error.response?.data?.message;
  if (typeof serverMessage === "string" && serverMessage) return serverMessage;
  if (error.code === AxiosError.ECONNABORTED) return "The request timed out. Please try again.";
  if (!error.response) return "Network error — check your connection and try again.";
  return `Request failed with status ${error.response.status}.`;
}

export function isAbortError(error: unknown): boolean {
  return axios.isCancel(error);
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}
