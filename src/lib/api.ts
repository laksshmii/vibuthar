const TOKEN_KEY = "vibuthar.auth.token";

export function apiBaseUrl() {
  return String(import.meta.env["VITE_API_BASE_URL"] ?? "").replace(/\/$/, "");
}

export function apiUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = apiBaseUrl();
  return base ? `${base}${normalized}` : normalized;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function readBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorMessage(body: unknown, fallback: string) {
  if (typeof body === "string" && body.trim()) return body;
  if (!body || typeof body !== "object") return fallback;
  const value = body as Record<string, unknown>;
  for (const key of ["message", "error", "msg"] as const) {
    const item = value[key];
    if (typeof item === "string" && item.trim()) return item;
  }
  return fallback;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

export type RegisterRequest = {
  name: string;
  phone: string;
  password: string;
};

export type LoginRequest = {
  identifier: string;
  password: string;
  deviceInfo: string;
};

export type AuthApiUser = {
  name?: string;
  phone?: string;
  role?: string;
  token?: string;
};

export function pickAuthUser(body: unknown): AuthApiUser {
  const root = asRecord(body);
  const data = asRecord(root?.["data"]) ?? root;
  const user = asRecord(data?.["user"]) ?? data;
  if (!user) return {};

  const tokenValue = data?.["token"] ?? data?.["accessToken"] ?? root?.["token"] ?? root?.["accessToken"];
  const name = user["name"];
  const phone = user["phone"];
  const role = user["role"];

  return {
    ...(typeof name === "string" ? { name } : {}),
    ...(typeof phone === "string" ? { phone } : {}),
    ...(typeof role === "string" ? { role } : {}),
    ...(typeof tokenValue === "string" ? { token: tokenValue } : {}),
  };
}

export function readAuthToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function writeAuthToken(token?: string) {
  if (!token) return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function deviceInfo() {
  if (typeof navigator === "undefined") return "Unknown device";
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Browser";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Mac OS X|Macintosh/.test(ua)
      ? "macOS"
      : /Android/.test(ua)
        ? "Android"
        : /iPhone|iPad|iPod/.test(ua)
          ? "iOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "Unknown";
  return `${browser} on ${os}`;
}

async function postAuth(path: string, payload: unknown, fallbackError: string) {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const body = await readBody(res);
  if (!res.ok) {
    throw new ApiError(errorMessage(body, fallbackError), res.status);
  }
  return pickAuthUser(body);
}

export async function registerAccount(payload: RegisterRequest) {
  return postAuth("/api/auth/register", payload, "Could not create this account.");
}

export async function loginAccount(payload: LoginRequest) {
  return postAuth("/api/auth/login", payload, "Could not sign in with these details.");
}
