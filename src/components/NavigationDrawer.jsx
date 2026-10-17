import React, { useState } from 'react';
import { X, Home, Globe, Palette, Settings, Shield, FileText, HelpCircle, Info, Scale, MessageSquarePlus, Sparkles, ChevronRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SettingsView from './settings/SettingsView';
import PrivacyPolicyView from './PrivacyPolicyView';
import TermsView from './TermsView';
import AboutView from './AboutView';
import LegalView from './LegalView';
import FeedbackView from './FeedbackView';
import HelpView from './HelpView';
import { useBackHandler } from '../utils/useBackHandler';

export default function NavigationDrawer({ isOpen, onClose, setActiveTab }) {
  // Theme + language ab seedha context se aate hain (props se nahi)
  const { c, t, currentTheme, setTheme, currentLang, setLang } = useApp();
  const [activeSubView, setActiveSubView] = useState(null);

  // Back button: first leave the open sub-page (Language, Settings...) and return to the menu.
  // The drawer itself is closed by App.jsx.
  useBackHandler(isOpen && activeSubView !== null, () => setActiveSubView(null));

  if (!isOpen) return null;

  const languages = [
    { code: 'en', name: 'English (US/UK)' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'zh', name: '中文 (Chinese)' },
    { code: 'es', name: 'Español (Spanish)' },
    { code: 'ja', name: '日本語 (Japanese)' },
    { code: 'de', name: 'Deutsch (German)' },
    { code: 'fr', name: 'Français (French)' },
    { code: 'ar', name: 'العربية (Arabic)' },
    { code: 'ru', name: 'Русский (Russian)' },
    { code: 'pt', name: 'Português (Portuguese)' }
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundColor: c.overlay, zIndex: 9999 }} onClick={onClose} />
      
      <div style={{ position: 'relative', width: '88%', maxWidth: '340px', background: c.drawerBg, color: c.text, height: '100%', boxShadow: '0 25px 60px rgba(60,10,30,0.45)', display: 'flex', flexDirection: 'column', zIndex: 10000, borderRight: '1px solid rgba(251, 113, 133, 0.3)', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid rgba(251,113,133,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'linear-gradient(160deg, #ffffff 0%, #ffd6e4 100%)', border: '1px solid rgba(251,113,133,0.3)', boxShadow: 'inset 0 2px 0 #ffffff', color: '#e11d48' }}><Sparkles size={18} /></div>
            <span style={{ fontWeight: '900', fontSize: '16px', background: 'linear-gradient(135deg, #f43f5e, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.appName}</span>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(251,113,133,0.3)', padding: '8px', borderRadius: '12px', color: '#e11d48', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {activeSubView === null ? (
            <>
              <button onClick={() => { setActiveTab('home'); onClose(); }} style={menuItemStyle(currentTheme)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={iconBoxStyle('#fff1f2', '#f43f5e')}><Home size={16} /></div><span style={{ fontWeight: '800', fontSize: '13px' }}>{t.home}</span></div>
                <ChevronRight size={16} color="#f43f5e" />
              </button>

              <button onClick={() => setActiveSubView('language')} style={menuItemStyle(currentTheme)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={iconBoxStyle('#e0f2fe', '#0284c7')}><Globe size={16} /></div><span style={{ fontWeight: '800', fontSize: '13px' }}>{t.language} ({currentLang.toUpperCase()})</span></div>
                <ChevronRight size={16} color="#f43f5e" />
              </button>

              <button onClick={() => setActiveSubView('theme')} style={menuItemStyle(currentTheme)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={iconBoxStyle('#fef3c7', '#d97706')}><Palette size={16} /></div><span style={{ fontWeight: '800', fontSize: '13px' }}>{t.theme} ({currentTheme})</span></div>
                <ChevronRight size={16} color="#f43f5e" />
              </button>

              <button onClick={() => setActiveSubView('settings')} style={menuItemStyle(currentTheme)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={iconBoxStyle('#ecfdf5', '#059669')}><Settings size={16} /></div><span style={{ fontWeight: '800', fontSize: '13px' }}>{t.settings}</span></div>
                <ChevronRight size={16} color="#f43f5e" />
              </button>

              <div style={{ height: '1px', background: 'rgba(251,113,133,0.25)', margin: '8px 0' }} />

              <button onClick={() => setActiveSubView('privacy')} style={menuItemStyle(currentTheme)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={iconBoxStyle('#fff1f2', '#f43f5e')}><Shield size={16} /></div><span style={{ fontWeight: '700', fontSize: '13px' }}>{t.privacy}</span></div>
                <ChevronRight size={16} color="#f43f5e" />
              </button>

              <button onClick={() => setActiveSubView('terms')} style={menuItemStyle(currentTheme)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={iconBoxStyle('#fef3c7', '#d97706')}><FileText size={16} /></div><span style={{ fontWeight: '700', fontSize: '13px' }}>{t.terms}</span></div>
                <ChevronRight size={16} color="#f43f5e" />
              </button>

              <button onClick={() => setActiveSubView('legal')} style={menuItemStyle(currentTheme)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={iconBoxStyle('#f3e8ff', '#9333ea')}><Scale size={16} /></div><span style={{ fontWeight: '700', fontSize: '13px' }}>{t.legal}</span></div>
                <ChevronRight size={16} color="#f43f5e" />
              </button>

              <button onClick={() => setActiveSubView('feedback')} style={menuItemStyle(currentTheme)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={iconBoxStyle('#ecfdf5', '#059669')}><MessageSquarePlus size={16} /></div><span style={{ fontWeight: '700', fontSize: '13px' }}>{t.feedback}</span></div>
                <ChevronRight size={16} color="#f43f5e" />
              </button>

              <button onClick={() => setActiveSubView('help')} style={menuItemStyle(currentTheme)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={iconBoxStyle('#f3e8ff', '#9333ea')}><HelpCircle size={16} /></div><span style={{ fontWeight: '700', fontSize: '13px' }}>{t.help}</span></div>
                <ChevronRight size={16} color="#f43f5e" />
              </button>

              <button onClick={() => setActiveSubView('about')} style={menuItemStyle(currentTheme)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={iconBoxStyle('#e0f2fe', '#0284c7')}><Info size={16} /></div><span style={{ fontWeight: '700', fontSize: '13px' }}>{t.about}</span></div>
                <ChevronRight size={16} color="#f43f5e" />
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => setActiveSubView(null)} style={{ alignSelf: 'flex-start', background: 'rgba(244,63,94,0.1)', color: '#e11d48', border: '1px solid rgba(251,113,133,0.35)', padding: '8px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '900', cursor: 'pointer', marginBottom: '8px' }}>
                {t.backMenu}
              </button>

              {activeSubView === 'language' && (
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '900', marginBottom: '14px', color: c.selectedText }}>🌍 {t.selectLang}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {languages.map((l) => (
                      <button key={l.code} onClick={() => { setLang(l.code); setActiveSubView(null); }} style={{ width: '100%', padding: '14px 16px', borderRadius: '18px', background: currentLang === l.code ? c.selectedBg : (c.isDark ? c.glass : 'linear-gradient(160deg, #ffffff 0%, rgba(255,240,246,0.9) 100%)'), border: currentLang === l.code ? '2px solid #f43f5e' : '1px solid rgba(251,113,133,0.25)', color: currentLang === l.code ? c.selectedText : c.choiceText, boxShadow: currentLang === l.code ? '0 0 18px -2px rgba(244,63,94,0.5)' : (c.isDark ? 'none' : 'inset 0 2px 0 #ffffff'), fontWeight: '900', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{l.name}</span>{currentLang === l.code && <Check size={16} color="#f43f5e" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSubView === 'theme' && (
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '900', marginBottom: '14px', color: '#d97706' }}>🎨 {t.selectTheme}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={() => { setTheme('light'); setActiveSubView(null); }} style={{ width: '100%', padding: '16px', borderRadius: '18px', background: 'linear-gradient(160deg, #ffffff 0%, rgba(255,240,246,0.9) 100%)', color: '#3b0f24', border: currentTheme === 'light' ? '2px solid #d97706' : '1px solid rgba(251,113,133,0.25)', fontWeight: '900', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                      <span>☀️ {t.lightTheme}</span>{currentTheme === 'light' && <Check size={16} color="#d97706" />}
                    </button>
                    <button onClick={() => { setTheme('dark'); setActiveSubView(null); }} style={{ width: '100%', padding: '16px', borderRadius: '18px', background: '#1e293b', color: '#fff', border: currentTheme === 'dark' ? '2px solid #3b82f6' : '1px solid rgba(0,0,0,0.06)', fontWeight: '900', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                      <span>🌙 {t.darkTheme}</span>{currentTheme === 'dark' && <Check size={16} color="#3b82f6" />}
                    </button>
                  </div>
                </div>
              )}

              {activeSubView === 'settings' && <SettingsView currentTheme={currentTheme} currentLang={currentLang} />}
              {activeSubView === 'privacy' && <PrivacyPolicyView currentTheme={currentTheme} currentLang={currentLang} />}
              {activeSubView === 'terms' && <TermsView currentTheme={currentTheme} currentLang={currentLang} />}
              {activeSubView === 'legal' && <LegalView currentTheme={currentTheme} currentLang={currentLang} />}
              {activeSubView === 'feedback' && <FeedbackView currentTheme={currentTheme} currentLang={currentLang} />}
              {activeSubView === 'about' && <AboutView currentTheme={currentTheme} currentLang={currentLang} />}
              
              {activeSubView === 'help' && <HelpView currentTheme={currentTheme} currentLang={currentLang} />}
            </div>
          )}
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(251,113,133,0.2)', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', color: '#b0587a', fontWeight: '700' }}>{t.dev}</p>
        </div>
      </div>
    </div>
  );
}

function menuItemStyle(theme) {
  return theme === 'dark'
    ? { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '16px', background: 'transparent', border: 'none', color: '#f9fafb', cursor: 'pointer', textAlign: 'left' }
    : { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '18px', background: 'linear-gradient(160deg, #ffffff 0%, rgba(255,255,255,0.82) 55%, rgba(255,234,243,0.96) 100%)', border: '1px solid rgba(251,113,133,0.25)', borderTop: '1px solid #ffffff', boxShadow: 'inset 0 2px 0 #ffffff, 0 8px 16px -10px rgba(244,63,94,0.35)', color: '#3b0f24', cursor: 'pointer', textAlign: 'left' };
}

// Saare icon ek jaise rose rang ke (pehle har ek ka alag rang tha). Parameters pehle jaise hi hain.
function iconBoxStyle() {
  return { padding: '8px', borderRadius: '12px', background: 'linear-gradient(160deg, #ffffff 0%, #ffd6e4 100%)', border: '1px solid rgba(251,113,133,0.3)', boxShadow: 'inset 0 2px 0 #ffffff', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' };
}
