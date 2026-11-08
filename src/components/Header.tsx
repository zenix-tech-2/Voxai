import React from 'react';
import { Mic2, Radio, BookOpen, Volume2, Globe2, Dna, Sparkles, Film } from 'lucide-react';

export type StudioTab = 'editor' | 'studio' | 'catalog' | 'templates';

interface HeaderProps {
  activeTab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
  voiceCount: number;
  onOpenCloningModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  voiceCount,
  onOpenCloningModal,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-rose-500 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Mic2 className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-tight">
                VoxStudio <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">AI</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Voice & Video Editor Pro
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Voix Africaines 🌍 • Montage Vidéo CapCut Pro 🎬 • Clonage Vocal 🧬
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <div className="flex items-center p-1 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => onTabChange('editor')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'editor'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Éditeur Vidéo (CapCut Pro)</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('studio')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'studio'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Studio Voix-Off</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('catalog')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Voix ({voiceCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('templates')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'templates'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Modèles</span>
          </button>
        </div>

        {/* Right Info: Voice Cloning Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenCloningModal}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Dna className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Cloner ma Voix</span>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/30 px-2.5 py-1.5 rounded-xl border border-emerald-800/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-300">100% Gratuit & Sans Carte</span>
          </div>
        </div>
      </div>
    </header>
  );
};
