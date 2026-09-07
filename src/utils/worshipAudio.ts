// Moteur Audio d'Adoration & Recueillement Spirituel (Web Audio API)
// Conçu pour offrir des mélodies douces, apaisantes et respectueuses, dignes de la prière et de la méditation.
// Zéro son d'arcade ou de jeu vidéo : des nappes harmoniques chaleureuses, des accords d'adoration et des résonances sacrées.

export interface WorshipTrack {
  id: string;
  name: string;
  subtitle: string;
  key: string;
  description: string;
  bpm: number;
  scriptureRef: string;
}

export const WORSHIP_TRACKS: WorshipTrack[] = [
  {
    id: 'presence',
    name: 'Présence & Sanctuaire',
    subtitle: 'Nappe chaleureuse & accords lents de louange',
    key: 'Sol Majeur (G)',
    description: 'Une progression harmonique douce (G - Em7 - Cmaj9 - Dsus4) favorisant la présence de Dieu et l’intimité dans la prière secrète.',
    bpm: 50,
    scriptureRef: 'Psaume 16:11 — « Il y a d’abondantes joies devant ta face, des délices éternelles à ta droite. »',
  },
  {
    id: 'repos',
    name: 'Repos en Christ (432 Hz)',
    subtitle: 'Harmonie apaisante & méditation biblique',
    key: 'Ré Majeur (D) • 432 Hz',
    description: 'Fréquence de paix et accords doux (D - A - Bm - G) pour apaiser le cœur troublé, calmer l’anxiété et méditer la Parole.',
    bpm: 46,
    scriptureRef: 'Matthieu 11:28 — « Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos. »',
  },
  {
    id: 'harpe',
    name: 'Harpe de David',
    subtitle: 'Arpèges délicats & sérénité de l’âme',
    key: 'Do Majeur (C)',
    description: 'Inspiré de la harpe d’adoration qui apaisait l’âme agitée de Saül. Arpèges acoustiques éthérés sur une douce nappe de cordes.',
    bpm: 54,
    scriptureRef: '1 Samuel 16:23 — « David prenait la harpe et jouait de sa main; Saül respirait alors et se trouvait soulagé. »',
  },
  {
    id: 'brise',
    name: 'Brise Légère de l’Esprit',
    subtitle: 'Murmure doux & recueillement profond',
    key: 'Mi Mineur / Sol',
    description: 'Un son doux et subtil inspiré de la théophanie d’Élie à l’Horeb. Nappe contemplative épurée avec carillons cristallins célestes.',
    bpm: 42,
    scriptureRef: '1 Rois 19:12 — « Et après le tremblement de terre, un feu: l’Éternel n’était point dans le feu. Et après le feu, un murmure doux et léger. »',
  },
  {
    id: 'coeur',
    name: 'Cœur d’Adoration',
    subtitle: 'Piano feutré & élévation spirituelle',
    key: 'Fa Majeur (F)',
    description: 'Accords doux de piano et résonances d’église pour les temps d’adoration personnelle, de consécration et de jeûne.',
    bpm: 52,
    scriptureRef: 'Jean 4:24 — « Dieu est Esprit, et il faut que ceux qui l’adorent l’adorent en esprit et en vérité. »',
  },
];

class WorshipAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private currentTrackId = 'presence';
  private volume = 0.45;
  private timerMinutes: number | null = null;
  private timerEndTimeout: number | null = null;

  // Synthesis nodes for active ambient loop
  private activeOscillators: OscillatorNode[] = [];
  private activeGains: GainNode[] = [];
  private loopIntervalId: number | null = null;
  private subscribers: Set<(state: WorshipEngineState) => void> = new Set();

  constructor() {
    // Lazy init
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.ctx && !this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  public subscribe(callback: (state: WorshipEngineState) => void): () => void {
    this.subscribers.add(callback);
    callback(this.getState());
    return () => this.subscribers.delete(callback);
  }

  private notify() {
    const state = this.getState();
    this.subscribers.forEach((cb) => {
      try {
        cb(state);
      } catch (err) {
        console.error('Worship subscriber error:', err);
      }
    });
  }

  public getState(): WorshipEngineState {
    return {
      isPlaying: this.isPlaying,
      currentTrackId: this.currentTrackId,
      volume: this.volume,
      currentTrack:
        WORSHIP_TRACKS.find((t) => t.id === this.currentTrackId) || WORSHIP_TRACKS[0],
      timerMinutes: this.timerMinutes,
    };
  }

  public setVolume(newVol: number) {
    this.volume = Math.max(0, Math.min(1, newVol));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.1);
    }
    this.notify();
  }

  public selectTrack(trackId: string) {
    if (this.currentTrackId === trackId) return;
    this.currentTrackId = trackId;
    if (this.isPlaying) {
      this.stopSynthesis();
      this.startSynthesis();
    }
    this.notify();
  }

  public setTimer(minutes: number | null) {
    if (this.timerEndTimeout) {
      window.clearTimeout(this.timerEndTimeout);
      this.timerEndTimeout = null;
    }
    this.timerMinutes = minutes;
    if (minutes !== null && minutes > 0 && this.isPlaying) {
      this.timerEndTimeout = window.setTimeout(() => {
        this.pause();
        this.timerMinutes = null;
        this.notify();
      }, minutes * 60 * 1000);
    }
    this.notify();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public play(trackId?: string) {
    const ctx = this.initContext();
    if (!ctx) return;

    if (trackId && trackId !== this.currentTrackId) {
      this.currentTrackId = trackId;
    }

    if (!this.isPlaying) {
      this.isPlaying = true;
      this.startSynthesis();
      if (this.timerMinutes && this.timerMinutes > 0) {
        this.setTimer(this.timerMinutes);
      }
      this.notify();
    }
  }

  public pause() {
    if (this.isPlaying) {
      this.isPlaying = false;
      this.stopSynthesis();
      if (this.timerEndTimeout) {
        window.clearTimeout(this.timerEndTimeout);
        this.timerEndTimeout = null;
      }
      this.notify();
    }
  }

  // --- CORE WORSHIP AMBIENT SYNTHESIS ---
  // Pure, soothing, warm harmonic pads and acoustic chords without jarring digital artifacts
  private startSynthesis() {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    // Define harmonic chord progressions for each sacred track
    // (Frequencies in Hz)
    const chordProgressions: Record<string, number[][]> = {
      presence: [
        // G Major: G2, D3, G3, B3, D4, G4
        [98.0, 146.83, 196.0, 246.94, 293.66, 392.0],
        // E Minor 7: E2, B2, E3, G3, D4, E4
        [82.41, 123.47, 164.81, 196.0, 293.66, 329.63],
        // C Major 9: C2, G2, C3, E3, B3, D4
        [65.41, 98.0, 130.81, 164.81, 246.94, 293.66],
        // D sus4 -> D: D2, A2, D3, G3, A3, D4
        [73.42, 110.0, 146.83, 196.0, 220.0, 293.66],
      ],
      repos: [
        // D Major (432Hz tuning base: A4 = 432Hz, D3 = 144.16, etc.)
        [72.08, 108.0, 144.16, 216.0, 270.2, 324.0],
        // A / C#: C#2, A2, E3, A3, C#4, E4
        [68.04, 108.0, 162.0, 216.0, 272.16, 324.0],
        // B Minor 7: B1, F#2, B2, D3, A3, D4
        [60.63, 91.0, 121.26, 144.16, 216.0, 288.32],
        // G sus2: G1, D2, G2, A2, D3, G3
        [48.11, 72.08, 96.22, 108.0, 144.16, 192.44],
      ],
      harpe: [
        // C Major: C3, E3, G3, C4, E4
        [130.81, 164.81, 196.0, 261.63, 329.63, 392.0],
        // G / B: B2, D3, G3, B3, D4
        [123.47, 146.83, 196.0, 246.94, 293.66],
        // A Minor 7: A2, C3, E3, G3, C4
        [110.0, 130.81, 164.81, 196.0, 261.63],
        // F Major 7: F2, C3, F3, A3, C4, E4
        [87.31, 130.81, 174.61, 220.0, 261.63, 329.63],
      ],
      brise: [
        // E Minor: E2, B2, E3, G3, B3, E4
        [82.41, 123.47, 164.81, 196.0, 246.94, 329.63],
        // D Major: D2, A2, D3, F#3, A3, D4
        [73.42, 110.0, 146.83, 185.0, 220.0, 293.66],
        // C Major: C2, G2, C3, E3, G3, C4
        [65.41, 98.0, 130.81, 164.81, 196.0, 261.63],
        // B Minor: B1, F#2, B2, D3, F#3, B3
        [61.74, 92.5, 123.47, 146.83, 185.0, 246.94],
      ],
      coeur: [
        // F Major: F2, C3, F3, A3, C4, F4
        [87.31, 130.81, 174.61, 220.0, 261.63, 349.23],
        // C / E: E2, C3, G3, C4, E4
        [82.41, 130.81, 196.0, 261.63, 329.63],
        // D Minor 7: D2, A2, D3, F3, C4
        [73.42, 110.0, 146.83, 174.61, 261.63],
        // Bb Major 7: Bb1, F2, Bb2, D3, A3, D4
        [58.27, 87.31, 116.54, 146.83, 220.0, 293.66],
      ],
    };

    const chords = chordProgressions[this.currentTrackId] || chordProgressions.presence;
    let chordIdx = 0;
    const chordDurationSeconds = 7.0; // Slow, contemplative 7-second peaceful swell per chord

    // Function to play one chord with smooth crossfade
    const playCurrentChord = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const currentNotes = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      // Filter: Very soft lowpass filter at 480Hz - 700Hz to remove harshness
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(520, now);
      // Gentle breathing LFO modulation on the filter
      filter.frequency.linearRampToValueAtTime(680, now + chordDurationSeconds * 0.5);
      filter.frequency.linearRampToValueAtTime(500, now + chordDurationSeconds);
      filter.Q.setValueAtTime(0.7, now); // Gentle Q, no ringing
      filter.connect(this.masterGain);

      // Stereo panner if available for lush ambient field
      let panner: StereoPannerNode | null = null;
      try {
        if (this.ctx.createStereoPanner) {
          panner = this.ctx.createStereoPanner();
          panner.pan.setValueAtTime((Math.random() - 0.5) * 0.4, now);
          filter.disconnect();
          filter.connect(panner);
          panner.connect(this.masterGain);
        }
      } catch {
        // Fallback without panner
      }

      // Play notes of the chord
      currentNotes.forEach((freq, noteIdx) => {
        if (!this.ctx) return;
        // Warm dual-oscillator pad (sine base + soft triangle harmonic detuned)
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);

        osc2.type = 'triangle';
        // Subtle +4 cents detune for chorus warmth
        osc2.frequency.setValueAtTime(freq * 1.002, now);

        // Slow attack (1.8s), sustained body, slow release (2.2s)
        const baseAmp = 0.08 / Math.sqrt(currentNotes.length);
        noteGain.gain.setValueAtTime(0.0001, now);
        noteGain.gain.linearRampToValueAtTime(baseAmp, now + 1.8);
        noteGain.gain.setValueAtTime(baseAmp, now + chordDurationSeconds - 1.8);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + chordDurationSeconds + 0.8);

        osc1.connect(noteGain);
        osc2.connect(noteGain);
        noteGain.connect(filter);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + chordDurationSeconds + 1.0);
        osc2.stop(now + chordDurationSeconds + 1.0);

        this.activeOscillators.push(osc1, osc2);
        this.activeGains.push(noteGain);

        // Occasionally trigger a soft harp/piano bell chime note on the tonic or octave
        if (noteIdx === 0 && Math.random() > 0.35) {
          this.playDelicateHarpChime(freq * 2, now + 0.5 + Math.random() * 2.5);
        }
      });
    };

    // Trigger immediately
    playCurrentChord();

    // Schedule subsequent chords continuously
    this.loopIntervalId = window.setInterval(() => {
      playCurrentChord();
      // Cleanup finished nodes from array
      this.activeOscillators = this.activeOscillators.slice(-30);
      this.activeGains = this.activeGains.slice(-30);
    }, (chordDurationSeconds - 0.2) * 1000);
  }

  // Delicate acoustic harp / prayer bell droplet
  private playDelicateHarpChime(freq: number, startTime: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.04, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 3.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 3.3);
    } catch {
      // Ignore
    }
  }

  private stopSynthesis() {
    if (this.loopIntervalId) {
      window.clearInterval(this.loopIntervalId);
      this.loopIntervalId = null;
    }
    const now = this.ctx ? this.ctx.currentTime : 0;
    this.activeGains.forEach((g) => {
      try {
        g.gain.linearRampToValueAtTime(0.0001, now + 0.8);
      } catch {
        // Node may be expired
      }
    });
    setTimeout(() => {
      this.activeOscillators.forEach((o) => {
        try {
          o.stop();
        } catch {
          // Ignore
        }
      });
      this.activeOscillators = [];
      this.activeGains = [];
    }, 900);
  }
}

export interface WorshipEngineState {
  isPlaying: boolean;
  currentTrackId: string;
  volume: number;
  currentTrack: WorshipTrack;
  timerMinutes: number | null;
}

// Global Singleton Instance
export const worshipAudio = new WorshipAudioEngine();
