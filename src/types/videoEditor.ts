export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | '21:9' | '2:3';

export type TrackType = 'video' | 'overlay' | 'text' | 'audio' | 'voiceover' | 'effect';

export type ClipType =
  | 'video'
  | 'image'
  | 'text'
  | 'audio'
  | 'voiceover'
  | 'sticker'
  | 'overlay'
  | 'effect';

export type TextAnimationType =
  | 'none'
  | 'pop'
  | 'bounce'
  | 'fade'
  | 'typewriter'
  | 'slide-up'
  | 'word-karaoke';

export type TransitionType =
  | 'none'
  | 'fade'
  | 'wipe-left'
  | 'wipe-right'
  | 'zoom-in'
  | 'zoom-out'
  | 'glitch'
  | 'dissolve';

export type FilterPreset =
  | 'none'
  | 'teal-orange'
  | 'cyberpunk'
  | 'vintage-film'
  | 'golden-hour'
  | 'noir-bw'
  | 'vibrant-pop'
  | 'retro-vhs'
  | 'emerald-cinema';

export interface CaptionWord {
  word: string;
  start: number; // in seconds relative to clip
  end: number;
}

export interface CropConfig {
  enabled: boolean;
  x: number; // 0.0 to 1.0 normalized
  y: number; // 0.0 to 1.0 normalized
  width: number; // 0.0 to 1.0 normalized
  height: number; // 0.0 to 1.0 normalized
  aspectPreset?: 'free' | '16:9' | '9:16' | '1:1' | '4:5' | '2:3';
}

export interface RemoveBgConfig {
  enabled: boolean;
  mode: 'chroma' | 'luma' | 'auto';
  color: string; // hex like '#00FF00'
  similarity: number; // 0 - 100
  smoothness: number; // 0 - 100
  spillReduction?: number; // 0 - 100
}

export interface ChromaKeyConfig {
  enabled: boolean;
  color: string; // hex like '#00FF00'
  similarity: number; // 0 - 100
  smoothness: number; // 0 - 100
}

export interface CaptionStylePreset {
  id: string;
  name: string;
  category: 'viral' | 'minimal' | 'neon' | 'bold' | 'retro' | 'creative';
  description: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '900';
  textColor: string;
  activeWordColor: string;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  backgroundColor?: string;
  backgroundPadding?: number;
  backgroundBorderRadius?: number;
  isUppercase?: boolean;
  animationType: TextAnimationType;
}

export interface ClipItem {
  id: string;
  trackId: string;
  type: ClipType;
  name: string;
  start: number; // timeline start in seconds
  duration: number; // duration in seconds
  offset: number; // media playback start offset in seconds
  sourceDuration?: number; // total duration of the original media

  // Media
  mediaUrl?: string;
  thumbnailUrl?: string;

  // Spatial & Transform (for video, image, text, sticker, overlay)
  x: number; // normalized center (0.5 = center of canvas)
  y: number; // normalized center (0.5 = center of canvas)
  scale: number; // 1.0 = 100%
  rotation: number; // degrees 0-360
  opacity: number; // 0.0 - 1.0
  zIndex: number;
  blendMode?: GlobalCompositeOperation;

  // Crop & Reframe
  crop?: CropConfig;

  // Background Removal (Remove BG & Chroma Key)
  removeBg?: RemoveBgConfig;

  // Text / Subtitle specific
  text?: string;
  fontFamily?: string;
  fontSize?: number; // in canvas px relative to standard 1080p
  fontWeight?: 'normal' | 'bold' | '900';
  textColor?: string;
  activeWordColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  backgroundColor?: string;
  backgroundPadding?: number;
  backgroundBorderRadius?: number;
  textAlign?: 'left' | 'center' | 'right';
  textAnimation?: TextAnimationType;
  captionWords?: CaptionWord[];
  captionStyleId?: string;
  isUppercase?: boolean;

  // Color Grading & Filters
  filterPreset?: FilterPreset;
  brightness?: number; // -100 to 100 (default 0)
  contrast?: number; // -100 to 100 (default 0)
  saturation?: number; // -100 to 100 (default 0)
  warmth?: number; // -100 to 100 (default 0)
  hue?: number; // -180 to 180 (default 0)
  vignette?: number; // 0 to 100 (default 0)
  grain?: number; // 0 to 100 (default 0)
  blur?: number; // 0 to 50 (default 0)

  // Legacy Chroma Key compatibility
  chromaKey?: ChromaKeyConfig;

  // Audio & Speed
  volume?: number; // 0.0 - 1.0
  speed?: number; // 0.25 - 4.0
  fadeIn?: number; // seconds
  fadeOut?: number; // seconds
  isMuted?: boolean;

  // Transition into this clip
  transition?: {
    type: TransitionType;
    duration: number; // in seconds (e.g. 0.5)
  };
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  isMuted: boolean;
  isLocked: boolean;
  isHidden: boolean;
  volume: number; // 0.0 - 1.0
  clips: ClipItem[];
}

export interface VideoProject {
  id: string;
  title: string;
  aspectRatio: AspectRatio;
  duration: number; // total project duration in seconds
  currentTime: number; // current playhead in seconds
  isPlaying: boolean;
  tracks: Track[];
  selectedClipId: string | null;
  zoomLevel: number; // pixels per second on timeline (e.g. 50px/sec)
  isSnappingEnabled: boolean;
  safeAreaGuide: 'none' | 'tiktok' | 'reels' | 'youtube' | 'grid';

  // In / Out Points for cutting or removing a part of the video
  inPoint: number | null;
  outPoint: number | null;
}

export interface UserUploadedMedia {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio';
  url: string;
  duration?: number;
  sizeMB: string;
  createdAt: number;
}

export interface StockMediaAsset {
  id: string;
  title: string;
  category: 'b-roll' | 'africa' | 'luxury' | 'tech' | 'retail' | 'abstract' | 'greenscreen';
  type: 'video' | 'image';
  duration?: number;
  thumbnailUrl: string;
  mediaUrl: string;
  aspectRatio: AspectRatio;
  color?: string; // dominant gradient for fallback
}

export interface SoundEffectAsset {
  id: string;
  name: string;
  category: 'swoosh' | 'cinematic' | 'glitch' | 'ui' | 'impact';
  duration: number;
  url: string;
}

export interface TextPreset {
  id: string;
  name: string;
  sample: string;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
  shadowColor?: string;
  shadowBlur?: number;
  animation: TextAnimationType;
}

export interface ExportSettings {
  format: 'webm' | 'mp4';
  resolution: '1080p' | '720p' | '4k';
  fps: 30 | 60;
  quality: 'high' | 'ultra' | 'medium';
}
