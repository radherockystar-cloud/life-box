import React, { useState } from 'react';
import { MessageSquarePlus, Send, Star } from 'lucide-react';
import { translations } from '../utils/translations';

export default function FeedbackView({ currentTheme, currentLang }) {
  const t = translations[currentLang] || translations.en;
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your feedback! ❤️');
    setMessage('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ padding: '10px', borderRadius: '14px', background: '#ecfdf5', color: '#059669' }}><MessageSquarePlus size={20} /></div>
        <h3 style={{ fontSize: '16px', fontWeight: '900', color: currentTheme === 'dark' ? '#f9fafb' : '#111827' }}>{t.feedback}</h3>
      </div>
      <div style={{ padding: '20px', borderRadius: '20px', background: currentTheme === 'dark' ? '#1e293b' : '#fafafa', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <p style={{ fontSize: '12px', color: currentTheme === 'dark' ? '#d1d5db' : '#4b5563', lineHeight: '1.6', fontWeight: '600' }}>{t.feedbackDesc}</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={22} fill={star <= rating ? '#fbbf24' : 'none'} color={star <= rating ? '#d97706' : '#9ca3af'} style={{ cursor: 'pointer' }} onClick={() => setRating(star)} />
            ))}
          </div>
          <textarea placeholder="Write feedback..." value={message} onChange={(e) => setMessage(e.target.value)} rows={3} style={{ width: '100%', padding: '100px 12px', borderRadius: '12px', border: '1px solid #d1d5db', background: currentTheme === 'dark' ? '#0f172a' : '#ffffff', color: currentTheme === 'dark' ? '#fff' : '#000', resize: 'none' }} required />
          <button type="submit" style={{ width: '100%', padding: '10px', borderRadius: '12px', background: '#059669', color: '#fff', border: 'none', fontWeight: '900', cursor: 'pointer' }}>Submit</button>
        </form>
      </div>
    </div>
  );
}
