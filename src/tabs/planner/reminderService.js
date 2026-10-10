// Sends the notifications to the phone (installed Android app only).
// It needs this package:   npm install @capacitor/local-notifications@8

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { loadPlans } from './plansStorage';
import { buildNotificationList } from './reminderPlan';
import { getTexts } from './notificationTexts';

const CHANNEL_ID = 'planner_reminders';

// Settings (all ON by default)
export const SETTING_KEYS = {
  festivals: 'newlife_planner_festival_notif',
  plans: 'newlife_planner_plan_notif',
  hideTitles: 'newlife_planner_hide_titles',
};

export const readSetting = (key, defaultValue) => {
  const saved = localStorage.getItem(key);
  return saved === null ? defaultValue : saved === 'true';
};

export const writeSetting = (key, value) => localStorage.setItem(key, String(value));

export const canNotify = () => Capacitor.isNativePlatform();

const getLang = () => localStorage.getItem('newlife_lang') || 'en';

const ensurePermission = async () => {
  const status = await LocalNotifications.checkPermissions();
  if (status.display === 'granted') return true;
  if (status.display === 'denied') return false;
  const asked = await LocalNotifications.requestPermissions();
  return asked.display === 'granted';
};

const ensureChannel = async () => {
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: 'Festival greetings & plan reminders',
      importance: 4,
      visibility: 1,
    });
  } catch (err) {
    // Channels exist on Android 8+ only; ignore elsewhere
  }
};

// Other features (like Trips) can add their own notifications to the same list.
// A source is a function: ({ lang, now }) => [ { id, title, body, at } ]
const extraSources = [];
export const registerNotificationSource = (source) => {
  if (!extraSources.includes(source)) extraSources.push(source);
};

let syncRunning = false;

// Removes the old notifications and sets them again from scratch:
// festival greetings + every saved plan, in the current app language.
export const syncNotifications = async () => {
  if (!canNotify() || syncRunning) return false;
  syncRunning = true;

  try {
    if (!(await ensurePermission())) return false;
    await ensureChannel();

    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
    }

    const lang = getLang();
    const list = buildNotificationList({
      plans: loadPlans(),
      lang,
      festivalsOn: readSetting(SETTING_KEYS.festivals, true),
      plansOn: readSetting(SETTING_KEYS.plans, true),
      hideTitles: readSetting(SETTING_KEYS.hideTitles, false),
    });

    extraSources.forEach((source) => {
      try {
        list.push(...(source({ lang, now: new Date() }) || []));
      } catch (err) {
        console.error('A notification source failed:', err);
      }
    });

    if (list.length === 0) return true;

    await LocalNotifications.schedule({
      notifications: list.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        channelId: CHANNEL_ID,
        schedule: n.on ? { on: n.on, allowWhileIdle: true } : { at: n.at, allowWhileIdle: true },
      })),
    });

    return true;
  } catch (err) {
    console.error('Could not set notifications:', err);
    return false;
  } finally {
    syncRunning = false;
  }
};

// Call this after anything changes (plan saved / deleted / language changed). Waits a moment so many changes become one.
let syncTimer;
export const requestSync = (delay = 800) => {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(syncNotifications, delay);
};

// A notification that arrives in 5 seconds, to check that everything works
export const sendTestNotification = async () => {
  if (!canNotify()) return false;
  if (!(await ensurePermission())) return false;
  await ensureChannel();

  const T = getTexts(getLang());
  await LocalNotifications.schedule({
    notifications: [
      {
        id: 99999,
        title: T.testTitle,
        body: T.testBody,
        channelId: CHANNEL_ID,
        schedule: { at: new Date(Date.now() + 5000), allowWhileIdle: true },
      },
    ],
  });
  return true;
};
