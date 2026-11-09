import { SIGNUP_AI_CREDITS, PLAN_AI_CREDITS_PER_MONTH } from "@/config/ai-credits";

/** Landing page questions. Shown on the page and used for FAQ structured data, so both always match. */
export const LANDING_FAQS: { q: string; a: string }[] = [
  {
    q: "What is TaleTwo?",
    a: "TaleTwo is a private app for couples. It brings together a photo journal of shared memories, notes you both can edit, love letters that can be sealed until a special day, bucket lists, special days, a shared calendar and couple games.",
  },
  {
    q: "Is TaleTwo only for couples?",
    a: "TaleTwo is built for two partners. You can also invite family members to your space if you want to. There are no public followers or public feeds.",
  },
  {
    q: "Can my partner and I use the same private space?",
    a: "Yes. Every account gets a 6-character space code. Enter your partner's code and you are both in one private space, with a limit of two people.",
  },
  {
    q: "Can we save photos and memories?",
    a: `Yes. Save photos with places, dates and captions. The Free plan keeps up to 30 photos, Pro keeps up to 2,000, and Max has unlimited photos with fair use.`,
  },
  {
    q: "Is TaleTwo free to use?",
    a: "Yes. The Free plan costs nothing and needs no payment details. Pro and Max are paid plans for more room, billed for a month or a year. Subscriptions do not renew automatically.",
  },
  {
    q: "Does one subscription cover both partners?",
    a: "Yes. One payment covers the whole couple space, so both of you get the plan's features and limits.",
  },
  {
    q: "What are AI credits?",
    a: `Astro AI uses credits. Every new account starts with ${SIGNUP_AI_CREDITS}. Pro adds ${PLAN_AI_CREDITS_PER_MONTH.pro} each month and Max adds ${PLAN_AI_CREDITS_PER_MONTH.max}. Each reading costs a few credits, and the cost is shown before you use it.`,
  },
  {
    q: "Can we use TaleTwo on mobile?",
    a: "Yes. TaleTwo works in mobile browsers, so you can write a note or check an anniversary on the go.",
  },
];
