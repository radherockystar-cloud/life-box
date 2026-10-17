import React from 'react';
import { Scale, ShieldCheck } from 'lucide-react';
import { translations } from '../utils/translations';
import LegalDoc from './LegalDoc';

const EMAIL = 'lifeboxapp.dev@gmail.com';

const SECTIONS = [
  {
    h: 'Services provided',
    p: ['Life Box is a personal life-organiser app. It offers:'],
    list: [
      'Planner with a calendar, festivals and private plans with reminders.',
      'Notes with favourites, Memories with photos and videos, Goals and Voice notes.',
      'Life Meter, which shows your age and life statistics from your date of birth.',
      'AI Assistant for chatting and for asking about your saved items.',
    ],
  },
  {
    h: 'Intellectual property',
    p: [
      'The App, including its name “Life Box”, logo, design, layout, text, graphics and code, is the property of the Developer (Radhe Rocky Star) and is protected by the Copyright Act, 1957 of India and by international copyright and trademark laws.',
      'You may not copy, reproduce, distribute, modify, resell or create derivative works from any part of the App without written permission, except as allowed by law.',
    ],
  },
  {
    h: 'Your content',
    p: ['Everything you create in the App, such as notes, memories, goals and voice notes, belongs to you. You give the Developer no ownership of it. Please make sure you have the right to store anything you add, including photos and videos of other people.'],
  },
  {
    h: 'Open-source software and third-party services',
    p: [
      'The App is built with open-source software, including React, Capacitor, Lucide icons and MapLibre GL, each under its own open-source licence. The AI Assistant uses Google’s Gemini service. All third-party names, trademarks and logos belong to their respective owners, and their use does not mean endorsement.',
    ],
  },
  {
    h: 'Important disclaimers',
    list: [
      'AI answers can be wrong and are not professional advice.',
      'Life Meter figures such as heartbeats, breaths, steps, water and food are estimates from averages, not medical data.',
      'Festival dates are for general information and can vary by region and calendar.',
      'Reminders are best-effort and can be delayed by device settings.',
    ],
  },
  {
    h: 'Terms, privacy and governing law',
    p: [
      'Your use of the App is governed by our Terms & Conditions and Privacy Policy, which are available from the menu. The laws of India apply, and the courts of India have jurisdiction, subject to any mandatory consumer rights you have in your own country.',
    ],
  },
  {
    h: 'Copyright and content complaints',
    p: [`If you believe something in the App infringes your copyright or other rights, please email ${EMAIL} with details of the work, where it appears in the App and your contact information. We will review the request and act on it where appropriate.`],
  },
  {
    h: 'Contact',
    p: [`Radhe Rocky Star, India. Email: ${EMAIL}.`],
  },
];

export default function LegalView({ currentTheme, currentLang }) {
  const t = translations[currentLang] || translations.en;
  return (
    <LegalDoc
      dark={currentTheme === 'dark'}
      icon={Scale}
      iconBg="#f3e8ff"
      iconColor="#9333ea"
      title={t.legal}
      badgeIcon={ShieldCheck}
      badge="Intellectual Property & Services"
      badgeColor="#9333ea"
      updated="12 October 2026"
      sections={SECTIONS}
    />
  );
}
