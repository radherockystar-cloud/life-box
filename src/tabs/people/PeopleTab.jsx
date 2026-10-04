import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import ChatRoom from './ChatRoom';

const SOCKET_SERVER_URL = "http://localhost:3000"; 

export default function PeopleTab() {
  const [socket, setSocket] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [liveOnline, setLiveOnline] = useState(0);
  const [liveSpinning, setLiveSpinning] = useState(0);
  
  const [chatRoomId, setChatRoomId] = useState(null);
  const [roomTitle, setRoomTitle] = useState("Anonymous Room");
  const [initialMessages, setInitialMessages] = useState([]);
  const [logMessage, setLogMessage] = useState("Tap spin to connect your frequency.");

  const aiFallbackTimeout = useRef(null);

  const loadingLogs = [
    "Opening Life Box gateway...",
    "Scanning global frequencies...",
    "Searching near Delhi/Mumbai hubs...",
    "Aligning cosmic mood vectors...",
    "Finding an empathetic soul...",
    "Almost there, stay calm..."
  ];

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    newSocket.on('live_online_count', (count) => setLiveOnline(count));
    newSocket.on('live_spinning_count', (count) => setLiveSpinning(count));

    newSocket.on('match_found', (data) => {
      clearTimeout(aiFallbackTimeout.current);
      setChatRoomId(data.roomID);
      setRoomTitle("Connected with an Anonymous Soul");
      setSpinning(false);
      setInitialMessages([]);
    });

    return () => {
      newSocket.disconnect();
      clearTimeout(aiFallbackTimeout.current);
    };
  }, []);

  const handleSpin = () => {
    if (!socket) return;
    setSpinning(true);
    setChatRoomId(null);
    
    socket.emit('start_roulette_spin');

    let logIndex = 0;
    setLogMessage(loadingLogs[0]);
    const logInterval = setInterval(() => {
      logIndex++;
      if (logIndex < loadingLogs.length) {
        setLogMessage(loadingLogs[logIndex]);
      } else {
        clearInterval(logInterval);
      }
    }, 3000);

    // Agar 20 second tak real user na mile toh human-like AI se connect kar do
    aiFallbackTimeout.current = setTimeout(() => {
      clearInterval(logInterval);
      setChatRoomId("ai_room_" + Math.random());
      setRoomTitle("Anonymous Peer"); // Kisi ko pata nahi chalega ki AI hai
      setSpinning(size => false);
      
      // Pehla chota human-like message
      setInitialMessages([
        { sender: "ai", content: "Hey! Kahan se ho yaar tum?" }
      ]);
    }, 20000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#fff', padding: '16px', fontFamily: 'sans-serif' }}>
      
      <div style={notificationStyle}>
        <span style={{ fontSize: '14px' }}>🔥</span>
        <span style={{ fontSize: '12px', fontWeight: '800', color: '#38bdf8' }}>
          {liveSpinning} spinning | {liveOnline || 1} online | Premium Network
        </span>
      </div>

      {!chatRoomId && (
        <div style={wheelContainerStyle}>
          <h1 style={{ fontSize: '22px', fontWeight: '950', marginBottom: '8px', textAlign: 'center', letterSpacing: '0.5px' }}>
            Soul Healer & Motivator 🎡
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', marginBottom: '40px', maxWidth: '280px', lineHeight: '1.4' }}>
            Connect with a random soul globally for daily motivation.
          </p>

          <div style={{
            ...outerWheelStyle,
            animation: spinning ? 'pulseEffect 1.5s ease-in-out infinite alternate' : 'none',
            transform: spinning ? 'rotate(360deg)' : 'rotate(0deg)',
            transition: spinning ? 'transform 20s linear infinite' : 'transform 0.5s ease'
          }}>
            <button onClick={handleSpin} disabled={spinning} style={spinBtnStyle}>
              {spinning ? 'ALIGNING...' : 'SPIN TO CONNECT'}
            </button>
          </div>

          <div style={logBoxStyle}>
            <div style={dotStyle(spinning)}></div>
            <span style={{ fontSize: '12px', color: spinning ? '#38bdf8' : '#64748b', fontWeight: '700' }}>
              {logMessage}
            </span>
          </div>
        </div>
      )}

      {chatRoomId && (
        <ChatRoom
          socket={socket}
          chatRoomId={chatRoomId}
          roomTitle={roomTitle}
          initialMessages={initialMessages}
          onClose={() => setChatRoomId(null)}
        />
      )}

      <style>{`
        @keyframes pulseEffect {
          0% { transform: scale(1); box-shadow: 0 0 25px rgba(244, 63, 94, 0.4); }
          100% { transform: scale(1.06); box-shadow: 0 0 45px rgba(56, 189, 248, 0.6); }
        }
      `}</style>
    </div>
  );
}

const notificationStyle = { background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', boxShadow: '0 4px 15px rgba(56, 189, 248, 0.1)' };
const wheelContainerStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '30px' };
const outerWheelStyle = { width: '220px', height: '220px', borderRadius: '50%', background: 'conic-gradient(from 0deg, #f43f5e, #38bdf8, #c084fc, #f59e0b, #f43f5e)', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 35px rgba(244, 63, 94, 0.4), 0 0 15px rgba(56, 189, 248, 0.3)', marginBottom: '25px' };
const spinBtnStyle = { width: '100%', height: '100%', borderRadius: '50%', background: '#0f172a', color: '#fff', border: 'none', fontWeight: '950', fontSize: '13px', cursor: 'pointer', letterSpacing: '0.8px', boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8)' };
const logBoxStyle = { display: 'flex', alignItems: 'center', gap: '10px', background: '#1e293b', padding: '10px 16px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' };
const dotStyle = (spinning) => ({ width: '8px', height: '8px', borderRadius: '50%', background: spinning ? '#38bdf8' : '#64748b', boxShadow: spinning ? '0 0 8px #38bdf8' : 'none' });
