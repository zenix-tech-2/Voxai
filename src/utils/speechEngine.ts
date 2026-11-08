import { VoiceProfile } from '../data/voices';

export interface TTSResult {
  audioUrl?: string;
  source: 'gemini' | 'browser';
  duration?: number;
  blob?: Blob;
  error?: string;
}

export interface TakeItem {
  id: string;
  timestamp: number;
  voice: VoiceProfile;
  script: string;
  audioUrl?: string;
  blob?: Blob;
  source: 'gemini' | 'browser';
  bgTrack: string;
}

// Check available browser voices
export function getBrowserVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };

    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 1200);
  });
}

// Find closest matching browser voice for language and gender
export async function findBestBrowserVoice(voice: VoiceProfile): Promise<SpeechSynthesisVoice | null> {
  const voices = await getBrowserVoices();
  if (voices.length === 0) return null;

  const targetLang = voice.language === 'fr' ? 'fr' : 'en';

  // Find exact language match
  const matchingLang = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(targetLang)
  );

  if (matchingLang.length === 0) return voices[0] || null;

  // Try matching gender hints in voice name
  const isMale = voice.gender === 'male';
  const genderKeywords = isMale
    ? ['male', 'homme', 'guy', 'david', 'thomas', 'nicolas', 'paul', 'george', 'daniel', 'bernard', 'antoine', 'julien']
    : ['female', 'femme', 'woman', 'girl', 'marie', 'julie', 'claire', 'sarah', 'samantha', 'victoria', 'eva', 'amara', 'chloe'];

  const bestGender = matchingLang.find((v) => {
    const lowerName = v.name.toLowerCase();
    return genderKeywords.some((keyword) => lowerName.includes(keyword));
  });

  return bestGender || matchingLang[0];
}

// Main Speech Generator (100% Free, Zero Card Needed, Zero Payment)
export async function generateSpeech(
  text: string,
  voice: VoiceProfile,
  onBrowserSpeaking?: (isSpeaking: boolean) => void
): Promise<TTSResult> {
  const words = text.trim().split(/\s+/).length;
  const estimatedSeconds = Math.max(2, Math.round(words / (2.5 * voice.rate)));

  let serverError: string | undefined;

  // Try server generation
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voiceName: voice.geminiVoice,
        stylePrompt: voice.stylePrompt,
      }),
    });

    const raw = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(raw);
    } catch {
      serverError = `Serveur indisponible (${res.status}) : ${raw.slice(0, 80)}`;
    }
    if (data) {
      if (!data.success) serverError = data.error;
      if (data.success && data.audioBase64) {
        const byteCharacters = atob(data.audioBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: data.mimeType || 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);

        return {
          audioUrl,
          source: 'gemini',
          blob,
        };
      }
    }
  } catch (e: any) {
    serverError = e?.message || 'Connexion au serveur impossible';
  }

  // Fallback: live browser speech synthesis (no downloadable file is possible with this API)
  return new Promise(async (resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve({ source: 'browser', error: serverError || 'Synthèse vocale indisponible sur cet appareil' });
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const browserVoice = await findBestBrowserVoice(voice);
      if (browserVoice) utterance.voice = browserVoice;

      utterance.lang = voice.language === 'fr' ? 'fr-FR' : 'en-US';
      utterance.rate = voice.rate;
      utterance.pitch = voice.pitch;

      if (onBrowserSpeaking) onBrowserSpeaking(true);
      utterance.onend = () => onBrowserSpeaking?.(false);
      utterance.onerror = () => onBrowserSpeaking?.(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis playback note:', e);
      onBrowserSpeaking?.(false);
    }

    resolve({ source: 'browser', duration: estimatedSeconds, error: serverError });
  });
}
