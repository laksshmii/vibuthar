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

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const rec = asRecord(value);
  if (!rec) return [];
  const data = asRecord(rec["data"]);
  if (Array.isArray(data?.["items"])) return data["items"] as unknown[];
  if (Array.isArray(rec["items"])) return rec["items"] as unknown[];
  for (const key of ["data", "content", "members", "users", "items", "results", "list", "courses"]) {
    const item = rec[key];
    if (Array.isArray(item)) return item;
    const nested = asRecord(item);
    if (!nested) continue;
    for (const inner of [
      "data",
      "content",
      "members",
      "users",
      "items",
      "results",
      "list",
      "subscribed",
      "nonSubscribed",
      "subscribedMembers",
      "nonSubscribedMembers",
      "courses",
    ]) {
      if (Array.isArray(nested[inner])) return nested[inner] as unknown[];
    }
  }
  return [];
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function pickNumber(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const n = Number(value.replace(/[^0-9.-]/g, ""));
      if (Number.isFinite(n)) return n;
    }
  }
  return 0;
}

function formatPrefixedId(prefix: string, ...values: unknown[]) {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const text = pickString(value);
    if (!text) continue;
    if (text.toUpperCase().startsWith(prefix)) return text;
    if (/^\d+$/.test(text)) return `${prefix}${text.padStart(6, "0")}`;
    return text;
  }
  return "";
}

function pickCreatedAt(rec: Record<string, unknown>) {
  const raw = rec["createdAt"] ?? rec["created_at"] ?? rec["registeredAt"] ?? rec["joinedAt"] ?? rec["createdOn"];
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return new Date(raw > 1e12 ? raw : raw * 1000).toISOString();
  }
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return "";
}

function pickEnrollments(rec: Record<string, unknown>): AdminMemberEnrollment[] {
  const lists = [
    rec["enrollments"],
    rec["courses"],
    rec["subscriptions"],
    rec["subscribedCourses"],
    rec["paidCourses"],
    rec["coursePayments"],
  ];
  const out: AdminMemberEnrollment[] = [];
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (typeof item === "string" && item.trim()) {
        const courseId = formatPrefixedId("CRS", item) || item.trim();
        out.push({ courseId, title: item.trim(), paid: 0 });
        continue;
      }
      const row = asRecord(item);
      if (!row) continue;
      const title = pickString(row["title"], row["courseName"], row["courseTitle"], row["name"], row["shortTitle"]);
      const courseId =
        formatPrefixedId("CRS", row["courseId"], row["course_id"], row["id"]) || title;
      if (!courseId) continue;
      const paid = Number(row["paid"] ?? row["amount"] ?? row["fee"] ?? row["price"] ?? 0) || 0;
      out.push({
        courseId,
        title: title || courseId,
        shortTitle: pickString(row["shortTitle"], row["short_title"]) || undefined,
        paid,
      });
    }
  }
  return out;
}

function pickMember(raw: unknown): AdminMember | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const user = asRecord(rec["user"]) ?? rec;
  const phone = pickString(
    user["phone"],
    user["mobile"],
    user["mobileNumber"],
    user["phoneNumber"],
    user["identifier"],
  ).replace(/\D/g, "").slice(-10);
  const studentId = formatPrefixedId(
    "STU",
    user["userId"],
    rec["userId"],
    user["studentId"],
    rec["studentId"],
    user["id"],
    rec["id"],
  );
  const id = studentId || pickString(user["id"], rec["id"], phone);
  const name = pickString(user["name"], user["fullName"], user["username"]) || "Aspirant";
  if (!id && !phone && name === "Aspirant") return null;
  const roleRaw = pickString(user["role"]).toLowerCase();
  return {
    id: id || phone || name,
    studentId: studentId || id || phone || name,
    name,
    phone: phone || "—",
    role: roleRaw === "admin" ? "admin" : "student",
    createdAt: pickCreatedAt(user) || pickCreatedAt(rec),
    enrollments: pickEnrollments(user),
  };
}

function pickMembers(body: unknown): AdminMember[] {
  return asArray(body)
    .map(pickMember)
    .filter((member): member is AdminMember => Boolean(member));
}

function pickCourse(raw: unknown): AdminCourse | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const course = asRecord(rec["course"]) ?? rec;
  const title = pickString(course["title"], course["name"]);
  const id =
    formatPrefixedId("CRS", course["courseId"], rec["courseId"], course["code"], rec["code"], course["id"], rec["id"]) ||
    title;
  if (!id && !title) return null;
  return {
    id: id || title,
    title: title || "Course",
    description: pickString(course["description"], course["blurb"], course["details"]),
    durationHours: pickNumber(
      course["durationHours"],
      course["duration_hours"],
      course["hours"],
      course["duration"],
    ),
    price: pickNumber(course["price"], course["fee"], course["amount"]),
    status: pickString(course["status"]) || "ACTIVE",
    thumbnailUrl: pickString(
      course["thumbnailUrl"],
      course["thumbnail_url"],
      course["thumbnail"],
      course["imageUrl"],
      course["image"],
    ),
  };
}

function pickCourses(body: unknown): AdminCourse[] {
  return asArray(body)
    .map(pickCourse)
    .filter((course): course is AdminCourse => Boolean(course));
}

function authHeaders(): HeadersInit {
  const token = typeof window === "undefined" ? null : readAuthToken();
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path: string, init: RequestInit, fallbackError: string) {
  const headers = new Headers(authHeaders());
  if (init.headers) {
    new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  }
  const res = await fetch(apiUrl(path), { cache: "no-store", ...init, headers });
  const body = await readBody(res);
  if (!res.ok) {
    throw new ApiError(errorMessage(body, fallbackError), res.status);
  }
  return body;
}

