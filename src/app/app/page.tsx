import type { Metadata } from "next";
import { connection } from "next/server";
import { HomeHeader } from "@/components/home/home-header";
import {
  AnniversaryCard,
  BucketListProgressCard,
  DailyQuestionCard,
  AddPartnerCard,
  NoSpecialDayCard,
  PremiumUpgradeCard,
  RecentActivityCard,
  RecentMemoriesCard,
  RecentNotesCard,
  UpcomingPlansCard,
} from "@/components/home/home-cards";
import { requireVerifiedUser } from "@/server/authorization/session";
import { getHomeData } from "@/server/services/home";

export const metadata: Metadata = {
  title: "Home",
  robots: { index: false, follow: false },
};

/** Home dashboard. Every card reads from the same data the home API returns, for this couple only. */
export default async function DashboardPage() {
  // Greeting, counters and "days to go" depend on the current time, so render per request.
  await connection();
  const user = await requireVerifiedUser();
  const data = await getHomeData(user.id);
  const now = new Date(data.now);
  const { timezone, couple } = data;
  const partnerName = couple.partner?.displayName ?? "Your partner";

  return (
    <div className="space-y-8 md:space-y-10">
      <HomeHeader
        name={couple.me.displayName}
        initial={couple.me.initials}
        partner={couple.partner ? { name: couple.partner.displayName, initial: couple.partner.initials } : null}
        relationshipStart={couple.relationshipStart}
        timezone={timezone}
        now={now}
      />

      {couple.memberCount < 2 && <AddPartnerCard />}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <RecentMemoriesCard memories={data.memories} />
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-8 lg:col-span-5">
          <DailyQuestionCard
            question={data.dailyQuestion.text}
            category={data.dailyQuestion.category}
            myAnswerSubmitted={data.dailyQuestion.myAnswerSubmitted}
            partnerAnswered={data.dailyQuestion.partnerAnswered}
            partnerName={partnerName}
          />
        </div>

        <div className="lg:col-span-4">
          {data.nextAnniversary ? (
            <AnniversaryCard
              label={data.nextAnniversary.label}
              month={data.nextAnniversary.month}
              day={data.nextAnniversary.day}
              timezone={timezone}
              now={now}
            />
          ) : (
            <NoSpecialDayCard />
          )}
        </div>
        <div className="lg:col-span-4">
          <RecentNotesCard notes={data.notes} />
        </div>
        <div className="lg:col-span-4">
          <UpcomingPlansCard plans={data.upcomingPlans} timezone={timezone} />
        </div>

        <div className="lg:col-span-5">
          <BucketListProgressCard total={data.bucket.total} completed={data.bucket.completed} nextItems={data.bucket.nextItems} />
        </div>
        <div className="lg:col-span-7">
          <RecentActivityCard items={data.activity} timezone={timezone} />
        </div>
      </div>

      {data.plan.plan === "free" && <PremiumUpgradeCard />}
    </div>
  );
}
