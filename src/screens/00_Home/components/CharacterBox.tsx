import React, { useState, useRef } from 'react';
import { useInteractionStore } from '../store/useInteractionStore';
import type { CharacterProfile } from '../types';
import { DEFAULT_EMOTION_PROMPTS } from '../data/constants';
import { Users, Plus, X, User, Download, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';

const CharacterBox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [newName, setNewName] = useState('');
  const [newPrompt, setNewPrompt] = useState('');

  const {
    characterList,
    activeCharacterId,
    switchCharacter,
    addCharacter,
    setGenerating,
    isGeneratingImages
  } = useInteractionStore();

  const handleCreate = () => {
    if (!newName || !newPrompt) return;

    const newChar: CharacterProfile = {
      id: `char_${Date.now()}`,
      design: {
        name: newName,
        base_prompt: newPrompt + ", green screen background",
        negative_prompt: "realistic, 3d, low quality, bad anatomy, text, watermark, messy lines, complex background"
      },
      emotion_prompts: DEFAULT_EMOTION_PROMPTS,
      images: {},
      dialogues: []
    };

    addCharacter(newChar);
    setIsCreating(false);
    setNewName('');
    setNewPrompt('');
  };

  const downloadJson = (char: CharacterProfile) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(char));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${char.design.name.replace(/\s+/g, '_')}_data.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const downloadImages = (char: CharacterProfile) => {
    Object.entries(char.images).forEach(([emotion, b64], index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = b64;
        link.download = `${char.design.name}_${emotion}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 500); // Stagger downloads
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic validation
        if (json.id && json.design && json.images) {
          addCharacter(json);
          setIsOpen(false);
        } else {
          alert("Invalid character file format.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to parse file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`relative z-30 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30 transition-all active:scale-95 shadow-lg group ${isOpen ? 'opacity-0' : 'opacity-100'}`}
      >
        <Users className="text-blue-300" />
        <span className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-900" />
      </button>

      <div className={`fixed inset-0 z-50 pointer-events-none overflow-hidden ${isOpen ? 'pointer-events-auto' : ''}`}>
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsOpen(false)} />

        <div className={`absolute top-0 left-0 h-full w-96 bg-slate-950/95 border-r border-white/10 shadow-2xl transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
            <h3 className="text-white text-lg font-bold tracking-widest flex items-center gap-2">
              <Users className="text-blue-400 w-5 h-5" /> CHARACTERS
            </h3>
            <div className="flex gap-2">
              <label className="p-2 hover:bg-white/10 rounded-full cursor-pointer" title="Import JSON">
                <Upload className="text-white/60 w-5 h-5" />
                <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
              </label>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X className="text-white/60" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Character List */}
            {!isCreating && (
              <>
                {characterList.map((char) => {
                  const isActive = activeCharacterId === char.id;
                  const imageCount = Object.keys(char.images).length;
                  const totalEmotions = char.emotion_prompts.length;
                  const isMissingImages = imageCount < totalEmotions;

                  return (
                    <div key={char.id} className={`rounded-xl border transition-all overflow-hidden ${isActive ? 'bg-blue-500/10 border-blue-500' : 'bg-white/5 border-white/10'}`}>
                      <button
                        onClick={() => switchCharacter(char.id)}
                        className="w-full p-3 text-left flex items-center gap-4 hover:bg-white/5"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-black/50 border border-white/20 flex-shrink-0 relative">
                          {char.images['normal'] ? (
                            <img src={char.images['normal']} alt={char.design.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20"><User size={20} /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-bold truncate">{char.design.name}</div>
                          <div className="text-[10px] text-white/50 flex items-center gap-2">
                            <span>{imageCount}/{totalEmotions} poses</span>
                            {isMissingImages && <span className="text-yellow-500 font-bold">⚠ Incomplete</span>}
                          </div>
                        </div>
                        {isActive && <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse flex-shrink-0" />}
                      </button>

                      {/* Actions Row */}
                      <div className="flex border-t border-white/10 divide-x divide-white/10">
                        {isActive && isMissingImages && (
                          <button
                            onClick={() => setGenerating(true)}
                            disabled={isGeneratingImages}
                            className="flex-1 py-2 text-[10px] font-bold text-yellow-400 hover:bg-yellow-500/10 flex items-center justify-center gap-1 disabled:opacity-50"
                          >
                            <Sparkles size={12} />
                            GENERATE
                          </button>
                        )}
                        <button
                          onClick={() => downloadJson(char)}
                          className="flex-1 py-2 text-[10px] font-bold text-white/60 hover:bg-white/10 flex items-center justify-center gap-1"
                          title="Export Character Data (JSON)"
                        >
                          <Download size={12} />
                          JSON
                        </button>
                        {imageCount > 0 && (
                          <button
                            onClick={() => downloadImages(char)}
                            className="flex-1 py-2 text-[10px] font-bold text-white/60 hover:bg-white/10 flex items-center justify-center gap-1"
                            title="Download Images (PNG)"
                          >
                            <ImageIcon size={12} />
                            IMGS
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full py-4 border-2 border-dashed border-white/20 rounded-xl text-white/40 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex flex-col items-center gap-2"
                >
                  <Plus />
                  <span className="text-xs font-bold uppercase tracking-widest">Create New Character</span>
                </button>
              </>
            )}

            {/* Create Form */}
            {isCreating && (
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <h4 className="text-white font-bold text-sm border-b border-white/10 pb-2">NEW CHARACTER PROFILE</h4>

                <div className="space-y-1">
                  <label className="text-[10px] text-white/60 uppercase font-bold">Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                    placeholder="e.g. Asuka"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-white/60 uppercase font-bold">Appearance Prompt</label>
                  <textarea
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    className="w-full h-32 bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none resize-none"
                    placeholder="e.g. Red hair, twin tails, tsundere eyes, school uniform..."
                  />
                  <p className="text-[9px] text-white/30">Detailed English prompts work best.</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={() => setIsCreating(false)} className="flex-1 py-2 text-xs text-white/60 hover:bg-white/10 rounded-lg">Cancel</button>
                  <button onClick={handleCreate} className="flex-1 py-2 text-xs bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500">Create</button>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-black/20 text-[10px] text-white/30 text-center border-t border-white/5">
            Tip: Export characters to save them locally.<br />
            Browser storage is temporary.
          </div>
        </div>
      </div>
    </>
  );
};

export default CharacterBox;