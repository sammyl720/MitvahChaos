import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

test('world music has distinct voices and obeys pause, volume, and stop', async () => {
  const frequencies: number[] = [];
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
        start: () => { frequencies.push(oscillator.frequency.value); },
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
  tick();
  const firstWorld = [...frequencies];
  expect(firstWorld.length).toBeGreaterThan(1);
  audio.setMusicPaused(true);
  tick();
  expect(frequencies).toEqual(firstWorld);
  audio.setMusicPaused(false);
  audio.setMusicVolume(0);
  tick();
  expect(frequencies).toEqual(firstWorld);
  audio.startMusic(2, .5);
  tick();
  expect(frequencies.slice(firstWorld.length,firstWorld.length * 2)).not.toEqual(firstWorld);
  audio.stopMusic();
  expect(clearInterval).toHaveBeenCalled();
});
