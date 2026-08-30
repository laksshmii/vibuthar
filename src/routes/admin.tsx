import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useId, useState, type ReactNode } from "react";
import { BarChart3, BookOpen, ChevronLeft, ChevronRight, Eye, ImagePlus, Plus, Users, X } from "lucide-react";
import { addCourse, COURSE_THUMB, readCourseThumbnail, useCourses } from "@/lib/catalog";
import { addUser, formatPrice, useUsers, type DirectoryUser, type UserRole } from "@/lib/directory";
import { homeFor, isValidPhone, useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const fieldClass =
  "w-full rounded-full border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring";
const PAGE_SIZE = 10;

function usePaged<T>(items: T[]) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);

  useEffect(() => {
    if (page !== current) setPage(current);
  }, [page, current]);

  const start = (current - 1) * PAGE_SIZE;
  const slice = items.slice(start, start + PAGE_SIZE);

  return {
    page: current,
    setPage,
    pageCount,
    slice,
    from: items.length === 0 ? 0 : start + 1,
    to: Math.min(start + PAGE_SIZE, items.length),
    total: items.length,
  };
}

function TablePager({
  page,
  pageCount,
  from,
  to,
  total,
  onPage,
}: {
  page: number;
  pageCount: number;
  from: number;
  to: number;
  total: number;
  onPage: (page: number) => void;
}) {
  if (total === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4">
      <p className="text-sm text-muted-foreground">
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPage(n)}
            className={cn(
              "h-9 min-w-9 rounded-full px-2 text-sm font-semibold",
              n === page
                ? "bg-gold-gradient text-primary-foreground shadow-gold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= pageCount}
          className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin desk | Vibuthar Academy" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (!user) navigate({ to: "/login", replace: true });
    else if (user.role !== "admin") navigate({ to: homeFor(user), replace: true });
  }, [ready, user, navigate]);

  if (!ready || !user || user.role !== "admin") {
    return <div className="min-h-[60vh]" />;
  }

  return <AdminDesk />;
}

type AdminSection = "analytics" | "users" | "courses";

const sidebar = [
  { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
  { id: "users" as const, label: "User list", icon: Users },
  { id: "courses" as const, label: "Course list", icon: BookOpen },
];

function AdminDesk() {
  const [section, setSection] = useState<AdminSection>("analytics");

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8.5rem)] max-w-7xl flex-col md:flex-row">
      <aside className="border-b border-border bg-sidebar md:w-60 md:shrink-0 md:border-r md:border-b-0">
        <div className="px-5 py-5 md:px-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Admin
          </p>
          <p className="mt-1 font-serif text-xl text-chocolate">Desk</p>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 md:flex-col md:px-3 md:pb-6">
          {sidebar.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors md:w-full",
                section === item.id
                  ? "bg-gold-gradient text-primary-foreground shadow-gold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 px-5 py-8 sm:px-8">
        {section === "analytics" ? (
          <AnalyticsPanel />
        ) : section === "users" ? (
          <UserPanel />
        ) : (
          <CoursePanel />
        )}
      </div>
    </div>
  );
}

