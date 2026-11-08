import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Wand2,
  Check,
  ArrowRight,
  Radio,
  Sliders,
  HelpCircle,
} from 'lucide-react';
import { GeneratedImage } from '../types';

interface VoiceToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isListening: boolean;
  onToggleListening: () => void;
  transcript: string;
  interimTranscript: string;
  isSpeaking: boolean;
  onSpeak: (text: string) => void;
  onStopSpeaking: () => void;
  onApplyPrompt: (text: string) => void;
  onEnhanceAndSpeak: () => void;
  currentImage: GeneratedImage | null;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: string;
  onSelectVoice: (voiceName: string) => void;
  volumeLevel: number;
  onOpenVoiceStudio?: () => void;
}

export const VoiceToolsModal: React.FC<VoiceToolsModalProps> = ({
  isOpen,
  onClose,
  isListening,
  onToggleListening,
  transcript,
  interimTranscript,
  isSpeaking,
  onSpeak,
  onStopSpeaking,
  onApplyPrompt,
  onEnhanceAndSpeak,
  currentImage,
  availableVoices,
  selectedVoice,
  onSelectVoice,
  volumeLevel,
  onOpenVoiceStudio,
}) => {
  const [activeTab, setActiveTab] = useState<'dictate' | 'critique' | 'commands'>('dictate');
  const [customSpeakText, setCustomSpeakText] = useState<string>('');

  if (!isOpen) return null;

  const currentDisplaySpeech = transcript || interimTranscript || 'Listening for your voice... speak your scene concept';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="max-w-2xl w-full bg-[#0D121D] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title & Link to Full Voice Studio */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pr-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-300/10 text-amber-400 flex items-center justify-center border border-amber-400/20 shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Voice Quick Tools</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Instant Mic
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Dictate prompts hands-free and hear instant scene critiques.
              </p>
            </div>
          </div>

          {onOpenVoiceStudio && (
            <button
              onClick={() => {
                onClose();
                onOpenVoiceStudio();
              }}
              className="px-3 py-1.5 bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Open Voice Studio (16 Voices)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab('dictate')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'dictate'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice-to-Prompt</span>
          </button>
          <button
            onClick={() => setActiveTab('critique')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'critique'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Audio Critique & Narrator</span>
          </button>
          <button
            onClick={() => setActiveTab('commands')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'commands'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Voice Commands</span>
          </button>
        </div>

        {/* TAB 1: DICTATION & VOICE PROMPT */}
        {activeTab === 'dictate' && (
          <div className="space-y-5 flex-1 overflow-y-auto pr-1">
            {/* Live Audio Visualizer & Mic Button */}
            <div className="p-6 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
              {/* Waveform Bars */}
              <div className="flex items-center justify-center gap-1.5 h-16 mb-4 w-full max-w-xs">
                {[12, 28, 45, 60, 32, 54, 70, 40, 25, 55, 35, 18].map((baseH, idx) => {
                  const scale = isListening ? Math.max(0.2, volumeLevel * (idx % 2 === 0 ? 1.2 : 0.8)) : 0.15;
                  const currentH = Math.round(baseH * scale);
                  return (
                    <div
                      key={idx}
                      style={{ height: `${Math.max(6, currentH)}px` }}
                      className={`w-1.5 rounded-full transition-all duration-100 ${
                        isListening
                          ? 'bg-gradient-to-t from-amber-500 to-amber-300 shadow-sm shadow-amber-400/50'
                          : 'bg-slate-800'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Big Mic Toggle */}
              <button
                onClick={onToggleListening}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 hover:bg-rose-400 text-white ring-4 ring-rose-500/20 animate-pulse'
                    : 'bg-gradient-to-tr from-amber-500 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 ring-4 ring-amber-400/20'
                }`}
              >
                {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </button>

              <span className="text-xs font-semibold text-slate-300 mt-3 block">
                {isListening ? 'Microphone Active · Listening...' : 'Click to Speak Creative Vision'}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                Say: "a glowing glass bioluminescent tree at night in 4k"
              </span>
            </div>

            {/* Live Transcription Box */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
                <span>Recognized Speech Transcript</span>
                {transcript && (
                  <span className="text-emerald-400 font-mono text-[11px]">Speech Captured</span>
                )}
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-mono min-h-[85px] max-h-36 overflow-y-auto">
                {transcript ? (
                  <span>
                    {transcript}
                    {interimTranscript && (
                      <span className="text-amber-400/80 italic"> {interimTranscript}</span>
                    )}
                  </span>
                ) : interimTranscript ? (
                  <span className="text-amber-400/80 italic">{interimTranscript}</span>
                ) : (
                  <span className="text-slate-600 italic">Your spoken prompt will appear here in real time...</span>
                )}
              </div>
            </div>

            {/* Apply & Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onEnhanceAndSpeak}
                disabled={!transcript.trim()}
                className="px-4 py-2 text-xs font-medium text-amber-300 hover:text-white bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-xl transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>AI Enhance & Speak Back</span>
              </button>

              <button
                onClick={() => {
                  onApplyPrompt(transcript);
                  onClose();
                }}
                disabled={!transcript.trim()}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply to Studio Prompt</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: AUDIO CRITIQUE & NARRATOR */}
        {activeTab === 'critique' && (
          <div className="space-y-5 flex-1 overflow-y-auto pr-1">
            {currentImage ? (
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center gap-4">
                <img
                  src={currentImage.url}
                  alt={currentImage.prompt}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-800 shrink-0"
                />
                <div className="flex-1 truncate">
                  <span className="text-[10px] uppercase font-mono text-amber-400 block mb-1">
                    Active Artwork
                  </span>
                  <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                    {currentImage.prompt}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Voice Narrative Triggers */}
            <div className="space-y-3">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Read Prompt Narrative Aloud</span>
                  <span className="text-[11px] text-slate-400">
                    Speaks the current artwork prompt recipe using natural voice synthesis.
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (isSpeaking) {
                      onStopSpeaking();
                    } else if (currentImage) {
                      onSpeak(currentImage.prompt);
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isSpeaking
                      ? 'bg-rose-500 text-white'
                      : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSpeaking ? 'Stop Audio' : 'Play Audio'}</span>
                </button>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Art Director Verbal Review</span>
                  <span className="text-[11px] text-slate-400">
                    Critiques the composition, lighting angle, and mood of the current creation.
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (isSpeaking) {
                      onStopSpeaking();
                    } else if (currentImage) {
                      const critique = `This creation uses a ${currentImage.aspectRatio} format with ${
                        currentImage.style || 'cinematic'
                      } styling. Notice the directional illumination and balanced optical depth. The atmosphere establishes strong presence and textural contrast.`;
                      onSpeak(critique);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hear Critique</span>
                </button>
              </div>
            </div>

            {/* Voice Actor Selection */}
            {availableVoices.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Speech Synthesis Voice
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => onSelectVoice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {availableVoices
                    .filter((v) => v.lang.startsWith('en'))
                    .map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VOICE COMMANDS REFERENCE */}
        {activeTab === 'commands' && (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            <div className="p-3 bg-amber-400/10 border border-amber-400/20 rounded-xl text-xs text-amber-300">
              <span className="font-semibold block mb-0.5">Hands-Free Voice Studio Control</span>
              Speak any of the following voice commands while the microphone is active to control the app automatically:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {[
                { cmd: '"Generate" / "Synthesize"', desc: 'Triggers the active generative engine' },
                { cmd: '"Enhance" / "Art Director"', desc: 'Expands prompt with Gemini 3.8 Flash' },
                { cmd: '"Surprise Me" / "Spark"', desc: 'Pulls a fresh creative inspiration' },
                { cmd: '"Matrix" / "Variation"', desc: 'Runs 4-quadrant variation matrix' },
                { cmd: '"Canvas" / "Edit"', desc: 'Navigates to the Canvas Post-Processor' },
                { cmd: '"Gallery" / "Curated"', desc: 'Navigates to Curated Masterpieces' },
                { cmd: '"Square" / "One to One"', desc: 'Switches aspect ratio to 1:1' },
                { cmd: '"Landscape" / "Cinema"', desc: 'Switches aspect ratio to 16:9' },
                { cmd: '"Portrait" / "Mobile"', desc: 'Switches aspect ratio to 9:16' },
                { cmd: '"Clear"', desc: 'Resets the current generative prompt' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-mono text-amber-400 font-semibold block">{item.cmd}</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
