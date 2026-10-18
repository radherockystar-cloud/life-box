import fs from 'node:fs';
const p = '.github/workflows/build.yml';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('DEBUG_KEYSTORE_BASE64')) { console.log('Pehle se jud chuka hai'); process.exit(0); }
const step = [
  '    - name: Use fixed debug keystore',
  '      env:',
  '        KS: ${{ secrets.DEBUG_KEYSTORE_BASE64 }}',
  '      run: |',
  '        mkdir -p ~/.android',
  '        echo "$KS" | base64 -d > ~/.android/debug.keystore',
  '',
  '',
].join('\n');
const marker = '    - name: Build Android APK';
if (!s.includes(marker)) { console.log('XX Build Android APK step nahi mila'); process.exit(1); }
s = s.replace(marker, step + marker);
fs.writeFileSync(p, s);
console.log('OK step jud gaya');
