import { Coins } from "lucide-react";

/** Shows the person's AI credit balance. Server-rendered; no state. */
export function CreditsChip({ balance }: { balance: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-ld-surface-container-lowest px-3.5 py-1.5 text-ld-label-sm text-ld-on-surface ring-1 ring-ld-outline-variant/50">
      <Coins className="size-4 text-ld-primary" aria-hidden="true" />
      <span>
        <span className="font-semibold">{balance}</span> AI credits
      </span>
    </span>
  );
}
