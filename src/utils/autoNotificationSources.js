// Har feature ke notifications yahin se apne aap judte hain.
//
// Naya feature banate waqt bas ek file banao jiska naam "Reminders.js" par khatam ho,
// jaise  src/tabs/me/habitReminders.js  ya  src/screens/noteReminders.js
// Us file me registerNotificationSource(...) likho (template: NOTIFICATIONS_GUIDE.md).
// Isme ya App.jsx me kuch aur badalne ki zarurat nahi.
//
// App.jsx me yeh file sirf ek baar import hoti hai.

const sources = import.meta.glob('../**/*Reminders.js', { eager: true });

export const loadedReminderSources = Object.keys(sources);

if (import.meta.env?.DEV) {
  console.log('Notification sources loaded:', loadedReminderSources);
}
