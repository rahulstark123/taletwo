"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes, type Ref } from "react";
import { cn } from "@/lib/utils";
import { inputClass } from "@/components/auth/form-field";

type PasswordFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  ref?: Ref<HTMLInputElement>;
};

/** Password input with a show/hide toggle. The toggle is a real button with a label. */
export function PasswordField({ id, className, ref, ...rest }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        {...rest}
        ref={ref}
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={rest.autoComplete ?? "current-password"}
        className={cn(inputClass, "pr-12", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-ld-on-surface-variant transition-colors hover:bg-ld-surface-container hover:text-ld-on-surface"
      >
        {visible ? <EyeOff className="size-[18px]" aria-hidden="true" /> : <Eye className="size-[18px]" aria-hidden="true" />}
      </button>
    </div>
  );
}
