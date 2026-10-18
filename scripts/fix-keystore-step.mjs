import fs from 'node:fs';
const p = '.github/workflows/build.yml';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('ANDROID_USER_HOME')) { console.log('Pehle se lagaya hua hai'); process.exit(0); }

const oldKs = '        echo "$KS" | base64 -d > ~/.android/debug.keystore\n';
const newKs = oldKs +
  '        ls -l ~/.android\n' +
  '        keytool -list -v -keystore ~/.android/debug.keystore -storepass android | grep -i "SHA1"\n';
if (!s.includes(oldKs)) { console.log('XX keystore step nahi mila'); process.exit(1); }
s = s.replace(oldKs, newKs);

const oldBuild = '    - name: Build Android APK\n      run: |';
const newBuild = '    - name: Build Android APK\n      env:\n        ANDROID_USER_HOME: /home/runner/.android\n      run: |';
if (!s.includes(oldBuild)) { console.log('XX build step nahi mila'); process.exit(1); }
s = s.replace(oldBuild, newBuild);

fs.writeFileSync(p, s);
console.log('OK');
