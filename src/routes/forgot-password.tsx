import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Mail, Phone } from "lucide-react";
import { isValidPhone, normalizePhone } from "@/lib/auth";
import { officeEmail, officePhone } from "@/data/content";
import { Eyebrow } from "@/components/section";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password | Vibuthar Academy" },
      {
        name: "description",
        content:
          "Reset your Vibuthar student password. Enter the mobile number on your account and the academy office will help you get back in.",
      },
      { property: "og:title", content: "Forgot password | Vibuthar Academy" },
      {
        property: "og:description",
        content: "Reset your Vibuthar student password with help from the academy office.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const officeDigits = officePhone.href.replace(/\D/g, "");
  const whatsappHref = `https://wa.me/${officeDigits}?text=${encodeURIComponent(
    `Hello Vibuthar Academy, I forgot the password for the student account on +91 ${normalizePhone(phone) || "__________"}. Please help me reset it.`,
  )}`;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPhone(phone)) {
      setError("Enter the 10-digit mobile number on your account.");
      return;
    }
    setError("");
    setSubmitted(true);
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
          <h1 className="mt-5 text-4xl">{submitted ? "Ask the office." : "Forgot password?"}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {submitted
              ? "Passwords are reset by the academy office, not from this page. Call, WhatsApp or email with the number below."
              : "Enter the mobile number on your account. We will tell you how to get a new password from the office."}
          </p>
        </div>

        {submitted ? (
          <div className="mt-8 rounded-3xl border border-border bg-card p-7 shadow-float">
            <p className="text-sm text-muted-foreground">
              Account on{" "}
              <span className="font-semibold text-foreground">+91 {normalizePhone(phone)}</span>
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <a
                href={officePhone.href}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
              >
                <Phone className="h-4 w-4" /> Call {officePhone.label}
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                WhatsApp the office
              </a>
              <a
                href={officeEmail.href}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                <Mail className="h-4 w-4" /> {officeEmail.label}
              </a>
            </div>
            <Link
              to="/login"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 text-sm font-semibold text-chocolate underline-offset-4 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Back to log in
            </Link>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
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
                placeholder="98765 43210"
              />
            </div>

            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              className="group mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
            >
              Continue
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        )}

        {!submitted && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link to="/login" className="font-semibold text-chocolate underline-offset-4 hover:underline">
              Log in
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
