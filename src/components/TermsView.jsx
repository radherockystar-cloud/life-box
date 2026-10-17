import React from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { translations } from '../utils/translations';
import LegalDoc from './LegalDoc';

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
      'You own the notes, memories, goals, voice notes, plans and other content you create in the App. This content is stored on your device and not on our servers, so you are responsible for keeping your device safe and for making your own backups of anything important.',
      'If you uninstall the App, clear its data or lose your device, your content may be lost permanently and we will not be able to restore it.',
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
      'Messages and related saved content may be sent to the AI service as explained in the Privacy Policy. Please do not share passwords, bank details or other highly sensitive information in the chat.',
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
    p: ['The App may use or link to third-party services such as Google (AI Assistant), a feedback email service, and external websites like Instagram. We do not control these services and are not responsible for their content, availability or policies.'],
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
    p: ['To the fullest extent permitted by law, the Developer will not be liable for any indirect, incidental, special or consequential loss, including loss of data, missed reminders or loss of profit, arising from the use of or inability to use the App. Nothing in these Terms limits any rights you have under mandatory consumer-protection laws that cannot be excluded.'],
  },
  {
    h: 'Termination',
    p: ['You may stop using the App at any time by uninstalling it. We may suspend or end your access if you seriously or repeatedly breach these Terms.'],
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
  return (
    <LegalDoc
      dark={currentTheme === 'dark'}
      icon={FileText}
      iconBg="#fef3c7"
      iconColor="#d97706"
      title={t.terms}
      badgeIcon={AlertCircle}
      badge="User Guidelines & Agreement"
      badgeColor="#d97706"
      updated="12 October 2026"
      intro="Please read these Terms & Conditions carefully before using Life Box. They set out the rules for using the App."
      sections={SECTIONS}
    />
  );
}
