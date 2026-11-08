import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  Sparkles,
  Wand2,
  Upload,
  RefreshCw,
  Sliders,
  Radio,
  FileText,
  UserCheck,
  Dna,
  Layers,
  ArrowRight,
  Clock,
  Music,
  Share2,
  Trash2,
  Info,
} from 'lucide-react';
import { AppTab, GeneratedImage, TTSGeneration, VoiceProfile, TranscribedAudio } from '../types';
import { INITIAL_VOICE_CATALOG } from '../data/voiceProfiles';

interface VoiceStudioProps {
  currentImage: GeneratedImage | null;
  onSendToStudioPrompt: (promptText: string) => void;
  onNavigateTab: (tab: AppTab) => void;
}

const CLONED_VOICES_STORAGE_KEY = 'lumen_studio_cloned_voices_v1';
const TTS_HISTORY_STORAGE_KEY = 'lumen_studio_tts_history_v1';

const SAMPLE_SCRIPTS = [
  {
    title: 'Art Director Critique (~45s)',
    text: 'This composition achieves an arresting optical equilibrium. Notice how the ambient chiaroscuro carves deep volumetric shadows against the polished marble pavilion. The ethereal violet reflections across the cosmic tide establish a meditative stillness rarely seen in contemporary synthesis.',
  },
  {
    title: 'Sci-Fi Cinematic Monologue (~1m 30s)',
    text: 'Sector seven went dark at dawn. Not by sabotage, but by silence. Deep within the reactor chamber, the neural matrix began reorganizing its internal architecture. We believed we were engineering instruments of precision. Instead, we had ignited an intelligence that regards our oceans, our cities, and our starlight as mere sketches waiting to be colored in.',
  },
  {
    title: 'Documentary Deep-Dive (~3m 30s Long-Form)',
    text: 'High above the mist-cloaked canopy of the primordial rift valley, morning arrives not as a burst of gold, but as a subtle shift in frequency. Here, ancient ferns unfurl beneath canopies that have witnessed ten thousand seasons of undisturbed evolution. Every droplet that condenses upon these obsidian stones carries minerals from the planet\'s earliest cooling epochs. As naturalists and observers, we are reminded that the natural world does not rush its masterpieces; it layers them grain by grain, whisper by whisper, until what was once barren rock becomes a cathedral of living memory. Look closely at the delicate moss draping the western escarpment. It vibrates with micro-currents of geothermal vapor, creating a sanctuary where iridescent insects navigate the thermal updrafts in an unbroken choreography of survival and grace.',
  },
];

const CALIBRATION_PASSAGES = [
  'The birch canoe slid on the smooth planks. Glue the sheet to the dark blue background. The salt breeze blew across the quiet bay. We need to create beauty in every direction.',
  'Above the canyon walls, an eagle wheeled in the crisp morning air. The distant snow peaks glowed with amber luminescence as the river rushed through ancient stones.',
];

