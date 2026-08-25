import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Compass, HeartHandshake } from "lucide-react";
import aboutImage from "@/assets/about.jpg";
import { Reveal, Eyebrow } from "@/components/section";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Vibuthar | UPSC Mentors Since 2009" },
      {
        name: "description",
        content:
          "Vibuthar is a small-batch UPSC academy in its seventeenth year — retired administrators, subject scholars and a mentor for every twelve aspirants.",
      },
      { property: "og:title", content: "About Vibuthar | UPSC Mentors Since 2009" },
      {
        property: "og:description",
        content: "Small batches, senior faculty and an unhurried method for Civil Services aspirants.",
      },
    ],
  }),
  component: AboutPage,
});

const pillars = [
  {
    icon: Compass,
    title: "A map before a marathon",
    body: "Every aspirant starts with a syllabus audit and a week-by-week route rather than a stack of books.",
  },
  {
    icon: BookOpen,
    title: "Sources, not summaries",
    body: "We teach from primary reports, committee texts and editorials — the same material the board reads.",
  },
  {
    icon: HeartHandshake,
    title: "Mentors who remember you",
    body: "One mentor for twelve aspirants, with monthly reviews that track morale as closely as marks.",
  },
];

function AboutPage() {
  return (
    <div className="px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <Eyebrow>Since 2009</Eyebrow>
            <h1 className="mt-5 text-4xl sm:text-6xl">
              A small academy that refuses to <span className="text-gold-gradient">scale</span>.
            </h1>
            <p className="mt-6 text-muted-foreground">
              Vibuthar began in a two-room library in Thiruvananthapuram with nine aspirants and one
              retired district collector. Seventeen years later we still cap each batch at sixty, because
              the part of this exam that cannot be taught at scale is judgment.
            </p>
            <p className="mt-4 text-muted-foreground">
              Our faculty is a mix of serving-turned-retired administrators, university scholars and
              alumni who cleared with us. They teach the same three subjects for years, and it shows in
              how precisely they answer a doubt.
            </p>
            <Link
              to="/courses"
              className="mt-8 inline-flex rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
            >
              See the programmes
            </Link>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative">
              <div className="overflow-hidden rounded-[2rem] shadow-float">
                <img
                  src={aboutImage}
                  alt="A Vibuthar mentor in discussion with aspirants around a wooden table"
                  loading="lazy"
                  width={1200}
                  height={900}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-4 rounded-2xl px-5 py-4 glass-card sm:-left-8">
                <p className="font-serif text-2xl text-chocolate">60</p>
                <p className="text-xs text-muted-foreground">aspirants per batch — capped</p>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-24 grid gap-6 md:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <div className="h-full rounded-3xl border border-border bg-card p-7 shadow-soft">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-gradient text-primary-foreground shadow-gold">
                  <p.icon className="h-5 w-5" />
                </span>
                <h2 className="mt-5 text-xl">{p.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-24">
          <figure className="mx-auto max-w-3xl text-center">
            <blockquote className="font-serif text-2xl leading-relaxed text-chocolate sm:text-3xl">
              “We do not promise a rank. We promise that on the morning of the exam, nothing in the
              paper will feel unfamiliar.”
            </blockquote>
            <figcaption className="mt-5 text-sm text-muted-foreground">
              R. Krishnan · Founder, former District Collector
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </div>
  );
}
