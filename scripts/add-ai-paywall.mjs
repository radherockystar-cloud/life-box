// AI chat me free-message limit lagata hai: free user kuch messages ke baad Pro plan screen dekhta hai.
// Chalao (project folder me):  node scripts/add-ai-paywall.mjs
// Do baar chalane se kuch nahi bigadta (pehle se laga ho to "Pehle se lagaya hua hai" likhta hai).
import fs from 'node:fs';

const FILE = 'src/screens/AiChatAppScreen.jsx';
let s = fs.readFileSync(FILE, 'utf8');
if (s.includes("from '../utils/billing'")) {
  console.log('Pehle se lagaya hua hai, kuch nahi badla.');
  process.exit(0);
}

const edits = [
  [
    "import { appStorage } from '../utils/appStorage';\n",
    "import { appStorage } from '../utils/appStorage';\nimport { useEntitlements, consumeAiMessage, openPlans } from '../utils/billing';\n",
  ],
  [
    '  const [thinkIdx, setThinkIdx] = useState(0);\n',
    '  const [thinkIdx, setThinkIdx] = useState(0);\n  const ent = useEntitlements(); // Pro hai ya free messages bache hain?\n  const aiLocked = !ent.pro && ent.aiLeft <= 0;\n',
  ],
  [
    '    if ((!inputVal.trim() && !selectedImage) || loading) return;\n',
    '    if ((!inputVal.trim() && !selectedImage) || loading) return;\n    if (aiLocked) {\n      openPlans(); // free messages khatam: Pro plan screen\n      return;\n    }\n',
  ],
  [
    "      commit([...updatedMessages, { sender: 'ai', text: pickReplyText(data) }]);\n",
    "      commit([...updatedMessages, { sender: 'ai', text: pickReplyText(data) }]);\n      consumeAiMessage(); // sirf kamyab jawab par ek free message ginta hai\n",
  ],
  [
    '      {/* Input */}\n',
    `      {/* Free messages ki jaankari / lock */}
      {!ent.pro && (
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
          <span>{aiLocked ? 'Free messages are finished. Get Pro to keep chatting.' : \`Free messages left: \${ent.aiLeft} of \${ent.aiLimit}\`}</span>
          <button
            type="button"
            onClick={openPlans}
            style={{ flexShrink: 0, padding: '6px 12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '11.5px', fontWeight: 900, color: '#fff', background: 'linear-gradient(160deg, #fb7185 0%, #e11d48 55%, #be123c 100%)' }}
          >
            {aiLocked ? 'Get Pro' : 'See plans'}
          </button>
        </div>
      )}

      {/* Input */}
`,
  ],
];

for (const [a, b] of edits) {
  if (s.split(a).length !== 2) throw new Error('AiChatAppScreen me ye jagah ek baar nahi mili, kuch nahi badla:\n' + a.trim().slice(0, 80));
  s = s.replace(a, b);
}
fs.writeFileSync(FILE, s);
console.log('AI chat me free-message limit laga diya.');