async function postJson(path: string, payload: unknown, fallbackError: string) {
  return request(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    fallbackError,
  );
}

export type MemberListKind = "subscribed" | "non-subscribed";

export type AdminMemberEnrollment = {
  courseId: string;
  title: string;
  shortTitle?: string;
  paid: number;
};

export type AdminMember = {
  id: string;
  studentId: string;
  name: string;
  phone: string;
  role: "admin" | "student";
  createdAt: string;
  enrollments: AdminMemberEnrollment[];
};

export type AdminCourse = {
  id: string;
  title: string;
  description: string;
  durationHours: number;
  price: number;
  status: string;
  thumbnailUrl: string;
};

export type CreateAdminCourseInput = {
  title: string;
  description: string;
  durationHours: number;
  price: number;
  status: string;
  thumbnailUrl: string;
};

export type CreateAdminSubscriptionInput = {
  studentId: string;
  courseId: string;
  expiresAt: string | null;
  paymentType: "UPI" | "CASH";
  paymentStatus: "PAID" | "NOT_PAID" | "PARTIAL";
  amount: number;
};

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
  userId?: string;
  subscribedCourses?: SubscribedCourse[];
};

export type SubscribedCourse = {
  courseId: string;
  title: string;
  subscribedAt?: string;
};

function pickSubscribedCourses(user: Record<string, unknown>): SubscribedCourse[] {
  const list = user["subscribedCourses"];
  if (!Array.isArray(list)) return [];
  const out: SubscribedCourse[] = [];
  for (const item of list) {
    const row = asRecord(item);
    if (!row) continue;
    const courseId = pickString(row["courseId"], row["course_id"], row["id"]);
    const title = pickString(row["title"], row["courseTitle"], row["name"], courseId);
    if (!courseId && !title) continue;
    out.push({
      courseId: courseId || title,
      title: title || courseId,
      ...(pickString(row["subscribedAt"]) ? { subscribedAt: pickString(row["subscribedAt"]) } : {}),
    });
  }
  return out;
}

export function pickAuthUser(body: unknown): AuthApiUser {
  const root = asRecord(body);
  const data = asRecord(root?.["data"]) ?? root;
  const user = asRecord(data?.["user"]) ?? data;
  if (!user) return {};

  const tokenValue = data?.["token"] ?? data?.["accessToken"] ?? root?.["token"] ?? root?.["accessToken"];
  const name = user["name"];
  const phone = user["phone"];
  const role = user["role"];
  const userId = pickString(user["userId"], data?.["userId"], user["id"]);
  const subscribedCourses = pickSubscribedCourses(user);

  return {
    ...(typeof name === "string" ? { name } : {}),
    ...(typeof phone === "string" ? { phone } : {}),
    ...(typeof role === "string" ? { role } : {}),
    ...(typeof tokenValue === "string" ? { token: tokenValue } : {}),
    ...(userId ? { userId } : {}),
    ...(subscribedCourses.length ? { subscribedCourses } : {}),
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

async function postAuthJson(path: string, payload: unknown, fallbackError: string) {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    cache: "no-store",
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
  return body;
}

async function postAuth(path: string, payload: unknown, fallbackError: string) {
  return pickAuthUser(await postAuthJson(path, payload, fallbackError));
}

export async function registerAccount(payload: RegisterRequest) {
  return postAuth("/api/auth/register", payload, "Could not create this account.");
}

export async function loginAccount(payload: LoginRequest) {
  return postAuth("/api/auth/login", payload, "Could not sign in with these details.");
}

export async function forgotPassword(phone: string) {
  await postAuthJson("/api/auth/forgot-password", { phone }, "Could not start password reset.");
}

export async function resetPassword(phone: string, newPassword: string) {
  await postAuthJson(
    "/api/auth/reset-password",
    { phone, newPassword },
    "Could not reset this password.",
  );
}

export async function listAdminMembers(kind: MemberListKind) {
  const path =
    kind === "subscribed" ? "/api/admin/members/subscribed" : "/api/admin/members/non-subscribed";
  const body = await request(
    `${path}${path.includes("?") ? "&" : "?"}_=${Date.now()}`,
    { method: "GET" },
    "Could not load members.",
  );
  return pickMembers(body);
}

export async function listAdminCourses() {
  const body = await request("/api/admin/courses", { method: "GET" }, "Could not load courses.");
  return pickCourses(body);
}

export async function createAdminCourse(input: CreateAdminCourseInput) {
  const payload = {
    title: input.title,
    description: input.description,
    durationHours: input.durationHours,
    price: input.price,
    status: input.status,
    thumbnailUrl: input.thumbnailUrl,
  };
  const body = await postJson("/api/admin/courses", payload, "Could not create this course.");
  const rec = asRecord(body);
  const nested = rec ? (asRecord(rec["data"]) ?? rec) : body;
  return (
    pickCourse(nested) ??
    pickCourses(body)[0] ?? {
      id: pickString(asRecord(nested)?.["id"], input.title) || input.title,
      title: input.title,
      description: input.description,
      durationHours: input.durationHours,
      price: input.price,
      status: input.status,
      thumbnailUrl: input.thumbnailUrl,
    }
  );
}

export async function createAdminSubscription(input: CreateAdminSubscriptionInput) {
  return postJson(
    "/api/admin/subscriptions",
    {
      studentId: input.studentId,
      courseId: input.courseId,
      expiresAt: input.expiresAt,
      paymentType: input.paymentType,
      paymentStatus: input.paymentStatus,
      amount: input.amount,
    },
    "Could not add this subscription.",
  );
}
