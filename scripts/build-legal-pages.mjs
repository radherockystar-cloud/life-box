// Privacy Policy / Terms ke web pages app ki asli files se banata hai.
// Source: src/components/PrivacyPolicyView.jsx, TermsView.jsx
// Un files me text badlo + push karo -> web page apne aap update ho jata hai.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'site');
const APP = 'Life Box';
const EMAIL = 'lifeboxapp.dev@gmail.com';

const read = (f) => fs.readFileSync(path.join(ROOT, 'src/components', f), 'utf8');

// "const SECTIONS = [ ... ];" ko bracket matching se nikaalta hai
function extractArray(src) {
  const start = src.indexOf('const SECTIONS = [');
  if (start < 0) throw new Error('SECTIONS not found');
  let i = src.indexOf('[', start);
  let depth = 0, q = null, esc = false;
  for (let j = i; j < src.length; j++) {
    const ch = src[j];
    if (q) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === q) q = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { q = ch; continue; }
    if (ch === '[') depth++;
    if (ch === ']') { depth--; if (depth === 0) return src.slice(i, j + 1); }
  }
  throw new Error('SECTIONS not closed');
}

const prop = (src, name) => {
  const m = src.match(new RegExp(name + '=(?:"([^"]*)"|\\{`([^`]*)`\\})'));
  return m ? (m[1] ?? m[2]) : '';
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const CSS = `body{margin:0;font:16px/1.65 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#2b1020;background:#fff8fb}
main{max-width:760px;margin:0 auto;padding:28px 18px 60px}
h1{font-size:28px;margin:0 0 4px;color:#be123c}h2{font-size:19px;margin:28px 0 8px;color:#9f1239}
p,li{margin:8px 0}.meta{color:#8a3358;font-size:14px}a{color:#be123c}
nav{margin-bottom:18px;font-size:14px}nav a{margin-right:14px}`;

const page = (title, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} - ${APP}</title><style>${CSS}</style></head><body><main>
<nav><a href="index.html">Home</a><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms &amp; Conditions</a><a href="delete-account.html">Delete account</a></nav>
${body}</main></body></html>`;

function doc(file, title) {
  const src = read(file);
  const sections = new Function('EMAIL', `return ${extractArray(src)}`)(EMAIL);
  const updated = prop(src, 'updated');
  const intro = prop(src, 'intro');
  let h = `<h1>${esc(title)}</h1><p class="meta">${APP} &middot; Last updated: ${esc(updated)}</p><p>${esc(intro)}</p>`;
  for (const s of sections) {
    h += `<h2>${esc(s.h)}</h2>`;
    (s.p || []).forEach((t) => (h += `<p>${esc(t)}</p>`));
    if (s.list) h += `<ul>${s.list.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
  }
  return page(title, h);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'privacy.html'), doc('PrivacyPolicyView.jsx', 'Privacy Policy'));
fs.writeFileSync(path.join(OUT, 'terms.html'), doc('TermsView.jsx', 'Terms & Conditions'));

fs.writeFileSync(path.join(OUT, 'delete-account.html'), page('Delete your account', `
<h1>Delete your ${APP} account</h1>
<p class="meta">Developer: Radhe Rocky Star, India</p>
<h2>Option 1: inside the app (fastest)</h2>
<ol><li>Open the ${APP} app and go to the <b>Me</b> tab.</li><li>Tap <b>Delete account</b> and confirm.</li></ol>
<p>This deletes your login account, your profile and your cloud data (notes, memories, goals, voice notes, planner entries and AI chat history).</p>
<h2>Option 2: by email</h2>
<p>If you cannot open the app, email <a href="mailto:${EMAIL}">${EMAIL}</a> from the address you registered with, with the subject <b>Delete my account</b>. We will delete your account and data within 30 days.</p>
<h2>What is kept</h2>
<p>Content saved only on your phone (guest mode) is removed when you uninstall the app or clear its data. Subscriptions are billed by Google Play; cancel them in Google Play &gt; Payments &amp; subscriptions. Feedback emails you sent may be kept only as long as needed to respond.</p>
`));

fs.writeFileSync(path.join(OUT, 'index.html'), page(APP, `
<h1>${APP}</h1><p>Personal life-organiser app: planner, notes, memories, goals, voice notes and an AI assistant.</p>
<ul><li><a href="privacy.html">Privacy Policy</a></li><li><a href="terms.html">Terms &amp; Conditions</a></li><li><a href="delete-account.html">Delete your account</a></li></ul>
<p>Contact: <a href="mailto:${EMAIL}">${EMAIL}</a></p>`));

console.log('Pages built in site/');
