// Google login ke liye project me zaruri settings lagata hai (dobara chalane par kuch nahi badlega).
// Chalao:  node scripts/setup-google-login.mjs
import fs from 'node:fs';

let changed = 0;

// 1) android/variables.gradle
const gv = 'android/variables.gradle';
if (fs.existsSync(gv)) {
  let s = fs.readFileSync(gv, 'utf8');
  if (!/rgcfaIncludeGoogle/.test(s)) {
    s = s.replace(/\}\s*$/, "    rgcfaIncludeGoogle = true\n    androidxCredentialsVersion = '1.3.0'\n}\n");
    fs.writeFileSync(gv, s);
    console.log('OK  variables.gradle me Google settings jodi');
    changed++;
  } else console.log('--  variables.gradle: pehle se lagi hai');
} else console.log('XX  android/variables.gradle nahi mili (project folder me chalao)');

// 2) capacitor.config.json
const cc = 'capacitor.config.json';
if (fs.existsSync(cc)) {
  const j = JSON.parse(fs.readFileSync(cc, 'utf8'));
  j.plugins = j.plugins || {};
  const cur = j.plugins.FirebaseAuthentication || {};
  if (cur.skipNativeAuth !== true || !(cur.providers || []).includes('google.com')) {
    j.plugins.FirebaseAuthentication = { ...cur, skipNativeAuth: true, providers: ['google.com'] };
    fs.writeFileSync(cc, JSON.stringify(j, null, 2) + '\n');
    console.log('OK  capacitor.config.json me FirebaseAuthentication jodi');
    changed++;
  } else console.log('--  capacitor.config.json: pehle se lagi hai');
} else console.log('XX  capacitor.config.json nahi mili');

// 3) plugin install hai ya nahi
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const has = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }['@capacitor-firebase/authentication'];
  if (has) console.log('--  plugin install hai: @capacitor-firebase/authentication ' + has);
  else console.log('!!  plugin install NAHI hai. Chalao:  npm install @capacitor-firebase/authentication');
} catch { console.log('XX  package.json nahi mili'); }

// 4) google-services.json
console.log(fs.existsSync('android/app/google-services.json')
  ? '--  android/app/google-services.json maujood hai'
  : '!!  android/app/google-services.json nahi hai (Firebase se download karke android/app/ me rakho)');

console.log(changed ? '\nAb chalao:  npm run build && npx cap sync android' : '\nKuch badalna nahi pada.');
