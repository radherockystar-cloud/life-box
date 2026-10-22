import React from 'react';
import { Info, Sparkles } from 'lucide-react';
import { translations } from '../utils/translations';
import LegalDoc from './LegalDoc';
import { useScreenT } from '../utils/screenTexts';

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

const SECTIONS_HI = [
  {
    h: 'Life Box क्या है?',
    p: ['Life Box आपकी अपनी निजी जगह है, जहाँ आप अपनी ज़िंदगी को सलीके से रखते हैं और अपने सबसे अच्छे पलों को सुरक्षित रखते हैं। नोट्स लिखें, फ़ोटो और वीडियो के साथ यादें सहेजें, लक्ष्य बनाएँ, वॉइस नोट रिकॉर्ड करें और अपने दिन प्लान करें, सब कुछ एक ही ऐप में, एक खूबसूरत जगह पर।'],
  },
  {
    h: 'आप क्या कर सकते हैं',
    list: [
      'प्लानर: कैलेंडर पर त्योहार और खास दिन देखें, जन्मदिन और सालगिरह जैसे निजी प्लान जोड़ें, और 7 दिन पहले तथा उसी दिन याद दिलाने वाला रिमाइंडर पाएँ।',
      'नोट्स: नोट्स लिखें और व्यवस्थित करें, पसंदीदा नोट्स को सबसे ऊपर पिन करें।',
      'यादें: खास पलों की फ़ोटो, वीडियो और कहानियाँ टैग के साथ सहेजें।',
      'लक्ष्य और वॉइस नोट: अपनी प्रगति ट्रैक करें और अपने विचार रिकॉर्ड करें।',
      'लाइफ मीटर: जन्मतिथि डालें और अपनी उम्र, जिए हुए दिन और बहुत कुछ देखें।',
      'AI असिस्टेंट: दोस्त की तरह बात करें और कुछ भी पूछें।',
      'लॉगिन (वैकल्पिक): अपना डेटा निजी क्लाउड में सुरक्षित रखें और सभी डिवाइस पर इस्तेमाल करें।',
    ],
  },
  {
    h: 'सबसे पहले प्राइवेसी',
    p: ['आप बिना साइन-अप किए भी Life Box इस्तेमाल कर सकते हैं, तब आपका कंटेंट सिर्फ़ आपके फ़ोन में रहता है। अगर आप लॉगिन करते हैं, तो आपका कंटेंट आपके निजी क्लाउड (Google Firebase) में भी सेव होता है ताकि आप उसे दूसरे डिवाइस पर इस्तेमाल कर सकें। AI असिस्टेंट आपके सेव किए हुए आइटम नहीं पढ़ता। पूरी जानकारी के लिए मेन्यू से प्राइवेसी पॉलिसी पढ़ें।'],
  },
  {
    h: 'भारत में बना',
    p: ['Life Box भारत में पूरे मन से डिज़ाइन और तैयार किया गया है, और हम आपके फ़ीडबैक से इसे लगातार बेहतर बनाते हैं। आपको क्या पसंद है और आगे क्या चाहिए, यह Feedback & Support पेज से बताइए।'],
  },
];

export default function AboutView({ currentTheme, currentLang }) {
  const t = translations[currentLang] || translations.en;
  const { st, lang } = useScreenT();
  const dark = currentTheme === 'dark';
  return (
    <LegalDoc
      dark={dark}
      icon={Info}
      iconBg="#e0f2fe"
      iconColor="#0284c7"
      title={t.about}
      badgeIcon={Sparkles}
      badge={st('zAboutBadge')}
      badgeColor="#0284c7"
      sections={lang === 'hi' ? SECTIONS_HI : SECTIONS}
      numbered={false}
      footer={
        <div style={{ padding: '12px', borderRadius: '12px', background: dark ? '#0f172a' : '#ffffff', border: '1px solid rgba(244,63,94,0.2)', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '900', color: '#f43f5e' }}>{st('zDevBy')}</span>
        </div>
      }
    />
  );
}
