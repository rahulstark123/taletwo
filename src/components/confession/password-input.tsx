"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel: string;
  autoComplete?: string;
  autoFocus?: boolean;
}

/** Password field with a button to show or hide what has been typed. */
export function PasswordInput({ value, onChange, placeholder, ariaLabel, autoComplete = "off", autoFocus }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest pl-4 pr-12 text-ld-body-md text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none"
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
