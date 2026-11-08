import {
  VideoProject,
  ClipItem,
  AspectRatio,
  FilterPreset,
} from '../types/videoEditor';
import { CAPTION_STYLES_CATALOG } from '../data/captionStyles';

// Cache for loaded images and offscreen canvas
const imageCache: Map<string, HTMLImageElement> = new Map();
const videoElementCache: Map<string, HTMLVideoElement> = new Map();

export const CANVAS_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  '16:9': { width: 1920, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '1:1': { width: 1080, height: 1080 },
  '4:5': { width: 1080, height: 1350 },
  '21:9': { width: 2560, height: 1080 },
  '2:3': { width: 1080, height: 1620 },
};

export class VideoRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;
  private grainNoiseCanvas: HTMLCanvasElement | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) throw new Error('Could not get 2D rendering context');
    this.ctx = ctx;

    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true })!;
  }

  // Pre-load image into cache
  preloadImage(url: string): Promise<HTMLImageElement> {
    if (imageCache.has(url)) {
      return Promise.resolve(imageCache.get(url)!);
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.referrerPolicy = 'no-referrer';
      img.src = url;
      img.onload = () => {
        imageCache.set(url, img);
        resolve(img);
      };
      img.onerror = () => {
        // Fallback generator for resilient offline use
        const fallback = this.generateFallbackImage(url);
        imageCache.set(url, fallback);
        resolve(fallback);
      };
    });
  }

  // Generate a procedural graphic fallback if offline or CORS blocked
  private generateFallbackImage(label: string): HTMLImageElement {
    const c = document.createElement('canvas');
    c.width = 1920;
    c.height = 1080;
    const ctx = c.getContext('2d')!;

    // Rich cinematic gradient
    const grad = ctx.createLinearGradient(0, 0, 1920, 1080);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(0.5, '#1E293B');
    grad.addColorStop(1, '#0B0F19');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1920, 1080);

    // Subtle accent grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    for (let x = 0; x < 1920; x += 160) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1080);
      ctx.stroke();
    }
    for (let y = 0; y < 1080; y += 120) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1920, y);
      ctx.stroke();
    }

    // Modern glowing emblem
    ctx.fillStyle = 'rgba(14, 165, 233, 0.15)';
    ctx.beginPath();
    ctx.arc(960, 540, 200, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 54px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VoxStudio B-Roll Footage', 960, 520);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('4K Cinematic Broadcast Layer', 960, 580);

    const img = new Image();
    img.src = c.toDataURL();
    return img;
  }

  // Initialize film grain pattern
  private getGrainCanvas(width: number, height: number): HTMLCanvasElement {
    if (this.grainNoiseCanvas && this.grainNoiseCanvas.width === 256) {
      return this.grainNoiseCanvas;
    }
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;
    const imgData = ctx.createImageData(256, 256);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const val = Math.floor(Math.random() * 255);
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 40; // Subtle alpha
    }
    ctx.putImageData(imgData, 0, 0);
    this.grainNoiseCanvas = c;
    return c;
  }

  // Hex color to RGB
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map((ch) => ch + ch).join('');
    }
    const num = parseInt(cleanHex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }

  // Main frame rendering loop entry point
  renderFrame(
    project: VideoProject,
    time: number,
    options: { showSafeAreas?: boolean; selectedClipId?: string | null } = {}
  ) {
    const { width, height } = CANVAS_DIMENSIONS[project.aspectRatio] || CANVAS_DIMENSIONS['16:9'];

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    const ctx = this.ctx;
    ctx.save();

    // 1. Clear & Background
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, width, height);

    // 2. Render Tracks in Layer Order (Background / Video -> Overlay -> Stickers -> Effects -> Text / Subtitles)
    const trackOrder: Record<string, number> = {
      video: 1,
      overlay: 2,
      sticker: 3,
      effect: 4,
      text: 5,
      voiceover: 6,
      audio: 7,
    };

    const sortedTracks = [...project.tracks].sort(
      (a, b) => (trackOrder[a.type] || 99) - (trackOrder[b.type] || 99)
    );

    for (const track of sortedTracks) {
      if (track.isHidden) continue;

      for (const clip of track.clips) {
        // Is clip active at currentTime?
        if (time >= clip.start && time < clip.start + clip.duration) {
          const isSelected = options.selectedClipId === clip.id;
          this.renderClip(ctx, clip, time, width, height, isSelected);
        }
      }
    }

    // 3. Render Range In/Out Marker overlay on canvas (if active)
    if (project.inPoint !== null && project.outPoint !== null) {
      if (time >= project.inPoint && time <= project.outPoint) {
        // Highlight active range
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
        ctx.lineWidth = 6;
        ctx.strokeRect(10, 10, width - 20, height - 20);
      }
    }

    // 4. Render Safe Area Overlays (if enabled)
    if (options.showSafeAreas && project.safeAreaGuide !== 'none') {
      this.renderSafeAreas(ctx, project.safeAreaGuide, width, height);
    }

    ctx.restore();
  }

  private renderClip(
    ctx: CanvasRenderingContext2D,
    clip: ClipItem,
    time: number,
    width: number,
    height: number,
    isSelected: boolean
  ) {
    const elapsed = time - clip.start;

    ctx.save();

    // Compute transition progress
    let transitionOpacity = 1;
    let transitionScale = 1;
    let transitionWipe = 1;
    let glitchOffset = 0;

    if (clip.transition && elapsed < clip.transition.duration) {
      const t = elapsed / clip.transition.duration;
      switch (clip.transition.type) {
        case 'fade':
        case 'dissolve':
          transitionOpacity = t;
          break;
        case 'zoom-in':
          transitionScale = 0.7 + t * 0.3;
          transitionOpacity = t;
          break;
        case 'zoom-out':
          transitionScale = 1.3 - t * 0.3;
          transitionOpacity = t;
          break;
        case 'wipe-left':
          transitionWipe = t;
          break;
        case 'glitch':
          if (Math.random() > 0.4) {
            glitchOffset = (Math.random() - 0.5) * 30;
          }
          break;
      }
    }

    // Global Alpha
    ctx.globalAlpha = Math.max(0, Math.min(1, (clip.opacity ?? 1.0) * transitionOpacity));

    if (clip.blendMode) {
      ctx.globalCompositeOperation = clip.blendMode;
    }

    // Position center in pixels
    const cx = clip.x * width + glitchOffset;
    const cy = clip.y * height;

    // Apply Transforms
    ctx.translate(cx, cy);
    if (clip.rotation) {
      ctx.rotate((clip.rotation * Math.PI) / 180);
    }
    const finalScale = (clip.scale ?? 1.0) * transitionScale;
    ctx.scale(finalScale, finalScale);

    // Render based on clip type
    switch (clip.type) {
      case 'video':
      case 'image':
      case 'overlay':
        this.renderVisualMedia(ctx, clip, width, height, transitionWipe);
        break;
      case 'text':
        this.renderText(ctx, clip, elapsed, width, height);
        break;
      case 'sticker':
        this.renderSticker(ctx, clip, width, height);
        break;
      case 'effect':
        this.renderEffectOverlay(ctx, clip, width, height);
        break;
    }

    // If selected, draw transform bounding box
    if (isSelected) {
      this.drawSelectionBox(ctx, clip, width, height);
    }

    ctx.restore();
  }

  // Render Video or Image Media Frame with Crop & Remove BG support
  private renderVisualMedia(
    ctx: CanvasRenderingContext2D,
    clip: ClipItem,
    canvasW: number,
    canvasH: number,
    wipeProgress: number
  ) {
    const url = clip.mediaUrl || clip.thumbnailUrl;
    let img: HTMLImageElement | null = null;

    if (url) {
      img = imageCache.get(url) || null;
      if (!img) {
        this.preloadImage(url);
      }
    }

    // Apply Color Filters & LUT
    const filters: string[] = [];
    if (clip.brightness) filters.push(`brightness(${100 + clip.brightness}%)`);
    if (clip.contrast) filters.push(`contrast(${100 + clip.contrast}%)`);
    if (clip.saturation) filters.push(`saturate(${100 + clip.saturation}%)`);
    if (clip.hue) filters.push(`hue-rotate(${clip.hue}deg)`);
    if (clip.blur) filters.push(`blur(${clip.blur}px)`);

    // Presets
    if (clip.filterPreset === 'teal-orange') {
      filters.push('contrast(125%) saturate(135%) hue-rotate(-10deg)');
    } else if (clip.filterPreset === 'cyberpunk') {
      filters.push('contrast(140%) saturate(160%) hue-rotate(25deg)');
    } else if (clip.filterPreset === 'vintage-film') {
      filters.push('sepia(25%) contrast(110%) saturate(115%)');
    } else if (clip.filterPreset === 'golden-hour') {
      filters.push('sepia(35%) saturate(140%) contrast(110%)');
    } else if (clip.filterPreset === 'noir-bw') {
      filters.push('grayscale(100%) contrast(150%)');
    } else if (clip.filterPreset === 'vibrant-pop') {
      filters.push('saturate(170%) contrast(120%)');
    }

    if (filters.length > 0) {
      ctx.filter = filters.join(' ');
    }

    // Wipe transition clip mask
    if (wipeProgress < 1.0) {
      ctx.beginPath();
      ctx.rect(-canvasW / 2, -canvasH / 2, canvasW * wipeProgress, canvasH);
      ctx.clip();
    }

    if (img && img.complete && img.naturalWidth > 0) {
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;

      // Handle Crop Source Rectangle
      let srcX = 0;
      let srcY = 0;
      let srcW = naturalW;
      let srcH = naturalH;

      if (clip.crop && clip.crop.enabled) {
        srcX = Math.round(clip.crop.x * naturalW);
        srcY = Math.round(clip.crop.y * naturalH);
        srcW = Math.round(clip.crop.width * naturalW);
        srcH = Math.round(clip.crop.height * naturalH);
      }

      // Draw destination dimensions covering canvas or fitting overlay
      const cropAspect = srcW / srcH;
      const targetAspect = canvasW / canvasH;

      let drawW = canvasW;
      let drawH = canvasH;

      if (clip.type === 'overlay') {
        drawW = canvasW * 0.45;
        drawH = drawW / cropAspect;
      } else {
        if (cropAspect > targetAspect) {
          drawW = canvasH * cropAspect;
        } else {
          drawH = canvasW / cropAspect;
        }
      }

      // Handle Background Removal (Chroma Key / Remove BG)
      const isRemoveBgActive =
        (clip.removeBg && clip.removeBg.enabled) ||
        (clip.chromaKey && clip.chromaKey.enabled);

      if (isRemoveBgActive) {
        const offW = Math.min(960, drawW);
        const offH = Math.min(540, drawH);
        this.offscreenCanvas.width = offW;
        this.offscreenCanvas.height = offH;

        this.offscreenCtx.clearRect(0, 0, offW, offH);
        this.offscreenCtx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, offW, offH);

        // Pixel manipulation for green/blue screen removal
        const keyColor = clip.removeBg?.color || clip.chromaKey?.color || '#00FF00';
        const similarity = (clip.removeBg?.similarity ?? clip.chromaKey?.similarity ?? 40) / 100;
        const targetRgb = this.hexToRgb(keyColor);

        const imgData = this.offscreenCtx.getImageData(0, 0, offW, offH);
        const data = imgData.data;
        const threshold = similarity * 440; // Max distance is sqrt(255^2 * 3) ~ 441

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Euclidean color distance
          const dist = Math.sqrt(
            Math.pow(r - targetRgb.r, 2) +
            Math.pow(g - targetRgb.g, 2) +
            Math.pow(b - targetRgb.b, 2)
          );

          if (dist < threshold) {
            data[i + 3] = 0; // Transparent
          } else if (dist < threshold + 30) {
            // Soft feathered edge
            const alphaRatio = (dist - threshold) / 30;
            data[i + 3] = Math.round(data[i + 3] * alphaRatio);
          }
        }

        this.offscreenCtx.putImageData(imgData, 0, 0);
        ctx.drawImage(this.offscreenCanvas, -drawW / 2, -drawH / 2, drawW, drawH);
      } else {
        // Normal draw
        ctx.drawImage(img, srcX, srcY, srcW, srcH, -drawW / 2, -drawH / 2, drawW, drawH);
      }
    } else {
      // Procedural animated gradient backdrop while loading
      const grad = ctx.createLinearGradient(-canvasW / 2, -canvasH / 2, canvasW / 2, canvasH / 2);
      grad.addColorStop(0, '#1E293B');
      grad.addColorStop(1, '#0F172A');
      ctx.fillStyle = grad;
      ctx.fillRect(-canvasW / 2, -canvasH / 2, canvasW, canvasH);

      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(clip.name, 0, 10);
    }

    ctx.filter = 'none';

    // Apply Vignette Overlay if set
    if (clip.vignette && clip.vignette > 0) {
      const radius = Math.max(canvasW, canvasH) * 0.7;
      const vignetteGrad = ctx.createRadialGradient(0, 0, radius * 0.4, 0, 0, radius);
      vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vignetteGrad.addColorStop(1, `rgba(0,0,0,${clip.vignette / 100})`);
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(-canvasW / 2, -canvasH / 2, canvasW, canvasH);
    }

    // Apply Film Grain
    if (clip.grain && clip.grain > 0) {
      const grainCanvas = this.getGrainCanvas(canvasW, canvasH);
      const pattern = ctx.createPattern(grainCanvas, 'repeat');
      if (pattern) {
        ctx.save();
        ctx.globalAlpha = (clip.grain / 100) * 0.35;
        ctx.fillStyle = pattern;
        ctx.fillRect(-canvasW / 2, -canvasH / 2, canvasW, canvasH);
        ctx.restore();
      }
    }
  }

  // Render Text & Animated Auto-Captions with 30+ Styles Support
  private renderText(
    ctx: CanvasRenderingContext2D,
    clip: ClipItem,
    elapsed: number,
    canvasW: number,
    canvasH: number
  ) {
    // Check if a preset style applies
    const preset = clip.captionStyleId
      ? CAPTION_STYLES_CATALOG.find((s) => s.id === clip.captionStyleId)
      : null;

    let rawText = clip.text || 'Texte Publicitaire';
    if (clip.isUppercase || preset?.isUppercase) {
      rawText = rawText.toUpperCase();
    }

    const fontSize = clip.fontSize || preset?.fontSize || 48;
    const fontFamily = clip.fontFamily || preset?.fontFamily || 'Plus Jakarta Sans';
    const fontWeight = clip.fontWeight || preset?.fontWeight || 'bold';

    ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
    ctx.textAlign = (clip.textAlign || 'center') as CanvasTextAlign;
    ctx.textBaseline = 'middle';

    const animType = clip.textAnimation || preset?.animationType || 'word-karaoke';

    // Check for Word Karaoke / TikTok Animated Subtitles
    if (animType === 'word-karaoke' && clip.captionWords && clip.captionWords.length > 0) {
      this.renderWordKaraoke(ctx, clip, preset, elapsed, canvasW, fontSize);
      return;
    }

    // Standard Animated Text
    let displayText = rawText;
    let scaleAnim = 1.0;
    let yOffsetAnim = 0;

    if (animType === 'typewriter') {
      const charsToShow = Math.min(rawText.length, Math.floor(elapsed * 18));
      displayText = rawText.slice(0, charsToShow);
    } else if (animType === 'bounce') {
      yOffsetAnim = Math.sin(elapsed * 6) * 12;
    } else if (animType === 'pop') {
      scaleAnim = 1.0 + Math.max(0, Math.sin(elapsed * 8) * 0.15 * Math.exp(-elapsed * 2));
    } else if (animType === 'slide-up') {
      yOffsetAnim = Math.max(0, (0.5 - elapsed) * 60);
    }

    ctx.save();
    ctx.translate(0, yOffsetAnim);
    ctx.scale(scaleAnim, scaleAnim);

    // Measure text
    const metrics = ctx.measureText(displayText);
    const textWidth = metrics.width;
    const pad = clip.backgroundPadding || preset?.backgroundPadding || 20;
    const bg = clip.backgroundColor || preset?.backgroundColor;

    // Background pill/box if enabled
    if (bg) {
      ctx.fillStyle = bg;
      const boxW = textWidth + pad * 2;
      const boxH = fontSize * 1.4;
      let boxX = -boxW / 2;
      if (clip.textAlign === 'left') boxX = -pad;
      if (clip.textAlign === 'right') boxX = -boxW + pad;

      const radius = clip.backgroundBorderRadius || preset?.backgroundBorderRadius || 16;
      ctx.beginPath();
      ctx.roundRect(boxX, -boxH / 2, boxW, boxH, radius);
      ctx.fill();
    }

    // Drop Shadow / 3D Extrusion
    const shadowColor = clip.shadowColor || preset?.shadowColor;
    if (shadowColor) {
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = clip.shadowBlur ?? preset?.shadowBlur ?? 12;
      ctx.shadowOffsetX = clip.shadowOffsetX ?? preset?.shadowOffsetX ?? 2;
      ctx.shadowOffsetY = clip.shadowOffsetY ?? preset?.shadowOffsetY ?? 4;
    }

    // Stroke / Outline
    const strokeColor = clip.strokeColor || preset?.strokeColor;
    const strokeWidth = clip.strokeWidth || preset?.strokeWidth;
    if (strokeColor && strokeWidth) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineJoin = 'round';
      ctx.strokeText(displayText, 0, 0);
    }

    // Fill Text
    ctx.fillStyle = clip.textColor || preset?.textColor || '#FFFFFF';
    ctx.fillText(displayText, 0, 0);

    ctx.restore();
  }

  // Render CapCut-Style Word-by-Word Karaoke Highlight Subtitles with 30+ Styles
  private renderWordKaraoke(
    ctx: CanvasRenderingContext2D,
    clip: ClipItem,
    preset: any,
    elapsed: number,
    canvasW: number,
    fontSize: number
  ) {
    const words = clip.captionWords!;
    const totalWords = words.length;

    // Active word highlight color
    const activeColor = clip.activeWordColor || preset?.activeWordColor || '#FFFF00';
    const normalTextColor = clip.textColor || preset?.textColor || '#FFFFFF';
    const strokeColor = clip.strokeColor || preset?.strokeColor || '#000000';
    const strokeWidth = clip.strokeWidth || preset?.strokeWidth || 8;

    // Find currently active word
    let activeIndex = -1;
    for (let i = 0; i < totalWords; i++) {
      if (elapsed >= words[i].start && elapsed <= words[i].end) {
        activeIndex = i;
        break;
      }
    }
    if (activeIndex === -1 && elapsed > words[totalWords - 1].end) {
      activeIndex = totalWords - 1;
    }

    // Display words in a centered block with wrapping
    const maxLineW = canvasW * 0.85;
    const wordWidths = words.map((w) => ctx.measureText(w.word + ' ').width);
    const spaceW = ctx.measureText(' ').width;

    // Group words into lines
    const lines: { words: { word: string; index: number; width: number }[]; totalWidth: number }[] = [];
    let currentLine: { word: string; index: number; width: number }[] = [];
    let currentLineWidth = 0;

    for (let i = 0; i < totalWords; i++) {
      const wWidth = wordWidths[i];
      if (currentLineWidth + wWidth > maxLineW && currentLine.length > 0) {
        lines.push({ words: currentLine, totalWidth: currentLineWidth - spaceW });
        currentLine = [];
        currentLineWidth = 0;
      }
      currentLine.push({ word: words[i].word, index: i, width: wWidth });
      currentLineWidth += wWidth;
    }
    if (currentLine.length > 0) {
      lines.push({ words: currentLine, totalWidth: currentLineWidth - spaceW });
    }

    const lineHeight = fontSize * 1.35;
    const totalBlockH = lines.length * lineHeight;
    let startY = -totalBlockH / 2 + lineHeight / 2;

    for (const line of lines) {
      let curX = -line.totalWidth / 2;

      for (const item of line.words) {
        const isCurrentWord = item.index === activeIndex;

        ctx.save();
        if (isCurrentWord) {
          // Animated bounce on active word
          ctx.translate(curX + item.width / 2, startY);
          const bounce = Math.sin((elapsed - words[item.index].start) * 15) * 6;
          ctx.translate(0, -Math.abs(bounce));
          ctx.scale(1.15, 1.15);

          // Highlight Fill
          ctx.shadowColor = preset?.shadowColor || 'rgba(0,0,0,0.9)';
          ctx.shadowBlur = preset?.shadowBlur || 16;
          ctx.shadowOffsetX = preset?.shadowOffsetX || 0;
          ctx.shadowOffsetY = preset?.shadowOffsetY || 4;
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = strokeWidth + 2;
          ctx.lineJoin = 'round';
          ctx.strokeText(item.word, 0, 0);

          ctx.fillStyle = activeColor;
          ctx.fillText(item.word, 0, 0);
        } else {
          // Neutral text
          ctx.translate(curX + item.width / 2, startY);
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = strokeWidth;
          ctx.lineJoin = 'round';
          ctx.strokeText(item.word, 0, 0);

          ctx.fillStyle = normalTextColor;
          ctx.fillText(item.word, 0, 0);
        }
        ctx.restore();

        curX += item.width;
      }

      startY += lineHeight;
    }
  }

  // Render Sticker / Commercial Badge
  private renderSticker(
    ctx: CanvasRenderingContext2D,
    clip: ClipItem,
    canvasW: number,
    canvasH: number
  ) {
    const text = clip.text || 'PROMO';
    const boxW = 280;
    const boxH = 80;

    // Glowing Pill
    const grad = ctx.createLinearGradient(-boxW / 2, 0, boxW / 2, 0);
    grad.addColorStop(0, '#E11D48');
    grad.addColorStop(1, '#BE123C');

    ctx.shadowColor = 'rgba(225, 29, 72, 0.6)';
    ctx.shadowBlur = 24;

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 24);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);
  }

  // Render Global Visual Effect Overlay (VHS, Glitch, Scanlines)
  private renderEffectOverlay(
    ctx: CanvasRenderingContext2D,
    clip: ClipItem,
    canvasW: number,
    canvasH: number
  ) {
    // Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    for (let y = -canvasH / 2; y < canvasH / 2; y += 4) {
      ctx.fillRect(-canvasW / 2, y, canvasW, 2);
    }

    // VHS Timestamp / Tracking mark
    ctx.fillStyle = '#00FF66';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('REC ● 00:04:12 SP', -canvasW / 2 + 50, -canvasH / 2 + 60);
  }

  // Draw Interactive Selection Bounding Box on Active Clip
  private drawSelectionBox(
    ctx: CanvasRenderingContext2D,
    clip: ClipItem,
    canvasW: number,
    canvasH: number
  ) {
    ctx.save();
    ctx.strokeStyle = '#06B6D4'; // Cyan 500
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);

    const boxW = 320;
    const boxH = 180;
    ctx.strokeRect(-boxW / 2, -boxH / 2, boxW, boxH);

    // Corner resize handles
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#06B6D4';
    ctx.setLineDash([]);
    ctx.lineWidth = 2;

    const corners = [
      [-boxW / 2, -boxH / 2],
      [boxW / 2, -boxH / 2],
      [-boxW / 2, boxH / 2],
      [boxW / 2, boxH / 2],
    ];

    for (const [hx, hy] of corners) {
      ctx.beginPath();
      ctx.arc(hx, hy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  // Render Social Media Safe Area Guides
  private renderSafeAreas(
    ctx: CanvasRenderingContext2D,
    guide: string,
    width: number,
    height: number
  ) {
    ctx.save();

    if (guide === 'tiktok' || guide === 'reels') {
      // Top header safe margin
      ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
      ctx.fillRect(0, 0, width, height * 0.12);

      // Bottom caption & audio disc safe margin
      ctx.fillRect(0, height * 0.78, width, height * 0.22);

      // Right action bar buttons (Like, Comment, Share)
      ctx.fillRect(width * 0.82, height * 0.35, width * 0.18, height * 0.45);

      // Outline
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(width * 0.05, height * 0.12, width * 0.77, height * 0.66);

      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        guide === 'tiktok' ? 'Zone Sans Danger TikTok' : 'Zone Sans Danger Instagram Reels',
        width / 2,
        height * 0.08
      );
    } else if (guide === 'grid') {
      // 3x3 Rule of Thirds
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);

      // Verticals
      ctx.beginPath();
      ctx.moveTo(width / 3, 0);
      ctx.lineTo(width / 3, height);
      ctx.moveTo((width * 2) / 3, 0);
      ctx.lineTo((width * 2) / 3, height);
      // Horizontals
      ctx.moveTo(0, height / 3);
      ctx.lineTo(width, height / 3);
      ctx.moveTo(0, (height * 2) / 3);
      ctx.lineTo(width, (height * 2) / 3);
      ctx.stroke();
    }

    ctx.restore();
  }
}
