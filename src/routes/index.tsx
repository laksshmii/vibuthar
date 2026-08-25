import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import {
  Play,
  Sparkles,
  GraduationCap,
  Trophy,
  ArrowRight,
  Clock,
  Film,
  CalendarDays,
} from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import { courses, upcomingClasses } from "@/data/content";
import { Reveal, Eyebrow } from "@/components/section";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vibuthar — Premium UPSC Civil Services Coaching" },
      {
        name: "description",
        content:
          "Vibuthar is a mentor-led UPSC Civil Services academy: prelims foundation, mains answer writing, ethics and interview studios with an on-demand video library.",
      },
      { property: "og:title", content: "Vibuthar — Premium UPSC Civil Services Coaching" },
      {
        property: "og:description",
        content: "Mentor-led UPSC preparation with a cinematic on-demand video library.",
      },
    ],
  }),
  component: Landing,
});

const badges = [
  { icon: Trophy, label: "412 selections", sub: "since 2009", className: "left-2 top-24 sm:left-8 sm:top-28" },
  { icon: GraduationCap, label: "1:12 mentor ratio", sub: "personal review", className: "right-2 top-40 sm:right-8 sm:top-44" },
  { icon: Sparkles, label: "Answer clinics", sub: "every week", className: "bottom-16 left-4 sm:bottom-20 sm:left-16" },
];

function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.45, 0.8]);

  return (
    <div>
      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden px-4 pt-6 pb-10 sm:px-8 sm:pt-8">
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[4/4] overflow-hidden rounded-[2rem] shadow-float sm:aspect-[20/9] sm:rounded-[2.5rem]"
            style={{ perspective: 1200 }}
          >
            <motion.img
              src={heroImage}
              alt="Aspirants studying in the Vibuthar reading hall at golden hour"
              width={1600}
              height={1008}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ y: imageY, scale: imageScale }}
            />
            <motion.div
              className="absolute inset-0 bg-linear-to-t from-chocolate via-chocolate/40 to-transparent"
              style={{ opacity: overlayOpacity }}
            />

            <div className="relative flex h-full flex-col justify-end p-5 sm:p-8 lg:p-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-2xl"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-cream/30 bg-cream/15 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-cream uppercase backdrop-blur-md">
                  <Film className="h-3.5 w-3.5" /> Batch 2027 · Now open
                </span>
                <h1 className="mt-3 text-3xl leading-[1.08] text-cream sm:text-5xl lg:text-6xl">
                  The quiet craft of becoming a civil servant.
                </h1>
                <p className="mt-3 max-w-xl text-sm text-cream/80 sm:text-base">
                  Vibuthar pairs each aspirant with a mentor, a syllabus map and a filmed classroom you
                  can return to at 5 a.m. or midnight.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link
                    to="/courses"
                    className="group inline-flex items-center gap-2 rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
                  >
                    Explore courses
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/library"
                    className="inline-flex items-center gap-2 rounded-full border border-cream/40 bg-cream/10 px-6 py-3.5 text-sm font-semibold text-cream backdrop-blur-md transition-colors hover:bg-cream/20"
                  >
                    <Play className="h-4 w-4" /> Watch a class
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Floating badges */}
            {badges.map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: [0, -10, 0], scale: 1 }}
                transition={{
                  opacity: { duration: 0.6, delay: 0.6 + i * 0.15 },
                  scale: { duration: 0.6, delay: 0.6 + i * 0.15 },
                  y: { duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: 0.6 + i * 0.2 },
                }}
                className={`absolute hidden items-center gap-3 rounded-2xl px-4 py-3 glass-card md:flex ${badge.className}`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-gradient text-primary-foreground">
                  <badge.icon className="h-4 w-4" />
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-semibold text-chocolate">{badge.label}</span>
                  <span className="block text-xs text-muted-foreground">{badge.sub}</span>
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-5 pb-20 sm:px-8">
        <Reveal className="mx-auto grid max-w-7xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["412", "Final selections"],
            ["17", "Years of mentoring"],
            ["1,240+", "Filmed lectures"],
            ["48 hrs", "Answer feedback"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <p className="font-serif text-3xl text-chocolate sm:text-4xl">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* What's next — upcoming classes carousel */}
      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Carousel opts={{ align: "start", loop: true }}>
            <Reveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <Eyebrow>What's next</Eyebrow>
                <h2 className="mt-4 max-w-xl text-3xl sm:text-5xl">
                  Next <span className="text-gold-gradient">classes</span> on the calendar.
                </h2>
                <p className="mt-4 max-w-lg text-sm text-muted-foreground">
                  Live sessions you can sit in on this fortnight. Apply once and your seat carries
                  across the batch.
                </p>
              </div>
              <div className="flex gap-2">
                <CarouselPrevious className="static h-10 w-10 translate-y-0 border-border bg-card shadow-soft" />
                <CarouselNext className="static h-10 w-10 translate-y-0 border-border bg-card shadow-soft" />
              </div>
            </Reveal>

            <CarouselContent className="mt-10">
              {upcomingClasses.map((item) => (
                <CarouselItem key={item.id} className="sm:basis-1/2 lg:basis-1/3">
                  <motion.article
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 280, damping: 22 }}
                    className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
                  >
                    <div className="relative aspect-16/10 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        width={900}
                        height={560}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute top-4 left-4 rounded-full bg-card/85 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-md">
                        {item.mode}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                        {item.track} · {item.faculty}
                      </span>
                      <h3 className="mt-2 text-lg leading-snug">{item.title}</h3>
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4" /> {item.day}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-4 w-4" /> {item.time}
                        </span>
                      </div>
                      <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
                        <span className="text-xs font-semibold text-chocolate">
                          {item.seatsLeft} seats left
                        </span>
                        <Link
                          to="/apply"
                          search={{ course: "" }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
                        >
                          Apply <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </section>

      {/* Course preview */}
      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <Eyebrow>Programmes</Eyebrow>
              <h2 className="mt-4 max-w-xl text-3xl sm:text-5xl">
                Three tracks, one <span className="text-gold-gradient">unhurried</span> method.
              </h2>
            </div>
            <Link
              to="/courses"
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold shadow-soft transition-colors hover:bg-secondary"
            >
              View all courses
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {courses.slice(0, 3).map((course, i) => (
              <Reveal key={course.id} delay={i * 0.1}>
                <motion.article
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  className="h-full overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
                >
                  <div className="aspect-16/10 overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      loading="lazy"
                      width={900}
                      height={700}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                      {course.track}
                    </span>
                    <h3 className="mt-2 text-xl">{course.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{course.blurb}</p>
                    <div className="mt-5 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4" /> {course.duration}
                      </span>
                      <span className="font-semibold text-chocolate">{course.price}</span>
                    </div>
                  </div>
                </motion.article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-24 sm:px-8">
        <Reveal className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-chocolate px-8 py-16 text-center sm:px-16 sm:py-24">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold-gradient opacity-25 blur-3xl" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl text-cream sm:text-5xl">
                Your attempt deserves a calmer classroom.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-cream/70">
                Seats for the 2027 foundation batch close on 30 September. Sit in on a live session
                before you decide.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link
                  to="/apply"
                  search={{ course: "" }}
                  className="rounded-full bg-gold-gradient px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
                >
                  Apply now
                </Link>
                <Link
                  to="/about"
                  className="rounded-full border border-cream/30 px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
                >
                  Meet the faculty
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
