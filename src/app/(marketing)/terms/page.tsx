import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service for TaleTwo",
  description: "The rules for using TaleTwo: your account, your couple space, subscriptions, AI credits and what we and you can expect from each other.",
  alternates: { canonical: "/terms" },
  openGraph: { title: "TaleTwo Terms of Service", url: "/terms" },
};

const SECTIONS: LegalSection[] = [
  {
    heading: "1. Agreement",
    body: [
      "These terms are an agreement between you and [Legal entity name], which runs TaleTwo. By creating an account or using TaleTwo, you agree to them and to our Privacy Policy. If you do not agree, do not use TaleTwo.",
    ],
  },
  {
    heading: "2. Who can use TaleTwo",
    body: [
      "You must be at least 18 years old and able to form a binding agreement where you live. You must give accurate details when you sign up and keep them up to date.",
      "You may use TaleTwo only for your own private, personal use with your partner. It is not a public social network, and it is not for business use.",
    ],
  },
  {
    heading: "3. Your account and your couple space",
    body: [
      "Keep your password secret. You are responsible for activity on your account. Tell us straight away if you think someone else has accessed it.",
      "Each account has one space code. A couple space holds exactly two people. Treat your space code like a key: share it only with the person you want in your space, because anyone who has it can join while the space has a free seat.",
      "You can change your space code in Settings. Doing so stops the old code from working straight away.",
    ],
  },
  {
    heading: "4. Your content",
    body: [
      "You keep ownership of what you add to TaleTwo, such as photos, memories, notes and letters. You are responsible for it, and you must have the right to share any photo or text you add, including the rights of people who appear in photos.",
      "You give us permission to store, process and show your content to you and to your partner, only so that TaleTwo can work as intended. We do not claim ownership of your content.",
    ],
  },
  {
    heading: "5. Acceptable use",
    body: [
      "Do not use TaleTwo to harass, threaten, defame or impersonate anyone, to share content you have no right to share, or to upload anything illegal, sexual content involving minors, or malware.",
      "Do not try to break into accounts, guess space codes, reverse-engineer the service, overload it, or bypass limits or payments.",
      "Sexual content: do not upload, write or share sexually explicit or pornographic material in TaleTwo. Any sexual content that involves a minor, or that is shared without the consent of everyone shown in it, is prohibited and will be reported to the authorities where required by law.",
      "Abuse and intimate content: do not use TaleTwo to threaten, coerce, blackmail or abuse anyone, and do not store or share intimate images of another person without their consent.",
      "We may remove content or suspend accounts that break these rules, and we will tell you why where we can.",
    ],
  },
  {
    heading: "6. Plans and payments",
    body: [
      "TaleTwo has a Free plan, and paid Pro and Max plans. Prices, limits and the features in each plan are shown in the app before you pay.",
      "Pro and Max are one-time payments for one month or one year. They do not renew automatically, so there is no recurring charge to cancel. When a paid period ends, your space returns to the Free plan, and your content stays in place. Buying again while a period is running adds time to the end of it.",
      "One payment covers the whole couple space. Payments are processed by Razorpay, and taxes, if any, are shown at checkout.",
      "Questions about a payment can be sent to " + SITE.supportEmail + ".",
      "We may change prices for future periods. We will tell you before a change applies to a plan you already bought.",
    ],
  },
  {
    heading: "7. AI credits and Astro AI",
    body: [
      "Astro AI uses AI credits. Every new account starts with a set number of credits, and paid plans add credits each month, as shown in the app. Each use of an Astro AI feature costs the credits shown before you use it.",
      "AI credits have no cash value. They cannot be sold, transferred or exchanged. Unused credits stay on your account while it is active.",
      "Astro AI is offered for reflection and entertainment. Its astrology, numerology and other replies may be wrong, incomplete or out of date. They are not medical, legal, financial, safety or professional advice. Do not rely on them for important decisions, and speak to a qualified professional when you need one.",
    ],
  },
  {
    heading: "8. Support",
    body: [
      "You can raise a ticket or send a suggestion from inside the app. We read them and reply where we can. Please do not send passwords, card numbers or other sensitive details in a ticket.",
    ],
  },
  {
    heading: "9. Changes to TaleTwo",
    body: [
      "We are always improving TaleTwo, so features may change, be added or be removed. We will try to give notice of changes that matter to you. Features marked as preview or coming soon may change before they are released.",
    ],
  },
  {
    heading: "10. Ending your account",
    body: [
      "You can stop using TaleTwo at any time. To delete your account and your personal information, use the request option in Support. Deleting an account removes your content from your partner's view too, and we explain in our Privacy Policy how long records are kept.",
      "We may suspend or end an account that breaks these terms.",
    ],
  },
  {
    heading: "11. Disclaimers",
    body: [
      "TaleTwo is provided as it is and as it is available. We work hard to keep it running and your content safe, but we do not promise that it will always be available, error-free or free of loss. Keep your own copies of anything that matters most.",
      "Conduct between partners: TaleTwo connects two people but does not control how they behave toward each other. TaleTwo is not responsible for any harassment, abuse, coercion, threats, stalking, intimidation or other harm caused by a partner, former partner, family member or any other user, whether through content they add, share, hide, edit or delete, or through any other means inside or outside the app. Anyone who causes harm is responsible for their own conduct.",
      "AI replies: Astro AI and any other AI feature produce content automatically. TaleTwo is not responsible for any reply, suggestion, prediction or score it gives, or for anything you or anyone else does because of it. Do not rely on AI output for medical, legal, financial, safety or relationship decisions that carry real risk.",
      "Content and responsibility: you and your partner are solely responsible for everything you add, write, send or share in your couple space, including any sexual content, and for any abuse, harassment, threats or other harm that happens between you or to anyone else. TaleTwo does not take responsibility for that content or conduct, and it is not liable for any loss, distress or consequence that arises from it, to the fullest extent the law allows. TaleTwo does not pre-screen private content, and it has no duty to monitor your space.",
      "Safety: if you are in danger, contact your local emergency services first. You can report abusive content or behaviour through Support. We review reports and may remove content, restrict or suspend accounts, and cooperate with lawful requests from authorities. Taking action after a report is at our discretion and does not make TaleTwo responsible for harm that happened before or outside the app.",
    ],
  },
  {
    heading: "12. Limitation of liability",
    body: [
      "To the extent the law allows, our total liability to you for any claim about TaleTwo is limited to the amount you paid us for your plan in the 12 months before the claim. We are not liable for indirect or consequential losses, lost content caused by you, or decisions you make based on Astro AI replies.",
      "This limit and the exclusions above apply in particular to harassment or abuse by any user and to anything an AI feature produces. TaleTwo is not responsible for such harm to the fullest extent the law allows.",
      "Nothing in these terms limits liability that cannot be limited by law, including for death or personal injury caused by negligence, or for fraud.",
    ],
  },
  {
    heading: "13. Governing law",
    body: [
      "These terms are governed by the laws of India. Courts in [city], India have exclusive jurisdiction, unless a consumer law in your place of residence gives you the right to bring a case elsewhere.",
    ],
  },
  {
    heading: "14. Contact and changes to these terms",
    body: [
      "Write to " + SITE.supportEmail + " with any question about these terms. We may update them from time to time. For important changes we will tell you in the app or by email before they take effect. Continuing to use TaleTwo after that means you accept the updated terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="Last updated 9 November 2026"
      sections={SECTIONS}
    />
  );
}
