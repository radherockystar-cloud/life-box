import { useState, useEffect, useRef } from 'react';

export default function ChatRoom({ socket, chatRoomId, roomTitle, initialMessages, onClose }) {
  const [messages, setMessages] = useState(initialMessages || []);
  const [inputText, setInputText] = useState("");
  const [timeLeft, setTimeLeft] = useState(180);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);
  const timerInterval = useRef(null);

  useEffect(() => {
    timerInterval.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval.current);
          onClose();
          alert("Time's up! Connection closed.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval.current);
  }, [onClose]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    const handleReceive = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on('receive_message', handleReceive);
    return () => socket.off('receive_message', handleReceive);
  }, [socket]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser voice recognition support nahi karta.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setInputText(speechToText);
    };

    recognition.start();
  };

  const callRealAI = async (userText) => {
    let reply = "Acha! Sahi hai yaar.";
    const lower = userText.toLowerCase();

    if (lower.includes("kahan") || lower.includes("city") || lower.includes("rehte")) {
      reply = "Main toh abhi Delhi side hi hoon, tum kahan se ho?";
    } else if (lower.includes("kaise") || lower.includes("kya kar")) {
      reply = "Bas yaar, thoda bore ho raha tha toh spin kar liya. Tum sunao, kya chal raha hai?";
    } else if (lower.includes("goal") || lower.includes("padhai") || lower.includes("work") || lower.includes("sapna")) {
      reply = "Sahi hai, mehnat karte raho success zaroor milegi. Mera bhi aaj ka target wahi hai.";
    } else {
      reply = "Hmm, baat toh sahi hai tumhari. Aur batao phir life mein kya scene hai?";
    }

    return reply;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { sender: "user", content: inputText };
    setMessages((prev) => [...prev, userMsg]);
    const currentText = inputText;
    setInputText("");

    if (chatRoomId.startsWith("ai_room_")) {
      const aiReplyText = await callRealAI(currentText);
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "ai", content: aiReplyText }]);
        speakText(aiReplyText);
      }, 1000);
    } else {
      socket?.emit('send_message', { roomID: chatRoomId, content: currentText });
    }
  };

  return (
    <div style={chatBoxContainerStyle}>
      <div style={chatHeaderStyle}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '13px', fontWeight: '900' }}>{roomTitle}</span>
          <span style={{ fontSize: '11px', color: '#f43f5e', fontWeight: '800', marginTop: '2px' }}>
            ⏳ Time Left: {formatTime(timeLeft)}
          </span>
        </div>
        <button onClick={onClose} style={closeChatBtnStyle}>Leave</button>
      </div>

      <div style={messageBoxStyle}>
        {messages.map((msg, index) => {
          const isMe = msg.sender === "user";
          return (
            <div key={index} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
              <div style={{
                background: isMe ? 'linear-gradient(135deg, #f43f5e, #e11d48)' : '#1e293b',
                color: '#fff',
                padding: '12px 16px',
                borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                maxWidth: '80%',
                fontSize: '13px',
                lineHeight: '1.4',
              }}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={chatInputFormStyle}>
        <button 
          type="button" 
          onClick={handleVoiceInput} 
          style={{ ...micBtnStyle, color: isListening ? '#f43f5e' : '#38bdf8' }}
          title="Bolkar type karein"
        >
          🎙️
        </button>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isListening ? "Sun rahe hain..." : "Type a short message..."}
          style={inputStyle}
        />
        <button type="submit" style={sendBtnStyle}>Send</button>
      </form>
    </div>
  );
}

const chatBoxContainerStyle = { background: '#121824', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '75vh', marginTop: '10px' };
const chatHeaderStyle = { padding: '14px 16px', background: '#192133', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' };
const closeChatBtnStyle = { background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' };
const messageBoxStyle = { flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column' };
const chatInputFormStyle = { display: 'flex', padding: '14px', background: '#192133', gap: '10px', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)' };
const micBtnStyle = { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '0 4px' };
const inputStyle = { flex: 1, background: '#090d16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px', color: '#fff', fontSize: '13px', outline: 'none' };
const sendBtnStyle = { background: 'linear-gradient(135deg, #38bdf8, #0284c7)', color: '#fff', border: 'none', borderRadius: '14px', padding: '12px 20px', fontWeight: '800', cursor: 'pointer', fontSize: '13px' };
