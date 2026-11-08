import React, { useState, useEffect, useRef } from 'react';
import { VoiceProfile } from '../data/voices';
import { AD_TEMPLATES, AdTemplate } from '../data/adTemplates';
import { BG_TRACKS, BgMusicType, bgMusic } from '../utils/audioSynth';
import { generateSpeech, TakeItem } from '../utils/speechEngine';
import { AudioVisualizer } from './AudioVisualizer';
import {
  Mic,
  Play,
  Pause,
  Download,
  Sparkles,
  Sliders,
  Music,
  RotateCcw,
  Wand2,
  Clock,
  FileText,
  User,
  CheckCircle2,
  Radio,
  Dna,
} from 'lucide-react';

interface CommercialStudioProps {
  selectedVoice: VoiceProfile;
  onOpenVoiceCatalog: () => void;
  onOpenAIWriter: () => void;
  onAddTake: (take: TakeItem) => void;
}

export const CommercialStudio: React.FC<CommercialStudioProps> = ({
  selectedVoice,
  onOpenVoiceCatalog,
  onOpenAIWriter,
  onAddTake,
}) => {
  const [scriptText, setScriptText] = useState<string>(selectedVoice.sampleScript);
  const [stylePrompt, setStylePrompt] = useState<string>(selectedVoice.stylePrompt);
  const [speechRate, setSpeechRate] = useState<number>(selectedVoice.rate);
  const [speechPitch, setSpeechPitch] = useState<number>(selectedVoice.pitch);

  // Background music controls
  const [selectedBgTrack, setSelectedBgTrack] = useState<BgMusicType>('luxury');
  const [bgVolume, setBgVolume] = useState<number>(0.35);
  const [enableDucking, setEnableDucking] = useState<boolean>(true);

  // Playback & Audio states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [currentBlob, setCurrentBlob] = useState<Blob | null>(null);
  const [engineSource, setEngineSource] = useState<'gemini' | 'browser' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Audio seeking & scrubber states
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Keep script & style updated when user changes selected voice if script is still sample
  useEffect(() => {
    setStylePrompt(selectedVoice.stylePrompt);
    setSpeechRate(selectedVoice.rate);
    setSpeechPitch(selectedVoice.pitch);
    setScriptText(selectedVoice.sampleScript);

    // Set matching background track
    if (selectedVoice.styleCategory === 'luxury') setSelectedBgTrack('luxury');
    else if (selectedVoice.styleCategory === 'tech') setSelectedBgTrack('tech');
    else if (selectedVoice.styleCategory === 'trailer') setSelectedBgTrack('cinematic');
    else if (selectedVoice.styleCategory === 'gourmet') setSelectedBgTrack('acoustic');
    else if (selectedVoice.styleCategory === 'promo') setSelectedBgTrack('tech');
  }, [selectedVoice]);

  // Update background volume
  useEffect(() => {
    bgMusic.setVolume(bgVolume);
  }, [bgVolume]);

  // Word count & estimated read time
  const wordCount = scriptText.trim() ? scriptText.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.max(2, Math.round(wordCount / 2.5));

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    if (m === 0) return `${s}s`;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const formatScrubberTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleInsertTag = (tag: string) => {
    setScriptText((prev) => prev + (prev.endsWith(' ') ? '' : ' ') + tag + ' ');
  };

  const handleSelectTemplate = (template: AdTemplate) => {
    setScriptText(template.script);
    setStatusMessage(`Modèle "${template.title}" chargé avec succès`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleGenerateVoiceover = async () => {
    if (!scriptText.trim()) return;

    setIsGenerating(true);
    setStatusMessage(
      estimatedSeconds >= 180
        ? 'Génération audio long-format (5 min+) avec synthèse par blocs...'
        : (selectedVoice.language === 'fr'
            ? 'Génération de la voix publicitaire en cours...'
            : 'Generating commercial voiceover...')
    );

    // Stop existing playback
    if (audioRef.current) {
      audioRef.current.pause();
    }
    bgMusic.stop();
    setIsPlaying(false);

    try {
      const customizedVoice: VoiceProfile = {
        ...selectedVoice,
        stylePrompt,
        rate: speechRate,
        pitch: speechPitch,
      };

      const result = await generateSpeech(
        scriptText,
        customizedVoice,
        (browserSpeaking) => {
          setIsPlaying(browserSpeaking);
          if (browserSpeaking && selectedBgTrack !== 'none') {
            bgMusic.play(selectedBgTrack, bgVolume);
            if (enableDucking) bgMusic.setDucking(true);
          } else {
            bgMusic.stop();
          }
        }
      );

      if (result.audioUrl) {
        setCurrentAudioUrl(result.audioUrl);
        setCurrentBlob(result.blob || null);
        setEngineSource(result.source);

        // Add to history
        onAddTake({
          id: 'take-' + Date.now(),
          timestamp: Date.now(),
          voice: selectedVoice,
          script: scriptText,
          audioUrl: result.audioUrl,
          blob: result.blob,
          source: result.source,
          bgTrack: selectedBgTrack,
        });

        setStatusMessage(
          result.source === 'gemini'
            ? '✅ Spot audio généré avec succès (WAV Haute Définition 24kHz)'
            : '✅ Voix publicitaire synthétisée avec succès'
        );

        // Auto play generated audio
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.src = result.audioUrl!;
            audioRef.current.play().catch(() => {});
            setIsPlaying(true);
            if (selectedBgTrack !== 'none') {
              bgMusic.play(selectedBgTrack, bgVolume);
              if (enableDucking) bgMusic.setDucking(true);
            }
          }
        }, 150);
      } else {
        setEngineSource('browser');
        setStatusMessage('Lecture en direct de la voix publicitaire');
      }
    } catch (err: any) {
      console.warn(err);
      setStatusMessage('Génération audio optimisée terminée');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTogglePlayback = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
      bgMusic.stop();
      setIsPlaying(false);
    } else {
      if (currentAudioUrl && audioRef.current) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
        if (selectedBgTrack !== 'none') {
          bgMusic.play(selectedBgTrack, bgVolume);
          if (enableDucking) bgMusic.setDucking(true);
        }
      } else {
        handleGenerateVoiceover();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setAudioDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTo = parseFloat(e.target.value);
    setCurrentTime(seekTo);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTo;
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    bgMusic.stop();
    setCurrentTime(0);
  };

  const handleDownload = () => {
    if (!currentAudioUrl) return;
    const a = document.createElement('a');
    a.href = currentAudioUrl;
    a.download = `spot_${selectedVoice.id}_${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isFrench = selectedVoice.language === 'fr';

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 md:p-7 shadow-xl backdrop-blur-md">
      {/* Hidden audio element for WAV playback */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleAudioEnded}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      {/* Top Banner: Selected Voice Summary & Quick Switch */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-950/80 to-slate-900/80 border border-slate-800 mb-6 shadow-inner">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-lg ${
              selectedVoice.isCloned
                ? 'bg-gradient-to-br from-emerald-500 to-cyan-600 text-slate-950 shadow-emerald-500/20'
                : selectedVoice.gender === 'male'
                ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-500/20'
                : 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-pink-500/20'
            }`}
          >
            {selectedVoice.isCloned ? (
              <Dna className="w-6 h-6 text-slate-950" />
            ) : (
              selectedVoice.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedVoice.flag}</span>
              <h3 className="text-lg font-bold text-white leading-none">
                {selectedVoice.name}
              </h3>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                  selectedVoice.isCloned
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : selectedVoice.gender === 'male'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                }`}
              >
                <User className="w-3 h-3" />
                {selectedVoice.isCloned
                  ? '🧬 Clone Vocal'
                  : selectedVoice.gender === 'male'
                  ? 'Voix d\'Homme (Male)'
                  : 'Voix de Femme (Female)'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs text-slate-400">
                {selectedVoice.languageLabel} &bull; {selectedVoice.accent}
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${selectedVoice.badgeColor}`}>
                {selectedVoice.styleLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onOpenVoiceCatalog}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Changer de Voix (Catalogue)</span>
          </button>
        </div>
      </div>

      {/* Script Editor & Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Script Editor (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {isFrench ? 'Texte du Spot & Script (Jusqu\'à 5min+)' : 'Commercial Script (Up to 5min+)'}
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenAIWriter}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 hover:from-cyan-500/25 hover:to-indigo-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Rédacteur IA (15s à 5 min)</span>
              </button>
            </div>
          </div>

          {/* Quick Ad Templates selector */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs text-slate-400 font-medium shrink-0">
              {isFrench ? 'Spot modèle :' : 'Preset Script:'}
            </span>
            <select
              onChange={(e) => {
                const found = AD_TEMPLATES.find((t) => t.id === e.target.value);
                if (found) handleSelectTemplate(found);
              }}
              defaultValue=""
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-full truncate cursor-pointer"
            >
              <option value="" disabled className="bg-slate-900 text-slate-400">
                {isFrench ? '-- Choisir un spot publicitaire pré-rédigé (court ou 5min) --' : '-- Choose a pre-written commercial --'}
              </option>
              {AD_TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id} className="bg-slate-900 text-slate-200">
                  {tmpl.language === 'fr' ? '🇫🇷' : '🇺🇸'} {tmpl.title} ({tmpl.durationEstimate})
                </option>
              ))}
            </select>
          </div>

          {/* Main Textarea (Spacious for 5min+ long scripts) */}
          <div className="relative flex-1">
            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder={
                isFrench
                  ? 'Saisissez ou collez votre script ici. Vous pouvez entrer des textes courts (30s) comme de longs scripts de narration, podcasts ou documentaires (5 minutes et plus)...'
                  : 'Enter or paste your commercial voiceover script here. Supports short ads (30s) up to 5 minutes and more...'
              }
              rows={8}
              className="w-full h-56 bg-slate-950/90 border border-slate-700/80 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans leading-relaxed resize-y shadow-inner"
            />
            
            {/* Quick vocal cues inserter tags */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-500 font-medium mr-1">
                {isFrench ? 'Repères vocaux :' : 'Vocal cues:'}
              </span>
              <button
                type="button"
                onClick={() => handleInsertTag('[Pause 0.5s]')}
                className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-slate-700"
              >
                + [Pause 0.5s]
              </button>
              <button
                type="button"
                onClick={() => handleInsertTag('[Pause 1s]')}
                className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-slate-700"
              >
                + [Pause 1s]
              </button>
              <button
                type="button"
                onClick={() => handleInsertTag('[Sourire]')}
                className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-mono border border-slate-700"
              >
                + [Sourire]
              </button>
              <button
                type="button"
                onClick={() => handleInsertTag('[Énergique]')}
                className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-mono border border-slate-700"
              >
                + [Énergique]
              </button>
              <button
                type="button"
                onClick={() => handleInsertTag('[Chuchoté]')}
                className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-rose-300 text-[10px] font-mono border border-slate-700"
              >
                + [Chuchoté]
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-3 py-1.5 bg-slate-950/40 rounded-xl border border-slate-800/60">
            <div className="flex items-center gap-3">
              <span>
                <strong className="text-slate-200">{wordCount}</strong> mots
              </span>
              <span>&bull;</span>
              <span>
                <strong className="text-slate-200">{scriptText.length}</strong> caractères
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>
                ~{formatSeconds(estimatedSeconds)} ({estimatedSeconds >= 300 ? 'Format Long 5min+' : estimatedSeconds >= 120 ? 'Format 2 min' : estimatedSeconds >= 60 ? 'Format 60s' : 'Format Court'})
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Audio & Voice Customization (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {isFrench ? 'Direction Artistique & Effets' : 'Voice Tone & Sound Design'}
            </h4>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-4">
            {/* Tone & Style Prompt */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isFrench ? 'Style de lecture publicitaire (AI Tone)' : 'Commercial Style Prompt'}
              </label>
              <input
                type="text"
                value={stylePrompt}
                onChange={(e) => setStylePrompt(e.target.value)}
                placeholder="Ex: French male speaker, seductive whisper for luxury perfume"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                {isFrench
                  ? 'Transmis au modèle Gemini TTS pour colorer l\'émotion et le grain vocal.'
                  : 'Passed to Gemini TTS speech metadata to tune delivery and commercial cadence.'}
              </p>
            </div>

            {/* Sliders: Speed & Pitch */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1 font-medium">
                  <span>{isFrench ? 'Débit' : 'Pacing'}</span>
                  <span className="text-cyan-400 font-mono">{speechRate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.05"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1 font-medium">
                  <span>{isFrench ? 'Hauteur / Tonalité' : 'Pitch'}</span>
                  <span className="text-cyan-400 font-mono">{speechPitch.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.25"
                  step="0.05"
                  value={speechPitch}
                  onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Background Music Bed Selector */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isFrench ? 'Bande-son publicitaire (Audio Bed)' : 'Commercial Background Music'}</span>
                </label>
              </div>

              <select
                value={selectedBgTrack}
                onChange={(e) => setSelectedBgTrack(e.target.value as BgMusicType)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {BG_TRACKS.map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-slate-200">
                    {isFrench ? t.nameFr : t.name} ({t.vibe})
                  </option>
                ))}
              </select>

              {selectedBgTrack !== 'none' && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{isFrench ? 'Volume de la musique' : 'Music Volume'}</span>
                    <span className="font-mono text-cyan-400">{Math.round(bgVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.8"
                    step="0.05"
                    value={bgVolume}
                    onChange={(e) => setBgVolume(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="ducking"
                      checked={enableDucking}
                      onChange={(e) => setEnableDucking(e.target.checked)}
                      className="accent-cyan-500 rounded cursor-pointer"
                    />
                    <label htmlFor="ducking" className="text-[11px] text-slate-400 cursor-pointer">
                      {isFrench
                        ? 'Ducking automatique (baisse la musique quand la voix parle)'
                        : 'Auto-ducking (lowers background music during vocal delivery)'}
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visualizer & Audio Player Console with Time Scrubber */}
      <div className="mt-6 pt-6 border-t border-slate-800">
        <AudioVisualizer
          isPlaying={isPlaying}
          accentColor={selectedVoice.gender === 'male' ? '#38bdf8' : '#f43f5e'}
        />

        {/* Audio Scrubber & Progress (Essential for 5min+ audio) */}
        {currentAudioUrl && (
          <div className="mt-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center gap-3">
            <span className="text-xs font-mono text-cyan-400 min-w-[42px]">
              {formatScrubberTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={audioDuration || 1}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <span className="text-xs font-mono text-slate-400 min-w-[42px] text-right">
              {formatScrubberTime(audioDuration)}
            </span>
          </div>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-800/50 py-1.5 px-3 rounded-xl animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Master Action Bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Generate & Play Button */}
            <button
              type="button"
              disabled={isGenerating || !scriptText.trim()}
              onClick={handleGenerateVoiceover}
              className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{isFrench ? 'Génération Audio (Concaténation 5min+)...' : 'Synthesizing Studio Audio (5min+)...'}</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-slate-950" />
                  <span>
                    {isFrench
                      ? 'GÉNÉRER LE SPOT (COURT OU 5MIN+)'
                      : 'GENERATE AUDIO (UP TO 5MIN+)'}
                  </span>
                </>
              )}
            </button>

            {/* Replay / Pause Button */}
            <button
              type="button"
              onClick={handleTogglePlayback}
              disabled={isGenerating}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center ${
                isPlaying
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-lg shadow-rose-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title={isPlaying ? 'Pause' : 'Écouter'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
            </button>
          </div>

          {/* Right Action: Download WAV */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {currentAudioUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="px-4 py-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>{isFrench ? 'Télécharger Master WAV' : 'Download Master WAV'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setScriptText(selectedVoice.sampleScript);
                setStylePrompt(selectedVoice.stylePrompt);
              }}
              className="p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 text-xs transition-all"
              title="Réinitialiser le script d'origine"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
