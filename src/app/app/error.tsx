"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Error boundary for /app. Shows a safe message only; details stay in logs. */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Milestone 2 forwards this to the error-monitoring service.
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="surface-card mx-auto flex max-w-lg flex-col items-center gap-4 p-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-error/10 text-error">
        <TriangleAlert className="size-5" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <h2 className="text-card-title text-foreground">Something went a little wrong.</h2>
        <p className="text-sm text-muted-foreground">Your memories are safe. Please try again in a moment.</p>
      </div>
      <Button onClick={() => reset()}>
        <RotateCcw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}
