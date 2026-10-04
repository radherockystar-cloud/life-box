import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Bot, Sparkles, Loader2, ImagePlus, X } from 'lucide-react';

export default function AiChatAppScreen({ onBack }) {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Welcome to AI Life Assistant! How can I help you today? You can chat about anything, ask coding questions, or query your notes and goals.' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputVal.trim() && !selectedImage) || loading) return;

    const userMsg = { 
      sender: 'user', 
      text: inputVal, 
      image: selectedImage 
    };
    
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    const currentInput = inputVal.trim() || "Describe this image.";
    const currentImage = selectedImage;
    
    setInputVal('');
    setSelectedImage(null);
    setLoading(true);

    try {
      const keepNotes = JSON.parse(localStorage.getItem('lifebox_keep_notes') || '[]');
      const newlifeVault = JSON.parse(localStorage.getItem('newlife_vault') || '[]');
      const plannerPlans = JSON.parse(localStorage.getItem('lifebox_planner_plans') || '[]');

      const allAppData = [
        ...keepNotes.map(n => `[Note] Title: ${n.title} | Content: ${n.content} | Date: ${n.date}`),
        ...newlifeVault.map(v => `[${v.type || 'Item'}] Title: ${v.title || v.tag} | Content: ${v.desc || v.content || ''} | Date: ${v.date || 'N/A'}`),
        ...plannerPlans.map(p => `[Planner] Event: ${p.title} | Date: ${p.date} at ${p.time}`)
      ];

      const appDataContext = allAppData.length > 0 ? allAppData.join('\n') : "No app records saved yet.";

      const systemInstruction = `
      You are an advanced professional AI assistant inside the "Life Box" app. 
      You can converse about general topics, coding, answer questions, and analyze images if provided.
      You also have access to the user's saved app data (Notes, Goals, Planner):
      ${appDataContext}

      Instructions:
      1. Answer general questions, coding queries, or chat naturally in English.
      2. If the user asks about their notes, goals, or schedule, search the app data above and provide exact details.
      `;

      let parts = [{ text: `${systemInstruction}\n\nUser Query: ${currentInput}` }];
      
      if (currentImage) {
        const base64Data = currentImage.split(',')[1];
        const mimeType = currentImage.substring(currentImage.indexOf(':') + 1, currentImage.indexOf(';'));
        parts.push({
          inline_data: {
            mime_type: mimeType,
            data: base64Data
          }
        });
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }]
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I understood, but received an empty response.";
      setMessages([...updatedMessages, { sender: 'ai', text: aiReply }]);

    } catch (error) {
      console.error("API Error:", error);
      
      const query = currentInput.toLowerCase();
      const keepNotes = JSON.parse(localStorage.getItem('lifebox_keep_notes') || '[]');
      const newlifeVault = JSON.parse(localStorage.getItem('newlife_vault') || '[]');

      let aiReply = "";
      if (query.includes('note')) {
        aiReply = keepNotes.length > 0 ? `Found notes:\n` + keepNotes.map(n => `📝 ${n.title}: "${n.content}"`).join('\n') : "No notes found.";
      } else if (query.includes('goal')) {
        const goals = newlifeVault.filter(v => v.type === 'Goal');
        aiReply = goals.length > 0 ? `Found goals:\n` + goals.map(g => `🎯 ${g.title}`).join('\n') : "No goals found.";
      } else {
        aiReply = `API connection note: Server could not be reached directly (${error.message}). However, your app has ${keepNotes.length} notes and ${newlifeVault.length} items saved locally!`;
      }

      setMessages([...updatedMessages, { sender: 'ai', text: aiReply }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 text-gray-900 z-50 flex flex-col justify-between overflow-hidden">
      
      <div className="p-4 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2.5 rounded-2xl bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center font-black">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900">AI Life Assistant</h3>
              <p className="text-[10px] text-gray-500 font-bold">ChatGPT Pro Mode</p>
            </div>
          </div>
        </div>
        <Sparkles size={20} className="text-rose-500 animate-pulse" />
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3 pb-24">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center text-xs font-black shadow-md shrink-0">
                  <Bot size={14} />
                </div>
              )}
              <div className={`p-3.5 rounded-2xl max-w-[80%] text-xs font-medium leading-relaxed whitespace-pre-line shadow-sm ${m.sender === 'user' ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>
                {m.image && (
                  <img src={m.image} alt="Uploaded" className="w-40 h-40 object-cover rounded-xl mb-2" />
                )}
                {m.text}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 justify-start items-center">
            <div className="w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center">
              <Bot size={14} />
            </div>
            <div className="p-3 bg-white border border-gray-100 rounded-2xl text-xs text-gray-500 flex items-center gap-2 shadow-sm">
              <Loader2 size={14} className="animate-spin text-rose-500" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {selectedImage && (
        <div className="absolute bottom-16 left-3 bg-white p-2 rounded-2xl shadow-lg border border-rose-200 flex items-center gap-2 z-30">
          <img src={selectedImage} alt="Preview" className="w-12 h-12 object-cover rounded-xl" />
          <span className="text-[10px] font-bold text-gray-600">Photo attached</span>
          <button onClick={() => setSelectedImage(null)} className="p-1 rounded-full bg-rose-100 text-rose-600 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="absolute bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-100 flex items-center gap-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
        <label className="p-3 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-100 cursor-pointer transition-all shrink-0">
          <ImagePlus size={18} />
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
        
        <input 
          type="text"
          placeholder="Ask anything or search your notes..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-900 outline-none placeholder-gray-400 font-medium focus:border-rose-500"
        />
        
        <button type="submit" disabled={loading} className="p-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white cursor-pointer shadow-md disabled:opacity-50 shrink-0">
          <Send size={18} />
        </button>
      </form>

    </div>
  );
}
