import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type User = { name: string; phone: string };

type AuthValue = {
  user: User | null;
  ready: boolean;
  login: (phone: string) => void;
  signup: (name: string, phone: string) => void;
  logout: () => void;
};

const STORAGE_KEY = "vibuthar.mock.user";

const AuthContext = createContext<AuthValue | null>(null);

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

export function isValidPhone(phone: string) {
  return normalizePhone(phone).length === 10;
}

function readStoredUser(): User | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
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
      login: (phone: string) => {
        const normalized = normalizePhone(phone);
        const previous = readStoredUser();
        const next = {
          name: previous?.phone === normalized ? previous.name : "Aspirant",
          phone: normalized,
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setUser(next);
      },
      signup: (name: string, phone: string) => {
        const next = { name: name.trim() || "Aspirant", phone: normalizePhone(phone) };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setUser(next);
      },
      logout: () => {
        window.localStorage.removeItem(STORAGE_KEY);
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
