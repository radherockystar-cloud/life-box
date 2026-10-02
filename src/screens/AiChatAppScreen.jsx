import React, { useState } from 'react';
import { ArrowLeft, Send, Trash2, Bot, User, Sparkles } from 'lucide-react';

export default function AiChatAppScreen({ onBack, hiddenNotes, onDeleteNote }) {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Namaste! Main aapka AI Life Assistant hoon. Aapke vault mein save kiye gaye notes, memories aur goals yahan manage kar sakte hain.' }
  ]);
  const [inputVal, setInputVal] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = { sender: 'user', text: inputVal };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputVal('');

    // Simulate AI response based on vault or general queries
    setTimeout(() => {
      let aiReply = "Maine aapka yeh message samajh liya hai. Aap chahein toh ise vault mein check kar sakte hain!";
      const lower = inputVal.toLowerCase();
      
      if (lower.includes('birthday') || lower.includes('rahul')) {
        aiReply = "Rahul ka birthday 10 October ko hota hai (Vault record ke anusaar)!";
      } else if (lower.includes('coding') || lower.includes('streak')) {
        aiReply = "Aapki coding streak aur goals bilkul sahi track par hain!";
      } else {
        aiReply = `Aapne kaha: "${inputVal}". Life Box assistant aapki seva mein hazir hai!`;
      }

      setMessages([...updatedMessages, { sender: 'ai', text: aiReply }]);
    }, 600);
  };

  return (
    <div className="absolute inset-0 bg-[#0f172a] text-white z-50 flex flex-col overflow-hidden">
      
      {/* Top Header */}
      <div className="p-4 bg-[#1e293b]/90 backdrop-blur-md border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-gray-800 text-gray-300 hover:text-white cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-wide">AI Assistant & Vault</h3>
              <p className="text-[10px] text-gray-400 font-bold">{hiddenNotes.length} Items in Vault</p>
            </div>
          </div>
        </div>
        <Sparkles size={20} className="text-rose-400 animate-pulse" />
      </div>

      {/* Main Chat & Saved Vault Section */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 pb-28">
        
        {/* Chat Messages */}
        <div className="space-y-3">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-black shadow">
                  <Bot size={14} />
                </div>
              )}
              <div className={`p-3.5 rounded-2xl max-w-[80%] text-xs font-medium leading-relaxed ${m.sender === 'user' ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-br-none shadow-lg' : 'bg-[#1e293b] text-gray-200 border border-gray-800 rounded-bl-none shadow'}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Vault Items Preview inside Chat App */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <h4 className="text-xs font-black text-rose-400 uppercase tracking-wider mb-3">Saved Vault Items ({hiddenNotes.length})</h4>
          <div className="space-y-2">
            {hiddenNotes.map((item, index) => (
              <div key={index} className="bg-[#1e293b] border border-gray-800 p-3 rounded-2xl flex items-center justify-between shadow">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">{item.type || 'Note'}</span>
                  <h5 className="text-xs font-black text-white mt-1">{item.title}</h5>
                  <p className="text-[11px] text-gray-400 font-medium line-clamp-1">{item.content}</p>
                </div>
                <button 
                  onClick={() => onDeleteNote(index)}
                  className="p-2 text-gray-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Message Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 bg-[#1e293b] border-t border-gray-800 flex items-center gap-2">
        <input 
          type="text"
          placeholder="Ask AI or check vault..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-2xl px-4 py-2.5 text-xs text-white outline-none placeholder-gray-500 font-medium"
        />
        <button 
          type="submit"
          className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white cursor-pointer shadow active:scale-95 transition-all"
        >
          <Send size={18} />
        </button>
      </form>

    </div>
  );
}
