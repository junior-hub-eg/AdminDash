/**
 * Thin fetch wrapper for the .NET backend (JH-SRS §5) and the AI service.
 * Requests carry the stored JWT (lib/auth/token.ts) as a Bearer token and send cookies, so the
 * "Remember me" refresh cookie reaches /api/v1/auth. When a signed-in request gets 401, the token
 * is refreshed once from that cookie and the request is retried.
 */
import { getToken, setToken } from "@/lib/auth/token";
import { tk, tNow } from "@/lib/i18n/translate";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL ?? "";

/** RFC 7807 ProblemDetails as the backend sends them, with its error `code` (JH-SRS §5.1). */
export interface ProblemDetails {
  title?: string;
  status?: number;
  code?: string;
  /** Field name (camelCase) → messages, for VALIDATION_FAILED. */
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }

  get problem(): ProblemDetails | undefined {
    return this.body && typeof this.body === "object" ? (this.body as ProblemDetails) : undefined;
  }

  get code(): string | undefined {
    return this.problem?.code;
  }

  /** The first message for each field, ready for react-hook-form's setError. */
  get fieldErrors(): Record<string, string> {
    const errors = this.problem?.errors ?? {};
    return Object.fromEntries(Object.entries(errors).map(([field, messages]) => [field, messages[0]]));
  }
}

/**
 * A plain-language message for the student: the backend's title, or a fallback,
 * in the language the page is showing (an unknown backend title stays as sent).
 */
export function errorMessage(error: unknown, fallback = tk("Something went wrong. Please try again.")): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return tNow("We can't reach Junior Hub right now. Check your connection and try again.");
    return tNow(error.problem?.title ?? fallback);
  }
  return tNow(fallback);
}

async function send(baseUrl: string, path: string, options: RequestInit): Promise<Response> {
  const token = getToken();
  try {
    return await fetch(`${baseUrl}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(`Request to ${path} could not be sent`, 0);
  }
}

let refreshing: Promise<boolean> | null = null;

/** Gets a new access token from the refresh cookie. Concurrent callers share one attempt. */
export function refreshAccessToken(): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      const res = await send(API_BASE_URL, "/api/v1/auth/refresh", { method: "POST" });
      if (!res.ok) return false;
      const body = (await res.json()) as { accessToken: string };
      setToken(body.accessToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

async function request<T>(baseUrl: string, path: string, options: RequestInit = {}): Promise<T> {
  if (!baseUrl) {
    throw new ApiError(
      `No API base URL configured for "${path}". Set NEXT_PUBLIC_API_URL / NEXT_PUBLIC_AI_SERVICE_URL.`,
      0
    );
  }

  const hadToken = getToken() !== null;
  let res = await send(baseUrl, path, options);

  // An expired access token: refresh once from the cookie, then retry. Auth endpoints are never retried.
  if (res.status === 401 && hadToken && baseUrl === API_BASE_URL && !path.startsWith("/api/v1/auth/")) {
    if (await refreshAccessToken()) res = await send(baseUrl, path, options);
    else setToken(null);
  }

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      // no JSON body
    }
    throw new ApiError(`Request to ${path} failed with ${res.status}`, res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, options?: RequestInit) => request<T>(API_BASE_URL, path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(API_BASE_URL, path, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(API_BASE_URL, path, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  /** multipart/form-data (the browser sets the boundary). */
  postForm: <T>(path: string, form: FormData, options?: RequestInit) =>
    request<T>(API_BASE_URL, path, { ...options, method: "POST", body: form }),
  patch: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(API_BASE_URL, path, { ...options, method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, options?: RequestInit) => request<T>(API_BASE_URL, path, { ...options, method: "DELETE" }),
};

export const aiApi = {
  get: <T>(path: string, options?: RequestInit) => request<T>(AI_SERVICE_URL, path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(AI_SERVICE_URL, path, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),
};
