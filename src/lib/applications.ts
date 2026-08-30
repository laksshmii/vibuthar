export type Application = {
  id: string;
  name: string;
  phone: string;
  courseId: string;
  attempt: string;
  createdAt: string;
};

const STORAGE_KEY = "vibuthar.applications";

const seed: Application[] = [
  {
    id: "a1",
    name: "M. Lakshmi",
    phone: "9876543210",
    courseId: "tnpsc-group-2-4",
    attempt: "First attempt",
    createdAt: "2026-08-22T10:15:00.000Z",
  },
  {
    id: "a2",
    name: "S. Karthik",
    phone: "9443311220",
    courseId: "tn-tet",
    attempt: "Cleared prelims before",
    createdAt: "2026-08-25T14:40:00.000Z",
  },
  {
    id: "a3",
    name: "A. Priya",
    phone: "9003123456",
    courseId: "tnusrb-police",
    attempt: "First attempt",
    createdAt: "2026-08-28T09:05:00.000Z",
  },
];

function read(): Application[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as Application[];
    return Array.isArray(parsed) ? parsed : seed;
  } catch {
    return seed;
  }
}

export function listApplications(): Application[] {
  return [...read()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveApplication(input: Omit<Application, "id" | "createdAt">) {
  const next: Application = {
    ...input,
    id: `a${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const all = [next, ...read().filter((a) => a.id !== next.id)];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return next;
}
