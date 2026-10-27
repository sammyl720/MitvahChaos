let context: AudioContext | null = null;
let musicTimer: number | null = null;
let musicStep = 0;
let musicPaused = false;
let musicVolume = 0;
function getContext(): AudioContext | null {
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume();
    return context;
  } catch { return null; }
}
export type SoundName = 'peel' | 'attach' | 'invalid' | 'treasure' | 'gem' | 'goal' | 'win' | 'bounce' | 'door' | 'grow' | 'shrink' | 'collision' | 'achievement' | 'boss';
const notes: Record<SoundName, [number, number, OscillatorType]> = {
  peel: [480, 0.10, 'triangle'], attach: [720, 0.16, 'sine'], invalid: [190, 0.2, 'sawtooth'], treasure: [880, 0.24, 'sine'], gem: [1180, 0.25, 'sine'], goal: [630, 0.23, 'triangle'], win: [990, 0.38, 'sine'], bounce: [360, 0.10, 'sine'], door: [520, 0.26, 'square'], grow: [460, 0.28, 'sine'], shrink: [760, 0.24, 'triangle'], collision: [135, 0.1, 'triangle'], achievement: [1045, 0.4, 'sine'], boss: [215, 0.35, 'sawtooth']
};
export function playSound(name: SoundName, volume: number): void {
  if (volume <= 0) return;
  const ctx = getContext(); if (!ctx) return;
  const [frequency, duration, type] = notes[name];
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  if (name === 'peel') oscillator.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + duration);
  if (name === 'win') oscillator.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + duration);
  if (name === 'grow') oscillator.frequency.exponentialRampToValueAtTime(920, ctx.currentTime + duration);
  if (name === 'shrink') oscillator.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + duration);
  if (name === 'boss') oscillator.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + duration);
  gain.gain.setValueAtTime(Math.min(0.16, volume * 0.18), ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(); oscillator.stop(ctx.currentTime + duration);
}

interface WorldTheme {
  stepMs: number;
  lead: OscillatorType;
  gate: number;
  melody: (number | null)[];
  bass: number[];
  harmony: [number, number][];
  responseVoice: OscillatorType;
  responseGate: number;
  response: Readonly<Record<number, number>>;
}

// Four original four-bar themes. Notes are MIDI pitches; nulls leave room for the accompaniment.
const worldThemes: WorldTheme[] = [
  {
    stepMs: 270, lead: 'triangle', gate: .83,
    melody: [72,76,79,null,76,74,72,null,74,77,81,79,77,76,74,null,76,79,84,null,81,79,77,null,76,74,72,74,76,79,72,null],
    bass: [48,55,53,55,48,57,53,55],
    harmony: [[60,64],[59,62],[60,65],[59,62]],
    responseVoice: 'sine', responseGate: .56,
    response: {3:67,7:64,11:74,15:67,19:72,23:69,27:67,31:74}
  },
  {
    stepMs: 310, lead: 'sine', gate: .94,
    melody: [74,null,77,76,74,72,69,null,72,74,77,81,79,77,76,null,74,77,81,84,81,79,77,null,76,74,72,69,72,74,69,null],
    bass: [50,45,46,48,50,53,46,45],
    harmony: [[62,65],[60,65],[58,62],[61,64]],
    responseVoice: 'triangle', responseGate: .72,
    response: {1:69,7:65,15:65,19:65,23:62,27:68,31:64}
  },
  {
    stepMs: 235, lead: 'triangle', gate: .68,
    melody: [79,81,83,86,83,81,79,null,81,83,86,88,86,83,81,null,79,83,86,91,88,86,83,null,81,79,76,79,81,83,79,null],
    bass: [55,50,48,50,55,52,48,50],
    harmony: [[67,71],[66,69],[64,67],[66,69]],
    responseVoice: 'square', responseGate: .42,
    response: {3:74,7:71,11:74,15:69,19:76,23:72,27:74,31:69}
  },
  {
    stepMs: 250, lead: 'sine', gate: .78,
    melody: [81,83,85,88,85,83,81,null,78,81,83,85,83,81,78,null,81,85,88,90,88,85,83,null,81,78,76,78,81,83,85,null],
    bass: [57,52,54,50,57,54,50,52],
    harmony: [[69,73],[68,71],[66,69],[68,71]],
    responseVoice: 'sine', responseGate: .9,
    response: {3:76,7:73,11:71,15:71,19:76,23:69,27:71,31:68}
  }
];

function musicNote(frequency: number, volume: number, type: OscillatorType = 'triangle', duration = .26, strength = .035): void {
  const ctx = getContext(); if (!ctx || volume <= 0) return;
  const oscillator = ctx.createOscillator(); const gain = ctx.createGain();
  oscillator.type = type; oscillator.frequency.value = frequency;
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(.0002, volume * strength), now + .025);
  gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
  oscillator.connect(gain).connect(ctx.destination); oscillator.start(now); oscillator.stop(now + duration + .01);
}
function pitch(note: number): number { return 440 * 2 ** ((note - 69) / 12); }

export function startMusic(world: number, volume: number): void {
  stopMusic(); musicStep = 0; musicPaused = false; musicVolume = volume;
  const theme = worldThemes[Math.max(0,Math.min(worldThemes.length - 1,world - 1))];
  musicTimer = window.setInterval(() => {
    if (musicPaused || musicVolume <= 0) return;
    const step = musicStep % theme.melody.length;
    const note = theme.melody[step];
    if (note !== null) musicNote(pitch(note),musicVolume,theme.lead,theme.stepMs * theme.gate / 1000,.03);
    const response = theme.response[step];
    if (response !== undefined) musicNote(pitch(response),musicVolume,theme.responseVoice,theme.stepMs * theme.responseGate / 1000,theme.responseVoice === 'square' ? .007 : .012);
    if (step % 4 === 0) musicNote(pitch(theme.bass[step / 4]),musicVolume,'triangle',theme.stepMs * 3.4 / 1000,.018);
    if (step % 8 === 0) {
      const chord = theme.harmony[step / 8];
      musicNote(pitch(chord[0]),musicVolume,'sine',theme.stepMs * 6.8 / 1000,.008);
      musicNote(pitch(chord[1]),musicVolume,'sine',theme.stepMs * 6.8 / 1000,.008);
    }
    musicStep++;
  }, theme.stepMs);
}
// A short original melody for the final gathering, played with the same local synthesizer.
const celebrationMelody = [523, 659, 784, 1047, 988, 784, 659, 698, 784, 880, 1047, 1175, 1047, 880, 784, 659];
export function startCelebrationMusic(volume: number): void {
  stopMusic(); musicStep = 0; musicPaused = false; musicVolume = volume;
  musicTimer = window.setInterval(() => {
    if (musicPaused) return;
    const note = celebrationMelody[musicStep % celebrationMelody.length];
    musicNote(note, musicVolume * 1.15);
    if (musicStep % 2 === 0) musicNote(note / 2, musicVolume * .45);
    musicStep++;
  }, 245);
}
export function setMusicPaused(value: boolean): void { musicPaused = value; }
export function setMusicVolume(value: number): void { musicVolume = value; }
export function stopMusic(): void { if (musicTimer !== null) window.clearInterval(musicTimer); musicTimer = null; }
