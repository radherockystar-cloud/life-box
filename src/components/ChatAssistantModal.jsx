import React, { useState } from 'react';
import { X, Send, Bot, Trash2 } from 'lucide-react';

export default function ChatAssistantModal({ isOpen, onClose, hiddenNotes, onDeleteNote }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi Radhe! Main aapka "New Life" Assistant hoon. Aap mujhse apne hidden notes ke bare mein kuch bhi puch sakte hain ya neeche apne saved notes manage kar sakte hain.' }
  ]);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'vault'

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuery = input.trim();
    const newMessages = [...messages, { sender: 'user', text: userQuery }];
    setMessages(newMessages);
    setInput('');

    setTimeout(() => {
      let botReply = "Mujhse yeh baat aapne kisi note ya memory mein save nahi ki hai.";
      
      const matchedNote = hiddenNotes.find(note => 
        note.title?.toLowerCase().includes(userQuery.toLowerCase()) || 
        note.content?.toLowerCase().includes(userQuery.toLowerCase()) ||
        note.desc?.toLowerCase().includes(userQuery.toLowerCase())
      );

      if (matchedNote) {
        botReply = `Haan! Yeh mujhe aapke notes mein mila: "${matchedNote.title}" - ${matchedNote.content || matchedNote.desc || matchedNote.targetDate || ''}`;
      } else if (userQuery.toLowerCase().includes('rahul') || userQuery.toLowerCase().includes('birthday')) {
        botReply = "Aapne Rahul ke birthday se juda note save kiya hai check karne ke liye Vault tab dekhein!";
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 600);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} onClick={onClose} />
      
      <div style={{ position: 'relative', width: '100%', maxWidth: '380px', height: '520px', backgroundColor: '#ffffff', borderRadius: '32px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(244,63,94,0.3)', zIndex: 110, border: '1px solid rgba(255, 228, 230, 0.8)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fff1f2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '12px', background: '#ffffff', color: '#f43f5e', boxShadow: '0 4px 10px rgba(244,63,94,0.2)' }}>
              <Bot size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#111827' }}>Assistant & Vault</h3>
              <p style={{ fontSize: '10px', fontWeight: '700', color: '#f43f5e' }}>{hiddenNotes.length} Items Saved Securely</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#ffffff', border: 'none', padding: '8px', borderRadius: '12px', color: '#f43f5e', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: '#fef2f2', padding: '4px', margin: '12px 16px 0 16px', borderRadius: '14px' }}>
          <button 
            onClick={() => setActiveTab('chat')}
            style={{ flex: 1, padding: '8px', borderRadius: '10px', border: 'none', background: activeTab === 'chat' ? '#ffffff' : 'transparent', color: activeTab === 'chat' ? '#f43f5e' : '#6b7280', fontSize: '12px', fontWeight: '900', cursor: 'pointer', boxShadow: activeTab === 'chat' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
          >
            💬 Chat Assistant
          </button>
          <button 
            onClick={() => setActiveTab('vault')}
            style={{ flex: 1, padding: '8px', borderRadius: '10px', border: 'none', background: activeTab === 'vault' ? '#ffffff' : 'transparent', color: activeTab === 'vault' ? '#f43f5e' : '#6b7280', fontSize: '12px', fontWeight: '900', cursor: 'pointer', boxShadow: activeTab === 'vault' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
          >
            🔒 Hidden Vault ({hiddenNotes.length})
          </button>
        </div>

        {/* Content Body */}
        {activeTab === 'chat' ? (
          <>
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#fafafa' }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ 
                    maxWidth: '80%', 
                    padding: '12px 16px', 
                    borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px', 
                    background: msg.sender === 'user' ? 'linear-gradient(135deg, #f43f5e, #ec4899)' : '#ffffff', 
                    color: msg.sender === 'user' ? '#ffffff' : '#1f2937',
                    fontSize: '12px',
                    fontWeight: '700',
                    boxShadow: msg.sender === 'user' ? '0 4px 15px rgba(244,63,94,0.3)' : '0 4px 15px rgba(0,0,0,0.04)',
                    border: msg.sender === 'user' ? 'none' : '1px solid #f3f4f6'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} style={{ display: 'flex', padding: '12px 16px', borderTop: '1px solid #f3f4f6', backgroundColor: '#ffffff', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Ask anything (e.g. Rahul)..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', borderRadius: '16px', border: '1px solid #e5e7eb', fontSize: '12px', outline: 'none', backgroundColor: '#fafafa', fontWeight: '600' }}
              />
              <button 
                type="submit"
                style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '16px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(244,63,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#fafafa' }}>
            {hiddenNotes.length === 0 ? (
              <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '40px', fontWeight: '700' }}>No hidden notes saved yet.</p>
            ) : (
              hiddenNotes.map((note, index) => (
                <div key={index} style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '16px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div>
                    <span style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '6px', background: '#fff1f2', color: '#f43f5e' }}>{note.type}</span>
                    <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#1f2937', marginTop: '4px' }}>{note.title}</h4>
                    <p style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280' }}>{note.content || note.desc || note.targetDate}</p>
                  </div>
                  <button 
                    onClick={() => onDeleteNote(index)}
                    style={{ background: '#fef2f2', border: 'none', padding: '8px', borderRadius: '10px', color: '#ef4444', cursor: 'pointer' }}
                    title="Delete Note"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}
