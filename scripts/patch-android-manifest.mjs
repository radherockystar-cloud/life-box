// Adds the notification permissions that reminders need to the Android manifest.
// (The People / Trips invite link was removed together with the People tab.)
// It is safe to run many times: it only adds what is missing, and it removes
// the old "lifebox://trip" invite link if an earlier build had added it.
// The GitHub build runs it automatically, so you never have to edit AndroidManifest.xml by hand.

import fs from 'node:fs';

const MANIFEST = 'android/app/src/main/AndroidManifest.xml';

if (!fs.existsSync(MANIFEST)) {
  console.error(`Could not find ${MANIFEST}. Run "npx cap sync android" first.`);
  process.exit(1);
}

let xml = fs.readFileSync(MANIFEST, 'utf8');
const changes = [];

// ---- 1) Purana trip invite link hatao (agar kisi pichhle build se bacha ho) ----
xml = xml.replace(/[ \t]*<intent-filter>[\s\S]*?<\/intent-filter>[ \t]*\r?\n?/g, (block) => {
  if (block.includes('android:scheme="lifebox"')) {
    changes.push('removed old invite link (lifebox://trip)');
    return '';
  }
  return block;
});

// ---- 2) Permissions ----
// POST_NOTIFICATIONS: notification dikhane ke liye.
// SCHEDULE_EXACT_ALARM: reminders theek time par aane ke liye (Planner).
// RECEIVE_BOOT_COMPLETED: phone restart ke baad bhi reminders chalu rahein.
const permissions = [
  'android.permission.POST_NOTIFICATIONS',
  'android.permission.SCHEDULE_EXACT_ALARM',
  'android.permission.RECEIVE_BOOT_COMPLETED',
];

permissions.forEach((permission) => {
  if (!xml.includes(`android:name="${permission}"`)) {
    xml = xml.replace('</manifest>', `    <uses-permission android:name="${permission}" />\n</manifest>`);
    changes.push(permission);
  }
});

if (changes.length === 0) {
  console.log('AndroidManifest.xml already has everything. Nothing to do.');
} else {
  fs.writeFileSync(MANIFEST, xml);
  console.log('AndroidManifest.xml updated: ' + changes.join(', '));
}
