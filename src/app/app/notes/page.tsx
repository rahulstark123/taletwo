import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { NotesBoard } from "@/components/notes/notes-board";
import { getCurrentUser } from "@/server/authorization/session";
import { listNotes } from "@/server/services/notes";

export const metadata: Metadata = {
  title: "Our notes",
  robots: { index: false, follow: false },
};

export default function NotesPage() {
  return (
    <Suspense fallback={<NotesSkeleton />}>
      <NotesContent />
    </Suspense>
  );
}

async function NotesContent() {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const payload = await listNotes(user.id);
  return <NotesBoard initial={payload} />;
}

function NotesSkeleton() {
  return (
    <div role="status" aria-label="Loading your notes" className="space-y-6">
      <div className="h-10 w-48 animate-pulse rounded-full bg-ld-surface-container" />
      <div className="h-11 w-full animate-pulse rounded-full bg-ld-surface-container" />
      <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
        {[180, 140, 220, 160, 200, 120].map((h, i) => (
          <div key={i} className="mb-4 break-inside-avoid animate-pulse rounded-3xl bg-ld-surface-container" style={{ height: h }} />
        ))}
      </div>
    </div>
  );
}
