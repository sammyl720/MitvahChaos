import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

test('world music has distinct voices and obeys pause, volume, and stop', async () => {
  const frequencies: number[] = [];
  const voices: string[] = [];
  let tick = () => {};
  const clearInterval = vi.fn();
  vi.stubGlobal('window', {
    setInterval: (callback: () => void) => { tick = callback; return 1; },
    clearInterval
  });
  vi.stubGlobal('AudioContext', class {
    state = 'running';
    currentTime = 0;
    destination = {};
    createOscillator() {
      const oscillator = {
        type: 'sine', frequency: {value:0},
        connect: () => oscillator,
        start: () => { frequencies.push(oscillator.frequency.value); voices.push(oscillator.type); },
        stop: () => {}
      };
      return oscillator;
    }
    createGain() {
      const gain = {
        gain: {setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}},
        connect: () => gain
      };
      return gain;
    }
  });
  const audio = await import('../src/game/audio');
  audio.startMusic(1, .5);
  for (let step = 0; step < 8; step++) tick();
  const firstWorld = [...frequencies];
  expect(firstWorld.length).toBeGreaterThan(8);
  audio.setMusicPaused(true);
  tick();
  expect(frequencies).toEqual(firstWorld);
  audio.setMusicPaused(false);
  audio.setMusicVolume(0);
  tick();
  expect(frequencies).toEqual(firstWorld);
  const worldPhrases = [firstWorld];
  for (const world of [2,3,4]) {
    const start = frequencies.length;
    audio.startMusic(world, .5);
    for (let step = 0; step < 8; step++) tick();
    worldPhrases.push(frequencies.slice(start));
  }
  expect(new Set(worldPhrases.map((phrase) => phrase.join(','))).size).toBe(4);
  expect(voices).toContain('square');
  audio.stopMusic();
  expect(clearInterval).toHaveBeenCalled();
});

test('mission chime distinguishes a handoff from completing the task and respects mute', async () => {
  const notes: number[] = [];
  const peaks: number[] = [];
  vi.stubGlobal('AudioContext', class {
    state = 'running';
    currentTime = 0;
    destination = {};
    createOscillator() {
      const oscillator = {
        type: 'sine',
        frequency: { setValueAtTime: (frequency: number) => notes.push(frequency) },
        connect: () => oscillator,
        start: () => {},
        stop: () => {}
      };
      return oscillator;
    }
    createGain() {
      const gain = {
        gain: {
          setValueAtTime: () => {},
          exponentialRampToValueAtTime: (value: number) => peaks.push(value)
        },
        connect: () => gain
      };
      return gain;
    }
  });
  const audio = await import('../src/game/audio');
  audio.playMissionSound(0, true);
  expect(notes).toEqual([]);
  audio.playMissionSound(.5, false);
  expect(notes).toEqual([659, 880]);
  audio.playMissionSound(.5, true);
  expect(notes.slice(2)).toEqual([659, 784, 1047]);
  expect(Math.max(...peaks)).toBeLessThanOrEqual(.09);
});
