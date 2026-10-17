import React from 'react';
import { Shield, Lock } from 'lucide-react';
import { translations } from '../utils/translations';
import LegalDoc from './LegalDoc';

const EMAIL = 'lifeboxapp.dev@gmail.com';

const SECTIONS = [
  {
    h: 'Summary',
    list: [
      'No account, login or sign-up is needed to use Life Box.',
      'Your notes, memories, goals, voice notes, plans, chats and settings are stored on your own device.',
      'We do not run servers that store your content, and we do not sell your personal data.',
      'Your content leaves your device only in two cases: when you chat with the AI Assistant, and when you send feedback. Both are explained below.',
    ],
  },
  {
    h: 'Information stored on your device',
    p: ['To provide its features, the App saves the following on your device, inside the App’s private storage:'],
    list: [
      'Notes, including favourites.',
      'Memories, including photos or short videos you add.',
      'Goals and goal progress.',
      'Voice notes you record.',
      'Planner entries, reminders and the dates and times you set.',
      'Life Meter entries (date of birth and an optional name you type).',
      'AI Assistant chat history.',
      'App settings such as language, theme and reminder preferences.',
    ],
  },
  {
    h: 'Information sent outside your device',
    p: [
      'AI Assistant. When you send a message in the AI Assistant, the App sends it to Google’s Gemini AI service so that a reply can be created. To give relevant answers, the request can also include your recent chat messages, any photo you attach in the chat, and text from your saved notes, goals, memories, voice-note details and planner entries. Photo, audio and video files stored in your vault are not sent; only photos you attach in the chat are. The data travels over an encrypted (HTTPS) connection and is processed by Google under Google’s own terms and privacy policy. If you never use the AI Assistant, none of this is sent.',
      'Feedback. If you submit feedback, your message, star rating, category and the optional email address you type are sent to the Developer’s inbox through a form-to-email service (Web3Forms). Please do not include passwords or sensitive information in feedback.',
      'Links. If you tap an email or Instagram link in the App, the relevant app or website opens and its own privacy policy applies.',
    ],
  },
  {
    h: 'Device permissions',
    p: [
      'Depending on the features you use, the App may ask for permissions such as notifications and exact alarms (reminders), microphone (voice notes), camera or photo access (memories and chat photos), and location. Each permission is requested only when the related feature is used, and you can change or withdraw it any time in your device settings. The related feature may stop working if a permission is denied.',
    ],
  },
  {
    h: 'How we use information',
    list: [
      'To provide and operate the features you choose to use.',
      'To generate AI replies when you ask for them.',
      'To read and respond to your feedback and to fix bugs.',
      'To meet legal obligations.',
    ],
    p: ['We do not use your content for advertising or profiling, and we do not sell it.'],
  },
  {
    h: 'Sharing of information',
    p: [
      'We do not sell, rent or trade your personal information. Information is shared only with the service providers named in this Policy (Google for the AI Assistant, and the feedback email service), and only to the extent needed to provide those features, or if the law requires it.',
    ],
  },
  {
    h: 'Storage, security and retention',
    p: [
      'Content created in the App stays in the App’s private storage on your device until you delete it or uninstall the App. Deleted items may stay in the in-app Bin until you remove them from there. The App does not add its own encryption to this storage, so please protect your phone with a screen lock. Depending on your device settings, operating-system backups (such as Google backup) may also include App data.',
      'Because your content is stored on your device and not on our servers, we cannot recover it if you lose your phone, clear the App’s data or uninstall the App. Feedback emails are kept only as long as needed to respond and improve the App.',
    ],
  },
  {
    h: 'Your rights and choices',
    p: [
      'You can view, edit and delete your content inside the App at any time, clear the App’s data from your device settings, stop using the AI Assistant, and withdraw permissions whenever you like.',
      'Depending on where you live, you may have rights under laws such as India’s Digital Personal Data Protection Act, 2023, the EU/UK GDPR and the California Consumer Privacy Act. These can include rights to access, correct and erase your data, to withdraw consent, and to complain to a regulator. Since the Developer does not hold your in-app content, most of these choices are in your own hands. For anything related to feedback you sent us, email us and we will respond within 30 days where possible.',
    ],
  },
  {
    h: 'Children',
    p: [
      'Life Box is not directed to children under 13, and we do not knowingly collect personal information from them. If you are under 18 (or below the age of majority in your country), please use the App with a parent or guardian’s permission. If you believe a child has sent us personal information, contact us and we will delete it.',
    ],
  },
  {
    h: 'International use',
    p: [
      'The App can be used worldwide. When you use the AI Assistant, your data may be processed by Google on servers located outside your country, including in the United States. By using the AI Assistant you agree to this transfer.',
    ],
  },
  {
    h: 'Changes to this Policy',
    p: [
      'We may update this Privacy Policy from time to time. The “Last updated” date above will change when we do. Continued use of the App after an update means you accept the updated Policy.',
    ],
  },
  {
    h: 'Contact and grievance',
    p: [
      `Developer and grievance contact: Radhe Rocky Star, India. Email: ${EMAIL}. Questions, requests and complaints about privacy are welcome at this address.`,
    ],
  },
];

export default function PrivacyPolicyView({ currentTheme, currentLang }) {
  const t = translations[currentLang] || translations.en;
  return (
    <LegalDoc
      dark={currentTheme === 'dark'}
      icon={Shield}
      iconBg="#fff1f2"
      iconColor="#f43f5e"
      title={t.privacy}
      badgeIcon={Lock}
      badge="Local-first privacy"
      badgeColor="#059669"
      updated="12 October 2026"
      intro="Life Box (“the App”, “we”, “us”) is developed and operated by Radhe Rocky Star (“the Developer”), India. This Privacy Policy explains what information the App handles, how it is used, and the choices you have. By using the App, you agree to this Policy."
      sections={SECTIONS}
    />
  );
}
