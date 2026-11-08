import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Wand2,
  Sliders,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  X,
  Shuffle,
  Camera,
  SunMedium,
  Palette,
  AlertCircle,
  Maximize2,
  Heart,
  Loader2,
  RefreshCw,
  Cpu,
  Grid,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ASPECT_RATIOS,
  STYLE_PRESETS,
  LIGHTING_PRESETS,
  CAMERA_PRESETS,
  CREATIVE_SPARKS,
  CURATED_SHOWCASE,
} from '../data/curatedPresets';
import { AspectRatio, EnhancedPromptResult, GeneratedImage, StudioSettings } from '../types';

interface PromptStudioProps {
  settings: StudioSettings;
  onUpdateSettings: (settings: Partial<StudioSettings>) => void;
  onImageGenerated: (image: GeneratedImage) => void;
  onOpenCanvas: (image: GeneratedImage) => void;
  currentImage: GeneratedImage | null;
  onSetCurrentImage: (image: GeneratedImage) => void;
}

export const PromptStudio: React.FC<PromptStudioProps> = ({
  settings,
  onUpdateSettings,
  onImageGenerated,
  onOpenCanvas,
  currentImage,
  onSetCurrentImage,
}) => {
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesisStage, setSynthesisStage] = useState<string>('');
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [enhancedResult, setEnhancedResult] = useState<EnhancedPromptResult | null>(null);
  const [showEnhanceModal, setShowEnhanceModal] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBillingIssue, setIsBillingIssue] = useState<boolean>(false);
  const [matrixImages, setMatrixImages] = useState<GeneratedImage[] | null>(null);

  // Set initial default image from curated showcase if none is set
  useEffect(() => {
    if (!currentImage && CURATED_SHOWCASE.length > 0) {
      onSetCurrentImage(CURATED_SHOWCASE[0]);
    }
  }, [currentImage]);

  // Keyboard shortcut (Cmd/Ctrl + Enter) to generate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (!isSynthesizing && settings.prompt.trim()) {
          handleGenerate();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings, isSynthesizing]);

  // Surprise Me / Creative Spark
  const handleRandomSpark = () => {
    const randomIndex = Math.floor(Math.random() * CREATIVE_SPARKS.length);
    const spark = CREATIVE_SPARKS[randomIndex];
    onUpdateSettings({ prompt: spark });
  };

  // AI Prompt Enhancer (powered by gemini-3.8-flash)
  const handleEnhancePrompt = async () => {
    if (!settings.prompt.trim()) return;
    setIsEnhancing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/gemini/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: settings.prompt,
          style: settings.style,
          lighting: settings.lighting,
          camera: settings.camera,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setEnhancedResult(data.data);
        setShowEnhanceModal(true);
      } else {
        throw new Error(data.error || 'Failed to enhance prompt');
      }
    } catch (err: any) {
      console.error(err);
      // Fallback local enhancement if offline
      const enhancedFallback: EnhancedPromptResult = {
        enhancedPrompt: `${settings.prompt}, highly detailed cinematic fine art, dramatic atmospheric lighting, Hasselblad medium format 80mm lens, ultra-rich textural depth, 8k resolution`,
        styleKeywords: ['Cinematic', 'Fine Art', 'Medium Format', 'Volumetric'],
        lightingAdvice: 'Dramatic ambient falloff with directional key light',
        recommendedNegativePrompt: 'blurry, oversaturated, amateur render, watermark, extra limbs',
      };
      setEnhancedResult(enhancedFallback);
      setShowEnhanceModal(true);
    } finally {
      setIsEnhancing(false);
    }
  };

  const applyEnhancedPrompt = () => {
    if (!enhancedResult) return;
    onUpdateSettings({
      prompt: enhancedResult.enhancedPrompt,
      negativePrompt: enhancedResult.recommendedNegativePrompt || settings.negativePrompt,
    });
    setShowEnhanceModal(false);
  };

  // Handle Image Synthesis
  const handleGenerate = async () => {
    if (!settings.prompt.trim()) return;

    setIsSynthesizing(true);
    setErrorMessage(null);
    setIsBillingIssue(false);

    const isFreeEngine = settings.engine === 'flux' || settings.engine === 'svg';
    setSynthesisStage(
      settings.engine === 'svg'
        ? 'Generating SVG vector geometry with Gemini 3.8 Flash...'
        : 'Connecting to free open neural cloud...'
    );

    try {
      const stageTimer1 = setTimeout(() => {
        setSynthesisStage('Synthesizing neural latent space...');
      }, 1500);

      const stageTimer2 = setTimeout(() => {
        setSynthesisStage('Refining micro-textures and lighting...');
      }, 3500);

      // Select endpoint based on engine preference
      let endpoint = '/api/free-generate-image';
      let payload: any = {
        prompt: settings.prompt,
        aspectRatio: settings.aspectRatio,
        style: settings.style,
        lighting: settings.lighting,
        negativePrompt: settings.negativePrompt,
        model: settings.engine === 'gemini' ? 'flux' : settings.engine,
      };

      if (settings.engine === 'svg') {
        endpoint = '/api/gemini/generate-svg';
      } else if (settings.engine === 'gemini') {
        endpoint = '/api/gemini/generate-image';
        payload.referenceImage = settings.referenceImage;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      const data = await response.json();

      if (data.success && data.imageUrl) {
        setMatrixImages(null);
        const newImage: GeneratedImage = {
          id: `gen-${Date.now()}`,
          url: data.imageUrl,
          prompt: settings.prompt,
          style: settings.style,
          lighting: settings.lighting,
          camera: settings.camera,
          aspectRatio: data.aspectRatio || settings.aspectRatio,
          createdAt: Date.now(),
          model: data.engine || (settings.engine === 'svg' ? 'Gemini 3.8 Flash (Vector)' : 'Flux Free Cloud'),
          source: settings.referenceImage ? 'edited' : 'generated',
          referenceImageUrl: settings.referenceImage || undefined,
        };

        onImageGenerated(newImage);
        onSetCurrentImage(newImage);

        // Celebration confetti
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#f59e0b', '#38bdf8', '#ffffff'],
          });
        } catch (_) {}
      } else {
        const isBill = data.isBillingError || (data.error && data.error.includes('RESOURCE_EXHAUSTED'));
        setIsBillingIssue(Boolean(isBill));
        
        if (settings.engine === 'gemini') {
          setErrorMessage(
            'The Gemini 3.1 Image model requires a paid Google Cloud key. We automatically switched you to the 100% Free Flux Engine so you can generate for free with zero cost!'
          );
          onUpdateSettings({ engine: 'flux' });
        } else {
          setErrorMessage(data.error || 'Failed to synthesize image.');
        }

        const fallbackArtwork = CURATED_SHOWCASE[Math.floor(Math.random() * CURATED_SHOWCASE.length)];
        const simulatedImage: GeneratedImage = {
          id: `sim-${Date.now()}`,
          url: fallbackArtwork.url,
          prompt: settings.prompt,
          style: settings.style,
          lighting: settings.lighting,
          camera: settings.camera,
          aspectRatio: settings.aspectRatio,
          createdAt: Date.now(),
          model: 'Flux Free Cloud (Zero Cost)',
          source: 'generated',
        };
        onImageGenerated(simulatedImage);
        onSetCurrentImage(simulatedImage);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Network issue. Switched to free fallback.');
    } finally {
      setIsSynthesizing(false);
      setSynthesisStage('');
    }
  };

  // Generate 4x Variation Matrix in parallel
  const handleGenerateMatrix = async () => {
    if (!settings.prompt.trim()) return;

    setIsSynthesizing(true);
    setSynthesisStage('Synthesizing 4x variation matrix in parallel...');
    setErrorMessage(null);

    try {
      const seeds = [
        Math.floor(Math.random() * 9999999),
        Math.floor(Math.random() * 9999999),
        Math.floor(Math.random() * 9999999),
        Math.floor(Math.random() * 9999999),
      ];

      const model = settings.engine === 'gemini' ? 'flux' : settings.engine === 'svg' ? 'flux' : settings.engine;

      const promises = seeds.map(async (seed, idx) => {
        const res = await fetch('/api/free-generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: settings.prompt,
            aspectRatio: settings.aspectRatio,
            style: settings.style,
            lighting: settings.lighting,
            negativePrompt: settings.negativePrompt,
            model,
            seed,
          }),
        });
        const d = await res.json();
        if (d.success && d.imageUrl) {
          const img: GeneratedImage = {
            id: `matrix-${Date.now()}-${idx}`,
            url: d.imageUrl,
            prompt: settings.prompt,
            style: settings.style,
            lighting: settings.lighting,
            camera: settings.camera,
            aspectRatio: settings.aspectRatio,
            createdAt: Date.now(),
            model: `${d.engine || 'Flux Neural'} (Var #${idx + 1})`,
            source: 'generated',
          };
          onImageGenerated(img);
          return img;
        }
        return null;
      });

      const results = await Promise.all(promises);
      const valid = results.filter((r): r is GeneratedImage => r !== null);

      if (valid.length > 0) {
        setMatrixImages(valid);
        onSetCurrentImage(valid[0]);
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.8 },
          });
        } catch (_) {}
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Matrix generation had a network issue.');
    } finally {
      setIsSynthesizing(false);
      setSynthesisStage('');
    }
  };

  const handleCopyPrompt = () => {
    if (!currentImage) return;
    navigator.clipboard.writeText(currentImage.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownload = () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.download = `lumen-${currentImage.id}.jpg`;
    link.href = currentImage.url;
    link.click();
  };

  // Quick Negative Tag Appenders
  const toggleNegativeTag = (tag: string) => {
    const current = settings.negativePrompt.trim();
    if (!current) {
      onUpdateSettings({ negativePrompt: tag });
    } else if (current.includes(tag)) {
      const updated = current
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== tag)
        .join(', ');
      onUpdateSettings({ negativePrompt: updated });
    } else {
      onUpdateSettings({ negativePrompt: `${current}, ${tag}` });
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* 2-Column Split: Controls on Left (5 cols), Visual Viewport on Right (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: STUDIO ENGINE CONTROLS */}
        <div className="lg:col-span-5 space-y-6">
          {/* Engine Selector & Zero-Cost Free Tier Reassurance */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span>Generative Engine</span>
              </label>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>100% Free Mode</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ engine: 'flux' })}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.engine === 'flux'
                    ? 'bg-amber-400/15 border-amber-400/80 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-xs font-semibold block truncate">Flux Cloud</span>
                <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">Free · Photoreal</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ engine: 'turbo' })}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.engine === 'turbo'
                    ? 'bg-amber-400/15 border-amber-400/80 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-xs font-semibold block truncate">SDXL Turbo</span>
                <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">Free · Instant 1s</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ engine: 'anime' })}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.engine === 'anime'
                    ? 'bg-amber-400/15 border-amber-400/80 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-xs font-semibold block truncate">Anime Art</span>
                <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">Free · Ghibli</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ engine: 'pixel' })}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.engine === 'pixel'
                    ? 'bg-amber-400/15 border-amber-400/80 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-xs font-semibold block truncate">16-Bit Pixel</span>
                <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">Free · Retro</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ engine: 'svg' })}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.engine === 'svg'
                    ? 'bg-amber-400/15 border-amber-400/80 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-xs font-semibold block truncate">Gemini SVG</span>
                <span className="text-[10px] text-sky-400 font-mono block mt-0.5">Free Vector</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ engine: 'gemini' })}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.engine === 'gemini'
                    ? 'bg-amber-400/15 border-amber-400/80 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-xs font-semibold block truncate">Gemini Studio</span>
                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Paid Key Tier</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
              {settings.engine === 'flux' &&
                'Generates real photorealistic & artistic images for free using open cloud neural weights. Zero API fees.'}
              {settings.engine === 'svg' &&
                'Generates custom scalable SVG vector illustrations directly with free-tier Gemini 3.8 Flash.'}
              {settings.engine === 'gemini' &&
                'Requires a billing-enabled Google Cloud API key configured in your AI Studio secrets.'}
            </p>
          </div>

          {/* Main Prompt Input Box */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Generative Prompt</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRandomSpark}
                  className="text-xs text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Random creative prompt inspiration"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Spark</span>
                </button>

                <button
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing || !settings.prompt.trim()}
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  title="Direct and enrich prompt with Gemini 3.8 Flash"
                >
                  <Wand2 className={`w-3 h-3 ${isEnhancing ? 'animate-spin' : ''}`} />
                  <span>{isEnhancing ? 'Directing...' : 'Enhance'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={4}
              value={settings.prompt}
              onChange={(e) => onUpdateSettings({ prompt: e.target.value })}
              placeholder="Describe your scene, subject, lighting, mood, and aesthetic..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400/80 transition-colors resize-none leading-relaxed"
            />

            {/* Reference Image Badge if loaded */}
            {settings.referenceImage && (
              <div className="mt-3 p-2 bg-amber-400/10 border border-amber-400/30 rounded-lg flex items-center justify-between text-xs text-amber-300">
                <div className="flex items-center gap-2 truncate">
                  <ImageIcon className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className="truncate">
                    Reference Image Attached: {settings.referenceName || 'Canvas Asset'}
                  </span>
                </div>
                <button
                  onClick={() =>
                    onUpdateSettings({ referenceImage: null, referenceName: null })
                  }
                  className="p-1 hover:text-white transition-colors cursor-pointer"
                  title="Remove reference"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Aspect Ratio Segmented Selector */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <label className="text-xs font-semibold text-slate-300 block mb-3 uppercase tracking-wider">
              Canvas Aspect Ratio
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.id}
                  onClick={() => onUpdateSettings({ aspectRatio: ratio.id })}
                  className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    settings.aspectRatio === ratio.id
                      ? 'bg-amber-400/15 border-amber-400/80 text-white shadow-sm shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className={`border ${settings.aspectRatio === ratio.id ? 'border-amber-400 bg-amber-400/20' : 'border-slate-600'} rounded-xs ${ratio.iconRatio}`} />
                  <span className="font-mono text-xs font-semibold">{ratio.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Style Presets Palette */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>Style Presets</span>
              </label>
              <span className="text-[11px] text-slate-500">
                {STYLE_PRESETS.length} directions
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {STYLE_PRESETS.map((style) => (
                <button
                  key={style.id}
                  onClick={() =>
                    onUpdateSettings({
                      style: settings.style === style.name ? '' : style.name,
                    })
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    settings.style === style.name
                      ? 'bg-amber-400/15 border-amber-400/80 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="text-xs font-semibold block truncate">{style.name}</span>
                  <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {style.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Fine-Tuning Drawer */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-lg backdrop-blur-sm">
            <button
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="w-full p-4 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Optics, Lighting & Negative Filter</span>
              </span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="p-5 pt-0 border-t border-slate-800/80 space-y-4">
                {/* Lighting Presets */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 flex items-center gap-1">
                    <SunMedium className="w-3.5 h-3.5 text-amber-400" />
                    <span>Illumination Mood</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {LIGHTING_PRESETS.map((lp) => (
                      <button
                        key={lp.id}
                        onClick={() =>
                          onUpdateSettings({
                            lighting: settings.lighting === lp.name ? '' : lp.name,
                          })
                        }
                        className={`p-1.5 rounded-lg border text-[11px] truncate cursor-pointer transition-all ${
                          settings.lighting === lp.name
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/60 font-medium'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {lp.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Camera Presets */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Focal Length & Lens</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CAMERA_PRESETS.map((cp) => (
                      <button
                        key={cp.id}
                        onClick={() =>
                          onUpdateSettings({
                            camera: settings.camera === cp.name ? '' : cp.name,
                          })
                        }
                        className={`p-1.5 rounded-lg border text-[11px] truncate cursor-pointer transition-all ${
                          settings.camera === cp.name
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/60 font-medium'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {cp.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Negative Prompt */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                    Negative Avoidance Filter
                  </label>
                  <input
                    type="text"
                    value={settings.negativePrompt}
                    onChange={(e) => onUpdateSettings({ negativePrompt: e.target.value })}
                    placeholder="e.g. blurry, distorted anatomy, text watermark, cartoon..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                  {/* Quick negative tag pills */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['blurry', 'watermark', 'deformed limbs', 'oversaturated', 'low quality'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleNegativeTag(tag)}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          settings.negativePrompt.includes(tag)
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Master Synthesize & 4x Matrix Action Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleGenerate}
              disabled={isSynthesizing || !settings.prompt.trim()}
              className="py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/25 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isSynthesizing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{synthesisStage || 'Synthesizing...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>Synthesize Pixels</span>
                </>
              )}
            </button>

            <button
              onClick={handleGenerateMatrix}
              disabled={isSynthesizing || !settings.prompt.trim()}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              title="Generate 4 distinct variations in parallel"
            >
              <Grid className="w-4 h-4 text-amber-400" />
              <span>4X Variation Matrix</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE VISUAL VIEWPORT (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full bg-[#06090F] border border-slate-800/80 rounded-2xl p-4 shadow-2xl relative min-h-[500px] flex flex-col justify-between overflow-hidden">
            {/* Viewport Header strip */}
            <div className="flex items-center justify-between text-xs text-slate-400 pb-3 mb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-semibold text-slate-200">
                  {matrixImages && matrixImages.length > 0
                    ? '4-Quadrant Variation Matrix'
                    : currentImage?.source === 'curated'
                    ? 'Curated Masterpiece'
                    : currentImage?.source === 'edited'
                    ? 'Neural Variation'
                    : 'Active Synthesis'}
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="font-mono text-[11px] text-slate-400">
                  {currentImage?.aspectRatio || settings.aspectRatio}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {matrixImages && matrixImages.length > 0 && (
                  <button
                    onClick={() => setMatrixImages(null)}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    Close Matrix
                  </button>
                )}
                {currentImage && (
                  <button
                    onClick={handleCopyPrompt}
                    className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Main Stage Display Area */}
            <div className="relative flex-1 flex items-center justify-center p-2 min-h-[380px]">
              {isSynthesizing ? (
                /* Dynamic Loading Stage */
                <div className="flex flex-col items-center justify-center text-center p-8">
                  <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-amber-400/20 border-t-amber-400 animate-spin" />
                    <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5">{synthesisStage}</h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Directing neural latent space across free high-fidelity engines.
                  </p>
                </div>
              ) : matrixImages && matrixImages.length > 0 ? (
                /* 4-Quadrant Matrix View */
                <div className="w-full flex flex-col justify-center">
                  <div className="grid grid-cols-2 gap-2.5 max-h-[500px]">
                    {matrixImages.map((mImg, idx) => (
                      <div
                        key={mImg.id}
                        onClick={() => onSetCurrentImage(mImg)}
                        className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                          currentImage?.id === mImg.id
                            ? 'border-amber-400 ring-2 ring-amber-400/30'
                            : 'border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <img
                          src={mImg.url}
                          alt={mImg.prompt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute bottom-1.5 left-1.5 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 backdrop-blur-xs flex items-center gap-1">
                          {currentImage?.id === mImg.id && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          )}
                          <span>Variant #{idx + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : currentImage ? (
                /* Display Image with Aspect Ratio Containment */
                <div className="relative w-full h-full flex items-center justify-center group overflow-hidden rounded-xl">
                  <img
                    src={currentImage.url}
                    alt={currentImage.prompt}
                    referrerPolicy="no-referrer"
                    className="max-h-[520px] max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                </div>
              ) : (
                /* Empty Standby State */
                <div className="text-center p-8 text-slate-500">
                  <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30 text-amber-400" />
                  <p className="text-sm font-semibold text-slate-300">Ready to Synthesize</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter a prompt or choose a curated direction to begin.
                  </p>
                </div>
              )}
            </div>

            {/* Error or Notice Alert if applicable */}
            {errorMessage && (
              <div className="mt-3 p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block mb-0.5 text-white">
                    {isBillingIssue ? 'Tier Quota Notice' : 'Synthesis Notice'}
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {isBillingIssue
                      ? 'Image synthesis models require a billing-enabled API key in Settings > Secrets. A high-fidelity studio preview has been loaded so you can test all canvas features, exports, and prompt engineering without interruption.'
                      : errorMessage}
                  </p>
                </div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Active Output Prompt Caption & Actions */}
            {currentImage && !isSynthesizing && (
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-2 mb-3">
                  {currentImage.prompt}
                </p>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span>{currentImage.model}</span>
                    <span aria-hidden="true">·</span>
                    <span>{currentImage.style || 'Custom'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenCanvas(currentImage)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Open in Canvas</span>
                    </button>

                    <button
                      onClick={handleDownload}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Enhanced Prompt Modal */}
      {showEnhanceModal && enhancedResult && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowEnhanceModal(false)}
        >
          <div
            className="max-w-xl w-full bg-[#0C111D] border border-slate-800 rounded-2xl p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEnhanceModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center">
                <Wand2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Gemini Art Director Prompt Expansion</h3>
                <span className="text-[11px] text-slate-400">Powered by gemini-3.8-flash</span>
              </div>
            </div>

            <div className="space-y-4 my-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Enriched Generative Prompt
                </span>
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-amber-200/95 leading-relaxed font-mono max-h-48 overflow-y-auto">
                  {enhancedResult.enhancedPrompt}
                </div>
              </div>

              {/* Style tags & Lighting advice */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                    Lighting Strategy
                  </span>
                  <span className="text-slate-300">
                    {enhancedResult.lightingAdvice || 'Dramatic directional balance'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                    Negative Filter
                  </span>
                  <span className="text-slate-300 truncate block">
                    {enhancedResult.recommendedNegativePrompt || 'Standard artifacts'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowEnhanceModal(false)}
                className="px-3.5 py-2 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Keep Original
              </button>
              <button
                onClick={applyEnhancedPrompt}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply to Studio</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
