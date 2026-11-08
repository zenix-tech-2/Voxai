import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  VideoProject,
  ClipItem,
  Track,
  FilterPreset,
  TransitionType,
  CaptionWord,
} from '../../types/videoEditor';
import { CanvasPlayer } from './CanvasPlayer';
import { Timeline } from './Timeline';
import { AssetLibrary } from './AssetLibrary';
import { ClipInspector } from './ClipInspector';
import { ExportModal } from './ExportModal';
import { CropModal } from './CropModal';
import { CAPTION_STYLES_CATALOG } from '../../data/captionStyles';
import { TakeItem } from '../../utils/speechEngine';
import { STOCK_MEDIA_ASSETS } from '../../data/stockAssets';
import {
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  Wand2,
  Film,
  Music,
  Share2,
} from 'lucide-react';

interface VideoEditorProps {
  sessionTakes: TakeItem[];
  initialTakeToImport?: TakeItem | null;
  onClearInitialTake?: () => void;
}

// Initial default project with starter clips
const createInitialProject = (): VideoProject => ({
  id: 'proj-1',
  title: 'Spot Publicitaire VoxStudio',
  aspectRatio: '16:9',
  duration: 15.0,
  currentTime: 0,
  isPlaying: false,
  zoomLevel: 65,
  isSnappingEnabled: true,
  safeAreaGuide: 'none',
  selectedClipId: 'clip-v1',
  inPoint: null,
  outPoint: null,
  tracks: [
    {
      id: 'track-text',
      name: 'Sous-Titres & Textes',
      type: 'text',
      isMuted: false,
      isLocked: false,
      isHidden: false,
      volume: 1.0,
      clips: [
        {
          id: 'clip-t1',
          trackId: 'track-text',
          type: 'text',
          name: 'Titre Publicitaire',
          start: 0.5,
          duration: 4.5,
          offset: 0,
          text: 'RÉVÉLEZ VOTRE ÉCLAT',
          fontSize: 54,
          textColor: '#FFFF00',
          strokeColor: '#000000',
          strokeWidth: 8,
          x: 0.5,
          y: 0.82,
          scale: 1.0,
          rotation: 0,
          opacity: 1.0,
          zIndex: 10,
          textAnimation: 'word-karaoke',
          captionWords: [
            { word: 'RÉVÉLEZ', start: 0.5, end: 1.8 },
            { word: 'VOTRE', start: 1.9, end: 3.0 },
            { word: 'ÉCLAT', start: 3.1, end: 4.5 },
          ],
        },
        {
          id: 'clip-t2',
          trackId: 'track-text',
          type: 'text',
          name: 'Call To Action',
          start: 5.5,
          duration: 5.0,
          offset: 0,
          text: 'DISPONIBLE EN BOUTIQUE',
          fontSize: 48,
          textColor: '#FFFFFF',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backgroundPadding: 16,
          x: 0.5,
          y: 0.82,
          scale: 1.0,
          rotation: 0,
          opacity: 1.0,
          zIndex: 10,
          textAnimation: 'bounce',
        },
      ],
    },
    {
      id: 'track-overlay',
      name: 'Superposition & Badges',
      type: 'overlay',
      isMuted: false,
      isLocked: false,
      isHidden: false,
      volume: 1.0,
      clips: [
        {
          id: 'clip-s1',
          trackId: 'track-overlay',
          type: 'sticker',
          name: 'Badge Promo',
          start: 0.8,
          duration: 5.0,
          offset: 0,
          text: 'OFFRE LIMITÉE -50%',
          x: 0.82,
          y: 0.16,
          scale: 0.85,
          rotation: -5,
          opacity: 1.0,
          zIndex: 8,
        },
      ],
    },
    {
      id: 'track-video',
      name: 'Piste Vidéo Principale',
      type: 'video',
      isMuted: false,
      isLocked: false,
      isHidden: false,
      volume: 1.0,
      clips: [
        {
          id: 'clip-v1',
          trackId: 'track-video',
          type: 'image',
          name: 'Lagos Modern Skyline',
          start: 0,
          duration: 5.5,
          offset: 0,
          mediaUrl: 'https://images.unsplash.com/photo-1577975882846-431adc8c2009?w=1920&q=85',
          thumbnailUrl: 'https://images.unsplash.com/photo-1577975882846-431adc8c2009?w=600&q=80',
          x: 0.5,
          y: 0.5,
          scale: 1.0,
          rotation: 0,
          opacity: 1.0,
          zIndex: 1,
          filterPreset: 'teal-orange',
          vignette: 25,
          transition: { type: 'fade', duration: 0.6 },
        },
        {
          id: 'clip-v2',
          trackId: 'track-video',
          type: 'image',
          name: 'African Tech Innovator',
          start: 5.5,
          duration: 5.0,
          offset: 0,
          mediaUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&q=85',
          thumbnailUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80',
          x: 0.5,
          y: 0.5,
          scale: 1.0,
          rotation: 0,
          opacity: 1.0,
          zIndex: 1,
          filterPreset: 'vibrant-pop',
          transition: { type: 'zoom-in', duration: 0.6 },
        },
        {
          id: 'clip-v3',
          trackId: 'track-video',
          type: 'image',
          name: 'Luxury Swiss Watch',
          start: 10.5,
          duration: 4.5,
          offset: 0,
          mediaUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1920&q=85',
          thumbnailUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
          x: 0.5,
          y: 0.5,
          scale: 1.0,
          rotation: 0,
          opacity: 1.0,
          zIndex: 1,
          filterPreset: 'golden-hour',
          transition: { type: 'fade', duration: 0.6 },
        },
      ],
    },
    {
      id: 'track-voiceover',
      name: 'Voix-Off Publicitaire',
      type: 'voiceover',
      isMuted: false,
      isLocked: false,
      isHidden: false,
      volume: 1.0,
      clips: [
        {
          id: 'clip-vo1',
          trackId: 'track-voiceover',
          type: 'voiceover',
          name: 'Spot Voix-Off Studio',
          start: 0.5,
          duration: 12.0,
          offset: 0,
          volume: 1.0,
          x: 0.5,
          y: 0.5,
          scale: 1,
          rotation: 0,
          opacity: 1,
          zIndex: 0,
        },
      ],
    },
    {
      id: 'track-audio',
      name: 'Musique de Fond & SFX',
      type: 'audio',
      isMuted: false,
      isLocked: false,
      isHidden: false,
      volume: 0.35,
      clips: [
        {
          id: 'clip-bgm1',
          trackId: 'track-audio',
          type: 'audio',
          name: 'Ambiance Commerciale Luxe',
          start: 0,
          duration: 15.0,
          offset: 0,
          volume: 0.4,
          x: 0.5,
          y: 0.5,
          scale: 1,
          rotation: 0,
          opacity: 1,
          zIndex: 0,
        },
      ],
    },
  ],
});

