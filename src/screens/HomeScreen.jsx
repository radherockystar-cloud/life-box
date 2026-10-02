import React, { useState, useEffect } from 'react';
import MemoryModal from '../components/MemoryModal';
import NoteModal from '../components/NoteModal';
import VoiceModal from '../components/VoiceModal';
import GoalModal from '../components/GoalModal';
import ChatAssistantModal from '../components/ChatAssistantModal';
import NotesAppScreen from './NotesAppScreen';
import MemoriesAppScreen from './MemoriesAppScreen';
import GoalsAppScreen from './GoalsAppScreen';
import VoicesAppScreen from './VoicesAppScreen';
import AiChatAppScreen from './AiChatAppScreen';
import { translations } from '../utils/translations';

// Modular Cards & Slider
import LifeSliderCard from '../components/cards/LifeSliderCard';
import AiAssistantCard from '../components/cards/AiAssistantCard';
import QuickAddCard from '../components/cards/QuickAddCard';
import MemoryCard from '../components/cards/MemoryCard';
import NoteCard from '../components/cards/NoteCard';
import VoiceCard from '../components/cards/VoiceCard';
import GoalCard from '../components/cards/GoalCard';

export default function HomeScreen({ currentLang, onSubAppToggle }) {
  const [activeModal, setActiveModal] = useState(null);
  const [showNotesApp, setShowNotesApp] = useState(false);
  const [showMemoriesApp, setShowMemoriesApp] = useState(false);
  const [showGoalsApp, setShowGoalsApp] = useState(false);
  const [showVoicesApp, setShowVoicesApp] = useState(false);
  const [showAiChatApp, setShowAiChatApp] = useState(false);
  
  const t = translations[currentLang] || translations.en;

  const [hiddenVault, setHiddenVault] = useState(() => {
    const saved = localStorage.getItem('lifebox_vault');
    return saved ? JSON.parse(saved) : [
      { title: "Rahul's Birthday", content: "Rahul ka birthday 10 October ko hota hai.", type: "Note", date: "2026-10-10" },
      { title: "Coding Streak", content: "Roz coding seekhni hai.", type: "Goal", date: "2026-09-06" }
    ];
  });

  useEffect(() => {
    localStorage.setItem('lifebox_vault', JSON.stringify(hiddenVault));
  }, [hiddenVault]);

  // Inform App.jsx when any sub-app is open/closed to hide outer headers/nav
  useEffect(() => {
    if (onSubAppToggle) {
      onSubAppToggle(showNotesApp || showMemoriesApp || showGoalsApp || showVoicesApp || showAiChatApp);
    }
  }, [showNotesApp, showMemoriesApp, showGoalsApp, showVoicesApp, showAiChatApp, onSubAppToggle]);

  const handleSaveItem = (type, data) => {
    const newItem = { type, date: new Date().toISOString().split('T')[0], ...data };
    setHiddenVault([newItem, ...hiddenVault]);
  };

  const handleDeleteItem = (indexToDelete) => {
    const updated = hiddenVault.filter((_, idx) => idx !== indexToDelete);
    setHiddenVault(updated);
  };

  // Full-Screen Modular App Renders
  if (showNotesApp) return <NotesAppScreen onBack={() => setShowNotesApp(false)} />;
  if (showMemoriesApp) return <MemoriesAppScreen onBack={() => setShowMemoriesApp(false)} />;
  if (showGoalsApp) return <GoalsAppScreen onBack={() => setShowGoalsApp(false)} />;
  if (showVoicesApp) return <VoicesAppScreen onBack={() => setShowVoicesApp(false)} />;
  if (showAiChatApp) return <AiChatAppScreen onBack={() => setShowAiChatApp(false)} hiddenNotes={hiddenVault} onDeleteNote={handleDeleteItem} />;

  return (
    <div className="space-y-6 pb-28">
      
      {/* Standalone Dynamic Slider Component */}
      <LifeSliderCard vaultItems={hiddenVault} />

      {/* Section Header */}
      <div className="px-1">
        <h2 className="text-xl font-black text-gray-900 tracking-wide">{t.quickAdd}</h2>
        <p className="text-xs font-bold text-gray-500 mt-0.5">{t.captureSec}</p>
      </div>

      {/* Professional Feature Cards Grid linked to Full-Screen Modular Apps */}
      <div className="grid grid-cols-2 gap-4">
        <AiAssistantCard onClick={() => setShowAiChatApp(true)} count={hiddenVault.length} />
        <QuickAddCard onClick={() => setActiveModal('memory')} t={t} />
        <MemoryCard onClick={() => setShowMemoriesApp(true)} t={t} />
        <NoteCard onClick={() => setShowNotesApp(true)} t={t} />
        <VoiceCard onClick={() => setShowVoicesApp(true)} t={t} />
        <GoalCard onClick={() => setShowGoalsApp(true)} t={t} />
      </div>

      {/* Quick Add Modals */}
      <MemoryModal isOpen={activeModal === 'memory'} onClose={() => setActiveModal(null)} onSave={(data) => handleSaveItem('Memory', data)} />
      <NoteModal isOpen={activeModal === 'note'} onClose={() => setActiveModal(null)} onSave={(data) => handleSaveItem('Note', data)} />
      <VoiceModal isOpen={activeModal === 'voice'} onClose={() => setActiveModal(null)} onSave={(data) => handleSaveItem('Voice', data)} />
      <GoalModal isOpen={activeModal === 'goal'} onClose={() => setActiveModal(null)} onSave={(data) => handleSaveItem('Goal', data)} />

    </div>
  );
}
