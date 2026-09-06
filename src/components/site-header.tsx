import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const publicNav = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/about", label: "About" },
  { to: "/library", label: "Library" },
] as const;

export function SiteHeader() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const nav =
    user?.role === "admin"
      ? ([...publicNav, { to: "/admin", label: "Admin" }] as const)
      : publicNav;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-gradient font-serif text-lg text-primary-foreground shadow-gold">
            V
          </span>
          <span className="font-serif text-xl tracking-tight">Vibuthar Academy</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                pathname === item.to && "bg-secondary text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                to="/profile"
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  pathname === "/profile" && "bg-secondary text-foreground",
                )}
              >
                {user.role === "admin" ? "Admin" : user.name}
              </Link>
              <button
                onClick={logout}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-full border border-border p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/60 md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    {user.role === "admin" ? "Admin profile" : "Profile"}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="mt-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="mt-2 rounded-full border border-border px-4 py-2.5 text-center text-sm font-medium"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setOpen(false)}
                    className="rounded-full bg-gold-gradient px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-gold"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
