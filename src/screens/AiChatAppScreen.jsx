import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, ImagePlus, X, History, Plus, Trash2, Flag } from 'lucide-react';
import { useBackHandler } from '../utils/useBackHandler';
import {
  DEFAULT_MODELS,
  buildAppData,
  buildSystemInstruction,
  buildHistoryContents,
  pickReplyText,
  friendlyError,
} from '../utils/aiChatHelpers';
import { appStorage } from '../utils/appStorage';
import { useEntitlements, consumeAiMessage, openPlans } from '../utils/billing';

const CHATS_KEY = 'lifebox_ai_chats'; // saari purani chats (history)
const OLD_CHAT_KEY = 'lifebox_ai_chat'; // pehle wale version ki ek chat
const MODEL_KEY = 'lifebox_ai_model_v2'; // naya naam: purana yaad kiya hua mehenga model ignore ho jaye

// Saari chats ki list (history). Pehle wali ek chat ho to usse history mein le aata hai.
const loadChats = () => {
  try {
    const raw = appStorage.getItem(CHATS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    }
    const old = JSON.parse(appStorage.getItem(OLD_CHAT_KEY) || '[]');
    const firstUser = Array.isArray(old) ? old.find((m) => m.sender === 'user') : null;
    if (firstUser) {
      const migrated = [{ id: `old-${Date.now()}`, title: (firstUser.text || 'Chat').slice(0, 48), updatedAt: Date.now(), messages: old }];
      appStorage.setItem(CHATS_KEY, JSON.stringify(migrated));
      appStorage.removeItem(OLD_CHAT_KEY);
      return migrated;
    }
  } catch (e) {
    // ignore
  }
  return [];
};

const formatWhen = (ts) =>
  new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

// AI jawab ki shikayat (Play Store AI-content policy): feedback wale web3forms se email aati hai
const reportReply = async (aiText, userText) => {
  const key = import.meta.env.VITE_FEEDBACK_KEY;
  if (!key) return false;
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: key,
        subject: 'Life Box: AI reply reported',
        message: `User message:\n${(userText || '').slice(0, 1200)}\n\nReported AI reply:\n${(aiText || '').slice(0, 3000)}`,
      }),
    });
    const data = await res.json();
    return !!data.success;
  } catch (e) {
    return false;
  }
};

const THINK_EMOJIS = ['🤔', '💭', '🧠', '💡', '✨'];

const CSS = `
@keyframes lbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes lbGlow{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:1;transform:scale(1.14)}}
@keyframes lbSpin3d{from{transform:rotateY(0deg)}to{transform:rotateY(360deg)}}
@keyframes lbBounce{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-11px) scale(1.12)}}
@keyframes lbShadow{0%,100%{transform:scaleX(1);opacity:.45}50%{transform:scaleX(.6);opacity:.22}}
@keyframes lbDot{0%,80%,100%{transform:scale(.55);opacity:.35}40%{transform:scale(1);opacity:1}}
@keyframes lbRise{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}
.lb-msg{animation:lbRise .28s ease-out}
.lb-input::placeholder{color:rgba(190,24,93,.45)}
.lb-input:focus{border-color:rgba(244,63,94,.85)!important;box-shadow:0 0 0 3px rgba(244,63,94,.16),0 0 26px rgba(244,63,94,.28)!important}
.lb-scroll::-webkit-scrollbar{width:0;height:0}
`;

const INK = '#3b0f24'; // gehra rose-brown text

const ROOT_BG =
  'radial-gradient(90% 42% at 0% 0%,rgba(251,113,133,.30) 0%,transparent 60%),radial-gradient(80% 45% at 100% 22%,rgba(244,114,182,.30) 0%,transparent 62%),radial-gradient(80% 40% at 50% 100%,rgba(251,146,190,.30) 0%,transparent 65%),linear-gradient(180deg,#fff8fb 0%,#ffeaf3 55%,#ffdfee 100%)';

