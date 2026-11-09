"use client";

import { useEffect, useId } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** A small "are you sure" dialog. Escape or the backdrop cancels, unless an action is running. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  busy = false,
  destructive = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  busy?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ld-on-surface/40 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && !busy && onCancel()}
    >
      <div role="alertdialog" aria-modal="true" aria-labelledby={titleId} className="w-full max-w-md space-y-5 rounded-3xl bg-ld-surface-container-lowest p-6 shadow-xl sm:p-7">
        <div className="flex items-start gap-3">
          <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-2xl", destructive ? "bg-ld-error-container text-ld-on-error-container" : "bg-ld-secondary-container/50 text-ld-primary")}>
            <AlertTriangle className="size-5" aria-hidden="true" />
          </span>
          <div className="space-y-1.5">
            <h2 id={titleId} className="font-display text-ld-title-lg text-ld-on-surface">
              {title}
            </h2>
            <p className="text-ld-body-sm text-ld-on-surface-variant">{description}</p>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={busy} className="h-11 rounded-xl px-5 text-ld-label-md text-ld-on-surface-variant hover:bg-ld-surface-container disabled:opacity-50">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-ld-label-md disabled:opacity-60",
              destructive ? "bg-ld-error text-ld-on-error" : "bg-ld-primary text-ld-on-primary"
            )}
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
