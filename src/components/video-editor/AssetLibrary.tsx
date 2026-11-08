import React, { useState } from 'react';
import {
  VideoProject,
  ClipItem,
  StockMediaAsset,
  SoundEffectAsset,
  FilterPreset,
  UserUploadedMedia,
  CaptionStylePreset,
} from '../../types/videoEditor';
import {
  STOCK_MEDIA_ASSETS,
  FILTER_PRESETS_CATALOG,
  SFX_PRESETS,
  STICKER_PRESETS,
} from '../../data/stockAssets';
import { CAPTION_STYLES_CATALOG } from '../../data/captionStyles';
import { sfx } from '../../utils/sfxSynthesizer';
import { TakeItem } from '../../utils/speechEngine';
import {
  Film,
  Upload,
  Music,
  Mic,
  Type,
  Sparkles,
  Sliders,
  Layers,
  Wand2,
  Plus,
  Play,
  Check,
  Tag,
  Volume2,
  FileVideo,
  FileAudio,
  Crop,
  Radio,
} from 'lucide-react';

interface AssetLibraryProps {
  project: VideoProject;
  sessionTakes: TakeItem[];
  onAddClipToTrack: (
    trackType: 'video' | 'overlay' | 'text' | 'voiceover' | 'audio',
    clip: Partial<ClipItem>
  ) => void;
  onApplyFilterToSelected: (filter: FilterPreset) => void;
  onApplyTransitionToSelected: (
    type: 'fade' | 'wipe-left' | 'wipe-right' | 'zoom-in' | 'glitch'
  ) => void;
  onGenerateAutoCaptions: (scriptText: string, styleId?: string) => void;
  onApplyStyleToAllCaptions: (styleId: string) => void;
  onGenerateFullAIVideo: () => void;
}

