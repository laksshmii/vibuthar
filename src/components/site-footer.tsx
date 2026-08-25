import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-gradient font-serif text-primary-foreground">
            V
          </span>
          <p className="text-sm text-muted-foreground">
            Vibuthar Academy · Civil Services mentorship since 2009
          </p>
        </div>
        <div className="flex gap-5 text-sm text-muted-foreground">
          <Link to="/courses" className="hover:text-foreground">
            Courses
          </Link>
          <Link to="/about" className="hover:text-foreground">
            About
          </Link>
          <Link to="/login" className="hover:text-foreground">
            Student login
          </Link>
        </div>
      </div>
    </footer>
  );
}
