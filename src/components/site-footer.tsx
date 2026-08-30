import { Mail, MapPin, Phone } from "lucide-react";
import { branches, officeEmail, officePhone } from "@/data/content";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Our branches <span className="text-tamil normal-case">· எங்கள் கிளைகள்</span>
            </p>
            <h2 className="mt-3 font-serif text-2xl text-chocolate">Walk in and talk to a mentor.</h2>
            <p className="mt-1 text-sm text-muted-foreground text-tamil">
              நேரில் வந்து ஆசிரியரிடம் பேசுங்கள்.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={officePhone.href}
              className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold shadow-soft transition-colors hover:bg-secondary"
            >
              <Phone className="h-4 w-4 text-muted-foreground" />
              {officePhone.label}
                <span className="text-xs font-medium text-muted-foreground text-tamil">
                  அலுவலகம்
                </span>
            </a>
            <a
              href={officeEmail.href}
              className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold shadow-soft transition-colors hover:bg-secondary"
            >
              <Mail className="h-4 w-4 text-muted-foreground" />
              {officeEmail.label}
            </a>
          </div>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <div
              key={branch.town}
              className="rounded-3xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold-gradient text-primary-foreground shadow-gold">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-chocolate">{branch.town}</p>
                  <p className="text-xs text-muted-foreground text-tamil">{branch.townTa}</p>
                </div>
              </div>
              <address className="mt-4 text-sm leading-relaxed text-muted-foreground not-italic">
                {branch.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>
          ))}
        </div>

        <p className="mt-10 border-t border-border/60 pt-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Vibuthar Academy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
