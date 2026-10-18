// AI chat me Pro user ka mahine ka kharcha-limit, aur chhote messages/history lagata hai.
// Pehle `node scripts/add-ai-paywall.mjs` chal chuka hona chahiye (wo aap chala chuke ho).
// Chalao:  node scripts/ai-budget.mjs      (do baar chalane se kuch nahi bigadta)
import fs from 'node:fs';

const FILE = 'src/screens/AiChatAppScreen.jsx';
let s = fs.readFileSync(FILE, 'utf8');
if (s.includes('ent.aiBanner')) {
  console.log('Pehle se lagaya hua hai, kuch nahi badla.');
  process.exit(0);
}
if (!s.includes("from '../utils/billing'")) throw new Error('Pehle node scripts/add-ai-paywall.mjs chalao. Kuch nahi badla.');

const once = (a) => {
  if (s.split(a).length !== 2) throw new Error('AiChatAppScreen me ye jagah ek baar nahi mili, kuch nahi badla:\n' + a.trim().slice(0, 90));
};
const edit = (a, b) => {
  once(a);
  s = s.replace(a, b);
};

// 1) lock ki shart ab billing.js se aati hai (free: messages khatam, Pro: mahine ka allowance khatam)
edit('  const aiLocked = !ent.pro && ent.aiLeft <= 0;\n', '  const aiLocked = ent.aiBlocked;\n');

// 2) Pro ka allowance khatam ho to plans screen mat kholo (wo Pro hai), bas banner dikhe
edit('    if (aiLocked) {\n      openPlans(); // free messages khatam: Pro plan screen\n      return;\n    }\n',
     '    if (aiLocked) {\n      if (!ent.pro) openPlans(); // free messages khatam: Pro plan screen\n      return;\n    }\n');

// 3) Pichli baatein kam (sirf aakhri 10), har message ki lambai par had: kharcha kam rehta hai
edit('      const contents = buildHistoryContents(messages);\n',
     "      const contents = buildHistoryContents(messages, 10);\n      contents.forEach((c) => c.parts.forEach((p) => { if (typeof p.text === 'string' && p.text.length > 1500) p.text = p.text.slice(-1500); }));\n");

// 4) Kamyab jawab ka kharcha joda jaye (Gemini ka poora jawab bhejte hain)
edit('      consumeAiMessage(); // sirf kamyab jawab par ek free message ginta hai\n',
     '      consumeAiMessage(data); // kamyab jawab par free message / Pro ka kharcha judta hai\n');

// 5) Lamba message type na ho sake
edit('className="lb-input"\n', 'className="lb-input"\n          maxLength={1200}\n');

// 6) Banner: free ke liye messages, Pro ke liye allowance (kam bachne par / khatam hone par)
const a = s.indexOf('      {/* Free messages ki jaankari / lock */}');
const b = s.indexOf('      {/* Input */}');
if (a < 0 || b < a) throw new Error('Banner wala hissa nahi mila, kuch nahi badla.');
const banner = `      {/* AI limit ki jaankari: free = messages, Pro = mahine ka allowance */}
      {ent.aiBanner && (
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            padding: '8px 14px',
            background: aiLocked ? 'rgba(254,226,226,0.95)' : 'rgba(255,247,237,0.95)',
            borderTop: '1px solid rgba(251,113,133,0.25)',
            fontSize: '11.5px',
            fontWeight: 800,
            color: aiLocked ? '#9f1239' : '#92400e',
          }}
        >
          <span>{ent.aiBanner}</span>
          {!ent.pro && (
            <button
              type="button"
              onClick={openPlans}
              style={{ flexShrink: 0, padding: '6px 12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '11.5px', fontWeight: 900, color: '#fff', background: 'linear-gradient(160deg, #fb7185 0%, #e11d48 55%, #be123c 100%)' }}
            >
              {aiLocked ? 'Get Pro' : 'See plans'}
            </button>
          )}
        </div>
      )}

`;
s = s.slice(0, a) + banner + s.slice(b);

fs.writeFileSync(FILE, s);
console.log('Done: AI chat me mahine ka kharcha-limit lag gaya.');
