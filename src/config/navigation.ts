import {
  Stars,
  CalendarDays,
  Gamepad2,
  Gem,
  Crown,
  Home,
  Images,
  LifeBuoy,
  ListChecks,
  Mail,
  MessageCircleHeart,
  NotebookPen,
  Route,
  Settings,
  Tv,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Shows a "Soon" badge. The page exists but the feature is not released yet. */
  soon?: boolean;
}

export const MARKETING_NAV = [
  { label: "Features", href: "/features" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
] as const;

export const APP_NAV_SPACE: NavItem[] = [
  { label: "Home", href: "/app", icon: Home },
  { label: "Memories", href: "/app/memories", icon: Images },
  { label: "Our Notes", href: "/app/notes", icon: NotebookPen },
  { label: "Love Letters", href: "/app/letters", icon: Mail },
  { label: "Our Plans", href: "/app/plans", icon: Route },
  { label: "Bucket List", href: "/app/bucket-list", icon: ListChecks },
  { label: "Special Days", href: "/app/special-days", icon: Gem },
  { label: "Daily Questions", href: "/app/daily-question", icon: MessageCircleHeart },
  { label: "Calendar", href: "/app/calendar", icon: CalendarDays },
  { label: "Games", href: "/app/games", icon: Gamepad2 },
  { label: "Astro AI", href: "/app/astro-ai", icon: Stars },
  { label: "Family", href: "/app/family", icon: Users, soon: true },
  { label: "Party Room", href: "/app/party-room", icon: Tv, soon: true },
];

export const APP_NAV_ACCOUNT: NavItem[] = [
  { label: "Subscriptions", href: "/app/subscriptions", icon: Crown },
  { label: "Support", href: "/app/support", icon: LifeBuoy },
];

/** Profile and Settings live in the top bar, not the sidebar. Kept here for page titles. */
export const APP_NAV_TOP_LINKS: NavItem[] = [
  { label: "Profile", href: "/app/profile", icon: UserRound },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

/**
 * Milestone-1 placeholder routes. They render the real shell and state which
 * milestone delivers the feature, so no navigation item leads to a 404.
 */
export const APP_MODULE_STATUS: Record<string, { title: string; milestone: string; blurb: string }> = {
};
