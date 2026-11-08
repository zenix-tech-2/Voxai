import React, { useRef, useState, useEffect } from 'react';
import {
  VideoProject,
  ClipItem,
  Track,
  TrackType,
} from '../../types/videoEditor';
import {
  Scissors,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  Magnet,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Film,
  Type,
  Mic,
  Music,
  Layers,
  Sparkles,
  Plus,
} from 'lucide-react';

interface TimelineProps {
  project: VideoProject;
  onUpdateProject: (updater: (prev: VideoProject) => VideoProject) => void;
  onSelectClip: (clipId: string | null) => void;
  onSeek: (time: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  project,
  onUpdateProject,
  onSelectClip,
  onSeek,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const [isScrubbingRuler, setIsScrubbingRuler] = useState(false);
  const [draggingClipId, setDraggingClipId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [clipOriginalStart, setClipOriginalStart] = useState<number>(0);

  // Zoom: pixels per second (min 20px, max 200px)
  const zoom = project.zoomLevel || 60;
  const totalTimelineWidth = Math.max(1200, project.duration * zoom + 300);

  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}.${frames < 10 ? '0' : ''}${frames}`;
  };

  // Convert pixel offset to timeline seconds
  const pxToSec = (px: number) => Math.max(0, px / zoom);
  const secToPx = (sec: number) => sec * zoom;

  // Handle ruler click / scrub to seek
  const handleRulerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = Math.min(project.duration, Math.max(0, pxToSec(clickX)));
    onSeek(newTime);
    setIsScrubbingRuler(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbingRuler && rulerRef.current) {
        const rect = rulerRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newTime = Math.min(project.duration, Math.max(0, pxToSec(clickX)));
        onSeek(newTime);
      } else if (draggingClipId) {
        const deltaPx = e.clientX - dragStartX;
        const deltaSec = deltaPx / zoom;
        let newStart = Math.max(0, clipOriginalStart + deltaSec);

        // Snap to playhead or 0 if snapping enabled
        if (project.isSnappingEnabled) {
          if (Math.abs(newStart - project.currentTime) < 0.2) {
            newStart = project.currentTime;
          }
          if (newStart < 0.2) newStart = 0;
        }

        onUpdateProject((prev) => ({
          ...prev,
          tracks: prev.tracks.map((track) => ({
            ...track,
            clips: track.clips.map((clip) =>
              clip.id === draggingClipId ? { ...clip, start: newStart } : clip
            ),
          })),
        }));
      }
    };

    const handleMouseUp = () => {
      setIsScrubbingRuler(false);
      setDraggingClipId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isScrubbingRuler,
    draggingClipId,
    dragStartX,
    clipOriginalStart,
    zoom,
    project.duration,
    project.currentTime,
    project.isSnappingEnabled,
    onSeek,
    onUpdateProject,
  ]);

  // Split selected clip at playhead (Scissors / Razor tool)
  const handleSplitClipAtPlayhead = () => {
    if (!project.selectedClipId) return;

    onUpdateProject((prev) => {
      let splitHappened = false;
      const updatedTracks = prev.tracks.map((track) => {
        const clipIdx = track.clips.findIndex((c) => c.id === prev.selectedClipId);
        if (clipIdx === -1) return track;

        const clip = track.clips[clipIdx];
        const playhead = prev.currentTime;

        // Verify playhead is inside clip
        if (playhead <= clip.start || playhead >= clip.start + clip.duration) {
          return track;
        }

        const firstDuration = playhead - clip.start;
        const secondDuration = clip.duration - firstDuration;

        const clip1: ClipItem = {
          ...clip,
          duration: firstDuration,
        };

        const clip2: ClipItem = {
          ...clip,
          id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          start: playhead,
          duration: secondDuration,
          offset: clip.offset + firstDuration,
        };

        splitHappened = true;
        const newClips = [...track.clips];
        newClips.splice(clipIdx, 1, clip1, clip2);
        return { ...track, clips: newClips };
      });

      if (!splitHappened) return prev;
      return { ...prev, tracks: updatedTracks };
    });
  };

  // Delete selected clip (standard)
  const handleDeleteSelectedClip = () => {
    if (!project.selectedClipId) return;
    onUpdateProject((prev) => ({
      ...prev,
      selectedClipId: null,
      tracks: prev.tracks.map((track) => ({
        ...track,
        clips: track.clips.filter((c) => c.id !== prev.selectedClipId),
      })),
    }));
    onSelectClip(null);
  };

  // Ripple Delete selected clip (closes the gap automatically)
  const handleRippleDeleteSelectedClip = () => {
    if (!project.selectedClipId) return;
    onUpdateProject((prev) => {
      let deletedDuration = 0;
      let deletedStart = 0;
      let targetTrackId = '';

      for (const t of prev.tracks) {
        const found = t.clips.find((c) => c.id === prev.selectedClipId);
        if (found) {
          deletedDuration = found.duration;
          deletedStart = found.start;
          targetTrackId = t.id;
          break;
        }
      }

      if (!targetTrackId) return prev;

      return {
        ...prev,
        selectedClipId: null,
        duration: Math.max(1, prev.duration - deletedDuration),
        tracks: prev.tracks.map((t) => {
          if (t.id !== targetTrackId) return t;
          return {
            ...t,
            clips: t.clips
              .filter((c) => c.id !== prev.selectedClipId)
              .map((c) => (c.start > deletedStart ? { ...c, start: c.start - deletedDuration } : c)),
          };
        }),
      };
    });
    onSelectClip(null);
  };

  // In / Out Points: Mark In, Mark Out, Cut Range
  const handleMarkIn = () => {
    onUpdateProject((prev) => ({ ...prev, inPoint: prev.currentTime }));
  };

  const handleMarkOut = () => {
    onUpdateProject((prev) => ({ ...prev, outPoint: prev.currentTime }));
  };

  const handleClearInOut = () => {
    onUpdateProject((prev) => ({ ...prev, inPoint: null, outPoint: null }));
  };

  // Cut & Remove the selected slice between IN and OUT markers
  const handleCutRangeBetweenInOut = () => {
    if (project.inPoint === null || project.outPoint === null) return;
    const startCut = Math.min(project.inPoint, project.outPoint);
    const endCut = Math.max(project.inPoint, project.outPoint);
    const cutDuration = endCut - startCut;
    if (cutDuration <= 0) return;

    onUpdateProject((prev) => {
      const updatedTracks = prev.tracks.map((track) => {
        const newClips: ClipItem[] = [];

        for (const clip of track.clips) {
          const clipStart = clip.start;
          const clipEnd = clip.start + clip.duration;

          // 1. Completely before cut
          if (clipEnd <= startCut) {
            newClips.push(clip);
          }
          // 2. Completely after cut -> shift left
          else if (clipStart >= endCut) {
            newClips.push({ ...clip, start: clip.start - cutDuration });
          }
          // 3. Completely inside cut -> deleted
          else if (clipStart >= startCut && clipEnd <= endCut) {
            // Drop clip
          }
          // 4. Clip spans across the entire cut -> split into two
          else if (clipStart < startCut && clipEnd > endCut) {
            const firstPart: ClipItem = {
              ...clip,
              duration: startCut - clipStart,
            };
            const secondPart: ClipItem = {
              ...clip,
              id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              start: startCut,
              duration: clipEnd - endCut,
              offset: clip.offset + (endCut - clipStart),
            };
            newClips.push(firstPart, secondPart);
          }
          // 5. Overlaps start of cut -> trim end
          else if (clipStart < startCut && clipEnd > startCut) {
            newClips.push({
              ...clip,
              duration: startCut - clipStart,
            });
          }
          // 6. Overlaps end of cut -> trim start and shift
          else if (clipStart < endCut && clipEnd > endCut) {
            const trimAmount = endCut - clipStart;
            newClips.push({
              ...clip,
              start: startCut,
              duration: clip.duration - trimAmount,
              offset: clip.offset + trimAmount,
            });
          }
        }

        return { ...track, clips: newClips };
      });

      return {
        ...prev,
        inPoint: null,
        outPoint: null,
        duration: Math.max(1, prev.duration - cutDuration),
        currentTime: Math.min(prev.currentTime, Math.max(0, prev.duration - cutDuration)),
        tracks: updatedTracks,
      };
    });
  };

  // Duplicate selected clip
  const handleDuplicateSelectedClip = () => {
    if (!project.selectedClipId) return;
    onUpdateProject((prev) => {
      let duplicated = false;
      const updatedTracks = prev.tracks.map((track) => {
        const clip = track.clips.find((c) => c.id === prev.selectedClipId);
        if (!clip) return track;

        duplicated = true;
        const copy: ClipItem = {
          ...clip,
          id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: `${clip.name} (Copie)`,
          start: clip.start + clip.duration + 0.5,
        };
        return { ...track, clips: [...track.clips, copy] };
      });
      if (!duplicated) return prev;
      return { ...prev, tracks: updatedTracks };
    });
  };

  // Advance Trim: Nudge start or end
  const handleAdvanceTrim = (clipId: string, edge: 'start' | 'end', deltaSec: number) => {
    onUpdateProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => ({
        ...t,
        clips: t.clips.map((c) => {
          if (c.id !== clipId) return c;
          if (edge === 'start') {
            const newStart = Math.max(0, c.start + deltaSec);
            const newDuration = Math.max(0.2, c.duration - deltaSec);
            return { ...c, start: newStart, duration: newDuration };
          } else {
            const newDuration = Math.max(0.2, c.duration + deltaSec);
            return { ...c, duration: newDuration };
          }
        }),
      })),
    }));
  };

  // Zoom in/out
  const handleZoom = (delta: number) => {
    onUpdateProject((prev) => ({
      ...prev,
      zoomLevel: Math.min(200, Math.max(25, (prev.zoomLevel || 60) + delta)),
    }));
  };

  // Toggle Snapping
  const handleToggleSnapping = () => {
    onUpdateProject((prev) => ({
      ...prev,
      isSnappingEnabled: !prev.isSnappingEnabled,
    }));
  };

  // Track icon helper
  const getTrackIcon = (type: TrackType) => {
    switch (type) {
      case 'video':
        return <Film className="w-3.5 h-3.5 text-blue-400" />;
      case 'overlay':
        return <Layers className="w-3.5 h-3.5 text-cyan-400" />;
      case 'text':
        return <Type className="w-3.5 h-3.5 text-amber-400" />;
      case 'voiceover':
        return <Mic className="w-3.5 h-3.5 text-emerald-400" />;
      case 'audio':
        return <Music className="w-3.5 h-3.5 text-purple-400" />;
      case 'effect':
        return <Sparkles className="w-3.5 h-3.5 text-pink-400" />;
    }
  };

  // Track clip colors
  const getClipBgColor = (type: string, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-bold ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-950 shadow-lg';
    }
    switch (type) {
      case 'video':
        return 'bg-blue-600/90 hover:bg-blue-600 text-white border-blue-400/40';
      case 'overlay':
        return 'bg-sky-600/90 hover:bg-sky-600 text-white border-sky-400/40';
      case 'text':
        return 'bg-amber-600/90 hover:bg-amber-600 text-slate-950 font-bold border-amber-300/40';
      case 'voiceover':
        return 'bg-emerald-600/90 hover:bg-emerald-600 text-slate-950 font-bold border-emerald-300/40';
      case 'audio':
        return 'bg-indigo-600/90 hover:bg-indigo-600 text-white border-indigo-400/40';
      case 'sticker':
        return 'bg-rose-600/90 hover:bg-rose-600 text-white border-rose-400/40';
      case 'effect':
        return 'bg-fuchsia-600/90 hover:bg-fuchsia-600 text-white border-fuchsia-400/40';
      default:
        return 'bg-slate-700 hover:bg-slate-600 text-white border-slate-500/40';
    }
  };

  // Generate ruler tick marks
  const renderRulerTicks = () => {
    const ticks = [];
    const interval = zoom >= 100 ? 1 : zoom >= 50 ? 2 : 5; // seconds between marks
    const maxSec = Math.ceil(project.duration) + 15;

    for (let s = 0; s <= maxSec; s += interval) {
      const leftPx = secToPx(s);
      ticks.push(
        <div
          key={s}
          className="absolute top-0 bottom-0 flex flex-col justify-between border-l border-slate-700/60 select-none pointer-events-none"
          style={{ left: `${leftPx}px` }}
        >
          <span className="text-[10px] text-slate-400 font-mono pl-1 leading-none">
            {formatTimecode(s)}
          </span>
          <div className="w-px h-1.5 bg-slate-600" />
        </div>
      );
    }
    return ticks;
  };

  return (
    <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* 1. Timeline Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 gap-3">
        {/* Editing Tools (Split, Ripple Delete, In/Out Cut) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            title="Scinder le clip sélectionné à la tête de lecture (Touche S)"
            onClick={handleSplitClipAtPlayhead}
            disabled={!project.selectedClipId}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          >
            <Scissors className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Scinder</span>
          </button>

          <button
            type="button"
            title="Supprimer le clip sélectionné (Suppr)"
            onClick={handleDeleteSelectedClip}
            disabled={!project.selectedClipId}
            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Supprimer</span>
          </button>

          <button
            type="button"
            title="Supprimer et raccorder automatiquement les clips suivants (Ripple Delete)"
            onClick={handleRippleDeleteSelectedClip}
            disabled={!project.selectedClipId}
            className="p-1.5 rounded-lg text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 border border-amber-500/20 disabled:opacity-40 disabled:hover:bg-transparent transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
          >
            <span>Raccord Auto</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Range In / Out Cut Tools */}
          <button
            type="button"
            title="Marquer le point d'entrée IN (Touche I)"
            onClick={handleMarkIn}
            className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
              project.inPoint !== null
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            [ I ] {project.inPoint !== null ? `${project.inPoint.toFixed(1)}s` : 'Début'}
          </button>

          <button
            type="button"
            title="Marquer le point de sortie OUT (Touche O)"
            onClick={handleMarkOut}
            className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
              project.outPoint !== null
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            [ O ] {project.outPoint !== null ? `${project.outPoint.toFixed(1)}s` : 'Fin'}
          </button>

          {project.inPoint !== null && project.outPoint !== null && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCutRangeBetweenInOut}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all animate-pulse"
                title="Supprimer la portion de vidéo entre IN et OUT et raccorder le reste"
              >
                <Scissors className="w-3 h-3" />
                <span>Couper la Plage ({Math.abs(project.outPoint - project.inPoint).toFixed(1)}s)</span>
              </button>

              <button
                type="button"
                onClick={handleClearInOut}
                className="p-1 rounded text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
                title="Effacer les repères IN/OUT"
              >
                ✕
              </button>
            </div>
          )}

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Magnet / Snapping Toggle */}
          <button
            type="button"
            title={`Aimantation : ${project.isSnappingEnabled ? 'Activée' : 'Désactivée'}`}
            onClick={handleToggleSnapping}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              project.isSnappingEnabled
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Magnet className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Aimant</span>
          </button>
        </div>

        {/* Current Timecode Display & Zoom Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 tabular-nums">
            <span className="text-cyan-400 font-bold">{formatTimecode(project.currentTime)}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">{formatTimecode(project.duration)}</span>
          </div>

          {/* Zoom Slider */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleZoom(-15)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom arrière"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min="25"
              max="180"
              value={zoom}
              onChange={(e) =>
                onUpdateProject((prev) => ({ ...prev, zoomLevel: Number(e.target.value) }))
              }
              className="w-16 sm:w-24 accent-cyan-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
            />
            <button
              type="button"
              onClick={() => handleZoom(15)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom avant"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Multi-Track Canvas & Headers */}
      <div className="flex flex-row overflow-hidden relative" ref={containerRef}>
        {/* Left Fixed Track Headers */}
        <div className="w-48 shrink-0 bg-slate-900 border-r border-slate-800 z-20 flex flex-col divide-y divide-slate-800/80">
          {/* Top Ruler Header Spacer */}
          <div className="h-7 bg-slate-900/90 px-3 flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Pistes ({project.tracks.length})</span>
          </div>

          {/* Track Labels & Controls */}
          {project.tracks.map((track) => (
            <div
              key={track.id}
              className="h-14 px-3 flex items-center justify-between gap-2 bg-slate-900 hover:bg-slate-850 transition-colors group"
            >
              <div className="flex items-center gap-2 truncate">
                <div className="p-1 rounded bg-slate-800/80 shrink-0">
                  {getTrackIcon(track.type)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {track.name}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                    {track.type}
                  </div>
                </div>
              </div>

              {/* Track Quick Actions (Mute, Lock, Hide) */}
              <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateProject((prev) => ({
                      ...prev,
                      tracks: prev.tracks.map((t) =>
                        t.id === track.id ? { ...t, isMuted: !t.isMuted } : t
                      ),
                    }))
                  }
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title={track.isMuted ? 'Rétablir le son' : 'Couper le son'}
                >
                  {track.isMuted ? (
                    <VolumeX className="w-3 h-3 text-rose-400" />
                  ) : (
                    <Volume2 className="w-3 h-3" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onUpdateProject((prev) => ({
                      ...prev,
                      tracks: prev.tracks.map((t) =>
                        t.id === track.id ? { ...t, isLocked: !t.isLocked } : t
                      ),
                    }))
                  }
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title={track.isLocked ? 'Déverrouiller la piste' : 'Verrouiller la piste'}
                >
                  {track.isLocked ? (
                    <Lock className="w-3 h-3 text-amber-400" />
                  ) : (
                    <Unlock className="w-3 h-3" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onUpdateProject((prev) => ({
                      ...prev,
                      tracks: prev.tracks.map((t) =>
                        t.id === track.id ? { ...t, isHidden: !t.isHidden } : t
                      ),
                    }))
                  }
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title={track.isHidden ? 'Afficher la piste' : 'Masquer la piste'}
                >
                  {track.isHidden ? (
                    <EyeOff className="w-3 h-3 text-slate-500" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Scrollable Timeline Lanes & Ruler */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden relative bg-slate-950 select-none">
          <div
            className="relative"
            style={{ width: `${totalTimelineWidth}px` }}
          >
            {/* Top Timecode Ruler */}
            <div
              ref={rulerRef}
              onMouseDown={handleRulerMouseDown}
              className="h-7 bg-slate-900/60 border-b border-slate-800 relative cursor-pointer"
            >
              {renderRulerTicks()}
            </div>

            {/* Range Selection Highlight (IN / OUT) */}
            {project.inPoint !== null && project.outPoint !== null && (
              <div
                className="absolute top-0 bottom-0 bg-amber-400/15 border-x-2 border-amber-400 pointer-events-none z-20"
                style={{
                  left: `${secToPx(Math.min(project.inPoint, project.outPoint))}px`,
                  width: `${secToPx(Math.abs(project.outPoint - project.inPoint))}px`,
                }}
              >
                <div className="absolute top-1 left-2 text-[10px] font-mono text-amber-300 font-bold bg-slate-950/80 px-1.5 py-0.5 rounded border border-amber-500/30">
                  ✂ Plage : {Math.abs(project.outPoint - project.inPoint).toFixed(1)}s
                </div>
              </div>
            )}

            {/* Red Playhead Vertical Needle line */}
            <div
              className="absolute top-0 bottom-0 z-30 pointer-events-none flex flex-col items-center"
              style={{
                left: `${secToPx(project.currentTime)}px`,
                transform: 'translateX(-50%)',
              }}
            >
              {/* Playhead Handle Triangle */}
              <div className="w-3.5 h-3.5 bg-rose-500 rotate-45 -mt-1 shadow-md shadow-rose-500/50" />
              <div className="w-0.5 flex-1 bg-rose-500 shadow-sm shadow-rose-500" />
            </div>

            {/* Track Lanes */}
            <div className="divide-y divide-slate-800/60">
              {project.tracks.map((track) => (
                <div
                  key={track.id}
                  className={`h-14 relative ${
                    track.isHidden ? 'opacity-30' : ''
                  } ${track.isLocked ? 'bg-slate-950/60' : 'bg-slate-950'}`}
                >
                  {/* Alternating subtle background guidelines */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-900/10 to-transparent pointer-events-none" />

                  {/* Clips on this track */}
                  {track.clips.map((clip) => {
                    const isSelected = project.selectedClipId === clip.id;
                    const leftPx = secToPx(clip.start);
                    const widthPx = Math.max(20, secToPx(clip.duration));

                    return (
                      <div
                        key={clip.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectClip(clip.id);
                        }}
                        onMouseDown={(e) => {
                          if (track.isLocked) return;
                          e.stopPropagation();
                          onSelectClip(clip.id);
                          setDraggingClipId(clip.id);
                          setDragStartX(e.clientX);
                          setClipOriginalStart(clip.start);
                        }}
                        className={`absolute top-1.5 bottom-1.5 rounded-lg px-2 flex items-center justify-between border cursor-grab active:cursor-grabbing transition-shadow overflow-hidden ${getClipBgColor(
                          clip.type,
                          isSelected
                        )}`}
                        style={{
                          left: `${leftPx}px`,
                          width: `${widthPx}px`,
                        }}
                      >
                        {/* Clip Information & Icon */}
                        <div className="flex items-center gap-1.5 truncate pointer-events-none">
                          <span className="text-xs shrink-0 font-bold">
                            {clip.type === 'text'
                              ? 'T'
                              : clip.type === 'voiceover'
                              ? '🎙'
                              : clip.type === 'audio'
                              ? '🎵'
                              : '🎬'}
                          </span>
                          <span className="text-xs truncate tracking-tight">
                            {clip.name}
                          </span>
                        </div>

                        {/* Audio Waveform visualization bar snippet */}
                        {(clip.type === 'voiceover' || clip.type === 'audio') && (
                          <div className="flex items-center gap-0.5 opacity-50 shrink-0 pointer-events-none">
                            <span className="w-0.5 h-3 bg-current rounded-full animate-pulse" />
                            <span className="w-0.5 h-5 bg-current rounded-full" />
                            <span className="w-0.5 h-2 bg-current rounded-full" />
                            <span className="w-0.5 h-4 bg-current rounded-full" />
                          </div>
                        )}

                        {/* Left & Right Trim Handles */}
                        {isSelected && !track.isLocked && (
                          <>
                            <div
                              title="Ajuster début"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                const startX = e.clientX;
                                const originalStart = clip.start;
                                const originalDuration = clip.duration;

                                const handleTrimMove = (moveEv: MouseEvent) => {
                                  const deltaSec = (moveEv.clientX - startX) / zoom;
                                  const newStart = Math.max(0, originalStart + deltaSec);
                                  const newDuration = Math.max(0.2, originalDuration - deltaSec);

                                  onUpdateProject((prev) => ({
                                    ...prev,
                                    tracks: prev.tracks.map((t) => ({
                                      ...t,
                                      clips: t.clips.map((c) =>
                                        c.id === clip.id
                                          ? { ...c, start: newStart, duration: newDuration }
                                          : c
                                      ),
                                    })),
                                  }));
                                };

                                const handleTrimUp = () => {
                                  window.removeEventListener('mousemove', handleTrimMove);
                                  window.removeEventListener('mouseup', handleTrimUp);
                                };

                                window.addEventListener('mousemove', handleTrimMove);
                                window.addEventListener('mouseup', handleTrimUp);
                              }}
                              className="absolute left-0 top-0 bottom-0 w-2.5 bg-white/40 hover:bg-white cursor-ew-resize rounded-l flex items-center justify-center"
                            >
                              <div className="w-0.5 h-3 bg-slate-900 rounded-full" />
                            </div>

                            <div
                              title="Ajuster fin"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                const startX = e.clientX;
                                const originalDuration = clip.duration;

                                const handleTrimMove = (moveEv: MouseEvent) => {
                                  const deltaSec = (moveEv.clientX - startX) / zoom;
                                  const newDuration = Math.max(0.2, originalDuration + deltaSec);

                                  onUpdateProject((prev) => ({
                                    ...prev,
                                    tracks: prev.tracks.map((t) => ({
                                      ...t,
                                      clips: t.clips.map((c) =>
                                        c.id === clip.id ? { ...c, duration: newDuration } : c
                                      ),
                                    })),
                                  }));
                                };

                                const handleTrimUp = () => {
                                  window.removeEventListener('mousemove', handleTrimMove);
                                  window.removeEventListener('mouseup', handleTrimUp);
                                };

                                window.addEventListener('mousemove', handleTrimMove);
                                window.addEventListener('mouseup', handleTrimUp);
                              }}
                              className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/40 hover:bg-white cursor-ew-resize rounded-r flex items-center justify-center"
                            >
                              <div className="w-0.5 h-3 bg-slate-900 rounded-full" />
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
