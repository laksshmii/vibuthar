import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, Lock, Phone, User } from "lucide-react";
import { useAuth, isValidPhone, homeFor } from "@/lib/auth";
import { Eyebrow } from "@/components/section";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account | Vibuthar Academy" },
      {
        name: "description",
        content:
          "Create a free Vibuthar account to save courses, track lectures and apply to mentor-led UPSC programmes.",
      },
      { property: "og:title", content: "Create your account | Vibuthar Academy" },
      {
        property: "og:description",
        content: "Create a free Vibuthar account to apply to mentor-led UPSC programmes.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: homeFor(user), replace: true });
  }, [user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Tell us your name so your mentor knows who to greet.");
      return;
    }
    if (!isValidPhone(phone) || password.length < 4) {
      setError("Enter a 10-digit mobile number and a password of at least 4 characters.");
      return;
    }
    setError("");
    setPending(true);
    try {
      await signup(name, phone, password);
      navigate({ to: "/login" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create this account.");
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
          <Eyebrow>Create account</Eyebrow>
          <h1 className="mt-5 text-4xl">Start with us.</h1>
          <p className="mt-2 text-lg font-semibold text-chocolate text-tamil">
            எங்களுடன் தொடங்குங்கள்.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            An account is free. Apply to a programme whenever you are ready.
          </p>
          <p className="mt-1 text-sm text-muted-foreground text-tamil">
            கணக்கு தொடங்குவது இலவசம். நீங்கள் தயாராகும் போது பாடநெறிக்கு விண்ணப்பிக்கலாம்.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-3xl border border-border bg-card p-7 shadow-float"
        >
          <label className="block text-sm font-medium" htmlFor="name">
            Full name <span className="text-muted-foreground text-tamil">· முழுப் பெயர்</span>
          </label>
          <div className="mt-2 flex items-center gap-3 rounded-full border border-border bg-background px-4 py-3 focus-within:ring-2 focus-within:ring-ring">
            <User className="h-4 w-4 text-muted-foreground" />
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Your name"
            />
          </div>

          <label className="mt-5 block text-sm font-medium" htmlFor="phone">
            Mobile number <span className="text-muted-foreground text-tamil">· கைபேசி எண்</span>
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
              placeholder="Enter 10 digit mobile number"
            />
          </div>

          <label className="mt-5 block text-sm font-medium" htmlFor="password">
            Password <span className="text-muted-foreground text-tamil">· கடவுச்சொல்</span>
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
            disabled={pending}
            className="group mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
          >
            <span>
              {pending ? "Creating account…" : "Create account"}
              <span className="block text-xs font-medium opacity-90 text-tamil">
                கணக்கு தொடங்குக
              </span>
            </span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <span className="text-tamil">ஏற்கனவே கணக்கு உள்ளதா?</span>{" "}
          <Link to="/login" className="font-semibold text-chocolate underline-offset-4 hover:underline">
            Log in <span className="text-tamil">· உள்நுழைவு</span>
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
