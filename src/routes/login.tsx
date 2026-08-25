import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, Lock, Phone } from "lucide-react";
import { useAuth, isValidPhone } from "@/lib/auth";
import { Eyebrow } from "@/components/section";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Student Login | Vibuthar Academy" },
      {
        name: "description",
        content:
          "Sign in to your Vibuthar student account to reach the on-demand UPSC video library, mentor notes and evaluated answer scripts.",
      },
      { property: "og:title", content: "Student Login | Vibuthar Academy" },
      {
        property: "og:description",
        content: "Sign in to reach the Vibuthar UPSC video library and mentor notes.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate({ to: "/library", replace: true });
  }, [user, navigate]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPhone(phone) || password.length < 4) {
      setError("Enter a 10-digit mobile number and a password of at least 4 characters.");
      return;
    }
    setError("");
    login(phone);
    navigate({ to: "/library" });
  }

  return (
    <div className="flex min-h-[calc(100vh-8.5rem)] items-center justify-center px-5 py-16 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center">
          <Eyebrow>Student access</Eyebrow>
          <h1 className="mt-5 text-4xl">Welcome back.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your library, notes and evaluated scripts are waiting.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-3xl border border-border bg-card p-7 shadow-float"
        >
          <label className="block text-sm font-medium" htmlFor="phone">
            Mobile number
          </label>
          <div className="mt-2 flex items-center gap-3 rounded-full border border-border bg-background px-4 py-3 focus-within:ring-2 focus-within:ring-ring">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">+91</span>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={14}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="98765 43210"
            />
          </div>

          <label className="mt-5 block text-sm font-medium" htmlFor="password">
            Password
          </label>
          <div className="mt-2 flex items-center gap-3 rounded-full border border-border bg-background px-4 py-3 focus-within:ring-2 focus-within:ring-ring">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            className="group mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
          >
            Enter the library
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Demo access — any 10-digit mobile number and a 4+ character password will sign you in.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="font-semibold text-chocolate underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
