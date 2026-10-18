import React, { useEffect, useRef, useState } from 'react';
import { Home, Heart, Calendar, User, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useEntitlements } from '../utils/billing';


// Keyboard khula hai ya nahi. Keyboard khulte hi neeche ke 4 tab usse upar dikhte the; ab wo chhup jate hain.
// 1) Screen ki unchai kam ho jaye (Android me keyboard se) -> keyboard khula.
// 2) Agar app screen ko chhota karta hi nahi, to text box par focus hone se pata chalta hai.
const TEXT_TYPES = ['checkbox', 'radio', 'button', 'submit', 'range', 'file', 'color', 'image', 'reset'];
const isTextField = (el) =>
  !!el && (el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable || (el.tagName === 'INPUT' && !TEXT_TYPES.includes(el.type)));

function useKeyboardOpen() {
  const [shrunk, setShrunk] = useState(false);
  const [focused, setFocused] = useState(false);
  const resizeSeen = useRef(false);
  const maxH = useRef(typeof window !== 'undefined' ? window.innerHeight : 0);
  const lastW = useRef(typeof window !== 'undefined' ? window.innerWidth : 0);

  useEffect(() => {
    const onResize = () => {
      resizeSeen.current = true;
      if (window.innerWidth !== lastW.current) {
        // phone ghuma: naya naap lo
        lastW.current = window.innerWidth;
        maxH.current = window.innerHeight;
        setShrunk(false);
        return;
      }
      if (window.innerHeight > maxH.current) maxH.current = window.innerHeight;
      setShrunk(window.innerHeight < maxH.current - 150);
    };
    const onIn = (e) => { if (isTextField(e.target)) setFocused(true); };
    const onOut = () => setTimeout(() => setFocused(isTextField(document.activeElement)), 60);
    window.addEventListener('resize', onResize);
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
    };
  }, []);

  return shrunk || (focused && !resizeSeen.current);
}

export default function BottomNav({ activeTab, setActiveTab }) {
  const { c, t } = useApp();
  const ent = useEntitlements();
  const keyboardOpen = useKeyboardOpen();
  const light = !c.isDark; // light theme me Notes jaisa glossy, dark me pehle jaisa

  const tabs = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'memories', label: t.navMemories, icon: Heart },
    { id: 'planner', label: t.navPlanner, icon: Calendar },
    { id: 'me', label: t.navMe, icon: User },
  ];

  if (keyboardOpen) return null; // keyboard khula ho to tab mat dikhao

  return (
    <nav 
      style={{
        position: 'fixed',
        bottom: '0px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '28rem',
        zIndex: 999,
        background: light ? 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,238,246,0.98))' : c.navBg,
        borderTop: '1px solid ' + (light ? 'rgba(251,113,133,0.25)' : c.navBorder),
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '10px 8px',
        boxShadow: light ? '0 -12px 28px -14px rgba(244,63,94,0.35)' : c.navShadow,
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px'
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              flex: 1,
              color: isActive ? (light ? '#be123c' : '#f43f5e') : (light ? '#b0587a' : c.navInactive),
              transform: isActive ? 'scale(1.08)' : 'scale(1)',
              transition: 'all 0.2s ease'
            }}
          >
            <div
              style={{
                padding: '6px',
                borderRadius: '14px',
                background: isActive ? (light ? 'linear-gradient(160deg, #fb7185 0%, #e11d48 55%, #be123c 100%)' : 'linear-gradient(135deg, #f43f5e, #ec4899)') : 'transparent',
                color: isActive ? '#ffffff' : (light ? '#b0587a' : c.navInactive),
                boxShadow: isActive ? (light ? 'inset 0 1.5px 0 rgba(255,255,255,0.65), inset 0 -5px 10px -5px rgba(80,0,40,0.5), 0 8px 18px -4px rgba(225,29,72,0.65), 0 0 20px rgba(244,63,94,0.45)' : '0 8px 20px -4px rgba(244, 63, 94, 0.5)') : 'none'
              }}
            >
              <Icon size={18} />
            </div>
            <span style={{ fontSize: '9px', marginTop: '2px', fontWeight: isActive ? '900' : '600' }}>
              {tab.label}
              {tab.id === 'memories' && !ent.pro && <Lock size={8} style={{ marginLeft: '3px', verticalAlign: '-0.5px' }} />}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
