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
}), LevelSchema.parse({
  number: 6,
  name: 'The Runaway Wagon',
  world: 2,
  hint: 'Make the wagon HEAVY, then SLIPPERY. Watch it glide into the catch switch before bringing flour to the kitchen!',
  entities: [
    { id: 'player', kind: 'bandit', label: 'YOU', x: 195, y: 511, stickers: [], behavior: 'idle' },
    { id: 'wagon', kind: 'wagon', label: 'WAGON', x: 122, y: 302, stickers: [], behavior: 'idle' },
    { id: 'weight-rock', kind: 'boulder', label: 'WEIGHT ROCK', x: 315, y: 495, stickers: ['HEAVY'], behavior: 'idle' },
    { id: 'slick-snail', kind: 'snail', label: 'SLICK SNAIL', x: 76, y: 495, stickers: ['SLIPPERY'], behavior: 'idle' }
  ],
  goals: [
    { id: 'weigh-wagon', x: 122, y: 302, radius: 38, targetId: 'wagon', requires: ['HEAVY'], minMass: 7, label: 'WEIGH WAGON' },
    { id: 'catch-wagon', x: 296, y: 302, radius: 30, targetId: 'wagon', requires: ['HEAVY', 'SLIPPERY'], minSpeed: 100, label: 'CATCH SWITCH' }
  ],
  goalOrder: 'sequential',
  fixtures: [
    { kind: 'wall', x: 195, y: 262, w: 200, h: 12 },
    { kind: 'wall', x: 195, y: 342, w: 200, h: 12 },
    { kind: 'gate', x: 195, y: 405, w: 348, h: 16, opensAfter: 1 },
    { kind: 'gate', x: 195, y: 136, w: 348, h: 16, opensAfter: 2 }
  ],
  treasure: { x: 66, y: 547 },
  gem: { x: 327, y: 251 },
  exit: { x: 195, y: 70 },
  par: 2,
  solution: [
    { source: 'weight-rock', target: 'wagon', sticker: 'HEAVY' },
    { source: 'slick-snail', target: 'wagon', sticker: 'SLIPPERY' }
  ],
  mission: {
    kind: 'delivery',
    items: [{ x: 65, y: 206 }, { x: 260, y: 205 }],
    itemName: 'flour sacks',
    stationLabel: 'KITCHEN',
    station: { x: 312, y: 207 },
    npc: { x: 351, y: 249, name: 'GOLDA', greeting: 'The wagon brought flour. Can you carry the sacks into our kitchen?', thanks: 'The flour is in! Now the village can bake together.' }
  }
}), LevelSchema.parse({
  number: 7,
  name: 'Chicken Soup Catastrophe',
  world: 2,
  hint: 'Shrink the crate blocking the kitchen, steady the soup shelf, then carry both supplies around the spill to the pot!',
  entities: [
    { id: 'player', kind: 'bandit', label: 'YOU', x: 194, y: 517, stickers: [], behavior: 'idle' },
    { id: 'tiny-chick', kind: 'chicken', label: 'TINY CHICK', x: 73, y: 496, stickers: ['TINY'], behavior: 'idle' },
    { id: 'kitchen-crate', kind: 'crate', label: 'BLOCKING CRATE', x: 118, y: 308, stickers: [], behavior: 'idle' },
    { id: 'stone-press', kind: 'boulder', label: 'STONE PRESS', x: 312, y: 483, stickers: ['HEAVY'], behavior: 'idle' },
    { id: 'soup-shelf', kind: 'crate', label: 'SOUP SHELF', x: 278, y: 309, stickers: [], behavior: 'idle' }
  ],
  goals: [
    { id: 'clear-kitchen', x: 118, y: 308, radius: 38, targetId: 'kitchen-crate', requires: ['TINY'], label: 'CLEAR KITCHEN' },
    { id: 'steady-shelf', x: 278, y: 309, radius: 38, targetId: 'soup-shelf', requires: ['HEAVY'], minMass: 5, label: 'STEADY SHELF' }
  ],
  goalOrder: 'sequential',
  fixtures: [
    { kind: 'wall', x: 197, y: 314, w: 14, h: 96 },
    { kind: 'gate', x: 195, y: 401, w: 348, h: 16, opensAfter: 1 },
    { kind: 'gate', x: 195, y: 137, w: 348, h: 16, opensAfter: 2 }
  ],
  treasure: { x: 66, y: 546 },
  gem: { x: 327, y: 263 },
  exit: { x: 195, y: 70 },
  par: 2,
  solution: [
    { source: 'tiny-chick', target: 'kitchen-crate', sticker: 'TINY' },
    { source: 'stone-press', target: 'soup-shelf', sticker: 'HEAVY' }
  ],
  mission: {
    kind: 'delivery',
    items: [{ x: 68, y: 464 }, { x: 316, y: 425 }],
    itemName: 'soup supplies',
    stationLabel: 'SOUP POT',
    station: { x: 314, y: 213 },
    fragileZone: { x: 195, y: 363, w: 74, h: 43 },
    npc: { x: 350, y: 263, name: 'BASYA', greeting: 'The kitchen is blocked and the soup supplies could spill. Can you clear a safe path?', thanks: 'The supplies made it safely! Now everyone can share warm soup.' }
  }
}), LevelSchema.parse({
  number: 8,
  name: 'The Tiny Shtetl',
  world: 2,
  hint: 'Borrow TINY to squeeze through the little passage. Stand on the inside switch, then give the model mechanism MAGNETIC!',
  entities: [
    { id: 'player', kind: 'bandit', label: 'YOU', x: 195, y: 510, stickers: [], behavior: 'idle' },
    { id: 'tiny-snail', kind: 'snail', label: 'TINY SNAIL', x: 73, y: 492, stickers: ['TINY'], behavior: 'idle' },
    { id: 'magnet-bot', kind: 'robot', label: 'MAGNET BOT', x: 315, y: 492, stickers: ['MAGNETIC'], behavior: 'idle' },
    { id: 'model-switch', kind: 'crate', label: 'MODEL SWITCH', x: 195, y: 232, stickers: [], behavior: 'idle' }
  ],
  goals: [
    { id: 'tiny-passage', x: 195, y: 320, radius: 22, targetId: 'player', requires: ['TINY'], label: 'TINY PASSAGE' },
    { id: 'model-magnet', x: 195, y: 232, radius: 38, targetId: 'model-switch', requires: ['MAGNETIC'], minMagneticRadius: 100, label: 'MODEL MECHANISM' }
  ],
  goalOrder: 'sequential',
  fixtures: [
    { kind: 'wall', x: 100, y: 362, w: 160, h: 18 },
    { kind: 'wall', x: 290, y: 362, w: 160, h: 18 },
    { kind: 'gate', x: 195, y: 132, w: 348, h: 16, opensAfter: 2 }
  ],
  treasure: { x: 66, y: 547 },
  gem: { x: 328, y: 301 },
  exit: { x: 195, y: 70 },
  par: 2,
  solution: [
    { source: 'tiny-snail', target: 'player', sticker: 'TINY' },
    { source: 'magnet-bot', target: 'model-switch', sticker: 'MAGNETIC' }
  ],
  mission: {
    kind: 'neighbors',
    people: [{ x: 315, y: 215, name: 'TOVA', greeting: 'Our little village model has stopped moving. Can you reach its tiny switch?', thanks: 'The model moves again! The children will love seeing our village.' , needsGoal: 1 }]
  }
}), LevelSchema.parse({
  number: 9,
  name: 'The Floating Bridge',
  world: 2,
  hint: 'Float the supply raft, then borrow FLOATING for yourself. Cross the stream and bring both parcels to Reizel!',
  entities: [
    { id: 'player', kind: 'bandit', label: 'YOU', x: 195, y: 519, stickers: [], behavior: 'idle' },
    { id: 'supply-raft', kind: 'wagon', label: 'SUPPLY RAFT', x: 195, y: 445, stickers: [], behavior: 'idle' },
    { id: 'float-turtle', kind: 'turtle', label: 'FLOAT TURTLE', x: 72, y: 500, stickers: ['FLOATING'], behavior: 'idle' },
    { id: 'float-frog', kind: 'frog', label: 'FLOAT FROG', x: 316, y: 500, stickers: ['FLOATING'], behavior: 'idle' }
  ],
  goals: [
    { id: 'float-raft', x: 195, y: 445, radius: 38, targetId: 'supply-raft', requires: ['FLOATING'], label: 'FLOAT RAFT' },
    { id: 'north-bank', x: 195, y: 270, radius: 35, targetId: 'player', requires: ['FLOATING'], label: 'NORTH BANK' }
  ],
  goalOrder: 'sequential',
  fixtures: [
    { kind: 'hazard', x: 195, y: 360, w: 350, h: 75 },
    { kind: 'gate', x: 195, y: 133, w: 348, h: 16, opensAfter: 2 }
  ],
  treasure: { x: 66, y: 550 },
  gem: { x: 63, y: 234 },
  exit: { x: 195, y: 70 },
  par: 2,
  solution: [
    { source: 'float-turtle', target: 'supply-raft', sticker: 'FLOATING' },
    { source: 'float-frog', target: 'player', sticker: 'FLOATING' }
  ],
  mission: {
    kind: 'delivery',
    items: [{ x: 65, y: 445 }, { x: 318, y: 443 }],
    itemName: 'village supplies',
    stationLabel: 'FAR BANK',
    station: { x: 309, y: 212 },
    npc: { x: 350, y: 261, name: 'REIZEL', greeting: 'The stream is up! Can you float the supplies to our side?', thanks: 'You crossed safely with everything we needed. Thank you!' }
  }
})];

export function getLevel(number: number): Level {
  const level = LEVELS.find((item) => item.number === number);
  if (!level) throw new Error(`Level ${number} has not been released`);
  return level;
}
