import React from 'react';
import { Home, Heart, Users, Calendar, User } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'memories', label: 'Memories', icon: Heart },
    { id: 'people', label: 'People', icon: Users },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'me', label: 'Me', icon: User },
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
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255, 228, 230, 0.8)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '10px 8px',
        boxShadow: '0 -10px 25px -5px rgba(244, 63, 94, 0.2)',
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
              color: isActive ? '#f43f5e' : '#9ca3af',
              transform: isActive ? 'scale(1.08)' : 'scale(1)',
              transition: 'all 0.2s ease'
            }}
          >
            <div
              style={{
                padding: '6px',
                borderRadius: '14px',
                background: isActive ? 'linear-gradient(135deg, #f43f5e, #ec4899)' : 'transparent',
                color: isActive ? '#ffffff' : '#9ca3af',
                boxShadow: isActive ? '0 8px 20px -4px rgba(244, 63, 94, 0.5)' : 'none'
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
