import { useEffect, useMemo, useState } from "react";
import heroImage from "@/assets/hero.jpg";
import heroClassroomImage from "@/assets/hero-classroom.jpg";
import heroReviewImage from "@/assets/hero-answer-review.jpg";
import { listPublicImages } from "@/lib/api";

export type HeroSlide = {
  id: string;
  src: string;
  tag: string;
  title: string;
  titleTa: string;
  description: string;
  descriptionTa: string;
};

const fallbackSlides: HeroSlide[] = [
  {
    id: "fallback-1",
    src: heroClassroomImage,
    tag: "Batch 2027 · Now open",
    title: "The quiet craft of becoming a civil servant.",
    titleTa: "அரசுப் பணிக்கான பயணம், அமைதியான பயிற்சியுடன்.",
    description:
      "Vibuthar pairs each aspirant with a mentor, a syllabus map and a filmed classroom you can return to at 5 a.m. or midnight.",
    descriptionTa:
      "ஒவ்வொரு மாணவருக்கும் ஒரு வழிகாட்டி, பாடத்திட்ட வரைபடம், மற்றும் விடியற்காலையிலும் நள்ளிரவிலும் பார்க்கக்கூடிய பதிவு வகுப்புகள்.",
  },
  {
    id: "fallback-2",
    src: heroReviewImage,
    tag: "1:1 Mentorship",
    title: "Personalized reviews for every answer script.",
    titleTa: "ஒவ்வொரு விடைத்தாளுக்கும் தனிப்பட்ட மதிப்பீடு.",
    description:
      "Get targeted feedback on your mains writing strategy within 48 hours from experienced faculty.",
    descriptionTa:
      "உங்கள் விடை எழுதும் முறைக்கு 48 மணி நேரத்திற்குள் அனுபவம் மிக்க ஆசிரியர்களின் திருத்தமும் ஆலோசனையும்.",
  },
  {
    id: "fallback-3",
    src: heroImage,
    tag: "On-Demand Library",
    title: "Cinematic study sessions on your schedule.",
    titleTa: "உங்கள் நேரத்திற்கு ஏற்ற வகுப்புகள்.",
    description:
      "Over 1,240+ HD filmed lectures available 24/7 with comprehensive syllabus coverage.",
    descriptionTa:
      "1,240-க்கும் மேற்பட்ட தரமான பதிவு வகுப்புகள், நாள் முழுவதும் கிடைக்கும் — முழுப் பாடத்திட்ட விளக்கத்துடன்.",
  },
];

export function useHeroSlides() {
  const [remote, setRemote] = useState<HeroSlide[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void listPublicImages()
      .then((images) => {
        if (cancelled) return;
        const slides = images
          .filter((image) => image.url)
          .map((image, index) => {
            const copy = fallbackSlides[index % fallbackSlides.length]!;
            return {
              ...copy,
              id: image.id,
              src: image.url,
            };
          });
        setRemote(slides.length ? slides : fallbackSlides);
      })
      .catch(() => {
        if (!cancelled) setRemote(fallbackSlides);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => remote ?? fallbackSlides, [remote]);
}
