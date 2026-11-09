import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/logo";
import { AuthDoodles, CoupleOnBench } from "@/components/auth/auth-doodles";

/** Centred, calm card layout shared by all account pages. */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-ld-surface px-5 py-14 text-ld-on-surface">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-ld-secondary-container/30 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -right-16 size-72 rounded-full bg-ld-tertiary-fixed/40 blur-3xl" />
      <AuthDoodles />
      <CoupleOnBench />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="TaleTwo home" className="rounded-md">
            <Wordmark href="" />
          </Link>
        </div>

        <main className="rounded-3xl bg-ld-surface-container-lowest p-7 shadow-[0_20px_50px_-10px_rgba(64,56,50,0.12)] sm:p-9">
          <div className="mb-7 space-y-2 text-center">
            <h1 className="font-display text-ld-headline-lg-mobile text-ld-on-surface md:text-ld-headline-lg">{title}</h1>
            <p className="text-ld-body-sm text-ld-on-surface-variant">{description}</p>
          </div>
          {children}
        </main>

        {footer && <div className="mt-6 text-center text-ld-body-sm text-ld-on-surface-variant">{footer}</div>}
      </div>
    </div>
  );
}
