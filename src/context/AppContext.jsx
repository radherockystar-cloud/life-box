// Poore app ka Theme (light/dark) aur Language ek hi jagah se chalte hain.
//
// Kisi bhi screen me bas itna likho:
//     const { c, t, currentTheme, currentLang } = useApp();
//   c  -> theme ke rang  (c.text, c.glass, c.surface ...)   -> style={{ color: c.text }}
//   t  -> current language ke shabd (t.home, t.settings ...)
//
// Ye provider <html data-theme="dark|light"> aur CSS variables (--c-text, --c-glass ...) bhi set karta hai,
// jisse Tailwind/CSS wali files me bhi  var(--c-text)  use ho sakta hai.

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { translations } from '../utils/translations';
import { appStorage } from '../utils/appStorage';

const THEME_KEY = 'newlife_theme';
const LANG_KEY = 'newlife_lang';

const GLASS_LIGHT = 'linear-gradient(160deg, #ffffff 0%, rgba(255,255,255,0.82) 55%, rgba(255,234,243,0.96) 100%)';
const GLASS_DARK = 'linear-gradient(160deg, #1e293b 0%, #172033 100%)';

export const PALETTES = {
  light: {
    isDark: false,
    pageBg:
      'radial-gradient(90% 40% at 0% 0%, rgba(251,113,133,0.20), transparent 60%), radial-gradient(80% 40% at 100% 100%, rgba(244,114,182,0.22), transparent 62%), linear-gradient(180deg, #fff8fb, #ffeaf3)',
    // text
    text: '#3b0f24',
    textSub: '#a8466c',
    ink: '#111827',
    inkSoft: '#374151',
    inkMuted: '#6b7280',
    faint: '#9ca3af',
    // surfaces
    glass: GLASS_LIGHT,
    glassBorder: 'rgba(251,113,133,0.25)',
    glassTop: '#ffffff',
    glassShadow:
      'inset 0 2px 0 #ffffff, inset 0 -9px 14px -10px rgba(244,63,94,0.25), 0 10px 22px -10px rgba(244,63,94,0.35)',
    surface: '#ffffff',
    surfaceAlt: '#fafafa',
    line: '#e5e7eb',
    lineSoft: '#f3f4f6',
    cardShadow: '0 10px 25px rgba(0,0,0,0.05)',
    // header / bottom bar / drawer
    headerBg: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,238,246,0.96))',
    navBg: 'rgba(255, 255, 255, 0.95)',
    navBorder: 'rgba(255, 228, 230, 0.8)',
    navShadow: '0 -10px 25px -5px rgba(244, 63, 94, 0.2)',
    navInactive: '#9ca3af',
    drawerBg: 'linear-gradient(180deg, #fff8fb, #ffeaf3)',
    overlay: 'rgba(60, 10, 30, 0.5)',
    // buttons / inputs
    btnBg: GLASS_LIGHT,
    btnBorder: 'rgba(251,113,133,0.25)',
    btnShadow:
      'inset 0 2px 0 #ffffff, inset 0 -9px 14px -10px rgba(244,63,94,0.25), 0 10px 22px -10px rgba(244,63,94,0.35)',
    inputBg: '#fafafa',
    // accents
    accent: '#f43f5e',
    accentDeep: '#e11d48',
    accentSoft: '#fff1f2',
    accentLine: 'rgba(244,63,94,0.3)',
    selectedBg: 'linear-gradient(160deg, #fff0f5 0%, #ffd6e4 100%)',
    selectedText: '#be123c',
    choiceText: '#6f2f4b',
    dangerBg: '#fee2e2',
    dangerText: '#dc2626',
    dangerLine: '#fca5a5',
    goldBg: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
    goldText: '#d97706',
    guestBg: '#f8fafc',
    guestLine: '#e2e8f0',
    guestIconBg: '#e2e8f0',
    guestIconText: '#64748b',
    guestTitle: '#334155',
  },
  dark: {
    isDark: true,
    pageBg: '#0f172a',
    text: '#f9fafb',
    textSub: '#fda4af',
    ink: '#f9fafb',
    inkSoft: '#cbd5e1',
    inkMuted: '#94a3b8',
    faint: '#64748b',
    glass: GLASS_DARK,
    glassBorder: 'rgba(251,113,133,0.25)',
    glassTop: 'rgba(255,255,255,0.08)',
    glassShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 22px -10px rgba(0,0,0,0.6)',
    surface: '#1e293b',
    surfaceAlt: '#0f172a',
    line: '#334155',
    lineSoft: '#273449',
    cardShadow: '0 10px 25px rgba(0,0,0,0.35)',
    headerBg: 'rgba(15, 23, 42, 0.96)',
    navBg: 'rgba(15, 23, 42, 0.96)',
    navBorder: 'rgba(251, 113, 133, 0.25)',
    navShadow: '0 -10px 25px -5px rgba(0, 0, 0, 0.5)',
    navInactive: '#64748b',
    drawerBg: '#111827',
    overlay: 'rgba(0, 0, 0, 0.6)',
    btnBg: '#1e293b',
    btnBorder: 'rgba(255, 228, 230, 0.8)',
    btnShadow: '0 4px 12px rgba(244,63,94,0.15)',
    inputBg: '#0f172a',
    accent: '#f43f5e',
    accentDeep: '#fb7185',
    accentSoft: 'rgba(244,63,94,0.15)',
    accentLine: 'rgba(244,63,94,0.4)',
    selectedBg: 'rgba(244,63,94,0.18)',
    selectedText: '#fda4af',
    choiceText: '#e2e8f0',
    dangerBg: 'rgba(220,38,38,0.18)',
    dangerText: '#fca5a5',
    dangerLine: 'rgba(252,165,165,0.4)',
    goldBg: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.1))',
    goldText: '#fbbf24',
    guestBg: '#1e293b',
    guestLine: '#334155',
    guestIconBg: '#334155',
    guestIconText: '#94a3b8',
    guestTitle: '#e2e8f0',
  },
};

