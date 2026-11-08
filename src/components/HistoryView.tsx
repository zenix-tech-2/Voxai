import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Download,
  Trash2,
  Heart,
  Calendar,
  Copy,
  Check,
  ArrowRight,
  Archive,
  Loader2,
} from 'lucide-react';
import JSZip from 'jszip';
import { GeneratedImage, StudioSettings } from '../types';

interface HistoryViewProps {
  history: GeneratedImage[];
  onToggleFavorite: (id: string) => void;
  onDeleteImage: (id: string) => void;
  onClearHistory: () => void;
  onRemixInStudio: (settings: Partial<StudioSettings>) => void;
  onOpenInCanvas: (image: GeneratedImage) => void;
  onOpenStudio: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onToggleFavorite,
  onDeleteImage,
  onClearHistory,
  onRemixInStudio,
  onOpenInCanvas,
  onOpenStudio,
}) => {
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const displayedImages = history.filter((img) => {
    if (filter === 'favorites') return img.isFavorite;
    return true;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (img: GeneratedImage) => {
    const link = document.createElement('a');
    link.download = `lumen-synthesis-${img.id}.png`;
    link.href = img.url;
    link.click();
  };

  const handleDownloadAllZip = async () => {
    if (displayedImages.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('lumen-creations');

      let manifestText = `# Lumen Studio Generative Archive\nExport Date: ${new Date().toISOString()}\nTotal items: ${displayedImages.length}\n\n`;

      for (let i = 0; i < displayedImages.length; i++) {
        const img = displayedImages[i];
        manifestText += `## Creation ${i + 1} (${img.id})\nPrompt: ${img.prompt}\nModel: ${img.model}\nAspect Ratio: ${img.aspectRatio}\nStyle: ${img.style || 'Custom'}\nTimestamp: ${new Date(img.createdAt).toLocaleString()}\n\n`;

        if (img.url.startsWith('data:')) {
          const commaIdx = img.url.indexOf(',');
          const b64 = img.url.slice(commaIdx + 1);
          const ext = img.url.includes('image/png')
            ? 'png'
            : img.url.includes('svg')
            ? 'svg'
            : 'jpg';
          folder?.file(`creation-${i + 1}-${img.id}.${ext}`, b64, { base64: true });
        } else {
          try {
            const resp = await fetch(img.url);
            const blob = await resp.blob();
            folder?.file(`creation-${i + 1}-${img.id}.jpg`, blob);
          } catch (_) {}
        }
      }

      folder?.file('manifest.txt', manifestText);
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `lumen-archive-${Date.now()}.zip`;
      link.click();
    } catch (err) {
      console.error('ZIP export failed:', err);
    } finally {
      setIsZipping(false);
    }
  };

  if (history.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="border border-dashed border-slate-800 rounded-2xl p-12 bg-slate-900/30">
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 mx-auto flex items-center justify-center mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Your Generation Archive is Empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            All images synthesized with any of the free engines will automatically appear here with prompt recipes and timestamps.
          </p>
          <button
            onClick={onOpenStudio}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>Create First Synthesis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Title & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Synthesis Archive</span>
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {history.length} {history.length === 1 ? 'Creation' : 'Creations'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access, download, favorite, batch export, or post-process your generative outputs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-amber-400 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Images
            </button>
            <button
              onClick={() => setFilter('favorites')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                filter === 'favorites'
                  ? 'bg-amber-400 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Favorites</span>
            </button>
          </div>

          <button
            onClick={handleDownloadAllZip}
            disabled={isZipping || displayedImages.length === 0}
            className="px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            title="Download all displayed images as a ZIP archive"
          >
            {isZipping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isZipping ? 'Archiving...' : 'Download ZIP'}</span>
          </button>

          <button
            onClick={onClearHistory}
            className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            title="Clear all saved history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Archive</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedImages.map((img) => (
          <div
            key={img.id}
            className="group bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all flex flex-col justify-between"
          >
            {/* Visual Frame */}
            <div className="relative aspect-square bg-slate-950 overflow-hidden">
              <img
                src={img.url}
                alt={img.prompt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onToggleFavorite(img.id)}
                    className={`p-2 rounded-lg backdrop-blur-sm transition-colors ${
                      img.isFavorite
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${img.isFavorite ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => onDeleteImage(img.id)}
                    className="p-2 rounded-lg bg-slate-900/80 hover:bg-rose-900/80 text-slate-400 hover:text-rose-300 backdrop-blur-sm transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onRemixInStudio({
                        prompt: img.prompt,
                        style: img.style,
                        lighting: img.lighting,
                        camera: img.camera,
                        aspectRatio: img.aspectRatio,
                      })
                    }
                    className="flex-1 py-1.5 px-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Remix</span>
                  </button>

                  <button
                    onClick={() => onOpenInCanvas(img)}
                    className="py-1.5 px-2.5 text-xs font-medium text-white bg-slate-800/90 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Canvas</span>
                  </button>

                  <button
                    onClick={() => handleDownload(img)}
                    className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
                    title="Download Image"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Prompt details */}
            <div className="p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                <span className="font-mono text-[11px] text-amber-400">{img.aspectRatio}</span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{img.style || 'Custom Style'}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[11px] text-slate-500">
                  {new Date(img.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-sans mb-3">
                {img.prompt}
              </p>

              <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-800/80 text-slate-400">
                <span className="text-[11px] font-mono text-slate-500 truncate max-w-[150px]">{img.model}</span>
                <button
                  onClick={() => handleCopy(img.id, img.prompt)}
                  className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === img.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
