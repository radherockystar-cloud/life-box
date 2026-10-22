import React from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { translations } from '../utils/translations';
import LegalDoc from './LegalDoc';
import { useScreenT } from '../utils/screenTexts';

const EMAIL = 'lifeboxapp.dev@gmail.com';

const SECTIONS = [
  {
    h: 'Acceptance of these Terms',
    p: ['By downloading, installing or using Life Box (“the App”), you agree to these Terms & Conditions and to our Privacy Policy. If you do not agree, please do not use the App.'],
  },
  {
    h: 'Who can use the App',
    p: ['You must be at least 13 years old. If you are under 18 (or below the age of majority where you live), you may use the App only with the permission and supervision of a parent or guardian.'],
  },
  {
    h: 'Licence to use',
    p: ['The Developer grants you a personal, non-exclusive, non-transferable, revocable licence to use the App on your own device for your own non-commercial purposes, according to these Terms.'],
  },
  {
    h: 'Your content and your responsibility',
    p: [
      'You own the notes, memories, goals, voice notes, plans and other content you create in the App. In guest mode this content is stored only on your device. If you log in, it is also saved to your private cloud space (Google Firebase), as explained in the Privacy Policy.',
      'You are responsible for keeping your device and your login details safe, and for making your own backups (Backup / Export) of anything important. If you use the App as a guest and then uninstall it, clear its data or lose your device, your content may be lost permanently. Even with login, cloud sync depends on third-party services and an internet connection, so we cannot promise that data will never be lost or delayed.',
      'You are responsible for the content you store. Please do not store unlawful content or content you have no right to keep.',
    ],
  },
  {
    h: 'Account and cloud sync',
    p: [
      'Creating an account is optional. If you log in, you must give correct information and keep your password secure. You are responsible for activity on your account.',
      'After login, the App syncs your content to a private cloud space and keeps a copy on your device for offline use. Logging out uploads pending changes and then removes your account’s content from the device. You can delete your account from the App, which also deletes your cloud content. Deleted cloud content may not be recoverable.',
      'Cloud storage may have limits, may change, or may be unavailable at times. We may change or stop the sync feature, and we will try to give notice where practical.',
    ],
  },
  {
    h: 'Subscriptions and payments',
    p: [
      'Life Box is free to use with limits: free users can send a limited number of AI Assistant messages, and the Memories tab and continued AI chat need a paid plan. The Pro plan includes a monthly AI usage allowance (it depends on how long your messages and the replies are); when it is used up, the AI Assistant pauses until the 1st of the next month. We may adjust the allowance from time to time. Optional monthly plans are offered (for example Pro, Ad-free and Pro + Ad-free). The price, taxes and features of each plan are shown in the App and in Google Play before you subscribe.',
      'Payments are handled entirely by Google Play. Your plan renews automatically every month until you cancel it in Google Play > Payments & subscriptions > Subscriptions. Cancelling stops future charges, and you keep the plan until the end of the period you already paid for. Uninstalling the App does not cancel a subscription.',
      'Refunds are handled by Google Play under its own policy and applicable law; we cannot refund payments ourselves. If a price changes, Google Play will tell you before it applies to you.',
      'If your plan ends or payment fails, paid features lock again, but your saved notes, memories and other data are not deleted. You can restore a purchase from Me > Manage Subscription > Restore purchases, on the same Google account.',
      'We may change plans, prices, free limits or features in future. We will not charge you for anything without showing the price in Google Play first.',
      'Ads. On the free plan the App may show ads. You must not click ads artificially or try to block or manipulate them. Ad-free plans remove ads.',
    ],
  },
  {
    h: 'Acceptable use',
    p: ['You agree not to:'],
    list: [
      'Use the App for anything unlawful, harmful, abusive or fraudulent.',
      'Store or share content that infringes the rights of others or that is illegal in your country.',
      'Copy, modify, reverse engineer, decompile or resell the App, except where the law allows it.',
      'Try to disrupt, overload or misuse the App or the services it connects to, including the AI Assistant.',
    ],
  },
  {
    h: 'AI Assistant',
    p: [
      'The AI Assistant is powered by a third-party AI service (Google Gemini). Its answers are generated automatically and can be incomplete, outdated or wrong. They are for general information and convenience only and are not professional medical, legal, financial or other expert advice. Please check important information yourself.',
      'Messages you type in the chat, and photos you attach there, are sent to the AI service as explained in the Privacy Policy. The AI Assistant does not read your saved notes, memories, goals, voice notes or planner entries. Please do not share passwords, bank details or other highly sensitive information in the chat.',
    ],
  },
  {
    h: 'Reminders and notifications',
    p: ['Reminders are delivered on a best-effort basis through your device. Battery-saver settings, notification permissions, silent modes, a changed device time or other device restrictions can delay or block them. Please do not rely on the App for time-critical, medical or emergency reminders.'],
  },
  {
    h: 'Life Meter and calculated figures',
    p: ['Life Meter shows your age, days lived and other values calculated from the date of birth you enter. Some figures, such as heartbeats, breaths, steps, water and food, are calculated from average human values for fun and general interest. They are not measurements and are not medical information.'],
  },
  {
    h: 'Festival and calendar information',
    p: ['Festival and special-day dates are provided for general information. Dates can differ by region, calendar tradition or moon sighting, so please confirm important dates from a trusted local source.'],
  },
  {
    h: 'Third-party services',
    p: ['The App may use or link to third-party services such as Google (Firebase login, cloud storage and profile data, and the AI Assistant), a feedback email service, and external websites like Instagram. We do not control these services and are not responsible for their content, availability or policies.'],
  },
  {
    h: 'Availability and updates',
    p: ['We may update, change, suspend or discontinue any part of the App at any time, with or without notice. Some features need an internet connection or device permissions to work.'],
  },
  {
    h: 'Disclaimer of warranties',
    p: ['The App is provided “as is” and “as available”, without warranties of any kind, whether express or implied, including fitness for a particular purpose, accuracy, reliability or uninterrupted operation, to the fullest extent permitted by law.'],
  },
  {
    h: 'Limitation of liability',
    p: ['To the fullest extent permitted by law, the Developer will not be liable for any indirect, incidental, special or consequential loss, including loss of data (on your device or in the cloud), missed reminders or loss of profit, arising from the use of or inability to use the App. Nothing in these Terms limits any rights you have under mandatory consumer-protection laws that cannot be excluded.'],
  },
  {
    h: 'Termination',
    p: ['You may stop using the App at any time. Delete your account from the App first if you want your cloud content removed; uninstalling alone does not delete it. We may suspend or end your access if you seriously or repeatedly breach these Terms.'],
  },
  {
    h: 'Governing law',
    p: ['These Terms are governed by the laws of India, including the Information Technology Act, 2000 and the Indian Contract Act, 1872. Subject to any mandatory rights you have as a consumer in your own country, the courts of India have jurisdiction over any dispute arising from these Terms or the App.'],
  },
  {
    h: 'Changes to these Terms',
    p: ['We may update these Terms from time to time. The “Last updated” date will change when we do. Continuing to use the App after an update means you accept the updated Terms.'],
  },
  {
    h: 'Contact',
    p: [`Questions about these Terms? Email ${EMAIL}. Developed by Radhe Rocky Star, India.`],
  },
];

export default function TermsView({ currentTheme, currentLang }) {
  const t = translations[currentLang] || translations.en;
  const { st, lang } = useScreenT();
  return (
    <LegalDoc
      dark={currentTheme === 'dark'}
      icon={FileText}
      iconBg="#fef3c7"
      iconColor="#d97706"
      title={t.terms}
      badgeIcon={AlertCircle}
      badge={st('zTermsBadge')}
      badgeColor="#d97706"
      updated="18 October 2026"
      intro="Please read these Terms & Conditions carefully before using Life Box. They set out the rules for using the App."
      noteLegal
      sections={SECTIONS}
    />
  );
}
