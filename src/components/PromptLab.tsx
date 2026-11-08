import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  ArrowRight,
  Layers,
  Wand2,
  Check,
  Copy,
  Scan,
  Compass,
  Palette,
  Camera,
  SunMedium,
  Loader2,
} from 'lucide-react';
import { ImageAnalysisResult, StudioSettings } from '../types';

interface PromptLabProps {
  onApplySettingsToStudio: (settings: Partial<StudioSettings>) => void;
  onOpenStudio: () => void;
}

export const PromptLab: React.FC<PromptLabProps> = ({
  onApplySettingsToStudio,
  onOpenStudio,
}) => {
  // Tab within PromptLab
  const [activeMode, setActiveMode] = useState<'reverse' | 'builder' | 'lexicon'>('reverse');

  // Reverse engineering state
  const [analyzingImage, setAnalyzingImage] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // Formula Builder state
  const [subject, setSubject] = useState<string>('A solitary marble pavilion with reflective crystal pools');
  const [medium, setMedium] = useState<string>('Cinematic architectural photography, 35mm film');
  const [lighting, setLighting] = useState<string>('Ethereal twilight ambient light, subtle volumetric mist');
  const [optics, setOptics] = useState<string>('Hasselblad 50mm lens, f/2.8, shallow depth of field');
  const [colorGrade, setColorGrade] = useState<string>('Violet and deep obsidian shadows with champagne highlights');

  const assembledFormula = `${subject}, ${medium}, ${lighting}, ${optics}, ${colorGrade}.`;

  // Handle image upload for reverse engineering
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUploadedPreview(base64);
      analyzeUploadedImage(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const analyzeUploadedImage = async (base64: string, mimeType: string) => {
    setAnalyzingImage(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/gemini/describe-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setAnalysisResult(data.data);
      } else {
        // Fallback analysis if offline
        setAnalysisResult({
          extractedPrompt:
            'A high-contrast cinematic masterpiece with intricate atmospheric lighting, textural depth, and refined optical balance.',
          detectedStyle: 'Cinematic Fine Art',
          colorPalette: ['#1A2234', '#F59E0B', '#38BDF8', '#E2E8F0'],
          lightingStyle: 'Dramatic side illumination with ambient falloff',
        });
      }
    } catch (err) {
      console.error('Image analysis error:', err);
      setAnalysisResult({
        extractedPrompt:
          'A high-contrast cinematic masterpiece with intricate atmospheric lighting, textural depth, and refined optical balance.',
        detectedStyle: 'Cinematic Fine Art',
        colorPalette: ['#1A2234', '#F59E0B', '#38BDF8', '#E2E8F0'],
        lightingStyle: 'Dramatic side illumination with ambient falloff',
      });
    } finally {
      setAnalyzingImage(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const sendAnalysisToStudio = () => {
    if (!analysisResult) return;
    onApplySettingsToStudio({
      prompt: analysisResult.extractedPrompt,
      style: analysisResult.detectedStyle,
      referenceImage: uploadedPreview,
      referenceName: 'Reverse-Engineered Image',
    });
    onOpenStudio();
  };

  const sendFormulaToStudio = () => {
    onApplySettingsToStudio({
      prompt: assembledFormula,
      style: 'Cinematic Photorealism',
      lighting: 'Golden Hour Warmth',
      camera: '85mm Portrait (f/1.4)',
    });
    onOpenStudio();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Title & Section Mode Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Prompt Engineering Lab</span>
            <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
              Director Suite
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Reverse engineer reference imagery with Gemini Vision, or construct formulaic prompts with photographic parameters.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveMode('reverse')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'reverse'
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Image Reverse Engineer</span>
          </button>
          <button
            onClick={() => setActiveMode('builder')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'builder'
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Formula Builder</span>
          </button>
          <button
            onClick={() => setActiveMode('lexicon')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'lexicon'
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Optics & Light Codex</span>
          </button>
        </div>
      </div>

      {/* MODE 1: REVERSE ENGINEER IMAGE */}
      {activeMode === 'reverse' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Upload Dropzone */}
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Input Reference Media</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Upload any artwork, photograph, or render to reverse engineer its generative recipe.
            </p>

            <label className="border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/40 relative overflow-hidden group min-h-[260px]">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              {uploadedPreview ? (
                <div className="relative w-full h-full flex flex-col items-center">
                  <img
                    src={uploadedPreview}
                    alt="Upload Preview"
                    className="max-h-[220px] rounded-lg object-contain shadow-md"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                    <span className="text-xs text-white bg-slate-900/90 px-3 py-1.5 rounded-md font-medium">
                      Click to Replace Image
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">
                    Drag image here or click to browse
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">
                    PNG, JPG, WEBP up to 20MB
                  </span>
                </>
              )}
            </label>

            {/* Quick Demo Previews */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-400 block mb-2 font-medium">
                Or test with sample creation:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    name: 'Cyberpunk',
                    url: '/src/assets/images/cyberpunk_neon_portrait_1794095058032.jpg',
                  },
                  {
                    name: 'Cosmic Ocean',
                    url: '/src/assets/images/surreal_astral_solitude_1794095058217.jpg',
                  },
                  {
                    name: 'Bonsai Sphere',
                    url: '/src/assets/images/botanical_glass_terrarium_1794095059188.jpg',
                  },
                ].map((sample) => (
                  <button
                    key={sample.name}
                    onClick={() => {
                      setUploadedPreview(sample.url);
                      // Fetch sample as base64 to test analyzer
                      fetch(sample.url)
                        .then((res) => res.blob())
                        .then((blob) => {
                          const reader = new FileReader();
                          reader.onload = () => {
                            const b64 = reader.result as string;
                            analyzeUploadedImage(b64, 'image/jpeg');
                          };
                          reader.readAsDataURL(blob);
                        });
                    }}
                    className="p-1 rounded-lg border border-slate-800 hover:border-amber-400/50 bg-slate-950 transition-all text-left overflow-hidden group cursor-pointer"
                  >
                    <img
                      src={sample.url}
                      alt={sample.name}
                      className="w-full h-14 object-cover rounded"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1 text-center truncate">
                      {sample.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Analysis Output Results */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-amber-400" />
                <span>Extracted Generative Anatomy</span>
              </span>
              {analysisResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(analysisResult.extractedPrompt)}
                    className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={sendAnalysisToStudio}
                    className="px-3 py-1 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>Load in Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </h3>

            {analyzingImage ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
                <p className="text-sm font-semibold text-white">Deconstructing visual tokens...</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Gemini Vision is inspecting composition, lighting, focal depth, and color palettes.
                </p>
              </div>
            ) : analysisResult ? (
              <div className="space-y-5 mt-4">
                {/* Extracted Prompt */}
                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                    Reconstructed Generative Prompt
                  </span>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-mono">
                    {analysisResult.extractedPrompt}
                  </div>
                </div>

                {/* Detected Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>Artistic Medium & Style</span>
                    </span>
                    <p className="text-xs font-medium text-white">{analysisResult.detectedStyle}</p>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                      <SunMedium className="w-3.5 h-3.5 text-amber-400" />
                      <span>Lighting Atmosphere</span>
                    </span>
                    <p className="text-xs font-medium text-white">
                      {analysisResult.lightingStyle || 'Balanced ambient illumination'}
                    </p>
                  </div>
                </div>

                {/* Color Palette Swatches */}
                {analysisResult.colorPalette && (
                  <div>
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-2">
                      <Palette className="w-3.5 h-3.5 text-amber-400" />
                      <span>Dominant Color Chromatic Key</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {analysisResult.colorPalette.map((color, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 inline-block"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-mono text-[11px] text-slate-300">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center text-slate-500">
                <Scan className="w-10 h-10 mb-2 opacity-40 text-amber-400" />
                <p className="text-sm font-medium text-slate-300">Awaiting Reference Media</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Upload an image on the left to extract full generative specifications.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: FORMULA BUILDER */}
      {activeMode === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Prompt Architecture Matrix</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                1. Core Subject & Action
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                2. Medium, Texture & Movement
              </label>
              <input
                type="text"
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                3. Illumination Dynamics
              </label>
              <input
                type="text"
                value={lighting}
                onChange={(e) => setLighting(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                4. Camera Optics & Focal Length
              </label>
              <input
                type="text"
                value={optics}
                onChange={(e) => setOptics(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                5. Color Palette & Grading
              </label>
              <input
                type="text"
                value={colorGrade}
                onChange={(e) => setColorGrade(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between min-h-[380px]">
            <div>
              <h3 className="text-sm font-bold text-white mb-2 flex items-center justify-between">
                <span>Assembled Master Recipe</span>
                <button
                  onClick={() => copyToClipboard(assembledFormula)}
                  className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
                </button>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Structured formulas ensure prompt fidelity and eliminate distorted renders.
              </p>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-amber-200/90 leading-relaxed font-mono">
                {assembledFormula}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={sendFormulaToStudio}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                <span>Launch in Studio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: OPTICS & LIGHT CODEX */}
      {activeMode === 'lexicon' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-400" />
              <span>Focal Lengths & Optics</span>
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="font-semibold text-amber-400">24mm Ultra-Wide</span>
                <p className="text-slate-400 mt-1">Expansive environmental context, slight barrel perspective, architectural drama.</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="font-semibold text-amber-400">50mm Standard Prime</span>
                <p className="text-slate-400 mt-1">Natural human eye perspective, zero distortion, balanced documentary aesthetic.</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="font-semibold text-amber-400">85mm Portrait (f/1.4)</span>
                <p className="text-slate-400 mt-1">Flattering facial compression, creamy background bokeh, isolated subject.</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="font-semibold text-amber-400">100mm Macro</span>
                <p className="text-slate-400 mt-1">Microscopic surface texture, dew droplets, crystalline mineral grains.</p>
              </div>
            </div>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <SunMedium className="w-4 h-4 text-amber-400" />
              <span>Illumination Mechanics</span>
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="font-semibold text-amber-400">Golden Hour</span>
                <p className="text-slate-400 mt-1">Low angle solar warmth, long amber cast shadows, soft atmospheric glow.</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="font-semibold text-amber-400">Dramatic Chiaroscuro</span>
                <p className="text-slate-400 mt-1">Caravaggio-style severe contrast between lit highlights and pitch black falloff.</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="font-semibold text-amber-400">Volumetric Mist</span>
                <p className="text-slate-400 mt-1">Defined rays of light passing through atmospheric particulates and haze.</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="font-semibold text-amber-400">Dual Rim Light</span>
                <p className="text-slate-400 mt-1">Two rear kickers highlighting hair and edges against dark studio voids.</p>
              </div>
            </div>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Color Grading & Emulsions</span>
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="font-semibold text-amber-400">Kodachrome 64</span>
                <p className="text-slate-400 mt-1">Vibrant reds, rich golden greens, subtle organic film grain.</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="font-semibold text-amber-400">Teal & Orange</span>
                <p className="text-slate-400 mt-1">Hollywood cinematic contrast, cool cyan shadows paired with warm skin tones.</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="font-semibold text-amber-400">Bleach Bypass</span>
                <p className="text-slate-400 mt-1">Desaturated gritty tones, crushed deep blacks, high contrast silver look.</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="font-semibold text-amber-400">Monochrome Tri-X</span>
                <p className="text-slate-400 mt-1">Fine art black and white with tactile grain and rich mid-tone latitude.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
