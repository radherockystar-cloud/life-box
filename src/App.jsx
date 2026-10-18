import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Lock, X } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import NavigationDrawer from './components/NavigationDrawer';
import BottomNav from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import MemoriesScreen from './screens/MemoriesScreen';
import PlannerTab from './tabs/planner/PlannerTab';
import MeTab from './tabs/me/MeTab';
import ProLock from './components/ProLock';
import SubscriptionScreen from './tabs/me/subscription/SubscriptionScreen';
import { useEntitlements, initBilling, PLANS_EVENT } from './utils/billing';
import { setBannerVisible } from './utils/ads';
import { AppProvider, useApp } from './context/AppContext';
import { useBackHandler, runBackHandler } from './utils/useBackHandler';
import { requestSync } from './tabs/planner/reminderService';
import './utils/autoNotificationSources';
import { appStorage } from './utils/appStorage';

function AppShell() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isSubAppOpen, setIsSubAppOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false); // Subscription page (kahin se bhi khulta hai)
  const ent = useEntitlements();
  
  // Search States
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  
  // Theme + language poore app me ek jagah se aate hain (src/context/AppContext.jsx)
  const { currentTheme, currentLang, t, c } = useApp();

  // App Lock State
  const [isLocked, setIsLocked] = useState(() => {
    return appStorage.getItem('newlife_lock_enabled') === 'true';
  });
  const [enteredPin, setEnteredPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ---------- SUBSCRIPTION + ADS ----------
  useEffect(() => {
    initBilling(); // Play se pucho kaun sa plan chalu hai
  }, []);

  useEffect(() => {
    const open = () => setPlansOpen(true);
    window.addEventListener(PLANS_EVENT, open);
    return () => window.removeEventListener(PLANS_EVENT, open);
  }, []);

  // Banner ad: free user ko, main screens par. Lock screen / sub-app / plans page me nahi.
  const adsVisible = (!isLocked || isAuthenticated) && !isSubAppOpen && !plansOpen && !ent.adFree;
  useEffect(() => {
    setBannerVisible(adsVisible);
  }, [adsVisible]);
  // ----------------------------------------

  // ---------- APP BACKGROUND/FOREGROUND LOCK LISTENER ----------
  useEffect(() => {
    let listenerHandle = null;
    let isMounted = true;

    // Android Native App listener (Home button dabane par)
    CapApp.addListener('appStateChange', (state) => {
      if (!state.isActive) {
        // Jaise hi app background me jaye, authenticate ko reset karein
        if (appStorage.getItem('newlife_lock_enabled') === 'true') {
          setIsAuthenticated(false);
          setEnteredPin('');
        }
      }
    }).then((handle) => {
      if (isMounted) {
        listenerHandle = handle;
      } else {
        handle.remove();
      }
    });

    // Browser tab switch listener (fallback)
    const handleVisibilityChange = () => {
      if (document.hidden && appStorage.getItem('newlife_lock_enabled') === 'true') {
        setIsAuthenticated(false);
        setEnteredPin('');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      if (listenerHandle) listenerHandle.remove();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  // -------------------------------------------------------------

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

  const handleUnlockSubmit = (e) => {
    e.preventDefault();
    const savedPin = appStorage.getItem('newlife_passcode');
    if (enteredPin === savedPin) {
      setIsAuthenticated(true);
    } else {
      alert(t.wrongPin);
      setEnteredPin('');
    }
  };

  // Header ke dono buttons (menu + search) ka theme wala style
  const headerBtnStyle = {
    background: c.btnBg,
    border: currentTheme === 'dark' ? '1px solid rgba(255, 228, 230, 0.8)' : '1px solid rgba(251,113,133,0.25)',
    borderTop: currentTheme === 'dark' ? '1px solid rgba(255, 228, 230, 0.8)' : '1px solid #ffffff',
    padding: '10px',
    borderRadius: '16px',
    color: currentTheme === 'dark' ? '#f43f5e' : '#e11d48',
    cursor: 'pointer',
    boxShadow: c.btnShadow,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  if (isLocked && !isAuthenticated) {
    return (
      <div style={{ height: '100vh', width: '100%', maxWidth: '28rem', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: c.isDark ? c.pageBg : 'radial-gradient(90% 40% at 0% 0%, rgba(251,113,133,0.28), transparent 60%), radial-gradient(80% 40% at 100% 100%, rgba(244,114,182,0.28), transparent 62%), linear-gradient(180deg, #fff8fb, #ffeaf3)', padding: '24px' }}>
        <div style={{ background: c.glass, padding: '30px', borderRadius: '32px', boxShadow: c.isDark ? '0 20px 40px -14px rgba(0,0,0,0.6)' : 'inset 0 2px 0 #ffffff, inset 0 -9px 14px -10px rgba(244,63,94,0.25), 0 20px 40px -14px rgba(244,63,94,0.45), 0 0 26px -8px rgba(251,113,133,0.4)', width: '100%', maxWidth: '320px', textAlign: 'center', border: '1px solid rgba(251,113,133,0.25)', borderTop: '1px solid ' + c.glassTop }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: 'linear-gradient(160deg, #ffffff 0%, #ffd6e4 100%)', border: '1px solid rgba(251,113,133,0.3)', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', boxShadow: 'inset 0 2px 0 #ffffff, 0 8px 20px rgba(244,63,94,0.25)' }}>
            <Lock size={26} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: c.text, marginBottom: '4px' }}>{t.lockTitle}</h2>
          <p style={{ fontSize: '11px', color: c.textSub, fontWeight: '700', marginBottom: '20px' }}>{t.lockSub}</p>

          <form onSubmit={handleUnlockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              type="password" 
              placeholder={t.lockPlaceholder} 
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '16px', border: '1px solid rgba(251,113,133,0.3)', borderTop: '1px solid ' + c.glassTop, fontSize: '14px', outline: 'none', textAlign: 'center', fontWeight: '900', color: c.text, background: c.isDark ? c.surfaceAlt : 'linear-gradient(160deg, #ffffff 0%, rgba(255,240,246,0.9) 100%)', boxShadow: c.isDark ? 'none' : 'inset 0 2px 0 #ffffff, 0 8px 16px -10px rgba(244,63,94,0.35)' }}
              required
            />
            <button 
              type="submit"
              style={{ width: '100%', padding: '12px', borderRadius: '16px', background: 'linear-gradient(160deg, #fb7185 0%, #e11d48 55%, #be123c 100%)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.5)', borderTop: '1px solid rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: '900', cursor: 'pointer', boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.65), inset 0 -6px 12px -6px rgba(80,0,40,0.5), 0 8px 18px -4px rgba(225,29,72,0.65), 0 0 24px rgba(244,63,94,0.5)' }}
            >
              {t.unlockBtn}
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
      background: c.pageBg, 
      color: c.text,
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
            background: c.headerBg,
            borderBottom: '1px solid rgba(251, 113, 133, 0.25)',
            boxShadow: '0 12px 28px -14px rgba(244, 63, 94, 0.35)',
            zIndex: 30,
            flexShrink: 0
          }}
        >
          <button 
            onClick={() => setIsDrawerOpen(true)} 
            style={headerBtnStyle}
          >
            <Menu size={20} />
          </button>

          {/* Toggleable Search Bar inside Header */}
          {isSearchActive ? (
            <div style={{ display: 'flex', alignItems: 'center', background: currentTheme === 'dark' ? c.surface : 'linear-gradient(160deg, #ffffff 0%, rgba(255,240,246,0.95) 100%)', borderRadius: '14px', padding: '6px 12px', flex: 1, margin: '0 10px', border: '1px solid rgba(251,113,133,0.3)', boxShadow: 'inset 0 2px 4px rgba(244,63,94,0.12)' }}>
              <input 
                type="text"
                placeholder={t.searchTools}
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                autoFocus
                className="placeholder:text-[rgba(190,24,93,0.4)]"
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '12px', width: '100%', fontWeight: '900', color: c.text }}
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
            style={headerBtnStyle}
          >
            {isSearchActive ? <X size={20} /> : <Search size={20} />}
          </button>
        </header>
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '16px', overflowY: 'auto', position: 'relative' }}>
        {activeTab === 'home' && <HomeScreen onSubAppToggle={setIsSubAppOpen} searchQuery={globalSearchQuery} />}
        {activeTab === 'memories' && (ent.pro ? <MemoriesScreen /> : <ProLock />)}
        {activeTab === 'planner' && <PlannerTab />}
        {activeTab === 'me' && <MeTab />}
      </main>

      {/* Bottom Navigation */}
      {!isSubAppOpen && !plansOpen && (
        <div style={{ position: 'relative', zIndex: 10 }}>
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      )}

      {/* Sidebar Drawer */}
      <NavigationDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        setActiveTab={setActiveTab} 
      />

      {plansOpen && <SubscriptionScreen onBack={() => setPlansOpen(false)} />}

      {showExitToast && (
        <div style={{ position: 'absolute', bottom: '90px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(17,24,39,0.9)', color: '#fff', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', zIndex: 100, whiteSpace: 'nowrap' }}>
          {t.pressBackAgain}
        </div>
      )}

    </div>
  );
}

// Theme + Language provider yahin lagaya hai, isliye main.jsx badalne ki zarurat nahi
export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
