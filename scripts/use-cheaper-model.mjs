// AI ke liye sasta Gemini model pehle chunta hai (Flash-Lite), purana mehenga Flash sirf backup me.
// Chalao:  node scripts/use-cheaper-model.mjs        (do baar chalane se kuch nahi bigadta)
import fs from 'node:fs';

const HELPERS = 'src/utils/aiChatHelpers.js';
const SCREEN = 'src/screens/AiChatAppScreen.jsx';

let h = fs.readFileSync(HELPERS, 'utf8');
const re = /export const DEFAULT_MODELS = \[[^\]]*\];/;
if (!re.test(h)) throw new Error('DEFAULT_MODELS ki line nahi mili. Kuch nahi badla.');
const NEW = "export const DEFAULT_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.6-flash'];";

let s = fs.readFileSync(SCREEN, 'utf8');
const OLD_KEY = "const MODEL_KEY = 'lifebox_ai_model';";
const NEW_KEY = "const MODEL_KEY = 'lifebox_ai_model_v2'; // naya naam: purana yaad kiya hua mehenga model ignore ho jaye";
const keyDone = s.includes(NEW_KEY);
if (!keyDone && !s.includes(OLD_KEY)) throw new Error('MODEL_KEY ki line nahi mili. Kuch nahi badla.');

if (h.includes(NEW) && keyDone) {
  console.log('Pehle se lagaya hua hai, kuch nahi badla.');
  process.exit(0);
}
h = h.replace(re, NEW);
if (!keyDone) s = s.replace(OLD_KEY, NEW_KEY);
fs.writeFileSync(HELPERS, h);
fs.writeFileSync(SCREEN, s);
console.log('Done: AI ab pehle sasta Flash-Lite model use karega (3.1 -> 3.5 Flash-Lite -> 3.6 Flash backup).');
