import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { GraduationCap, Lock, Mail, MapPin, Pencil, Save, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getUserProfile, updateUserProfile } from "@/lib/api";
import { Eyebrow } from "@/components/section";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Update profile | Vibuthar Academy" },
      {
        name: "description",
        content: "Update your Vibuthar student profile: name, email, degrees and address.",
      },
      { property: "og:title", content: "Update profile | Vibuthar Academy" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function ProfilePage() {
  const { user, ready, patchUser } = useAuth();
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ugDegree, setUgDegree] = useState("");
  const [pgDegree, setPgDegree] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(true);

  useEffect(() => {
    if (!ready || !user) {
      setLoading(false);
      return;
    }
    setName(user.name);
    setUserId(user.userId ?? "");
    let cancelled = false;
    setLoading(true);
    void getUserProfile()
      .then((profile) => {
        if (cancelled) return;
        setUserId(profile.userId || user.userId || "");
        setName(profile.name || user.name);
        setEmail(profile.email);
        setUgDegree(profile.ugDegree);
        setPgDegree(profile.pgDegree);
        setAddress(profile.address);
        if (profile.userId && profile.userId !== user.userId) {
          patchUser({ userId: profile.userId, ...(profile.name ? { name: profile.name } : {}) });
        } else if (profile.name && profile.name !== user.name) {
          patchUser({ name: profile.name });
        }
        const hasSavedDetails = Boolean(
          profile.email || profile.ugDegree || profile.pgDegree || profile.address,
        );
        setEditing(!hasSavedDetails);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load your profile.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, user?.phone]);

  if (!ready) return <div className="min-h-[60vh]" />;
  if (!user) return <LockedState />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (trimmedName.length < 2) {
      setError("Enter your name.");
      return;
    }
    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!userId) {
      setError("Your account id is missing. Sign in again, then try updating.");
      return;
    }
    setError("");
    setPending(true);
    try {
      const next = await updateUserProfile(userId, {
        name: trimmedName,
        email: trimmedEmail,
        ugDegree: ugDegree.trim(),
        pgDegree: pgDegree.trim(),
        address: address.trim(),
      });
      setName(next.name);
      setEmail(next.email);
      setUgDegree(next.ugDegree);
      setPgDegree(next.pgDegree);
      setAddress(next.address);
      if (next.userId) setUserId(next.userId);
      patchUser({ name: next.name, userId: next.userId || userId });
      toast.success("Profile updated successfully.");
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update your profile.");
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
        className="w-full max-w-xl"
      >
        <div className="text-center">
          <Eyebrow>Account</Eyebrow>
          <h1 className="mt-5 text-4xl">{editing ? "Update profile" : "Your profile"}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {editing
              ? "Keep your name, email and education details current."
              : "These are the details saved to your Vibuthar account."}
          </p>
        </div>

        {loading ? (
          <div className="mt-8 rounded-3xl border border-border bg-card p-7 shadow-float">
            <p className="py-10 text-center text-sm text-muted-foreground">Loading profile…</p>
          </div>
        ) : !editing ? (
          <div className="mt-8 rounded-3xl border border-border bg-card p-7 shadow-float">
            <dl className="divide-y divide-border">
              <DetailRow icon={<UserRound className="h-4 w-4 text-muted-foreground" />} label="Full name" value={name} />
              <DetailRow icon={<Mail className="h-4 w-4 text-muted-foreground" />} label="Email" value={email} />
              <DetailRow
                icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
                label="Undergraduate degree"
                value={ugDegree}
              />
              <DetailRow
                icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
                label="Postgraduate degree"
                value={pgDegree}
              />
              <DetailRow icon={<MapPin className="h-4 w-4 text-muted-foreground" />} label="Address" value={address} />
            </dl>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="group mt-7 flex w-full items-center justify-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              <Pencil className="h-4 w-4" />
              Edit profile
            </button>
          </div>
        ) : (
        <form
          onSubmit={(e) => void onSubmit(e)}
          className="mt-8 rounded-3xl border border-border bg-card p-7 shadow-float"
        >
              <Field label="Full name" htmlFor="profile-name">
                <UserRound className="h-4 w-4 text-muted-foreground" />
                <input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Your name"
                  autoComplete="name"
                />
              </Field>

              <Field label="Email" htmlFor="profile-email" className="mt-5">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="you@email.com"
                  autoComplete="email"
                />
              </Field>

              <Field label="Undergraduate degree" htmlFor="profile-ug" className="mt-5">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <input
                  id="profile-ug"
                  value={ugDegree}
                  onChange={(e) => setUgDegree(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="e.g. B.A. History"
                />
              </Field>

              <Field label="Postgraduate degree" htmlFor="profile-pg" className="mt-5">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <input
                  id="profile-pg"
                  value={pgDegree}
                  onChange={(e) => setPgDegree(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="e.g. M.A. Public Administration"
                />
              </Field>

              <label className="mt-5 block text-sm font-medium" htmlFor="profile-address">
                Address
              </label>
              <div className="mt-2 flex items-start gap-3 rounded-3xl border border-border bg-background px-4 py-3 focus-within:ring-2 focus-within:ring-ring">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <textarea
                  id="profile-address"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full resize-none bg-transparent text-sm outline-none"
                  placeholder="Street, city, PIN"
                />
              </div>

              {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

              <button
                type="submit"
                disabled={pending}
                className="group mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
              >
                {pending ? "Saving…" : "Save profile"}
                <Save className="h-4 w-4" />
              </button>
        </form>
        )}
      </motion.div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
      <span className="mt-0.5">{icon}</span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">{label}</dt>
        <dd className="mt-1 whitespace-pre-wrap text-sm font-medium">{value.trim() ? value : "—"}</dd>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium" htmlFor={htmlFor}>
        {label}
      </label>
      <div className="mt-2 flex items-center gap-3 rounded-full border border-border bg-background px-4 py-3 focus-within:ring-2 focus-within:ring-ring">
        {children}
      </div>
    </div>
  );
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
        <h1 className="mt-6 text-3xl">Sign in to continue</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your profile can be updated after you sign in to your Vibuthar account.
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
