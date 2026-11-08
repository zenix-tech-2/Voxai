import React from 'react';
import {
  VideoProject,
  ClipItem,
  FilterPreset,
  TextAnimationType,
  TransitionType,
} from '../../types/videoEditor';
import { CAPTION_STYLES_CATALOG } from '../../data/captionStyles';
import {
  Sliders,
  Move,
  Maximize2,
  RotateCw,
  Sun,
  Eye,
  Type,
  Volume2,
  Layers,
  Sparkles,
  Trash2,
  Crop,
  Scissors,
  Check,
  Palette,
  Minus,
  Plus,
} from 'lucide-react';

interface ClipInspectorProps {
  project: VideoProject;
  selectedClip: ClipItem | null;
  onUpdateClip: (clipId: string, updates: Partial<ClipItem>) => void;
  onDeleteClip: (clipId: string) => void;
  onOpenCropModal?: (clip: ClipItem) => void;
}

export const ClipInspector: React.FC<ClipInspectorProps> = ({
  project,
  selectedClip,
  onUpdateClip,
  onDeleteClip,
  onOpenCropModal,
}) => {
  if (!selectedClip) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-500 bg-slate-950 border border-slate-800 rounded-2xl select-none">
        <Sliders className="w-8 h-8 mb-2 text-slate-700" />
        <p className="text-xs font-semibold text-slate-400">Aucun élément sélectionné</p>
        <p className="text-[11px] text-slate-600 mt-1">
          Cliquez sur un clip dans la timeline ou sur le canvas pour afficher ses propriétés.
        </p>
      </div>
    );
  }

  // Handle caption style preset change
  const handleSelectCaptionStyle = (styleId: string) => {
    const found = CAPTION_STYLES_CATALOG.find((s) => s.id === styleId);
    if (!found) return;

    onUpdateClip(selectedClip.id, {
      captionStyleId: found.id,
      fontFamily: found.fontFamily,
      fontSize: found.fontSize,
      fontWeight: found.fontWeight,
      textColor: found.textColor,
      activeWordColor: found.activeWordColor,
      strokeColor: found.strokeColor,
      strokeWidth: found.strokeWidth,
      shadowColor: found.shadowColor,
      shadowBlur: found.shadowBlur,
      shadowOffsetX: found.shadowOffsetX,
      shadowOffsetY: found.shadowOffsetY,
      backgroundColor: found.backgroundColor,
      backgroundPadding: found.backgroundPadding,
      backgroundBorderRadius: found.backgroundBorderRadius,
      isUppercase: found.isUppercase,
      textAnimation: found.animationType,
    });
  };

  return (
    <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden h-[580px] shadow-2xl">
      {/* 1. Header with Clip Name & Delete Action */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="truncate mr-2">
          <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono">
            Propriétés : {selectedClip.type}
          </span>
          <h4 className="text-xs font-bold text-white truncate">{selectedClip.name}</h4>
        </div>
        <button
          type="button"
          onClick={() => onDeleteClip(selectedClip.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Supprimer cet élément"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Scrollable Properties Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-slate-300">
        {/* TEXT SPECIFIC CONTROLS & 30+ CAPTION STYLES */}
        {selectedClip.type === 'text' && (
          <div className="space-y-3.5 pb-4 border-b border-slate-800">
            <h5 className="font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-amber-400" />
                <span>Style des Sous-Titres (35 Styles)</span>
              </span>
              <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                Word Karaoke
              </span>
            </h5>

            {/* 30+ Style Selector Dropdown */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Choisir parmi 35 Styles Vidéo
              </label>
              <select
                value={selectedClip.captionStyleId || 'tiktok-viral-yellow'}
                onChange={(e) => handleSelectCaptionStyle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <optgroup label="🔥 Styles Viraux TikTok & Shorts" className="bg-slate-900 text-slate-200">
                  <option value="tiktok-viral-yellow">TikTok Viral Jaune</option>
                  <option value="mr-beast-punch">MrBeast Vert Fluo</option>
                  <option value="hormozi-yellow-box">Alex Hormozi Box Jaune</option>
                  <option value="ali-abdaal-clean">Ali Abdaal Minimaliste</option>
                </optgroup>
                <optgroup label="✨ Néon & Glow Électrique" className="bg-slate-900 text-slate-200">
                  <option value="neon-cyan-electric">Néon Cyan Électrique</option>
                  <option value="neon-magenta-disco">Néon Rose Disco</option>
                  <option value="neon-lime-toxic">Néon Vert Toxique</option>
                  <option value="hologram-sci-fi-cyan">Hologramme Sci-Fi</option>
                  <option value="matrix-code-stream">Matrix Digital Stream</option>
                </optgroup>
                <optgroup label="📼 Rétro & Vintage" className="bg-slate-900 text-slate-200">
                  <option value="retro-vhs-1995">Cassette VHS 1995</option>
                  <option value="vintage-typewriter">Machine à Écrire</option>
                  <option value="y2k-retro-pop">Y2K Millenium Violet</option>
                  <option value="vaporwave-synth-80s">Vaporwave Synthwave</option>
                  <option value="chalkboard-school">Craie Tableau Noir</option>
                </optgroup>
                <optgroup label="💥 Impact & Commercial" className="bg-slate-900 text-slate-200">
                  <option value="comic-superhero-bang">Comics Super-Héros</option>
                  <option value="sports-espn-lowerthird">Bandeau Sportif ESPN</option>
                  <option value="3d-extrude-pop">3D Extrusion Remplie</option>
                  <option value="streetwear-graffiti-bold">Streetwear Graffiti</option>
                  <option value="manga-action-speed">Manga Action Shonen</option>
                  <option value="golden-trophy-winner">Trophée d'Or Champion</option>
                  <option value="royal-gold-crest">Or Royal Prestige</option>
                </optgroup>
                <optgroup label="🤍 Minimaliste & Cinéma" className="bg-slate-900 text-slate-200">
                  <option value="luxury-vogue-serif">Vogue Haute Couture (Luxe)</option>
                  <option value="cinema-letterbox-classic">Cinéma Sous-Titre Jaune</option>
                  <option value="subtitle-capsule-dark">Pilule Sombre Arrondie</option>
                  <option value="subtitle-capsule-emerald">Pilule Émeraude</option>
                  <option value="subtitle-capsule-rose">Pilule Rouge Promo</option>
                  <option value="nordic-minimal-slate">Nordic Clean Slate</option>
                  <option value="newspaper-editorial-black">Éditorial Journal Presse</option>
                  <option value="monochrome-noir-cinema">Monochrome Noir & Blanc</option>
                </optgroup>
                <optgroup label="🎨 Dégradés & Créatifs" className="bg-slate-900 text-slate-200">
                  <option value="gradient-sunset-orange">Coucher de Soleil Sunset</option>
                  <option value="gradient-ocean-blue">Bleu Océan Profond</option>
                  <option value="glitch-cyberpunk-2077">Cyberpunk Glitch 2077</option>
                  <option value="burning-fire-flame">Flamme Ardente 🔥</option>
                  <option value="pastel-kawaii-cute">Pastel Douceur Kawaii</option>
                  <option value="bubblegum-sweet">Bubblegum Rose Bonbon</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Texte Affiché</label>
              <textarea
                value={selectedClip.text || ''}
                onChange={(e) => onUpdateClip(selectedClip.id, { text: e.target.value })}
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Mot Actif (Highlight)
                </label>
                <input
                  type="color"
                  value={selectedClip.activeWordColor || '#FFFF00'}
                  onChange={(e) => onUpdateClip(selectedClip.id, { activeWordColor: e.target.value })}
                  className="w-full h-8 bg-slate-900 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Contour (Stroke)</label>
                <input
                  type="color"
                  value={selectedClip.strokeColor || '#000000'}
                  onChange={(e) => onUpdateClip(selectedClip.id, { strokeColor: e.target.value })}
                  className="w-full h-8 bg-slate-900 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* CROP & REFRAME & REMOVE BACKGROUND (For Video, Image & Overlay) */}
        {(selectedClip.type === 'video' ||
          selectedClip.type === 'image' ||
          selectedClip.type === 'overlay') && (
          <div className="space-y-3.5 pb-4 border-b border-slate-800">
            <h5 className="font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Crop className="w-3.5 h-3.5 text-cyan-400" />
                <span>Recadrage & Détourage (Remove BG)</span>
              </span>
            </h5>

            {/* Crop Button */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <div className="text-xs font-bold text-white">Recadrer le Clip (Crop)</div>
                <div className="text-[10px] text-slate-400">
                  {selectedClip.crop?.enabled
                    ? `Recadrage actif (${selectedClip.crop.aspectPreset || 'personnalisé'})`
                    : 'Aucun recadrage'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenCropModal && onOpenCropModal(selectedClip)}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Crop className="w-3.5 h-3.5" />
                <span>Recadrer</span>
              </button>
            </div>

            {/* Remove Background / Fond Vert (Chroma Key) */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Supprimer l'Arrière-Plan (Remove BG)</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(selectedClip.removeBg?.enabled || selectedClip.chromaKey?.enabled)}
                  onChange={(e) =>
                    onUpdateClip(selectedClip.id, {
                      removeBg: {
                        enabled: e.target.checked,
                        mode: 'chroma',
                        color: selectedClip.removeBg?.color || '#00FF00',
                        similarity: selectedClip.removeBg?.similarity ?? 40,
                        smoothness: selectedClip.removeBg?.smoothness ?? 20,
                      },
                    })
                  }
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              {(selectedClip.removeBg?.enabled || selectedClip.chromaKey?.enabled) && (
                <div className="space-y-2 pt-2 border-t border-slate-800 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Couleur à supprimer :</span>
                    <div className="flex items-center gap-1.5">
                      {/* Presets */}
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateClip(selectedClip.id, {
                            removeBg: {
                              ...(selectedClip.removeBg || {
                                enabled: true,
                                mode: 'chroma',
                                similarity: 40,
                                smoothness: 20,
                              }),
                              color: '#00FF00',
                            },
                          })
                        }
                        className="w-4 h-4 rounded-full bg-emerald-500 border border-white/40"
                        title="Fond Vert"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateClip(selectedClip.id, {
                            removeBg: {
                              ...(selectedClip.removeBg || {
                                enabled: true,
                                mode: 'chroma',
                                similarity: 40,
                                smoothness: 20,
                              }),
                              color: '#0000FF',
                            },
                          })
                        }
                        className="w-4 h-4 rounded-full bg-blue-600 border border-white/40"
                        title="Fond Bleu"
                      />
                      <input
                        type="color"
                        value={selectedClip.removeBg?.color || '#00FF00'}
                        onChange={(e) =>
                          onUpdateClip(selectedClip.id, {
                            removeBg: {
                              ...(selectedClip.removeBg || {
                                enabled: true,
                                mode: 'chroma',
                                similarity: 40,
                                smoothness: 20,
                              }),
                              color: e.target.value,
                            },
                          })
                        }
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Tolérance / Similarité</span>
                      <span className="font-mono text-emerald-400">
                        {selectedClip.removeBg?.similarity ?? 40}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={selectedClip.removeBg?.similarity ?? 40}
                      onChange={(e) =>
                        onUpdateClip(selectedClip.id, {
                          removeBg: {
                            ...(selectedClip.removeBg || {
                              enabled: true,
                              mode: 'chroma',
                              color: '#00FF00',
                              smoothness: 20,
                            }),
                            similarity: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADVANCE TRIM & RIPPLE CUT */}
        <div className="space-y-3.5 pb-4 border-b border-slate-800">
          <h5 className="font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rognage Précis (Advance Trim)</span>
            </span>
          </h5>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Début</span>
                <span className="font-mono text-cyan-400">{selectedClip.start.toFixed(2)}s</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateClip(selectedClip.id, {
                      start: Math.max(0, selectedClip.start - 0.1),
                      duration: selectedClip.duration + 0.1,
                    })
                  }
                  className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  step="0.1"
                  value={selectedClip.start}
                  onChange={(e) =>
                    onUpdateClip(selectedClip.id, { start: Math.max(0, parseFloat(e.target.value) || 0) })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center font-mono text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() =>
                    onUpdateClip(selectedClip.id, {
                      start: selectedClip.start + 0.1,
                      duration: Math.max(0.2, selectedClip.duration - 0.1),
                    })
                  }
                  className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Durée</span>
                <span className="font-mono text-cyan-400">{selectedClip.duration.toFixed(2)}s</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateClip(selectedClip.id, {
                      duration: Math.max(0.2, selectedClip.duration - 0.1),
                    })
                  }
                  className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  step="0.1"
                  value={selectedClip.duration}
                  onChange={(e) =>
                    onUpdateClip(selectedClip.id, {
                      duration: Math.max(0.2, parseFloat(e.target.value) || 0.2),
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center font-mono text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() =>
                    onUpdateClip(selectedClip.id, {
                      duration: selectedClip.duration + 0.1,
                    })
                  }
                  className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SPATIAL TRANSFORM (Scale, Position, Rotation, Opacity) */}
        <div className="space-y-3.5 pb-4 border-b border-slate-800">
          <h5 className="font-bold text-white flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-cyan-400" />
            <span>Position & Échelle</span>
          </h5>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Échelle (Zoom)</span>
              <span className="font-mono text-cyan-400">
                {Math.round((selectedClip.scale ?? 1.0) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.05"
              value={selectedClip.scale ?? 1.0}
              onChange={(e) => onUpdateClip(selectedClip.id, { scale: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Position X</span>
                <span className="font-mono text-cyan-400">
                  {Math.round((selectedClip.x ?? 0.5) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={selectedClip.x ?? 0.5}
                onChange={(e) => onUpdateClip(selectedClip.id, { x: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Position Y</span>
                <span className="font-mono text-cyan-400">
                  {Math.round((selectedClip.y ?? 0.5) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={selectedClip.y ?? 0.5}
                onChange={(e) => onUpdateClip(selectedClip.id, { y: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Opacité</span>
                <span className="font-mono text-cyan-400">
                  {Math.round((selectedClip.opacity ?? 1.0) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedClip.opacity ?? 1.0}
                onChange={(e) => onUpdateClip(selectedClip.id, { opacity: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Rotation</span>
                <span className="font-mono text-cyan-400">{selectedClip.rotation ?? 0}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={selectedClip.rotation ?? 0}
                onChange={(e) =>
                  onUpdateClip(selectedClip.id, { rotation: Number(e.target.value) })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* COLOR GRADING & LUT */}
        {(selectedClip.type === 'video' || selectedClip.type === 'image') && (
          <div className="space-y-3.5 pb-4 border-b border-slate-800">
            <h5 className="font-bold text-white flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-yellow-400" />
              <span>Étalonnage & Correction Couleur</span>
            </h5>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Luminosité</span>
                  <span className="font-mono">{selectedClip.brightness || 0}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={selectedClip.brightness || 0}
                  onChange={(e) =>
                    onUpdateClip(selectedClip.id, { brightness: Number(e.target.value) })
                  }
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Contraste</span>
                  <span className="font-mono">{selectedClip.contrast || 0}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={selectedClip.contrast || 0}
                  onChange={(e) =>
                    onUpdateClip(selectedClip.id, { contrast: Number(e.target.value) })
                  }
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Saturation</span>
                  <span className="font-mono">{selectedClip.saturation || 0}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={selectedClip.saturation || 0}
                  onChange={(e) =>
                    onUpdateClip(selectedClip.id, { saturation: Number(e.target.value) })
                  }
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Vignettage</span>
                  <span className="font-mono">{selectedClip.vignette || 0}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedClip.vignette || 0}
                  onChange={(e) =>
                    onUpdateClip(selectedClip.id, { vignette: Number(e.target.value) })
                  }
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* AUDIO CONTROLS (For Audio & Voiceover) */}
        {(selectedClip.type === 'audio' ||
          selectedClip.type === 'voiceover' ||
          selectedClip.type === 'video') && (
          <div className="space-y-3 pb-4 border-b border-slate-800">
            <h5 className="font-bold text-white flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Contrôle Audio</span>
            </h5>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Volume sonore</span>
                <span className="font-mono text-purple-400">
                  {Math.round((selectedClip.volume ?? 1.0) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.05"
                value={selectedClip.volume ?? 1.0}
                onChange={(e) =>
                  onUpdateClip(selectedClip.id, { volume: Number(e.target.value) })
                }
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* TRANSITION IN */}
        <div className="space-y-3">
          <h5 className="font-bold text-white flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Transition d'Entrée</span>
          </h5>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Type de Transition</label>
              <select
                value={selectedClip.transition?.type || 'none'}
                onChange={(e) =>
                  onUpdateClip(selectedClip.id, {
                    transition: {
                      type: e.target.value as TransitionType,
                      duration: selectedClip.transition?.duration || 0.6,
                    },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white cursor-pointer"
              >
                <option value="none">Aucune</option>
                <option value="fade">Fondu (Fade)</option>
                <option value="wipe-left">Balayage Gauche</option>
                <option value="wipe-right">Balayage Droite</option>
                <option value="zoom-in">Zoom Dynamique</option>
                <option value="glitch">Glitch Cyber</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Durée ({selectedClip.transition?.duration || 0.6}s)
              </label>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={selectedClip.transition?.duration || 0.6}
                onChange={(e) =>
                  onUpdateClip(selectedClip.id, {
                    transition: {
                      type: selectedClip.transition?.type || 'fade',
                      duration: Number(e.target.value),
                    },
                  })
                }
                className="w-full accent-indigo-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
