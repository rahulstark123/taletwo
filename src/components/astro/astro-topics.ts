import { Briefcase, CalendarDays, HeartHandshake, HeartPulse, MessageCircle, Sun, Wallet, Hash, type LucideIcon } from "lucide-react";

export type AstroStatus = "preview" | "soon";

export interface AstroTopic {
  slug: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
  cover: string;
  status: AstroStatus;
  /** Sample questions that a user can tap to start a conversation. */
  samples: string[];
  /** Short note on what the topic uses, for transparency. */
  basis: string;
}

export const ASTRO_TOPICS: AstroTopic[] = [
  {
    slug: "chat",
    title: "Chat with Astro AI",
    blurb: "Ask anything. Answers draw on your date, time and place of birth, in the Indian (Vedic) tradition.",
    icon: MessageCircle,
    cover: "from-ld-secondary-container via-[#fbe3e6] to-ld-surface-container",
    status: "preview",
    samples: ["What does my chart say about my career this year?", "What is a good period for us to plan a trip?", "How can I be more patient in arguments?"],
    basis: "Date, time and place of birth (Vedic astrology)",
  },
  {
    slug: "partnership",
    title: "Partnership compatibility",
    blurb: "See how your charts and numbers fit together, with gentle notes on strengths and where to grow.",
    icon: HeartHandshake,
    cover: "from-ld-tertiary-fixed via-ld-surface-container to-ld-surface",
    status: "soon",
    samples: ["How compatible are our charts?", "Which of our strengths work best together?"],
    basis: "Both partners' birth details (Guna matching) and numerology",
  },
  {
    slug: "numerology",
    title: "Numerology",
    blurb: "Your Life Path number from your date of birth, with what it says about your nature and journey.",
    icon: Hash,
    cover: "from-[#ebe3f2] via-ld-surface-container to-ld-surface",
    status: "preview",
    samples: ["What is my life path number?", "What does my number say about love?"],
    basis: "Date of birth (Western numerology)",
  },
  {
    slug: "finance",
    title: "Finance",
    blurb: "Money conversations for couples: saving goals, budgets and timing for big decisions.",
    icon: Wallet,
    cover: "from-[#fbe3c9] via-ld-surface-container to-ld-surface",
    status: "soon",
    samples: ["When is a good time for us to start an investment?", "How should we split shared expenses?"],
    basis: "Birth details and your saving goals",
  },
  {
    slug: "career",
    title: "Career",
    blurb: "Timing and strengths for work, study and new beginnings, shared with care.",
    icon: Briefcase,
    cover: "from-[#dfe9f3] via-ld-surface-container to-[#f4efe6]",
    status: "soon",
    samples: ["When is a good time to change jobs?", "What work suits my strengths?"],
    basis: "Birth details (Vedic astrology)",
  },
  {
    slug: "health",
    title: "Health and wellbeing",
    blurb: "Gentle, non-medical guidance on rest, routine and balance, based on your chart.",
    icon: HeartPulse,
    cover: "from-ld-tertiary-fixed/70 via-ld-surface-container to-ld-surface",
    status: "soon",
    samples: ["How can I rest better this month?", "What routine suits my energy?"],
    basis: "Birth details. Not medical advice.",
  },
  {
    slug: "daily-horoscope",
    title: "Daily horoscope",
    blurb: "A short note for today for each of you, to start the day with intention.",
    icon: Sun,
    cover: "from-[#f5ead7] via-ld-surface-container to-ld-surface",
    status: "soon",
    samples: ["What is my note for today?"],
    basis: "Birth details (Moon sign)",
  },
  {
    slug: "festivals",
    title: "Festivals and auspicious days",
    blurb: "Good dates for celebrations, engagements and new beginnings, with the festival calendar.",
    icon: CalendarDays,
    cover: "from-ld-secondary-container/70 via-ld-tertiary-fixed/40 to-ld-surface-container",
    status: "soon",
    samples: ["Which date is good for our engagement?", "What festivals are coming up for us?"],
    basis: "Festival calendar and birth details",
  },
];

export function findTopic(slug: string) {
  return ASTRO_TOPICS.find((t) => t.slug === slug) ?? null;
}

