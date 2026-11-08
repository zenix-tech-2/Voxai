import React, { useState, useMemo } from 'react';
import { VoiceProfile, VoiceRegion } from '../data/voices';
import { VoiceCard } from './VoiceCard';
import { Search, Filter, Globe, Users, Sparkles, Dna, Plus } from 'lucide-react';

interface VoiceCatalogProps {
  voices: VoiceProfile[];
  selectedVoice: VoiceProfile;
  onSelectVoice: (voice: VoiceProfile) => void;
  playingPreviewId: string | null;
  onTogglePreview: (voice: VoiceProfile) => void;
  onOpenCloningModal: () => void;
  onDeleteClone?: (voiceId: string) => void;
}

export const VoiceCatalog: React.FC<VoiceCatalogProps> = ({
  voices,
  selectedVoice,
  onSelectVoice,
  playingPreviewId,
  onTogglePreview,
  onOpenCloningModal,
  onDeleteClone,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredVoices = useMemo(() => {
    return voices.filter((voice) => {
      // Region filter
      if (selectedRegion === 'african' && voice.region !== 'african') return false;
      if (selectedRegion === 'french' && voice.region !== 'french') return false;
      if (selectedRegion === 'english' && voice.region !== 'english') return false;
      if (selectedRegion === 'specialty' && voice.region !== 'specialty') return false;
      if (selectedRegion === 'cloned' && !voice.isCloned) return false;

      // Gender filter (Men's Voice / Women's Voice)
      if (selectedGender !== 'all' && voice.gender !== selectedGender) {
        return false;
      }
      // Style Category filter
      if (selectedCategory !== 'all' && voice.styleCategory !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = voice.name.toLowerCase().includes(query);
        const matchesStyle = voice.styleLabel.toLowerCase().includes(query);
        const matchesTone = voice.toneDescription.toLowerCase().includes(query);
        const matchesAccent = voice.accent.toLowerCase().includes(query);
        const matchesTags = voice.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchesName && !matchesStyle && !matchesTone && !matchesAccent && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [voices, selectedRegion, selectedGender, selectedCategory, searchQuery]);

  const clonedCount = voices.filter((v) => v.isCloned).length;
  const africanCount = voices.filter((v) => v.region === 'african').length;

  return (
    <div className="w-full">
      {/* Voice Cloning Hero Banner in Catalog */}
      <div className="mb-6 p-5 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/50 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Dna className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base">
                Clonage Vocal Personnalisé (Custom Voice Cloning)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                NOUVEAU
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Enregistrez ou importez votre voix pour créer votre propre réplique publicitaire IA instantanément.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenCloningModal}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Cloner une Voix Maintenant</span>
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 mb-6 backdrop-blur-md shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Catalogue des Voix ({voices.length} Voix Disponibles)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Voix Africaines, Françaises, Anglaises, Hommes & Femmes, Enfants, Seniors & Clones Vocaux
            </p>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher (ex: Nigeria, Jean-Luc, ASMR, Clone)..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Region / Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/70 mb-3">
          <span className="text-[11px] text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            Régions :
          </span>

          <button
            type="button"
            onClick={() => setSelectedRegion('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedRegion === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Toutes ({voices.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedRegion('african')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              selectedRegion === 'african'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-950 text-amber-400 hover:text-amber-300 border border-amber-500/30'
            }`}
          >
            <span>🌍</span>
            <span>Voix Africaines ({africanCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRegion('french')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              selectedRegion === 'french'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>🇫🇷</span>
            <span>Français</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRegion('english')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              selectedRegion === 'english'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>🇺🇸</span>
            <span>English</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRegion('specialty')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              selectedRegion === 'specialty'
                ? 'bg-purple-500 text-white shadow-sm font-bold'
                : 'bg-slate-950 text-purple-300 hover:text-purple-200 border border-purple-500/30'
            }`}
          >
            <span>✨</span>
            <span>Enfants, Seniors & ASMR</span>
          </button>

          {clonedCount > 0 && (
            <button
              type="button"
              onClick={() => setSelectedRegion('cloned')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                selectedRegion === 'cloned'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-950 text-emerald-400 hover:text-emerald-300 border border-emerald-500/40'
              }`}
            >
              <Dna className="w-3.5 h-3.5" />
              <span>Mes Voix Clonées ({clonedCount})</span>
            </button>
          )}
        </div>

        {/* Gender & Style Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Gender Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <Users className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <button
              type="button"
              onClick={() => setSelectedGender('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedGender === 'all'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tous
            </button>
            <button
              type="button"
              onClick={() => setSelectedGender('male')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                selectedGender === 'male'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-blue-300'
              }`}
            >
              <span>👨</span>
              <span>Hommes (Men)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedGender('female')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                selectedGender === 'female'
                  ? 'bg-pink-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-pink-300'
              }`}
            >
              <span>👩</span>
              <span>Femmes (Women)</span>
            </button>
          </div>

          {/* Ad Style Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none pr-2 py-0.5 cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">
                Tous les genres publicitaires
              </option>
              <option value="tech" className="bg-slate-900 text-slate-200">
                🚀 Tech, FinTech & Auto
              </option>
              <option value="luxury" className="bg-slate-900 text-slate-200">
                ✨ Luxe & Haute Couture
              </option>
              <option value="promo" className="bg-slate-900 text-slate-200">
                ⚡ Soldes Flash & Promo
              </option>
              <option value="lifestyle" className="bg-slate-900 text-slate-200">
                🌿 Safari, Beauté & Lifestyle
              </option>
              <option value="gourmet" className="bg-slate-900 text-slate-200">
                🥐 Terroir, Karité & Gastronomie
              </option>
              <option value="trailer" className="bg-slate-900 text-slate-200">
                🎬 Trailer Cinéma & Super Bowl
              </option>
              <option value="finance" className="bg-slate-900 text-slate-200">
                🏛️ Banque & Confiance
              </option>
              <option value="kids" className="bg-slate-900 text-slate-200">
                🧸 Enfants & Jouets
              </option>
              <option value="mature" className="bg-slate-900 text-slate-200">
                👴 Seniors & Sagesse
              </option>
              <option value="asmr" className="bg-slate-900 text-slate-200">
                🎧 Whisper & ASMR
              </option>
              <option value="sports" className="bg-slate-900 text-slate-200">
                📢 Announcer & Extrême
              </option>
            </select>
          </div>

          {/* Counter */}
          <div className="ml-auto text-xs text-slate-400">
            <span className="font-semibold text-cyan-400">{filteredVoices.length}</span> voix trouvée{filteredVoices.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Voices Grid */}
      {filteredVoices.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 p-8">
          <p className="text-slate-400 text-sm mb-3">
            Aucune voix ne correspond à vos filtres actuels.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedRegion('all');
              setSelectedGender('all');
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs font-semibold"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVoices.map((voice) => (
            <VoiceCard
              key={voice.id}
              voice={voice}
              isSelected={selectedVoice.id === voice.id}
              isPlayingPreview={playingPreviewId === voice.id}
              onSelect={onSelectVoice}
              onTogglePreview={onTogglePreview}
              onDeleteClone={onDeleteClone}
            />
          ))}
        </div>
      )}
    </div>
  );
};
