import React from 'react';
import { Shield, Lock } from 'lucide-react';
import { translations } from '../utils/translations';
import LegalDoc from './LegalDoc';

const EMAIL = 'lifeboxapp.dev@gmail.com';

const SECTIONS = [
  {
    h: 'Summary',
    list: [
      'You can use Life Box as a guest without any account. In guest mode, all your content stays only on your own device.',
      'If you choose to log in, your content is also saved to a private cloud space linked to your account (Google Firebase), so you can open it on your other devices and restore it if you change phones.',
      'The AI Assistant does not read your saved notes, memories, goals, voice notes or plans. Only the messages you type in the chat (and photos you attach there) are sent to it.',
      'We do not sell your personal data and we do not use your content to target ads. If you use the free plan, the App may show ads from Google AdMob; paid plans are billed by Google Play.',
    ],
  },
  {
    h: 'Information the App keeps for you',
    p: ['To provide its features, the App saves the following. In guest mode it stays on your device, inside the App’s private storage. After you log in, it is also synced to your private cloud space (see “Account and cloud sync” below):'],
    list: [
      'Notes, including favourites.',
      'Memories, including photos or short videos you add.',
      'Goals and goal progress.',
      'Voice notes you record.',
      'Planner entries, reminders and the dates and times you set.',
      'Life Meter entries (date of birth and an optional name you type).',
      'AI Assistant chat history (text only; photos you attach in the chat are not saved in the history).',
      'Your profile (name, short bio, optional phone number and profile picture), only if you log in and fill it in.',
      'App settings such as language, theme, reminder preferences and App Lock stay on your device only and are not uploaded.',
    ],
  },
  {
    h: 'Account and cloud sync',
    p: [
      'Login. You can sign in with email and password or with your Google account. Sign-in is handled by Google Firebase Authentication, which receives your email address and sign-in details. Your password is handled by Firebase and is never visible to the Developer.',
      'Cloud sync. After you log in, the App uploads your notes, memories (including photos and videos), goals, voice notes, planner entries, Life Meter entries and AI chat history to Google Firebase (Cloud Storage), in a private folder that belongs to your account. Security rules allow only your own signed-in account to read or write that folder. Your profile is stored in Google Cloud Firestore. Data is encrypted in transit (HTTPS) and Google encrypts stored data at rest. The Developer does not routinely look at your content and never sells it.',
      'Offline use and caching. The cloud copy is the main copy while you are logged in. A copy is also kept on your device so the App works offline, and changes made offline are uploaded when you are back online.',
      'Guest data and login. If you used the App as a guest and then log in, the guest content on your device is merged into your account. If you log out, the App first uploads any pending changes and then removes your account’s content from the device. If an upload could not finish, your content stays on the device so nothing is lost.',
      'Not uploaded. App Lock passcode, theme, language, reminder settings and backup bookkeeping always stay on your device only.',
    ],
  },
  {
    h: 'Information sent to other services',
    p: [
      'AI Assistant. When you send a message in the AI Assistant, the App sends it to Google’s Gemini AI service so that a reply can be created. The request includes your messages in the current chat and any photo you attach in the chat. The AI Assistant does not read your saved notes, memories, goals, voice notes, planner entries or vault files, and the App does not send them to it. The data travels over an encrypted (HTTPS) connection and is processed by Google under Google’s own terms and privacy policy. Please do not type secrets such as passwords or bank details into the chat. If you never use the AI Assistant, none of this is sent. If a future plan lets the AI Assistant use your saved content, we will update this Policy first and you will be able to choose.',
      'Feedback. If you submit feedback, your message, star rating, category and the optional email address you type are sent to the Developer’s inbox through a form-to-email service (Web3Forms). Please do not include passwords or sensitive information in feedback.',
      'Purchases. Optional subscriptions are processed by Google Play. We never see or store your card, UPI or bank details. The App asks Google Play which plan is active on your Google account and keeps a small record of that status on your device only (it is not synced to the cloud or included in backups).',
      'Ads. On the free plan the App may show ads from Google AdMob. Google and its partners may use an advertising ID and similar device information to show and measure ads, under Google’s own policies. Where the law requires it, you will be asked for your choice. The Ad-free plans remove ads. We do not give advertisers your notes, memories or other content.',
      'Free-message counter. The App keeps a counter of free AI messages used on your device only.',
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
      'To provide and operate the features you choose to use, including login and cloud sync.',
      'To generate AI replies when you ask for them.',
      'To read and respond to your feedback and to fix bugs.',
      'To meet legal obligations.',
    ],
    p: ['We do not use your content for advertising or profiling, and we do not sell it.'],
  },
  {
    h: 'Sharing of information',
    p: [
      'We do not sell, rent or trade your personal information. Information is shared only with the service providers named in this Policy (Google Firebase for login, cloud storage and profile data, Google for the AI Assistant, Google Play for payments, Google AdMob for ads, and the feedback email service), and only to the extent needed to provide those features, or if the law requires it.',
    ],
  },
  {
    h: 'Storage, security and retention',
    p: [
      'Guest mode: content stays in the App’s private storage on your device until you delete it or uninstall the App. If you are not logged in and you lose your phone, clear the App’s data or uninstall the App, we cannot recover your content. Use Backup / Export, or log in, to keep a safe copy.',
      'Logged-in mode: your content is kept in your cloud space until you delete it or delete your account. Deleted items may stay in the in-app Bin until you remove them from there. The App does not add its own encryption on top of the device storage, so please protect your phone with a screen lock. Backup / Export files you create are saved where you choose and are your responsibility. Depending on your device settings, operating-system backups (such as Google backup) may also include App data.',
      'Feedback emails are kept only as long as needed to respond and improve the App.',
    ],
  },
  {
    h: 'Your rights and choices',
    p: [
      'You can view, edit and delete your content inside the App at any time, log out, clear the App’s data from your device settings, stop using the AI Assistant, and withdraw permissions whenever you like. If you delete your account from the App, your cloud content is deleted along with it.',
      'Depending on where you live, you may have rights under laws such as India’s Digital Personal Data Protection Act, 2023, the EU/UK GDPR and the California Consumer Privacy Act. These can include rights to access, correct and erase your data, to withdraw consent, and to complain to a regulator. Most of these choices are available to you directly in the App. For anything related to feedback you sent us, email us and we will respond within 30 days where possible.',
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
      'The App can be used worldwide. When you log in, your cloud data is stored with Google Firebase, and when you use the AI Assistant your messages are processed by Google. Google’s servers may be located outside your country, including in the United States. By logging in or using the AI Assistant you agree to this transfer.',
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
      badge="Local-first, private cloud after login"
      badgeColor="#059669"
      updated="18 October 2026"
      intro="Life Box (“the App”, “we”, “us”) is developed and operated by Radhe Rocky Star (“the Developer”), India. This Privacy Policy explains what information the App handles, how it is used, and the choices you have. By using the App, you agree to this Policy."
      sections={SECTIONS}
    />
  );
}
