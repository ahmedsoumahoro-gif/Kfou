// Adaptive Melodic Music Engine for BloomVerse
// Generates catchy, youth-appealing anime-style melodies, synthwave grooves, and lo-fi chords

export type MelodyThemeId =
  | 'auto'
  | 'lofi_sanctuary'
  | 'quest_synthwave'
  | 'dungeon_battle'
  | 'shadow_monarch'
  | 'celestial_praise';

export interface MelodyTrack {
  id: MelodyThemeId;
  title: string;
  genre: string;
  vibe: string;
  bpm: number;
  icon: string;
}

export const MELODY_TRACKS: MelodyTrack[] = [
  {
    id: 'lofi_sanctuary',
    title: 'Sanctuaire Éthéré',
    genre: 'Lo-Fi Anime Chill',
    vibe: 'Méditation & Paix',
    bpm: 78,
    icon: '🕊️',
  },
  {
    id: 'quest_synthwave',
    title: 'Rythme du Chasseur',
    genre: 'Synthwave Électro',
    vibe: 'Défi Quotidien & Motivation',
    bpm: 112,
    icon: '⚡',
  },
  {
    id: 'dungeon_battle',
    title: 'Éveil du Boss',
    genre: 'Anime OST Héroïque',
    vibe: 'Combat de Donjon & Victoire',
    bpm: 126,
    icon: '⚔️',
  },
  {
    id: 'shadow_monarch',
    title: 'Légion des Ombres',
    genre: 'Dark Melodic Trap',
    vibe: 'Onction & Extraction',
    bpm: 90,
    icon: '👑',
  },
  {
    id: 'celestial_praise',
    title: 'Gloire & Triomphe',
    genre: 'Céleste Épique',
    vibe: 'Louange & Transcendance',
    bpm: 104,
    icon: '✨',
  },
];

// Musical note frequencies (in Hz)
const NOTES: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.5,
};

interface StepData {
  chord: number[]; // frequencies for harmony
  bass: number; // frequency for bass
  lead?: number; // lead melody frequency
  pulse?: 'kick' | 'hihat' | 'snare';
}

