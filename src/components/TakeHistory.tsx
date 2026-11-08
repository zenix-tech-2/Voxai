import React, { useState } from 'react';
import { TakeItem } from '../utils/speechEngine';
import { Play, Pause, Download, Trash2, Copy, Check, Clock, Radio, Film } from 'lucide-react';

interface TakeHistoryProps {
  takes: TakeItem[];
  onClearTakes: () => void;
  onRestoreTake: (take: TakeItem) => void;
  onCreateVideo?: (take: TakeItem) => void;
}

export const TakeHistory: React.FC<TakeHistoryProps> = ({
  takes,
  onClearTakes,
  onRestoreTake,
  onCreateVideo,
}) => {
  const [playingTakeId, setPlayingTakeId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleTogglePlay = (take: TakeItem) => {
    if (playingTakeId === take.id) {
      setPlayingTakeId(null);
      const audioEl = document.getElementById('history-audio-player') as HTMLAudioElement;
      if (audioEl) audioEl.pause();
    } else {
      setPlayingTakeId(take.id);
      if (take.audioUrl) {
        const audioEl = document.getElementById('history-audio-player') as HTMLAudioElement;
        if (audioEl) {
          audioEl.src = take.audioUrl;
          audioEl.play().catch(() => {});
          audioEl.onended = () => setPlayingTakeId(null);
        }
      }
    }
  };

  const handleCopyScript = (take: TakeItem) => {
    navigator.clipboard.writeText(take.script);
    setCopiedId(take.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadTake = (take: TakeItem) => {
    if (!take.audioUrl) return;
    const a = document.createElement('a');
    a.href = take.audioUrl;
    a.download = `take_${take.voice.id}_${take.id}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (takes.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 md:p-6 backdrop-blur-md shadow-sm">
      <audio id="history-audio-player" className="hidden" />

      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-slate-100 text-sm">
            Historique des Prises Publicitaires (Session Takes & Recordings)
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {takes.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onClearTakes}
          className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Effacer l'historique</span>
        </button>
      </div>

      <div className="space-y-3">
        {takes.map((take) => {
          const isPlayingThis = playingTakeId === take.id;
          return (
            <div
              key={take.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => handleTogglePlay(take)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                    isPlayingThis
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-md shadow-rose-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  {isPlayingThis ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-xs text-slate-200">
                      {take.voice.name}
                    </span>
                    <span className="text-xs">{take.voice.flag}</span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        take.voice.gender === 'male'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-pink-500/10 text-pink-400'
                      }`}
                    >
                      {take.voice.gender === 'male' ? 'Homme' : 'Femme'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      Bed: {take.bgTrack}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-auto">
                      {new Date(take.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1 italic font-mono">
                    "{take.script}"
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                {onCreateVideo && (
                  <button
                    type="button"
                    onClick={() => onCreateVideo(take)}
                    className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    title="Envoyer cette voix-off vers le monteur vidéo CapCut Pro"
                  >
                    <Film className="w-3 h-3 text-cyan-400" />
                    <span>Créer Vidéo</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onRestoreTake(take)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-all"
                  title="Recharger cette voix et ce script dans le studio"
                >
                  <Radio className="w-3 h-3 text-cyan-400" />
                  <span>Charger</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyScript(take)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-all"
                  title="Copier le script"
                >
                  {copiedId === take.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                {take.audioUrl && (
                  <button
                    type="button"
                    onClick={() => handleDownloadTake(take)}
                    className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs transition-all"
                    title="Télécharger WAV"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