export const VoiceStudio: React.FC<VoiceStudioProps> = ({
  currentImage,
  onSendToStudioPrompt,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'tts' | 'stt' | 'clone' | 'vault'>('tts');

  // Voice Catalog (Initial 16 voices + user-cloned voices)
  const [voices, setVoices] = useState<VoiceProfile[]>(() => {
    try {
      const saved = localStorage.getItem(CLONED_VOICES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...INITIAL_VOICE_CATALOG, ...parsed];
      }
    } catch (e) {
      console.warn('Error loading cloned voices:', e);
    }
    return INITIAL_VOICE_CATALOG;
  });

  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('kore');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // TTS State
  const [ttsText, setTtsText] = useState<string>(
    currentImage
      ? `A visual creation featuring ${currentImage.prompt}. Styled with ${currentImage.style || 'cinematic realism'} in a ${currentImage.aspectRatio} format.`
      : SAMPLE_SCRIPTS[0].text
  );
  const [ttsEmotion, setTtsEmotion] = useState<string>('natural');
  const [ttsSpeed, setTtsSpeed] = useState<number>(1.0);
  const [isGeneratingTts, setIsGeneratingTts] = useState<boolean>(false);
  const [ttsProgressMessage, setTtsProgressMessage] = useState<string>('');
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);

  // Preview Voice state
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);

  // STT State
  const [isRecordingStt, setIsRecordingStt] = useState<boolean>(false);
  const [sttRecordingDuration, setSttRecordingDuration] = useState<number>(0);
  const [sttTranscript, setSttTranscript] = useState<string>('');
  const [sttInterim, setSttInterim] = useState<string>('');
  const [isTranscribingFile, setIsTranscribingFile] = useState<boolean>(false);
  const [uploadedAudioFile, setUploadedAudioFile] = useState<{ name: string; base64: string; mimeType: string } | null>(null);
  const [micVolumeLevel, setMicVolumeLevel] = useState<number>(0);

  // Voice Clone State
  const [cloneName, setCloneName] = useState<string>('My Voice Clone');
  const [isRecordingCalibration, setIsRecordingCalibration] = useState<boolean>(false);
  const [calibrationRecordingDuration, setCalibrationRecordingDuration] = useState<number>(0);
  const [calibrationAudioBase64, setCalibrationAudioBase64] = useState<string | null>(null);
  const [isAnalyzingClone, setIsAnalyzingClone] = useState<boolean>(false);
  const [cloneSuccessMessage, setCloneSuccessMessage] = useState<string | null>(null);

  // Vault / History
  const [ttsHistory, setTtsHistory] = useState<TTSGeneration[]>(() => {
    try {
      const saved = localStorage.getItem(TTS_HISTORY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });

  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const sttTimerRef = useRef<any>(null);
  const calibrationTimerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  const selectedVoice = useMemo(() => {
    return voices.find((v) => v.id === selectedVoiceId) || voices[0];
  }, [voices, selectedVoiceId]);

  // Persist TTS history
  useEffect(() => {
    try {
      localStorage.setItem(TTS_HISTORY_STORAGE_KEY, JSON.stringify(ttsHistory));
    } catch (_) {}
  }, [ttsHistory]);

  // Word & Duration Estimator
  const wordCount = useMemo(() => {
    const clean = ttsText.trim();
    return clean ? clean.split(/\s+/).length : 0;
  }, [ttsText]);

  const estimatedMinutes = useMemo(() => {
    // Standard human narration speed: ~140-150 words per minute
    const totalSeconds = Math.round((wordCount / 145) * 60);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return { mins, secs, totalSeconds };
  }, [wordCount]);

  // Filter voices by category
  const filteredVoices = useMemo(() => {
    if (selectedCategory === 'all') return voices;
    if (selectedCategory === 'cloned') return voices.filter((v) => v.category === 'cloned');
    return voices.filter((v) => v.category === selectedCategory);
  }, [voices, selectedCategory]);

  // Audio playback event sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setAudioCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setAudioDuration(audio.duration || 0);
    const handleEnded = () => setIsPlayingAudio(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentAudioUrl]);

  // Handle Play / Pause
  const togglePlayAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlayingAudio) {
      audio.pause();
      setIsPlayingAudio(false);
    } else {
      audio.playbackRate = playbackSpeed;
      audio.play().then(() => setIsPlayingAudio(true)).catch((e) => console.warn(e));
    }
  };

  const handleSeekAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setAudioCurrentTime(time);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // Preview Voice Sample
  const handlePreviewVoice = (voice: VoiceProfile) => {
    if (previewingVoiceId === voice.id) {
      // Stop preview
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPreviewingVoiceId(null);
      return;
    }

    setPreviewingVoiceId(voice.id);

    // First attempt server-side TTS for voice fidelity
    fetch('/api/voice/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: voice.previewText,
        voiceId: voice.id,
        emotion: 'natural',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.audioUrl) {
          const previewAudio = new Audio(data.audioUrl);
          previewAudioRef.current = previewAudio;
          previewAudio.onended = () => setPreviewingVoiceId(null);
          previewAudio.play();
        } else {
          // Client-side fallback via speech synthesis
          fallbackBrowserSpeech(voice.previewText, voice);
        }
      })
      .catch(() => {
        fallbackBrowserSpeech(voice.previewText, voice);
      });
  };

  const fallbackBrowserSpeech = (text: string, voice: VoiceProfile) => {
    if (!('speechSynthesis' in window)) {
      setPreviewingVoiceId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const browserVoices = window.speechSynthesis.getVoices();
    const matchingVoice =
      browserVoices.find(
        (v) =>
          (voice.gender === 'female' ? v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Zira') : v.name.includes('Male') || v.name.includes('David') || v.name.includes('Guy'))
      ) || browserVoices[0];

    if (matchingVoice) utterance.voice = matchingVoice;
    utterance.onend = () => setPreviewingVoiceId(null);
    utterance.onerror = () => setPreviewingVoiceId(null);
    window.speechSynthesis.speak(utterance);
  };

  // Generate Master TTS Audio (Supports up to 5 minutes long-form)
  const handleGenerateTts = async () => {
    if (!ttsText.trim()) return;

    setIsGeneratingTts(true);
    setTtsProgressMessage(
      wordCount > 150
        ? `Synthesizing ${wordCount} words (~${estimatedMinutes.mins}m ${estimatedMinutes.secs}s) across neural chunks...`
        : 'Synthesizing ultra-realistic human voice...'
    );

    try {
      const response = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ttsText,
          voiceId: selectedVoice.id,
          customStyle: selectedVoice.stylePrompt,
          speakerName: selectedVoice.name,
          emotion: ttsEmotion,
          speed: ttsSpeed,
        }),
      });

      const data = await response.json();

      if (data.success && data.audioUrl) {
        setCurrentAudioUrl(data.audioUrl);
        setIsPlayingAudio(true);

        const newGen: TTSGeneration = {
          id: `tts-${Date.now()}`,
          text: ttsText,
          voice: selectedVoice,
          audioUrl: data.audioUrl,
          durationSec: data.durationSec || estimatedMinutes.totalSeconds,
          wordCount,
          createdAt: Date.now(),
          emotion: ttsEmotion,
          speed: ttsSpeed,
        };

        setTtsHistory((prev) => [newGen, ...prev]);

        // Auto play generated audio
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.playbackRate = playbackSpeed;
            audioRef.current.play().catch(() => {});
          }
        }, 150);
      } else {
        throw new Error(data.error || 'Failed to synthesize speech');
      }
    } catch (err: any) {
      console.warn('Server TTS encountered error, generating client speech fallback:', err);
      // Client-side synthesis fallback
      fallbackBrowserSpeech(ttsText, selectedVoice);
      alert(`Notice: ${err.message || 'Gemini audio synthesized via browser voice synthesizer fallback.'}`);
    } finally {
      setIsGeneratingTts(false);
      setTtsProgressMessage('');
    }
  };

  // Speech-to-Text: Live Microphone
  const startLiveRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start(250);
      setIsRecordingStt(true);
      setSttRecordingDuration(0);

      // Volume simulation
      const simulateVol = () => {
        setMicVolumeLevel(Math.random() * 0.7 + 0.3);
        animationFrameRef.current = requestAnimationFrame(simulateVol);
      };
      simulateVol();

      // Duration counter
      sttTimerRef.current = setInterval(() => {
        setSttRecordingDuration((prev) => prev + 1);
      }, 1000);

      // Web Speech recognition in parallel for instant live transcription
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) final += event.results[i][0].transcript;
            else interim += event.results[i][0].transcript;
          }
          if (final) {
            setSttTranscript((prev) => (prev ? `${prev} ${final.trim()}` : final.trim()));
          }
          setSttInterim(interim);
        };

        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch (err: any) {
      alert(`Could not access microphone: ${err.message}`);
    }
  };

  const stopLiveRecording = async () => {
    setIsRecordingStt(false);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (sttTimerRef.current) clearInterval(sttTimerRef.current);
    setMicVolumeLevel(0);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();

      // Send recorded audio to gemini-3.5-transcribe for precision transcription
      setTimeout(async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 0) {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            try {
              const res = await fetch('/api/voice/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioData: base64Audio, mimeType: 'audio/webm' }),
              });
              const data = await res.json();
              if (data.success && data.transcript) {
                setSttTranscript(data.transcript);
              }
            } catch (_) {}
          };
          reader.readAsDataURL(audioBlob);
        }
      }, 300);
    }
  };

  // Speech-to-Text: File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedAudioFile({
        name: file.name,
        base64: reader.result as string,
        mimeType: file.type || 'audio/webm',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleTranscribeUploadedFile = async () => {
    if (!uploadedAudioFile) return;

    setIsTranscribingFile(true);
    try {
      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: uploadedAudioFile.base64,
          mimeType: uploadedAudioFile.mimeType,
        }),
      });

      const data = await response.json();
      if (data.success && data.transcript) {
        setSttTranscript(data.transcript);
      } else {
        alert(data.error || 'Transcription failed');
      }
    } catch (err: any) {
      alert(`Transcription error: ${err.message}`);
    } finally {
      setIsTranscribingFile(false);
    }
  };

  // Voice Cloning: Record Calibration Sample
  const startCalibrationRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start(250);
      setIsRecordingCalibration(true);
      setCalibrationRecordingDuration(0);

      calibrationTimerRef.current = setInterval(() => {
        setCalibrationRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      alert(`Microphone error: ${err.message}`);
    }
  };

  const stopCalibrationRecording = () => {
    setIsRecordingCalibration(false);
    if (calibrationTimerRef.current) clearInterval(calibrationTimerRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();

      setTimeout(() => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setCalibrationAudioBase64(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);
      }, 300);
    }
  };

  // Analyze & Mint Cloned Voice Profile
  const handleMintVoiceClone = async () => {
    if (!calibrationAudioBase64) {
      alert('Please record or upload a voice calibration sample first.');
      return;
    }

    setIsAnalyzingClone(true);
    setCloneSuccessMessage(null);

    try {
      const response = await fetch('/api/voice/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: calibrationAudioBase64,
          mimeType: 'audio/webm',
          name: cloneName,
        }),
      });

      const data = await response.json();
      if (data.success && data.profile) {
        const newVoice: VoiceProfile = {
          ...data.profile,
          isCustom: true,
        };

        // Add to active voices list
        const updatedVoices = [newVoice, ...voices];
        setVoices(updatedVoices);
        setSelectedVoiceId(newVoice.id);

        // Save custom clones to storage
        const customOnly = updatedVoices.filter((v) => v.isCustom);
        localStorage.setItem(CLONED_VOICES_STORAGE_KEY, JSON.stringify(customOnly));

        setCloneSuccessMessage(`Cloned profile "${newVoice.name}" minted and calibrated successfully!`);

        // Automatically preview voice
        setTimeout(() => {
          handlePreviewVoice(newVoice);
        }, 300);
      } else {
        alert(data.error || 'Failed to clone voice.');
      }
    } catch (err: any) {
      alert(`Cloning error: ${err.message}`);
    } finally {
      setIsAnalyzingClone(false);
    }
  };

  // Copy transcript
  const handleCopyTranscript = () => {
    if (!sttTranscript) return;
    navigator.clipboard.writeText(sttTranscript);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Download transcript
  const handleDownloadTranscript = () => {
    if (!sttTranscript) return;
    const blob = new Blob([sttTranscript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Hidden Master Audio Element */}
      {currentAudioUrl && <audio ref={audioRef} src={currentAudioUrl} preload="auto" />}

      {/* Top Banner & Mode Navigation */}
      <div className="border border-slate-800 bg-slate-950/80 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-md bg-amber-400 flex items-center justify-center text-slate-950 shadow-sm shadow-amber-400/20">
              <Volume2 className="w-3.5 h-3.5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">LUMEN VOICE STUDIO</h1>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
              16 Real Human Voices · 5-Min Cap · STT · Voice Cloning
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            High-fidelity neural text-to-speech with natural human timbres, multi-part long-form narrative stitching, real-time speech transcription, and acoustic DNA voice cloning.
          </p>
        </div>

        {/* 4 Mode Navigation Tabs */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold self-stretch md:self-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab('tts')}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'tts'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Text-to-Speech (TTS)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('stt')}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'stt'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Speech-to-Text (STT)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('clone')}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'clone'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dna className="w-3.5 h-3.5" />
            <span>Voice Cloning Studio</span>
          </button>
          <button
            onClick={() => setActiveSubTab('vault')}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'vault'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Audio Vault ({ttsHistory.length})</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: TEXT-TO-SPEECH (TTS) */}
      {activeSubTab === 'tts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: 16 Human Real-Like Voices Grid (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="border border-slate-800 bg-slate-950/70 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                    Select Voice ({voices.length} Available)
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {selectedVoice.name} active
                </span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-2 text-[11px] font-medium text-slate-400">
                {[
                  { id: 'all', label: 'All Voices' },
                  { id: 'neural', label: 'Neural Core' },
                  { id: 'cinematic', label: 'Cinematic' },
                  { id: 'documentary', label: 'Documentary' },
                  { id: 'conversational', label: 'Conversational' },
                  { id: 'character', label: 'Character & ASMR' },
                  { id: 'cloned', label: 'Cloned' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30'
                        : 'hover:text-white hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Scrollable Voices List */}
              <div className="space-y-2 mt-2 max-h-[520px] overflow-y-auto pr-1">
                {filteredVoices.map((voice) => {
                  const isSelected = selectedVoiceId === voice.id;
                  const isPreviewing = previewingVoiceId === voice.id;

                  return (
                    <div
                      key={voice.id}
                      onClick={() => setSelectedVoiceId(voice.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/10 shadow-sm'
                          : 'border-slate-800/80 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div
                          className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${voice.avatarColor} flex items-center justify-center text-slate-950 font-bold text-xs shrink-0 shadow-sm`}
                        >
                          {voice.name.charAt(0)}
                        </div>

                        {/* Metadata */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-white truncate">
                              {voice.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded">
                              {voice.accent.split(' ')[0]}
                            </span>
                            {voice.isCustom && (
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                Cloned
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {voice.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Preview Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewVoice(voice);
                        }}
                        className={`p-2 rounded-lg border text-xs transition-colors shrink-0 cursor-pointer ${
                          isPreviewing
                            ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                            : isSelected
                            ? 'bg-amber-400 text-slate-950 border-amber-400'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                        title="Listen to voice sample"
                      >
                        {isPreviewing ? <VolumeX className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Voice Acoustic Profile Card */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 text-xs space-y-2">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                Active Persona Architecture
              </span>
              <p className="text-slate-300 font-medium">{selectedVoice.displayName}</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">{selectedVoice.description}</p>
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Neural Base: <span className="text-slate-300 font-mono">{selectedVoice.baseGeminiVoice}</span></span>
                <span>Category: <span className="text-slate-300 uppercase">{selectedVoice.category}</span></span>
              </div>
            </div>
          </div>

          {/* Right Column: Script Editor, 5-Minute Narration & Master Player (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Script Input Card */}
            <div className="border border-slate-800 bg-slate-950/70 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                    Script Narration Studio
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    Supports long-form multi-paragraph audio up to 5 minutes (~900 words)
                  </span>
                </div>

                {/* Duration & Word Counter */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">{wordCount} words</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-amber-400 font-semibold">
                    ~{estimatedMinutes.mins}m {estimatedMinutes.secs}s
                  </span>
                </div>
              </div>

              {/* Quick Sample Script Fillers */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
                <span className="text-slate-500 shrink-0">Sample Presets:</span>
                {SAMPLE_SCRIPTS.map((script, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTtsText(script.text)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {script.title}
                  </button>
                ))}
                {currentImage && (
                  <button
                    onClick={() =>
                      setTtsText(
                        `Visual composition review: ${currentImage.prompt}. Styled with ${currentImage.style || 'cinematic realism'} in a ${currentImage.aspectRatio} frame.`
                      )
                    }
                    className="px-2.5 py-1 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/20 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Current Image Prompt
                  </button>
                )}
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  rows={8}
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  placeholder="Type or paste your narrative, storytelling script, prompt description, or dialogue here..."
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors leading-relaxed font-sans"
                />
              </div>

              {/* Delivery Emotion & Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                    Delivery Emotion / Tone
                  </label>
                  <select
                    value={ttsEmotion}
                    onChange={(e) => setTtsEmotion(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="natural">Natural & Expressive</option>
                    <option value="warm">Warm & Empathetic</option>
                    <option value="authoritative">Authoritative & Deep</option>
                    <option value="dramatic">Dramatic & Suspenseful</option>
                    <option value="whispering">Soft & Whispering</option>
                    <option value="energetic">Energetic & Fast-Paced</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1.5">
                    <span>Speaking Speed</span>
                    <span className="font-mono text-amber-400">{ttsSpeed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.5"
                    step="0.05"
                    value={ttsSpeed}
                    onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Primary Synthesis Action */}
              <div className="pt-2">
                <button
                  onClick={handleGenerateTts}
                  disabled={isGeneratingTts || !ttsText.trim()}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    isGeneratingTts || !ttsText.trim()
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/20 active:scale-[0.99]'
                  }`}
                >
                  {isGeneratingTts ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{ttsProgressMessage || 'Generating & Concatenating Multi-Part Master Audio...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                      <span>Generate Master Voice Audio with {selectedVoice.name}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Master Audio Player & Waveform Visualizer */}
            {currentAudioUrl && (
              <div className="border border-amber-400/30 bg-slate-950/90 rounded-2xl p-5 space-y-4 shadow-lg shadow-amber-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center">
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">Synthesized Master Audio</h3>
                      <span className="text-[11px] text-slate-400">
                        Voice: <span className="text-amber-400 font-medium">{selectedVoice.name}</span> · 24kHz Mono WAV
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Download WAV button */}
                    <a
                      href={currentAudioUrl}
                      download={`lumen-voice-${selectedVoice.id}-${Date.now()}.wav`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .WAV</span>
                    </a>
                  </div>
                </div>

                {/* Animated Audio Waveform Bar */}
                <div className="flex items-center justify-center gap-1 h-14 bg-slate-900/90 rounded-xl px-4 overflow-hidden border border-slate-800">
                  {Array.from({ length: 48 }).map((_, idx) => {
                    const isEven = idx % 2 === 0;
                    const randomScale = isPlayingAudio ? (isEven ? 0.7 : 0.4) + Math.random() * 0.5 : 0.15;
                    const heightPx = Math.round(randomScale * 42);

                    return (
                      <div
                        key={idx}
                        style={{ height: `${Math.max(6, heightPx)}px` }}
                        className={`w-1 rounded-full transition-all duration-100 ${
                          isPlayingAudio
                            ? 'bg-gradient-to-t from-amber-500 to-amber-300'
                            : 'bg-slate-700'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Scrub Timeline Bar */}
                <div className="space-y-1.5">
                  <input
                    type="range"
                    min="0"
                    max={audioDuration || 100}
                    value={audioCurrentTime}
                    onChange={handleSeekAudio}
                    className="w-full accent-amber-400 cursor-pointer h-1.5"
                  />
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>
                      {Math.floor(audioCurrentTime / 60)}:
                      {String(Math.floor(audioCurrentTime % 60)).padStart(2, '0')}
                    </span>
                    <span>
                      {Math.floor(audioDuration / 60)}:
                      {String(Math.floor(audioDuration % 60)).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Player Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlayAudio}
                      className="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      {isPlayingAudio ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
                    </button>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                      {[1.0, 1.25, 1.5, 2.0].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => handleSpeedChange(rate)}
                          className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                            playbackSpeed === rate
                              ? 'bg-amber-400 text-slate-950 font-bold'
                              : 'hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSendToStudioPrompt(ttsText)}
                      className="text-[11px] font-semibold text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Use text as Image Prompt</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SPEECH-TO-TEXT (STT) */}
      {activeSubTab === 'stt' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live Mic & Audio Uploader (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Live Dictation Box */}
            <div className="border border-slate-800 bg-slate-950/70 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Neural Microphone Dictation
                </h2>
                <span className="text-[11px] text-slate-400">
                  Speak creative ideas directly for real-time speech-to-text
                </span>
              </div>

              {/* Dynamic Waveform Meters */}
              <div className="flex items-center justify-center gap-1.5 h-16 w-full max-w-xs">
                {[14, 28, 48, 64, 34, 52, 70, 42, 28, 54, 36, 18].map((baseH, idx) => {
                  const scale = isRecordingStt ? Math.max(0.2, micVolumeLevel * (idx % 2 === 0 ? 1.2 : 0.8)) : 0.15;
                  const currentH = Math.round(baseH * scale);
                  return (
                    <div
                      key={idx}
                      style={{ height: `${Math.max(6, currentH)}px` }}
                      className={`w-1.5 rounded-full transition-all duration-100 ${
                        isRecordingStt
                          ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                          : 'bg-slate-800'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Big Record Button */}
              <button
                onClick={isRecordingStt ? stopLiveRecording : startLiveRecording}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer ${
                  isRecordingStt
                    ? 'bg-rose-500 hover:bg-rose-400 text-white ring-4 ring-rose-500/30 animate-pulse'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 ring-4 ring-amber-400/20'
                }`}
              >
                {isRecordingStt ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </button>

              <div className="text-xs">
                <span className="font-semibold text-slate-300 block">
                  {isRecordingStt
                    ? `Recording active (${sttRecordingDuration}s) · Click to Stop & Transcribe`
                    : 'Click Microphone to Start Speaking'}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Dual-engine: Live Web Speech STT + Gemini 3.5 Transcribe
                </span>
              </div>
            </div>

            {/* Audio File Upload Box */}
            <div className="border border-slate-800 bg-slate-950/70 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Upload Audio File for Transcription
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Upload voice memos or audio recordings (.wav, .mp3, .m4a, .webm) to transcribe with high-accuracy Gemini 3.5 Transcribe.
              </p>

              <label className="border-2 border-dashed border-slate-800 hover:border-amber-400/50 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-900/40">
                <Upload className="w-6 h-6 text-slate-500 mb-1" />
                <span className="text-xs font-semibold text-slate-300">
                  {uploadedAudioFile ? uploadedAudioFile.name : 'Select or drop audio file'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">MP3, WAV, WebM up to 40MB</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {uploadedAudioFile && (
                <button
                  onClick={handleTranscribeUploadedFile}
                  disabled={isTranscribingFile}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isTranscribingFile ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Transcribing with Gemini 3.5...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Transcribe Audio File</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Transcript Output & Actions (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="border border-slate-800 bg-slate-950/70 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                    Transcribed Speech Text
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    Exact wording, natural punctuation, and word count
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyTranscript}
                    disabled={!sttTranscript}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    title="Copy transcript to clipboard"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[11px]">{copiedText ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleDownloadTranscript}
                    disabled={!sttTranscript}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    title="Download as .txt file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Save .txt</span>
                  </button>
                </div>
              </div>

              {/* Main Transcript Display */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 min-h-[220px] max-h-[360px] overflow-y-auto">
                {sttTranscript ? (
                  <p className="text-xs text-slate-100 leading-relaxed font-sans whitespace-pre-wrap">
                    {sttTranscript}
                    {sttInterim && <span className="text-amber-400 italic"> {sttInterim}</span>}
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 text-xs">
                    <FileText className="w-8 h-8 mb-2 opacity-40" />
                    <span>Your transcription will appear here.</span>
                    <span className="text-[11px] text-slate-600 mt-1">
                      Speak into the microphone or upload an audio file to begin.
                    </span>
                  </div>
                )}
              </div>

              {/* 1-Click Handoff Actions */}
              {sttTranscript && (
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setTtsText(sttTranscript);
                      setActiveSubTab('tts');
                    }}
                    className="px-3.5 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-300 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Send to Text-to-Speech</span>
                  </button>

                  <button
                    onClick={() => {
                      onSendToStudioPrompt(sttTranscript);
                      onNavigateTab('studio');
                    }}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Generate Image with this Prompt</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: VOICE CLONING STUDIO */}
      {activeSubTab === 'clone' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Calibration Steps & Ingestion (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-5">
            <div className="border border-slate-800 bg-slate-950/70 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Dna className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  Step 1: Calibration Audio Sample
                </h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Read the calibration passage below aloud into the microphone (15–30 seconds) to extract vocal timbre, pitch register, cadence, and acoustic resonance.
              </p>

              {/* Calibration Passage Card */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Reference Reading Text:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed italic">
                  "{CALIBRATION_PASSAGES[0]}"
                </p>
              </div>

              {/* Name your clone */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Cloned Persona Name
                </label>
                <input
                  type="text"
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                  placeholder="e.g. Honest's Voice, Studio Host, Commander Vance"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Record or Upload Sample */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
                <button
                  onClick={isRecordingCalibration ? stopCalibrationRecording : startCalibrationRecording}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer ${
                    isRecordingCalibration
                      ? 'bg-rose-500 text-white ring-4 ring-rose-500/20 animate-pulse'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-4 ring-emerald-500/20'
                  }`}
                >
                  {isRecordingCalibration ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                <div className="text-xs">
                  <span className="font-semibold text-slate-200 block">
                    {isRecordingCalibration
                      ? `Recording calibration sample (${calibrationRecordingDuration}s) · Click to Stop`
                      : calibrationAudioBase64
                      ? 'Calibration audio captured! Ready to analyze.'
                      : 'Click to Record Calibration Voice Sample'}
                  </span>
                </div>
              </div>

              {/* Mint / Clone Action */}
              <button
                onClick={handleMintVoiceClone}
                disabled={isAnalyzingClone || !calibrationAudioBase64}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzingClone ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting Acoustic DNA & Calibrating Voice Clone...</span>
                  </>
                ) : (
                  <>
                    <Dna className="w-4 h-4" />
                    <span>Calibrate & Mint Cloned Voice Profile</span>
                  </>
                )}
              </button>

              {cloneSuccessMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{cloneSuccessMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Cloned Voices Library & Inspection (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-5">
            <div className="border border-slate-800 bg-slate-950/70 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                    Cloned Personas Active
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {voices.filter((v) => v.category === 'cloned').length} custom profiles
                </span>
              </div>

              {/* List of Cloned Voices */}
              <div className="space-y-3">
                {voices
                  .filter((v) => v.category === 'cloned')
                  .map((voice) => (
                    <div
                      key={voice.id}
                      className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 font-bold text-sm">
                            {voice.name.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">{voice.displayName}</span>
                            <span className="text-[11px] text-emerald-400 font-mono">
                              Base: {voice.baseGeminiVoice} · {voice.accent}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handlePreviewVoice(voice)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Test Voice</span>
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed">{voice.description}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                        <button
                          onClick={() => {
                            setSelectedVoiceId(voice.id);
                            setActiveSubTab('tts');
                          }}
                          className="text-amber-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Use in TTS Studio</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <span className="text-slate-500">Persistent in Local Storage</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: AUDIO VAULT (SAVED SPEECH) */}
      {activeSubTab === 'vault' && (
        <div className="border border-slate-800 bg-slate-950/70 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Generated Audio Vault ({ttsHistory.length} Sessions)
              </h2>
              <span className="text-[11px] text-slate-400">
                Play, re-listen, and download your previous multi-minute master speech generations
              </span>
            </div>

            {ttsHistory.length > 0 && (
              <button
                onClick={() => setTtsHistory([])}
                className="px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Vault</span>
              </button>
            )}
          </div>

          {ttsHistory.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs space-y-2">
              <Music className="w-8 h-8 mx-auto opacity-30" />
              <p>No audio files synthesized yet in this session.</p>
              <button
                onClick={() => setActiveSubTab('tts')}
                className="text-amber-400 font-semibold hover:underline cursor-pointer"
              >
                Go to Text-to-Speech to synthesize your first audio
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {ttsHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{item.voice.name}</span>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded">
                        {item.durationSec}s · {item.wordCount} words
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(item.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {item.text}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setCurrentAudioUrl(item.audioUrl);
                        setIsPlayingAudio(true);
                      }}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Play</span>
                    </button>

                    <a
                      href={item.audioUrl}
                      download={`lumen-voice-${item.voice.id}-${item.id}.wav`}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
                      title="Download .wav audio"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
