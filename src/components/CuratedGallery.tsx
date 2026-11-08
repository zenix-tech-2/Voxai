import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Copy,
  Check,
  Maximize2,
  X,
  Compass,
} from 'lucide-react';
import { CURATED_SHOWCASE } from '../data/curatedPresets';
import { GeneratedImage, StudioSettings } from '../types';

interface CuratedGalleryProps {
  onRemixInStudio: (settings: Partial<StudioSettings>) => void;
  onOpenInCanvas: (image: GeneratedImage) => void;
}

export const CuratedGallery: React.FC<CuratedGalleryProps> = ({
  onRemixInStudio,
  onOpenInCanvas,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeLightboxImage, setActiveLightboxImage] = useState<GeneratedImage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['All', 'Sci-Fi & Cyberpunk', 'Surreal & Fine Art', 'Nature & Macro', 'Vintage & Speed'];

  const filteredItems = CURATED_SHOWCASE.filter((item) => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Sci-Fi & Cyberpunk') return item.style?.includes('Cyberpunk');
    if (selectedCategory === 'Surreal & Fine Art') return item.style?.includes('Surreal');
    if (selectedCategory === 'Nature & Macro') return item.style?.includes('Macro') || item.style?.includes('Bioluminescent');
    if (selectedCategory === 'Vintage & Speed') return item.style?.includes('Kodachrome');
    return true;
  });

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Title & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Curated Masterpiece Collection</span>
            <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
              Verified 8K Renders
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Explore studio-tested generative creations. Click remix to inspect the prompt composition and optical recipes.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col"
          >
            {/* Visual Frame */}
            <div className="relative aspect-video bg-slate-950 overflow-hidden cursor-pointer">
              <img
                src={item.url}
                alt={item.prompt}
                referrerPolicy="no-referrer"
                onClick={() => setActiveLightboxImage(item)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />

              {/* Scrim Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                <div className="flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveLightboxImage(item);
                    }}
                    className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-sm border border-slate-700/60 transition-colors"
                    title="Fullscreen Lightbox"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemixInStudio({
                        prompt: item.prompt,
                        style: item.style,
                        lighting: item.lighting,
                        camera: item.camera,
                        aspectRatio: item.aspectRatio,
                      });
                    }}
                    className="flex-1 py-2 px-3 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Remix in Studio</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenInCanvas(item);
                    }}
                    className="py-2 px-3 text-xs font-medium text-white bg-slate-800/90 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Open in Canvas</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Unboxed Metadata & Prompt Section */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                {/* Unboxed metadata with typographic separators */}
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2.5 font-medium">
                  <span className="text-amber-400">{item.style}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>{item.lighting}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="font-mono text-[11px] text-slate-400">{item.aspectRatio}</span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-sans line-clamp-3">
                  {item.prompt}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[11px] text-slate-500">
                  Lens: {item.camera || 'Standard Prime'}
                </span>

                <button
                  onClick={() => handleCopyPrompt(item.id, item.prompt)}
                  className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Recipe</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeLightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={() => setActiveLightboxImage(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-[#0B0F17] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveLightboxImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/60 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left Image View */}
            <div className="lg:w-3/5 bg-black flex items-center justify-center p-4">
              <img
                src={activeLightboxImage.url}
                alt={activeLightboxImage.prompt}
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-xl"
              />
            </div>

            {/* Right Recipe Details */}
            <div className="lg:w-2/5 p-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/40">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Generative Specification</span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Prompt Narrative
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed p-3 bg-slate-950 rounded-lg border border-slate-800/80 font-mono">
                    {activeLightboxImage.prompt}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px] uppercase">Style Preset</span>
                    <span className="text-slate-200 font-medium">{activeLightboxImage.style}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px] uppercase">Illumination</span>
                    <span className="text-slate-200 font-medium">{activeLightboxImage.lighting}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px] uppercase">Aspect Ratio</span>
                    <span className="text-slate-200 font-mono">{activeLightboxImage.aspectRatio}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px] uppercase">Optics</span>
                    <span className="text-slate-200 font-medium">{activeLightboxImage.camera}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-3">
                <button
                  onClick={() => {
                    onRemixInStudio({
                      prompt: activeLightboxImage.prompt,
                      style: activeLightboxImage.style,
                      lighting: activeLightboxImage.lighting,
                      camera: activeLightboxImage.camera,
                      aspectRatio: activeLightboxImage.aspectRatio,
                    });
                    setActiveLightboxImage(null);
                  }}
                  className="flex-1 py-2.5 px-3 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Remix in Studio</span>
                </button>

                <button
                  onClick={() => {
                    onOpenInCanvas(activeLightboxImage);
                    setActiveLightboxImage(null);
                  }}
                  className="py-2.5 px-3 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Canvas Suite</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
