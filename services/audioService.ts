class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;
  private schedulerTimer: number | null = null;
  private tempo = 110;
  private lookahead = 25.0; // ms
  private scheduleAheadTime = 0.1; // s
  private nextNoteTime = 0.0;
  private currentNote = 0;
  private notesInQueue: { note: number; time: number }[] = [];

  // "Sneaky" Minor Pentatonic Sequence (C Minor)
  // C4, Eb4, F4, G4, Bb4
  private melody = [
    261.63, 0, 311.13, 0, 392.00, 0, 311.13, 0,
    261.63, 261.63, 466.16, 0, 392.00, 0, 0, 0
  ];

  private bassLine = [
    130.81, 0, 0, 0, 196.00, 0, 0, 0,
    130.81, 0, 0, 0, 155.56, 0, 196.00, 0
  ];

  constructor() {}

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.isMuted;
  }

  startMusic() {
    if (this.isMuted || this.isPlaying || !this.ctx) return;
    this.isPlaying = true;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.currentNote = 0;
    this.scheduler();
  }

  stopMusic() {
    this.isPlaying = false;
    if (this.schedulerTimer) {
      window.clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  private scheduler() {
    if (!this.ctx) return;
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentNote, this.nextNoteTime);
      this.nextNote();
    }
    this.schedulerTimer = window.setTimeout(() => this.scheduler(), this.lookahead);
  }

  private nextNote() {
    const secondsPerBeat = 60.0 / this.tempo;
    this.nextNoteTime += 0.25 * secondsPerBeat; // 16th notes
    this.currentNote = (this.currentNote + 1) % 16;
  }

  private scheduleNote(beatNumber: number, time: number) {
    if (!this.ctx) return;

    // Bass
    const bassFreq = this.bassLine[beatNumber];
    if (bassFreq > 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = bassFreq;
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
      osc.start(time);
      osc.stop(time + 0.5);
    }

    // Melody (Pizzicato Strings style)
    const noteFreq = this.melody[beatNumber];
    if (noteFreq > 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine'; // Sine with fast decay sounds like plucked string
      osc.frequency.value = noteFreq;
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      gain.gain.setValueAtTime(0.05, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      osc.start(time);
      osc.stop(time + 0.15);
    }
  }

  // SFX
  playMove() {
    if (this.isMuted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playWin() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.05, now + i*0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i*0.1 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i*0.1);
        osc.stop(now + i*0.1 + 0.3);
    });
  }

  playLose() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(50, now + 0.5);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  }
}

export const audioService = new AudioService();
