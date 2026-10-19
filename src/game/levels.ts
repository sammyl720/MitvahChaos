import { LevelSchema, type Level } from './model';

export const WORLD_NAMES = ['Crown Heights Chaos', 'Shtetl Shenanigans', 'Yom Tov Mayhem', 'Shlichus Around the World'] as const;
export const WORLD_ICONS = ['🏙️', '🏘️', '🎉', '🌍'] as const;

// Each released level has its own layout and verified mitzvah interaction.
export const LEVELS: Level[] = [LevelSchema.parse({
  number: 1,
  name: 'The Runaway Pushka',
  world: 1,
  hint: 'Give yourself MAGNETIC, gather three coins, then bring them to the pushka!',
  entities: [
    { id: 'player', kind: 'bandit', label: 'YOU', x: 193, y: 495, stickers: [], behavior: 'idle' },
    { id: 'magnet-bot', kind: 'robot', label: 'MAGNET BOT', x: 86, y: 280, stickers: ['MAGNETIC'], behavior: 'idle' },
    { id: 'challah-cart', kind: 'crate', label: 'CART', x: 294, y: 255, stickers: [], behavior: 'idle' }
  ],
  goals: [{ id: 'magnet-ready', x: 193, y: 495, radius: 38, targetId: 'player', requires: ['MAGNETIC'], label: 'MAGNET POWER' }],
  fixtures: [
    { kind: 'wall', x: 123, y: 297, w: 16, h: 114 },
    { kind: 'wall', x: 266, y: 297, w: 16, h: 114 },
    { kind: 'gate', x: 195, y: 135, w: 348, h: 16, opensAfter: 1 }
  ],
  treasure: { x: 66, y: 536 },
  gem: { x: 330, y: 197 },
  exit: { x: 195, y: 70 },
  par: 1,
  solution: [{ source: 'magnet-bot', target: 'player', sticker: 'MAGNETIC' }],
  mission: {
    kind: 'tzedakah',
    coins: [{ x: 65, y: 417 }, { x: 313, y: 389 }, { x: 199, y: 206 }],
    station: { x: 307, y: 493 },
    npc: { x: 351, y: 428, name: 'RIVKY', greeting: 'Oy vey! The pushka coins rolled away. Can you help?', thanks: 'You found them! Every coin can help someone.' }
  }
}), LevelSchema.parse({
  number: 2,
  name: 'Challahzilla!',
  world: 1,
  hint: 'Peel BIG from the giant challah and give it to the bridge crate. Then deliver the tablecloth!',
  entities: [
    { id: 'player', kind: 'bandit', label: 'YOU', x: 193, y: 495, stickers: [], behavior: 'idle' },
    { id: 'giant-challah', kind: 'challah', label: 'CHALLAHZILLA', x: 86, y: 246, stickers: ['BIG'], behavior: 'idle' },
    { id: 'bridge-crate', kind: 'crate', label: 'BRIDGE CRATE', x: 294, y: 246, stickers: [], behavior: 'idle' }
  ],
  goals: [{ id: 'bridge-lift', x: 294, y: 246, radius: 38, targetId: 'bridge-crate', requires: ['BIG'], label: 'BRIDGE LIFT' }],
  fixtures: [
    { kind: 'wall', x: 195, y: 324, w: 168, h: 18 },
    { kind: 'gate', x: 195, y: 148, w: 348, h: 16, opensAfter: 1 }
  ],
  treasure: { x: 67, y: 542 },
  gem: { x: 331, y: 196 },
  exit: { x: 195, y: 70 },
  par: 1,
  solution: [{ source: 'giant-challah', target: 'bridge-crate', sticker: 'BIG' }],
  mission: {
    kind: 'delivery',
    items: [{ x: 66, y: 415 }],
    itemName: 'tablecloth',
    stationLabel: 'FAMILY',
    station: { x: 307, y: 494 },
    npc: { x: 351, y: 428, name: 'MIRIAM', greeting: 'The Shabbos table needs its cloth. Can you bring it?', thanks: 'Thank you! Now the table is ready.' }
  }
})];

export function getLevel(number: number): Level {
  const level = LEVELS.find((item) => item.number === number);
  if (!level) throw new Error(`Level ${number} has not been released`);
  return level;
}
