import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Trash2, Save, Image as ImageIcon, Video, Share2, Download, X, Calendar, Tag, Heart } from 'lucide-react';

export default function MemoriesAppScreen({ onBack }) {
  const [memories, setMemories] = useState(() => {
    const saved = localStorage.getItem('newlife_vault');
    const items = saved ? JSON.parse(saved) : [];
    return items.filter(i => i.type === 'Memory');
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentMemory, setCurrentMemory] = useState({ id: null, title: '', desc: '', tag: 'Milestone', mediaUrl: '', mediaType: 'image' });
  const [activeViewer, setActiveViewer] = useState(null);

  useEffect(() => {
    const savedVault = JSON.parse(localStorage.getItem('newlife_vault') || '[]');
    const otherItems = savedVault.filter(i => i.type !== 'Memory');
    localStorage.setItem('newlife_vault', JSON.stringify([...memories, ...otherItems]));
  }, [memories]);

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setCurrentMemory(prev => ({
        ...prev,
        mediaUrl: reader.result,
        mediaType: isVideo ? 'video' : 'image'
      }));
    };
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!currentMemory.title.trim()) return;

    if (currentMemory.id) {
      setMemories(memories.map(m => m.id === currentMemory.id ? currentMemory : m));
    } else {
      const newEntry = {
        id: Date.now(),
        title: currentMemory.title,
        desc: currentMemory.desc || '',
        tag: currentMemory.tag || 'Milestone',
        mediaUrl: currentMemory.mediaUrl || '',
        mediaType: currentMemory.mediaType || 'image',
        date: new Date().toISOString().split('T')[0],
        type: 'Memory'
      };
      setMemories([newEntry, ...memories]);
    }
    setIsEditing(false);
    setCurrentMemory({ id: null, title: '', desc: '', tag: 'Milestone', mediaUrl: '', mediaType: 'image' });
  };

  const deleteMemory = (id, e) => {
    if (e) e.stopPropagation();
    const itemToDelete = memories.find(m => m.id === id);
    if (!itemToDelete) return;

    const existingBin = JSON.parse(localStorage.getItem('newlife_bin') || '[]');
    const trashItem = { ...itemToDelete, deletedAt: 'Just now' };
    localStorage.setItem('newlife_bin', JSON.stringify([trashItem, ...existingBin]));
    setMemories(memories.filter(m => m.id !== id));
    setActiveViewer(null);
  };

  const handleShare = (item, e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `${item.title} - ${item.desc}`
      }).catch(() => {});
    } else {
      alert(`Memory "${item.title}" ready to share!`);
    }
  };

  const filtered = memories.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-200 relative min-h-screen">
      
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2.5 rounded-2xl bg-white border border-rose-100 text-rose-500 shadow-sm cursor-pointer flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-wide">Memories Vault</h2>
            <p className="text-xs font-bold text-gray-500 mt-0.5">Cherish your special moments & milestones</p>
          </div>
        </div>
        <Heart size={22} className="text-rose-500 fill-rose-500 animate-pulse" />
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-white border border-rose-100 rounded-2xl px-4 py-3 gap-2.5 shadow-sm">
        <Search size={18} className="text-rose-400" />
        <input 
          type="text"
          placeholder="Search memories or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-xs w-full outline-none text-gray-800 placeholder-gray-400 font-bold"
        />
      </div>

      {/* Memories Grid List */}
      <div>
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-bold text-xs">No memories found. Tap + to add one!</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => (
              <div 
                key={item.id}
                onClick={() => setActiveViewer(item)}
                className="bg-white border border-rose-100 rounded-[24px] overflow-hidden flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all shadow-[0_10px_25px_rgba(0,0,0,0.04)] relative group"
              >
                {item.mediaUrl && (
                  <div className="w-full h-32 bg-rose-50 relative overflow-hidden">
                    {item.mediaType === 'video' ? (
                      <video src={item.mediaUrl} className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                )}
                <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-600 inline-block mb-1">
                      {item.tag}
                    </span>
                    <h4 className="text-xs font-black text-gray-900 tracking-wide line-clamp-1">{item.title}</h4>
                    <p className="text-[11px] text-gray-600 font-medium line-clamp-2 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-rose-50 mt-2">
                    <span className="text-[9px] text-gray-400 font-bold">{item.date}</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={(e) => handleShare(item, e)} className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer">
                        <Share2 size={13} />
                      </button>
                      <button onClick={(e) => deleteMemory(item.id, e)} className="text-gray-400 hover:text-rose-500 p-1 cursor-pointer">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating (+) Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button 
          onClick={() => { setCurrentMemory({ id: null, title: '', desc: '', tag: 'Milestone', mediaUrl: '', mediaType: 'image' }); setIsEditing(true); }}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-xl cursor-pointer active:scale-95 transition-all border-none"
        >
          <Plus size={26} className="stroke-[3]" />
        </button>
      </div>

      {/* Create / Edit Memory Modal */}
      {isEditing && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col p-5 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setIsEditing(false)} className="p-2.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 cursor-pointer">
              <ArrowLeft size={18} />
            </button>
            <h3 className="text-xs font-black tracking-wide text-gray-800">{currentMemory.id ? 'Edit Memory' : 'New Memory'}</h3>
            <button onClick={handleSave} className="px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black flex items-center gap-1.5 text-xs cursor-pointer shadow border-none">
              <Save size={14} /> Save
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-3 overflow-y-auto pb-6">
            <input 
              type="text"
              placeholder="Memory Title..."
              value={currentMemory.title}
              onChange={(e) => setCurrentMemory({ ...currentMemory, title: e.target.value })}
              className="bg-transparent text-base font-black text-gray-900 outline-none border-b border-rose-100 pb-2 placeholder-gray-300"
            />
            <select 
              value={currentMemory.tag}
              onChange={(e) => setCurrentMemory({ ...currentMemory, tag: e.target.value })}
              className="bg-rose-50/50 border border-rose-100 rounded-xl p-2.5 text-xs font-bold text-gray-700 outline-none"
            >
              <option value="Milestone">Milestone</option>
              <option value="Friends">Friends & Love</option>
              <option value="Project">Project / Code</option>
              <option value="Special">Special Moment</option>
            </select>

            {/* Media Upload Box */}
            <label className="w-full h-36 border-2 border-dashed border-rose-200 rounded-2xl bg-rose-50/30 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-rose-50/60 transition-all overflow-hidden relative">
              {currentMemory.mediaUrl ? (
                currentMemory.mediaType === 'video' ? (
                  <video src={currentMemory.mediaUrl} className="w-full h-full object-cover" />
                ) : (
                  <img src={currentMemory.mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                )
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-rose-100 text-rose-600">
                    <ImageIcon size={22} />
                  </div>
                  <span className="text-xs font-black text-gray-700">Tap to upload Photo or Video</span>
                  <span className="text-[10px] font-bold text-gray-400">JPG, PNG, MP4 supported</span>
                </>
              )}
              <input type="file" accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />
            </label>

            <textarea 
              placeholder="Write memory description..."
              value={currentMemory.desc}
              onChange={(e) => setCurrentMemory({ ...currentMemory, desc: e.target.value })}
              className="flex-1 min-h-[120px] bg-transparent text-xs text-gray-700 outline-none resize-none placeholder-gray-300 font-bold leading-relaxed pt-2"
            />
          </div>
        </div>
      )}

      {/* Full Media Viewer Modal */}
      {activeViewer && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col justify-between p-5 animate-in fade-in duration-200">
          <div className="flex justify-between items-center text-white">
            <span className="text-xs font-black uppercase bg-white/20 px-3 py-1 rounded-full">{activeViewer.tag}</span>
            <button onClick={() => setActiveViewer(null)} className="p-2 rounded-full bg-white/20 text-white cursor-pointer">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center my-4 overflow-hidden rounded-3xl bg-black/40">
            {activeViewer.mediaUrl ? (
              activeViewer.mediaType === 'video' ? (
                <video src={activeViewer.mediaUrl} controls className="max-h-[60vh] w-full object-contain rounded-2xl" />
              ) : (
                <img src={activeViewer.mediaUrl} alt={activeViewer.title} className="max-h-[60vh] w-full object-contain rounded-2xl" />
              )
            ) : (
              <div className="text-white/60 text-xs font-bold">No media attached</div>
            )}
            <div className="w-full p-4 text-white text-center space-y-1">
              <h3 className="text-sm font-black">{activeViewer.title}</h3>
              <p className="text-xs text-rose-200 font-medium">{activeViewer.desc}</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <a 
              href={activeViewer.mediaUrl || '#'} 
              download={`${activeViewer.title}.jpg`}
              className="flex-1 py-3 rounded-2xl bg-white/20 text-white font-black text-xs flex items-center justify-center gap-2 hover:bg-white/30 transition-all text-decoration-none"
            >
              <Download size={16} /> Download
            </a>
            <button 
              onClick={(e) => deleteMemory(activeViewer.id, e)}
              className="py-3 px-6 rounded-2xl bg-rose-500 text-white font-black text-xs flex items-center gap-2 shadow-lg cursor-pointer border-none"
            >
              <Trash2 size={16} /> Delete to Bin
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
