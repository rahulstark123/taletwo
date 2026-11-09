/**
 * Western numerology, computed locally from a date of birth. No network, no AI.
 * Life Path: add every digit of the date (DD, MM, YYYY) and reduce to one digit,
 * keeping 11, 22 and 33 as master numbers.
 */

const MASTER = new Set([11, 22, 33]);

function digitSum(n: number): number {
  return String(n)
    .split("")
    .reduce((sum, d) => sum + Number(d), 0);
}

/** Returns the Life Path number for an ISO date (YYYY-MM-DD), or null if the input is not a valid date. */
export function lifePathNumber(isoDate: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== isoDate) return null;

  let total = digitSum(Number(d)) + digitSum(Number(m)) + digitSum(Number(y));
  while (total > 9 && !MASTER.has(total)) {
    total = digitSum(total);
  }
  return total;
}

export const LIFE_PATH_MEANINGS: Record<number, { title: string; text: string }> = {
  1: { title: "The Leader", text: "Independent and driven. In a partnership you bring initiative and clear direction." },
  2: { title: "The Peacemaker", text: "Gentle, intuitive and cooperative. You bring harmony and patience to a shared life." },
  3: { title: "The Expresser", text: "Warm, playful and creative. You keep the relationship joyful and full of conversation." },
  4: { title: "The Builder", text: "Steady, practical and loyal. You turn shared plans into a stable home." },
  5: { title: "The Explorer", text: "Adventurous and curious. You bring variety, travel and fresh experiences." },
  6: { title: "The Nurturer", text: "Caring and responsible. You naturally look after family and the people you love." },
  7: { title: "The Seeker", text: "Reflective and thoughtful. You value depth, quiet time and honest conversation." },
  8: { title: "The Achiever", text: "Ambitious and capable. You bring focus to goals, money and building a future." },
  9: { title: "The Humanitarian", text: "Compassionate and generous. You see the bigger picture and forgive easily." },
  11: { title: "The Intuitive (master)", text: "Sensitive and inspired. You read people well and bring vision to the relationship." },
  22: { title: "The Master Builder (master)", text: "Practical and visionary. You can turn big dreams into something real, together." },
  33: { title: "The Master Teacher (master)", text: "Caring and wise. You lead with compassion and help others grow." },
};
