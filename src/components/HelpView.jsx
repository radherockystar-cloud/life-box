import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Clock } from 'lucide-react';
import { translations } from '../utils/translations';

const EMAIL = 'lifeboxapp.dev@gmail.com';
const INSTAGRAM_URL = 'https://www.instagram.com/rocky_star474';
const INSTAGRAM_HANDLE = '@rocky_star474';

const FAQ = [
  {
    q: 'How do I add a plan or birthday reminder?',
    a: [
      'Open the Planner tab and tap the + button. Enter a title, choose the date and the time you want to be reminded, switch on “Every year” for birthdays or anniversaries, add an optional note and save.',
      'You get a reminder 7 days before and again on the day at the time you chose. A banner also appears at the top of the Planner on those two days only. Your plans are private and never show on the calendar.',
    ],
  },
  {
    q: 'My reminder or notification did not arrive. What should I do?',
    a: ['Please check these points one by one:'],
    list: [
      'The plan time must be in the future when you save it. A time that has already passed will not trigger a reminder.',
      'Allow notifications for Life Box in your phone’s Settings > Apps > Life Box > Notifications.',
      'Allow “Alarms & reminders” for the app (Android 12 and above), so reminders can arrive at the exact time.',
      'Set the app’s battery usage to “Unrestricted” or “No restrictions”. Battery savers can block background reminders.',
      'Do not force-stop the app, and avoid “clean” or “boost” apps that close it.',
      'In the Planner, open My Plans (lock icon) and make sure “Plan reminders” is switched on.',
      'If you changed your phone’s date, time or time zone, open the Planner once so reminders are set again.',
    ],
  },
  {
    q: 'How do Notes and favourites work?',
    a: [
      'Open Life Box Notes, tap + to write a note and tap Save. If you go back without saving, your note is saved automatically so you do not lose your text.',
      'Tap the star on a note to make it a favourite. Favourites stay at the top of the list. When you remove the star, the note goes back to its original place. Use the All and Favourites buttons to filter the list.',
    ],
  },
  {
    q: 'How do I save a memory with a photo or video?',
    a: [
      'Open Memories and tap +. Add a title, pick a tag, attach a photo or video and write a few words. Photos are shrunk automatically to save space. Videos up to 2.5 MB are supported.',
      'Tap a memory to view it full-screen, edit it, share it or delete it.',
    ],
  },
  {
    q: 'What is Life Meter?',
    a: [
      'Life Meter shows how much life you have lived. Enter a date of birth (and an optional name), tap Done and you will see your age, days, weeks, hours, minutes and seconds, plus extra figures such as heartbeats, breaths and steps. Use the History button to open, share or delete earlier entries.',
      'Age, days and time are exact. Figures such as heartbeats, water and food are calculated from average human values and are not medical measurements.',
    ],
  },
  {
    q: 'How do I use the AI Assistant?',
    a: [
      'Open AI Assistant from Home and type a message, just like chatting with a friend. You can attach a photo and ask general questions. The AI Assistant does not read your saved notes, goals, memories or plans. Tap + for a new chat and the history button to reopen an earlier chat.',
      'Free users get a small number of AI messages. After that, a Pro plan is needed to keep chatting. Pro includes a generous monthly AI allowance; if you use it all, the AI Assistant pauses until the 1st of next month. The AI Assistant needs an internet connection and its answers can sometimes be wrong, so please double-check anything important. The messages you type in the chat (and photos you attach) are sent to Google’s Gemini service to create the reply, as explained in the Privacy Policy.',
    ],
  },
  {
    q: 'The AI Assistant is not replying. What can I do?',
    a: ['Check your internet connection, wait a few seconds and send the message again. If it keeps failing, start a new chat. If you still see an error, please send us a screenshot of the message through the email or Instagram buttons above.'],
  },
  {
    q: 'I deleted something by mistake. Can I get it back?',
    a: ['Deleted notes and memories are moved to the Bin first. Open the Bin from the app’s Settings to restore them. Once you remove an item from the Bin, it cannot be recovered.'],
  },
  {
    q: 'Where is my data stored? Can I lose it?',
    a: [
      'If you use Life Box as a guest, your content is stored only on your device. Uninstalling the app, clearing its data or losing your phone can then delete everything permanently, and we cannot restore it.',
      'If you log in, your content is also saved to your private cloud space (Google Firebase), so you can open it on other devices and restore it on a new phone. Logging out first uploads your changes. For anything very important, you can also keep a copy with Backup / Export.',
    ],
  },
  {
    q: 'How do subscriptions work?',
    a: [
      'Life Box is free to use with limits. Pro unlocks the AI chat (with a fair monthly allowance) and the Memories tab. Ad-free removes ads from the whole app. There is also a Pro + Ad-free plan. All plans are billed monthly through Google Play. Open Me > Manage Subscription to see the plans.',
      'To cancel, open Google Play > Payments & subscriptions > Subscriptions, choose Life Box and tap Cancel. You keep the plan until the end of the period you paid for. Your saved data is never deleted when a plan ends; the paid features simply lock again. If you reinstall the app or change phone, open Manage Subscription and tap Restore purchases.',
    ],
  },
  {
    q: 'How do I change the language or theme?',
    a: ['Open the menu (top-left on Home) and choose Language or Theme, then pick the option you like.'],
  },
  {
    q: 'How do I report a bug or suggest a feature?',
    a: ['Use Feedback & Support in the menu, or contact us using the buttons above. For bugs, please tell us what you were doing, what you expected, what happened instead, your phone model and Android version. A screenshot helps a lot.'],
  },
];

const css = `
@keyframes hlpFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes hlpPulse{0%,100%{opacity:.75}50%{opacity:1}}
.hlp-tile:active .hlp-badge{transform:scale(.93)}
`;

