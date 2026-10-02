import React, { useState } from 'react';
import { X, Target } from 'lucide-react';

export default function GoalModal({ isOpen, onClose, onSave }) {
  const [goalText, setGoalText] = useState('');
  const [targetDate, setTargetDate] = useState('');

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!goalText.trim()) return;
    onSave({ title: goalText, targetDate: targetDate || 'Soon', progress: 0 });
    setGoalText('');
    setTargetDate('');
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: '100%', maxWidth: '360px', backgroundColor: '#ffffff', borderRadius: '32px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(16,185,129,0.3)', zIndex: 110, border: '1px solid rgba(209, 250, 229, 0.8)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '12px', background: '#ecfdf5', color: '#10b981' }}>
              <Target size={18} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#111827' }}>Set New Goal</h3>
          </div>
          <button onClick={onClose} style={{ background: '#ecfdf5', border: 'none', padding: '8px', borderRadius: '12px', color: '#10b981', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#4b5563', display: 'block', marginBottom: '6px' }}>Goal Description</label>
            <input 
              type="text" 
              placeholder="e.g., Master React & Tailwind..." 
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '16px', border: '1px solid #e5e7eb', fontSize: '13px', outline: 'none', backgroundColor: '#fafafa', fontWeight: '600' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#4b5563', display: 'block', marginBottom: '6px' }}>Target Time / Date</label>
            <input 
              type="text" 
              placeholder="e.g., By end of month" 
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '16px', border: '1px solid #e5e7eb', fontSize: '13px', outline: 'none', backgroundColor: '#fafafa', fontWeight: '600' }}
            />
          </div>

          <button 
            type="submit"
            style={{ 
              marginTop: '10px',
              width: '100%', 
              padding: '14px', 
              borderRadius: '18px', 
              background: 'linear-gradient(135deg, #10b981, #059669)', 
              color: '#ffffff', 
              fontWeight: '900', 
              fontSize: '14px', 
              border: 'none', 
              cursor: 'pointer',
              boxShadow: '0 10px 25px -5px rgba(16,185,129,0.4)'
            }}
          >
            Add Goal 🎯
          </button>
        </form>

      </div>
    </div>
  );
}
