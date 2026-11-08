import React from 'react';
import { VoiceProfile } from '../data/voices';
import { Play, Square, User, Sparkles, Check, Volume2, Dna, Trash2 } from 'lucide-react';

interface VoiceCardProps {
  voice: VoiceProfile;
  isSelected: boolean;
  isPlayingPreview: boolean;
  onSelect: (voice: VoiceProfile) => void;
  onTogglePreview: (voice: VoiceProfile) => void;
  onDeleteClone?: (voiceId: string) => void;
}

export const VoiceCard: React.FC<VoiceCardProps> = ({
  voice,
  isSelected,
  isPlayingPreview,
  onSelect,
  onTogglePreview,
  onDeleteClone,
}) => {
  const isMale = voice.gender === 'male';
  const isAfrican = voice.region === 'african';
  const isCloned = voice.isCloned;

  return (
    <div
      onClick={() => onSelect(voice)}
      className={`group relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left backdrop-blur-sm ${
        isSelected
          ? 'bg-slate-800/90 border-cyan-500/80 shadow-[0_0_24px_rgba(6,182,212,0.18)] ring-1 ring-cyan-500/50'
          : isCloned
          ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500/70 hover:bg-emerald-950/30'
          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50 shadow-sm'
      }`}
    >
      {/* Top row: Name, Gender & Language */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-md transition-transform group-hover:scale-105 ${
                isCloned
                  ? 'bg-gradient-to-br from-emerald-500 to-cyan-600 text-slate-950 shadow-emerald-500/20'
                  : isAfrican
                  ? 'bg-gradient-to-br from-amber-500 via-orange-600 to-emerald-600 text-white shadow-amber-500/20'
                  : isMale
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-500/20'
                  : 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-pink-500/20'
              }`}
            >
              {isCloned ? (
                <Dna className="w-5 h-5 text-slate-950" />
              ) : (
                voice.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-slate-100 text-base leading-tight">
                  {voice.name}
                </h3>
                <span className="text-base" title={voice.languageLabel}>
                  {voice.flag}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {voice.accent}
              </p>
            </div>
          </div>

          {/* Badges / Delete */}
          <div className="flex items-center gap-1">
            {isCloned && onDeleteClone && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClone(voice.id);
                }}
                className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Supprimer ce clone vocal"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                isCloned
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold'
                  : isMale
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : 'bg-pink-500/10 text-pink-400 border-pink-500/20'
              }`}
            >
              {isCloned ? (
                <>
                  <Dna className="w-3 h-3 text-emerald-400" />
                  <span>Clone Vocal</span>
                </>
              ) : (
                <>
                  <User className="w-3 h-3" />
                  <span>{voice.gender === 'male' ? 'Homme' : 'Femme'}</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Style & Ad Specialization Badge */}
        <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border ${voice.badgeColor}`}
          >
            <Sparkles className="w-3 h-3" />
            {voice.styleLabel}
          </span>
          {isAfrican && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
              🌍 Afrique
            </span>
          )}
        </div>

        {/* Tone Description */}
        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-3">
          {voice.toneDescription}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {voice.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Action Bar: Preview Sample & Select */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePreview(voice);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            isPlayingPreview
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60'
          }`}
          title="Écouter l'extrait publicitaire"
        >
          {isPlayingPreview ? (
            <>
              <Square className="w-3 h-3 fill-current text-rose-400" />
              <span>Arrêter</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3 h-3 text-cyan-400" />
              <span>Extrait Publicité</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(voice);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
            isSelected
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
              : 'bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700'
          }`}
        >
          {isSelected ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Sélectionnée</span>
            </>
          ) : (
            <span>Choisir</span>
          )}
        </button>
      </div>
    </div>
  );
};
