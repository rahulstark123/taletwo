/**
 * DEVELOPMENT FIXTURES: love letters. UI only. Nothing here is saved to the database yet.
 * Names and text are invented placeholders.
 */
export type LetterKind = "received" | "sent" | "draft" | "scheduled";
export type PaperStyle = "CREAM" | "ROSE" | "SAGE" | "LAVENDER";

export interface LetterFixture {
  id: string;
  kind: LetterKind;
  title: string;
  body: string;
  from: string;
  to: string;
  paper: PaperStyle;
  occasion: string;
  createdAt: string;
  /** When a sealed letter opens. Null means it can be read now. */
  opensAt: string | null;
  read: boolean;
}

export const devLetters: LetterFixture[] = [
  {
    id: "l1",
    kind: "received",
    title: "Good morning, my love",
    body: "I left the cinnamon latte beans in the cabinet and the blue mug is already warm. Have the softest day, and call me the moment you can. I will be thinking about you all through the meeting.",
    from: "Simran",
    to: "Raj",
    paper: "ROSE",
    occasion: "Just because",
    createdAt: "2026-11-08T06:40:00Z",
    opensAt: null,
    read: false,
  },
  {
    id: "l2",
    kind: "received",
    title: "For the days you miss me",
    body: "If you are reading this on a long day, take a breath. You are loved more than you know, and I am only a message away. Come home soon, the sofa is missing you.",
    from: "Simran",
    to: "Raj",
    paper: "SAGE",
    occasion: "Open when you miss me",
    createdAt: "2026-10-30T19:10:00Z",
    opensAt: null,
    read: true,
  },
  {
    id: "l3",
    kind: "received",
    title: "Our second year",
    body: "Two years ago today we did not know how much of our story was still ahead. I opened this letter early in my head a hundred times. Happy anniversary, my favourite person.",
    from: "Simran",
    to: "Raj",
    paper: "LAVENDER",
    occasion: "Open on our anniversary",
    createdAt: "2026-11-01T10:00:00Z",
    opensAt: "2026-11-18T00:00:00Z",
    read: false,
  },
  {
    id: "l4",
    kind: "sent",
    title: "Thank you for the coffee",
    body: "You make the hardest mornings feel light. Thank you for showing up for me every single day, even the ones I did not say it out loud.",
    from: "Raj",
    to: "Simran",
    paper: "CREAM",
    occasion: "Just because",
    createdAt: "2026-11-05T08:20:00Z",
    opensAt: null,
    read: true,
  },
  {
    id: "l5",
    kind: "draft",
    title: "",
    body: "Things I want to say when we are on the hill this weekend…",
    from: "Raj",
    to: "Simran",
    paper: "ROSE",
    occasion: "Just because",
    createdAt: "2026-11-07T21:05:00Z",
    opensAt: null,
    read: true,
  },
  {
    id: "l6",
    kind: "scheduled",
    title: "For when you need a smile",
    body: "Remember the terrible pancakes? I would eat every single one of them again, just to hear you laugh about it.",
    from: "Raj",
    to: "Simran",
    paper: "SAGE",
    occasion: "Open when you need a smile",
    createdAt: "2026-11-03T12:00:00Z",
    opensAt: "2026-11-20T09:00:00Z",
    read: true,
  },
];

export const LETTER_OCCASIONS = [
  "Just because",
  "Open when you miss me",
  "Open when you feel sad",
  "Open on our anniversary",
  "Open when you need motivation",
  "Open when you need a smile",
] as const;

export const LETTER_TEMPLATES = [
  {
    key: "blank",
    label: "Blank page",
    body: "",
  },
  {
    key: "morning",
    label: "Good morning",
    body: "Good morning, my love. I hope your coffee is warm and your day is kind to you. I am thinking of you.",
  },
  {
    key: "miss",
    label: "I miss you",
    body: "I miss the sound of your laugh in the next room. Counting the hours until I can hold your hand again.",
  },
  {
    key: "thanks",
    label: "Thank you",
    body: "Thank you for the small things you do every day. They add up to a whole life I am grateful for.",
  },
  {
    key: "anniversary",
    label: "Our anniversary",
    body: "Every year with you is my favourite year. Here is to the next one, and the one after that.",
  },
  {
    key: "smile",
    label: "Need a smile",
    body: "Here is a little reminder: you are brilliant, you are loved, and I think you look incredible when you are concentrating.",
  },
] as const;