// Melodic sequences for each mode
const SEQUENCES: Record<Exclude<MelodyThemeId, 'auto'>, StepData[]> = {
  // 1. Lo-Fi Chill Sanctuary (Peaceful prayer, soothing chords)
  lofi_sanctuary: [
    { chord: [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.B4], bass: NOTES.C3, lead: NOTES.E5, pulse: 'kick' },
    { chord: [NOTES.C4, NOTES.E4, NOTES.G4], bass: NOTES.C3, lead: NOTES.G5, pulse: 'hihat' },
    { chord: [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.B4], bass: NOTES.C3, lead: NOTES.E5 },
    { chord: [NOTES.C4, NOTES.E4, NOTES.G4], bass: NOTES.C3, lead: NOTES.D5, pulse: 'snare' },

    { chord: [NOTES.A3, NOTES.C4, NOTES.E4, NOTES.G4], bass: NOTES.A3, lead: NOTES.C5, pulse: 'kick' },
    { chord: [NOTES.A3, NOTES.C4, NOTES.E4], bass: NOTES.A3, lead: NOTES.E5, pulse: 'hihat' },
    { chord: [NOTES.A3, NOTES.C4, NOTES.E4, NOTES.G4], bass: NOTES.A3, lead: NOTES.A5 },
    { chord: [NOTES.A3, NOTES.C4, NOTES.E4], bass: NOTES.A3, lead: NOTES.G5, pulse: 'snare' },

    { chord: [NOTES.F3, NOTES.A3, NOTES.C4, NOTES.E4], bass: NOTES.F3, lead: NOTES.F5, pulse: 'kick' },
    { chord: [NOTES.F3, NOTES.A3, NOTES.C4], bass: NOTES.F3, lead: NOTES.A5, pulse: 'hihat' },
    { chord: [NOTES.F3, NOTES.A3, NOTES.C4, NOTES.E4], bass: NOTES.F3, lead: NOTES.G5 },
    { chord: [NOTES.F3, NOTES.A3, NOTES.C4], bass: NOTES.F3, lead: NOTES.E5, pulse: 'snare' },

    { chord: [NOTES.G3, NOTES.B3, NOTES.D4, NOTES.F4], bass: NOTES.G3, lead: NOTES.D5, pulse: 'kick' },
    { chord: [NOTES.G3, NOTES.B3, NOTES.D4], bass: NOTES.G3, lead: NOTES.E5, pulse: 'hihat' },
    { chord: [NOTES.G3, NOTES.B3, NOTES.D4, NOTES.F4], bass: NOTES.G3, lead: NOTES.C5 },
    { chord: [NOTES.G3, NOTES.B3, NOTES.D4], bass: NOTES.G3, lead: NOTES.D5, pulse: 'snare' },
  ],

  // 2. Quest Synthwave (Driving electronic anime beat for challenges)
  quest_synthwave: [
    { chord: [NOTES.A3, NOTES.C4, NOTES.E4], bass: NOTES.A3, lead: NOTES.A5, pulse: 'kick' },
    { chord: [NOTES.A3, NOTES.C4, NOTES.E4], bass: NOTES.A3, lead: NOTES.E5, pulse: 'hihat' },
    { chord: [NOTES.A3, NOTES.C4, NOTES.E4], bass: NOTES.A3, lead: NOTES.G5, pulse: 'snare' },
    { chord: [NOTES.A3, NOTES.C4, NOTES.E4], bass: NOTES.A3, lead: NOTES.A5, pulse: 'hihat' },

    { chord: [NOTES.F3, NOTES.A3, NOTES.C4], bass: NOTES.F3, lead: NOTES.C6, pulse: 'kick' },
    { chord: [NOTES.F3, NOTES.A3, NOTES.C4], bass: NOTES.F3, lead: NOTES.B5, pulse: 'hihat' },
    { chord: [NOTES.F3, NOTES.A3, NOTES.C4], bass: NOTES.F3, lead: NOTES.A5, pulse: 'snare' },
    { chord: [NOTES.F3, NOTES.A3, NOTES.C4], bass: NOTES.F3, lead: NOTES.G5, pulse: 'hihat' },

    { chord: [NOTES.C4, NOTES.E4, NOTES.G4], bass: NOTES.C3, lead: NOTES.G5, pulse: 'kick' },
    { chord: [NOTES.C4, NOTES.E4, NOTES.G4], bass: NOTES.C3, lead: NOTES.E5, pulse: 'hihat' },
    { chord: [NOTES.C4, NOTES.E4, NOTES.G4], bass: NOTES.C3, lead: NOTES.G5, pulse: 'snare' },
    { chord: [NOTES.C4, NOTES.E4, NOTES.G4], bass: NOTES.C3, lead: NOTES.A5, pulse: 'hihat' },

    { chord: [NOTES.G3, NOTES.B3, NOTES.D4], bass: NOTES.G3, lead: NOTES.B5, pulse: 'kick' },
    { chord: [NOTES.G3, NOTES.B3, NOTES.D4], bass: NOTES.G3, lead: NOTES.G5, pulse: 'hihat' },
    { chord: [NOTES.G3, NOTES.B3, NOTES.D4], bass: NOTES.G3, lead: NOTES.E5, pulse: 'snare' },
    { chord: [NOTES.G3, NOTES.B3, NOTES.D4], bass: NOTES.G3, lead: NOTES.D5, pulse: 'hihat' },
  ],

  // 3. Dungeon Battle (Heroic, fast anime battle arpeggios)
  dungeon_battle: [
    { chord: [NOTES.E3, NOTES.G3, NOTES.B3], bass: NOTES.E3, lead: NOTES.B5, pulse: 'kick' },
    { chord: [NOTES.E3, NOTES.G3, NOTES.B3], bass: NOTES.E3, lead: NOTES.E5, pulse: 'hihat' },
    { chord: [NOTES.E3, NOTES.G3, NOTES.B3], bass: NOTES.E3, lead: NOTES.G5, pulse: 'snare' },
    { chord: [NOTES.E3, NOTES.G3, NOTES.B3], bass: NOTES.E3, lead: NOTES.A5, pulse: 'hihat' },

    { chord: [NOTES.C3, NOTES.E3, NOTES.G3], bass: NOTES.C3, lead: NOTES.G5, pulse: 'kick' },
    { chord: [NOTES.C3, NOTES.E3, NOTES.G3], bass: NOTES.C3, lead: NOTES.E5, pulse: 'hihat' },
    { chord: [NOTES.C3, NOTES.E3, NOTES.G3], bass: NOTES.C3, lead: NOTES.B5, pulse: 'snare' },
    { chord: [NOTES.C3, NOTES.E3, NOTES.G3], bass: NOTES.C3, lead: NOTES.C6, pulse: 'hihat' },

    { chord: [NOTES.D3, NOTES.F3, NOTES.A3], bass: NOTES.D3, lead: NOTES.D5, pulse: 'kick' },
    { chord: [NOTES.D3, NOTES.F3, NOTES.A3], bass: NOTES.D3, lead: NOTES.F5, pulse: 'hihat' },
    { chord: [NOTES.D3, NOTES.F3, NOTES.A3], bass: NOTES.D3, lead: NOTES.A5, pulse: 'snare' },
    { chord: [NOTES.D3, NOTES.F3, NOTES.A3], bass: NOTES.D3, lead: NOTES.G5, pulse: 'hihat' },

    { chord: [NOTES.B3, NOTES.D4, NOTES.F4], bass: NOTES.B3, lead: NOTES.F5, pulse: 'kick' },
    { chord: [NOTES.B3, NOTES.D4, NOTES.F4], bass: NOTES.B3, lead: NOTES.D5, pulse: 'hihat' },
    { chord: [NOTES.B3, NOTES.D4, NOTES.F4], bass: NOTES.B3, lead: NOTES.E5, pulse: 'snare' },
    { chord: [NOTES.B3, NOTES.D4, NOTES.F4], bass: NOTES.B3, lead: NOTES.B5, pulse: 'hihat' },
  ],

  // 4. Shadow Monarch (Deep evocative mystic melodic bells)
  shadow_monarch: [
    { chord: [NOTES.D3, NOTES.F3, NOTES.A3], bass: NOTES.D3, lead: NOTES.A5, pulse: 'kick' },
    { chord: [NOTES.D3, NOTES.F3, NOTES.A3], bass: NOTES.D3, lead: NOTES.F5, pulse: 'hihat' },
    { chord: [NOTES.D3, NOTES.F3, NOTES.A3], bass: NOTES.D3, lead: NOTES.D5 },
    { chord: [NOTES.D3, NOTES.F3, NOTES.A3], bass: NOTES.D3, lead: NOTES.E5, pulse: 'snare' },

    { chord: [NOTES.B3, NOTES.D4, NOTES.F4], bass: NOTES.B3, lead: NOTES.F5, pulse: 'kick' },
    { chord: [NOTES.B3, NOTES.D4, NOTES.F4], bass: NOTES.B3, lead: NOTES.D5, pulse: 'hihat' },
    { chord: [NOTES.B3, NOTES.D4, NOTES.F4], bass: NOTES.B3, lead: NOTES.B4 },
    { chord: [NOTES.B3, NOTES.D4, NOTES.F4], bass: NOTES.B3, lead: NOTES.C5, pulse: 'snare' },

    { chord: [NOTES.G3, NOTES.B3, NOTES.D4], bass: NOTES.G3, lead: NOTES.D5, pulse: 'kick' },
    { chord: [NOTES.G3, NOTES.B3, NOTES.D4], bass: NOTES.G3, lead: NOTES.B4, pulse: 'hihat' },
    { chord: [NOTES.G3, NOTES.B3, NOTES.D4], bass: NOTES.G3, lead: NOTES.G4 },
    { chord: [NOTES.G3, NOTES.B3, NOTES.D4], bass: NOTES.G3, lead: NOTES.A4, pulse: 'snare' },

    { chord: [NOTES.A3, NOTES.C4, NOTES.E4], bass: NOTES.A3, lead: NOTES.E5, pulse: 'kick' },
    { chord: [NOTES.A3, NOTES.C4, NOTES.E4], bass: NOTES.A3, lead: NOTES.C5, pulse: 'hihat' },
    { chord: [NOTES.A3, NOTES.C4, NOTES.E4], bass: NOTES.A3, lead: NOTES.A4 },
    { chord: [NOTES.A3, NOTES.C4, NOTES.E4], bass: NOTES.A3, lead: NOTES.D5, pulse: 'snare' },
  ],

  // 5. Celestial Praise (Uplifting transcendent melodies)
  celestial_praise: [
    { chord: [NOTES.G3, NOTES.B3, NOTES.D4], bass: NOTES.G3, lead: NOTES.G5, pulse: 'kick' },
    { chord: [NOTES.G3, NOTES.B3, NOTES.D4], bass: NOTES.G3, lead: NOTES.B5, pulse: 'hihat' },
    { chord: [NOTES.G3, NOTES.B3, NOTES.D4], bass: NOTES.G3, lead: NOTES.D6, pulse: 'snare' },
    { chord: [NOTES.G3, NOTES.B3, NOTES.D4], bass: NOTES.G3, lead: NOTES.B5, pulse: 'hihat' },

    { chord: [NOTES.D4, NOTES.F4, NOTES.A4], bass: NOTES.D3, lead: NOTES.A5, pulse: 'kick' },
    { chord: [NOTES.D4, NOTES.F4, NOTES.A4], bass: NOTES.D3, lead: NOTES.F5, pulse: 'hihat' },
    { chord: [NOTES.D4, NOTES.F4, NOTES.A4], bass: NOTES.D3, lead: NOTES.A5, pulse: 'snare' },
    { chord: [NOTES.D4, NOTES.F4, NOTES.A4], bass: NOTES.D3, lead: NOTES.C6, pulse: 'hihat' },

    { chord: [NOTES.E3, NOTES.G3, NOTES.B3], bass: NOTES.E3, lead: NOTES.B5, pulse: 'kick' },
    { chord: [NOTES.E3, NOTES.G3, NOTES.B3], bass: NOTES.E3, lead: NOTES.G5, pulse: 'hihat' },
    { chord: [NOTES.E3, NOTES.G3, NOTES.B3], bass: NOTES.E3, lead: NOTES.E5, pulse: 'snare' },
    { chord: [NOTES.E3, NOTES.G3, NOTES.B3], bass: NOTES.E3, lead: NOTES.G5, pulse: 'hihat' },

    { chord: [NOTES.C4, NOTES.E4, NOTES.G4], bass: NOTES.C3, lead: NOTES.G5, pulse: 'kick' },
    { chord: [NOTES.C4, NOTES.E4, NOTES.G4], bass: NOTES.C3, lead: NOTES.E5, pulse: 'hihat' },
    { chord: [NOTES.C4, NOTES.E4, NOTES.G4], bass: NOTES.C3, lead: NOTES.D5, pulse: 'snare' },
    { chord: [NOTES.C4, NOTES.E4, NOTES.G4], bass: NOTES.C3, lead: NOTES.C5, pulse: 'hihat' },
  ],
};

class MelodicMusicEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentTrackId: MelodyThemeId = 'auto';
  private activeSequenceKey: Exclude<MelodyThemeId, 'auto'> = 'lofi_sanctuary';
  private timer: number | null = null;
  private currentStep = 0;
  private volume = 0.45;
  private masterGain: GainNode | null = null;
  private listeners: Array<() => void> = [];

  private getAudioContext(): AudioContext | null {
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
    return this.ctx;
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentTrackId: this.currentTrackId,
      activeTheme: this.activeSequenceKey,
      trackInfo:
        MELODY_TRACKS.find((t) => t.id === this.activeSequenceKey) || MELODY_TRACKS[0],
      isAuto: this.currentTrackId === 'auto',
      volume: this.volume,
    };
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    this.notify();
  }

  // Adaptive auto-switch depending on active tab or quest context
  public onContextChange(tab: string) {
    if (this.currentTrackId !== 'auto') return;

    let targetKey: Exclude<MelodyThemeId, 'auto'> = 'lofi_sanctuary';
    if (tab === 'quests') {
      targetKey = 'quest_synthwave';
    } else if (tab === 'dungeons') {
      targetKey = 'dungeon_battle';
    } else if (tab === 'shadows') {
      targetKey = 'shadow_monarch';
    } else if (tab === 'skills' || tab === 'inventory') {
      targetKey = 'celestial_praise';
    } else {
      targetKey = 'lofi_sanctuary';
    }

    if (this.activeSequenceKey !== targetKey) {
      this.activeSequenceKey = targetKey;
      this.currentStep = 0;
      this.notify();
    }
  }

  public selectTrack(trackId: MelodyThemeId, currentTab = 'dashboard') {
    this.currentTrackId = trackId;
    if (trackId === 'auto') {
      this.onContextChange(currentTab);
    } else {
      this.activeSequenceKey = trackId;
      this.currentStep = 0;
    }

    if (!this.isPlaying) {
      this.play();
    } else {
      this.notify();
    }
  }

  public togglePlay(currentTab = 'dashboard') {
    if (this.isPlaying) {
      this.stop();
    } else {
      if (this.currentTrackId === 'auto') {
        this.onContextChange(currentTab);
      }
      this.play();
    }
  }

  public play() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.connect(ctx.destination);
    }
    this.masterGain.gain.setValueAtTime(this.volume, ctx.currentTime);

    this.isPlaying = true;
    this.currentStep = 0;
    this.scheduleNextStep();
    this.notify();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
    this.notify();
  }

  private playSoundStep(step: StepData, stepDuration: number) {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain || !this.isPlaying) return;
    const now = ctx.currentTime;

    // 1. Soft Warm Harmony Chords (Triangle wave through LowPass Filter)
    step.chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + stepDuration * 1.6);
    });

    // 2. Smooth Sub-Bass (Deep Sine wave)
    if (step.bass) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(step.bass, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + stepDuration);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + stepDuration);
    }

    // 3. Catchy Lead Melody (Lofi Bell / Synthwave Flute tone)
    if (step.lead) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      // Subtle vibrato
      osc.frequency.setValueAtTime(step.lead, now);
      osc.frequency.linearRampToValueAtTime(step.lead * 1.006, now + stepDuration * 0.5);
      osc.frequency.linearRampToValueAtTime(step.lead, now + stepDuration);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + stepDuration * 1.3);
    }

    // 4. Subtle Lo-Fi Rhythm Pulse (Kick or Hi-Hat)
    if (step.pulse === 'kick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.1);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 0.13);
    } else if (step.pulse === 'hihat') {
      // Noise burst for hi-hat tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(4500, now);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (step.pulse === 'snare') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  }

  private scheduleNextStep() {
    if (!this.isPlaying) return;

    const track =
      MELODY_TRACKS.find((t) => t.id === this.activeSequenceKey) || MELODY_TRACKS[0];
    const sequence = SEQUENCES[this.activeSequenceKey] || SEQUENCES.lofi_sanctuary;
    const stepDurationSec = (60 / track.bpm) * 0.5; // Eighth note rhythm

    const step = sequence[this.currentStep % sequence.length];
    this.playSoundStep(step, stepDurationSec);

    this.currentStep = (this.currentStep + 1) % sequence.length;

    this.timer = window.setTimeout(() => {
      this.scheduleNextStep();
    }, stepDurationSec * 1000);
  }
}

export const musicEngine = new MelodicMusicEngine();
