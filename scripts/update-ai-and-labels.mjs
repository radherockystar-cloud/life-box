// 1) AI chat screen: "apne notes/goals ke baare me pucho" wali line hatata hai (AI ab saved data nahi padhta)
// 2) translationsExtra.js: "Firebase Firestore sync" label ko "Firebase sync" karta hai (10 bhasha)
// Chalao: node scripts/update-ai-and-labels.mjs
import fs from 'node:fs';

const AI = 'src/screens/AiChatAppScreen.jsx';
let s = fs.readFileSync(AI, 'utf8');
const pairs = [
  ['Chat with me about anything, or ask about your notes, goals, memories and plans.', 'Chat with me about anything.'],
  ['placeholder="Ask anything or search your notes..."', 'placeholder="Ask me anything..."'],
];
for (const [a, b] of pairs) {
  if (s.split(a).length !== 2) throw new Error(`AiChatAppScreen me ye line ek baar nahi mili: ${a}`);
  s = s.replace(a, b);
}
fs.writeFileSync(AI, s);

const TR = 'src/utils/translationsExtra.js';
let t = fs.readFileSync(TR, 'utf8');
const before = (t.match(/Firebase[ -]Firestore/g) || []).length;
t = t.replace(/Firebase Firestore/g, 'Firebase').replace(/Firebase-Firestore-/g, 'Firebase-');
fs.writeFileSync(TR, t);
console.log(`AiChatAppScreen: 2 line badli. translationsExtra: ${before} jagah "Firestore" hataya.`);
