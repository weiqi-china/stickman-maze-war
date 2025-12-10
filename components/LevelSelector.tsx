import React, { useState } from 'react';
import { SKINS } from '../constants';
import { Skin } from '../types';
import { Lock, Settings, Save, Download, Upload, RefreshCw, X, Copy, Check } from 'lucide-react';
import { Stickman } from './Stickman';

interface LevelSelectorProps {
  unlockedLevel: number;
  selectedSkin: Skin;
  onSelectLevel: (level: number) => void;
  onSelectSkin: (skin: Skin) => void;
  onResetProgress: () => void;
  onImportSave: (data: string) => boolean;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  unlockedLevel,
  selectedSkin,
  onSelectLevel,
  onSelectSkin,
  onResetProgress,
  onImportSave,
}) => {
  const [activeTab, setActiveTab] = React.useState<'levels' | 'skins'>('levels');
  const [showSettings, setShowSettings] = useState(false);
  const [importString, setImportString] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [importFeedback, setImportFeedback] = useState<'success' | 'error' | null>(null);

  const getSaveString = () => {
    const data = { l: unlockedLevel };
    return btoa(JSON.stringify(data));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getSaveString());
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleImport = () => {
    if (onImportSave(importString)) {
      setImportFeedback('success');
      setTimeout(() => {
        setImportFeedback(null);
        setImportString('');
        setShowSettings(false);
      }, 1000);
    } else {
      setImportFeedback('error');
      setTimeout(() => setImportFeedback(null), 2000);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure? This will lock all levels and reset progress.")) {
      onResetProgress();
      setShowSettings(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto p-4 bg-gray-50 text-gray-800 relative">
      {/* Settings Button */}
      <button 
        onClick={() => setShowSettings(true)}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-800 transition-colors"
      >
        <Settings size={24} />
      </button>

      {/* Main Title */}
      <div className="mb-8 text-center mt-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">
          Stickman<br/><span className="text-red-600">Maze War</span>
        </h1>
        <p className="text-sm text-gray-500 font-medium">Escape the Police • Reach the Exit</p>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Save size={18} /> Save Management
              </h3>
              <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-gray-200 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Export Section */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Export Save Code</label>
                <div className="flex gap-2">
                  <div className="bg-gray-100 p-3 rounded-lg flex-1 text-xs font-mono truncate border">
                    {getSaveString()}
                  </div>
                  <button 
                    onClick={handleCopy}
                    className={`p-3 rounded-lg text-white font-bold transition-all ${copyFeedback ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {copyFeedback ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Copy this code to save or transfer progress.</p>
              </div>

              {/* Import Section */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Import Save Code</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={importString}
                    onChange={(e) => setImportString(e.target.value)}
                    placeholder="Paste save code..."
                    className="flex-1 p-3 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button 
                    onClick={handleImport}
                    className={`p-3 rounded-lg text-white font-bold transition-all ${
                      importFeedback === 'success' ? 'bg-green-500' : 
                      importFeedback === 'error' ? 'bg-red-500' : 'bg-gray-800 hover:bg-black'
                    }`}
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>

              <hr />

              {/* Reset Section */}
              <div>
                <button 
                  onClick={handleReset}
                  className="w-full py-3 border-2 border-red-100 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw size={18} /> Reset All Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex w-full mb-6 bg-gray-200 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('levels')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'levels' ? 'bg-white shadow-sm text-black' : 'text-gray-500'
          }`}
        >
          Levels
        </button>
        <button
          onClick={() => setActiveTab('skins')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'skins' ? 'bg-white shadow-sm text-black' : 'text-gray-500'
          }`}
        >
          Skins
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {activeTab === 'levels' ? (
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 30 }).map((_, i) => {
              const levelNum = i + 1;
              const isLocked = levelNum > unlockedLevel;
              return (
                <button
                  key={levelNum}
                  disabled={isLocked}
                  onClick={() => onSelectLevel(levelNum)}
                  className={`
                    aspect-square rounded-xl flex flex-col items-center justify-center relative
                    transition-all active:scale-95 border-2
                    ${isLocked 
                      ? 'bg-gray-100 border-gray-200 text-gray-300' 
                      : 'bg-white border-gray-800 hover:bg-gray-50 text-gray-900 shadow-sm'}
                  `}
                >
                  {isLocked ? (
                    <Lock size={16} />
                  ) : (
                    <span className="text-lg font-bold">{levelNum}</span>
                  )}
                  {!isLocked && levelNum < unlockedLevel && (
                    <div className="absolute bottom-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {SKINS.map((skin) => {
              const isLocked = unlockedLevel <= skin.unlockLevel && skin.unlockLevel > 0;
              const isSelected = selectedSkin.id === skin.id;

              return (
                <button
                  key={skin.id}
                  disabled={isLocked}
                  onClick={() => onSelectSkin(skin)}
                  className={`
                    relative p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all
                    ${isSelected ? 'border-red-500 bg-red-50 ring-2 ring-red-200 ring-offset-2' : 'border-gray-200 bg-white'}
                    ${isLocked ? 'opacity-60 grayscale' : 'hover:border-gray-400'}
                  `}
                >
                  <div className="w-16 h-16">
                    <Stickman color={skin.color} />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-sm">{skin.name}</div>
                    {isLocked && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                        <Lock size={10} /> Lvl {skin.unlockLevel}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center text-xs text-gray-400">
        V1.2 • Stickman Maze War
      </div>
    </div>
  );
};