function AdminModal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-chocolate/45 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-float sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 id={titleId} className="font-serif text-2xl text-chocolate">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function AnalyticsPanel() {
  const users = useUsers();
  const courses = useCourses();
  const students = users.filter((u) => u.role === "student");
  const allPaid = students.reduce(
    (sum, user) => sum + user.enrollments.reduce((n, e) => n + e.paid, 0),
    0,
  );
  const unassigned = students.filter((u) => u.enrollments.length === 0).length;

  const byCourse = courses.map((course) => {
    const enrolled = students.filter((u) => u.enrollments.some((e) => e.courseId === course.id));
    const collected = enrolled.reduce((sum, user) => {
      const row = user.enrollments.find((e) => e.courseId === course.id);
      return sum + (row?.paid ?? 0);
    }, 0);
    return { course, count: enrolled.length, collected };
  });

  return (
    <div>
      <h2 className="text-2xl">Analytics</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        How many users you have, and how they sit across each course.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Total users
          </p>
          <p className="mt-3 font-serif text-4xl text-chocolate">{users.length}</p>
          <p className="mt-1 text-sm text-muted-foreground">{students.length} students</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Fees collected
          </p>
          <p className="mt-3 font-serif text-4xl text-chocolate">{formatPrice(allPaid)}</p>
          <p className="mt-1 text-sm text-muted-foreground">Across all enrolments</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            No course yet
          </p>
          <p className="mt-3 font-serif text-4xl text-chocolate">{unassigned}</p>
          <p className="mt-1 text-sm text-muted-foreground">Students with no enrolment</p>
        </div>
      </div>

      <h3 className="mt-10 text-xl">Users by course</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {byCourse.map(({ course, count, collected }) => (
          <article key={course.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              {course.track}
            </p>
            <h4 className="mt-2 text-lg leading-snug">{course.title}</h4>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="font-serif text-3xl text-chocolate">{count}</p>
                <p className="text-sm text-muted-foreground">{count === 1 ? "user" : "users"}</p>
              </div>
              <p className="text-sm font-semibold">{formatPrice(collected)}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function UserPanel() {
  const users = useUsers();
  const { page, setPage, pageCount, slice, from, to, total } = usePaged(users);
  const courses = useCourses();
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState<DirectoryUser | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [error, setError] = useState("");

  function resetForm() {
    setName("");
    setPhone("");
    setRole("student");
    setError("");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Enter the student's name.");
      return;
    }
    if (!isValidPhone(phone)) {
      setError("Enter a 10-digit mobile number.");
      return;
    }
    try {
      addUser({ name, phone, role });
      resetForm();
      setOpen(false);
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add this user.");
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-5">
        <div>
          <h2 className="text-xl">User list</h2>
          <p className="mt-1 text-sm text-muted-foreground">{users.length} accounts</p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold"
        >
          <Plus className="h-4 w-4" /> Add user
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-border bg-secondary/60 text-xs tracking-[0.12em] text-muted-foreground uppercase">
            <tr>
              <th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-6 py-3 font-semibold">Mobile</th>
              <th className="px-6 py-3 font-semibold">Role</th>
              <th className="px-6 py-3 font-semibold">Added</th>
              <th className="px-6 py-3 font-semibold">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {slice.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                  No users yet.
                </td>
              </tr>
            ) : (
              slice.map((user) => (
                <tr key={user.phone} className="hover:bg-secondary/40">
                  <td className="px-6 py-4 font-semibold text-chocolate">{user.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{user.phone}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold tracking-wide uppercase">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => setViewing(user)}
                      className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-chocolate"
                      aria-label={`View courses for ${user.name}`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <TablePager
        page={page}
        pageCount={pageCount}
        from={from}
        to={to}
        total={total}
        onPage={setPage}
      />

      <AdminModal
        open={open}
        title="Add user"
        onClose={() => {
          resetForm();
          setOpen(false);
        }}
      >
        <form onSubmit={onSubmit} className="grid gap-4">
          <label className="block text-sm font-medium">
            Full name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(fieldClass, "mt-2")}
              placeholder="Student name"
            />
          </label>
          <label className="block text-sm font-medium">
            Mobile number
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              inputMode="numeric"
              className={cn(fieldClass, "mt-2")}
              placeholder="Enter 10 digit mobile number"
            />
          </label>
          <label className="block text-sm font-medium">
            Role
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className={cn(fieldClass, "mt-2")}
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-5 py-3 text-sm font-semibold text-primary-foreground shadow-gold"
          >
            Save user
          </button>
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(viewing)}
        title={viewing ? viewing.name : "User courses"}
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <div>
            <p className="text-sm text-muted-foreground">{viewing.phone}</p>
            {viewing.enrollments.filter((e) => e.paid > 0).length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">This user has not paid for a course yet.</p>
            ) : (
              <div className="mt-4">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold tracking-wide uppercase">
                  Already paid
                </span>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border text-xs tracking-[0.12em] text-muted-foreground uppercase">
                      <tr>
                        <th className="py-2 pr-4 font-semibold">Course</th>
                        <th className="py-2 font-semibold">Paid amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {viewing.enrollments
                        .filter((row) => row.paid > 0)
                        .map((row) => {
                          const course = courses.find((c) => c.id === row.courseId);
                          return (
                            <tr key={row.courseId}>
                              <td className="py-3 pr-4">
                                <p className="font-semibold text-chocolate">
                                  {course?.title ?? row.courseId}
                                </p>
                                <p className="text-xs text-muted-foreground">{course?.shortTitle}</p>
                              </td>
                              <td className="py-3 font-semibold">{formatPrice(row.paid)}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-sm font-semibold text-chocolate">
                  Total paid{" "}
                  {formatPrice(
                    viewing.enrollments.filter((row) => row.paid > 0).reduce((sum, row) => sum + row.paid, 0),
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </AdminModal>
    </section>
  );
}

function CoursePanel() {
  const courses = useCourses();
  const { page, setPage, pageCount, slice, from, to, total } = usePaged(courses);
  const tracks = ["TNPSC", "TET", "Police", "Test Batch"];
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [shortTitle, setShortTitle] = useState("");
  const [track, setTrack] = useState("TNPSC");
  const [duration, setDuration] = useState("");
  const [lessons, setLessons] = useState("");
  const [price, setPrice] = useState("");
  const [blurb, setBlurb] = useState("");
  const [thumb, setThumb] = useState("");
  const [thumbName, setThumbName] = useState("");
  const [error, setError] = useState("");

  function resetForm() {
    setTitle("");
    setShortTitle("");
    setTrack("TNPSC");
    setDuration("");
    setLessons("");
    setPrice("");
    setBlurb("");
    setThumb("");
    setThumbName("");
    setError("");
  }

  async function onThumbChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await readCourseThumbnail(file);
      setThumb(dataUrl);
      setThumbName(file.name);
      setError("");
    } catch (err) {
      setThumb("");
      setThumbName("");
      setError(err instanceof Error ? err.message : "This image cannot be used.");
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 3 || shortTitle.trim().length < 2) {
      setError("Add a course title and a short title.");
      return;
    }
    if (!duration.trim() || !price.trim() || Number(lessons) < 1) {
      setError("Add duration, lesson count and price.");
      return;
    }
    if (blurb.trim().length < 8) {
      setError("Add a short course description.");
      return;
    }
    if (!thumb) {
      setError(
        `Upload a 16:10 thumbnail, at least ${COURSE_THUMB.width}×${COURSE_THUMB.height} — the same frame as the public course cards.`,
      );
      return;
    }
    try {
      addCourse({
        title,
        shortTitle,
        track,
        duration,
        lessons: Number(lessons),
        price,
        blurb,
        image: thumb,
      });
      resetForm();
      setOpen(false);
      setPage(Math.ceil((courses.length + 1) / PAGE_SIZE));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add this course.");
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-5">
        <div>
          <h2 className="text-xl">Course list</h2>
          <p className="mt-1 text-sm text-muted-foreground">{courses.length} programmes</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/courses"
            className="text-sm font-semibold text-chocolate underline-offset-4 hover:underline"
          >
            View site
          </Link>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold"
          >
            <Plus className="h-4 w-4" /> Add course
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="border-b border-border bg-secondary/60 text-xs tracking-[0.12em] text-muted-foreground uppercase">
            <tr>
              <th className="px-6 py-3 font-semibold">Thumb</th>
              <th className="px-6 py-3 font-semibold">Course</th>
              <th className="px-6 py-3 font-semibold">Track</th>
              <th className="px-6 py-3 font-semibold">Duration</th>
              <th className="px-6 py-3 font-semibold">Lessons</th>
              <th className="px-6 py-3 font-semibold">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {slice.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                  No courses yet.
                </td>
              </tr>
            ) : (
              slice.map((course) => (
                <tr key={course.id} className="hover:bg-secondary/40">
                  <td className="px-6 py-4">
                    <img
                      src={course.image}
                      alt=""
                      className="h-10 w-16 rounded-md object-cover"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-chocolate">{course.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{course.shortTitle}</p>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{course.track}</td>
                  <td className="px-6 py-4 text-muted-foreground">{course.duration}</td>
                  <td className="px-6 py-4 text-muted-foreground">{course.lessons}</td>
                  <td className="px-6 py-4 font-semibold">{course.price}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <TablePager
        page={page}
        pageCount={pageCount}
        from={from}
        to={to}
        total={total}
        onPage={setPage}
      />

      <AdminModal
        open={open}
        title="Add course"
        onClose={() => {
          resetForm();
          setOpen(false);
        }}
      >
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium sm:col-span-2">
            Course title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={cn(fieldClass, "mt-2")}
              placeholder="TNPSC Group II Full Course"
            />
          </label>
          <label className="block text-sm font-medium">
            Short title
            <input
              value={shortTitle}
              onChange={(e) => setShortTitle(e.target.value)}
              className={cn(fieldClass, "mt-2")}
              placeholder="Group II"
            />
          </label>
          <label className="block text-sm font-medium">
            Track
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              className={cn(fieldClass, "mt-2")}
            >
              {tracks.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Duration
            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={cn(fieldClass, "mt-2")}
              placeholder="6 months"
            />
          </label>
          <label className="block text-sm font-medium">
            Lessons
            <input
              value={lessons}
              onChange={(e) => setLessons(e.target.value)}
              type="number"
              min={1}
              className={cn(fieldClass, "mt-2")}
              placeholder="48"
            />
          </label>
          <label className="block text-sm font-medium sm:col-span-2">
            Price
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={cn(fieldClass, "mt-2")}
              placeholder="24000"
            />
          </label>
          <label className="block text-sm font-medium sm:col-span-2">
            Description
            <textarea
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="What this batch covers"
            />
          </label>
          <div className="sm:col-span-2">
            <p className="text-sm font-medium">Course thumbnail</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Must be 16:10, at least {COURSE_THUMB.width}×{COURSE_THUMB.height} px — the same
              size as the cards on the public course list. JPG, PNG or WebP, under 2.5 MB.
            </p>
            <label className="mt-3 flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-dashed border-border bg-background">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onThumbChange}
                className="sr-only"
              />
              {thumb ? (
                <img src={thumb} alt="" className="aspect-16/10 w-full object-cover" />
              ) : (
                <span className="flex aspect-16/10 w-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                  <ImagePlus className="h-6 w-6" />
                  Upload 1200×800 thumbnail
                </span>
              )}
            </label>
            {thumbName && (
              <p className="mt-2 text-xs text-muted-foreground">{thumbName}</p>
            )}
          </div>
          {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-5 py-3 text-sm font-semibold text-primary-foreground shadow-gold sm:col-span-2"
          >
            Save course
          </button>
        </form>
      </AdminModal>
    </section>
  );
}
