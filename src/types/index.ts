export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  enhancedPrompt?: string;
  negativePrompt?: string;
  style?: string;
  lighting?: string;
  camera?: string;
  aspectRatio: AspectRatio;
  createdAt: number;
  isFavorite?: boolean;
  seed?: number;
  model: string;
  source: 'generated' | 'curated' | 'edited';
  referenceImageUrl?: string;
}

export type GenerationEngine = 'flux' | 'turbo' | 'anime' | 'pixel' | 'svg' | 'gemini';

export type TypographyPreset = 'custom' | 'vogue' | 'cinema' | 'polaroid' | 'cyberpunk' | 'album';

export interface CutoutSettings {
  enabled: boolean;
  tolerance: number; // 10 to 90
  feather: number; // 0 to 15
  backdropType: 'transparent' | 'color' | 'gradient' | 'blur';
  backdropColor: string;
}

export interface UpscaleSettings {
  scale: 2 | 4;
  clarity: number; // 0 to 100
  denoise: number; // 0 to 100
}

export interface EraserSettings {
  isErasing: boolean;
  brushSize: number;
}

export interface StudioSettings {
  prompt: string;
  negativePrompt: string;
  style: string;
  lighting: string;
  camera: string;
  aspectRatio: AspectRatio;
  referenceImage: string | null;
  referenceName: string | null;
  quality: 'standard' | 'hd' | 'ultra';
  engine: GenerationEngine;
}

export interface CanvasFilters {
  brightness: number; // 50 to 150, default 100
  contrast: number; // 50 to 150, default 100
  saturate: number; // 0 to 200, default 100
  temperature: number; // -50 to +50, default 0
  vignette: number; // 0 to 100, default 0
  blur: number; // 0 to 10, default 0
  grain: number; // 0 to 100, default 0
  presetFilter: 'none' | 'editorial' | 'kodachrome' | 'cybernoir' | 'golden' | 'emerald' | 'mono';
  overlayText: string;
  textSubtitle?: string;
  textPosition: 'top' | 'center' | 'bottom';
  typographyPreset: TypographyPreset;
  textColor: string;
  textSize: number;
  textOpacity: number;
  cutout: CutoutSettings;
  upscale: UpscaleSettings;
}

export interface EnhancedPromptResult {
  enhancedPrompt: string;
  styleKeywords: string[];
  lightingAdvice?: string;
  cameraAdvice?: string;
  recommendedNegativePrompt?: string;
}

export interface ImageAnalysisResult {
  extractedPrompt: string;
  detectedStyle: string;
  colorPalette: string[];
  lightingStyle?: string;
}

export type AppTab = 'studio' | 'canvas' | 'voice' | 'lab' | 'gallery' | 'history';

export interface VoiceProfile {
  id: string;
  name: string;
  displayName: string;
  gender: 'female' | 'male' | 'non-binary';
  category: 'neural' | 'documentary' | 'cinematic' | 'conversational' | 'character' | 'cloned';
  accent: string;
  dialectCode?: string;
  baseGeminiVoice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  stylePrompt: string;
  tagline: string;
  description: string;
  previewText: string;
  avatarColor: string;
  timbre?: string;
  pitch?: string;
  cadence?: string;
  isCustom?: boolean;
}

export interface TTSGeneration {
  id: string;
  text: string;
  voice: VoiceProfile;
  audioUrl: string;
  durationSec: number;
  wordCount: number;
  createdAt: number;
  emotion: string;
  speed: number;
}

export interface TranscribedAudio {
  id: string;
  transcript: string;
  wordCount: number;
  source: 'live_microphone' | 'file_upload';
  createdAt: number;
}

