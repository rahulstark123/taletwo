import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { BucketBoard } from "@/components/bucket/bucket-board";
import { getCurrentUser } from "@/server/authorization/session";
import { listBucketItems } from "@/server/services/bucket";

export const metadata: Metadata = {
  title: "Bucket list",
  robots: { index: false, follow: false },
};

export default function BucketListPage() {
  return (
    <Suspense fallback={<BucketSkeleton />}>
      <BucketContent />
    </Suspense>
  );
}

async function BucketContent() {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const payload = await listBucketItems(user.id);
  return <BucketBoard initial={payload} />;
}

function BucketSkeleton() {
  return (
    <div role="status" aria-label="Loading your bucket list" className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr]">
        <div className="h-36 animate-pulse rounded-3xl bg-ld-surface-container" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-ld-surface-container" />
          ))}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-56 animate-pulse rounded-3xl bg-ld-surface-container" />
        ))}
      </div>
    </div>
  );
}
