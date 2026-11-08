// Web Audio API Background Music Beds for Advertising Voiceovers
// Synthesized purely in browser - zero external files required, zero latency!

export type BgMusicType = 'none' | 'luxury' | 'tech' | 'cinematic' | 'acoustic';

export interface BgMusicTrack {
  id: BgMusicType;
  name: string;
  nameFr: string;
  description: string;
  descriptionFr: string;
  vibe: string;
}

export const BG_TRACKS: BgMusicTrack[] = [
  {
    id: 'none',
    name: 'Voice Only (Acapella)',
    nameFr: 'Voix Seule (Acapella)',
    description: 'Crisp broadcast studio vocal with no background bed',
    descriptionFr: 'Enregistrement studio pur sans musique de fond',
    vibe: 'Clean Studio',
  },
  {
    id: 'luxury',
    name: 'Luxury Velvet Ambient',
    nameFr: 'Luxe & Ambiance Velours',
    description: 'Warm lush analog synth chords for perfume, jewelry & prestige',
    descriptionFr: 'Accords chauds et feutrés pour parfumerie et haute joaillerie',
    vibe: 'Sophisticated / Seductive',
  },
  {
    id: 'tech',
    name: 'Modern Tech & Auto Beat',
    nameFr: 'Tech Moderne & Beat Auto',
    description: 'Dynamic electronic bass pulse and futuristic hi-hat rhythm',
    descriptionFr: 'Pulsation électronique et rythme moderne pour spots high-tech',
    vibe: 'Punchy / Futuristic',
  },
  {
    id: 'cinematic',
    name: 'Cinematic Dramatic Drone',
    nameFr: 'Dramatique & Cinéma',
    description: 'Sub-bass rumble, atmospheric swell and tension for trailers',
    descriptionFr: 'Basse profonde et tension atmosphérique pour bandes-annonces',
    vibe: 'Epic / Suspense',
  },
  {
    id: 'acoustic',
    name: 'Warm Acoustic & Terroir',
    nameFr: 'Chaleur Acoustique & Terroir',
    description: 'Uplifting organic melodic chords for food, family & lifestyle',
    descriptionFr: 'Accords chaleureux et organiques pour gastronomie et bien-être',
    vibe: 'Friendly / Organic',
  },
];

class AudioBedPlayer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private intervals: number[] = [];
  private currentTrack: BgMusicType = 'none';

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      const safeVol = Math.max(0, Math.min(1, vol));
      this.masterGain.gain.setValueAtTime(safeVol * 0.25, this.ctx.currentTime);
    }
  }

  public setDucking(isDucking: boolean) {
    if (this.masterGain && this.ctx) {
      const currentTarget = this.masterGain.gain.value;
      const target = isDucking ? currentTarget * 0.35 : currentTarget;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.2);
    }
  }

  public stop() {
    this.isPlaying = false;
    this.intervals.forEach((id) => clearInterval(id));
    this.intervals = [];

    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.oscillators = [];

    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {}
      this.masterGain = null;
    }
  }

  public play(track: BgMusicType, volume = 0.5) {
    this.stop();
    this.currentTrack = track;
    if (track === 'none') return;

    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.masterGain = this.ctx.createGain();
    this.setVolume(volume);
    this.masterGain.connect(this.ctx.destination);

    if (track === 'luxury') {
      this.startLuxuryBed();
    } else if (track === 'tech') {
      this.startTechBed();
    } else if (track === 'cinematic') {
      this.startCinematicBed();
    } else if (track === 'acoustic') {
      this.startAcousticBed();
    }
  }

  private startLuxuryBed() {
    if (!this.ctx || !this.masterGain) return;
    const notes = [130.81, 164.81, 196.0, 246.94]; // C-E-G-B (Cmaj7 pad)

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx!.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx!.currentTime);

      // Subtle LFO modulation
      const lfo = this.ctx!.createOscillator();
      const lfoGain = this.ctx!.createGain();
      lfo.frequency.setValueAtTime(0.15 + idx * 0.05, this.ctx!.currentTime);
      lfoGain.gain.setValueAtTime(60, this.ctx!.currentTime);
      lfo.connect(filter.frequency);
      lfo.start();
      this.oscillators.push(lfo);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start();
      this.oscillators.push(osc);
    });
  }

  private startTechBed() {
    if (!this.ctx || !this.masterGain) return;

    // Sub Bass drone
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note
    subGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    sub.connect(subGain);
    subGain.connect(this.masterGain);
    sub.start();
    this.oscillators.push(sub);

    // Filtered pulse synth
    const synth = this.ctx.createOscillator();
    const synthGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    synth.type = 'sawtooth';
    synth.frequency.setValueAtTime(220, this.ctx.currentTime);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, this.ctx.currentTime);
    synthGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

    synth.connect(filter);
    filter.connect(synthGain);
    synthGain.connect(this.masterGain);
    synth.start();
    this.oscillators.push(synth);

    // Rhythmic pulse
    let step = 0;
    const interval = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying || !this.masterGain) return;
      const t = this.ctx.currentTime;
      step = (step + 1) % 4;
      if (step === 0) {
        // Kick punch
        const kick = this.ctx.createOscillator();
        const kGain = this.ctx.createGain();
        kick.frequency.setValueAtTime(120, t);
        kick.frequency.exponentialRampToValueAtTime(40, t + 0.15);
        kGain.gain.setValueAtTime(0.18, t);
        kGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        kick.connect(kGain);
        kGain.connect(this.masterGain);
        kick.start(t);
        kick.stop(t + 0.18);
      }
    }, 500);
    this.intervals.push(interval);
  }

  private startCinematicBed() {
    if (!this.ctx || !this.masterGain) return;
    const drone = this.ctx.createOscillator();
    const droneGain = this.ctx.createGain();
    drone.type = 'sawtooth';
    drone.frequency.setValueAtTime(43.65, this.ctx.currentTime); // F1 low rumble

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);

    droneGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

    drone.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(this.masterGain);
    drone.start();
    this.oscillators.push(drone);

    // High shimmer tension
    const high = this.ctx.createOscillator();
    const highGain = this.ctx.createGain();
    high.type = 'sine';
    high.frequency.setValueAtTime(698.46, this.ctx.currentTime); // F5
    highGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    high.connect(highGain);
    highGain.connect(this.masterGain);
    high.start();
    this.oscillators.push(high);
  }

  private startAcousticBed() {
    if (!this.ctx || !this.masterGain) return;
    const chord = [174.61, 220.0, 261.63, 329.63]; // Fmaj7
    chord.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
      gain.gain.setValueAtTime(0.07, this.ctx!.currentTime);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start();
      this.oscillators.push(osc);
    });
  }
}

export const bgMusic = new AudioBedPlayer();
