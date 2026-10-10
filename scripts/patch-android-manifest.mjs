// Adds what the Trips feature needs to the Android manifest:
//   1) the invite link:  lifebox://trip/CODE  opens the app
//   2) the notification permissions (notifications, exact alarm, restart)
// It is safe to run many times: it only adds what is missing.
// The GitHub build runs it automatically, so you never have to edit AndroidManifest.xml by hand.

import fs from 'node:fs';

const MANIFEST = 'android/app/src/main/AndroidManifest.xml';

if (!fs.existsSync(MANIFEST)) {
  console.error(`Could not find ${MANIFEST}. Run "npx cap sync android" first.`);
  process.exit(1);
}

let xml = fs.readFileSync(MANIFEST, 'utf8');
const changes = [];

// ---- 1) Invite link (inside the main activity) ----
const hasDeepLink = xml.includes('android:scheme="lifebox"');

if (!hasDeepLink) {
  const activityStart = xml.search(/<activity[\s\S]*?android:name="[^"]*MainActivity"/);
  if (activityStart === -1) {
    console.error('Could not find MainActivity in AndroidManifest.xml. Nothing was changed.');
    process.exit(1);
  }

  const activityEnd = xml.indexOf('</activity>', activityStart);
  if (activityEnd === -1) {
    console.error('The manifest looks unusual (no </activity>). Nothing was changed.');
    process.exit(1);
  }

  const filter = `
        <intent-filter>
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.DEFAULT" />
            <category android:name="android.intent.category.BROWSABLE" />
            <data android:scheme="lifebox" android:host="trip" />
        </intent-filter>
    `;

  xml = xml.slice(0, activityEnd) + filter + xml.slice(activityEnd);
  changes.push('invite link (lifebox://trip)');
}

// The activity must be "singleTask" so a tapped link opens the running app instead of a second copy
const activityTag = xml.match(/<activity[\s\S]*?MainActivity[\s\S]*?>/);
if (activityTag && !/android:launchMode=/.test(activityTag[0])) {
  xml = xml.replace(activityTag[0], activityTag[0].replace(/android:name="([^"]*MainActivity)"/, 'android:name="$1"\n            android:launchMode="singleTask"'));
  changes.push('launchMode singleTask');
}

// ---- 2) Permissions ----
// POST_NOTIFICATIONS: notification dikhane ke liye.
// SCHEDULE_EXACT_ALARM: reminders theek time par aane ke liye (Goals, Planner, Trips).
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