// Glossy white-pink glass
const glass = {
  background: 'linear-gradient(160deg,#ffffff 0%,rgba(255,255,255,0.80) 55%,rgba(255,232,242,0.95) 100%)',
  border: '1px solid rgba(251,113,133,0.28)',
  borderTop: '1px solid #ffffff',
  boxShadow: 'inset 0 2px 0 #ffffff, inset 0 -9px 14px -10px rgba(244,63,94,0.28), 0 10px 22px -10px rgba(244,63,94,0.38), 0 0 24px -6px rgba(251,113,133,0.4)',
};

const roseBtn = {
  background: 'linear-gradient(160deg,#fb7185 0%,#e11d48 55%,#be123c 100%)',
  border: '1px solid rgba(255,255,255,0.5)',
  borderTop: '1px solid rgba(255,255,255,0.85)',
  boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.65), inset 0 -6px 12px -6px rgba(80,0,40,0.5), 0 8px 18px -4px rgba(225,29,72,0.65), 0 0 24px rgba(244,63,94,0.5)',
  color: '#fff',
};

const avatarStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  color: '#fff',
  background: 'linear-gradient(160deg,#fb7185,#e11d48 60%,#9f1239)',
  boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.65), 0 6px 14px -2px rgba(225,29,72,0.6), 0 0 16px rgba(244,63,94,0.45)',
};

const bubbleBase = { padding: '12px 15px', maxWidth: '82%', fontSize: '13.5px', fontWeight: 600, lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word' };
const aiBubble = { ...glass, ...bubbleBase, color: INK, borderRadius: '20px 20px 20px 6px' };
const errBubble = { ...aiBubble, border: '1px solid rgba(225,29,72,0.65)', boxShadow: `${glass.boxShadow}, 0 0 20px -2px rgba(244,63,94,0.55)` };
const userBubble = {
  ...bubbleBase,
  color: '#fff',
  borderRadius: '20px 20px 6px 20px',
  background: 'linear-gradient(135deg,#fb7185 0%,#e11d48 55%,#c026d3 100%)',
  border: '1px solid rgba(255,255,255,0.45)',
  borderTop: '1px solid rgba(255,255,255,0.85)',
  boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.6), inset 0 -8px 14px -8px rgba(80,0,60,0.45), 0 10px 22px -8px rgba(225,29,72,0.6), 0 0 22px -6px rgba(244,63,94,0.55)',
};

// 3D (extrude) wala text, halke background par bhi saaf dikhta hai
const text3dBig = {
  color: '#ff2d6f',
  fontWeight: 900,
  fontSize: '42px',
  lineHeight: 1.1,
  letterSpacing: '0.01em',
  textShadow:
    '0 -1px 0 #ffffff, 0 1px 0 #f43f5e, 0 2px 0 #e11d48, 0 3px 0 #cf1747, 0 4px 0 #be123c, 0 5px 0 #a50f35, 0 6px 0 #8f0d2f, 0 14px 16px rgba(190,18,60,0.4), 0 0 34px rgba(251,113,133,0.8)',
};
const text3dMid = {
  ...text3dBig,
  color: '#d946ef',
  fontSize: '25px',
  textShadow:
    '0 -1px 0 #ffffff, 0 1px 0 #c026d3, 0 2px 0 #a21caf, 0 3px 0 #86198f, 0 4px 0 #701a75, 0 10px 12px rgba(134,25,143,0.35), 0 0 28px rgba(232,121,249,0.75)',
};

