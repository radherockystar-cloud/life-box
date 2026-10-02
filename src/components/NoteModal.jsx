import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';

export default function NoteModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, content, date: 'Today' });
    setTitle('');
    setContent('');
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: '100%', maxWidth: '360px', backgroundColor: '#ffffff', borderRadius: '32px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(245,158,11,0.3)', zIndex: 110, border: '1px solid rgba(254, 243, 199, 0.8)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '12px', background: '#fffbeb', color: '#f59e0b' }}>
              <FileText size={18} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#111827' }}>Write a Note</h3>
          </div>
          <button onClick={onClose} style={{ background: '#fef3c7', border: 'none', padding: '8px', borderRadius: '12px', color: '#f59e0b', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#4b5563', display: 'block', marginBottom: '6px' }}>Note Title</label>
            <input 
              type="text" 
              placeholder="What's on your mind?" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '16px', border: '1px solid #e5e7eb', fontSize: '13px', outline: 'none', backgroundColor: '#fafafa', fontWeight: '600' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#4b5563', display: 'block', marginBottom: '6px' }}>Content</label>
            <textarea 
              placeholder="Write your note details here..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '16px', border: '1px solid #e5e7eb', fontSize: '13px', outline: 'none', backgroundColor: '#fafafa', fontWeight: '600', resize: 'none' }}
              required
            />
          </div>

          <button 
            type="submit"
            style={{ 
              marginTop: '10px',
              width: '100%', 
              padding: '14px', 
              borderRadius: '18px', 
              background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
              color: '#ffffff', 
              fontWeight: '900', 
              fontSize: '14px', 
              border: 'none', 
              cursor: 'pointer',
              boxShadow: '0 10px 25px -5px rgba(245,158,11,0.4)'
            }}
          >
            Save Note 📝
          </button>
        </form>

      </div>
    </div>
  );
}
