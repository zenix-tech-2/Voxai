import React, { useState, useRef, useEffect } from 'react';
import { ClipItem, CropConfig } from '../../types/videoEditor';
import { Crop, X, Check, RotateCcw, Maximize2, Move } from 'lucide-react';

interface CropModalProps {
  isOpen: boolean;
  clip: ClipItem | null;
  onClose: () => void;
  onSaveCrop: (clipId: string, crop: CropConfig | undefined) => void;
}

export const CropModal: React.FC<CropModalProps> = ({
  isOpen,
  clip,
  onClose,
  onSaveCrop,
}) => {
  const [aspectPreset, setAspectPreset] = useState<'free' | '16:9' | '9:16' | '1:1' | '4:5' | '2:3'>(
    clip?.crop?.aspectPreset || 'free'
  );

  // Normalized crop bounds (0 to 1)
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: clip?.crop?.x ?? 0.1,
    y: clip?.crop?.y ?? 0.1,
    width: clip?.crop?.width ?? 0.8,
    height: clip?.crop?.height ?? 0.8,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'move' | 'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialBox, setInitialBox] = useState(cropBox);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (clip?.crop?.enabled) {
      setCropBox({
        x: clip.crop.x,
        y: clip.crop.y,
        width: clip.crop.width,
        height: clip.crop.height,
      });
      setAspectPreset(clip.crop.aspectPreset || 'free');
    } else {
      setCropBox({ x: 0.05, y: 0.05, width: 0.9, height: 0.9 });
      setAspectPreset('free');
    }
  }, [clip, isOpen]);

  if (!isOpen || !clip) return null;

  const handlePresetChange = (preset: 'free' | '16:9' | '9:16' | '1:1' | '4:5' | '2:3') => {
    setAspectPreset(preset);
    let ratio = 1.0;
    if (preset === '16:9') ratio = 16 / 9;
    else if (preset === '9:16') ratio = 9 / 16;
    else if (preset === '1:1') ratio = 1.0;
    else if (preset === '4:5') ratio = 4 / 5;
    else if (preset === '2:3') ratio = 2 / 3;

    if (preset === 'free') {
      return;
    }

    // Adjust crop box to match ratio
    setCropBox((prev) => {
      let newW = prev.width;
      let newH = newW / ratio;
      if (newH > 0.9) {
        newH = 0.9;
        newW = newH * ratio;
      }
      return {
        x: Math.max(0, Math.min(1 - newW, 0.5 - newW / 2)),
        y: Math.max(0, Math.min(1 - newH, 0.5 - newH / 2)),
        width: newW,
        height: newH,
      };
    });
  };

  const handleMouseDown = (type: 'move' | 'nw' | 'ne' | 'sw' | 'se', e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragType(type);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialBox(cropBox);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragType || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = (e.clientX - dragStart.x) / rect.width;
    const deltaY = (e.clientY - dragStart.y) / rect.height;

    setCropBox(() => {
      let { x, y, width, height } = initialBox;

      if (dragType === 'move') {
        x = Math.max(0, Math.min(1 - width, x + deltaX));
        y = Math.max(0, Math.min(1 - height, y + deltaY));
      } else if (dragType === 'se') {
        width = Math.max(0.2, Math.min(1 - x, width + deltaX));
        height = Math.max(0.2, Math.min(1 - y, height + deltaY));
      } else if (dragType === 'nw') {
        const newX = Math.max(0, Math.min(x + width - 0.2, x + deltaX));
        const newY = Math.max(0, Math.min(y + height - 0.2, y + deltaY));
        width = width + (x - newX);
        height = height + (y - newY);
        x = newX;
        y = newY;
      }

      return { x, y, width, height };
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragType(null);
  };

  const handleApply = () => {
    onSaveCrop(clip.id, {
      enabled: true,
      x: cropBox.x,
      y: cropBox.y,
      width: cropBox.width,
      height: cropBox.height,
      aspectPreset,
    });
    onClose();
  };

  const handleReset = () => {
    onSaveCrop(clip.id, undefined);
    onClose();
  };

  const mediaSrc = clip.mediaUrl || clip.thumbnailUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Recadrer la Vidéo (Crop & Reframe)</h3>
              <p className="text-[11px] text-slate-400">
                Ajustez le cadre pour adapter vos vidéos à TikTok, Reels, Shorts ou YouTube.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Aspect Ratio Presets Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 border-b border-slate-800 overflow-x-auto text-xs">
          <span className="text-slate-400 text-[11px] font-semibold mr-1">Ratios :</span>
          {[
            { id: 'free', label: 'Libre' },
            { id: '9:16', label: '9:16 TikTok/Reels' },
            { id: '16:9', label: '16:9 YouTube/TV' },
            { id: '1:1', label: '1:1 Carré' },
            { id: '4:5', label: '4:5 Instagram' },
            { id: '2:3', label: '2:3 Portrait' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handlePresetChange(item.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                aspectPreset === item.id
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Interactive Visual Crop Canvas Area */}
        <div
          className="p-6 bg-slate-950 flex items-center justify-center min-h-[340px] select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div
            ref={containerRef}
            className="relative max-w-full max-h-[320px] aspect-video border border-slate-800 rounded-lg overflow-hidden bg-slate-900"
          >
            {mediaSrc ? (
              <img
                src={mediaSrc}
                alt="Crop preview"
                className="w-full h-full object-cover pointer-events-none opacity-40"
              />
            ) : (
              <div className="w-full h-full bg-slate-850 flex items-center justify-center text-xs text-slate-500">
                Aperçu Vidéo
              </div>
            )}

            {/* Clear uncropped window showing full bright image */}
            <div
              className="absolute border-2 border-cyan-400 shadow-2xl cursor-move overflow-hidden"
              style={{
                left: `${cropBox.x * 100}%`,
                top: `${cropBox.y * 100}%`,
                width: `${cropBox.width * 100}%`,
                height: `${cropBox.height * 100}%`,
              }}
              onMouseDown={(e) => handleMouseDown('move', e)}
            >
              {/* Highlight interior grid lines */}
              <div className="w-full h-full border border-cyan-400/40 relative pointer-events-none">
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-cyan-400/30" />
                <div className="absolute right-1/3 top-0 bottom-0 w-px bg-cyan-400/30" />
                <div className="absolute top-1/3 left-0 right-0 h-px bg-cyan-400/30" />
                <div className="absolute bottom-1/3 left-0 right-0 h-px bg-cyan-400/30" />
              </div>

              {/* Corner Handles */}
              <div
                className="absolute top-0 left-0 w-3 h-3 bg-white border border-cyan-500 cursor-nwse-resize"
                onMouseDown={(e) => handleMouseDown('nw', e)}
              />
              <div
                className="absolute bottom-0 right-0 w-3 h-3 bg-white border border-cyan-500 cursor-nwse-resize"
                onMouseDown={(e) => handleMouseDown('se', e)}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border-t border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser (Sans recadrage)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Appliquer le Recadrage</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