export default function AiChatAppScreen({ onBack }) {
  // Har baar screen khulne par nayi (khaali) chat. Purani chats History mein milti hain.
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState(loadChats);
  const [historyOpen, setHistoryOpen] = useState(false);
  const chatIdRef = useRef(null); // abhi khuli chat ki id (null = nayi chat)
  const chatsRef = useRef(chats);
  const [inputVal, setInputVal] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [thinkIdx, setThinkIdx] = useState(0);
  const [reported, setReported] = useState({}); // index -> 'sending' | 'done' | 'fail'
  const ent = useEntitlements(); // Pro hai ya free messages bache hain?
  const aiLocked = ent.aiBlocked;

  // Jawab aane tak 3D emoji badalta rehta hai
  useEffect(() => {
    if (!loading) return undefined;
    const timer = setInterval(() => setThinkIdx((i) => (i + 1) % THINK_EMOJIS.length), 1100);
    return () => clearInterval(timer);
  }, [loading]);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const ENV_MODEL = import.meta.env.VITE_GEMINI_MODEL;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  // Phone ka back button: pehle History band, phir screen se bahar
  useBackHandler(historyOpen, () => setHistoryOpen(false));

  const persistChats = (list) => {
    chatsRef.current = list;
    setChats(list);
    try {
      appStorage.setItem(CHATS_KEY, JSON.stringify(list));
    } catch (e) {
      // save na ho paye to bhi chat chalegi
    }
  };
  // Messages dikhao aur is chat ko history mein save karo (khaali chat save nahi hoti, photo save nahi hoti)
  const commit = (nextMessages) => {
    setMessages(nextMessages);
    const firstUser = nextMessages.find((m) => m.sender === 'user');
    if (!firstUser) return;
    if (!chatIdRef.current) chatIdRef.current = `${Date.now()}`;
    const entry = {
      id: chatIdRef.current,
      title: (firstUser.text || 'Photo chat').slice(0, 48),
      updatedAt: Date.now(),
      messages: nextMessages.slice(-100).map(({ image, ...rest }) => rest),
    };
    persistChats([entry, ...chatsRef.current.filter((c) => c.id !== entry.id)].slice(0, 50));
  };

  const startNewChat = () => {
    if (loading) return;
    chatIdRef.current = null;
    setReported({});
    setMessages([]);
    setInputVal('');
    setSelectedImage(null);
    setHistoryOpen(false);
  };

  const openChat = (chat) => {
    if (loading) return;
    chatIdRef.current = chat.id;
    setReported({});
    setMessages((chat.messages || []).filter((m) => !m.isWelcome));
    setInputVal('');
    setSelectedImage(null);
    setHistoryOpen(false);
  };

  const deleteChat = (chat) => {
    if (!window.confirm('Delete this chat?')) return;
    persistChats(chatsRef.current.filter((c) => c.id !== chat.id));
    if (chatIdRef.current === chat.id) {
      chatIdRef.current = null;
      setMessages([]);
    }
  };

  const handleReport = async (idx) => {
    if (reported[idx] === 'sending' || reported[idx] === 'done') return;
    if (!window.confirm('Report this AI reply as harmful or incorrect?')) return;
    setReported((r) => ({ ...r, [idx]: 'sending' }));
    const prevUser = [...messages.slice(0, idx)].reverse().find((x) => x.sender === 'user');
    const ok = await reportReply(messages[idx].text, prevUser?.text);
    setReported((r) => ({ ...r, [idx]: ok ? 'done' : 'fail' }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };
  };

  // Gemini ko bhejo. Model band ho chuka ho to agla model try karta hai.
  const callGemini = async (body) => {
    if (!GEMINI_API_KEY) {
      const err = new Error('API key is missing.');
      err.status = 401;
      throw err;
    }
    let remembered = '';
    try {
      remembered = appStorage.getItem(MODEL_KEY) || '';
    } catch (e) {
      remembered = '';
    }
    const models = [...new Set([remembered, ENV_MODEL, ...DEFAULT_MODELS].filter(Boolean))];

    let lastErr;
    for (const model of models) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
        body: JSON.stringify(body),
      });
      let data = {};
      try {
        data = await response.json();
      } catch (e) {
        data = {};
      }
      if (response.ok && !data.error) {
        try {
          appStorage.setItem(MODEL_KEY, model);
        } catch (e) {
          // ignore
        }
        return data;
      }
      const msg = data?.error?.message || `HTTP ${response.status}`;
      lastErr = Object.assign(new Error(msg), { status: response.status });
      const modelGone = response.status === 404 || /not found|no longer available|not supported/i.test(msg);
      if (!modelGone) throw lastErr;
    }
    throw lastErr;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputVal.trim() && !selectedImage) || loading) return;
    if (aiLocked) {
      if (!ent.pro) openPlans(); // free messages khatam: Pro plan screen
      return;
    }

    const userMsg = {
      sender: 'user',
      text: inputVal.trim(),
      image: selectedImage,
    };

    const updatedMessages = [...messages, userMsg];
    commit(updatedMessages);
    const currentInput = inputVal.trim() || 'Describe this image.';
    const currentImage = selectedImage;

    setInputVal('');
    setSelectedImage(null);
    setLoading(true);

    try {
      // Pichli baatein + ab ka message (photo ho to saath mein)
      const contents = buildHistoryContents(messages, 10);
      contents.forEach((c) => c.parts.forEach((p) => { if (typeof p.text === 'string' && p.text.length > 1500) p.text = p.text.slice(-1500); }));
      const parts = [{ text: currentInput }];
      if (currentImage) {
        const base64Data = currentImage.split(',')[1];
        const mimeType = currentImage.substring(currentImage.indexOf(':') + 1, currentImage.indexOf(';'));
        parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
      }
      const last = contents[contents.length - 1];
      if (last && last.role === 'user') {
        last.parts = [{ text: `${last.parts[0].text}\n${currentInput}` }, ...parts.slice(1)];
      } else {
        contents.push({ role: 'user', parts });
      }

      const data = await callGemini({
        system_instruction: { parts: [{ text: buildSystemInstruction(buildAppData(appStorage)) }] },
        contents,
      });

      commit([...updatedMessages, { sender: 'ai', text: pickReplyText(data) }]);
      consumeAiMessage(data); // kamyab jawab par free message / Pro ka kharcha judta hai
    } catch (error) {
      console.error('AI error:', error);
      commit([...updatedMessages, { sender: 'ai', isError: true, text: friendlyError(error) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: ROOT_BG, color: INK }}
    >
      <style>{CSS}</style>

      {/* Header */}
      <div
        style={{
          position: 'relative',
          flexShrink: 0,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,238,246,0.96))',
          borderBottom: '1px solid rgba(251,113,133,0.25)',
          boxShadow: '0 12px 28px -14px rgba(244,63,94,0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            aria-label="Chat history"
            style={{ ...glass, width: '44px', height: '44px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48', flexShrink: 0, cursor: 'pointer' }}
          >
            <History size={20} />
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 900, color: INK, textShadow: '0 0 16px rgba(251,113,133,0.45)' }}>AI Life Assistant</div>
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: 900,
                letterSpacing: '0.04em',
                background: 'linear-gradient(90deg,#e11d48,#c026d3,#f59e0b)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Life Box Pro Mode
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={startNewChat}
          aria-label="New chat"
          style={{ ...roseBtn, width: '44px', height: '44px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          <Plus size={22} />
        </button>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: '-1px', height: '2px', background: 'linear-gradient(90deg,transparent,#fb7185,#e879f9,transparent)', boxShadow: '0 0 12px rgba(244,63,94,0.7)' }} />
      </div>

      {/* Messages */}
      <div className="lb-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {messages.length === 0 && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '34px 8px 0' }}>
            <div style={{ position: 'relative', width: '104px', height: '104px' }}>
              <div style={{ position: 'absolute', inset: '-28px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,113,133,0.65), transparent 66%)', animation: 'lbGlow 3s ease-in-out infinite' }} />
              <div
                style={{
                  position: 'relative',
                  width: '104px',
                  height: '104px',
                  borderRadius: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  background: 'linear-gradient(160deg,#fda4af 0%,#e11d48 52%,#a21caf 100%)',
                  border: '1px solid rgba(255,255,255,0.6)',
                  borderTop: '1px solid #ffffff',
                  boxShadow: 'inset 0 3px 0 rgba(255,255,255,0.7), inset 0 -14px 20px -10px rgba(90,0,60,0.55), 0 22px 30px -10px rgba(190,18,60,0.55), 0 0 44px rgba(251,113,133,0.7)',
                  animation: 'lbFloat 3.4s ease-in-out infinite',
                }}
              >
                <Bot size={50} style={{ filter: 'drop-shadow(0 4px 6px rgba(80,0,40,0.4))' }} />
              </div>
            </div>
            <div style={{ ...text3dBig, marginTop: '34px' }}>Hey! 👋</div>
            <div style={{ ...text3dMid, marginTop: '12px' }}>I&apos;m your Life Box friend</div>
            <p style={{ marginTop: '22px', maxWidth: '300px', fontSize: '13px', fontWeight: 700, lineHeight: 1.65, color: '#8a3358' }}>
              Chat with me about anything.
            </p>
          </div>
        )}

        {messages.map((m, idx) => (
          <div key={idx} className="lb-msg" style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.sender === 'ai' && (
              <div style={avatarStyle}>
                <Bot size={16} />
              </div>
            )}
            <div style={m.sender === 'user' ? userBubble : m.isError ? errBubble : aiBubble}>
              {m.image && <img src={m.image} alt="Uploaded" style={{ width: '160px', height: '160px', objectFit: 'cover', borderRadius: '14px', marginBottom: '8px', display: 'block' }} />}
              {m.text}
              {m.sender === 'ai' && !m.isError && !m.isWelcome && (
                <button
                  type="button"
                  onClick={() => handleReport(idx)}
                  disabled={reported[idx] === 'sending' || reported[idx] === 'done'}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', padding: 0, fontSize: '10.5px', fontWeight: 800, color: '#b0587a', cursor: 'pointer', background: 'transparent', border: 'none' }}
                >
                  <Flag size={11} />
                  {reported[idx] === 'done' ? 'Reported. Thank you!' : reported[idx] === 'sending' ? 'Sending...' : reported[idx] === 'fail' ? 'Could not send. Tap to retry' : 'Report this reply'}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="lb-msg" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={avatarStyle}>
              <Bot size={16} />
            </div>
            <div style={{ ...aiBubble, padding: '10px 20px 10px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ position: 'relative', width: '48px', height: '56px', perspective: '260px' }}>
                <div style={{ animation: 'lbBounce 1.1s ease-in-out infinite', transformStyle: 'preserve-3d' }}>
                  <div
                    key={thinkIdx}
                    style={{
                      fontSize: '36px',
                      lineHeight: '44px',
                      textAlign: 'center',
                      animation: 'lbSpin3d 0.7s ease-out',
                      filter: 'drop-shadow(0 6px 6px rgba(120,20,60,0.4)) drop-shadow(0 0 12px rgba(244,63,94,0.6))',
                    }}
                  >
                    {THINK_EMOJIS[thinkIdx]}
                  </div>
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: '50%', marginLeft: '-15px', width: '30px', height: '7px', borderRadius: '50%', background: 'rgba(160,30,80,0.45)', filter: 'blur(3px)', animation: 'lbShadow 1.1s ease-in-out infinite' }} />
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                {[0, 1, 2].map((d) => (
                  <span key={d} style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'linear-gradient(160deg,#fda4af,#e11d48)', boxShadow: '0 0 10px rgba(244,63,94,0.8)', animation: `lbDot 1.2s ease-in-out ${d * 0.18}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Photo preview */}
      {selectedImage && (
        <div style={{ padding: '0 12px 8px', flexShrink: 0 }}>
          <div style={{ ...glass, display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '18px' }}>
            <img src={selectedImage} alt="Preview" style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '12px' }} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: INK }}>Photo attached</span>
            <button type="button" onClick={() => setSelectedImage(null)} aria-label="Remove photo" style={{ padding: '5px', borderRadius: '50%', background: 'rgba(244,63,94,0.15)', color: '#e11d48', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* AI limit ki jaankari: free = messages, Pro = mahine ka allowance */}
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

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 12px calc(12px + env(safe-area-inset-bottom, 0px))',
          background: 'linear-gradient(180deg, rgba(255,238,246,0.97), rgba(255,255,255,0.99))',
          borderTop: '1px solid rgba(251,113,133,0.25)',
          boxShadow: '0 -12px 28px -14px rgba(244,63,94,0.45)',
        }}
      >
        <label style={{ ...glass, width: '46px', height: '46px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48', cursor: 'pointer', flexShrink: 0 }}>
          <ImagePlus size={20} />
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
        </label>

        <input
          type="text"
          className="lb-input"
          maxLength={1200}
          placeholder="Ask me anything..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          style={{
            flex: 1,
            minWidth: 0,
            height: '46px',
            boxSizing: 'border-box',
            padding: '0 16px',
            borderRadius: '18px',
            outline: 'none',
            fontSize: '13.5px',
            fontWeight: 600,
            color: INK,
            background: '#ffffff',
            border: '1px solid rgba(251,113,133,0.4)',
            boxShadow: 'inset 0 2px 6px rgba(244,63,94,0.14)',
          }}
        />

        <button
          type="submit"
          disabled={loading}
          aria-label="Send"
          style={{ ...roseBtn, width: '46px', height: '46px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, opacity: loading ? 0.55 : 1 }}
        >
          <Send size={19} />
        </button>
      </form>

      {/* History drawer */}
      {historyOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex' }}>
          <div
            style={{
              width: '86%',
              maxWidth: '360px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(180deg,#ffffff 0%,#ffeef5 100%)',
              borderRight: '1px solid rgba(251,113,133,0.35)',
              boxShadow: '12px 0 40px rgba(190,18,60,0.3), 0 0 40px rgba(251,113,133,0.35)',
            }}
          >
            <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(251,113,133,0.2)', flexShrink: 0 }}>
              <div style={{ fontSize: '17px', fontWeight: 900, color: INK, textShadow: '0 0 16px rgba(251,113,133,0.45)' }}>Chat history</div>
              <button type="button" onClick={() => setHistoryOpen(false)} aria-label="Close" style={{ ...glass, width: '38px', height: '38px', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '12px', flexShrink: 0 }}>
              <button type="button" onClick={startNewChat} style={{ ...roseBtn, width: '100%', padding: '13px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', fontWeight: 900, cursor: 'pointer' }}>
                <Plus size={17} /> New chat
              </button>
            </div>

            <div className="lb-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 12px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chats.length === 0 && (
                <p style={{ textAlign: 'center', marginTop: '40px', fontSize: '12px', fontWeight: 700, color: '#b0587a' }}>No chats yet. Say hi to start one!</p>
              )}
              {chats.map((chat) => {
                const active = chat.id === chatIdRef.current;
                return (
                  <div
                    key={chat.id}
                    style={{
                      ...glass,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '18px',
                      ...(active ? { border: '1px solid rgba(225,29,72,0.8)', boxShadow: `${glass.boxShadow}, 0 0 22px -2px rgba(244,63,94,0.6)` } : {}),
                    }}
                  >
                    <button type="button" onClick={() => openChat(chat)} style={{ flex: 1, minWidth: 0, textAlign: 'left', color: INK, cursor: 'pointer' }}>
                      <div style={{ fontSize: '13px', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.title}</div>
                      <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#b0587a', marginTop: '3px' }}>{formatWhen(chat.updatedAt)}</div>
                    </button>
                    <button type="button" onClick={() => deleteChat(chat)} aria-label="Delete chat" style={{ padding: '9px', borderRadius: '12px', color: '#e11d48', background: 'rgba(244,63,94,0.1)', cursor: 'pointer', flexShrink: 0 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ flex: 1, background: 'rgba(80,10,40,0.42)' }} onClick={() => setHistoryOpen(false)} />
        </div>
      )}
    </div>
  );
}