export const AssetLibrary: React.FC<AssetLibraryProps> = ({
  project,
  sessionTakes,
  onAddClipToTrack,
  onApplyFilterToSelected,
  onApplyTransitionToSelected,
  onGenerateAutoCaptions,
  onApplyStyleToAllCaptions,
  onGenerateFullAIVideo,
}) => {
  const [activeTab, setActiveTab] = useState<
    'media' | 'audio' | 'captions' | 'overlays' | 'filters' | 'transitions' | 'stickers' | 'ai'
  >('captions');

  // Captions tab states
  const [selectedCaptionCategory, setSelectedCaptionCategory] = useState<string>('all');
  const [selectedCaptionStyleId, setSelectedCaptionStyleId] = useState<string>('tiktok-viral-yellow');
  const [captionInputText, setCaptionInputText] = useState<string>(
    sessionTakes.length > 0
      ? sessionTakes[0].script
      : 'Découvrez notre nouvelle collection exclusive disponible dès maintenant en boutique et en ligne.'
  );

  // Media tab states
  const [mediaCategory, setMediaCategory] = useState<string>('all');
  const [userUploads, setUserUploads] = useState<UserUploadedMedia[]>([]);

  // Music upload states
  const [userMusicUploads, setUserMusicUploads] = useState<UserUploadedMedia[]>([]);

  // Filter stock assets
  const filteredStockMedia = STOCK_MEDIA_ASSETS.filter((item) => {
    if (mediaCategory === 'all') return true;
    return item.category === mediaCategory;
  });

  // Filter 30+ Caption Styles
  const filteredCaptionStyles = CAPTION_STYLES_CATALOG.filter((item) => {
    if (selectedCaptionCategory === 'all') return true;
    return item.category === selectedCaptionCategory;
  });

  // Handle local user file upload (Video / Photo)
  const handleUserFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    const isAudio = file.type.startsWith('audio/');
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);

    const newUpload: UserUploadedMedia = {
      id: `upload-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      type: isVideo ? 'video' : isImage ? 'image' : 'audio',
      url,
      sizeMB,
      createdAt: Date.now(),
    };

    if (isAudio) {
      setUserMusicUploads((prev) => [newUpload, ...prev]);
      onAddClipToTrack('audio', {
        type: 'audio',
        name: newUpload.name,
        mediaUrl: url,
        duration: 12.0,
      });
    } else {
      setUserUploads((prev) => [newUpload, ...prev]);
      onAddClipToTrack('video', {
        type: isVideo ? 'video' : 'image',
        name: newUpload.name,
        mediaUrl: url,
        thumbnailUrl: url,
        duration: isVideo ? 5.0 : 4.0,
      });
    }
  };

  // Handle Music file upload
  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);

    const newUpload: UserUploadedMedia = {
      id: `music-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      type: 'audio',
      url,
      sizeMB,
      createdAt: Date.now(),
    };

    setUserMusicUploads((prev) => [newUpload, ...prev]);
    onAddClipToTrack('audio', {
      type: 'audio',
      name: newUpload.name,
      mediaUrl: url,
      duration: 15.0,
    });
  };

  return (
    <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden h-[580px] shadow-2xl">
      {/* 1. Sidebar Top Category Navigation Bar */}
      <div className="flex items-center px-2 py-2 bg-slate-900 border-b border-slate-800 gap-1 overflow-x-auto select-none">
        <button
          type="button"
          onClick={() => setActiveTab('captions')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'captions'
              ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-sm font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Sous-Titres (35 Styles)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('media')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'media'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Médias & Upload</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audio')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'audio'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>Musique & Voix</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('overlays')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'overlays'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Superpositions & PIP</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('filters')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'filters'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>LUTs & Filtres</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transitions')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'transitions'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Transitions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'ai'
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-sm'
              : 'text-emerald-400 hover:text-emerald-300'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Créateur IA 🎬</span>
        </button>
      </div>

      {/* 2. Content Viewport */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* TAB 1: SMART AUTO CAPTIONS (35 STYLES) */}
        {activeTab === 'captions' && (
          <div className="space-y-4">
            {/* Generator Box */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <h4 className="text-xs font-black text-amber-300 uppercase tracking-wide">
                    Générateur de Sous-Titres Synchronisés
                  </h4>
                </div>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {CAPTION_STYLES_CATALOG.length} Styles Disponibles
                </span>
              </div>

              <textarea
                value={captionInputText}
                onChange={(e) => setCaptionInputText(e.target.value)}
                rows={2}
                placeholder="Entrez le script à synchroniser sur la timeline..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={() => onGenerateAutoCaptions(captionInputText, selectedCaptionStyleId)}
                  className="w-full sm:flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Générer avec le style sélectionné</span>
                </button>

                <button
                  type="button"
                  onClick={() => onApplyStyleToAllCaptions(selectedCaptionStyleId)}
                  className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold whitespace-nowrap cursor-pointer"
                  title="Met à jour l'apparence de tous les sous-titres déjà présents sur la timeline"
                >
                  Appliquer à tous
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: `Tous (${CAPTION_STYLES_CATALOG.length})` },
                { id: 'viral', label: '🔥 Viraux (TikTok, MrBeast)' },
                { id: 'neon', label: '✨ Néon & Glow' },
                { id: 'retro', label: '📼 Rétro & VHS' },
                { id: 'bold', label: '💥 Commercial & Impact' },
                { id: 'minimal', label: '🤍 Minimaliste & Cinéma' },
                { id: 'creative', label: '🎨 Dégradés & Kawaii' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCaptionCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCaptionCategory === cat.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* 35 Caption Styles Cards Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {filteredCaptionStyles.map((style) => {
                const isSelected = selectedCaptionStyleId === style.id;
                return (
                  <div
                    key={style.id}
                    onClick={() => setSelectedCaptionStyleId(style.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-900 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white truncate mr-1">
                          {style.name}
                        </span>
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: style.activeWordColor }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2">
                        {style.description}
                      </p>
                    </div>

                    {/* Live Typographic Sample Preview */}
                    <div className="mt-3 p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-center overflow-hidden">
                      <span
                        className="font-bold text-sm leading-none"
                        style={{
                          fontFamily: style.fontFamily,
                          color: style.activeWordColor,
                          textShadow: style.shadowColor
                            ? `0 0 ${style.shadowBlur || 8}px ${style.shadowColor}`
                            : undefined,
                        }}
                      >
                        {style.isUppercase ? 'MOT ACTIF' : 'Mot Actif'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: MEDIA (Upload & Stock) */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            {/* Main Prominent Upload Button */}
            <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-500 bg-slate-900/50 hover:bg-slate-900 cursor-pointer transition-all text-center group">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-white">
                Importer Vidéo, Photo ou Clip Personnel
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                MP4, MOV, WEBM, JPG, PNG, WEBP (Glisser-déposer ou cliquer)
              </span>
              <input
                type="file"
                accept="video/*,image/*"
                onChange={handleUserFileUpload}
                className="hidden"
              />
            </label>

            {/* User Uploaded Media List */}
            {userUploads.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-200 mb-2">
                  Mes Fichiers Importés ({userUploads.length})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {userUploads.map((up) => (
                    <div
                      key={up.id}
                      onClick={() =>
                        onAddClipToTrack('video', {
                          type: up.type === 'video' ? 'video' : 'image',
                          name: up.name,
                          mediaUrl: up.url,
                          thumbnailUrl: up.url,
                          duration: 4.5,
                        })
                      }
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <FileVideo className="w-5 h-5 text-cyan-400 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{up.name}</div>
                        <div className="text-[10px] text-slate-400">{up.sizeMB} Mo</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: 'Tout le Stock' },
                { id: 'africa', label: '🌍 Afrique' },
                { id: 'tech', label: '⚡ Tech & IA' },
                { id: 'luxury', label: '✨ Luxe' },
                { id: 'retail', label: '🛍 Retail' },
                { id: 'abstract', label: '🎨 B-Roll' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setMediaCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    mediaCategory === cat.id
                      ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Stock Media Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {filteredStockMedia.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() =>
                    onAddClipToTrack('video', {
                      type: asset.type,
                      name: asset.title,
                      mediaUrl: asset.mediaUrl,
                      thumbnailUrl: asset.thumbnailUrl,
                      duration: 4.5,
                    })
                  }
                  className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 hover:border-cyan-500/60 transition-all cursor-pointer aspect-video"
                >
                  <img
                    src={asset.thumbnailUrl}
                    alt={asset.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-2">
                    <span className="text-[11px] font-semibold text-white leading-tight truncate">
                      {asset.title}
                    </span>
                    <span className="text-[9px] text-cyan-400 uppercase font-mono">
                      + Ajouter au montage
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AUDIO & MUSIC UPLOAD */}
        {activeTab === 'audio' && (
          <div className="space-y-4">
            {/* Music Upload Button */}
            <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-dashed border-slate-700 hover:border-purple-500 bg-slate-900/60 hover:bg-slate-900 cursor-pointer transition-all text-xs font-bold text-purple-300">
              <Upload className="w-4 h-4 text-purple-400" />
              <span>Importer votre Propre Musique (MP3, WAV, AAC, M4A)</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleMusicUpload}
                className="hidden"
              />
            </label>

            {/* User Uploaded Music List */}
            {userMusicUploads.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white">Musiques Importées</h4>
                {userMusicUploads.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileAudio className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="text-xs font-bold text-white truncate">{m.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onAddClipToTrack('audio', {
                          type: 'audio',
                          name: m.name,
                          mediaUrl: m.url,
                          duration: 15.0,
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-bold cursor-pointer"
                    >
                      Insérer
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Session Takes from VoxStudio */}
            <div>
              <h4 className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                <span>Voix-Off du Studio ({sessionTakes.length})</span>
              </h4>

              {sessionTakes.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                  <p>Aucune voix-off enregistrée dans cette session.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessionTakes.map((take) => (
                    <div
                      key={take.id}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">
                          {take.voice.name} ({take.voice.accent})
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          "{take.script}"
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onAddClipToTrack('voiceover', {
                            type: 'voiceover',
                            name: `Voix-Off: ${take.voice.name}`,
                            mediaUrl: take.audioUrl,
                            duration: Math.max(3, Math.round(take.script.split(/\s+/).length / 2.5)),
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Insérer</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sound FX Library */}
            <div>
              <h4 className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Effets Sonores SFX</span>
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {SFX_PRESETS.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => sfx.playById(item.id)}
                      className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white truncate cursor-pointer"
                    >
                      <Play className="w-3 h-3 text-cyan-400 fill-cyan-400 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sfx.playById(item.id);
                        onAddClipToTrack('audio', {
                          type: 'audio',
                          name: item.name,
                          duration: item.duration,
                        });
                      }}
                      className="p-1 rounded bg-slate-800 text-cyan-400 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: OVERLAYS & PIP */}
        {activeTab === 'overlays' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Incrustations d'images, bandes cinématiques, cadres et Picture-in-Picture (PIP) :
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  id: 'ovl-pip-tech',
                  title: 'Incrustation PIP Smartphone',
                  desc: 'Fenêtre vidéo Picture-in-Picture sur le coin',
                  type: 'overlay',
                  scale: 0.45,
                  x: 0.8,
                  y: 0.75,
                },
                {
                  id: 'ovl-letterbox',
                  title: 'Bandes Noires Cinéma 2.35:1',
                  desc: 'Format film cinématographique haut et bas',
                  type: 'effect',
                  scale: 1.0,
                  x: 0.5,
                  y: 0.5,
                },
                {
                  id: 'ovl-vhs-scanlines',
                  title: 'Balayage Scanlines VHS',
                  desc: 'Lignes cathodiques rétro analogiques',
                  type: 'effect',
                  scale: 1.0,
                  x: 0.5,
                  y: 0.5,
                },
                {
                  id: 'ovl-badge-flash',
                  title: 'Bandeau Flash Info Vente',
                  desc: 'Bandeau inférieur rouge avec typographie blanche',
                  type: 'sticker',
                  text: 'VENTE FLASH -50%',
                  scale: 0.9,
                  x: 0.5,
                  y: 0.85,
                },
              ].map((ovl) => (
                <button
                  key={ovl.id}
                  type="button"
                  onClick={() =>
                    onAddClipToTrack('overlay', {
                      type: ovl.type as any,
                      name: ovl.title,
                      text: ovl.text,
                      scale: ovl.scale,
                      x: ovl.x,
                      y: ovl.y,
                      duration: 5.0,
                    })
                  }
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-left transition-colors cursor-pointer group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-cyan-400">
                    {ovl.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{ovl.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: FILTERS & LUTS */}
        {activeTab === 'filters' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Sélectionnez un clip vidéo sur la timeline, puis appliquez un style cinématographique :
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {FILTER_PRESETS_CATALOG.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onApplyFilterToSelected(f.id)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-400">
                      {f.name}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: f.accentColor }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2">
                    {f.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: TRANSITIONS */}
        {activeTab === 'transitions' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Appliquer une transition fluide à l'entrée du clip sélectionné :
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'fade', name: 'Fondu Enchaîné (Fade)' },
                { id: 'wipe-left', name: 'Balayage Gauche (Wipe)' },
                { id: 'wipe-right', name: 'Balayage Droite' },
                { id: 'zoom-in', name: 'Zoom Avant Dynamique' },
                { id: 'glitch', name: 'Flash Glitch Cyber' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onApplyTransitionToSelected(t.id as any)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-left transition-colors cursor-pointer group"
                >
                  <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-400">
                    {t.name}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1">Durée : 0.6s</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: AI SCRIPT-TO-VIDEO STORYBOARD */}
        {activeTab === 'ai' && (
          <div className="space-y-4 p-2">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-cyan-500/10 to-slate-900 border border-emerald-500/30 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">
                  Créateur Vidéo IA Multi-Scènes
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Assemble automatiquement un spot publicitaire complet : séquences B-Roll
                  synchronisées, voix publicitaire, musique de fond et sous-titres animés.
                </p>
              </div>

              <button
                type="button"
                onClick={onGenerateFullAIVideo}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Générer un Montage Complet en 1 Clic</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
