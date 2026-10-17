// AI chat ke chhote helpers (screen se alag rakhe hain taaki test ho sakein)

// Google ka naya model naam pehle, purane baad mein. Pehla jo chal gaya wo yaad rakha jata hai.
export const DEFAULT_MODELS = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.5-flash'];

const readJson = (storage, key, fallback = []) => {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

// Bade data (photo/audio ke data: URL, lambe text) chhota kar deta hai
export const compactValue = (v) => {
  if (typeof v === 'string') {
    if (v.startsWith('data:') || v.startsWith('blob:')) return undefined;
    return v.length > 400 ? `${v.slice(0, 400)}...` : v;
  }
  if (Array.isArray(v)) {
    const list = v.length > 60 ? v.slice(-60) : v;
    return list.map(compactValue).filter((x) => x !== undefined);
  }
  if (v && typeof v === 'object') {
    const out = {};
    Object.entries(v).forEach(([k, val]) => {
      const c = compactValue(val);
      if (c !== undefined) out[k] = c;
    });
    return out;
  }
  return v;
};

// Sabse naye items rakhta hai, jab tak size limit mein ho
export const capList = (list, maxChars) => {
  const sorted = list
    .map(compactValue)
    .sort((a, b) => String(b?.date || b?.createdAt || '').localeCompare(String(a?.date || a?.createdAt || '')));
  while (sorted.length > 1 && JSON.stringify(sorted).length > maxChars) sorted.pop();
  return sorted;
};

// Abhi AI ko user ka saved data (notes, goals, memories, plans) nahi dikhta. Pro plan par true kar dena.
export const AI_CAN_READ_APP_DATA = false;

export const buildAppData = (storage) => {
  if (!AI_CAN_READ_APP_DATA) return '';
  const notes = readJson(storage, 'lifebox_keep_notes');
  const vault = readJson(storage, 'newlife_vault'); // goals, voices, memories...
  const plans = readJson(storage, 'lifebox_planner_plans');
  return [
    `NOTES: ${JSON.stringify(capList(notes, 40000))}`,
    `GOALS / MEMORIES / VOICE NOTES / OTHER ITEMS: ${JSON.stringify(capList(vault, 60000))}`,
    `PLANNER (plans & reminders): ${JSON.stringify(capList(plans, 20000))}`,
  ].join('\n\n');
};

const pad = (n) => String(n).padStart(2, '0');
export const todayInfo = (now = new Date()) => ({
  iso: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
  text: now.toLocaleString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
});

export const buildSystemInstruction = (appData, now = new Date()) => {
  const t = todayInfo(now);
  const dataSection = appData
    ? `THE USER'S SAVED LIFE BOX DATA (below)
- When asked about their notes, goals, memories, voice notes, plans or "what did I do on <date>", answer ONLY from this data. Mention the dates.
- If nothing is saved for that date or topic, say so honestly. Never invent records.
- This is only what is saved right now. Deleted or unsaved things are not here, and items without a date cannot be placed on a date.

`
    : `PRIVACY
- You cannot see the user's saved Life Box data (notes, goals, memories, voice notes, plans) in this chat.
- If they ask about any of it, say honestly that you cannot see it and they can open that section of the app. Never invent records.

`;
  return `You are the user's close friend and personal assistant inside the "Life Box" app.

HOW TO TALK
- Chat like a warm, funny, supportive friend, the way people chat with ChatGPT. Be natural, not robotic.
- Reply in the SAME language and style the user writes in. If they write Hinglish in Roman letters, answer in Hinglish. If English, answer in English.
- Keep replies short and conversational unless the user asks for detail. Use emojis lightly.
- You can talk about anything: general questions, advice, studies, coding, feelings, jokes, plans.

${dataSection}TODAY: ${t.text} (${t.iso}). Work out words like "aaj", "kal", "parso", "last week" from today's date.

${appData}`;
};

// Chat ki pichli baatein Gemini ke format mein (text hi, aakhri message ko chhodkar)
export const buildHistoryContents = (messages, maxMessages = 24) => {
  const usable = messages.filter((m) => !m.isError && !m.isWelcome && (m.text || '').trim()).slice(-maxMessages);
  const contents = [];
  usable.forEach((m) => {
    const role = m.sender === 'user' ? 'user' : 'model';
    const last = contents[contents.length - 1];
    if (last && last.role === role) last.parts[0].text += `\n${m.text}`;
    else contents.push({ role, parts: [{ text: m.text }] });
  });
  while (contents.length && contents[0].role === 'model') contents.shift();
  return contents;
};

export const pickReplyText = (data) => {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts
    .filter((p) => p.text && !p.thought)
    .map((p) => p.text)
    .join('')
    .trim();
  if (text) return text;
  const blocked = data?.promptFeedback?.blockReason;
  return blocked ? `That message was blocked (${blocked}). Try saying it differently.` : "Hmm, I couldn't come up with a reply. Try again?";
};

export const friendlyError = (err) => {
  const m = err?.message || '';
  if (err?.status === 401 || err?.status === 403 || /api key/i.test(m)) {
    return `AI key problem: ${m}\n\nCheck VITE_GEMINI_API_KEY in .env, then rebuild the app.`;
  }
  if (err?.status === 429) return 'Too many requests right now. Wait a minute and try again.';
  if (err instanceof TypeError) return "Couldn't reach the AI. Check your internet connection.";
  return `Something went wrong: ${m}`;
};
