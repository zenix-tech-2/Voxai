import { Sparkles, Activity, Mic, Menu, Volume2 } from 'lucide-react';
import { AppTab } from '../types';

interface HeaderProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenStatusModal: () => void;
  onQuickGenerate: () => void;
  onOpenDrawer: () => void;
  onOpenVoiceTools: () => void;
  isListening: boolean;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenStatusModal,
  onQuickGenerate,
  onOpenDrawer,
  onOpenVoiceTools,
  isListening,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090D14]/90 backdrop-blur-md px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element in display face) */}
        <a
          href="#studio"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('studio');
          }}
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 flex items-center justify-center text-slate-950 shadow-sm shadow-amber-500/20">
            <Sparkles className="w-4 h-4 fill-slate-950" />
          </div>
          <span>LUMEN STUDIO</span>
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => onSelectTab('studio')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'studio'
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : 'hover:text-slate-200'
            }`}
          >
            Studio
          </button>
          <button
            onClick={() => onSelectTab('canvas')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'canvas'
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : 'hover:text-slate-200'
            }`}
          >
            Canvas Suite
          </button>
          <button
            onClick={() => onSelectTab('voice')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              activeTab === 'voice'
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : 'hover:text-slate-200'
            }`}
          >
            <span>Voice Studio</span>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
              16 Voices
            </span>
          </button>
          <button
            onClick={() => onSelectTab('lab')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'lab'
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : 'hover:text-slate-200'
            }`}
          >
            Prompt Lab
          </button>
          <button
            onClick={() => onSelectTab('gallery')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'gallery'
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : 'hover:text-slate-200'
            }`}
          >
            Curated Gallery
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : 'hover:text-slate-200'
            }`}
          >
            <span>History</span>
            {historyCount > 0 && (
              <span className="text-[11px] font-mono tabular-nums text-slate-400">
                ({historyCount})
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Voice Tools Trigger */}
          <button
            onClick={onOpenVoiceTools}
            className={`p-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30'
            }`}
            title="Open Voice Tools & Microphone"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Engine & Vercel Telemetry */}
          <button
            onClick={onOpenStatusModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="Inspect 100% Free Engine Status & Vercel Deployment"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Free · Vercel Ready</span>
          </button>

          {/* Primary New Action */}
          <button
            onClick={onQuickGenerate}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm shadow-amber-500/25 transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>New Synthesis</span>
          </button>

          {/* Drawer Toggle */}
          <button
            onClick={onOpenDrawer}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            title="Open Options Drawer"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
