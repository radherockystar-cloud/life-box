import React from 'react';
import { Home, Heart, Calendar, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNav({ activeTab, setActiveTab }) {
  const { c, t } = useApp();
  const light = !c.isDark; // light theme me Notes jaisa glossy, dark me pehle jaisa

  const tabs = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'memories', label: t.navMemories, icon: Heart },
    { id: 'planner', label: t.navPlanner, icon: Calendar },
    { id: 'me', label: t.navMe, icon: User },
  ];

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
            </span>
          </button>
        );
      })}
    </nav>
  );
}
