// High quality real-time Sound FX (SFX) Synthesizer using Web Audio API nodes
// 100% Free, zero external network dependencies

class SFXEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Fast Whoosh / Swoosh transition sound
  playWhoosh(volume = 0.5) {
    const ctx = this.getContext();
    const t = ctx.currentTime;

    // Filtered white noise sweep
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 3.5;
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(3200, t + 0.25);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.5);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(volume * 0.8, t + 0.2);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(t);
    noise.stop(t + 0.5);
  }

  // Cinematic Sub-Bass Impact / Boom
  playCinematicBoom(volume = 0.6) {
    const ctx = this.getContext();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(28, t + 1.2);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

    // Distortion shaper for crunch
    const shaper = ctx.createWaveShaper();
    shaper.curve = this.makeDistortionCurve(15);

    osc.connect(shaper);
    shaper.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 1.6);
  }

  // Camera Shutter Click
  playCameraClick(volume = 0.4) {
    const ctx = this.getContext();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.08);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Cyberpunk Digital Glitch
  playGlitch(volume = 0.45) {
    const ctx = this.getContext();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.setValueAtTime(450, t + 0.06);
    osc.frequency.setValueAtTime(2800, t + 0.12);
    osc.frequency.setValueAtTime(220, t + 0.18);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  // Notification Bell Ding
  playBell(volume = 0.4) {
    const ctx = this.getContext();
    const t = ctx.currentTime;

    const freqs = [1046.5, 2093, 3135.9]; // C6 harmonics
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      const initialGain = (volume / (idx + 1)) * 0.5;
      gain.gain.setValueAtTime(initialGain, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 1.3);
    });
  }

  // Modern UI Pop
  playPop(volume = 0.4) {
    const ctx = this.getContext();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.06);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  playById(id: string, volume = 0.5) {
    switch (id) {
      case 'sfx-whoosh-fast':
        this.playWhoosh(volume);
        break;
      case 'sfx-cinematic-boom':
        this.playCinematicBoom(volume);
        break;
      case 'sfx-camera-click':
        this.playCameraClick(volume);
        break;
      case 'sfx-digital-glitch':
        this.playGlitch(volume);
        break;
      case 'sfx-bell-ding':
        this.playBell(volume);
        break;
      case 'sfx-pop-bubble':
        this.playPop(volume);
        break;
      default:
        this.playPop(volume);
    }
  }

  private makeDistortionCurve(amount: number) {
    const k = amount;
    const nSamples = 44100;
    const curve = new Float32Array(nSamples);
    const deg = Math.PI / 180;
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }
}

export const sfx = new SFXEngine();
