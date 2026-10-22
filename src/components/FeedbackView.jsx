import React, { useState } from 'react';
import { MessageSquarePlus, Send, Star, CheckCircle2, Loader2 } from 'lucide-react';
import { translations } from '../utils/translations';
import { appStorage } from '../utils/appStorage';
import { useScreenT } from '../utils/screenTexts';

// Feedback seedha developer ke inbox mein jaata hai (form-to-email service).
// Developer ka email app mein kahin nahi hai, sirf ek access key hai (.env: VITE_FEEDBACK_KEY).
const FEEDBACK_KEY = import.meta.env.VITE_FEEDBACK_KEY;
const THROTTLE_KEY = 'lifebox_feedback_last';
const CATEGORIES = ['Suggestion', 'Bug', 'Compliment', 'Other'];

export default function FeedbackView({ currentTheme, currentLang }) {
  const t = translations[currentLang] || translations.en;
  const { st } = useScreenT();
  const CAT_LABEL = { Suggestion: st('zFbSuggestion'), Bug: st('zFbBug'), Compliment: st('zFbCompliment'), Other: st('zFbOther') };
  const dark = currentTheme === 'dark';
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('Suggestion');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent
  const [error, setError] = useState('');

  const ink = dark ? '#f9fafb' : '#111827';
  const body = dark ? '#d1d5db' : '#4b5563';
  const field = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #d1d5db',
    background: dark ? '#0f172a' : '#ffffff',
    color: dark ? '#fff' : '#000',
    fontSize: '13px',
    fontWeight: '600',
    outline: 'none',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    setError('');

    if (message.trim().length < 10) {
      setError(st('zFbShort'));
      return;
    }
    let last = 0;
    try {
      last = Number(appStorage.getItem(THROTTLE_KEY) || 0);
    } catch (err) {
      last = 0;
    }
    if (Date.now() - last < 30000) {
      setError(st('zFbWait'));
      return;
    }
    if (!FEEDBACK_KEY) {
      setError(st('zFbNA'));
      return;
    }

    setStatus('sending');
    try {
      const payload = {
        access_key: FEEDBACK_KEY,
        subject: `Life Box feedback: ${category} (${rating}/5)`,
        from_name: 'Life Box App',
        category,
        rating: `${rating}/5`,
        message: message.trim(),
      };
      if (email.trim()) payload.email = email.trim(); // reply-to ke liye

      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        try {
          appStorage.setItem(THROTTLE_KEY, String(Date.now()));
        } catch (err) {
          // ignore
        }
        setMessage('');
        setEmail('');
        setStatus('sent');
      } else {
        setStatus('idle');
        setError(st('zFbFail'));
      }
    } catch (err) {
      setStatus('idle');
      setError(st('zFbNet'));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ padding: '10px', borderRadius: '14px', background: '#ecfdf5', color: '#059669' }}><MessageSquarePlus size={20} /></div>
        <h3 style={{ fontSize: '16px', fontWeight: '900', color: ink }}>{t.feedback}</h3>
      </div>

      <div style={{ padding: '20px', borderRadius: '20px', background: dark ? '#1e293b' : '#fafafa', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {status === 'sent' ? (
          <div style={{ textAlign: 'center', padding: '14px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={44} color="#059669" />
            <div style={{ fontSize: '16px', fontWeight: '900', color: ink }}>{st('zFbThanks')}</div>
            <p style={{ fontSize: '12.5px', color: body, lineHeight: '1.7', fontWeight: '600' }}>
              {st('zFbReached')}
            </p>
            <button type="button" onClick={() => setStatus('idle')} style={{ padding: '10px 18px', borderRadius: '12px', background: '#059669', color: '#fff', border: 'none', fontWeight: '900', cursor: 'pointer' }}>
              {st('zFbAnother')}
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '12.5px', color: body, lineHeight: '1.7', fontWeight: '600' }}>
              {st('zFbIntro')}
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={26} fill={star <= rating ? '#fbbf24' : 'none'} color={star <= rating ? '#d97706' : '#9ca3af'} style={{ cursor: 'pointer' }} onClick={() => setRating(star)} />
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      border: category === c ? '1px solid #059669' : '1px solid #d1d5db',
                      background: category === c ? '#059669' : 'transparent',
                      color: category === c ? '#fff' : body,
                    }}
                  >
                    {CAT_LABEL[c]}
                  </button>
                ))}
              </div>

              <textarea placeholder={st('zFbPh')} value={message} onChange={(e) => setMessage(e.target.value)} rows={5} maxLength={2000} style={{ ...field, resize: 'none', lineHeight: '1.6' }} required />

              <input type="email" placeholder={st('zFbEmailPh')} value={email} onChange={(e) => setEmail(e.target.value)} style={field} />

              {error && <div style={{ fontSize: '12px', fontWeight: '800', color: '#dc2626' }}>{error}</div>}

              <button type="submit" disabled={status === 'sending'} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#059669', color: '#fff', border: 'none', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: status === 'sending' ? 0.7 : 1 }}>
                {status === 'sending' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> {st('zFbSending')}
                  </>
                ) : (
                  <>
                    <Send size={16} /> {st('zFbSubmit')}
                  </>
                )}
              </button>
              <p style={{ fontSize: '11px', color: dark ? '#9ca3af' : '#6b7280', lineHeight: '1.6', fontWeight: '600', textAlign: 'center' }}>
                {st('zFbNote')}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
