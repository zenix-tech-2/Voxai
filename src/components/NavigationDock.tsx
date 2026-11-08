import React from 'react';
import {
  Sparkles,
  Sliders,
  Volume2,
  Wand2,
  Compass,
  Archive,
  Mic,
  Menu,
} from 'lucide-react';
import { AppTab } from '../types';

interface NavigationDockProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenVoiceTools: () => void;
  onOpenDrawer: () => void;
  historyCount: number;
  isListening: boolean;
}

export const NavigationDock: React.FC<NavigationDockProps> = ({
  activeTab,
  onSelectTab,
  onOpenVoiceTools,
  onOpenDrawer,
  historyCount,
  isListening,
}) => {
  const navItems = [
    {
      id: 'studio' as const,
      label: 'Studio',
      icon: Sparkles,
      keyHint: '1',
    },
    {
      id: 'canvas' as const,
      label: 'Canvas Suite',
      icon: Sliders,
      keyHint: '2',
    },
    {
      id: 'voice' as const,
      label: 'Voice Studio',
      icon: Volume2,
      keyHint: '3',
    },
    {
      id: 'lab' as const,
      label: 'Prompt Lab',
      icon: Wand2,
      keyHint: '4',
    },
    {
      id: 'gallery' as const,
      label: 'Gallery',
      icon: Compass,
      keyHint: '5',
    },
    {
      id: 'history' as const,
      label: 'History',
      icon: Archive,
      badge: historyCount > 0 ? historyCount : undefined,
      keyHint: '6',
    },
  ];

  return (
    <nav
      aria-label="Screen Navigation"
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0B0F19]/90 border border-slate-800/90 backdrop-blur-xl shadow-2xl rounded-2xl p-1.5 flex items-center gap-1 sm:gap-2 max-w-[96vw] ring-1 ring-white/10"
    >
      {/* Screen Navigation Buttons */}
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`relative px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              isActive
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'fill-slate-950 stroke-slate-950' : ''}`} />
            <span className="hidden md:inline">{item.label}</span>
            {item.badge !== undefined && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}

      <div className="w-[1px] h-6 bg-slate-800 mx-0.5" />

      {/* Voice Tools Trigger Button */}
      <button
        onClick={onOpenVoiceTools}
        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
          isListening
            ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
            : 'text-amber-400 hover:bg-amber-400/10 border border-amber-400/20'
        }`}
        title="Open Voice Tools & Speech Dictation"
      >
        <Mic className="w-4 h-4" />
        <span className="hidden sm:inline">Voice</span>
      </button>

      {/* Drawer Options Trigger Button */}
      <button
        onClick={onOpenDrawer}
        className="px-2.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-900/80 transition-colors cursor-pointer flex items-center gap-1"
        title="Open Options Drawer"
      >
        <Menu className="w-4 h-4" />
        <span className="hidden lg:inline text-[11px]">Options</span>
      </button>
    </nav>
  );
};