export const VideoEditor: React.FC<VideoEditorProps> = ({
  sessionTakes,
  initialTakeToImport,
  onClearInitialTake,
}) => {
  const [project, setProject] = useState<VideoProject>(createInitialProject);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [croppingClip, setCroppingClip] = useState<ClipItem | null>(null);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const animFrameRef = useRef<number | null>(null);

  // If a voiceover take was passed to import from Studio
  useEffect(() => {
    if (initialTakeToImport) {
      const take = initialTakeToImport;
      const duration = Math.max(3, Math.round(take.script.split(/\s+/).length / 2.5));

      setProject((prev) => {
        // Add to voiceover track
        const updatedTracks = prev.tracks.map((t) => {
          if (t.type === 'voiceover') {
            const newVoClip: ClipItem = {
              id: `vo-${Date.now()}`,
              trackId: t.id,
              type: 'voiceover',
              name: `Voix: ${take.voice.name}`,
              mediaUrl: take.audioUrl,
              start: prev.currentTime,
              duration,
              offset: 0,
              volume: 1.0,
              x: 0.5,
              y: 0.5,
              scale: 1,
              rotation: 0,
              opacity: 1,
              zIndex: 0,
            };
            return { ...t, clips: [...t.clips, newVoClip] };
          }
          return t;
        });

        return {
          ...prev,
          duration: Math.max(prev.duration, prev.currentTime + duration + 2),
          tracks: updatedTracks,
        };
      });

      if (onClearInitialTake) onClearInitialTake();
    }
  }, [initialTakeToImport, onClearInitialTake]);

  // Real-time Playhead Animation Loop
  useEffect(() => {
    const tick = (now: number) => {
      if (project.isPlaying) {
        const delta = (now - lastTimeRef.current) / 1000;
        setProject((prev) => {
          const nextTime = prev.currentTime + delta;
          if (nextTime >= prev.duration) {
            return { ...prev, currentTime: 0, isPlaying: false };
          }
          return { ...prev, currentTime: nextTime };
        });
      }
      lastTimeRef.current = now;
      animFrameRef.current = requestAnimationFrame(tick);
    };

    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [project.isPlaying]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setProject((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
      } else if (e.code === 'KeyS') {
        // Split clip
        e.preventDefault();
        // Handled in timeline
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setProject((prev) => ({ ...prev, currentTime: Math.max(0, prev.currentTime - 1) }));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setProject((prev) => ({ ...prev, currentTime: Math.min(prev.duration, prev.currentTime + 1) }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle Playback
  const handleTogglePlay = useCallback(() => {
    setProject((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  // Seek Playhead
  const handleSeek = useCallback((time: number) => {
    setProject((prev) => ({ ...prev, currentTime: time }));
  }, []);

  // Selected Clip
  const selectedClip = React.useMemo(() => {
    if (!project.selectedClipId) return null;
    for (const track of project.tracks) {
      const c = track.clips.find((item) => item.id === project.selectedClipId);
      if (c) return c;
    }
    return null;
  }, [project.selectedClipId, project.tracks]);

  // Update selected clip properties
  const handleUpdateClip = useCallback((clipId: string, updates: Partial<ClipItem>) => {
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => ({
        ...t,
        clips: t.clips.map((c) => (c.id === clipId ? { ...c, ...updates } : c)),
      })),
    }));
  }, []);

  // Delete clip
  const handleDeleteClip = useCallback((clipId: string) => {
    setProject((prev) => ({
      ...prev,
      selectedClipId: prev.selectedClipId === clipId ? null : prev.selectedClipId,
      tracks: prev.tracks.map((t) => ({
        ...t,
        clips: t.clips.filter((c) => c.id !== clipId),
      })),
    }));
  }, []);

  // Add clip to track from Asset Library
  const handleAddClipToTrack = (
    trackType: 'video' | 'overlay' | 'text' | 'voiceover' | 'audio',
    clipData: Partial<ClipItem>
  ) => {
    setProject((prev) => {
      // Find matching track
      let targetTrack = prev.tracks.find((t) => t.type === trackType);
      if (!targetTrack) targetTrack = prev.tracks[0];

      const duration = clipData.duration || 4.0;
      const start = prev.currentTime;

      const newClip: ClipItem = {
        id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        trackId: targetTrack.id,
        type: clipData.type || (trackType === 'text' ? 'text' : 'video'),
        name: clipData.name || 'Nouveau Clip',
        start,
        duration,
        offset: 0,
        x: 0.5,
        y: 0.5,
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
        zIndex: 1,
        ...clipData,
      };

      const updatedTracks = prev.tracks.map((t) =>
        t.id === targetTrack!.id ? { ...t, clips: [...t.clips, newClip] } : t
      );

      return {
        ...prev,
        selectedClipId: newClip.id,
        duration: Math.max(prev.duration, start + duration + 1),
        tracks: updatedTracks,
      };
    });
  };

  // Apply LUT filter to selected clip
  const handleApplyFilterToSelected = (filter: FilterPreset) => {
    if (!project.selectedClipId) return;
    handleUpdateClip(project.selectedClipId, { filterPreset: filter });
  };

  // Apply transition
  const handleApplyTransitionToSelected = (
    type: 'fade' | 'wipe-left' | 'wipe-right' | 'zoom-in' | 'glitch'
  ) => {
    if (!project.selectedClipId) return;
    handleUpdateClip(project.selectedClipId, {
      transition: { type: type as TransitionType, duration: 0.6 },
    });
  };

  // Generate synchronized CapCut-style karaoke word captions using chosen style preset
  const handleGenerateAutoCaptions = (scriptText: string, styleId?: string) => {
    if (!scriptText.trim()) return;

    const stylePreset =
      CAPTION_STYLES_CATALOG.find((s) => s.id === styleId) || CAPTION_STYLES_CATALOG[0];
    const words = scriptText.trim().split(/\s+/);
    const avgSecPerWord = 0.35;

    // Group words into phrases of ~5 words for readability
    const chunkSize = 5;
    const phraseClips: ClipItem[] = [];
    let curTime = project.currentTime;

    for (let i = 0; i < words.length; i += chunkSize) {
      const chunkWords = words.slice(i, i + chunkSize);
      const chunkDuration = chunkWords.length * avgSecPerWord;

      // Word timing offsets relative to this clip
      const captionWords: CaptionWord[] = chunkWords.map((word, wIdx) => ({
        word,
        start: wIdx * avgSecPerWord,
        end: (wIdx + 1) * avgSecPerWord,
      }));

      const rawText = chunkWords.join(' ');
      const displayText = stylePreset.isUppercase ? rawText.toUpperCase() : rawText;

      phraseClips.push({
        id: `caption-${Date.now()}-${i}`,
        trackId: 'track-text',
        type: 'text',
        name: `Sous-Titre: ${chunkWords.slice(0, 3).join(' ')}...`,
        start: curTime,
        duration: chunkDuration,
        offset: 0,
        text: displayText,
        captionStyleId: stylePreset.id,
        fontFamily: stylePreset.fontFamily,
        fontSize: stylePreset.fontSize,
        fontWeight: stylePreset.fontWeight,
        textColor: stylePreset.textColor,
        strokeColor: stylePreset.strokeColor,
        strokeWidth: stylePreset.strokeWidth,
        shadowColor: stylePreset.shadowColor,
        shadowBlur: stylePreset.shadowBlur,
        shadowOffsetX: stylePreset.shadowOffsetX,
        shadowOffsetY: stylePreset.shadowOffsetY,
        backgroundColor: stylePreset.backgroundColor,
        backgroundPadding: stylePreset.backgroundPadding,
        backgroundBorderRadius: stylePreset.backgroundBorderRadius,
        isUppercase: stylePreset.isUppercase,
        x: 0.5,
        y: 0.82,
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
        zIndex: 10,
        textAnimation: stylePreset.animationType || 'word-karaoke',
        captionWords,
      });

      curTime += chunkDuration;
    }

    setProject((prev) => ({
      ...prev,
      duration: Math.max(prev.duration, curTime + 2),
      tracks: prev.tracks.map((t) =>
        t.type === 'text' ? { ...t, clips: [...t.clips, ...phraseClips] } : t
      ),
    }));
  };

  // Apply chosen caption style preset to all existing caption clips
  const handleApplyStyleToAllCaptions = (styleId: string) => {
    const stylePreset = CAPTION_STYLES_CATALOG.find((s) => s.id === styleId);
    if (!stylePreset) return;

    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => {
        if (t.type !== 'text') return t;
        return {
          ...t,
          clips: t.clips.map((c) => ({
            ...c,
            captionStyleId: stylePreset.id,
            fontFamily: stylePreset.fontFamily,
            fontSize: stylePreset.fontSize,
            fontWeight: stylePreset.fontWeight,
            textColor: stylePreset.textColor,
            strokeColor: stylePreset.strokeColor,
            strokeWidth: stylePreset.strokeWidth,
            shadowColor: stylePreset.shadowColor,
            shadowBlur: stylePreset.shadowBlur,
            shadowOffsetX: stylePreset.shadowOffsetX,
            shadowOffsetY: stylePreset.shadowOffsetY,
            backgroundColor: stylePreset.backgroundColor,
            backgroundPadding: stylePreset.backgroundPadding,
            backgroundBorderRadius: stylePreset.backgroundBorderRadius,
            isUppercase: stylePreset.isUppercase,
            textAnimation: stylePreset.animationType || 'word-karaoke',
            text: stylePreset.isUppercase ? (c.text || '').toUpperCase() : c.text,
          })),
        };
      }),
    }));
  };

  // Generate a full complete AI commercial video storyboard
  const handleGenerateFullAIVideo = () => {
    const assets = STOCK_MEDIA_ASSETS.slice(0, 4);
    let cur = 0;

    const newVideoClips: ClipItem[] = assets.map((a, idx) => {
      const dur = 4.0;
      const c: ClipItem = {
        id: `ai-v-${Date.now()}-${idx}`,
        trackId: 'track-video',
        type: a.type,
        name: a.title,
        start: cur,
        duration: dur,
        offset: 0,
        mediaUrl: a.mediaUrl,
        thumbnailUrl: a.thumbnailUrl,
        x: 0.5,
        y: 0.5,
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
        zIndex: 1,
        filterPreset: idx % 2 === 0 ? 'teal-orange' : 'vibrant-pop',
        transition: { type: idx === 0 ? 'fade' : 'zoom-in', duration: 0.6 },
      };
      cur += dur;
      return c;
    });

    const aiCaptions: ClipItem[] = [
      {
        id: `ai-c1-${Date.now()}`,
        trackId: 'track-text',
        type: 'text',
        name: 'Sous-Titre Scène 1',
        start: 0.5,
        duration: 3.5,
        offset: 0,
        text: 'L\'INNOVATION EN ACTION',
        fontSize: 52,
        textColor: '#FFFF00',
        strokeColor: '#000000',
        strokeWidth: 8,
        x: 0.5,
        y: 0.82,
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
        zIndex: 10,
        textAnimation: 'word-karaoke',
        captionWords: [
          { word: "L'INNOVATION", start: 0.5, end: 2.0 },
          { word: 'EN', start: 2.1, end: 2.6 },
          { word: 'ACTION', start: 2.7, end: 3.5 },
        ],
      },
      {
        id: `ai-c2-${Date.now()}`,
        trackId: 'track-text',
        type: 'text',
        name: 'Sous-Titre Scène 2',
        start: 4.5,
        duration: 4.0,
        offset: 0,
        text: 'UNE EXPÉRIENCE INÉGALÉE',
        fontSize: 52,
        textColor: '#FFFF00',
        strokeColor: '#000000',
        strokeWidth: 8,
        x: 0.5,
        y: 0.82,
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
        zIndex: 10,
        textAnimation: 'word-karaoke',
        captionWords: [
          { word: 'UNE', start: 0.5, end: 1.5 },
          { word: 'EXPÉRIENCE', start: 1.6, end: 2.8 },
          { word: 'INÉGALÉE', start: 2.9, end: 4.0 },
        ],
      },
    ];

    setProject((prev) => ({
      ...prev,
      duration: cur,
      currentTime: 0,
      tracks: prev.tracks.map((t) => {
        if (t.type === 'video') return { ...t, clips: newVideoClips };
        if (t.type === 'text') return { ...t, clips: aiCaptions };
        return t;
      }),
    }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Editor Header Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-rose-500 p-0.5">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Film className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white tracking-tight">
                VoxCut Pro &bull; Éditeur Vidéo & B-Roll
              </h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Moteur Multi-Pistes 60fps
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Synchronisation voix-off, sous-titres animés, étalonnage LUT, transitions et export 4K sans filigrane.
            </p>
          </div>
        </div>

        {/* Action Buttons: Reset & Export */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => setProject(createInitialProject())}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Exporter la Vidéo (MP4/WebM)</span>
          </button>
        </div>
      </div>

      {/* 2. Main 3-Column Studio Grid: Left Library, Center Canvas Player, Right Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Asset Library (Media, Audio, Text, FX, Transitions, Stickers, AI) */}
        <div className="lg:col-span-4 xl:col-span-3">
          <AssetLibrary
            project={project}
            sessionTakes={sessionTakes}
            onAddClipToTrack={handleAddClipToTrack}
            onApplyFilterToSelected={handleApplyFilterToSelected}
            onApplyTransitionToSelected={handleApplyTransitionToSelected}
            onGenerateAutoCaptions={handleGenerateAutoCaptions}
            onApplyStyleToAllCaptions={handleApplyStyleToAllCaptions}
            onGenerateFullAIVideo={handleGenerateFullAIVideo}
          />
        </div>

        {/* Center Column: Video Player Viewport */}
        <div className="lg:col-span-8 xl:col-span-6">
          <CanvasPlayer
            project={project}
            onUpdateProject={setProject}
            onTogglePlay={handleTogglePlay}
            onSeek={handleSeek}
          />
        </div>

        {/* Right Column: Clip Inspector (Spatial, Color, Text, Audio, Transitions) */}
        <div className="lg:col-span-12 xl:col-span-3">
          <ClipInspector
            project={project}
            selectedClip={selectedClip}
            onUpdateClip={handleUpdateClip}
            onDeleteClip={handleDeleteClip}
            onOpenCropModal={(c) => setCroppingClip(c)}
          />
        </div>
      </div>

      {/* 3. Bottom Multi-Track Timeline */}
      <div>
        <Timeline
          project={project}
          onUpdateProject={setProject}
          onSelectClip={(id) => setProject((prev) => ({ ...prev, selectedClipId: id }))}
          onSeek={handleSeek}
        />
      </div>

      {/* 4. Export Video Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        project={project}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* 5. Interactive Visual Crop Modal */}
      <CropModal
        isOpen={Boolean(croppingClip)}
        clip={croppingClip}
        onClose={() => setCroppingClip(null)}
        onSaveCrop={(id, crop) => {
          handleUpdateClip(id, { crop });
          setCroppingClip(null);
        }}
      />
    </div>
  );
};
