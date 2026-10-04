import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Trash2, Save, Sparkles } from 'lucide-react';
import { useBackHandler } from '../utils/useBackHandler';

export default function NotesAppScreen({ onBack }) {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('lifebox_keep_notes');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: "Welcome Note", content: "Life Box ke andar apne notes yahan secure rakhein...", date: "2026-09-06" }
    ];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState({ id: null, title: '', content: '' });

  // Back button closes the note editor
  useBackHandler(isEditing, () => setIsEditing(false));

  useEffect(() => {
    localStorage.setItem('lifebox_keep_notes', JSON.stringify(notes));
  }, [notes]);

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!currentNote.title.trim() && !currentNote.content.trim()) return;

    if (currentNote.id) {
      setNotes(notes.map(n => n.id === currentNote.id ? currentNote : n));
    } else {
      const newEntry = {
        id: Date.now(),
        title: currentNote.title || 'Untitled Note',
        content: currentNote.content,
        date: new Date().toISOString().split('T')[0]
      };
      setNotes([newEntry, ...notes]);
    }
    setIsEditing(false);
    setCurrentNote({ id: null, title: '', content: '' });
  };

  // Delete note and push it to Trash / Bin Manager storage
  const deleteNote = (id, e) => {
    e.stopPropagation();
    const noteToDelete = notes.find(n => n.id === id);
    if (!noteToDelete) return;

    // Get existing bin items
    const existingBin = JSON.parse(localStorage.getItem('newlife_bin') || '[]');
    const trashItem = {
      id: noteToDelete.id,
      title: noteToDelete.title,
      content: noteToDelete.content,
      type: "Note",
      date: noteToDelete.date,
      deletedAt: "Just now"
    };

    localStorage.setItem('newlife_bin', JSON.stringify([trashItem, ...existingBin]));

    // Remove from active notes
    setNotes(notes.filter(n => n.id !== id));
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-200 relative min-h-screen">
      
      {/* Top Header inside Screen (No Add Button here now) */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-white border border-rose-100 text-rose-500 shadow-sm hover:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-wide">Life Box Notes</h2>
            <p className="text-xs font-bold text-gray-500 mt-0.5">Your secure personal notepad</p>
          </div>
        </div>
        <Sparkles size={18} className="text-rose-400 animate-pulse" />
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-white border border-rose-100 rounded-2xl px-4 py-3 gap-2.5 shadow-sm">
        <Search size={18} className="text-rose-400" />
        <input 
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-xs w-full outline-none text-gray-800 placeholder-gray-400 font-bold"
        />
      </div>

      {/* Main Notes Grid Area */}
      <div>
        {filteredNotes.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-bold text-xs">
            No notes found. Tap the + button below to create one!
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredNotes.map((note) => (
              <div 
                key={note.id}
                onClick={() => { setCurrentNote(note); setIsEditing(true); }}
                className="bg-white border border-rose-100 p-4 rounded-[24px] flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all shadow-[0_10px_25px_rgba(0,0,0,0.04)] min-h-[140px] relative group"
              >
                <div className="space-y-1.5">
                  <h4 className="text-xs font-black text-rose-600 tracking-wide line-clamp-1">{note.title}</h4>
                  <p className="text-[11px] text-gray-600 font-medium line-clamp-4 leading-relaxed">{note.content}</p>
                </div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-rose-50">
                  <span className="text-[9px] text-gray-400 font-bold">{note.date}</span>
                  <button 
                    onClick={(e) => deleteNote(note.id, e)}
                    className="text-gray-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                    title="Move to Trash"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Note (+) Button at Bottom Right */}
      <div className="fixed bottom-6 right-6 z-30">
        <button 
          onClick={() => { setCurrentNote({ id: null, title: '', content: '' }); setIsEditing(true); }}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-xl glow-rose cursor-pointer active:scale-95 transition-all border-none"
          title="Add Note"
        >
          <Plus size={26} className="stroke-[3]" />
        </button>
      </div>

      {/* Full Edit / Create Note Modal View */}
      {isEditing && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col p-5 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => setIsEditing(false)}
              className="p-2.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <h3 className="text-xs font-black tracking-wide text-gray-800">
              {currentNote.id ? 'Edit Note' : 'New Note'}
            </h3>
            <button 
              onClick={handleSaveNote}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black flex items-center gap-1.5 text-xs cursor-pointer shadow glow-rose border-none"
            >
              <Save size={14} /> Save
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <input 
              type="text"
              placeholder="Note Title..."
              value={currentNote.title}
              onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
              className="bg-transparent text-base font-black text-gray-900 outline-none border-b border-rose-100 pb-2 placeholder-gray-300"
            />
            <textarea 
              placeholder="Write your note details here..."
              value={currentNote.content}
              onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
              className="flex-1 bg-transparent text-xs text-gray-700 outline-none resize-none placeholder-gray-300 font-bold leading-relaxed pt-2"
            />
          </div>
        </div>
      )}

    </div>
  );
}
