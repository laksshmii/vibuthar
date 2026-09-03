import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearAuthToken, deviceInfo, loginAccount, registerAccount, writeAuthToken } from "@/lib/api";
import { findUser, upsertUser } from "@/lib/directory";

export type UserRole = "admin" | "student";
export type User = { name: string; phone: string; role: UserRole };

type AuthValue = {
  user: User | null;
  ready: boolean;
  login: (phone: string, password: string) => Promise<User>;
  signup: (name: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
};

/** Office mobile — signing in with this number opens the admin desk. */
export const ADMIN_PHONE = "8248942219";

const STORAGE_KEY = "vibuthar.mock.user";

const AuthContext = createContext<AuthValue | null>(null);

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

export function isValidPhone(phone: string) {
  return normalizePhone(phone).length === 10;
}

export function isAdminPhone(phone: string) {
  return normalizePhone(phone) === ADMIN_PHONE;
}

export function homeFor(user: User) {
  return user.role === "admin" ? "/admin" : "/library";
}

function toUser(name: string, phone: string, roleHint?: string): User {
  const normalized = normalizePhone(phone);
  const existing = findUser(normalized);
  const remoteAdmin = roleHint?.toUpperCase() === "ADMIN";
  const admin = normalized === ADMIN_PHONE || existing?.role === "admin" || remoteAdmin;
  return {
    name: existing?.name || (admin ? "Admin" : name.trim() || "Aspirant"),
    phone: normalized,
    role: admin ? "admin" : "student",
  };
}

function readStoredUser(): User | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { name?: string; phone?: string };
    if (!parsed.phone) return null;
    return toUser(parsed.name ?? "Aspirant", parsed.phone);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(readStoredUser());
    setReady(true);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      ready,
      login: async (phone: string, password: string) => {
        const remote = await loginAccount({
          identifier: normalizePhone(phone),
          password,
          deviceInfo: deviceInfo(),
        });
        const next = toUser(remote.name || "Aspirant", remote.phone || phone, remote.role);
        upsertUser({ ...next, password });
        writeAuthToken(remote.token);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setUser(next);
        return next;
      },
      signup: async (name: string, phone: string, password: string) => {
        const remote = await registerAccount({
          name: name.trim(),
          phone: normalizePhone(phone),
          password,
        });
        const next = toUser(remote.name || name, remote.phone || phone, remote.role);
        upsertUser({ ...next, password });
      },
      logout: () => {
        window.localStorage.removeItem(STORAGE_KEY);
        clearAuthToken();
        setUser(null);
      },
    }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
