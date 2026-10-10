// Adds trip reminders to the phone notifications.
// Imported once in App.jsx. The planner's notification service calls this every time it sets notifications.

import { registerNotificationSource } from '../../planner/reminderService';
import { getTexts, fill } from '../../planner/notificationTexts';
import { loadLocalTrips, readAnyCloudCache } from './tripStorage';

const HOUR = 3600 * 1000;
const FIRST_ID = 7000000; // trip notification ids: 7000000 and up (plans and festivals use other numbers)

export const buildTripNotifications = ({ trips, lang, now = Date.now() }) => {
  const T = getTexts(lang);
  const list = [];

  trips
    .filter((t) => t.remind && t.status !== 'cancelled' && t.startAt > now)
    .sort((a, b) => a.startAt - b.startAt)
    .slice(0, 100)
    .forEach((trip, index) => {
      const values = { title: trip.title, from: trip.from, to: trip.to };
      const baseId = FIRST_ID + index * 2;

      const soonAt = trip.startAt - HOUR;
      if (soonAt > now) {
        list.push({ id: baseId, title: fill(T.tripSoonTitle, values), body: fill(T.tripSoonBody, values), at: new Date(soonAt) });
      }

      list.push({ id: baseId + 1, title: fill(T.tripNowTitle, values), body: fill(T.tripNowBody, values), at: new Date(trip.startAt) });
    });

  return list;
};

registerNotificationSource(({ lang, now }) =>
  buildTripNotifications({ trips: [...loadLocalTrips(), ...readAnyCloudCache()], lang, now: now ? now.getTime() : Date.now() })
);
