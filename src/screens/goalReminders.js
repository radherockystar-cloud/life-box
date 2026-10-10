// Goals ke phone notifications.
// Yeh planner ke notification system (reminderService) me apne aap judta hai:
// utils/autoNotificationSources.js is file ko dhoondh kar load kar deta hai.
//
//  - Prep alert  : har roz, goal ke "Prep reminder" time par (repeat hota hai)
//  - Missed alert: roz raat 11:55 PM par, sirf us din jab goal ka log nahi hua
//  - Finish kiye hue goals ke koi notification nahi aate

import { registerNotificationSource, readSetting, SETTING_KEYS } from '../tabs/planner/reminderService';
import { loadGoals, toDateStr, parseDate, addDays, MISSED_ALERT_TIME } from '../utils/goalHelpers';

const FIRST_ID = 8000000; // Goals ke ids: 8000000 se shuru (trips 7000000 se)
const SLOT = 100;         // har goal ko 100 ids milte hain
const DAYS_AHEAD = 7;     // missed alerts agle 7 din ke liye set hote hain

const TEXTS = {
  en: {
    prepTitle: '⚡ Get ready: {title}',
    prepBody: 'Your goal opens at {time}. Time to get ready.',
    missTitle: '⚠️ Goal missed: {title}',
    missBody: 'You have not logged today’s progress. Tomorrow is a fresh start.',
    hiddenPrepTitle: '⚡ Goal reminder',
    hiddenPrepBody: 'Your daily goal opens soon.',
    hiddenMissTitle: '⚠️ Goal reminder',
    hiddenMissBody: 'Today’s goal is still waiting.',
  },
  hi: {
    prepTitle: '⚡ तैयार हो जाओ: {title}',
    prepBody: 'आपका गोल {time} पर खुलेगा। तैयारी शुरू करें।',
    missTitle: '⚠️ गोल छूट गया: {title}',
    missBody: 'आज की प्रोग्रेस दर्ज नहीं हुई। कल नई शुरुआत है।',
    hiddenPrepTitle: '⚡ गोल रिमाइंडर',
    hiddenPrepBody: 'आपका रोज़ का गोल जल्द खुलेगा।',
    hiddenMissTitle: '⚠️ गोल रिमाइंडर',
    hiddenMissBody: 'आज का गोल अभी बाकी है।',
  },
};

const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, k) => (values[k] !== undefined ? values[k] : ''));

const splitTime = (t) => String(t).split(':').map(Number);

export const buildGoalNotifications = ({ goals, lang, now = new Date(), hideTitles = false }) => {
  const T = TEXTS[lang] || TEXTS.en;
  const todayStr = toDateStr(now);
  const list = [];

  goals
    .filter((g) => !g.completed)
    .sort((a, b) => Number(a.id) - Number(b.id))
    .forEach((g, gi) => {
      const baseId = FIRST_ID + gi * SLOT;
      const values = { title: g.title, time: g.actionTime };
      const [ph, pm] = splitTime(g.alertTime);
      const [mh, mm] = splitTime(MISSED_ALERT_TIME);

      const prepTitle = hideTitles ? T.hiddenPrepTitle : fill(T.prepTitle, values);
      const prepBody = hideTitles ? T.hiddenPrepBody : fill(T.prepBody, values);
      const missTitle = hideTitles ? T.hiddenMissTitle : fill(T.missTitle, values);
      const missBody = hideTitles ? T.hiddenMissBody : fill(T.missBody, values);

      // Prep alert: goal shuru ho chuka hai to har roz repeat
      if (g.startDate <= todayStr) {
        list.push({ id: baseId, title: prepTitle, body: prepBody, on: { hour: ph, minute: pm } });
      }

      for (let i = 0; i < DAYS_AHEAD; i++) {
        const day = addDays(parseDate(todayStr), i);
        const dayStr = toDateStr(day);
        if (dayStr < g.startDate) continue;

        // Aage ki start date wale goal ka prep alert (exact date par)
        if (g.startDate > todayStr) {
          const prepAt = new Date(day);
          prepAt.setHours(ph, pm, 0, 0);
          if (prepAt > now) {
            list.push({ id: baseId + 10 + i, title: prepTitle, body: prepBody, at: prepAt });
          }
        }

        // Missed alert: us din jab log nahi hua
        if (g.daysData?.[dayStr]) continue;
        const missAt = new Date(day);
        missAt.setHours(mh, mm, 0, 0);
        if (missAt > now) {
          list.push({ id: baseId + 1 + i, title: missTitle, body: missBody, at: missAt });
        }
      }
    });

  return list;
};

registerNotificationSource(({ lang, now }) =>
  buildGoalNotifications({
    goals: loadGoals(),
    lang,
    now: now || new Date(),
    hideTitles: readSetting(SETTING_KEYS.hideTitles, false),
  })
);
