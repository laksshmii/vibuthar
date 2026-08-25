import course1 from "@/assets/course-1.jpg";
import course2 from "@/assets/course-2.jpg";
import course3 from "@/assets/course-3.jpg";
import course4 from "@/assets/course-4.jpg";

export type Course = {
  id: string;
  title: string;
  track: string;
  duration: string;
  lessons: number;
  price: string;
  blurb: string;
  image: string;
};

export const courses: Course[] = [
  {
    id: "foundation",
    title: "Prelims Foundation",
    track: "Foundation",
    duration: "9 months",
    lessons: 214,
    price: "₹64,000",
    blurb: "A calm, structured runway through NCERTs, Polity, Economy and Environment.",
    image: course1,
  },
  {
    id: "geography",
    title: "Geography & Environment",
    track: "Optional",
    duration: "5 months",
    lessons: 128,
    price: "₹38,000",
    blurb: "Map-first teaching with visual atlases, case studies and answer frames.",
    image: course2,
  },
  {
    id: "mains-answer",
    title: "Mains Answer Writing",
    track: "Mains",
    duration: "6 months",
    lessons: 96,
    price: "₹42,000",
    blurb: "Weekly evaluated scripts with one-to-one mentor feedback within 48 hours.",
    image: course3,
  },
  {
    id: "ethics",
    title: "Ethics & Integrity (GS-IV)",
    track: "Mains",
    duration: "3 months",
    lessons: 54,
    price: "₹22,000",
    blurb: "Case-study driven sessions that turn abstract ethics into scoring answers.",
    image: course4,
  },
  {
    id: "csat",
    title: "CSAT Precision",
    track: "Prelims",
    duration: "2 months",
    lessons: 48,
    price: "₹16,000",
    blurb: "Aptitude, comprehension and reasoning drilled to exam-day speed.",
    image: course2,
  },
  {
    id: "interview",
    title: "Personality Test Studio",
    track: "Interview",
    duration: "8 weeks",
    lessons: 32,
    price: "₹28,000",
    blurb: "Mock boards with retired administrators and recorded self-review.",
    image: course4,
  },
];

export type UpcomingClass = {
  id: string;
  title: string;
  track: string;
  faculty: string;
  day: string;
  time: string;
  mode: string;
  seatsLeft: number;
  image: string;
};

export const upcomingClasses: UpcomingClass[] = [
  {
    id: "u1",
    title: "Polity Clinic — Basic Structure Doctrine",
    track: "Prelims",
    faculty: "R. Krishnan",
    day: "Mon, 31 Aug",
    time: "7:00 pm IST",
    mode: "Live online",
    seatsLeft: 12,
    image: course1,
  },
  {
    id: "u2",
    title: "Map Lab — Peninsular Rivers & Relief",
    track: "Optional",
    faculty: "S. Meera",
    day: "Wed, 2 Sep",
    time: "6:30 pm IST",
    mode: "Live online",
    seatsLeft: 8,
    image: course2,
  },
  {
    id: "u3",
    title: "Answer Writing Workshop — GS-II",
    track: "Mains",
    faculty: "A. Bhatt",
    day: "Thu, 3 Sep",
    time: "8:00 pm IST",
    mode: "Hybrid",
    seatsLeft: 20,
    image: course3,
  },
  {
    id: "u4",
    title: "Ethics Case Studies — Conflict of Interest",
    track: "Mains",
    faculty: "V. Nair",
    day: "Sat, 5 Sep",
    time: "10:30 am IST",
    mode: "Campus",
    seatsLeft: 6,
    image: course4,
  },
  {
    id: "u5",
    title: "CSAT Speed Drill — Data Interpretation",
    track: "Prelims",
    faculty: "S. Meera",
    day: "Sun, 6 Sep",
    time: "9:00 am IST",
    mode: "Live online",
    seatsLeft: 15,
    image: course2,
  },
  {
    id: "u6",
    title: "Mock Interview Board — Panel A",
    track: "Interview",
    faculty: "V. Nair",
    day: "Tue, 8 Sep",
    time: "4:00 pm IST",
    mode: "Campus",
    seatsLeft: 4,
    image: course4,
  },
];

export type Video = {
  id: string;
  title: string;
  subject: string;
  duration: string;
  faculty: string;
  progress: number;
  thumb: string;
};

export const videos: Video[] = [
  { id: "v1", title: "Constitutional Morality: Reading the Preamble", subject: "Polity", duration: "48:12", faculty: "R. Krishnan", progress: 62, thumb: course1 },
  { id: "v2", title: "Monsoon Systems & Indian Agriculture", subject: "Geography", duration: "1:02:40", faculty: "S. Meera", progress: 20, thumb: course2 },
  { id: "v3", title: "Fiscal Federalism after the 15th Finance Commission", subject: "Economy", duration: "55:03", faculty: "A. Bhatt", progress: 0, thumb: course3 },
  { id: "v4", title: "Ethics Case Study Clinic — Week 4", subject: "Ethics", duration: "39:27", faculty: "V. Nair", progress: 100, thumb: course4 },
  { id: "v5", title: "Modern India: Moderates to Extremists", subject: "History", duration: "1:11:18", faculty: "R. Krishnan", progress: 45, thumb: course1 },
  { id: "v6", title: "Answer Framing: The 250-Word Discipline", subject: "Mains", duration: "34:55", faculty: "S. Meera", progress: 8, thumb: course3 },
  { id: "v7", title: "Climate Diplomacy and India's Position", subject: "Environment", duration: "47:31", faculty: "A. Bhatt", progress: 0, thumb: course2 },
  { id: "v8", title: "Interview Board Simulation — Debrief", subject: "Interview", duration: "58:09", faculty: "V. Nair", progress: 73, thumb: course4 },
];

export const subjects = ["All", "Polity", "Geography", "Economy", "Ethics", "History", "Mains", "Environment", "Interview"];