function Logo3D({ href, external, label, handle, glow, dark, children }) {
  return (
    <a
      className="hlp-tile"
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      style={{ flex: 1, minWidth: 0, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
    >
      <div
        className="hlp-badge"
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.15s',
          background: dark ? 'linear-gradient(150deg,#475569 0%,#1e293b 100%)' : 'linear-gradient(150deg,#ffffff 0%,#eef2f7 100%)',
          border: '1px solid rgba(255,255,255,0.85)',
          borderTop: '1px solid #ffffff',
          boxShadow: `inset 0 3px 0 rgba(255,255,255,0.95), inset 0 -12px 18px -10px rgba(0,0,0,0.25), 0 16px 24px -10px rgba(0,0,0,0.4), 0 0 34px ${glow}`,
          animation: 'hlpFloat 3.2s ease-in-out infinite',
        }}
      >
        <div style={{ filter: 'drop-shadow(0 5px 6px rgba(0,0,0,0.35))', display: 'flex' }}>{children}</div>
      </div>
      <div style={{ fontSize: '13px', fontWeight: '900', color: dark ? '#f9fafb' : '#111827' }}>{label}</div>
      <div style={{ fontSize: '10.5px', fontWeight: '700', color: dark ? '#9ca3af' : '#6b7280', textAlign: 'center', wordBreak: 'break-all', lineHeight: 1.4 }}>{handle}</div>
    </a>
  );
}

const GmailLogo = () => (
  <svg width="46" height="46" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z" />
    <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z" />
    <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17" />
    <path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0C4.924,8,3,9.924,3,12.298z" />
    <path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0C43.076,8,45,9.924,45,12.298z" />
  </svg>
);

const InstagramLogo = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
    <defs>
      <radialGradient id="lbIgGrad" cx="30%" cy="107%" r="150%">
        <stop offset="0" stopColor="#fdf497" />
        <stop offset="0.05" stopColor="#fdf497" />
        <stop offset="0.45" stopColor="#fd5949" />
        <stop offset="0.6" stopColor="#d6249f" />
        <stop offset="0.9" stopColor="#285AEB" />
      </radialGradient>
    </defs>
    <rect x="4" y="4" width="40" height="40" rx="11" fill="url(#lbIgGrad)" />
    <rect x="12" y="12" width="24" height="24" rx="7" fill="none" stroke="#fff" strokeWidth="3" />
    <circle cx="24" cy="24" r="5.8" fill="none" stroke="#fff" strokeWidth="3" />
    <circle cx="31" cy="17" r="1.8" fill="#fff" />
  </svg>
);

export default function HelpView({ currentTheme, currentLang }) {
  const t = translations[currentLang] || translations.en;
  const dark = currentTheme === 'dark';
  const [openIdx, setOpenIdx] = useState(null);

  const ink = dark ? '#f9fafb' : '#111827';
  const body = dark ? '#d1d5db' : '#4b5563';
  const cardBg = dark ? '#1e293b' : '#fafafa';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <style>{css}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ padding: '10px', borderRadius: '14px', background: '#f3e8ff', color: '#9333ea' }}><HelpCircle size={20} /></div>
        <h3 style={{ fontSize: '16px', fontWeight: '900', color: ink }}>{t.help}</h3>
      </div>

      {/* Contact */}
      <div style={{ padding: '20px', borderRadius: '20px', background: cardBg, border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '900', color: ink }}>Need help? Talk to us</div>
          <p style={{ fontSize: '12.5px', color: body, lineHeight: '1.75', fontWeight: '600', marginTop: '6px' }}>
            Have a question, a problem or an idea? Tap a button below to reach the developer directly. We read every message.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', padding: '6px 0 2px' }}>
          <Logo3D href={`mailto:${EMAIL}?subject=${encodeURIComponent('Life Box Help')}`} label="Email us" handle={EMAIL} glow="rgba(234,67,53,0.5)" dark={dark}>
            <GmailLogo />
          </Logo3D>
          <Logo3D href={INSTAGRAM_URL} external label="Instagram" handle={INSTAGRAM_HANDLE} glow="rgba(214,36,159,0.55)" dark={dark}>
            <InstagramLogo />
          </Logo3D>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', borderRadius: '12px', background: dark ? '#0f172a' : '#ffffff', border: '1px solid rgba(147,51,234,0.2)' }}>
          <Clock size={15} color="#9333ea" style={{ marginTop: '2px', flexShrink: 0 }} />
          <span style={{ fontSize: '11.5px', color: body, lineHeight: '1.6', fontWeight: '600' }}>
            We usually reply within a few days. For faster help with a problem, include your phone model, Android version and a screenshot.
          </span>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ fontSize: '14px', fontWeight: '900', color: ink, marginTop: '4px' }}>Frequently asked questions</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {FAQ.map((item, i) => {
          const open = openIdx === i;
          return (
            <div key={item.q} style={{ borderRadius: '16px', background: cardBg, border: open ? '1px solid rgba(147,51,234,0.45)' : '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setOpenIdx(open ? null : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: ink }}
              >
                <span style={{ fontSize: '12.5px', fontWeight: '800', lineHeight: 1.45 }}>{item.q}</span>
                <ChevronDown size={18} color="#9333ea" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
              </button>
              {open && (
                <div style={{ padding: '0 14px 14px' }}>
                  {item.a.map((para) => (
                    <p key={para} style={{ fontSize: '12.5px', color: body, lineHeight: '1.75', fontWeight: '600', marginBottom: '6px' }}>{para}</p>
                  ))}
                  {item.list && (
                    <ul style={{ margin: '4px 0 0', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {item.list.map((li) => (
                        <li key={li} style={{ fontSize: '12.5px', color: body, lineHeight: '1.7', fontWeight: '600' }}>{li}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
