import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Lock, Play, Search, Bookmark, LayoutGrid, GraduationCap, FileText, LifeBuoy } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { videos, subjects } from "@/data/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Video Library | Vibuthar Academy" },
      {
        name: "description",
        content:
          "The Vibuthar on-demand video library: filmed lectures on Polity, Geography, Economy, Ethics and answer writing for enrolled UPSC aspirants.",
      },
      { property: "og:title", content: "Video Library | Vibuthar Academy" },
      {
        property: "og:description",
        content: "Filmed UPSC lectures on demand for enrolled Vibuthar aspirants.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { user, ready } = useAuth();

  if (!ready) return <div className="min-h-[60vh]" />;
  if (!user) return <LockedState />;
  return <Library name={user.name} />;
}

function LockedState() {
  return (
    <div className="flex min-h-[calc(100vh-8.5rem)] items-center justify-center px-5 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md rounded-3xl border border-border bg-card p-10 text-center shadow-float"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-gradient text-primary-foreground shadow-gold">
          <Lock className="h-6 w-6" />
        </span>
        <h1 className="mt-6 text-3xl">Members only</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The video library is open to enrolled aspirants. Sign in to continue where you left off.
        </p>
        <Link
          to="/login"
          className="mt-7 inline-flex rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
        >
          Sign in
        </Link>
      </motion.div>
    </div>
  );
}

const sidebarNav = [
  { icon: LayoutGrid, label: "All lectures" },
  { icon: Bookmark, label: "Saved" },
  { icon: FileText, label: "Answer scripts" },
  { icon: GraduationCap, label: "Mentor notes" },
  { icon: LifeBuoy, label: "Support" },
];

function Library({ name }: { name: string }) {
  const [subject, setSubject] = useState("All");
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("All lectures");

  const list = videos.filter(
    (v) =>
      (subject === "All" || v.subject === subject) &&
      (v.title.toLowerCase().includes(query.toLowerCase()) ||
        v.faculty.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-5 py-10 sm:px-8">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-28 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <p className="px-2 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Library
          </p>
          <nav className="mt-3 flex flex-col gap-1">
            {sidebarNav.map((item) => (
              <button
                key={item.label}
                onClick={() => setSection(item.label)}
                className={cn(
                  "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
                  section === item.label
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-6 rounded-2xl bg-chocolate p-5">
            <p className="font-serif text-lg text-cream">Prelims in 214 days</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-cream/20">
              <div className="h-full w-[42%] rounded-full bg-gold-gradient" />
            </div>
            <p className="mt-2 text-xs text-cream/70">42% of your syllabus map complete</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-sm text-muted-foreground">Welcome back, {name}</p>
          <h1 className="mt-1 text-3xl sm:text-4xl">{section}</h1>
        </motion.div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-full border border-border bg-card px-4 py-3 shadow-soft focus-within:ring-2 focus-within:ring-ring">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lectures or faculty"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                subject === s
                  ? "border-transparent bg-gold-gradient text-primary-foreground shadow-gold"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((video, i) => (
              <motion.article
                key={video.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                whileHover={{ y: -6 }}
                className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
              >
                <div className="relative aspect-16/10 overflow-hidden">
                  <img
                    src={video.thumb}
                    alt={video.title}
                    loading="lazy"
                    width={900}
                    height={700}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-chocolate/70 to-transparent opacity-70" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-13 w-13 items-center justify-center rounded-full bg-gold-gradient text-primary-foreground opacity-0 shadow-gold transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
                      <Play className="h-5 w-5" />
                    </span>
                  </span>
                  <span className="absolute right-3 bottom-3 rounded-full bg-chocolate/80 px-2.5 py-1 text-xs font-medium text-cream backdrop-blur-md">
                    {video.duration}
                  </span>
                  {video.progress > 0 && (
                    <span className="absolute inset-x-0 bottom-0 h-1 bg-cream/30">
                      <span
                        className="block h-full bg-gold-gradient"
                        style={{ width: `${video.progress}%` }}
                      />
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    {video.subject}
                  </span>
                  <h2 className="mt-2 text-base leading-snug font-semibold">{video.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{video.faculty}</p>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {list.length === 0 && (
          <p className="mt-16 text-center text-sm text-muted-foreground">
            No lectures match that search yet.
          </p>
        )}
      </div>
    </div>
  );
}
