import { Wordmark } from "@/components/brand/logo";
import { AppNavList } from "@/components/layout/app-nav";

const LINES = [
  "Love is the best feeling in the world.",
  "Beauty lies inside you, and it shows.",
  "Two hearts, one little world.",
  "Small moments make the biggest stories.",
  "Home is wherever you are together.",
  "Be kind to each other, every day.",
  "Your favourite person is right here.",
];

/** One line per day, the same for everyone that day. Picked from the UTC date, so server and browser agree. */
function dailyLine() {
  const day = Math.floor(Date.now() / 86_400_000);
  return LINES[day % LINES.length];
}

/** Fixed desktop sidebar (1024px and up). */
export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center px-6">
        <Wordmark />
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-2">
        <AppNavList />
      </div>
      <p className="mx-6 mb-6 font-display text-[13px] italic leading-snug text-muted-foreground">&ldquo;{dailyLine()}&rdquo;</p>
    </aside>
  );
}
