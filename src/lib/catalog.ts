import { useSyncExternalStore } from "react";
import { courses as defaultCourses, type Course } from "@/data/content";
import fallbackImage from "@/assets/course-1.jpg";

const STORAGE_KEY = "vibuthar.extra-courses";
const EVENT = "vibuthar-courses";

let cache: Course[] | null = null;
let cacheKey = "";

function extras(): Course[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Course[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function emit() {
  cache = null;
  cacheKey = "";
  window.dispatchEvent(new Event(EVENT));
}

export function getCoursesSnapshot(): Course[] {
  const added = extras();
  const key = JSON.stringify(added.map((c) => c.id));
  if (cache && cacheKey === key) return cache;
  const seen = new Set(defaultCourses.map((c) => c.id));
  cache = [...defaultCourses, ...added.filter((c) => !seen.has(c.id))];
  cacheKey = key;
  return cache;
}

export function subscribeCourses(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useCourses() {
  return useSyncExternalStore(subscribeCourses, getCoursesSnapshot, () => defaultCourses);
}

export function slugFromTitle(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `course-${Date.now()}`;
}

/** Same frame as the public course cards (`aspect-16/10`). */
export const COURSE_THUMB = {
  width: 1200,
  height: 800,
  ratio: 16 / 10,
} as const;

export function readCourseThumbnail(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    return Promise.reject(new Error("Upload a JPG, PNG or WebP image."));
  }
  if (file.size > 2.5 * 1024 * 1024) {
    return Promise.reject(new Error("Keep the image under 2.5 MB."));
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = img;
      const ratio = width / height;
      if (Math.abs(ratio - COURSE_THUMB.ratio) > 0.02) {
        reject(
          new Error(
            `Thumbnail must be 16:10, the same as the course cards (1200×800). This file is ${width}×${height}.`,
          ),
        );
        return;
      }
      if (width < COURSE_THUMB.width || height < COURSE_THUMB.height) {
        reject(
          new Error(
            `Use at least ${COURSE_THUMB.width}×${COURSE_THUMB.height} pixels so it stays sharp on the course list. This file is ${width}×${height}.`,
          ),
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read this image."));
      reader.readAsDataURL(file);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not open this image."));
    };
    img.src = url;
  });
}

export function addCourse(input: {
  title: string;
  titleTa?: string;
  shortTitle: string;
  track: string;
  duration: string;
  lessons: number;
  price: string;
  blurb: string;
  blurbTa?: string;
  tagline?: string;
  image?: string;
}) {
  const id = slugFromTitle(input.title);
  if (getCoursesSnapshot().some((c) => c.id === id)) {
    throw new Error("A course with this title already exists.");
  }
  const price = input.price.trim().startsWith("₹") ? input.price.trim() : `₹${input.price.trim()}`;
  const next: Course = {
    id,
    title: input.title.trim(),
    titleTa: input.titleTa?.trim() || input.title.trim(),
    shortTitle: input.shortTitle.trim(),
    track: input.track.trim(),
    duration: input.duration.trim(),
    lessons: input.lessons,
    price,
    blurb: input.blurb.trim(),
    blurbTa: input.blurbTa?.trim() || input.blurb.trim(),
    tagline: input.tagline?.trim() || input.shortTitle.trim(),
    image: input.image || fallbackImage,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...extras(), next]));
  emit();
  return next;
}
