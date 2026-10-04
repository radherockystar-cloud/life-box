import React, { useState } from 'react';
import { X, Mic, Square, Play } from 'lucide-react';

export default function VoiceModal({ isOpen, onClose, onSave }) {
  const [isRecording, setIsRecording] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSave({ title: noteTitle || 'Voice Thought', duration: '0:45 mins', date: 'Today' });
    setNoteTitle('');
    setIsRecording(false);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: '100%', maxWidth: '360px', backgroundColor: '#ffffff', borderRadius: '32px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(168,85,247,0.3)', zIndex: 110, border: '1px solid rgba(243, 232, 255, 0.8)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '12px', background: '#f3e8ff', color: '#a855f7' }}>
              <Mic size={18} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#111827' }}>Record Voice Thought</h3>
          </div>
          <button onClick={onClose} style={{ background: '#f3e8ff', border: 'none', padding: '8px', borderRadius: '12px', color: '#a855f7', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          
          <div style={{ width: '100%' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#4b5563', display: 'block', marginBottom: '6px' }}>Voice Title</label>
            <input 
              type="text" 
              placeholder="Give a title to your voice..." 
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '16px', border: '1px solid #e5e7eb', fontSize: '13px', outline: 'none', backgroundColor: '#fafafa', fontWeight: '600' }}
            />
          </div>

          {/* Recorder Animation Box */}
          <div style={{ width: '100%', padding: '24px', background: '#faf5ff', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', border: '1px dashed #d8b4fe' }}>
            <button 
              type="button"
              onClick={() => setIsRecording(!isRecording)}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: isRecording ? '#ef4444' : 'linear-gradient(135deg, #a855f7, #9333ea)',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 10px 20px rgba(168,85,247,0.4)',
                transition: 'all 0.2s'
              }}
            >
              {isRecording ? <Square size={24} /> : <Mic size={26} />}
            </button>
            <span style={{ fontSize: '12px', fontWeight: '800', color: isRecording ? '#ef4444' : '#7e22ce' }}>
              {isRecording ? 'Recording... Tap to Stop' : 'Tap to Start Recording'}
            </span>
          </div>

          <button 
            type="submit"
            style={{ 
              width: '100%', 
              padding: '14px', 
              borderRadius: '18px', 
              background: 'linear-gradient(135deg, #a855f7, #9333ea)', 
              color: '#ffffff', 
              fontWeight: '900', 
              fontSize: '14px', 
              border: 'none', 
              cursor: 'pointer',
              boxShadow: '0 10px 25px -5px rgba(168,85,247,0.4)'
            }}
          >
            Save Voice 🎙️
          </button>
        </form>

      </div>
    </div>
  );
}
