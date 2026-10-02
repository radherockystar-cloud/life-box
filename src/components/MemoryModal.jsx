import React, { useState } from 'react';
import { X, Camera, Heart, Calendar, Tag } from 'lucide-react';

export default function MemoryModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [tag, setTag] = useState('Milestone');

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, desc, tag, date: 'Today' });
    setTitle('');
    setDesc('');
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      {/* Backdrop */}
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} onClick={onClose} />
      
      {/* Modal Box */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '360px', backgroundColor: '#ffffff', borderRadius: '32px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(244,63,94,0.3)', zIndex: 110, border: '1px solid rgba(255, 228, 230, 0.8)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '12px', background: '#fff1f2', color: '#f43f5e' }}>
              <Camera size={18} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#111827' }}>Add New Memory</h3>
          </div>
          <button onClick={onClose} style={{ background: '#fef2f2', border: 'none', padding: '8px', borderRadius: '12px', color: '#f43f5e', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#4b5563', display: 'block', marginBottom: '6px' }}>Memory Title</label>
            <input 
              type="text" 
              placeholder="e.g., First meet, Special day..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '16px', border: '1px solid #e5e7eb', fontSize: '13px', outline: 'none', backgroundColor: '#fafafa', fontWeight: '600' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#4b5563', display: 'block', marginBottom: '6px' }}>Category / Tag</label>
            <select 
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '16px', border: '1px solid #e5e7eb', fontSize: '13px', outline: 'none', backgroundColor: '#fafafa', fontWeight: '600', color: '#374151' }}
            >
              <option value="Milestone">Milestone</option>
              <option value="Friends">Friends & Love</option>
              <option value="Project">Project / Code</option>
              <option value="Special">Special Moment</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#4b5563', display: 'block', marginBottom: '6px' }}>Description</label>
            <textarea 
              placeholder="Write something about this memory..." 
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '16px', border: '1px solid #e5e7eb', fontSize: '13px', outline: 'none', backgroundColor: '#fafafa', fontWeight: '600', resize: 'none' }}
            />
          </div>

          <button 
            type="submit"
            style={{ 
              marginTop: '10px',
              width: '100%', 
              padding: '14px', 
              borderRadius: '18px', 
              background: 'linear-gradient(135deg, #f43f5e, #ec4899)', 
              color: '#ffffff', 
              fontWeight: '900', 
              fontSize: '14px', 
              border: 'none', 
              cursor: 'pointer',
              boxShadow: '0 10px 25px -5px rgba(244,63,94,0.4)'
            }}
          >
            Save Memory ❤️
          </button>
        </form>

      </div>
    </div>
  );
}
