// AI chat ko user ke notes / goals / memories / plans padhne se rokta hai (abhi ke liye).
// Pro plan aane par sirf ek line badlo:  AI_CAN_READ_APP_DATA = true
// Chalao: node scripts/disable-ai-data-access.mjs
import fs from 'node:fs';

const FILE = 'src/utils/aiChatHelpers.js';
let s = fs.readFileSync(FILE, 'utf8');
if (s.includes('AI_CAN_READ_APP_DATA')) {
  console.log('Pehle se lagaya hua hai, kuch nahi badla.');
  process.exit(0);
}

const must = (cond, msg) => { if (!cond) throw new Error(msg + ' Kuch nahi badla.'); };

// 1. buildAppData: flag band ho to khali text do (storage padha hi nahi jayega)
const A = 'export const buildAppData = (storage) => {\n';
must(s.includes(A), 'buildAppData ki line nahi mili.');
s = s.replace(
  A,
  `// Abhi AI ko user ka saved data (notes, goals, memories, plans) nahi dikhta. Pro plan par true kar dena.
export const AI_CAN_READ_APP_DATA = false;

export const buildAppData = (storage) => {
  if (!AI_CAN_READ_APP_DATA) return '';
`,
);

// 2. System instruction: "saved data" wala hissa sirf tab, warna saaf bata do ki AI ye data nahi dekh sakta
const OLD_START = "THE USER'S SAVED LIFE BOX DATA (below)\n";
const OLD_END = 'items without a date cannot be placed on a date.\n\n';
const i = s.indexOf(OLD_START);
const j = s.indexOf(OLD_END);
must(i >= 0 && j > i, 'System instruction ka "SAVED DATA" hissa nahi mila.');
const oldBlock = s.slice(i, j + OLD_END.length);
s = s.replace(oldBlock, '${dataSection}');

const T = '  const t = todayInfo(now);\n';
must(s.includes(T), 'buildSystemInstruction me todayInfo wali line nahi mili.');
const escaped = oldBlock.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
s = s.replace(
  T,
  `${T}  const dataSection = appData
    ? \`${escaped}\`
    : \`PRIVACY
- You cannot see the user's saved Life Box data (notes, goals, memories, voice notes, plans) in this chat.
- If they ask about any of it, say honestly that you cannot see it and they can open that section of the app. Never invent records.

\`;
`,
);

// 3. Aakhir me ${appData}: khali ho to extra khali line na bane (koi dikkat nahi, bas saaf rakhne ke liye)
fs.writeFileSync(FILE, s);
console.log('Done: AI ab user ka saved data nahi padhega.');
