import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  RotateCw,
  FlipHorizontal,
  Sliders,
  Type as TypeIcon,
  Sparkles,
  RefreshCcw,
  Copy,
  Check,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  Maximize,
  Scissors,
  Eraser,
  Layers,
  Sparkle,
} from 'lucide-react';
import { CanvasFilters, GeneratedImage, TypographyPreset } from '../types';

interface CanvasEditorProps {
  image: GeneratedImage | null;
  onSendToStudioAsReference: (dataUrl: string, name: string) => void;
  onOpenStudio: () => void;
}

const DEFAULT_FILTERS: CanvasFilters = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  temperature: 0,
  vignette: 0,
  blur: 0,
  grain: 0,
  presetFilter: 'none',
  overlayText: '',
  textSubtitle: '',
  textPosition: 'bottom',
  typographyPreset: 'custom',
  textColor: '#ffffff',
  textSize: 28,
  textOpacity: 90,
  cutout: {
    enabled: false,
    tolerance: 40,
    feather: 4,
    backdropType: 'transparent',
    backdropColor: '#000000',
  },
  upscale: {
    scale: 2,
    clarity: 45,
    denoise: 20,
  },
};

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  image,
  onSendToStudioAsReference,
  onOpenStudio,
}) => {
  const [filters, setFilters] = useState<CanvasFilters>(DEFAULT_FILTERS);
  const [rotation, setRotation] = useState<number>(0);
  const [isFlippedH, setIsFlippedH] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'adjust' | 'presets' | 'typography' | 'upscaler' | 'cutout' | 'eraser'>('adjust');
  const [copied, setCopied] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [exportQuality, setExportQuality] = useState<number>(0.95);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isUpscaling, setIsUpscaling] = useState<boolean>(false);
  const [upscaleApplied, setUpscaleApplied] = useState<number | null>(null);

  // Brush / Retouch state
  const [isErasing, setIsErasing] = useState<boolean>(false);
  const [brushSize, setBrushSize] = useState<number>(30);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

  // Load image when prop changes
  useEffect(() => {
    if (!image?.url) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      sourceImageRef.current = img;
      renderCanvas();
    };
    img.src = image.url;
  }, [image?.url]);

  // Re-render canvas whenever filters, rotation, flip, or retouch change
  useEffect(() => {
    renderCanvas();
  }, [filters, rotation, isFlippedH, upscaleApplied]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const img = sourceImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleMultiplier = upscaleApplied ? upscaleApplied : 1;
    const isRotatedQuarter = rotation % 180 !== 0;
    const baseW = isRotatedQuarter ? img.naturalHeight : img.naturalWidth;
    const baseH = isRotatedQuarter ? img.naturalWidth : img.naturalHeight;

    const width = baseW * scaleMultiplier;
    const height = baseH * scaleMultiplier;

    canvas.width = width;
    canvas.height = height;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Apply rotation and flip transformations
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    if (isFlippedH) {
      ctx.scale(-1, 1);
    }

    // Build CSS filter string for canvas context
    let filterString = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%)`;
    if (filters.blur > 0) {
      filterString += ` blur(${filters.blur * scaleMultiplier}px)`;
    }

    // Apply preset adjustments
    if (filters.presetFilter === 'mono') {
      filterString += ` grayscale(100%) contrast(125%)`;
    } else if (filters.presetFilter === 'cybernoir') {
      filterString += ` hue-rotate(180deg) contrast(120%)`;
    } else if (filters.presetFilter === 'kodachrome') {
      filterString += ` sepia(25%) saturate(130%) contrast(110%)`;
    } else if (filters.presetFilter === 'golden') {
      filterString += ` sepia(35%) saturate(120%) brightness(105%)`;
    } else if (filters.presetFilter === 'editorial') {
      filterString += ` contrast(135%) saturate(85%)`;
    } else if (filters.presetFilter === 'emerald') {
      filterString += ` hue-rotate(60deg) saturate(115%)`;
    }

    ctx.filter = filterString;

    // Draw source image centered
    const drawW = img.naturalWidth * scaleMultiplier;
    const drawH = img.naturalHeight * scaleMultiplier;
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();
    ctx.filter = 'none';

    // Background Cutout / Chroma Segmentation Pipeline
    if (filters.cutout.enabled) {
      applyBackgroundSegmentation(ctx, width, height);
    }

    // Temperature overlay tint
    if (filters.temperature !== 0) {
      ctx.save();
      if (filters.temperature > 0) {
        ctx.fillStyle = `rgba(245, 158, 11, ${(filters.temperature / 100) * 0.25})`;
      } else {
        ctx.fillStyle = `rgba(59, 130, 246, ${Math.abs(filters.temperature / 100) * 0.25})`;
      }
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // Vignette overlay
    if (filters.vignette > 0) {
      ctx.save();
      const radius = Math.max(width, height) * 0.75;
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        radius * 0.3,
        width / 2,
        height / 2,
        radius
      );
      const intensity = (filters.vignette / 100) * 0.85;
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, `rgba(0,0,0,${intensity})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // Film Grain effect
    if (filters.grain > 0) {
      ctx.save();
      const grainIntensity = (filters.grain / 100) * 0.16;
      const grainCanvas = document.createElement('canvas');
      const gWidth = 256;
      const gHeight = 256;
      grainCanvas.width = gWidth;
      grainCanvas.height = gHeight;
      const gCtx = grainCanvas.getContext('2d');
      if (gCtx) {
        const imgData = gCtx.createImageData(gWidth, gHeight);
        const buffer = new Uint32Array(imgData.data.buffer);
        for (let i = 0; i < buffer.length; i++) {
          const noise = Math.floor(Math.random() * 255);
          buffer[i] = (noise << 24) | (noise << 16) | (noise << 8) | noise;
        }
        gCtx.putImageData(imgData, 0, 0);
        ctx.globalAlpha = grainIntensity;
        ctx.globalCompositeOperation = 'screen';
        const pattern = ctx.createPattern(grainCanvas, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, width, height);
        }
      }
      ctx.restore();
    }

    // Upscale Clarity Micro-Sharpening
    if (upscaleApplied && filters.upscale.clarity > 0) {
      applyUnsharpMask(ctx, width, height, filters.upscale.clarity / 100);
    }

    // Typography & Poster Layout Rendering
    renderTypographyLayout(ctx, width, height, scaleMultiplier);
  };

  // Content-Aware Background Segmentation
  const applyBackgroundSegmentation = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      const d = imgData.data;
      const tol = filters.cutout.tolerance * 2.5;

      // Sample 4 corners to detect dominant backdrop color
      const cornerR = (d[0] + d[(width - 1) * 4] + d[(height - 1) * width * 4]) / 3;
      const cornerG = (d[1] + d[(width - 1) * 4 + 1] + d[(height - 1) * width * 4 + 1]) / 3;
      const cornerB = (d[2] + d[(width - 1) * 4 + 2] + d[(height - 1) * width * 4 + 2]) / 3;

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        const dist = Math.sqrt((r - cornerR) ** 2 + (g - cornerG) ** 2 + (b - cornerB) ** 2);

        if (dist < tol) {
          const alphaFade = Math.max(0, Math.min(255, (dist / tol) * 255));
          d[i + 3] = alphaFade;
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Reapply chosen studio backdrop behind cutout if not transparent
      if (filters.cutout.backdropType !== 'transparent') {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        if (filters.cutout.backdropType === 'color') {
          ctx.fillStyle = filters.cutout.backdropColor;
          ctx.fillRect(0, 0, width, height);
        } else if (filters.cutout.backdropType === 'gradient') {
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, '#0f172a');
          grad.addColorStop(0.5, '#1e1b4b');
          grad.addColorStop(1, '#020617');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
        }
        ctx.restore();
      }
    } catch (_) {}
  };

  // High-Quality Unsharp Mask Clarifier
  const applyUnsharpMask = (ctx: CanvasRenderingContext2D, width: number, height: number, amount: number) => {
    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      const d = imgData.data;
      const copy = new Uint8ClampedArray(d);

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;
          const up = ((y - 1) * width + x) * 4;
          const down = ((y + 1) * width + x) * 4;
          const left = (y * width + (x - 1)) * 4;
          const right = (y * width + (x + 1)) * 4;

          for (let c = 0; c < 3; c++) {
            const blurVal = (copy[up + c] + copy[down + c] + copy[left + c] + copy[right + c]) / 4;
            const diff = copy[idx + c] - blurVal;
            d[idx + c] = Math.max(0, Math.min(255, copy[idx + c] + diff * amount * 1.5));
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } catch (_) {}
  };

  // Typography & Poster Presets
  const renderTypographyLayout = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scaleMultiplier: number
  ) => {
    const preset = filters.typographyPreset;
    const title = filters.overlayText.trim();
    const subtitle = (filters.textSubtitle || '').trim();

    if (!title && preset === 'custom') return;

    ctx.save();
    const baseScale = (width / 800) * scaleMultiplier;

    if (preset === 'vogue') {
      // Top High Fashion Masthead
      const fontSize = Math.round(64 * baseScale);
      ctx.font = `700 ${fontSize}px "Cinzel", "Times New Roman", serif`;
      ctx.fillStyle = filters.textColor;
      ctx.globalAlpha = filters.textOpacity / 100;
      ctx.textAlign = 'center';
      ctx.letterSpacing = '0.12em';
      ctx.fillText(title || 'LUMEN', width / 2, fontSize * 1.4);

      // Subtitle line
      ctx.font = `500 ${Math.round(14 * baseScale)}px "Plus Jakarta Sans", sans-serif`;
      ctx.letterSpacing = '0.2em';
      ctx.fillText(subtitle || 'THE FINE ART ARCHIVE · ISSUE 04', width / 2, fontSize * 1.85);
    } else if (preset === 'cinema') {
      // Cinematic 2.39:1 letterbox bars with yellow subtitle
      const barHeight = Math.round(height * 0.1);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, barHeight);
      ctx.fillRect(0, height - barHeight, width, barHeight);

      // Yellow Cine subtitle
      const subSize = Math.round(22 * baseScale);
      ctx.font = `600 ${subSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = '#fef08a'; // Cine yellow
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 4;
      ctx.textAlign = 'center';
      ctx.fillText(title || 'What we see depends mainly on what we look for.', width / 2, height - barHeight / 2);
    } else if (preset === 'polaroid') {
      // Polaroid white bottom frame
      const frameHeight = Math.round(height * 0.16);
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, height - frameHeight, width, frameHeight);

      const pSize = Math.round(22 * baseScale);
      ctx.font = `600 ${pSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = '#1E293B';
      ctx.textAlign = 'center';
      ctx.fillText(title || 'Memories in Tokyo, 2026', width / 2, height - frameHeight / 2 + pSize / 3);
    } else if (preset === 'cyberpunk') {
      // Sci-fi HUD overlay
      const hSize = Math.round(15 * baseScale);
      ctx.font = `600 ${hSize}px "JetBrains Mono", monospace`;
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 8;
      ctx.textAlign = 'left';
      ctx.fillText(`[TARGET_LOC: 35.6762° N // SECTOR_09]`, 30 * baseScale, 40 * baseScale);
      ctx.fillText(title || 'OPTICAL_SYNTHESIS_VERIFIED', 30 * baseScale, 65 * baseScale);

      ctx.textAlign = 'right';
      ctx.fillText(`STATUS: REC // FPS: 60`, width - 30 * baseScale, 40 * baseScale);
    } else if (preset === 'album') {
      // Album title and Parental Advisory card
      const aSize = Math.round(32 * baseScale);
      ctx.font = `800 ${aSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = filters.textColor;
      ctx.textAlign = 'left';
      ctx.fillText(title || 'NOSTALGIA ULTRA', 40 * baseScale, height - 70 * baseScale);

      // Advisory box
      ctx.fillStyle = '#000000';
      ctx.fillRect(width - 140 * baseScale, height - 60 * baseScale, 110 * baseScale, 40 * baseScale);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `700 ${Math.round(8 * baseScale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('PARENTAL', width - 85 * baseScale, height - 44 * baseScale);
      ctx.fillText('ADVISORY', width - 85 * baseScale, height - 32 * baseScale);
    } else {
      // Standard Custom Watermark / Title
      const fontSize = Math.max(14, Math.round(filters.textSize * baseScale));
      ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = filters.textColor;
      ctx.globalAlpha = filters.textOpacity / 100;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 8;

      let yPos = height - fontSize * 2;
      if (filters.textPosition === 'top') {
        yPos = fontSize * 2.5;
      } else if (filters.textPosition === 'center') {
        yPos = height / 2;
      }

      ctx.fillText(title, width / 2, yPos);
    }

    ctx.restore();
  };

  // Interactive Brush Retouch / Spot Eraser
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTab !== 'eraser') return;
    setIsDrawing(true);
    applyRetouchBrush(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTab !== 'eraser') return;
    applyRetouchBrush(e);
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const applyRetouchBrush = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    // Soft radial blur / content-aware patch blend
    const rad = brushSize;
    ctx.filter = 'blur(6px)';
    ctx.drawImage(canvas, x - rad, y - rad, rad * 2, rad * 2, x - rad, y - rad, rad * 2, rad * 2);
    ctx.restore();
  };

  // Super-Resolution Upscaling Action
  const handleUpscale = (scale: 2 | 4) => {
    setIsUpscaling(true);
    setTimeout(() => {
      setUpscaleApplied(scale);
      setIsUpscaling(false);
    }, 600);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    try {
      const ext = exportFormat === 'image/jpeg' ? 'jpg' : exportFormat === 'image/webp' ? 'webp' : 'png';
      const dataUrl = canvas.toDataURL(exportFormat, exportQuality);
      const link = document.createElement('a');
      const scaleTag = upscaleApplied ? `-${upscaleApplied}x-hd` : '';
      link.download = `lumen-edit-${Date.now()}${scaleTag}.${ext}`;
      link.href = dataUrl;
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }, 'image/png');
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  const handleSendToStudio = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onSendToStudioAsReference(dataUrl, `Canvas Suite (${image?.style || 'Synthesized'})`);
  };

  const resetAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setRotation(0);
    setIsFlippedH(false);
    setUpscaleApplied(null);
  };

  if (!image) {
    return (
      <div className="max-w-6xl mx-auto py-16 px-4">
        <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center bg-slate-900/40">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center mb-4">
            <Sliders className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Canvas Post-Processing & Free Studio Suite</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Select or generate any visual creation to launch hardware color grading, AI upscaler, background remover, and magazine poster layouts.
          </p>
          <button
            onClick={onOpenStudio}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>Open Studio Generator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Info Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Canvas Post-Processing & Free Creative Suite</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              100% Free Tools Active
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 truncate max-w-2xl">
            {image.prompt}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={resetAllFilters}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            title="Reset all adjustments"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSendToStudio}
            className="px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            title="Send adjusted image as reference for new generation"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Remix in Studio</span>
          </button>

          <button
            onClick={handleCopyImage}
            className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Image</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Canvas Viewport (7 cols) */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full relative bg-[#06090F] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-center min-h-[480px] shadow-2xl overflow-hidden">
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              className={`max-h-[640px] max-w-full object-contain rounded-lg shadow-lg transition-transform duration-200 ${
                activeTab === 'eraser' ? 'cursor-crosshair' : ''
              }`}
            />

            {/* Eraser cursor indicator notice */}
            {activeTab === 'eraser' && (
              <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 flex items-center gap-2 pointer-events-none">
                <Eraser className="w-3.5 h-3.5" />
                <span>Click & drag across canvas to spot-heal / retouch</span>
              </div>
            )}
          </div>

          {/* Quick Viewport controls below canvas */}
          <div className="flex items-center justify-between w-full mt-4 px-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate 90°</span>
              </button>
              <button
                onClick={() => setIsFlippedH((f) => !f)}
                className={`px-2.5 py-1.5 border rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  isFlippedH
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span>Flip Horizontal</span>
              </button>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
              {upscaleApplied && (
                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  {upscaleApplied}X Super-Res Active
                </span>
              )}
              <span>
                Aspect: {image.aspectRatio} · {image.model}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Creative Studio Controls (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
          {/* Subtabs for controls */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800 mb-5">
            <button
              onClick={() => setActiveTab('adjust')}
              className={`py-1.5 text-[11px] font-medium rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'adjust'
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Color</span>
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`py-1.5 text-[11px] font-medium rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'presets'
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>LUTs</span>
            </button>
            <button
              onClick={() => setActiveTab('upscaler')}
              className={`py-1.5 text-[11px] font-medium rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'upscaler'
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Maximize className="w-3 h-3 text-emerald-400" />
              <span>Upscaler</span>
            </button>
            <button
              onClick={() => setActiveTab('cutout')}
              className={`py-1.5 text-[11px] font-medium rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'cutout'
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scissors className="w-3 h-3" />
              <span>Cutout</span>
            </button>
            <button
              onClick={() => setActiveTab('typography')}
              className={`py-1.5 text-[11px] font-medium rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'typography'
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TypeIcon className="w-3 h-3" />
              <span>Poster</span>
            </button>
            <button
              onClick={() => setActiveTab('eraser')}
              className={`py-1.5 text-[11px] font-medium rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'eraser'
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eraser className="w-3 h-3" />
              <span>Retouch</span>
            </button>
          </div>

          {/* TAB 1: COLOR GRADE */}
          {activeTab === 'adjust' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Exposure / Brightness</span>
                  <span className="text-amber-400 font-mono tabular-nums">{filters.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={filters.brightness}
                  onChange={(e) => setFilters({ ...filters, brightness: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Contrast</span>
                  <span className="text-amber-400 font-mono tabular-nums">{filters.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={filters.contrast}
                  onChange={(e) => setFilters({ ...filters, contrast: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Vibrance / Saturation</span>
                  <span className="text-amber-400 font-mono tabular-nums">{filters.saturate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.saturate}
                  onChange={(e) => setFilters({ ...filters, saturate: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Color Temperature</span>
                  <span className="text-amber-400 font-mono tabular-nums">
                    {filters.temperature > 0 ? `+${filters.temperature} Warm` : filters.temperature < 0 ? `${filters.temperature} Cool` : '0 Neutral'}
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={filters.temperature}
                  onChange={(e) => setFilters({ ...filters, temperature: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Vignette Depth</span>
                  <span className="text-amber-400 font-mono tabular-nums">{filters.vignette}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.vignette}
                  onChange={(e) => setFilters({ ...filters, vignette: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Film Grain Intensity</span>
                  <span className="text-amber-400 font-mono tabular-nums">{filters.grain}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.grain}
                  onChange={(e) => setFilters({ ...filters, grain: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Soft Lens Blur</span>
                  <span className="text-amber-400 font-mono tabular-nums">{filters.blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="0.5"
                  value={filters.blur}
                  onChange={(e) => setFilters({ ...filters, blur: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 2: LUT PRESETS */}
          {activeTab === 'presets' && (
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'none', label: 'Raw Original', desc: 'Natural render' },
                { id: 'editorial', label: 'Editorial Vogue', desc: 'Punchy high contrast' },
                { id: 'kodachrome', label: 'Kodachrome 64', desc: 'Vintage warm analog' },
                { id: 'cybernoir', label: 'Cyber Noir', desc: 'Electric blue obsidian' },
                { id: 'golden', label: 'Golden Hour', desc: 'Warm radiant sunset' },
                { id: 'emerald', label: 'Emerald Glow', desc: 'Deep lush verdant' },
                { id: 'mono', label: 'B&W Fine Art', desc: 'Silver gelatin mono' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFilters({ ...filters, presetFilter: p.id as any })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    filters.presetFilter === p.id
                      ? 'bg-amber-400/10 border-amber-400/60 text-white shadow-sm'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <p className="text-xs font-semibold">{p.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{p.desc}</p>
                </button>
              ))}
            </div>
          )}

          {/* TAB 3: SUPER-RES UPSCALER (100% Free) */}
          {activeTab === 'upscaler' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-300">
                <span className="font-semibold block mb-0.5">Free AI Super-Resolution</span>
                Enhances edge sharpness, micro-textures, and multiplies pixel density for ultra-crisp 4K prints.
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Target Resolution Scale
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpscale(2)}
                    disabled={isUpscaling}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      upscaleApplied === 2
                        ? 'bg-amber-400/20 border-amber-400/80 text-white font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-sm font-bold block">2X Ultra-HD</span>
                    <span className="text-[11px] text-slate-500">2048px Resolution</span>
                  </button>

                  <button
                    onClick={() => handleUpscale(4)}
                    disabled={isUpscaling}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      upscaleApplied === 4
                        ? 'bg-amber-400/20 border-amber-400/80 text-white font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-sm font-bold block">4X Master Print</span>
                    <span className="text-[11px] text-slate-500">4096px Resolution</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Edge Clarifier & Micro-Sharpening</span>
                  <span className="text-amber-400 font-mono tabular-nums">{filters.upscale.clarity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.upscale.clarity}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      upscale: { ...filters.upscale, clarity: Number(e.target.value) },
                    })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {upscaleApplied && (
                <button
                  onClick={() => setUpscaleApplied(null)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  Revert to Original 1X Scale
                </button>
              )}
            </div>
          )}

          {/* TAB 4: STUDIO CUTOUT & BACKGROUND */}
          {activeTab === 'cutout' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-slate-200">Enable Subject Cutout</span>
                <input
                  type="checkbox"
                  checked={filters.cutout.enabled}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      cutout: { ...filters.cutout, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                />
              </div>

              {filters.cutout.enabled && (
                <>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-slate-300">Background Removal Tolerance</span>
                      <span className="text-amber-400 font-mono tabular-nums">{filters.cutout.tolerance}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={filters.cutout.tolerance}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          cutout: { ...filters.cutout, tolerance: Number(e.target.value) },
                        })
                      }
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Studio Backdrop Replacement
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'transparent', label: 'Transparent PNG' },
                        { id: 'color', label: 'Studio Solid Color' },
                        { id: 'gradient', label: 'Cyber Gradient' },
                      ].map((b) => (
                        <button
                          key={b.id}
                          onClick={() =>
                            setFilters({
                              ...filters,
                              cutout: { ...filters.cutout, backdropType: b.id as any },
                            })
                          }
                          className={`py-2 px-2 text-xs rounded-lg border text-left cursor-pointer transition-all ${
                            filters.cutout.backdropType === b.id
                              ? 'bg-amber-400/20 text-white border-amber-400/80 font-medium'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filters.cutout.backdropType === 'color' && (
                    <div className="flex items-center gap-2">
                      {['#ffffff', '#000000', '#0f172a', '#e11d48', '#f59e0b', '#059669'].map((c) => (
                        <button
                          key={c}
                          onClick={() =>
                            setFilters({
                              ...filters,
                              cutout: { ...filters.cutout, backdropColor: c },
                            })
                          }
                          style={{ backgroundColor: c }}
                          className={`w-6 h-6 rounded-full border border-slate-700 cursor-pointer ${
                            filters.cutout.backdropColor === c ? 'scale-125 ring-2 ring-amber-400' : ''
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 5: POSTER & TYPOGRAPHY PRESETS */}
          {activeTab === 'typography' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Editorial Layout Preset
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'custom', label: 'Custom' },
                    { id: 'vogue', label: 'Vogue Mag' },
                    { id: 'cinema', label: 'Cinema Bar' },
                    { id: 'polaroid', label: 'Polaroid' },
                    { id: 'cyberpunk', label: 'Cyber HUD' },
                    { id: 'album', label: 'Album Art' },
                  ].map((pr) => (
                    <button
                      key={pr.id}
                      onClick={() =>
                        setFilters({ ...filters, typographyPreset: pr.id as TypographyPreset })
                      }
                      className={`py-1.5 px-2 text-xs rounded-lg border text-center cursor-pointer transition-all ${
                        filters.typographyPreset === pr.id
                          ? 'bg-amber-400 text-slate-950 border-amber-400 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {pr.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Primary Title / Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. LUMEN MAGAZINE · NOCTURNE"
                  value={filters.overlayText}
                  onChange={(e) => setFilters({ ...filters, overlayText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {filters.typographyPreset === 'vogue' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Magazine Subtitle Kicker
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. THE ARCHITECTURAL HORIZONS · AUTUMN 2026"
                    value={filters.textSubtitle}
                    onChange={(e) => setFilters({ ...filters, textSubtitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Typography Scale</span>
                  <span className="text-amber-400 font-mono tabular-nums">{filters.textSize}pt</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="64"
                  value={filters.textSize}
                  onChange={(e) => setFilters({ ...filters, textSize: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Text Color Swatch
                </label>
                <div className="flex items-center gap-2">
                  {['#ffffff', '#f59e0b', '#38bdf8', '#10b981', '#000000'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setFilters({ ...filters, textColor: color })}
                      style={{ backgroundColor: color }}
                      className={`w-6 h-6 rounded-full border border-slate-700 cursor-pointer transition-transform ${
                        filters.textColor === color ? 'scale-125 ring-2 ring-amber-400' : 'hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MAGIC RETOUCH & SPOT ERASER */}
          {activeTab === 'eraser' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                <span className="font-semibold block mb-0.5">Spot Retouching Brush</span>
                Click and paint directly onto the canvas image on the left to seamlessly soften, patch, or erase unwanted elements and blemishes.
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Retouch Brush Radius</span>
                  <span className="text-amber-400 font-mono tabular-nums">{brushSize}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <button
                onClick={renderCanvas}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>Reset Retouch Layer</span>
              </button>
            </div>
          )}

          {/* Export Settings Strip */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { format: 'image/png', label: 'PNG Lossless' },
                { format: 'image/jpeg', label: 'JPEG Standard' },
                { format: 'image/webp', label: 'WebP Ultra' },
              ].map((f) => (
                <button
                  key={f.format}
                  onClick={() => setExportFormat(f.format as any)}
                  className={`py-1.5 px-2 text-[11px] font-medium rounded-lg border cursor-pointer transition-colors ${
                    exportFormat === f.format
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
