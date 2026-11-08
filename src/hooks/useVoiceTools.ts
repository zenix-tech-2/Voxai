import { useState, useEffect, useRef, useCallback } from 'react';

export interface VoiceCommand {
  command: string;
  description: string;
  action: () => void;
}

export function useVoiceTools(onTranscript?: (text: string) => void, commands?: VoiceCommand[]) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceSupported, setVoiceSupported] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [volumeLevel, setVolumeLevel] = useState<number>(0);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Speech Recognition & Synthesis on mount
  useEffect(() => {
    // Check Speech Recognition (STT) support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setVoiceSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        startVolumeSimulation();
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          const cleanFinal = final.trim();
          setTranscript((prev) => (prev ? `${prev} ${cleanFinal}` : cleanFinal));
          if (onTranscript) {
            onTranscript(cleanFinal);
          }

          // Check voice commands
          if (commands && commands.length > 0) {
            const lower = cleanFinal.toLowerCase();
            for (const cmd of commands) {
              if (lower.includes(cmd.command.toLowerCase())) {
                cmd.action();
                break;
              }
            }
          }
        }

        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
          stopVolumeSimulation();
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        stopVolumeSimulation();
      };

      recognitionRef.current = recognition;
    }

    // Check Speech Synthesis (TTS) support
    if ('speechSynthesis' in window) {
      setSpeechSupported(true);
      synthRef.current = window.speechSynthesis;

      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        if (voices.length > 0 && !selectedVoice) {
          // Prefer natural English voices
          const naturalVoice =
            voices.find(
              (v) =>
                v.lang.startsWith('en') &&
                (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
            ) || voices.find((v) => v.lang.startsWith('en')) || voices[0];

          if (naturalVoice) {
            setSelectedVoice(naturalVoice.name);
          }
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      stopVolumeSimulation();
    };
  }, [commands, onTranscript]);

  // Audio level visualizer simulation
  const startVolumeSimulation = () => {
    const simulate = () => {
      const randomVol = Math.random() * 0.7 + 0.3;
      setVolumeLevel(randomVol);
      animationFrameRef.current = requestAnimationFrame(simulate);
    };
    simulate();
  };

  const stopVolumeSimulation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setVolumeLevel(0);
  };

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
    } catch (e) {
      console.warn('Recognition start issue:', e);
    }
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.warn('Recognition stop issue:', e);
    }
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Speak text using SpeechSynthesis
  const speakText = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!synthRef.current || !text) return;

      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      if (selectedVoice) {
        const v = availableVoices.find((voice) => voice.name === selectedVoice);
        if (v) utterance.voice = v;
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    },
    [availableVoices, selectedVoice]
  );

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSpeaking,
    voiceSupported,
    speechSupported,
    availableVoices,
    selectedVoice,
    setSelectedVoice,
    volumeLevel,
    startListening,
    stopListening,
    toggleListening,
    speakText,
    stopSpeaking,
  };
}
