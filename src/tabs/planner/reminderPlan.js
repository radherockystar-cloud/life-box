// Works out WHICH notifications should exist (no phone code in here, so it is easy to test).
// reminderService.js hands this list to the phone.

import { getFestivalsBetween } from './festivalsData';
import { getTexts, fill } from './notificationTexts';
import { getKind } from './plansStorage';

const pad = (n) => String(n).padStart(2, '0');
const FESTIVAL_HOUR = 8; // festival greetings come at 8:00 AM

// Returns a list like:
//   { id, title, body, at: Date }                         -> one time
//   { id, title, body, on: { month, day, hour, minute } } -> repeats every year
export const buildNotificationList = ({
  plans,
  lang,
  now = new Date(),
  festivalsOn = true,
  plansOn = true,
  hideTitles = false,
}) => {
  const T = getTexts(lang);
  const list = [];

  // ----- 1) Festival greetings (automatic, no plan needed). Next 365 days. -----
  if (festivalsOn) {
    const end = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

    getFestivalsBetween(now, end).forEach(({ dateStr, festivals }) => {
      const [y, m, d] = dateStr.split('-').map(Number);
      const at = new Date(y, m - 1, d, FESTIVAL_HOUR, 0, 0);
      if (at <= now) return; // already past

      festivals.slice(0, 2).forEach((festival, index) => {
        const name = festival.names[lang] || festival.names.en;
        const happy = festival.tone !== 'respect';

        list.push({
          id: Number(`${y}${pad(m)}${pad(d)}`) * 10 + index,
          title: fill(happy ? T.festivalHappyTitle : T.festivalRespectTitle, { festival: name, emoji: festival.emoji }),
          body: fill(happy ? T.festivalHappyBody : T.festivalRespectBody, { festival: name }),
          at,
        });
      });
    });
  }

  // ----- 2) Plan reminders: 7 days before and on the day -----
  if (plansOn) {
    plans.forEach((plan, index) => {
      const kind = getKind(plan.kind);
      const [y, m, d] = plan.date.split('-').map(Number);
      const [hour, minute] = (plan.time || '09:00').split(':').map(Number);
      const baseId = 1000 + index * 10;

      // The plan's own text is used exactly as the user typed it
      const dayBody = hideTitles
        ? T.todayHidden
        : `${kind.emoji} ${fill(kind.wish ? T.todayBodyWish : T.todayBodyGeneric, { title: plan.title })}`;
      const weekBody = hideTitles ? T.weekHidden : `${kind.emoji} ${fill(T.weekBody, { title: plan.title })}`;

      if (plan.repeatYearly) {
        // Repeats every year on its own
        list.push({ id: baseId + 2, title: T.todayTitle, body: dayBody, on: { month: m, day: d, hour, minute } });

        const weekBefore = new Date(2028, m - 1, d - 7); // 2028 is a leap year, so 29 Feb works
        list.push({
          id: baseId + 1,
          title: T.weekTitle,
          body: weekBody,
          on: { month: weekBefore.getMonth() + 1, day: weekBefore.getDate(), hour, minute },
        });
      } else {
        const dayAt = new Date(y, m - 1, d, hour, minute, 0);
        const weekAt = new Date(y, m - 1, d - 7, hour, minute, 0);

        if (dayAt > now) list.push({ id: baseId + 2, title: T.todayTitle, body: dayBody, at: dayAt });
        if (weekAt > now) list.push({ id: baseId + 1, title: T.weekTitle, body: weekBody, at: weekAt });
      }
    });
  }

  return list;
};
