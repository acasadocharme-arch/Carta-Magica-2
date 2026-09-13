// Music Box & Celesta Christmas Instrumental Audio Engine
// Built with pure Web Audio API for zero dependencies, zero latency, and 100% reliable offline playback

interface NoteEvent {
  note: string;
  duration: number; // in beats
  rest?: boolean;
}

interface ChordMeasure {
  root: string;
  notes: string[];
}

// Convert scientific pitch notation to frequency (Hz)
const noteToFrequency = (note: string): number => {
  const noteMap: Record<string, number> = {
    C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5,
    "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11,
  };
  const match = note.match(/^([A-Ga-g][#b]?)([0-9])$/);
  if (!match) return 440;
  const name = match[1].toUpperCase();
  const octave = parseInt(match[2], 10);
  const semitonesFromA4 = (octave - 4) * 12 + (noteMap[name] ?? 9) - 9;
  return 440 * Math.pow(2, semitonesFromA4 / 12);
};

export interface TrackInfo {
  id: string;
  title: string;
  subtitle: string;
  bpm: number;
  timeSignature: number; // beats per measure
  melody: NoteEvent[];
  chords: ChordMeasure[];
}

export const CHRISTMAS_TRACKS: TrackInfo[] = [
  {
    id: "silent_night",
    title: "Noite Feliz",
    subtitle: "Caixa de Música Instrumental",
    bpm: 72,
    timeSignature: 3,
    melody: [
      // M1
      { note: "G4", duration: 1.5 }, { note: "A4", duration: 0.5 }, { note: "G4", duration: 1.0 },
      // M2
      { note: "E4", duration: 3.0 },
      // M3
      { note: "G4", duration: 1.5 }, { note: "A4", duration: 0.5 }, { note: "G4", duration: 1.0 },
      // M4
      { note: "E4", duration: 3.0 },
      // M5
      { note: "D5", duration: 2.0 }, { note: "D5", duration: 1.0 },
      // M6
      { note: "B4", duration: 3.0 },
      // M7
      { note: "C5", duration: 2.0 }, { note: "C5", duration: 1.0 },
      // M8
      { note: "G4", duration: 3.0 },
      // M9
      { note: "A4", duration: 2.0 }, { note: "A4", duration: 1.0 },
      // M10
      { note: "C5", duration: 1.5 }, { note: "B4", duration: 0.5 }, { note: "A4", duration: 1.0 },
      // M11
      { note: "G4", duration: 1.5 }, { note: "A4", duration: 0.5 }, { note: "G4", duration: 1.0 },
      // M12
      { note: "E4", duration: 3.0 },
      // M13
      { note: "A4", duration: 2.0 }, { note: "A4", duration: 1.0 },
      // M14
      { note: "C5", duration: 1.5 }, { note: "B4", duration: 0.5 }, { note: "A4", duration: 1.0 },
      // M15
      { note: "G4", duration: 1.5 }, { note: "A4", duration: 0.5 }, { note: "G4", duration: 1.0 },
      // M16
      { note: "E4", duration: 3.0 },
      // M17
      { note: "D5", duration: 2.0 }, { note: "D5", duration: 1.0 },
      // M18
      { note: "F5", duration: 1.5 }, { note: "D5", duration: 0.5 }, { note: "B4", duration: 1.0 },
      // M19
      { note: "C5", duration: 3.0 },
      // M20
      { note: "E5", duration: 3.0 },
      // M21
      { note: "C5", duration: 1.5 }, { note: "G4", duration: 0.5 }, { note: "E4", duration: 1.0 },
      // M22
      { note: "G4", duration: 1.5 }, { note: "F4", duration: 0.5 }, { note: "D4", duration: 1.0 },
      // M23
      { note: "C4", duration: 3.0 },
      // M24 (delicate ringing pause)
      { note: "C4", duration: 3.0, rest: true },
    ],
    chords: [
      { root: "C3", notes: ["G3", "E4"] }, // M1
      { root: "C3", notes: ["G3", "E4"] }, // M2
      { root: "C3", notes: ["G3", "E4"] }, // M3
      { root: "C3", notes: ["G3", "E4"] }, // M4
      { root: "G2", notes: ["D3", "B3"] }, // M5
      { root: "G2", notes: ["D3", "B3"] }, // M6
      { root: "C3", notes: ["G3", "E4"] }, // M7
      { root: "C3", notes: ["G3", "E4"] }, // M8
      { root: "F2", notes: ["C3", "A3"] }, // M9
      { root: "F2", notes: ["C3", "A3"] }, // M10
      { root: "C3", notes: ["G3", "E4"] }, // M11
      { root: "C3", notes: ["G3", "E4"] }, // M12
      { root: "F2", notes: ["C3", "A3"] }, // M13
      { root: "F2", notes: ["C3", "A3"] }, // M14
      { root: "C3", notes: ["G3", "E4"] }, // M15
      { root: "C3", notes: ["G3", "E4"] }, // M16
      { root: "G2", notes: ["D3", "B3"] }, // M17
      { root: "G2", notes: ["D3", "B3"] }, // M18
      { root: "C3", notes: ["G3", "E4"] }, // M19
      { root: "C3", notes: ["G3", "E4"] }, // M20
      { root: "C3", notes: ["G3", "E4"] }, // M21
      { root: "G2", notes: ["D3", "B3"] }, // M22
      { root: "C3", notes: ["G3", "E4"] }, // M23
      { root: "C3", notes: ["G3", "E4"] }, // M24
    ],
  },
  {
    id: "jingle_bells",
    title: "Sino de Belém",
    subtitle: "Campanário Encantado",
    bpm: 88,
    timeSignature: 4,
    melody: [
      // M1
      { note: "E4", duration: 1.0 }, { note: "E4", duration: 1.0 }, { note: "E4", duration: 2.0 },
      // M2
      { note: "E4", duration: 1.0 }, { note: "E4", duration: 1.0 }, { note: "E4", duration: 2.0 },
      // M3
      { note: "E4", duration: 1.0 }, { note: "G4", duration: 1.0 }, { note: "C4", duration: 1.5 }, { note: "D4", duration: 0.5 },
      // M4
      { note: "E4", duration: 4.0 },
      // M5
      { note: "F4", duration: 1.0 }, { note: "F4", duration: 1.0 }, { note: "F4", duration: 1.5 }, { note: "F4", duration: 0.5 },
      // M6
      { note: "F4", duration: 1.0 }, { note: "E4", duration: 1.0 }, { note: "E4", duration: 1.0 }, { note: "E4", duration: 1.0 },
      // M7
      { note: "E4", duration: 1.0 }, { note: "D4", duration: 1.0 }, { note: "D4", duration: 1.0 }, { note: "E4", duration: 1.0 },
      // M8
      { note: "D4", duration: 2.0 }, { note: "G4", duration: 2.0 },
      // M9
      { note: "E4", duration: 1.0 }, { note: "E4", duration: 1.0 }, { note: "E4", duration: 2.0 },
      // M10
      { note: "E4", duration: 1.0 }, { note: "E4", duration: 1.0 }, { note: "E4", duration: 2.0 },
      // M11
      { note: "E4", duration: 1.0 }, { note: "G4", duration: 1.0 }, { note: "C4", duration: 1.5 }, { note: "D4", duration: 0.5 },
      // M12
      { note: "E4", duration: 4.0 },
      // M13
      { note: "F4", duration: 1.0 }, { note: "F4", duration: 1.0 }, { note: "F4", duration: 1.5 }, { note: "F4", duration: 0.5 },
      // M14
      { note: "F4", duration: 1.0 }, { note: "E4", duration: 1.0 }, { note: "E4", duration: 1.0 }, { note: "E4", duration: 1.0 },
      // M15
      { note: "G4", duration: 1.0 }, { note: "G4", duration: 1.0 }, { note: "F4", duration: 1.0 }, { note: "D4", duration: 1.0 },
      // M16
      { note: "C4", duration: 4.0 },
    ],
    chords: [
      { root: "C3", notes: ["G3", "E4"] }, // M1
      { root: "C3", notes: ["G3", "E4"] }, // M2
      { root: "C3", notes: ["G3", "E4"] }, // M3
      { root: "C3", notes: ["G3", "E4"] }, // M4
      { root: "F2", notes: ["C3", "A3"] }, // M5
      { root: "C3", notes: ["G3", "E4"] }, // M6
      { root: "G2", notes: ["D3", "B3"] }, // M7
      { root: "G2", notes: ["D3", "B3"] }, // M8
      { root: "C3", notes: ["G3", "E4"] }, // M9
      { root: "C3", notes: ["G3", "E4"] }, // M10
      { root: "C3", notes: ["G3", "E4"] }, // M11
      { root: "C3", notes: ["G3", "E4"] }, // M12
      { root: "F2", notes: ["C3", "A3"] }, // M13
      { root: "C3", notes: ["G3", "E4"] }, // M14
      { root: "G2", notes: ["D3", "B3"] }, // M15
      { root: "C3", notes: ["G3", "E4"] }, // M16
    ],
  },
];

class ChristmasAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayGain: GainNode | null = null;

  private isRunning: boolean = false;
  private volume: number = 0.5;
  private currentTrackIndex: number = 0;
  private schedulerTimer: number | null = null;
  private nextBeatTime: number = 0;
  private currentBeatIndex: number = 0;
  private currentMeasure: number = 0;
  private isMuted: boolean = false;

  private onStateChangeListeners: Set<() => void> = new Set();

  constructor() {
    // Lazy initialized on first user interaction
  }

  private initAudio() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master output volume node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      // Warm acoustic lowpass filter (removes any digital harshness, gives wooden music box tone)
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = "lowpass";
      this.filterNode.frequency.setValueAtTime(2400, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(1.0, this.ctx.currentTime);

      // Ambient cozy spatial reverb / stereo delay
      this.delayNode = this.ctx.createDelay();
      this.delayNode.delayTime.setValueAtTime(0.24, this.ctx.currentTime);

      this.delayGain = this.ctx.createGain();
      this.delayGain.gain.setValueAtTime(0.22, this.ctx.currentTime);

      // Routing: Filter -> Master -> Destination
      this.filterNode.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Reverb routing: Filter -> Delay -> DelayGain -> Master & Feedback
      this.filterNode.connect(this.delayNode);
      this.delayNode.connect(this.delayGain);
      this.delayGain.connect(this.masterGain);
      this.delayGain.connect(this.delayNode); // subtle feedback loop
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Play a single pristine music box / chime note with crystalline harmonics
  private playMusicBoxNote(freq: number, startTime: number, durationSec: number, velocity: number = 0.6) {
    if (!this.ctx || !this.filterNode) return;

    const fundamentalOsc = this.ctx.createOscillator();
    const overtoneOsc = this.ctx.createOscillator();
    const bellTineOsc = this.ctx.createOscillator();

    const noteGain = this.ctx.createGain();

    fundamentalOsc.type = "sine";
    fundamentalOsc.frequency.setValueAtTime(freq, startTime);

    // 2nd partial (harmonic octave overtone)
    overtoneOsc.type = "sine";
    overtoneOsc.frequency.setValueAtTime(freq * 2.0, startTime);

    // 3rd metallic bell shimmer (in-harmonic chime characteristic of Swiss music boxes)
    bellTineOsc.type = "triangle";
    bellTineOsc.frequency.setValueAtTime(freq * 3.76, startTime);

    // Exponential decay envelopes for true music box acoustics
    const baseGain = velocity * 0.28;
    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.linearRampToValueAtTime(baseGain, startTime + 0.005); // snappy pluck attack
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.max(0.6, durationSec * 1.5));

    fundamentalOsc.connect(noteGain);
    overtoneOsc.connect(noteGain);
    bellTineOsc.connect(noteGain);
    noteGain.connect(this.filterNode);

    fundamentalOsc.start(startTime);
    overtoneOsc.start(startTime);
    bellTineOsc.start(startTime);

    const stopTime = startTime + Math.max(0.7, durationSec * 1.6);
    fundamentalOsc.stop(stopTime);
    overtoneOsc.stop(stopTime);
    bellTineOsc.stop(stopTime);
  }

  // Play warm bass/accompaniment chime note
  private playWarmBassNote(freq: number, startTime: number, durationSec: number) {
    if (!this.ctx || !this.filterNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, startTime);

    const baseGain = 0.16;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(baseGain, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.max(0.8, durationSec * 1.2));

    osc.connect(gain);
    gain.connect(this.filterNode);

    osc.start(startTime);
    const stopTime = startTime + Math.max(0.9, durationSec * 1.3);
    osc.stop(stopTime);
  }

  private scheduleNotes() {
    if (!this.ctx || !this.isRunning) return;

    const track = CHRISTMAS_TRACKS[this.currentTrackIndex];
    const secondsPerBeat = 60 / track.bpm;
    const lookaheadSec = 0.4; // look ahead buffer window

    while (this.nextBeatTime < this.ctx.currentTime + lookaheadSec) {
      const melodyEvent = track.melody[this.currentBeatIndex];

      if (melodyEvent) {
        if (!melodyEvent.rest) {
          const freq = noteToFrequency(melodyEvent.note);
          const durationSec = melodyEvent.duration * secondsPerBeat;
          this.playMusicBoxNote(freq, this.nextBeatTime, durationSec, 0.65);
        }

        // Accompaniment: Play chord harmony on start of each measure
        const currentChord = track.chords[this.currentMeasure % track.chords.length];
        if (currentChord) {
          const bassFreq = noteToFrequency(currentChord.root);
          this.playWarmBassNote(bassFreq, this.nextBeatTime, secondsPerBeat * track.timeSignature);

          // Gentle arpeggio notes for depth
          if (currentChord.notes && currentChord.notes.length > 0) {
            currentChord.notes.forEach((chordNote, idx) => {
              const chordFreq = noteToFrequency(chordNote);
              const noteOffset = this.nextBeatTime + (idx + 1) * (secondsPerBeat * 0.5);
              this.playMusicBoxNote(chordFreq, noteOffset, secondsPerBeat, 0.35);
            });
          }
        }

        this.nextBeatTime += melodyEvent.duration * secondsPerBeat;
        this.currentBeatIndex++;

        // Check if measure boundary reached
        const accumulatedBeats = track.melody.slice(0, this.currentBeatIndex).reduce((acc, m) => acc + m.duration, 0);
        this.currentMeasure = Math.floor(accumulatedBeats / track.timeSignature);

        // Loop seamlessly if track finished
        if (this.currentBeatIndex >= track.melody.length) {
          this.currentBeatIndex = 0;
          this.currentMeasure = 0;
        }
      } else {
        this.currentBeatIndex = 0;
        this.currentMeasure = 0;
      }
    }

    if (this.isRunning) {
      this.schedulerTimer = window.setTimeout(() => this.scheduleNotes(), 50);
    }
  }

  public togglePlay() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.play();
    }
  }

  public play() {
    this.initAudio();
    if (!this.ctx || !this.masterGain) return;

    if (this.isRunning) return;
    this.isRunning = true;

    // Smooth fade in
    const targetVol = this.isMuted ? 0 : this.volume;
    this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(targetVol, this.ctx.currentTime + 0.3);

    this.nextBeatTime = this.ctx.currentTime + 0.05;
    this.scheduleNotes();
    this.notifyListeners();
  }

  public pause() {
    if (!this.isRunning) return;

    if (this.ctx && this.masterGain) {
      // Smooth fade out to avoid clicks
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);
    }

    if (this.schedulerTimer !== null) {
      clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }

    this.isRunning = false;
    this.notifyListeners();
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.volume > 0 && this.isMuted) {
      this.isMuted = false;
    }
    if (this.ctx && this.masterGain && this.isRunning && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.05);
    }
    this.notifyListeners();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.ctx && this.masterGain && this.isRunning) {
      const target = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.05);
    }
    this.notifyListeners();
  }

  public setTrack(index: number) {
    if (index >= 0 && index < CHRISTMAS_TRACKS.length) {
      this.currentTrackIndex = index;
      this.currentBeatIndex = 0;
      this.currentMeasure = 0;
      if (this.isRunning && this.ctx) {
        this.nextBeatTime = this.ctx.currentTime + 0.05;
      }
      this.notifyListeners();
    }
  }

  public nextTrack() {
    const nextIndex = (this.currentTrackIndex + 1) % CHRISTMAS_TRACKS.length;
    this.setTrack(nextIndex);
  }

  public getState() {
    return {
      isPlaying: this.isRunning,
      volume: this.volume,
      isMuted: this.isMuted,
      currentTrack: CHRISTMAS_TRACKS[this.currentTrackIndex],
      currentTrackIndex: this.currentTrackIndex,
      totalTracks: CHRISTMAS_TRACKS.length,
    };
  }

  public subscribe(listener: () => void) {
    this.onStateChangeListeners.add(listener);
    return () => {
      this.onStateChangeListeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.onStateChangeListeners.forEach((fn) => fn());
  }
}

export const christmasAudio = new ChristmasAudioEngine();
