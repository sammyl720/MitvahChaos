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
}), LevelSchema.parse({
  number: 3,
  name: 'The Speedy Shliach',
  world: 1,
  hint: 'Borrow FAST from the delivery bot, weave through the street maze, and bring the package to Yanky!',
  entities: [
    { id: 'player', kind: 'bandit', label: 'YOU', x: 195, y: 500, stickers: [], behavior: 'idle' },
    { id: 'courier-bot', kind: 'robot', label: 'DELIVERY BOT', x: 82, y: 500, stickers: ['FAST'], behavior: 'idle' },
    { id: 'mail-crate', kind: 'crate', label: 'MAIL CRATE', x: 300, y: 348, stickers: [], behavior: 'idle' }
  ],
  goals: [{ id: 'fast-lane', x: 195, y: 500, radius: 38, targetId: 'player', requires: ['FAST'], label: 'FAST LANE' }],
  fixtures: [
    { kind: 'wall', x: 125, y: 375, w: 180, h: 14 },
    { kind: 'wall', x: 270, y: 285, w: 180, h: 14 },
    { kind: 'wall', x: 130, y: 205, w: 160, h: 14 },
    { kind: 'gate', x: 195, y: 126, w: 348, h: 16, opensAfter: 1 }
  ],
  treasure: { x: 322, y: 541 },
  gem: { x: 61, y: 267 },
  exit: { x: 195, y: 70 },
  par: 1,
  solution: [{ source: 'courier-bot', target: 'player', sticker: 'FAST' }],
  mission: {
    kind: 'delivery',
    items: [{ x: 319, y: 437 }],
    itemName: 'package',
    stationLabel: 'DROP OFF',
    station: { x: 314, y: 178 },
    npc: { x: 352, y: 240, name: 'YANKY', greeting: 'Nu, can you bring this package through the maze?', thanks: 'That was quick! The family has what they need.' }
  }
}), LevelSchema.parse({
  number: 4,
  name: 'Kingston Avenue Mix-Up',
  world: 1,
  hint: 'Make the barrier TINY, give the supply cart HEAVY, then check on both neighbors!',
  entities: [
    { id: 'player', kind: 'bandit', label: 'YOU', x: 193, y: 510, stickers: [], behavior: 'idle' },
    { id: 'little-bot', kind: 'robot', label: 'LITTLE BOT', x: 75, y: 487, stickers: ['TINY'], behavior: 'idle' },
    { id: 'street-barrier', kind: 'crate', label: 'BARRIER', x: 126, y: 288, stickers: [], behavior: 'idle' },
    { id: 'weighty-rock', kind: 'boulder', label: 'WEIGHTY ROCK', x: 317, y: 486, stickers: ['HEAVY'], behavior: 'idle' },
    { id: 'supply-cart', kind: 'crate', label: 'SUPPLY CART', x: 263, y: 288, stickers: [], behavior: 'idle' }
  ],
  goals: [
    { id: 'clear-sidewalk', x: 126, y: 288, radius: 38, targetId: 'street-barrier', requires: ['TINY'], label: 'CLEAR PATH' },
    { id: 'steady-cart', x: 263, y: 288, radius: 38, targetId: 'supply-cart', requires: ['HEAVY'], label: 'STEADY CART' }
  ],
  goalOrder: 'sequential',
  fixtures: [
    { kind: 'wall', x: 195, y: 299, w: 14, h: 114 },
    { kind: 'gate', x: 195, y: 390, w: 348, h: 16, opensAfter: 1 },
    { kind: 'gate', x: 195, y: 190, w: 348, h: 16, opensAfter: 2 }
  ],
  treasure: { x: 66, y: 548 },
  gem: { x: 329, y: 345 },
  exit: { x: 195, y: 70 },
  par: 2,
  solution: [
    { source: 'little-bot', target: 'street-barrier', sticker: 'TINY' },
    { source: 'weighty-rock', target: 'supply-cart', sticker: 'HEAVY' }
  ],
  mission: {
    kind: 'neighbors',
    people: [
      { x: 66, y: 322, name: 'LEAH', greeting: 'The barrier is in my way. Can you shrink it?', thanks: 'Ah, the sidewalk is clear. Thanks for helping!', needsGoal: 0 },
      { x: 330, y: 139, name: 'MOSHE', greeting: 'That supply cart keeps sliding. It needs some weight!', thanks: 'The cart is steady. Now we can bring everything inside!', needsGoal: 1 }
    ]
  }
}), LevelSchema.parse({
  number: 5,
  name: 'The Great Challah Avalanche',
  world: 1,
  hint: 'Shrink the giant loaf, make it bounce into the catch lane, and steady the brake crate. Then help Dovi gather napkins!',
  entities: [
    { id: 'player', kind: 'bandit', label: 'YOU', x: 195, y: 514, stickers: [], behavior: 'idle' },
    { id: 'challah-boss', kind: 'challah', label: 'GIANT LOAF', x: 78, y: 312, stickers: ['BIG'], behavior: 'idle' },
    { id: 'catch-cart', kind: 'crate', label: 'CATCH CART', x: 300, y: 312, stickers: [], behavior: 'idle' },
    { id: 'spring-chick', kind: 'chicken', label: 'SPRING CHICK', x: 74, y: 478, stickers: ['BOUNCY'], behavior: 'idle' },
    { id: 'brake-rock', kind: 'boulder', label: 'BRAKE ROCK', x: 315, y: 478, stickers: ['HEAVY'], behavior: 'idle' },
    { id: 'brake-crate', kind: 'crate', label: 'BRAKE CRATE', x: 195, y: 240, stickers: [], behavior: 'idle' },
    { id: 'rolling-loaf', kind: 'challah', label: 'ROLLING LOAF', x: 325, y: 358, stickers: ['FAST'], behavior: 'patrol' }
  ],
  goals: [
    { id: 'catch-giant', x: 300, y: 312, radius: 38, targetId: 'catch-cart', requires: ['BIG'], label: 'CATCH LOAF' },
    { id: 'bounce-loaf', x: 78, y: 312, radius: 48, targetId: 'challah-boss', requires: ['BOUNCY'], label: 'BOUNCE LANE' },
    { id: 'steady-brake', x: 195, y: 240, radius: 38, targetId: 'brake-crate', requires: ['HEAVY'], label: 'BRAKE' }
  ],
  goalOrder: 'sequential',
  bossId: 'challah-boss',
  fixtures: [
    { kind: 'wall', x: 195, y: 322, w: 12, h: 98 },
    { kind: 'gate', x: 195, y: 405, w: 348, h: 16, opensAfter: 2 },
    { kind: 'gate', x: 195, y: 135, w: 348, h: 16, opensAfter: 3 }
  ],
  treasure: { x: 66, y: 548 },
  gem: { x: 337, y: 285 },
  exit: { x: 195, y: 70 },
  par: 3,
  solution: [
    { source: 'challah-boss', target: 'catch-cart', sticker: 'BIG' },
    { source: 'spring-chick', target: 'challah-boss', sticker: 'BOUNCY' },
    { source: 'brake-rock', target: 'brake-crate', sticker: 'HEAVY' }
  ],
  mission: {
    kind: 'delivery',
    items: [{ x: 65, y: 221 }, { x: 257, y: 218 }],
    itemName: 'napkins',
    stationLabel: 'BAKER',
    station: { x: 310, y: 229 },
    npc: { x: 350, y: 183, name: 'DOVI', greeting: 'The loaves are rolling! Can you help me set the community table?', thanks: 'The loaves are safe, and the table is ready. What a team!' }
  }
})];

export function getLevel(number: number): Level {
  const level = LEVELS.find((item) => item.number === number);
  if (!level) throw new Error(`Level ${number} has not been released`);
  return level;
}
