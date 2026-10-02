import React, { useState } from 'react';
import { X, Home, Globe, Palette, Settings, Shield, FileText, HelpCircle, Info, Scale, MessageSquarePlus, Sparkles, ChevronRight, Check } from 'lucide-react';
import { translations } from '../utils/translations';
import SettingsView from './settings/SettingsView';
import PrivacyPolicyView from './PrivacyPolicyView';
import TermsView from './TermsView';
import AboutView from './AboutView';
import LegalView from './LegalView';
import FeedbackView from './FeedbackView';

export default function NavigationDrawer({ isOpen, onClose, setActiveTab, currentTheme, setTheme, currentLang, setLang }) {
  const [activeSubView, setActiveSubView] = useState(null);

  if (!isOpen) return null;

  const t = translations[currentLang] || translations.en;

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
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(12px)', zIndex: 9999 }} onClick={onClose} />
      
      <div style={{ position: 'relative', width: '88%', maxWidth: '340px', backgroundColor: currentTheme === 'dark' ? '#111827' : '#ffffff', color: currentTheme === 'dark' ? '#f9fafb' : '#1f2937', height: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', zIndex: 10000, borderRight: '1px solid rgba(244, 63, 94, 0.2)', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '12px', background: '#fff1f2', color: '#f43f5e' }}><Sparkles size={18} /></div>
            <span style={{ fontWeight: '900', fontSize: '16px', background: 'linear-gradient(135deg, #f43f5e, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.appName}</span>
          </div>
          <button onClick={onClose} style={{ background: '#fef2f2', border: 'none', padding: '8px', borderRadius: '12px', color: '#f43f5e', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {activeSubView === null ? (
            <>
              <button onClick={() => { setActiveTab('home'); onClose(); }} style={menuItemStyle(currentTheme)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={iconBoxStyle('#fff1f2', '#f43f5e')}><Home size={16} /></div><span style={{ fontWeight: '800', fontSize: '13px' }}>{t.home}</span></div>
                <ChevronRight size={16} color="#9ca3af" />
              </button>

              <button onClick={() => setActiveSubView('language')} style={menuItemStyle(currentTheme)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={iconBoxStyle('#e0f2fe', '#0284c7')}><Globe size={16} /></div><span style={{ fontWeight: '800', fontSize: '13px' }}>{t.language} ({currentLang.toUpperCase()})</span></div>
                <ChevronRight size={16} color="#9ca3af" />
              </button>

              <button onClick={() => setActiveSubView('theme')} style={menuItemStyle(currentTheme)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={iconBoxStyle('#fef3c7', '#d97706')}><Palette size={16} /></div><span style={{ fontWeight: '800', fontSize: '13px' }}>{t.theme} ({currentTheme})</span></div>
                <ChevronRight size={16} color="#9ca3af" />
              </button>

              <button onClick={() => setActiveSubView('settings')} style={menuItemStyle(currentTheme)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={iconBoxStyle('#ecfdf5', '#059669')}><Settings size={16} /></div><span style={{ fontWeight: '800', fontSize: '13px' }}>{t.settings}</span></div>
                <ChevronRight size={16} color="#9ca3af" />
              </button>

              <div style={{ height: '1px', background: 'rgba(0,0,0,0.08)', margin: '8px 0' }} />

              <button onClick={() => setActiveSubView('privacy')} style={menuItemStyle(currentTheme)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={iconBoxStyle('#fff1f2', '#f43f5e')}><Shield size={16} /></div><span style={{ fontWeight: '700', fontSize: '13px' }}>{t.privacy}</span></div>
                <ChevronRight size={16} color="#9ca3af" />
              </button>

              <button onClick={() => setActiveSubView('terms')} style={menuItemStyle(currentTheme)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={iconBoxStyle('#fef3c7', '#d97706')}><FileText size={16} /></div><span style={{ fontWeight: '700', fontSize: '13px' }}>{t.terms}</span></div>
                <ChevronRight size={16} color="#9ca3af" />
              </button>

              <button onClick={() => setActiveSubView('legal')} style={menuItemStyle(currentTheme)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={iconBoxStyle('#f3e8ff', '#9333ea')}><Scale size={16} /></div><span style={{ fontWeight: '700', fontSize: '13px' }}>{t.legal}</span></div>
                <ChevronRight size={16} color="#9ca3af" />
              </button>

              <button onClick={() => setActiveSubView('feedback')} style={menuItemStyle(currentTheme)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={iconBoxStyle('#ecfdf5', '#059669')}><MessageSquarePlus size={16} /></div><span style={{ fontWeight: '700', fontSize: '13px' }}>{t.feedback}</span></div>
                <ChevronRight size={16} color="#9ca3af" />
              </button>

              <button onClick={() => setActiveSubView('help')} style={menuItemStyle(currentTheme)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={iconBoxStyle('#f3e8ff', '#9333ea')}><HelpCircle size={16} /></div><span style={{ fontWeight: '700', fontSize: '13px' }}>{t.help}</span></div>
                <ChevronRight size={16} color="#9ca3af" />
              </button>

              <button onClick={() => setActiveSubView('about')} style={menuItemStyle(currentTheme)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={iconBoxStyle('#e0f2fe', '#0284c7')}><Info size={16} /></div><span style={{ fontWeight: '700', fontSize: '13px' }}>{t.about}</span></div>
                <ChevronRight size={16} color="#9ca3af" />
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => setActiveSubView(null)} style={{ alignSelf: 'flex-start', background: '#fff1f2', color: '#f43f5e', border: '1px solid #ffd1d6', padding: '8px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '900', cursor: 'pointer', marginBottom: '8px' }}>
                {t.backMenu}
              </button>

              {activeSubView === 'language' && (
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '900', marginBottom: '14px', color: '#f43f5e' }}>🌍 {t.selectLang}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {languages.map((l) => (
                      <button key={l.code} onClick={() => { setLang(l.code); setActiveSubView(null); }} style={{ width: '100%', padding: '14px 16px', borderRadius: '18px', background: currentLang === l.code ? '#ffe4e6' : '#ffffff', border: currentLang === l.code ? '2px solid #f43f5e' : '1px solid rgba(0,0,0,0.06)', color: currentLang === l.code ? '#f43f5e' : '#374151', fontWeight: '900', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
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
                    <button onClick={() => { setTheme('light'); setActiveSubView(null); }} style={{ width: '100%', padding: '16px', borderRadius: '18px', background: '#ffffff', border: currentTheme === 'light' ? '2px solid #d97706' : '1px solid rgba(0,0,0,0.06)', fontWeight: '900', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                      <span>☀️ {t.lightTheme}</span>{currentTheme === 'light' && <Check size={16} color="#d97706" />}
                    </button>
                    <button onClick={() => { setTheme('dark'); setActiveSubView(null); }} style={{ width: '100%', padding: '16px', borderRadius: '18px', background: '#1e293b', color: '#fff', border: currentTheme === 'dark' ? '2px solid #3b82f6' : '1px solid rgba(0,0,0,0.06)', fontWeight: '900', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                      <span>🌙 {t.darkTheme}</span>{currentTheme === 'dark' && <Check size={16} color="#3b82f6" />}
                    </button>
                  </div>
                </div>
              )}

              {activeSubView === 'settings' && <SettingsView currentTheme={currentTheme} />}
              {activeSubView === 'privacy' && <PrivacyPolicyView currentTheme={currentTheme} currentLang={currentLang} />}
              {activeSubView === 'terms' && <TermsView currentTheme={currentTheme} currentLang={currentLang} />}
              {activeSubView === 'legal' && <LegalView currentTheme={currentTheme} currentLang={currentLang} />}
              {activeSubView === 'feedback' && <FeedbackView currentTheme={currentTheme} currentLang={currentLang} />}
              {activeSubView === 'about' && <AboutView currentTheme={currentTheme} currentLang={currentLang} />}
              
              {activeSubView === 'help' && (
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '900', marginBottom: '8px' }}>{t.help}</h4>
                  <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Contact developer at:</p>
                  <a href="mailto:radherockystar@gmail.com" style={{ display: 'block', marginTop: '8px', fontSize: '12px', fontWeight: '900', color: '#f43f5e', textDecoration: 'underline' }}>radherockystar@gmail.com</a>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '700' }}>{t.dev}</p>
        </div>
      </div>
    </div>
  );
}

function menuItemStyle(theme) {
  return { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '16px', background: 'transparent', border: 'none', color: theme === 'dark' ? '#f9fafb' : '#374151', cursor: 'pointer', textAlign: 'left' };
}

function iconBoxStyle(bg, color) {
  return { padding: '8px', borderRadius: '10px', background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' };
}
