import type { Metadata } from "next";
import { LettersBoard } from "@/components/letters/letters-board";
import { devCouple } from "@/fixtures/dev-dashboard";
import { devLetters } from "@/fixtures/dev-letters";

export const metadata: Metadata = {
  title: "Love letters",
  robots: { index: false, follow: false },
};

/** Love letters. UI on development fixtures: letters are not saved yet. */
export default function LettersPage() {
  return (
    <LettersBoard
      initial={devLetters}
      currentName={devCouple.me.displayName}
      partnerName={devCouple.partner.displayName}
    />
  );
}
