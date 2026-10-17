// Sends the notifications to the phone (installed Android app only).
// It needs this package:   npm install @capacitor/local-notifications@8

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { loadPlans } from './plansStorage';
import { buildNotificationList } from './reminderPlan';
import { getTexts } from './notificationTexts';
import { appStorage } from '../../utils/appStorage';

const CHANNEL_ID = 'planner_reminders';

// Settings (all ON by default)
export const SETTING_KEYS = {
  festivals: 'newlife_planner_festival_notif',
  plans: 'newlife_planner_plan_notif',
  hideTitles: 'newlife_planner_hide_titles',
};

export const readSetting = (key, defaultValue) => {
  const saved = appStorage.getItem(key);
  return saved === null ? defaultValue : saved === 'true';
};

export const writeSetting = (key, value) => appStorage.setItem(key, String(value));

export const canNotify = () => Capacitor.isNativePlatform();

// ---------- MASTER SWITCH (Settings > Notifications) ----------
// OFF  -> app koi bhi notification nahi bhejta, pehle se lage hue sab cancel ho jate hain.
// ON   -> festival / plan / trip sab notifications wapas lag jate hain.
// Default ON hai. Naya key use kiya hai, taki purani Settings screen ne jo 'false' save kiya tha wo ise band na kar de.
export const NOTIF_MASTER_KEY = 'newlife_notifications_on';

export const isNotifEnabled = () => appStorage.getItem(NOTIF_MASTER_KEY) !== 'false';

export const setNotifEnabled = (value) => appStorage.setItem(NOTIF_MASTER_KEY, String(value));

const getLang = () => appStorage.getItem('newlife_lang') || 'en';

const ensurePermission = async () => {
  const status = await LocalNotifications.checkPermissions();
  if (status.display === 'granted') return true;
  if (status.display === 'denied') return false;
  const asked = await LocalNotifications.requestPermissions();
  return asked.display === 'granted';
};

// Settings screen isse permission maangti hai ('granted' | 'denied' | 'unsupported')
export const requestNotificationPermission = async () => {
  if (!canNotify()) return 'unsupported';
  try {
    return (await ensurePermission()) ? 'granted' : 'denied';
  } catch (err) {
    console.error('Could not ask notification permission:', err);
    return 'denied';
  }
};

// Permission ki sthiti bina popup ke dekhta hai ('granted' | 'denied' | 'prompt' | 'unsupported')
export const getNotificationPermission = async () => {
  if (!canNotify()) return 'unsupported';
  try {
    const status = await LocalNotifications.checkPermissions();
    if (status.display === 'granted') return 'granted';
    if (status.display === 'denied') return 'denied';
    return 'prompt';
  } catch (err) {
    return 'prompt';
  }
};

// Phone par lage hue (pending) sab notifications hata deta hai.
// clearTray = true ho to notification tray me dikhe hue notifications bhi saaf karta hai (sirf switch OFF par use hota hai).
export const cancelAllNotifications = async (clearTray = false) => {
  if (!canNotify()) return false;
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
    }
    if (clearTray) {
      try {
        await LocalNotifications.removeAllDeliveredNotifications();
      } catch (err) {
        // not supported everywhere; ignore
      }
    }
    return true;
  } catch (err) {
    console.error('Could not cancel notifications:', err);
    return false;
  }
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
let syncAgain = false;

// Removes the old notifications and sets them again from scratch:
// festival greetings + every saved plan, in the current app language.
// Agar master switch OFF hai to sirf sab kuch cancel karta hai (kuch naya nahi lagata).
export const syncNotifications = async () => {
  if (!canNotify()) return false;

  // Sync chal raha hai to request kho nahi jati: ye khatam hote hi dobara chalega
  if (syncRunning) {
    syncAgain = true;
    return false;
  }
  syncRunning = true;

  try {
    if (!isNotifEnabled()) {
      await cancelAllNotifications(true);
      return true;
    }

    if (!(await ensurePermission())) return false;
    await ensureChannel();

    await cancelAllNotifications();

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

    // Tayyari ke dauran user ne switch OFF kar diya ho to kuch mat lagao
    if (!isNotifEnabled()) return true;

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
    if (syncAgain) {
      syncAgain = false;
      setTimeout(syncNotifications, 300);
    }
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
  if (!isNotifEnabled()) return false;
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
