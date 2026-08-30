import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { ArrowRight, Clock, PlayCircle } from "lucide-react";
import { useCourses } from "@/lib/catalog";
import { CourseThumbnail } from "@/components/course-thumbnail";
import { Reveal, Eyebrow } from "@/components/section";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "UPSC Courses & Programmes | Vibuthar Academy" },
      {
        name: "description",
        content:
          "Prelims foundation, optional subjects, mains answer writing, ethics and interview coaching — browse every Vibuthar UPSC programme with duration and fees.",
      },
      { property: "og:title", content: "UPSC Courses & Programmes | Vibuthar Academy" },
      {
        property: "og:description",
        content: "Browse Vibuthar's mentor-led UPSC programmes across prelims, mains and interview.",
      },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const courses = useCourses();
  const tracks = ["All", ...Array.from(new Set(courses.map((c) => c.track)))];
  const [track, setTrack] = useState("All");
  const list = track === "All" ? courses : courses.filter((c) => c.track === track);

  return (
    <div className="px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <Eyebrow>Programmes 2027</Eyebrow>
          <h1 className="mt-5 max-w-3xl text-4xl sm:text-6xl">
            Courses built around the <span className="text-gold-gradient">syllabus</span>, not the
            calendar.
          </h1>
          <p className="mt-5 max-w-xl text-muted-foreground">
            Every programme includes filmed lectures, a printed source pack and evaluated writing.
          </p>
          <p className="mt-2 max-w-xl text-muted-foreground text-tamil">
            ஒவ்வொரு பாடத்திட்டத்திலும் பதிவு செய்யப்பட்ட வகுப்புகள், அச்சிடப்பட்ட பாடக்குறிப்புகள்
            மற்றும் திருத்தப்படும் தேர்வுகள் அடங்கும்.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex flex-wrap gap-2">
          {tracks.map((t) => (
            <button
              key={t}
              onClick={() => setTrack(t)}
              className={cn(
                "rounded-full border px-5 py-2.5 text-sm font-medium transition-all",
                track === t
                  ? "border-transparent bg-gold-gradient text-primary-foreground shadow-gold"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </Reveal>

        <motion.div layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((course, i) => (
            <motion.article
              key={course.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              whileHover={{ y: -8 }}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
            >
              <div className="aspect-16/10 overflow-hidden">
                <CourseThumbnail
                  course={course}
                  className="transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-xl">{course.title}</h2>
                <p className="mt-1 text-sm font-semibold text-chocolate text-tamil">
                  {course.titleTa}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{course.blurb}</p>
                <p className="mt-2 flex-1 text-sm text-muted-foreground text-tamil">
                  {course.blurbTa}
                </p>
                <div className="mt-5 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> {course.duration}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <PlayCircle className="h-4 w-4" /> {course.lessons} lessons
                  </span>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                  <span className="font-serif text-2xl text-chocolate">{course.price}</span>
                  <Link
                    to="/apply"
                    search={{ course: course.id }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
                  >
                    விண்ணப்பிக்க <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
