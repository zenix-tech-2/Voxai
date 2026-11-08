import React, { useState } from 'react';
import { AD_TEMPLATES, AdTemplate } from '../data/adTemplates';
import { VOICES, VoiceProfile } from '../data/voices';
import { BookOpen, Sparkles, Clock, User, ArrowRight, Check } from 'lucide-react';

interface TemplatesGalleryProps {
  onSelectTemplate: (template: AdTemplate, recommendedVoice?: VoiceProfile) => void;
}

export const TemplatesGallery: React.FC<TemplatesGalleryProps> = ({
  onSelectTemplate,
}) => {
  const [langFilter, setLangFilter] = useState<'all' | 'fr' | 'en'>('all');

  const filtered = AD_TEMPLATES.filter((tmpl) => {
    if (langFilter !== 'all' && tmpl.language !== langFilter) return false;
    return true;
  });

  return (
    <div className="w-full">
      {/* Title & Filter */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 mb-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Bibliothèque de Scripts Publicitaires (Commercial Ad Library)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Modèles de spots prêts à l'enregistrement pour formats radio, TV et digitaux en Français et Anglais.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setLangFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                langFilter === 'all'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tous ({AD_TEMPLATES.length})
            </button>
            <button
              type="button"
              onClick={() => setLangFilter('fr')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                langFilter === 'fr'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🇫🇷</span>
              <span>Français</span>
            </button>
            <button
              type="button"
              onClick={() => setLangFilter('en')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                langFilter === 'en'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🇺🇸</span>
              <span>English</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tmpl) => {
          const recVoice = VOICES.find((v) => v.id === tmpl.recommendedVoiceId);
          return (
            <div
              key={tmpl.id}
              className="flex flex-col justify-between p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 transition-all shadow-sm group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                    {tmpl.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{tmpl.durationEstimate}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-100 mb-2 group-hover:text-cyan-300 transition-colors">
                  {tmpl.title}
                </h3>

                <p className="text-xs text-slate-300 font-mono bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 mb-3 leading-relaxed">
                  "{tmpl.script}"
                </p>

                <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                  <span className="text-slate-400">
                    Ton : <span className="text-slate-200 italic">{tmpl.targetTone}</span>
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
                {recVoice && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Recommandé : <strong className="text-slate-200">{recVoice.name}</strong></span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => onSelectTemplate(tmpl, recVoice)}
                  className="ml-auto px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <span>Charger au Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
