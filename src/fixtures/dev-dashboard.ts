/**
 * DEVELOPMENT FIXTURES — Milestone 1 only. Names are placeholders.
 *
 * These values exist so the dashboard and app shell can be designed before the
 * database layer exists (Milestone 2+). They are NOT user data, must never be
 * imported by production persistence code, and are replaced by Prisma queries
 * in Milestone 4. Names and dates are invented placeholders.
 */

export const DEV_FIXTURE_LABEL = "Development fixtures";

export const devCouple = {
  me: { displayName: "Raj", initials: "R" },
  partner: { displayName: "Simran", initials: "S" },
  /** Relationship start date (calendar date, timezone-independent). */
  relationshipStart: { year: 2024, month: 3, day: 14 },
  /** Anniversary is the same month/day as the relationship start. */
  timezone: "UTC",
  plan: "free" as "free" | "premium",
};

export const devMemories = [
  {
    id: "m1",
    title: "The little cafe by the harbour",
    date: "2026-10-18",
    location: "Lisbon",
    caption: "Two cardamom buns, one shared window seat and the longest conversation we have had in months.",
    favourite: true,
    photoCount: 6,
    tone: "rose" as const,
  },
  {
    id: "m2",
    title: "Rainy Sunday, first attempt at pancakes",
    date: "2026-10-04",
    location: null,
    caption: "The first batch was a disaster. The second one was perfect.",
    favourite: false,
    photoCount: 3,
    tone: "stone" as const,
  },
  {
    id: "m3",
    title: "Hills at dawn",
    date: "2026-09-21",
    location: "Ooty",
    caption: "We woke up at five for this and would do it again tomorrow.",
    favourite: true,
    photoCount: 9,
    tone: "sage" as const,
  },
];

export const devNotes = [
  {
    id: "n1",
    title: "Things to pick up this weekend",
    excerpt: "Good coffee beans, the blue candles, and something for the balcony plants.",
    author: "Simran",
    updatedAt: "2026-11-07T18:20:00Z",
    pinned: true,
  },
  {
    id: "n2",
    title: "Ideas for our next anniversary dinner",
    excerpt: "Somewhere with a view, no rush, and a playlist from the first year.",
    author: "Raj",
    updatedAt: "2026-11-03T09:05:00Z",
    pinned: false,
  },
];

export const devBucketList = {
  total: 12,
  completed: 4,
  nextItems: [
    { id: "b1", title: "Watch the northern lights", category: "Travel" },
    { id: "b2", title: "Cook a five-course dinner together", category: "Food" },
    { id: "b3", title: "Learn to sail a small boat", category: "Adventures" },
  ],
};

export const devDailyQuestion = {
  id: "q1",
  category: "Romance" as const,
  question: "What is one little thing I do that makes you happy?",
  myAnswerSubmitted: true,
  partnerAnswered: false,
};

export const devPlans = [
  {
    id: "p1",
    title: "Date night at the rooftop jazz bar",
    type: "Date night" as const,
    when: "2026-11-14T19:30:00Z",
    location: "Old Town",
    checklistDone: 1,
    checklistTotal: 3,
  },
  {
    id: "p2",
    title: "Weekend in the hills",
    type: "Trip" as const,
    when: "2026-12-05T06:00:00Z",
    location: "Coorg",
    checklistDone: 0,
    checklistTotal: 5,
  },
];

export const devUpcomingSpecialDay = {
  label: "Our anniversary",
  month: 3,
  day: 14,
};

export const devActivity = [
  { id: "a1", actor: "Simran", text: "added a memory", target: "Hills at dawn", at: "2026-11-07T20:10:00Z" },
  { id: "a2", actor: "Raj", text: "completed a bucket list dream", target: "Visit the botanical garden", at: "2026-11-06T11:00:00Z" },
  { id: "a3", actor: "Simran", text: "wrote a note", target: "Things to pick up this weekend", at: "2026-11-05T16:40:00Z" },
  { id: "a4", actor: "Raj", text: "sent a love letter", target: "Open when you need a smile", at: "2026-11-02T08:15:00Z" },
];
