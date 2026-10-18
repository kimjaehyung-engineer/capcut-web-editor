// Web Audio API procedural sound & TTS engine for CapCut Pro Studio Web

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.bgmOscs = [];
    this.gainNode = null;
    this.isPlaying = false;
    this.currentTrack = 'lofi';
    this.volume = 0.65;
    this.isMuted = false;
    this.beatInterval = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = this.volume;
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1.5, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(
        this.isMuted ? 0 : this.volume,
        this.ctx.currentTime,
        0.04
      );
    }
  }

  setMuted(muted) {
    this.isMuted = Boolean(muted);
    this.setVolume(this.volume);
  }

  // Play rich sound effects
  playSFX(type, vol = 0.85) {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const sfxGain = this.ctx.createGain();
    osc.connect(sfxGain);
    sfxGain.connect(this.ctx.destination);

    const g = Math.max(0.05, Math.min(1, vol));

    if (type === 'ding' || type === 'bell') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      sfxGain.gain.setValueAtTime(0.32 * g, now);
      sfxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.start(now);
      osc.stop(now + 0.65);
    } else if (type === 'whoosh' || type === 'swoosh') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.14);
      osc.frequency.exponentialRampToValueAtTime(85, now + 0.34);
      sfxGain.gain.setValueAtTime(0.28 * g, now);
      sfxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      osc.start(now);
      osc.stop(now + 0.36);
    } else if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.09);
      sfxGain.gain.setValueAtTime(0.38 * g, now);
      sfxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      osc.start(now);
      osc.stop(now + 0.11);
    } else if (type === 'boom' || type === 'impact') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(28, now + 0.55);
      sfxGain.gain.setValueAtTime(0.45 * g, now);
      sfxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      osc.start(now);
      osc.stop(now + 0.75);
    } else if (type === 'shutter') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.setValueAtTime(600, now + 0.04);
      sfxGain.gain.setValueAtTime(0.25 * g, now);
      sfxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'magic') {
      osc.type = 'sine';
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, idx) => {
        osc.frequency.setValueAtTime(f, now + idx * 0.06);
      });
      sfxGain.gain.setValueAtTime(0.25 * g, now);
      sfxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.start(now);
      osc.stop(now + 0.55);
    } else if (type === 'siren') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.35);
      osc.frequency.linearRampToValueAtTime(440, now + 0.7);
      sfxGain.gain.setValueAtTime(0.22 * g, now);
      sfxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      osc.start(now);
      osc.stop(now + 0.75);
    } else if (type === 'typing') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);
      sfxGain.gain.setValueAtTime(0.22 * g, now);
      sfxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      sfxGain.gain.setValueAtTime(0.2 * g, now);
      sfxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  }

  // Play rhythmic loop synced to project playback
  playBGM(trackName = 'lofi') {
    this.stopBGM();
    if (this.isMuted) return;
    this.init();
    this.isPlaying = true;
    this.currentTrack = trackName;

    const chordMap = {
      lofi: [130.81, 164.81, 196.0, 246.94],
      cyber: [110.0, 130.81, 164.81, 220.0],
      tension: [98.0, 116.54, 146.83, 185.0],
      upbeat: [146.83, 185.0, 220.0, 293.66]
    };

    const baseFreqs = chordMap[trackName] || chordMap.lofi;
    const waveType =
      trackName === 'cyber'
        ? 'sawtooth'
        : trackName === 'tension'
        ? 'triangle'
        : 'sine';

    baseFreqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = waveType;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.5 + i * 0.25;
      lfoGain.gain.value = 2.5;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      noteGain.gain.setValueAtTime(0.06 / (i + 1), this.ctx.currentTime);
      osc.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc.start();
      this.bgmOscs.push({ osc, lfo, noteGain });
    });
  }

  stopBGM() {
    this.bgmOscs.forEach(({ osc, lfo }) => {
      try {
        osc.stop();
        osc.disconnect();
        lfo.stop();
        lfo.disconnect();
      } catch (e) {
        // ignore
      }
    });
    this.bgmOscs = [];
    this.isPlaying = false;
  }

  // Browser Web Speech API TTS for Korean subtitles
  speakText(text, rate = 1.1, pitch = 1.0) {
    if (!('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[^\w\s가-힣,.?!0-9%]/g, ' ').trim();
      if (!cleanText) return;
      const utter = new SpeechSynthesisUtterance(cleanText);
      utter.lang = 'ko-KR';
      utter.rate = Math.max(0.5, Math.min(2.0, rate));
      utter.pitch = Math.max(0.5, Math.min(2.0, pitch));
      window.speechSynthesis.speak(utter);
    } catch (e) {
      // ignore speech synthesis errors
    }
  }

  stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioEngine = new AudioEngine();
