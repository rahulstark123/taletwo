import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What TaleTwo collects, why, where it is stored, who we share it with, and the rights you have over your information.",
  alternates: { canonical: "/privacy" },
  openGraph: { title: "TaleTwo Privacy Policy", url: "/privacy" },
};

const SECTIONS: LegalSection[] = [
  {
    heading: "1. Who we are",
    body: [
      "TaleTwo is a private app for two people to share memories, plans, notes and small daily moments. This policy explains what personal information we handle when you use TaleTwo, and why.",
      "TaleTwo is operated by [Legal entity name], [registered address]. Questions about this policy go to " + SITE.supportEmail + ".",
    ],
  },
  {
    heading: "2. What we collect",
    body: [
      "Account details: your name, email address, display name, time zone, relationship start date (if you add one) and profile photo (if you upload one). We never see your password. It is handled by our authentication provider, which stores only a secure hash.",
      "Your space: the photos, memories, notes, love letters, plans, bucket list items, special days, calendar events, daily question answers and reflections you add. Anything you add is shared only with the other person in your space.",
      "Preferences: your theme, reminder choices and the settings you change.",
      "Support: the tickets and suggestions you send, including the details you write in them.",
      "Payments: when you buy Pro or Max, we keep the order and payment reference, the plan, the amount, the date and the payment status. We do not receive or store your card or UPI details. Those are handled by Razorpay.",
      "AI credits: the credits in your balance and a record of each credit you spend or receive.",
      "Security events: sign-ins, failed sign-in attempts, password changes and space code changes, which we keep to protect your account.",
    ],
  },
  {
    heading: "3. How we use it",
    body: [
      "To run TaleTwo: to create your account, keep your space working, show your content to the right people and send the things you ask for.",
      "To keep it safe: to detect misuse, stop repeated guessing of space codes and investigate security problems.",
      "To handle payments and plans: to activate Pro or Max, add the monthly AI credits, issue receipts and invoices, and answer billing questions.",
      "To improve TaleTwo: we use support tickets and suggestions to fix problems and decide what to build next. We do not use the private content of your space to train AI models.",
      "We do not sell your personal information, and we do not show advertising based on it.",
    ],
  },
  {
    heading: "4. Who we share it with",
    body: [
      "Your partner: anything you add to your couple space is visible to them, as described in section 5.",
      "Service providers that help us run TaleTwo, and only as needed for that job: Supabase (sign-in and our database), Cloudflare R2 (photo storage), Razorpay (payments and receipts), and our hosting provider.",
      "AI providers: once Astro AI replies are connected, the question you ask and the birth details you choose to share will be sent to the AI provider to create a reply. Your partner space content is not sent unless you choose to include it in a question.",
      "Legal reasons: we may disclose information if the law requires it, or to protect the safety of people using TaleTwo.",
    ],
  },
  {
    heading: "5. Shared content and your partner",
    body: [
      "A couple space holds two people. Once you connect, you can both see the shared content in it: memories, notes, plans, calendar events and so on.",
      "Some things stay private to you until you choose otherwise. Your daily question answer is hidden until the reveal rule for your space is met. A private draft of a love letter is visible only to you.",
      "Leaving a space or changing its code does not delete content already shared. Deleting a shared item removes it for both of you.",
      "TaleTwo is a tool for two people, not a moderator of their relationship. TaleTwo is not responsible for harassment, abuse, coercion, threats, stalking, or any other harm caused by a partner, a former partner, a family member or any other user, including through content they post, share, withhold or delete. Where such harm happens, the person who caused it is responsible for their conduct.",
      "TaleTwo is also not responsible for any reply, suggestion or content produced by Astro AI, or for decisions you take based on it. AI replies can be wrong, and they are not a substitute for advice from a qualified professional or the police.",
      "If you are in danger, call your local emergency number first. You can report abusive content or behaviour to us through Support, and we will review reports and may remove content or suspend accounts. We may also share information where the law requires it. Reporting and removal are our choice and do not make us responsible for what happened before or outside TaleTwo.",
      "To the fullest extent the law allows, TaleTwo is not liable for any harm, loss or distress arising from harassment or abuse by any user or from any AI reply. Nothing in this policy excludes liability that the law does not allow us to exclude.",
    ],
  },
  {
    heading: "6. How long we keep it",
    body: [
      "We keep your information while your account is active. When you delete an item, it is hidden straight away and can be restored for a short time. After that it is removed from our systems within 30 days, except where we must keep a record for legal or accounting reasons.",
      "Payment and invoice records are kept for as long as the law requires for tax and accounting purposes.",
      "When you delete your account, we remove your personal information within 30 days, subject to the same legal exceptions.",
    ],
  },
  {
    heading: "7. Where it is stored and how it is protected",
    body: [
      "Your information is stored with our service providers, which may process it outside your country. We choose providers that protect information with industry-standard security.",
      "Photos are stored privately. Viewing a photo needs a short-lived link, issued only after the app has checked that you belong to the space that holds it.",
      "Data is encrypted in transit. Access to our systems is limited to the people who need it. No system is perfectly secure, so please use a strong password and keep your space code to yourselves.",
    ],
  },
  {
    heading: "8. Cookies and similar technology",
    body: [
      "We use cookies that keep you signed in and protect your session. These are needed for TaleTwo to work.",
      "We do not use advertising cookies or third-party tracking in the app. If that changes, we will update this policy and ask for your consent where the law requires it.",
    ],
  },
  {
    heading: "9. Your rights",
    body: [
      "You can ask us to tell you what personal information we hold about you, to correct it, to delete it, to give you a copy in a usable format, or to stop using it for a particular purpose. You can also withdraw consent you have given.",
      "Most of this you can do yourself in the app: edit your profile, change your password, change your space name or code, delete content and manage your photos. For anything else, write to " + SITE.supportEmail + ". We will respond within a reasonable time, and within the time the law requires.",
      "If you are not satisfied with our answer, you can raise a complaint with the data protection authority in your country.",
    ],
  },
  {
    heading: "10. Children",
    body: [
      "TaleTwo is for adults aged 18 and over. We do not knowingly collect information from anyone under that age. If you believe a child has given us information, contact us and we will delete it.",
    ],
  },
  {
    heading: "11. Changes to this policy",
    body: [
      "We may update this policy as TaleTwo changes. For important changes we will tell you in the app or by email before they take effect. The date at the top shows when it was last updated.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="Last updated 9 November 2026"
      sections={SECTIONS}
      notice="This policy is a complete draft for TaleTwo. Before launch, a qualified lawyer should check it against the laws that apply to you, including India's Digital Personal Data Protection Act, 2023. Fill in the bracketed details first."
    />
  );
}
