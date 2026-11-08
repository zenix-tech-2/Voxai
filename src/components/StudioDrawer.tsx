import React from 'react';
import {
  X,
  Sliders,
  Sparkles,
  Layers,
  Archive,
  Trash2,
  Cpu,
  Ratio,
  Maximize2,
  Mic,
  Activity,
  ArrowRight,
  ExternalLink,
  Check,
} from 'lucide-react';
import { AspectRatio, GenerationEngine, StudioSettings, AppTab } from '../types';

interface StudioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  settings: StudioSettings;
  onUpdateSettings: (settings: Partial<StudioSettings>) => void;
  onOpenVoiceTools: () => void;
  onOpenStatusModal: () => void;
  onClearHistory: () => void;
  historyCount: number;
}

export const StudioDrawer: React.FC<StudioDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  settings,
  onUpdateSettings,
  onOpenVoiceTools,
  onOpenStatusModal,
  onClearHistory,
  historyCount,
}) => {
  if (!isOpen) return null;

  const engines: { id: GenerationEngine; name: string; tag: string }[] = [
    { id: 'flux', name: 'Flux Neural Cloud', tag: 'Free · Photoreal' },
    { id: 'turbo', name: 'SDXL Turbo Fast', tag: 'Free · Instant 1s' },
    { id: 'anime', name: 'Anime Masterpiece', tag: 'Free · Ghibli' },
    { id: 'pixel', name: '16-Bit Pixel Art', tag: 'Free · Retro' },
    { id: 'svg', name: 'Gemini SVG Vector', tag: 'Free Vector' },
    { id: 'gemini', name: 'Gemini 3.1 Studio', tag: 'Paid Key Tier' },
  ];

  const aspectRatios: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4'];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm sm:max-w-md bg-[#0A0E17] border-l border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div>
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Studio Configuration Drawer</h3>
                <span className="text-[11px] text-slate-400">Settings, Engines & Screen Jumps</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-6 text-xs">
            {/* Screen to Screen Jump Menu */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Screen Navigation
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'studio', label: 'Studio Generator' },
                  { id: 'canvas', label: 'Canvas Post-Suite' },
                  { id: 'voice', label: 'Voice Studio (16 Voices)' },
                  { id: 'lab', label: 'Prompt Lab' },
                  { id: 'gallery', label: 'Curated Gallery' },
                  { id: 'history', label: `History (${historyCount})` },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectTab(s.id as any);
                      onClose();
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer truncate ${
                      activeTab === s.id
                        ? 'bg-amber-400 text-slate-950 font-semibold border-amber-400 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}

                <button
                  onClick={() => {
                    onClose();
                    onOpenVoiceTools();
                  }}
                  className="p-2.5 rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 text-left font-medium transition-all cursor-pointer flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5" />
                    <span>Voice Tools</span>
                  </span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Generative Engine Quick Selector */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Active Generative Engine
              </span>
              <div className="space-y-1.5">
                {engines.map((eng) => (
                  <button
                    key={eng.id}
                    onClick={() => onUpdateSettings({ engine: eng.id })}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      settings.engine === eng.id
                        ? 'bg-amber-400/15 border-amber-400/80 text-white font-medium'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold block">{eng.name}</span>
                      <span className="text-[10px] text-slate-500">{eng.tag}</span>
                    </div>
                    {settings.engine === eng.id && (
                      <Check className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Default */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Default Aspect Ratio
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => onUpdateSettings({ aspectRatio: ratio })}
                    className={`py-2 text-center rounded-lg border font-mono text-xs cursor-pointer transition-colors ${
                      settings.aspectRatio === ratio
                        ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="pt-6 mt-6 border-t border-slate-800 space-y-2">
          <button
            onClick={() => {
              onClose();
              onOpenStatusModal();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-between text-xs"
          >
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Vercel & Engine Telemetry</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-400">Ready</span>
          </button>

          <button
            onClick={() => {
              onClearHistory();
              onClose();
            }}
            className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Session Archive</span>
          </button>
        </div>
      </div>
    </div>
  );
};
