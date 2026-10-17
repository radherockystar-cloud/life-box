// Baaki saari files me `localStorage` ko `appStorage` se badalta hai aur import line jodta hai.
//
// Pehle dekhne ke liye (kuch badalta nahi):   node scripts/migrate-to-appstorage.mjs
// Sach me badalne ke liye:                    node scripts/migrate-to-appstorage.mjs --write
//
// Jo files me pehle se `appStorage` hai (maine jo update ki hain) unhe ye chhodta hai.
// Jo jagah khud dekhni padengi (script galat na badle isliye) unki list end me deta hai.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const TARGET = path.join(SRC, 'utils', 'appStorage.js');
const WRITE = process.argv.includes('--write');
const EXTS = new Set(['.js', '.jsx', '.ts', '.tsx']);
const SKIP_FILES = new Set([path.join(SRC, 'firebase.js'), TARGET]);

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (EXTS.has(path.extname(p))) out.push(p);
  }
  return out;
}

function importLine(file) {
  let rel = path.relative(path.dirname(file), TARGET).replace(/\\/g, '/').replace(/\.js$/, '');
  if (!rel.startsWith('.')) rel = './' + rel;
  return `import { appStorage } from '${rel}';`;
}

// localStorage. (ya window.localStorage.) -> appStorage.
const AUTO = /\b(?:window\.|globalThis\.)?localStorage(?=\s*\.)/g;
const IMPORT_RE = /^import\s[^;]*?['"][^'"]+['"];?[ \t]*$/gm;

let changed = 0;
const manual = [];

for (const file of walk(SRC)) {
  if (SKIP_FILES.has(file)) continue;
  const rel = path.relative(ROOT, file);
  let text = fs.readFileSync(file, 'utf8');
  if (!/localStorage/.test(text)) continue;
  if (/\bappStorage\b/.test(text)) {
    manual.push(`${rel}: pehle se appStorage use karti hai, baaki localStorage jagah haath se dekho`);
    continue;
  }

  const next = text.replace(AUTO, 'appStorage');
  const lines = next.split('\n');
  lines.forEach((line, i) => {
    if (!/localStorage/.test(line)) return;
    manual.push(`${rel}:${i + 1}: ${line.trim()}   <- haath se dekho (script ne nahi badla)`);
  });
  // Module ke upar (import ke turant baad) hone wali padhai: app data aane se pehle chal jati hai
  lines.forEach((line, i) => {
    if (/^(export\s+)?(const|let|var)\s.*\bappStorage\b/.test(line) && !/=>|function/.test(line)) {
      manual.push(`${rel}:${i + 1}: TOP-LEVEL padhai hai, ise function ke andar le jao: ${line.trim()}`);
    }
  });

  let out = next;
  if (!/\bappStorage\b/.test(out.replace(/import \{ appStorage \}[^\n]*/, ''))) continue;
  let lastEnd = -1;
  let m;
  IMPORT_RE.lastIndex = 0;
  while ((m = IMPORT_RE.exec(out))) lastEnd = m.index + m[0].length;
  const imp = importLine(file);
  out = lastEnd >= 0 ? `${out.slice(0, lastEnd)}\n${imp}${out.slice(lastEnd)}` : `${imp}\n${out}`;

  const count = (text.match(AUTO) || []).length;
  console.log(`${WRITE ? 'badla' : 'badlega'}: ${rel} (${count} jagah)`);
  if (WRITE) fs.writeFileSync(file, out);
  changed += 1;
}

console.log(`\n${changed} files ${WRITE ? 'badli gayi' : 'badlengi (abhi kuch nahi badla, --write lagao)'}.`);
if (manual.length) {
  console.log('\nYe jagah khud dekhni hain:');
  manual.forEach((l) => console.log(' - ' + l));
}
