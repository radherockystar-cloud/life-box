import React, { useState } from 'react';
import { MessageSquarePlus, Send, Star, CheckCircle2, Loader2 } from 'lucide-react';
import { translations } from '../utils/translations';
import { appStorage } from '../utils/appStorage';

// Feedback seedha developer ke inbox mein jaata hai (form-to-email service).
// Developer ka email app mein kahin nahi hai, sirf ek access key hai (.env: VITE_FEEDBACK_KEY).
const FEEDBACK_KEY = import.meta.env.VITE_FEEDBACK_KEY;
const THROTTLE_KEY = 'lifebox_feedback_last';
const CATEGORIES = ['Suggestion', 'Bug', 'Compliment', 'Other'];

export default function FeedbackView({ currentTheme, currentLang }) {
  const t = translations[currentLang] || translations.en;
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
      setError('Please write a little more (at least 10 characters).');
      return;
    }
    let last = 0;
    try {
      last = Number(appStorage.getItem(THROTTLE_KEY) || 0);
    } catch (err) {
      last = 0;
    }
    if (Date.now() - last < 30000) {
      setError('Please wait a few seconds before sending again.');
      return;
    }
    if (!FEEDBACK_KEY) {
      setError("Feedback isn't available right now. Please contact us from Help & Contact.");
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
        setError("We couldn't send your feedback. Please try again in a moment.");
      }
    } catch (err) {
      setStatus('idle');
      setError("Couldn't send. Please check your internet connection and try again.");
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
            <div style={{ fontSize: '16px', fontWeight: '900', color: ink }}>Thank you! ❤️</div>
            <p style={{ fontSize: '12.5px', color: body, lineHeight: '1.7', fontWeight: '600' }}>
              Your feedback has reached the developer. We read every message and use it to make Life Box better.
            </p>
            <button type="button" onClick={() => setStatus('idle')} style={{ padding: '10px 18px', borderRadius: '12px', background: '#059669', color: '#fff', border: 'none', fontWeight: '900', cursor: 'pointer' }}>
              Send another
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '12.5px', color: body, lineHeight: '1.7', fontWeight: '600' }}>
              Tell us what you love, what is not working, or what you would like to see next. Your feedback is sent privately to the developer.
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
                    {c}
                  </button>
                ))}
              </div>

              <textarea placeholder="Write your feedback..." value={message} onChange={(e) => setMessage(e.target.value)} rows={5} maxLength={2000} style={{ ...field, resize: 'none', lineHeight: '1.6' }} required />

              <input type="email" placeholder="Your email (optional, only if you want a reply)" value={email} onChange={(e) => setEmail(e.target.value)} style={field} />

              {error && <div style={{ fontSize: '12px', fontWeight: '800', color: '#dc2626' }}>{error}</div>}

              <button type="submit" disabled={status === 'sending'} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#059669', color: '#fff', border: 'none', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: status === 'sending' ? 0.7 : 1 }}>
                {status === 'sending' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Submit
                  </>
                )}
              </button>
              <p style={{ fontSize: '11px', color: dark ? '#9ca3af' : '#6b7280', lineHeight: '1.6', fontWeight: '600', textAlign: 'center' }}>
                Please don&apos;t include passwords or sensitive information. See our Privacy Policy for how feedback is handled.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
