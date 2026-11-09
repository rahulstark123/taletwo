import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <Wordmark />
      <div className="space-y-2">
        <p className="text-eyebrow">Page not found</p>
        <h1 className="text-page-title text-foreground">This moment isn&apos;t here.</h1>
        <p className="text-sm text-muted-foreground">The page you are looking for may have moved.</p>
      </div>
      <Button render={<Link href="/" />}>Back to home</Button>
    </div>
  );
}
