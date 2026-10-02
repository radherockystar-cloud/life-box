import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Search, Trash2, Save, Mic, Upload, Play, Pause, Square, Share2, FileAudio, X, RotateCcw, Activity } from 'lucide-react';

export default function VoicesAppScreen({ onBack }) {
  const [voices, setVoices] = useState(() => {
    const saved = localStorage.getItem('newlife_vault');
    const items = saved ? JSON.parse(saved) : [];
    return items.filter(i => i.type === 'Voice');
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModal, setIsUploadModal] = useState(false);
  
  // Real Audio Player States
  const [activePlayerItem, setActivePlayerItem] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioInstanceRef = useRef(null);

  useEffect(() => {
    const savedVault = JSON.parse(localStorage.getItem('newlife_vault') || '[]');
    const otherItems = savedVault.filter(i => i.type !== 'Voice');
    localStorage.setItem('newlife_vault', JSON.stringify([...voices, ...otherItems]));
  }, [voices]);

  useEffect(() => {
    return () => {
      if (audioInstanceRef.current) {
        audioInstanceRef.current.pause();
      }
    };
  }, []);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const newEntry = {
        id: Date.now(),
        title: file.name.replace(/\.[^/.]+$/, ""),
        duration: 'Audio file',
        rawSecs: 30,
        date: new Date().toISOString().split('T')[0],
        type: 'Voice',
        audioUrl: reader.result
      };
      setVoices([newEntry, ...voices]);
      setIsUploadModal(false);
    };
  };

  const deleteVoice = (id, e) => {
    if (e) e.stopPropagation();
    const itemToDelete = voices.find(v => v.id === id);
    if (!itemToDelete) return;

    const existingBin = JSON.parse(localStorage.getItem('newlife_bin') || '[]');
    const trashItem = { ...itemToDelete, deletedAt: 'Just now' };
    localStorage.setItem('newlife_bin', JSON.stringify([trashItem, ...existingBin]));
    setVoices(voices.filter(v => v.id !== id));
    closePlayer();
  };

  const handleShare = (item, e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Check out my voice note: ${item.title}`
      }).catch(() => {});
    } else {
      alert(`Voice note "${item.title}" ready to share!`);
    }
  };

  const openPlayer = (item) => {
    if (audioInstanceRef.current) {
      audioInstanceRef.current.pause();
    }

    if (item.audioUrl) {
      const audio = new Audio(item.audioUrl);
      audioInstanceRef.current = audio;
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        alert('Playback error: Unable to play audio source.');
        setIsPlaying(false);
      });

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
    } else {
      alert(`Playing simulated voice: "${item.title}" 🔊`);
      setIsPlaying(true);
    }

    setActivePlayerItem(item);
    setCurrentTime(0);
  };

  const togglePlayPause = () => {
    if (audioInstanceRef.current) {
      if (isPlaying) {
        audioInstanceRef.current.pause();
        setIsPlaying(false);
      } else {
        audioInstanceRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const closePlayer = () => {
    if (audioInstanceRef.current) {
      audioInstanceRef.current.pause();
      audioInstanceRef.current = null;
    }
    setIsPlaying(false);
    setActivePlayerItem(null);
    setCurrentTime(0);
  };

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-200 relative min-h-screen">
      
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2.5 rounded-2xl bg-white border border-purple-100 text-purple-600 shadow-sm cursor-pointer flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-wide">Life Box Voices</h2>
            <p className="text-xs font-bold text-gray-500 mt-0.5">Your uploaded audio & ideas</p>
          </div>
        </div>
        <Mic size={20} className="text-purple-500" />
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-white border border-purple-100 rounded-2xl px-4 py-3 gap-2.5 shadow-sm">
        <Search size={18} className="text-purple-400" />
        <input 
          type="text"
          placeholder="Search voice thoughts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-xs w-full outline-none text-gray-800 placeholder-gray-400 font-bold"
        />
      </div>

      {/* Voice Grid List */}
      <div>
        {voices.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-bold text-xs">No audio files found. Tap + to upload one!</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {voices.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
              <div 
                key={item.id}
                onClick={() => openPlayer(item)}
                className="bg-white border border-purple-100 p-4 rounded-[24px] flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all shadow-[0_10px_25px_rgba(0,0,0,0.04)] min-h-[140px] relative group"
              >
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-600 flex items-center gap-1 w-max">
                    <FileAudio size={10} /> Audio File
                  </span>
                  <h4 className="text-xs font-black text-gray-900 tracking-wide line-clamp-2">{item.title}</h4>
                  <p className="text-[10px] text-purple-600 font-bold flex items-center gap-1">
                    <Play size={10} /> {item.duration}
                  </p>
                </div>
                
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-purple-50">
                  <span className="text-[9px] text-gray-400 font-bold">{item.date}</span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={(e) => handleShare(item, e)} className="text-gray-400 hover:text-purple-600 p-1 cursor-pointer" title="Share">
                      <Share2 size={13} />
                    </button>
                    <button onClick={(e) => deleteVoice(item.id, e)} className="text-gray-400 hover:text-rose-500 p-1 cursor-pointer" title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating (+) Button -> Directly opens Upload File Modal */}
      <div className="fixed bottom-6 right-6 z-30">
        <button 
          onClick={() => setIsUploadModal(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-xl cursor-pointer active:scale-95 transition-all border-none"
          title="Upload Audio File"
        >
          <Plus size={26} className="stroke-[3]" />
        </button>
      </div>

      {/* Music Player Popup Modal */}
      {activePlayerItem && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end animate-in fade-in duration-200">
          <div className="w-full bg-white rounded-t-[36px] p-6 flex flex-col gap-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Activity size={12} className="animate-pulse text-purple-600" /> Now Playing
              </span>
              <button onClick={closePlayer} className="p-2 rounded-full bg-gray-100 text-gray-500 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Sound Wave Animation Effect */}
            <div className="flex items-center justify-center gap-1 h-10 py-1">
              {[40, 70, 30, 90, 60, 100, 50, 80, 40, 70].map((h, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 rounded-full bg-gradient-to-t from-purple-500 to-indigo-500 transition-all duration-300 ${isPlaying ? 'animate-pulse' : 'opacity-40'}`} 
                  style={{ height: isPlaying ? `${Math.max(20, h * Math.random())}%` : '20%' }} 
                />
              ))}
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-gray-900">{activePlayerItem.title}</h3>
              <p className="text-xs font-bold text-purple-600">Added on {activePlayerItem.date}</p>
            </div>

            {/* Seekbar */}
            <div className="space-y-1.5">
              <input 
                type="range" 
                min="0" 
                max={activePlayerItem.rawSecs || 45} 
                value={currentTime} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentTime(val);
                  if (audioInstanceRef.current) audioInstanceRef.current.currentTime = val;
                }}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{activePlayerItem.duration}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-around py-2">
              <button onClick={() => { if (audioInstanceRef.current) audioInstanceRef.current.currentTime = 0; setCurrentTime(0); }} className="p-3 rounded-full bg-purple-50 text-purple-600 cursor-pointer" title="Restart">
                <RotateCcw size={18} />
              </button>
              <button 
                onClick={togglePlayPause}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-lg cursor-pointer"
              >
                {isPlaying ? <Pause size={28} /> : <Play size={28} className="translate-x-0.5" />}
              </button>
              <button onClick={() => { if (audioInstanceRef.current) audioInstanceRef.current.pause(); setIsPlaying(false); setCurrentTime(0); }} className="p-3 rounded-full bg-rose-50 text-rose-600 cursor-pointer" title="Stop">
                <Square size={18} />
              </button>
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-center">
              <button 
                onClick={closePlayer}
                className="text-xs font-black text-gray-700 bg-gray-100 px-8 py-3 rounded-2xl cursor-pointer w-full text-center"
              >
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Audio File Modal */}
      {isUploadModal && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col p-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setIsUploadModal(false)} className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 cursor-pointer">
              <ArrowLeft size={18} />
            </button>
            <h3 className="text-xs font-black tracking-wide text-gray-800">Upload Audio File</h3>
            <div className="w-9" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <label className="w-full max-w-sm h-48 border-2 border-dashed border-indigo-200 rounded-3xl bg-indigo-50/30 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-indigo-50/60 transition-all">
              <div className="p-4 rounded-2xl bg-indigo-100 text-indigo-600 shadow-sm">
                <Upload size={28} />
              </div>
              <span className="text-xs font-black text-gray-700">Tap to select audio file from phone</span>
              <span className="text-[10px] font-bold text-gray-400">MP3, WAV, AAC supported</span>
              <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      )}

    </div>
  );
}
