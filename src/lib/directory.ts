import { useSyncExternalStore } from "react";
import { listApplications } from "@/lib/applications";

export type UserRole = "admin" | "student";

export type Enrollment = {
  courseId: string;
  paid: number;
};

export type DirectoryUser = {
  name: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  enrollments: Enrollment[];
  password?: string;
};

const ADMIN_PHONE = "8248942219";

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

export function parsePrice(value: string) {
  const n = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

const STORAGE_KEY = "vibuthar.users";
const EVENT = "vibuthar-users";

const seed: DirectoryUser[] = [
  {
    name: "Admin",
    phone: ADMIN_PHONE,
    role: "admin",
    createdAt: "2026-01-10T00:00:00.000Z",
    enrollments: [],
  },
  {
    name: "M. Lakshmi",
    phone: "9876543210",
    role: "student",
    createdAt: "2026-08-22T10:15:00.000Z",
    enrollments: [
      { courseId: "tnpsc-group-2-4", paid: 64000 },
      { courseId: "tamil-amudhu-test-batch", paid: 22000 },
    ],
  },
  {
    name: "S. Karthik",
    phone: "9443311220",
    role: "student",
    createdAt: "2026-08-25T14:40:00.000Z",
    enrollments: [{ courseId: "tn-tet", paid: 42000 }],
  },
  {
    name: "A. Priya",
    phone: "9003123456",
    role: "student",
    createdAt: "2026-08-28T09:05:00.000Z",
    enrollments: [{ courseId: "tnusrb-police", paid: 28000 }],
  },
];

let cache: DirectoryUser[] | null = null;
let cacheKey = "";

function emit() {
  cache = null;
  cacheKey = "";
  window.dispatchEvent(new Event(EVENT));
}

function write(users: DirectoryUser[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  emit();
}

function mergeEnrollments(...lists: (Enrollment[] | undefined)[]) {
  const byCourse = new Map<string, Enrollment>();
  for (const list of lists) {
    for (const item of list ?? []) {
      if (!item.courseId) continue;
      byCourse.set(item.courseId, { courseId: item.courseId, paid: Number(item.paid) || 0 });
    }
  }
  return [...byCourse.values()];
}

function read(): DirectoryUser[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fromApps = listApplications().map((app) => ({
        name: app.name,
        phone: normalizePhone(app.phone),
        role: "student" as const,
        createdAt: app.createdAt,
        enrollments: [] as Enrollment[],
      }));
      const merged = mergeUsers([...seed, ...fromApps]);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    const parsed = JSON.parse(raw) as DirectoryUser[];
    return Array.isArray(parsed) ? mergeUsers([...seed, ...parsed]) : seed;
  } catch {
    return seed;
  }
}

function mergeUsers(users: DirectoryUser[]) {
  const byPhone = new Map<string, DirectoryUser>();
  for (const user of users) {
    const phone = normalizePhone(user.phone);
    if (!phone) continue;
    const role: UserRole = phone === ADMIN_PHONE ? "admin" : user.role === "admin" ? "admin" : "student";
    const prev = byPhone.get(phone);
    byPhone.set(phone, {
      name: user.name.trim() || prev?.name || "Aspirant",
      phone,
      role,
      createdAt: prev?.createdAt ?? user.createdAt ?? new Date().toISOString(),
      enrollments: mergeEnrollments(prev?.enrollments, user.enrollments),
      password: user.password || prev?.password,
    });
  }
  return [...byPhone.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUsersSnapshot(): DirectoryUser[] {
  const users = read();
  const key = JSON.stringify(users);
  if (cache && cacheKey === key) return cache;
  cache = users;
  cacheKey = key;
  return users;
}

export function subscribeUsers(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function findUser(phone: string) {
  const normalized = normalizePhone(phone);
  return getUsersSnapshot().find((u) => u.phone === normalized);
}

export function upsertUser(input: {
  name: string;
  phone: string;
  role?: UserRole;
  enrollments?: Enrollment[];
  password?: string;
}): DirectoryUser {
  const phone = normalizePhone(input.phone);
  const existing = findUser(phone);
  const next: DirectoryUser = {
    name: input.name.trim() || existing?.name || "Aspirant",
    phone,
    role: phone === ADMIN_PHONE ? "admin" : (input.role ?? existing?.role ?? "student"),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    enrollments: mergeEnrollments(existing?.enrollments, input.enrollments),
    password: input.password || existing?.password,
  };
  write(mergeUsers([next, ...read()]));
  return next;
}

export function setUserPassword(phone: string, password: string) {
  const existing = findUser(phone);
  if (!existing) {
    throw new Error("No account found for this mobile number.");
  }
  return upsertUser({ ...existing, password });
}

export function verifyUserPassword(phone: string, password: string) {
  const user = findUser(phone);
  if (!user?.password) return password.length >= 4;
  return user.password === password;
}

export function enrollUser(phone: string, courseId: string, paid: number) {
  const existing = findUser(phone);
  if (!existing) return;
  return upsertUser({
    ...existing,
    enrollments: mergeEnrollments(existing.enrollments, [{ courseId, paid }]),
  });
}

export function useUsers() {
  return useSyncExternalStore(subscribeUsers, getUsersSnapshot, () => seed);
}

export function addUser(input: { name: string; phone: string; role: UserRole }) {
  const phone = normalizePhone(input.phone);
  if (findUser(phone)) {
    throw new Error("A user with this mobile number already exists.");
  }
  return upsertUser(input);
}
