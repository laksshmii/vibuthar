import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Compass, HeartHandshake } from "lucide-react";
import aboutImage from "@/assets/about.jpg";
import { Reveal, Eyebrow } from "@/components/section";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Vibuthar Academy | TNPSC, TET & Police Coaching" },
      {
        name: "description",
        content:
          "Vibuthar Academy teaches TNPSC, TET and TNUSRB Police aspirants in Tamil from Sankarankovil, Puliangudi and Kadayam — capped batches and answer key classes after every test.",
      },
      {
        property: "og:title",
        content: "About Vibuthar Academy | TNPSC, TET & Police Coaching",
      },
      {
        property: "og:description",
        content:
          "Capped batches, subject teachers who stay with the same paper for years, and an answer key class after every test.",
      },
    ],
  }),
  component: AboutPage,
});

const pillars = [
  {
    icon: Compass,
    title: "A map before a marathon",
    titleTa: "நெடுந்தூர ஓட்டத்திற்கு முன் ஒரு வரைபடம்",
    body: "Every aspirant starts with a syllabus audit and a week-by-week route rather than a stack of books.",
  },
  {
    icon: BookOpen,
    title: "Sources, not summaries",
    titleTa: "சுருக்கங்கள் அல்ல, மூல நூல்கள்",
    body: "We teach from primary reports, committee texts and editorials — the same material the board reads.",
  },
  {
    icon: HeartHandshake,
    title: "Mentors who remember you",
    titleTa: "உங்களை நினைவில் வைக்கும் ஆசிரியர்கள்",
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
              A classroom where no one is a <span className="text-gold-gradient">number</span>.
            </h1>
            <p className="mt-4 text-lg font-semibold text-chocolate text-tamil sm:text-xl">
              எந்த மாணவரும் வெறும் எண் அல்ல.
            </p>
            <p className="mt-6 text-muted-foreground">
              Vibuthar began in Sankarankovil with one rented classroom and a handful of students
              preparing for the TNPSC exams. That same room now has company in Puliangudi and
              Kadayam, and every batch is still capped on purpose — the part of these exams that
              cannot be taught to a crowd is judgment.
            </p>
            <p className="mt-4 text-muted-foreground">
              Our teachers stay with the same subjects year after year — General Tamil, Maths and
              Reasoning, General Studies, Child Development and Pedagogy — and they teach in Tamil,
              the language you will write the paper in. After every test they take the answer key
              question by question, which is where most of the learning actually happens.
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
                <p className="mt-1 text-sm font-semibold text-chocolate text-tamil">{p.titleTa}</p>
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