const readTheme = () => {
  try {
    return appStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

const readLang = () => {
  try {
    const saved = appStorage.getItem(LANG_KEY);
    return saved && translations[saved] ? saved : 'en';
  } catch {
    return 'en';
  }
};

// Jo shabd kisi language me nahi mila, wo English se aa jata hai (screen kabhi khali / "undefined" nahi dikhegi)
const buildT = (lang) => ({ ...translations.en, ...(translations[lang] || {}) });

const toKebab = (s) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

const FALLBACK = {
  currentTheme: 'light',
  currentLang: 'en',
  setTheme: () => {},
  setLang: () => {},
  c: PALETTES.light,
  t: buildT('en'),
  tr: (key, fallback) => buildT('en')[key] ?? fallback ?? key,
};

const AppContext = createContext(FALLBACK);

export function AppProvider({ children }) {
  const [currentTheme, setThemeState] = useState(readTheme);
  const [currentLang, setLangState] = useState(readLang);

  const setTheme = useCallback((value) => setThemeState(value === 'dark' ? 'dark' : 'light'), []);
  const setLang = useCallback((value) => setLangState(translations[value] ? value : 'en'), []);

  // Save + apply on <html> (data-theme, lang, CSS variables)
  useEffect(() => {
    try {
      appStorage.setItem(THEME_KEY, currentTheme);
    } catch {
      /* storage full / blocked: ignore */
    }
    const root = document.documentElement;
    root.setAttribute('data-theme', currentTheme);
    root.style.colorScheme = currentTheme;
    const palette = PALETTES[currentTheme];
    Object.keys(palette).forEach((key) => {
      if (typeof palette[key] === 'string') root.style.setProperty('--c-' + toKebab(key), palette[key]);
    });
    window.dispatchEvent(new CustomEvent('newlife-theme-changed', { detail: currentTheme }));
  }, [currentTheme]);

  useEffect(() => {
    try {
      appStorage.setItem(LANG_KEY, currentLang);
    } catch {
      /* ignore */
    }
    document.documentElement.setAttribute('lang', currentLang);
    window.dispatchEvent(new CustomEvent('newlife-lang-changed', { detail: currentLang }));
  }, [currentLang]);

  const value = useMemo(() => {
    const t = buildT(currentLang);
    return {
      currentTheme,
      currentLang,
      setTheme,
      setLang,
      c: PALETTES[currentTheme],
      t,
      tr: (key, fallback) => t[key] ?? fallback ?? key,
    };
  }, [currentTheme, currentLang, setTheme, setLang]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
