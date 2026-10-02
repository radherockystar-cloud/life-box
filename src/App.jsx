import React, { useState, useEffect } from 'react';
import { Menu, Search, Lock, X } from 'lucide-react';
import NavigationDrawer from './components/NavigationDrawer';
import BottomNav from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import MemoriesScreen from './screens/MemoriesScreen';
import PeopleTab from './tabs/people/PeopleTab';
import PlannerTab from './tabs/planner/PlannerTab';
import MeTab from './tabs/me/MeTab';
import { translations } from './utils/translations';

export default function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isSubAppOpen, setIsSubAppOpen] = useState(false);
  
  // Search States
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  
  const [currentTheme, setTheme] = useState(() => {
    return localStorage.getItem('newlife_theme') || 'light';
  });

  const [currentLang, setLang] = useState(() => {
    return localStorage.getItem('newlife_lang') || 'en';
  });

  // App Lock State
  const [isLocked, setIsLocked] = useState(() => {
    return localStorage.getItem('newlife_lock_enabled') === 'true';
  });
  const [enteredPin, setEnteredPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    localStorage.setItem('newlife_theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('newlife_lang', currentLang);
  }, [currentLang]);

  const t = translations[currentLang] || translations.en;

  const handleUnlockSubmit = (e) => {
    e.preventDefault();
    const savedPin = localStorage.getItem('newlife_passcode');
    if (enteredPin === savedPin) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect Passcode! Try again.');
      setEnteredPin('');
    }
  };

  if (isLocked && !isAuthenticated) {
    return (
      <div style={{ height: '100vh', width: '100%', maxWidth: '28rem', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)', padding: '24px' }}>
        <div style={{ background: '#ffffff', padding: '30px', borderRadius: '32px', boxShadow: '0 25px 50px rgba(244,63,94,0.25)', width: '100%', maxWidth: '320px', textAlign: 'center', border: '1px solid rgba(255,228,230,0.8)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: '#fff1f2', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', boxShadow: '0 8px 20px rgba(244,63,94,0.2)' }}>
            <Lock size={26} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#111827', marginBottom: '4px' }}>Life Box Locked</h2>
          <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: '700', marginBottom: '20px' }}>Enter your passcode to unlock your secure vault.</p>

          <form onSubmit={handleUnlockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              type="password" 
              placeholder="Enter Passcode" 
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '16px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', textAlign: 'center', fontWeight: '900', background: '#fafafa' }}
              required
            />
            <button 
              type="submit"
              style={{ width: '100%', padding: '12px', borderRadius: '16px', background: 'linear-gradient(135deg, #f43f5e, #ec4899)', color: '#ffffff', border: 'none', fontSize: '13px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 8px 20px rgba(244,63,94,0.3)' }}
            >
              Unlock Vault 🔓
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      height: '100vh', 
      width: '100%', 
      maxWidth: '28rem', 
      margin: '0 auto', 
      display: 'flex', 
      flexDirection: 'column', 
      background: currentTheme === 'dark' ? '#0f172a' : 'linear-gradient(180deg, #fff1f2 0%, #ffffff 50%, #fff5f5 100%)', 
      color: currentTheme === 'dark' ? '#f9fafb' : '#111827',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', 
      overflow: 'hidden', 
      position: 'relative' 
    }}>
      
      {/* Top Header - Visible only on Home Tab */}
      {!isSubAppOpen && activeTab === 'home' && (
        <header 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            backgroundColor: currentTheme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(244, 63, 94, 0.15)',
            boxShadow: '0 10px 25px -5px rgba(244, 63, 94, 0.1)',
            zIndex: 30,
            flexShrink: 0
          }}
        >
          <button 
            onClick={() => setIsDrawerOpen(true)} 
            style={{
              background: currentTheme === 'dark' ? '#1e293b' : 'linear-gradient(135deg, #ffffff, #fff1f2)',
              border: '1px solid rgba(255, 228, 230, 0.8)',
              padding: '10px',
              borderRadius: '16px',
              color: '#f43f5e',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(244,63,94,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Menu size={20} />
          </button>

          {/* Toggleable Search Bar inside Header */}
          {isSearchActive ? (
            <div style={{ display: 'flex', alignItems: 'center', background: currentTheme === 'dark' ? '#1e293b' : '#fff1f2', borderRadius: '12px', padding: '4px 10px', flex: 1, margin: '0 10px', border: '1px solid rgba(244,63,94,0.3)' }}>
              <input 
                type="text"
                placeholder="Search tools..."
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                autoFocus
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '12px', width: '100%', fontWeight: '900', color: currentTheme === 'dark' ? '#fff' : '#000' }}
              />
              <button onClick={() => { setGlobalSearchQuery(''); setIsSearchActive(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f43f5e' }}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <h1 
              style={{
                fontSize: '20px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #f43f5e, #ec4899, #be123c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.5px'
              }}
            >
              {t.appName}
            </h1>
          )}

          <button 
            onClick={() => setIsSearchActive(!isSearchActive)}
            style={{
              background: currentTheme === 'dark' ? '#1e293b' : 'linear-gradient(135deg, #ffffff, #fff1f2)',
              border: '1px solid rgba(255, 228, 230, 0.8)',
              padding: '10px',
              borderRadius: '16px',
              color: '#f43f5e',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(244,63,94,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isSearchActive ? <X size={20} /> : <Search size={20} />}
          </button>
        </header>
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '16px', overflowY: 'auto', position: 'relative' }}>
        {activeTab === 'home' && <HomeScreen currentLang={currentLang} onSubAppToggle={setIsSubAppOpen} searchQuery={globalSearchQuery} />}
        {activeTab === 'memories' && <MemoriesScreen />}
        {activeTab === 'people' && <PeopleTab />}
        {activeTab === 'planner' && <PlannerTab />}
        {activeTab === 'me' && <MeTab />}
      </main>

      {/* Bottom Navigation */}
      {!isSubAppOpen && (
        <div style={{ position: 'relative', zIndex: 10 }}>
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      )}

      {/* Sidebar Drawer */}
      <NavigationDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        setActiveTab={setActiveTab} 
        currentTheme={currentTheme}
        setTheme={setTheme}
        currentLang={currentLang}
        setLang={setLang}
      />
      
    </div>
  );
}
