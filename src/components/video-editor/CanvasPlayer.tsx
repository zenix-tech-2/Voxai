import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  VideoProject,
  AspectRatio,
} from '../../types/videoEditor';
import { VideoRenderer, CANVAS_DIMENSIONS } from '../../utils/videoRenderer';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Maximize2,
  Tv,
  Smartphone,
  Square,
  Grid,
  Volume2,
  VolumeX,
  Layers,
  Repeat,
} from 'lucide-react';

interface CanvasPlayerProps {
  project: VideoProject;
  onUpdateProject: (updater: (prev: VideoProject) => VideoProject) => void;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
}

export const CanvasPlayer: React.FC<CanvasPlayerProps> = ({
  project,
  onUpdateProject,
  onTogglePlay,
  onSeek,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<VideoRenderer | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  const [isLooping, setIsLooping] = useState(false);
  const [isDraggingCanvasClip, setIsDraggingCanvasClip] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialClipPos, setInitialClipPos] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });

  // Initialize renderer
  useEffect(() => {
    if (canvasRef.current) {
      rendererRef.current = new VideoRenderer(canvasRef.current);
    }
  }, []);

  // Continuous frame rendering on time change or project update
  const renderCurrent = useCallback(() => {
    if (rendererRef.current && canvasRef.current) {
      rendererRef.current.renderFrame(project, project.currentTime, {
        showSafeAreas: project.safeAreaGuide !== 'none',
        selectedClipId: project.selectedClipId,
      });
    }
  }, [project]);

  useEffect(() => {
    renderCurrent();
  }, [renderCurrent]);

  // Format time display
  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}.${ms < 10 ? '0' : ''}${ms}`;
  };

  // Aspect ratio change
  const handleSelectAspectRatio = (ratio: AspectRatio) => {
    onUpdateProject((prev) => ({
      ...prev,
      aspectRatio: ratio,
    }));
  };

  // Safe area guide change
  const handleToggleGuide = () => {
    const sequence: ('none' | 'tiktok' | 'reels' | 'grid')[] = ['none', 'tiktok', 'reels', 'grid'];
    const nextIdx = (sequence.indexOf(project.safeAreaGuide as any) + 1) % sequence.length;
    onUpdateProject((prev) => ({
      ...prev,
      safeAreaGuide: sequence[nextIdx],
    }));
  };

  // Fullscreen
  const handleToggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Interactive on-canvas drag to move selected element
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!project.selectedClipId || !canvasRef.current) return;

    // Find selected clip
    let selectedClip = null;
    for (const track of project.tracks) {
      const c = track.clips.find((item) => item.id === project.selectedClipId);
      if (c) {
        selectedClip = c;
        break;
      }
    }
    if (!selectedClip) return;

    setIsDraggingCanvasClip(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setInitialClipPos({ x: selectedClip.x, y: selectedClip.y });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingCanvasClip || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaX = (e.clientX - dragStartPos.x) / rect.width;
      const deltaY = (e.clientY - dragStartPos.y) / rect.height;

      const newX = Math.max(0, Math.min(1, initialClipPos.x + deltaX));
      const newY = Math.max(0, Math.min(1, initialClipPos.y + deltaY));

      onUpdateProject((prev) => ({
        ...prev,
        tracks: prev.tracks.map((t) => ({
          ...t,
          clips: t.clips.map((c) =>
            c.id === prev.selectedClipId ? { ...c, x: newX, y: newY } : c
          ),
        })),
      }));
    };

    const handleMouseUp = () => {
      setIsDraggingCanvasClip(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingCanvasClip, dragStartPos, initialClipPos, onUpdateProject]);

  // Aspect ratio label / icon
  const getAspectIcon = (ratio: AspectRatio) => {
    switch (ratio) {
      case '16:9':
        return <Tv className="w-3.5 h-3.5" />;
      case '9:16':
        return <Smartphone className="w-3.5 h-3.5" />;
      case '1:1':
        return <Square className="w-3.5 h-3.5" />;
      case '4:5':
        return <Smartphone className="w-3.5 h-3.5" />;
      case '21:9':
        return <Tv className="w-3.5 h-3.5" />;
      case '2:3':
        return <Smartphone className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div
      ref={playerContainerRef}
      className="flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative"
    >
      {/* 1. Top Player Bar: Aspect Ratio Switcher & Safe Guides */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
        {/* Aspect Ratio Buttons */}
        <div className="flex items-center gap-1.5 p-0.5 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
          {(['16:9', '9:16', '1:1', '4:5', '21:9', '2:3'] as AspectRatio[]).map((ratio) => (
            <button
              key={ratio}
              type="button"
              onClick={() => handleSelectAspectRatio(ratio)}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                project.aspectRatio === ratio
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {getAspectIcon(ratio)}
              <span>{ratio}</span>
            </button>
          ))}
        </div>

        {/* Safe Area Guides & Resolution info */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleGuide}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              project.safeAreaGuide !== 'none'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="capitalize">
              {project.safeAreaGuide === 'none'
                ? 'Repères : Off'
                : `Guide : ${project.safeAreaGuide}`}
            </span>
          </button>

          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            1080p 60fps
          </span>
        </div>
      </div>

      {/* 2. Central Video Canvas Viewport */}
      <div className="relative flex-1 bg-slate-950 flex items-center justify-center p-4 min-h-[360px] md:min-h-[460px] overflow-hidden">
        {/* Canvas Display */}
        <div className="relative max-w-full max-h-[500px] flex items-center justify-center shadow-2xl rounded-lg overflow-hidden border border-slate-800/80">
          <canvas
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            className={`max-w-full max-h-[480px] object-contain transition-all ${
              project.selectedClipId ? 'cursor-move' : 'cursor-default'
            }`}
            style={{
              aspectRatio:
                project.aspectRatio === '16:9'
                  ? '16/9'
                  : project.aspectRatio === '9:16'
                  ? '9/16'
                  : project.aspectRatio === '1:1'
                  ? '1/1'
                  : project.aspectRatio === '4:5'
                  ? '4/5'
                  : project.aspectRatio === '2:3'
                  ? '2/3'
                  : '21/9',
            }}
          />

          {/* On-canvas Drag helper badge */}
          {project.selectedClipId && (
            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-cyan-500/30 text-[10px] text-cyan-400 font-semibold pointer-events-none flex items-center gap-1.5 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>Glisser pour repositionner sur le canvas</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Transport Controls Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 gap-3">
        {/* Playhead Time & Duration */}
        <div className="font-mono text-xs tabular-nums text-slate-300 flex items-center gap-2">
          <span className="font-bold text-cyan-400">{formatTimecode(project.currentTime)}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">{formatTimecode(project.duration)}</span>
        </div>

        {/* Center Transport Buttons */}
        <div className="flex items-center gap-2">
          {/* Skip to Start */}
          <button
            type="button"
            title="Revenir au début (Home)"
            onClick={() => onSeek(0)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Step Back 1s */}
          <button
            type="button"
            title="Reculer de 1s (Flèche Gauche)"
            onClick={() => onSeek(Math.max(0, project.currentTime - 1))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-mono cursor-pointer"
          >
            -1s
          </button>

          {/* Primary Play / Pause Button */}
          <button
            type="button"
            title="Lecture / Pause (Barre Espace)"
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/25 transition-transform active:scale-95 cursor-pointer font-black"
          >
            {project.isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Step Forward 1s */}
          <button
            type="button"
            title="Avancer de 1s (Flèche Droite)"
            onClick={() => onSeek(Math.min(project.duration, project.currentTime + 1))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-mono cursor-pointer"
          >
            +1s
          </button>

          {/* Skip to End */}
          <button
            type="button"
            title="Aller à la fin (End)"
            onClick={() => onSeek(project.duration)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Right Auxiliaries: Loop & Fullscreen */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            title={`Boucle : ${isLooping ? 'Activée' : 'Désactivée'}`}
            onClick={() => setIsLooping(!isLooping)}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isLooping
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Repeat className="w-4 h-4" />
          </button>

          <button
            type="button"
            title="Plein Écran"
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
