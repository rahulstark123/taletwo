"use client";

import { useCallback, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
}

/**
 * Asks before a destructive action. `await confirm({...})` resolves to true only if the person presses
 * the confirm button. Render `dialog` once in the component's returned tree.
 */
export function useConfirm() {
  const [pending, setPending] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolver.current = resolve;
        setPending(options);
      }),
    []
  );

  function close(value: boolean) {
    resolver.current?.(value);
    resolver.current = null;
    setPending(null);
  }

  const dialog = pending ? (
    <ConfirmDialog
      open
      title={pending.title}
      description={pending.description}
      confirmLabel={pending.confirmLabel ?? "Delete"}
      destructive
      onConfirm={() => close(true)}
      onCancel={() => close(false)}
    />
  ) : null;

  return { confirm, dialog };
}
