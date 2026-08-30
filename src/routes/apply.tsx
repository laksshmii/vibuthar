import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Clock, Phone, User } from "lucide-react";
import { useCourses } from "@/lib/catalog";
import { enrollUser, parsePrice, upsertUser } from "@/lib/directory";
import { CourseThumbnail } from "@/components/course-thumbnail";
import { Eyebrow } from "@/components/section";
import { useAuth, isValidPhone } from "@/lib/auth";
import { saveApplication } from "@/lib/applications";

type ApplySearch = { course: string };

export const Route = createFileRoute("/apply")({
  validateSearch: (search: Record<string, unknown>): ApplySearch => ({
    course: typeof search.course === "string" ? search.course : "",
  }),
  head: () => ({
    meta: [
      { title: "Apply to a programme | Vibuthar Academy" },
      {
        name: "description",
        content:
          "Apply to a Vibuthar UPSC programme. Share your details and a mentor will call you back within two working days.",
      },
      { property: "og:title", content: "Apply to a programme | Vibuthar Academy" },
      {
        property: "og:description",
        content: "Apply to a mentor-led Vibuthar UPSC programme.",
      },
    ],
  }),
  component: ApplyPage,
});

function ApplyPage() {
  const { course: courseId } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const courses = useCourses();

  const selected = courses.find((c) => c.id === courseId) ?? courses[0]!;
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [attempt, setAttempt] = useState("First attempt");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2 || !isValidPhone(phone)) {
      setError("Add your name and a 10-digit mobile number.");
      return;
    }
    setError("");
    saveApplication({
      name: name.trim(),
      phone,
      courseId: selected.id,
      attempt,
    });
    upsertUser({ name: name.trim(), phone, role: "student" });
    enrollUser(phone, selected.id, parsePrice(selected.price));
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex min-h-[calc(100vh-8.5rem)] items-center justify-center px-5 py-16 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md rounded-3xl border border-border bg-card p-10 text-center shadow-float"
        >
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-gradient text-primary-foreground shadow-gold">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <h1 className="mt-6 text-3xl">Application received.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Thank you, {name.split(" ")[0]}. A mentor will call you about{" "}
            <span className="font-semibold text-chocolate">{selected.title}</span> within two working
            days.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/courses"
              className="rounded-full bg-gold-gradient px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
            >
              Browse more courses
            </Link>
            <Link
              to="/"
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              Go home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-8 pb-16 sm:px-8 sm:pt-10 sm:pb-20">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Eyebrow>Application</Eyebrow>
          <h1 className="mt-5 max-w-xl text-4xl sm:text-5xl">Apply to learn with us.</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Applications are reviewed by a mentor, not a form filter. Tell us where you are and we
            will suggest the right batch.
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="flex min-h-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex w-full flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
            >
              <div className="aspect-16/10 w-full shrink-0">
                <CourseThumbnail course={selected} />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  {selected.track}
                </span>
                <h2 className="mt-2 text-xl">{selected.title}</h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{selected.blurb}</p>
                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> {selected.duration}
                  </span>
                  <span className="font-semibold text-chocolate">{selected.price}</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex min-h-0">
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              onSubmit={onSubmit}
              className="flex w-full flex-1 flex-col rounded-3xl border border-border bg-card p-7 shadow-float"
            >
          <label className="block text-sm font-medium" htmlFor="course">
            Programme
          </label>
          <select
            id="course"
            value={selected.id}
            onChange={(e) => navigate({ to: "/apply", search: { course: e.target.value } })}
            className="mt-2 w-full rounded-full border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} — {c.price}
              </option>
            ))}
          </select>

          <label className="mt-5 block text-sm font-medium" htmlFor="apply-name">
            Full name
          </label>
          <div className="mt-2 flex items-center gap-3 rounded-full border border-border bg-background px-4 py-3 focus-within:ring-2 focus-within:ring-ring">
            <User className="h-4 w-4 text-muted-foreground" />
            <input
              id="apply-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Your name"
            />
          </div>

          <label className="mt-5 block text-sm font-medium" htmlFor="apply-phone">
            Mobile number
          </label>
          <div className="mt-2 flex items-center gap-3 rounded-full border border-border bg-background px-4 py-3 focus-within:ring-2 focus-within:ring-ring">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">+91</span>
            <input
              id="apply-phone"
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

          <label className="mt-5 block text-sm font-medium" htmlFor="apply-attempt">
            Where are you in your preparation?
          </label>
          <select
            id="apply-attempt"
            value={attempt}
            onChange={(e) => setAttempt(e.target.value)}
            className="mt-2 w-full rounded-full border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option>First attempt</option>
            <option>Cleared prelims before</option>
            <option>Cleared mains before</option>
            <option>Interview stage</option>
          </select>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <div className="mt-auto pt-7">
            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
            >
              Submit application
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="mt-5 text-center text-xs text-muted-foreground">
              No payment now. Fees are collected only after your mentor call.
            </p>
          </div>
            </motion.form>
          </div>
        </div>
      </div>
    </div>
  );
}
