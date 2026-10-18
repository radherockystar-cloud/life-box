import fs from 'node:fs';
const p = '.github/workflows/build.yml';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('Print APK signing SHA-1')) { console.log('Pehle se hai'); process.exit(0); }
const step = [
  '    - name: Print APK signing SHA-1',
  '      run: |',
  '        APKSIGNER=$(ls $ANDROID_HOME/build-tools/*/apksigner | tail -1)',
  '        $APKSIGNER verify --print-certs android/app/build/outputs/apk/debug/app-debug.apk | grep -i "SHA-1\\|Signer #1 certificate DN"',
  '',
  '',
].join('\n');
const marker = '    - name: Upload APK Artifact';
if (!s.includes(marker)) { console.log('XX Upload step nahi mila'); process.exit(1); }
s = s.replace(marker, step + marker);
fs.writeFileSync(p, s);
console.log('OK step jud gaya');
