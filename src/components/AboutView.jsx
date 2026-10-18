import React from 'react';
import { Info, Sparkles } from 'lucide-react';
import { translations } from '../utils/translations';
import LegalDoc from './LegalDoc';

const SECTIONS = [
  {
    h: 'What is Life Box?',
    p: [
      'Life Box is your private place to keep your life organised and your best moments safe. Write notes, save memories with photos and videos, set goals, record voice notes and plan your days, all in one app and in one beautiful space.',
    ],
  },
  {
    h: 'What you can do',
    list: [
      'Planner: see festivals and special days on a calendar, add private plans such as birthdays and anniversaries, and get reminders 7 days before and on the day.',
      'Notes: write and organise notes, and pin your favourites to the top.',
      'Memories: keep photos, videos and stories of special moments with tags.',
      'Goals and Voice notes: track your progress and record your thoughts.',
      'Life Meter: enter a date of birth and see your age, days lived and more.',
      'AI Assistant: chat like with a friend and ask anything.',
      'Login (optional): keep your data safe in your private cloud and use it on all your devices.',
    ],
  },
  {
    h: 'Privacy first',
    p: [
      'You can use Life Box without signing up, and then your content stays only on your own device. If you choose to log in, your content is also saved to your private cloud space (Google Firebase) so you can use it on other devices. The AI Assistant does not read your saved items. Read the Privacy Policy from the menu for full details.',
    ],
  },
  {
    h: 'Made in India',
    p: ['Life Box is designed and built in India with care, and we keep improving it with your feedback. Tell us what you love and what you would like to see next from the Feedback & Support page.'],
  },
];

export default function AboutView({ currentTheme, currentLang }) {
  const t = translations[currentLang] || translations.en;
  const dark = currentTheme === 'dark';
  return (
    <LegalDoc
      dark={dark}
      icon={Info}
      iconBg="#e0f2fe"
      iconColor="#0284c7"
      title={t.about}
      badgeIcon={Sparkles}
      badge="Your life, organised"
      badgeColor="#0284c7"
      sections={SECTIONS}
      numbered={false}
      footer={
        <div style={{ padding: '12px', borderRadius: '12px', background: dark ? '#0f172a' : '#ffffff', border: '1px solid rgba(244,63,94,0.2)', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '900', color: '#f43f5e' }}>Developed by Radhe Rocky Star</span>
        </div>
      }
    />
  );
}
