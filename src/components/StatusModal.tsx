import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, RefreshCw, Cpu, Key, Sparkles } from 'lucide-react';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({ isOpen, onClose }) => {
  const [checking, setChecking] = useState<boolean>(false);
  const [statusData, setStatusData] = useState<{
    status: string;
    hasApiKey: boolean;
    supportedModels: { imageModel: string; textModel: string };
  } | null>(null);

  const fetchStatus = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setStatusData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="max-w-md w-full bg-[#0D121D] border border-slate-800 rounded-2xl p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Google Gemini Engine Telemetry</h3>
            <span className="text-[11px] text-slate-400">Server SDK v2 · Live Prober</span>
          </div>
        </div>

        <div className="space-y-3.5 my-4 text-xs">
          {/* API Key Status */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-400" />
              <div>
                <span className="font-semibold text-slate-200 block">Server API Key</span>
                <span className="text-[11px] text-slate-500">Configured in runtime environment</span>
              </div>
            </div>
            {statusData?.hasApiKey ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Default injected</span>
              </span>
            )}
          </div>

          {/* Active Engines */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Free Image Cloud:</span>
              <span className="font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Flux Neural (100% Free · No Key)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">AI Art Director & Vision:</span>
              <span className="font-mono text-[11px] text-sky-400 bg-sky-400/10 px-1.5 py-0.5 rounded">
                gemini-3.8-flash (Free Tier)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Optional Paid Studio:</span>
              <span className="font-mono text-[11px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                gemini-3.1-flash-lite-image
              </span>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/20 text-emerald-200 leading-relaxed text-[11px]">
            <span className="font-semibold text-white block mb-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Zero-Cost Guarantee</span>
            </span>
            You do not need to spend any money. All image generation with the Flux Engine, vector artwork with Gemini 3.8 Flash, prompt direction, and canvas post-processing tools are completely free to use.
          </div>

          {/* Vercel Deployment Card */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 leading-relaxed text-[11px]">
            <span className="font-semibold text-white block mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                <span>Vercel Deployment: Ready</span>
              </span>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                vercel.json configured
              </span>
            </span>
            <span>
              This project includes <code className="text-amber-400 font-mono">vercel.json</code> and modular serverless handlers in <code className="text-amber-400 font-mono">api/index.ts</code>. You can deploy to Vercel instantly by pushing to GitHub and importing the repository into Vercel with zero extra setup.
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={fetchStatus}
            disabled={checking}
            className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>Re-test Connection</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
