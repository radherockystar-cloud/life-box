import React, { useState, useEffect } from 'react';
import ChatAssistantModal from '../components/ChatAssistantModal';
import NotesAppScreen from './NotesAppScreen';
import MemoriesAppScreen from './MemoriesAppScreen';
import GoalsAppScreen from './GoalsAppScreen';
import VoicesAppScreen from './VoicesAppScreen';
import AiChatAppScreen from './AiChatAppScreen';
import LifeMeterScreen from './LifeMeterScreen';
import { useApp } from '../context/AppContext';
import { useBackHandler } from '../utils/useBackHandler';
import { moveToBin } from '../utils/binStorage';

// Modular Cards & Slider
import LifeSliderCard from '../components/cards/LifeSliderCard';
import AiAssistantCard from '../components/cards/AiAssistantCard';
import LifeMeterCard from '../components/cards/LifeMeterCard';
import MemoryCard from '../components/cards/MemoryCard';
import NoteCard from '../components/cards/NoteCard';
import VoiceCard from '../components/cards/VoiceCard';
import GoalCard from '../components/cards/GoalCard';
import { appStorage } from '../utils/appStorage';

export default function HomeScreen({ onSubAppToggle, searchQuery = '' }) {
  // Theme + language poore app wale context se (App.jsx se prop dene ki zarurat nahi)
  const { c, t } = useApp();
  const [showNotesApp, setShowNotesApp] = useState(false);
  const [showMemoriesApp, setShowMemoriesApp] = useState(false);
  const [showGoalsApp, setShowGoalsApp] = useState(false);
  const [showVoicesApp, setShowVoicesApp] = useState(false);
  const [showAiChatApp, setShowAiChatApp] = useState(false);
  const [showLifeMeter, setShowLifeMeter] = useState(false);

  const [hiddenVault, setHiddenVault] = useState(() => {
    const saved = appStorage.getItem('lifebox_vault');
    return saved ? JSON.parse(saved) : [
      { title: "Rahul's Birthday", content: "Rahul ka birthday 10 October ko hota hai.", type: "Note", date: "2026-10-10" },
      { title: "Coding Streak", content: "Roz coding seekhni hai.", type: "Goal", date: "2026-09-06" }
    ];
  });

  useEffect(() => {
    appStorage.setItem('lifebox_vault', JSON.stringify(hiddenVault));
  }, [hiddenVault]);

  // Notes card ka count: asli notes ki ginti (Notes screen jahan rakhti hai wahin se)
  const readNoteCount = () => {
    try {
      const saved = appStorage.getItem('lifebox_keep_notes');
      if (!saved) return 1; // Notes screen pehli baar ek Welcome note dikhati hai
      const list = JSON.parse(saved);
      return Array.isArray(list) ? list.length : 0;
    } catch (err) {
      return 0;
    }
  };
  const [noteCount, setNoteCount] = useState(readNoteCount);

  // Notes band hone par, ya Bin se restore hone par ginti dobara nikalo
  useEffect(() => {
    setNoteCount(readNoteCount());
    const refresh = () => setNoteCount(readNoteCount());
    window.addEventListener('newlife-vault-changed', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('newlife-vault-changed', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [showNotesApp]);

  const isAnySubAppOpen = showNotesApp || showMemoriesApp || showGoalsApp || showVoicesApp || showAiChatApp || showLifeMeter;

  // Inform App.jsx when any sub-app is open/closed to hide outer headers/nav
  useEffect(() => {
    if (onSubAppToggle) {
      onSubAppToggle(isAnySubAppOpen);
    }
  }, [isAnySubAppOpen, onSubAppToggle]);

  // Back button: close the open sub-app
  useBackHandler(showNotesApp, () => setShowNotesApp(false));
  useBackHandler(showMemoriesApp, () => setShowMemoriesApp(false));
  useBackHandler(showGoalsApp, () => setShowGoalsApp(false));
  useBackHandler(showVoicesApp, () => setShowVoicesApp(false));
  useBackHandler(showAiChatApp, () => setShowAiChatApp(false));
  useBackHandler(showLifeMeter, () => setShowLifeMeter(false));

  // When an item is restored from the Bin (Settings), reload the vault list
  useEffect(() => {
    const reloadVault = () => {
      try {
        const saved = appStorage.getItem('lifebox_vault');
        if (saved) setHiddenVault(JSON.parse(saved));
      } catch (err) {
        console.error('Could not reload vault:', err);
      }
    };
    window.addEventListener('newlife-vault-changed', reloadVault);
    return () => window.removeEventListener('newlife-vault-changed', reloadVault);
  }, []);

  const handleDeleteItem = (indexToDelete) => {
    // Deleted vault items go to the Trash / Bin so they can be restored
    const deletedItem = hiddenVault[indexToDelete];
    if (deletedItem) moveToBin(deletedItem, 'lifebox_vault');
    const updated = hiddenVault.filter((_, idx) => idx !== indexToDelete);
    setHiddenVault(updated);
  };

  // ---------- Home search (header ki search bar se aata hai) ----------
  // Pehle yeh query HomeScreen tak aati to thi, par use hoti nahi thi, isliye search kaam nahi karta tha.
  const query = (searchQuery || '').trim().toLowerCase();
  const local = (word) => (word || '').toLowerCase();
  const TOOL_KEYWORDS = {
    ai: 'ai assistant chat friend bot help ask',
    lifemeter: 'life meter age birthday dob born numbers days lived',
    memory: 'memory memories photo photos camera moment book album ' + local(t.memory),
    notes: 'life box notes note write writing list lists ' + local(t.note),
    voice: 'voice voices audio record recording sound ' + local(t.voice),
    goal: 'goal goals habit streak target daily ' + local(t.goal),
  };
  const toolMatches = (id) => {
    if (!query) return true;
    const words = query.split(/\s+/).filter(Boolean);
    return words.every((w) => TOOL_KEYWORDS[id].includes(w));
  };
  const show = {
    ai: toolMatches('ai'),
    lifemeter: toolMatches('lifemeter'),
    memory: toolMatches('memory'),
    notes: toolMatches('notes'),
    voice: toolMatches('voice'),
    goal: toolMatches('goal'),
  };
  const anyToolShown = Object.values(show).some(Boolean);

  // Full-Screen Modular App Renders
  if (showNotesApp) return <NotesAppScreen onBack={() => setShowNotesApp(false)} />;
  if (showMemoriesApp) return <MemoriesAppScreen onBack={() => setShowMemoriesApp(false)} />;
  if (showGoalsApp) return <GoalsAppScreen onBack={() => setShowGoalsApp(false)} />;
  if (showVoicesApp) return <VoicesAppScreen onBack={() => setShowVoicesApp(false)} />;
  if (showLifeMeter) return <LifeMeterScreen onBack={() => setShowLifeMeter(false)} />;
  if (showAiChatApp) return <AiChatAppScreen onBack={() => setShowAiChatApp(false)} hiddenNotes={hiddenVault} onDeleteNote={handleDeleteItem} />;

  return (
    <div className="space-y-6 pb-28">
      
      {/* Standalone Dynamic Slider Component (search ke waqt chhupta hai, search band hote hi wapas aata hai) */}
      {!query && <LifeSliderCard vaultItems={hiddenVault} />}

      {/* Section Header */}
      <div className="px-1">
        <h2 className="text-xl font-black tracking-wide" style={{ color: c.text }}>{t.quickAdd}</h2>
        <p className="text-xs font-bold mt-0.5" style={{ color: c.textSub }}>{query ? `${t.searchResultsFor} "${searchQuery.trim()}"` : t.captureSec}</p>
      </div>

      {/* Professional Feature Cards Grid linked to Full-Screen Modular Apps */}
      <div className="grid grid-cols-2 gap-4">
        {show.ai && <AiAssistantCard onClick={() => setShowAiChatApp(true)} count={hiddenVault.length} />}
        {show.lifemeter && <LifeMeterCard onClick={() => setShowLifeMeter(true)} />}
        {show.memory && <MemoryCard onClick={() => setShowMemoriesApp(true)} t={t} />}
        {show.notes && <NoteCard onClick={() => setShowNotesApp(true)} t={t} noteCount={noteCount} />}
        {show.voice && <VoiceCard onClick={() => setShowVoicesApp(true)} t={t} />}
        {show.goal && <GoalCard onClick={() => setShowGoalsApp(true)} t={t} />}
      </div>

      {/* Search me kuch na mile to */}
      {query && !anyToolShown && (
        <div style={{ background: c.glass, border: '1px solid ' + c.glassBorder, borderTop: '1px solid ' + c.glassTop, boxShadow: c.glassShadow, borderRadius: '24px', padding: '30px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: '38px' }}>🔍</div>
          <div style={{ fontSize: '14px', fontWeight: '900', color: c.text, marginTop: '8px' }}>{t.noToolFound}</div>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: c.textSub, marginTop: '4px' }}>{t.searchHint}</div>
        </div>
      )}

      {/* Premium Footer Section */}
      {!query && (
      <div style={{ marginTop: '30px', padding: '20px', background: c.glass, borderRadius: '24px', border: '1px solid ' + c.glassBorder, borderTop: '1px solid ' + c.glassTop, boxShadow: c.glassShadow + ', 0 0 22px -8px rgba(251,113,133,0.35)', textAlign: 'center' }}>
        <div style={{ fontSize: '14px', fontWeight: '900', background: 'linear-gradient(135deg, #f43f5e, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '4px' }}>
          {t.vaultFooterTitle}
        </div>
        <div style={{ fontSize: '11px', color: c.textSub, fontWeight: '700' }}>
          {t.vaultFooterSub}
        </div>
      </div>
      )}

    </div>
  );
}
