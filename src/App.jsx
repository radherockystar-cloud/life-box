import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Lock, X } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import NavigationDrawer from './components/NavigationDrawer';
import BottomNav from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import MemoriesScreen from './screens/MemoriesScreen';
import PeopleTab from './tabs/people/PeopleTab';
import PlannerTab from './tabs/planner/PlannerTab';
import MeTab from './tabs/me/MeTab';
import { translations } from './utils/translations';
import { useBackHandler, runBackHandler } from './utils/useBackHandler';
import { requestSync } from './tabs/planner/reminderService';
import './tabs/people/trips/tripReminders';
import './utils/autoNotificationSources';
import TripInviteHandler from './tabs/people/trips/TripInviteHandler';

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

  // ---------- PLANNER NOTIFICATIONS ----------
  // Festival greetings + plan reminders are set again at app start and whenever the language changes
  useEffect(() => {
    requestSync(1500);
  }, [currentLang]);

  // ...and when something is restored from the Bin
  useEffect(() => {
    const resync = () => requestSync(1500);
    window.addEventListener('newlife-vault-changed', resync);
    return () => window.removeEventListener('newlife-vault-changed', resync);
  }, []);

  // ---------- BACK BUTTON HANDLING ----------
  const [showExitToast, setShowExitToast] = useState(false);

  // Latest state for the popstate listener (which is registered only once)
  const stateRef = useRef({});
  stateRef.current = { activeTab, isSubAppOpen };

  // Drawer and search close on Back
  useBackHandler(isDrawerOpen, () => setIsDrawerOpen(false));
  useBackHandler(isSearchActive, () => { setGlobalSearchQuery(''); setIsSearchActive(false); });

  useEffect(() => {
    let lastBackTime = 0;
    let toastTimer;

    // ===== Installed Android app (Capacitor APK): use the phone's Back button event =====
    if (Capacitor.isNativePlatform()) {
      let listenerHandle = null;
      let removed = false;

      const onNativeBack = () => {
        // 1) Close the top-most open screen / modal / form
        if (runBackHandler()) return;

        const { activeTab, isSubAppOpen } = stateRef.current;

        // 2) Close the open sub-app (Notes, Goals etc.)
        if (isSubAppOpen) { setIsSubAppOpen(false); return; }

        // 3) Go back to Home tab
        if (activeTab !== 'home') { setActiveTab('home'); return; }

        // 4) On Home: press Back twice to exit
        const now = Date.now();
        if (now - lastBackTime < 2000) {
          CapApp.exitApp();
          return;
        }
        lastBackTime = now;
        setShowExitToast(true);
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => setShowExitToast(false), 2000);
      };

      CapApp.addListener('backButton', onNativeBack).then((handle) => {
        if (removed) handle.remove();
        else listenerHandle = handle;
      });

      return () => {
        removed = true;
        if (listenerHandle) listenerHandle.remove();
        clearTimeout(toastTimer);
      };
    }

    // ===== Browser / local server: use the browser history =====
    // History layout: [ ...browser pages, BASE (this app), GUARD ]
    // The user always sits on GUARD. Back moves to BASE (popstate), we handle it,
    // then move forward to GUARD again. No new history entries are created
    // while handling Back, so the browser can never skip them.
    if (!window.history.state?.guard) {
      window.history.pushState({ guard: true }, '', window.location.href);
    }

    const returnToGuard = () => {
      window.history.go(1);
      // Safety net: if there was no GUARD entry to go forward to, create one
      setTimeout(() => {
        if (!window.history.state?.guard) {
          window.history.pushState({ guard: true }, '', window.location.href);
        }
      }, 120);
    };

    let exiting = false;

    const onPopState = (e) => {
      if (exiting) return;

      // We just came back onto the GUARD entry ourselves - nothing to do
      if (e.state?.guard) return;

      // 1) Close the top-most open screen / modal / form
      if (runBackHandler()) { returnToGuard(); return; }

      const { activeTab, isSubAppOpen } = stateRef.current;

      // 2) Close the open sub-app (Notes, Goals etc.)
      if (isSubAppOpen) { setIsSubAppOpen(false); returnToGuard(); return; }

      // 3) Go back to Home tab
      if (activeTab !== 'home') { setActiveTab('home'); returnToGuard(); return; }

      // 4) On Home: press Back twice to exit
      const now = Date.now();
      if (now - lastBackTime < 2000) {
        exiting = true;
        window.history.back();
        return;
      }
      lastBackTime = now;
      returnToGuard();
      setShowExitToast(true);
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => setShowExitToast(false), 2000);
    };

    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      clearTimeout(toastTimer);
    };
  }, []);
  // ---------- END BACK BUTTON HANDLING ----------

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
        {activeTab === 'people' && <PeopleTab onGoToLogin={() => setActiveTab('me')} />}
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
      {/* Trip invite links: opens the Accept / Reject sheet */}
      <TripInviteHandler onGoToLogin={() => setActiveTab('me')} onGoToPeople={() => setActiveTab('people')} />

      {showExitToast && (
        <div style={{ position: 'absolute', bottom: '90px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(17,24,39,0.9)', color: '#fff', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', zIndex: 100, whiteSpace: 'nowrap' }}>
          Press back again to exit
        </div>
      )}

    </div>
  );
}
