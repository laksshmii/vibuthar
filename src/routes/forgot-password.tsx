import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { ArrowRight, Lock, Phone } from "lucide-react";
import { isValidPhone, normalizePhone } from "@/lib/auth";
import { forgotPassword, resetPassword } from "@/lib/api";
import { Eyebrow } from "@/components/section";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password | Vibuthar Academy" },
      {
        name: "description",
        content: "Reset your Vibuthar student password with your registered mobile number.",
      },
      { property: "og:title", content: "Forgot password | Vibuthar Academy" },
      {
        property: "og:description",
        content: "Enter your mobile number and set a new password.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"phone" | "password">("phone");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onPhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPhone(phone)) {
      setError("Enter the 10-digit mobile number on your account.");
      return;
    }
    setError("");
    setPending(true);
    try {
      await forgotPassword(normalizePhone(phone));
      setStep("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start password reset.");
    } finally {
      setPending(false);
    }
  }

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 4) {
      setError("New password must be at least 4 characters.");
      return;
    }
    if (password !== confirm) {
      setError("New password and confirmation do not match.");
      return;
    }
    setError("");
    setPending(true);
    try {
      await resetPassword(normalizePhone(phone), password);
      navigate({ to: "/login" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset this password.");
    } finally {
      setPending(false);
    }
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
          <h1 className="mt-5 text-4xl">Forgot password?</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {step === "phone"
              ? "Enter the 10-digit mobile number on your account."
              : `Set a new password for +91 ${normalizePhone(phone)}.`}
          </p>
        </div>

        {step === "phone" ? (
          <form
            onSubmit={onPhoneSubmit}
            className="mt-8 rounded-3xl border border-border bg-card p-7 shadow-float"
          >
            <label className="block text-sm font-medium" htmlFor="reset-phone">
              Mobile number
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-full border border-border bg-background px-4 py-3 focus-within:ring-2 focus-within:ring-ring">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">+91</span>
              <input
                id="reset-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={14}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Enter 10 digit mobile number"
              />
            </div>

            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="group mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
            >
              {pending ? "Checking…" : "Continue"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        ) : (
          <form
            onSubmit={onPasswordSubmit}
            className="mt-8 rounded-3xl border border-border bg-card p-7 shadow-float"
          >
            <label className="block text-sm font-medium" htmlFor="new-password">
              New password
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-full border border-border bg-background px-4 py-3 focus-within:ring-2 focus-within:ring-ring">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Enter new password"
              />
            </div>

            <label className="mt-5 block text-sm font-medium" htmlFor="confirm-password">
              Confirm password
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-full border border-border bg-background px-4 py-3 focus-within:ring-2 focus-within:ring-ring">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Re-enter new password"
              />
            </div>

            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="group mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
            >
              {pending ? "Saving…" : "Submit"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setPassword("");
                setConfirm("");
                setError("");
              }}
              className="mt-4 w-full text-center text-sm font-semibold text-chocolate underline-offset-4 hover:underline"
            >
              Use a different number
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link to="/login" className="font-semibold text-chocolate underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
