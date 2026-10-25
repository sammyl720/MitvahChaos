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
  hint: 'Make the barrier TINY and pick up Leah’s supply bundle. Give the cart HEAVY, then bring the bundle to Moshe!',
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
      { x: 66, y: 322, name: 'LEAH', greeting: 'Please shrink the barrier so I can pass you a supply bundle for Moshe.', thanks: 'The sidewalk is clear, and the supply bundle is ready for Moshe. Thank you!', needsGoal: 0 },
      { x: 330, y: 139, name: 'MOSHE', greeting: 'Please steady the cart and bring me Leah’s supply bundle.', thanks: 'Leah’s bundle reached the steady cart. Now we can bring everything inside!', needsGoal: 1 }
    ],
    handoff: { from: 0, to: 1, itemName: 'bundle' }
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
}), LevelSchema.parse({
  number: 10,
  name: 'The Great Wagon Rescue',
  world: 2,
  hint: 'Float the stalled wagon, make the tow anchor HEAVY, then give the wagon SLIPPERY to slide through the mud!',
  entities: [
    { id: 'player', kind: 'bandit', label: 'YOU', x: 195, y: 521, stickers: [], behavior: 'idle' },
    { id: 'stalled-wagon', kind: 'wagon', label: 'STALLED WAGON', x: 73, y: 300, stickers: [], behavior: 'idle' },
    { id: 'float-turtle', kind: 'turtle', label: 'FLOAT TURTLE', x: 70, y: 510, stickers: ['FLOATING'], behavior: 'idle' },
    { id: 'tow-anchor', kind: 'crate', label: 'TOW ANCHOR', x: 300, y: 470, stickers: [], behavior: 'idle' },
    { id: 'weight-rock', kind: 'boulder', label: 'WEIGHT ROCK', x: 315, y: 532, stickers: ['HEAVY'], behavior: 'idle' },
    { id: 'slick-snail', kind: 'snail', label: 'SLICK SNAIL', x: 195, y: 452, stickers: ['SLIPPERY'], behavior: 'idle' }
  ],
  goals: [
    { id: 'float-wagon', x: 73, y: 300, radius: 38, targetId: 'stalled-wagon', requires: ['FLOATING'], label: 'FLOAT WAGON' },
    { id: 'anchor-tow', x: 300, y: 470, radius: 38, targetId: 'tow-anchor', requires: ['HEAVY'], minMass: 7, label: 'ANCHOR TOW' },
    { id: 'rescue-wagon', x: 300, y: 300, radius: 30, targetId: 'stalled-wagon', requires: ['FLOATING', 'SLIPPERY'], minSpeed: 100, label: 'RESCUE PAD' }
  ],
  goalOrder: 'sequential',
  fixtures: [
    { kind: 'hazard', x: 195, y: 300, w: 215, h: 78 },
    { kind: 'gate', x: 195, y: 400, w: 348, h: 16, opensAfter: 2 },
    { kind: 'gate', x: 195, y: 134, w: 348, h: 16, opensAfter: 3 }
  ],
  treasure: { x: 65, y: 551 },
  gem: { x: 64, y: 241 },
  exit: { x: 195, y: 70 },
  par: 3,
  solution: [
    { source: 'float-turtle', target: 'stalled-wagon', sticker: 'FLOATING' },
    { source: 'weight-rock', target: 'tow-anchor', sticker: 'HEAVY' },
    { source: 'slick-snail', target: 'stalled-wagon', sticker: 'SLIPPERY' }
  ],
  mission: {
    kind: 'delivery',
    items: [{ x: 65, y: 436 }, { x: 260, y: 440 }],
    itemName: 'wagon parcels',
    stationLabel: 'FAMILY',
    station: { x: 309, y: 209 },
    npc: { x: 350, y: 259, name: 'SHMUEL', greeting: 'Our delivery wagon is stuck in the mud. Can you rescue it and bring the parcels to the family?', thanks: 'The wagon is free and the parcels arrived. What a helpful team!' }
  }
}), LevelSchema.parse({
  number: 11,
  name: 'Dreidel Disaster',
  world: 3,
  hint: 'Give the giant toy dreidel BOUNCY, then SLIPPERY. Watch it spin toward the game table before helping Chaya decorate!',
  entities: [
    { id: 'player', kind: 'bandit', label: 'YOU', x: 195, y: 520, stickers: [], behavior: 'idle' },
    { id: 'giant-dreidel', kind: 'dreidel', label: 'GIANT DREIDEL', x: 80, y: 310, stickers: ['BIG'], behavior: 'idle' },
    { id: 'bounce-ball', kind: 'ball', label: 'BOUNCE BALL', x: 72, y: 505, stickers: ['BOUNCY'], behavior: 'idle' },
    { id: 'slick-snail', kind: 'snail', label: 'SLICK SNAIL', x: 315, y: 502, stickers: ['SLIPPERY'], behavior: 'idle' }
  ],
  goals: [
    { id: 'dreidel-bounce', x: 80, y: 310, radius: 43, targetId: 'giant-dreidel', requires: ['BIG', 'BOUNCY'], label: 'BOUNCE DREIDEL' },
    { id: 'dreidel-table', x: 302, y: 310, radius: 31, targetId: 'giant-dreidel', requires: ['BIG', 'BOUNCY', 'SLIPPERY'], minSpeed: 100, label: 'GAME TABLE' }
  ],
  goalOrder: 'sequential',
  fixtures: [
    { kind: 'gate', x: 195, y: 406, w: 348, h: 16, opensAfter: 1 },
    { kind: 'gate', x: 195, y: 136, w: 348, h: 16, opensAfter: 2 },
    { kind: 'wall', x: 196, y: 224, w: 28, h: 36 }
  ],
  treasure: { x: 67, y: 550 },
  gem: { x: 67, y: 213 },
  exit: { x: 195, y: 70 },
  par: 2,
  solution: [
    { source: 'bounce-ball', target: 'giant-dreidel', sticker: 'BOUNCY' },
    { source: 'slick-snail', target: 'giant-dreidel', sticker: 'SLIPPERY' }
  ],
  mission: {
    kind: 'delivery',
    items: [{ x: 79, y: 453 }, { x: 303, y: 456 }],
    itemName: 'paper decorations',
    stationLabel: 'GAME TABLE',
    station: { x: 306, y: 208 },
    npc: { x: 349, y: 258, name: 'CHAYA', greeting: 'Our giant toy dreidel is loose! Guide it to the game table, then bring the decorations for our Chanukah gathering.', thanks: 'The table is ready and everyone can play. Thank you!' }
  }
}), LevelSchema.parse({
  number: 12,
  name: 'The Missing Menorah Pieces',
  world: 3,
  hint: 'Borrow TINY to fit through the workshop opening, then MAGNETIC to gather the stored display pieces. Assemble them at Nechama’s table!',
  entities: [
    { id: 'player', kind: 'bandit', label: 'YOU', x: 195, y: 520, stickers: [], behavior: 'idle' },
    { id: 'tiny-snail', kind: 'snail', label: 'TINY SNAIL', x: 72, y: 510, stickers: ['TINY'], behavior: 'idle' },
    { id: 'magnet-bot', kind: 'robot', label: 'MAGNET BOT', x: 315, y: 510, stickers: ['MAGNETIC'], behavior: 'idle' }
  ],
  goals: [
    { id: 'small-opening', x: 195, y: 520, radius: 37, targetId: 'player', requires: ['TINY'], label: 'SMALL OPENING' },
    { id: 'metal-pull', x: 195, y: 520, radius: 37, targetId: 'player', requires: ['TINY', 'MAGNETIC'], minMagneticRadius: 100, label: 'DISPLAY MAGNET' }
  ],
  goalOrder: 'sequential',
  fixtures: [
    { kind: 'gate', x: 195, y: 405, w: 348, h: 16, opensAfter: 1 },
    { kind: 'wall', x: 99, y: 315, w: 156, h: 20 },
    { kind: 'wall', x: 291, y: 315, w: 156, h: 20 },
    { kind: 'gate', x: 195, y: 135, w: 348, h: 16, opensAfter: 2 }
  ],
  treasure: { x: 135, y: 550 },
  gem: { x: 67, y: 212 },
  exit: { x: 195, y: 70 },
  par: 2,
  solution: [
    { source: 'tiny-snail', target: 'player', sticker: 'TINY' },
    { source: 'magnet-bot', target: 'player', sticker: 'MAGNETIC' }
  ],
  mission: {
    kind: 'delivery',
    assembly: true,
    items: [{ x: 75, y: 455 }, { x: 195, y: 252 }, { x: 315, y: 275 }],
    itemName: 'display pieces',
    stationLabel: 'DISPLAY TABLE',
    station: { x: 308, y: 205 },
    npc: { x: 350, y: 261, name: 'NECHAMA', greeting: 'The decorative pieces are safely stored around the workshop. Can you bring them to our Chanukah display table?', thanks: 'Every piece is in place. Thank you for helping us prepare together!' }
  }
}), LevelSchema.parse({
  number: 13,
  name: 'Purim Delivery Dash',
  world: 3,
  hint: 'Borrow FAST, then give the courier cart SLIPPERY to slide through the delivery lane. Bring one mishloach manos package to each neighbor!',
  entities: [
    { id: 'player', kind: 'bandit', label: 'YOU', x: 195, y: 520, stickers: [], behavior: 'idle' },
    { id: 'fast-bot', kind: 'robot', label: 'FAST BOT', x: 70, y: 507, stickers: ['FAST'], behavior: 'idle' },
    { id: 'slick-snail', kind: 'snail', label: 'SLICK SNAIL', x: 316, y: 507, stickers: ['SLIPPERY'], behavior: 'idle' },
    { id: 'courier-cart', kind: 'crate', label: 'COURIER CART', x: 80, y: 325, stickers: [], behavior: 'idle' }
  ],
  goals: [
    { id: 'fast-courier', x: 195, y: 520, radius: 38, targetId: 'player', requires: ['FAST'], label: 'FAST COURIER' },
    { id: 'delivery-lane', x: 300, y: 325, radius: 30, targetId: 'courier-cart', requires: ['SLIPPERY'], minSpeed: 100, label: 'DELIVERY LANE' }
  ],
  goalOrder: 'sequential',
  fixtures: [
    { kind: 'gate', x: 195, y: 400, w: 348, h: 16, opensAfter: 1 },
    { kind: 'wall', x: 195, y: 220, w: 23, h: 73 },
    { kind: 'gate', x: 195, y: 135, w: 348, h: 16, opensAfter: 2 }
  ],
  treasure: { x: 65, y: 551 },
  gem: { x: 321, y: 300 },
  exit: { x: 195, y: 70 },
  par: 2,
  solution: [
    { source: 'fast-bot', target: 'player', sticker: 'FAST' },
    { source: 'slick-snail', target: 'courier-cart', sticker: 'SLIPPERY' }
  ],
  mission: {
    kind: 'deliveries',
    items: [{ x: 68, y: 458 }, { x: 319, y: 458 }],
    itemName: 'mishloach manos package',
    people: [
      { x: 75, y: 226, name: 'ESTI', greeting: 'A Purim package for me? What a kind surprise!', thanks: 'Thank you for sharing Purim joy!' },
      { x: 316, y: 226, name: 'YEHUDA', greeting: 'Can you bring me a Purim package too?', thanks: 'Thank you! Now I can celebrate with my family.' }
    ]
  }
}), LevelSchema.parse({
  number: 14,
  name: 'Matzah Mountain',
  world: 3,
  hint: 'Move BIG from the oversized supply box to the packing cart, then give the box TINY to clear the workshop passage. Bring clean coverings to Rachel!',
  entities: [
    { id: 'player', kind: 'bandit', label: 'YOU', x: 195, y: 520, stickers: [], behavior: 'idle' },
    { id: 'matzah-box', kind: 'crate', label: 'SUPPLY BOX', x: 195, y: 315, stickers: ['BIG'], behavior: 'idle' },
    { id: 'packing-cart', kind: 'wagon', label: 'PACKING CART', x: 305, y: 474, stickers: [], behavior: 'idle' },
    { id: 'tiny-snail', kind: 'snail', label: 'TINY SNAIL', x: 72, y: 508, stickers: ['TINY'], behavior: 'idle' }
  ],
  goals: [
    { id: 'load-cart', x: 305, y: 474, radius: 40, targetId: 'packing-cart', requires: ['BIG'], label: 'LOAD CART' },
    { id: 'clear-passage', x: 195, y: 315, radius: 36, targetId: 'matzah-box', requires: ['TINY'], label: 'CLEAR PASSAGE' }
  ],
  goalOrder: 'sequential',
  fixtures: [
    { kind: 'gate', x: 195, y: 408, w: 348, h: 16, opensAfter: 1 },
    { kind: 'wall', x: 70, y: 315, w: 140, h: 18 },
    { kind: 'wall', x: 320, y: 315, w: 140, h: 18 },
    { kind: 'gate', x: 195, y: 135, w: 348, h: 16, opensAfter: 2 }
  ],
  treasure: { x: 135, y: 550 },
  gem: { x: 67, y: 215 },
  exit: { x: 195, y: 70 },
  par: 2,
  solution: [
    { source: 'matzah-box', target: 'packing-cart', sticker: 'BIG' },
    { source: 'tiny-snail', target: 'matzah-box', sticker: 'TINY' }
  ],
  mission: {
    kind: 'delivery',
    items: [{ x: 68, y: 455 }, { x: 318, y: 273 }],
    itemName: 'clean table coverings',
    stationLabel: 'PREP TABLE',
    station: { x: 309, y: 209 },
    npc: { x: 350, y: 258, name: 'RACHEL', greeting: 'The supply box is blocking our Pesach preparation room. Can you make a path and bring the clean table coverings?', thanks: 'The room is clear and the table is ready. Thank you!' }
  }
}), LevelSchema.parse({
  number: 15,
  name: 'The Great Sukkah Scramble',
  world: 3,
  hint: 'Move BIG onto the supply cart, shrink the blocking box with TINY, and make the support HEAVY. Gather three bundles to finish the sukkah!',
  entities: [
    { id: 'player', kind: 'bandit', label: 'YOU', x: 195, y: 520, stickers: [], behavior: 'idle' },
    { id: 'blocking-box', kind: 'crate', label: 'SUPPLY BOX', x: 195, y: 335, stickers: ['BIG'], behavior: 'idle' },
    { id: 'supply-cart', kind: 'wagon', label: 'SUPPLY CART', x: 75, y: 265, stickers: [], behavior: 'idle' },
    { id: 'tiny-snail', kind: 'snail', label: 'TINY SNAIL', x: 72, y: 510, stickers: ['TINY'], behavior: 'idle' },
    { id: 'support-base', kind: 'boulder', label: 'SUPPORT BASE', x: 306, y: 374, stickers: [], behavior: 'idle' },
    { id: 'weight-rock', kind: 'rock', label: 'WEIGHT ROCK', x: 316, y: 513, stickers: ['HEAVY'], behavior: 'idle' }
  ],
  goals: [
    { id: 'load-supplies', x: 75, y: 265, radius: 39, targetId: 'supply-cart', requires: ['BIG'], label: 'LOAD SUPPLIES' },
    { id: 'clear-site', x: 195, y: 335, radius: 36, targetId: 'blocking-box', requires: ['TINY'], label: 'CLEAR SITE' },
    { id: 'steady-base', x: 306, y: 374, radius: 37, targetId: 'support-base', requires: ['HEAVY'], minMass: 10, label: 'STEADY BASE' }
  ],
  goalOrder: 'sequential',
  fixtures: [
    { kind: 'gate', x: 195, y: 408, w: 348, h: 16, opensAfter: 1 },
    { kind: 'wall', x: 70, y: 335, w: 140, h: 18 },
    { kind: 'wall', x: 320, y: 335, w: 140, h: 18 },
    { kind: 'gate', x: 195, y: 135, w: 348, h: 16, opensAfter: 3 }
  ],
  treasure: { x: 140, y: 551 },
  gem: { x: 65, y: 213 },
  exit: { x: 195, y: 70 },
  par: 3,
  solution: [
    { source: 'blocking-box', target: 'supply-cart', sticker: 'BIG' },
    { source: 'tiny-snail', target: 'blocking-box', sticker: 'TINY' },
    { source: 'weight-rock', target: 'support-base', sticker: 'HEAVY' }
  ],
  mission: {
    kind: 'delivery',
    assembly: true,
    items: [{ x: 65, y: 459 }, { x: 318, y: 455 }, { x: 195, y: 242 }],
    itemName: 'sukkah supply bundle',
    stationLabel: 'BUILD SITE',
    station: { x: 310, y: 209 },
    npc: { x: 350, y: 261, name: 'MALKY', greeting: 'Our sukkah building supplies are scattered. Can you clear the area and help us build the walls before placing the roof slats?', thanks: 'The sukkah is ready for everyone to gather. Thank you for building with us!' }
  }
}), LevelSchema.parse({
  number: 16,
  name: 'The Desert Delivery',
  world: 4,
  hint: 'Give the cargo glider FLOATING, borrow FLOATING for yourself, and make the far-bank anchor HEAVY. Carry the supplies across the dry wadi to Ezra!',
  entities: [
    { id: 'player', kind: 'bandit', label: 'YOU', x: 195, y: 520, stickers: [], behavior: 'idle' },
    { id: 'cargo-glider', kind: 'wagon', label: 'CARGO GLIDER', x: 195, y: 449, stickers: [], behavior: 'idle' },
    { id: 'float-turtle', kind: 'turtle', label: 'FLOAT TURTLE', x: 72, y: 510, stickers: ['FLOATING'], behavior: 'idle' },
    { id: 'float-frog', kind: 'frog', label: 'FLOAT FROG', x: 316, y: 510, stickers: ['FLOATING'], behavior: 'idle' },
    { id: 'far-anchor', kind: 'boulder', label: 'FAR ANCHOR', x: 85, y: 255, stickers: [], behavior: 'idle' },
    { id: 'weight-rock', kind: 'rock', label: 'WEIGHT ROCK', x: 282, y: 460, stickers: ['HEAVY'], behavior: 'idle' }
  ],
  goals: [
    { id: 'float-cargo', x: 195, y: 449, radius: 38, targetId: 'cargo-glider', requires: ['FLOATING'], label: 'FLOAT CARGO' },
    { id: 'cross-wadi', x: 195, y: 520, radius: 38, targetId: 'player', requires: ['FLOATING'], label: 'CROSS WADI' },
    { id: 'steady-anchor', x: 85, y: 255, radius: 38, targetId: 'far-anchor', requires: ['HEAVY'], minMass: 10, label: 'STEADY ANCHOR' }
  ],
  goalOrder: 'sequential',
  fixtures: [
    { kind: 'hazard', x: 195, y: 352, w: 350, h: 94 },
    { kind: 'gate', x: 195, y: 135, w: 348, h: 16, opensAfter: 3 }
  ],
  treasure: { x: 140, y: 551 },
  gem: { x: 65, y: 205 },
  exit: { x: 195, y: 70 },
  par: 3,
  solution: [
    { source: 'float-turtle', target: 'cargo-glider', sticker: 'FLOATING' },
    { source: 'float-frog', target: 'player', sticker: 'FLOATING' },
    { source: 'weight-rock', target: 'far-anchor', sticker: 'HEAVY' }
  ],
  mission: {
    kind: 'delivery',
    items: [{ x: 65, y: 455 }, { x: 305, y: 275 }],
    itemName: 'community supply pack',
    stationLabel: 'WELCOME TENT',
    station: { x: 311, y: 207 },
    npc: { x: 350, y: 265, name: 'EZRA', greeting: 'Our community supplies are on both sides of the dry wadi. Can you float across and bring them to the welcome tent?', thanks: 'Everything arrived safely. Now our visitors have what they need!' }
  }
}), LevelSchema.parse({
  number: 17,
  name: 'Snowy Shlichus',
  world: 4,
  hint: 'Slide the supply sled across the icy lane with SLIPPERY, then borrow MAGNETIC to gather the three lost supply packs for Rivka!',
  entities: [
    { id: 'player', kind: 'bandit', label: 'YOU', x: 195, y: 520, stickers: [], behavior: 'idle' },
    { id: 'supply-sled', kind: 'wagon', label: 'SUPPLY SLED', x: 80, y: 310, stickers: [], behavior: 'idle' },
    { id: 'slick-snail', kind: 'snail', label: 'SLICK SNAIL', x: 72, y: 510, stickers: ['SLIPPERY'], behavior: 'idle' },
    { id: 'magnet-bot', kind: 'robot', label: 'MAGNET BOT', x: 316, y: 510, stickers: ['MAGNETIC'], behavior: 'idle' }
  ],
  goals: [
    { id: 'sled-lane', x: 300, y: 310, radius: 31, targetId: 'supply-sled', requires: ['SLIPPERY'], minSpeed: 100, label: 'ICE LANE' },
    { id: 'gather-packs', x: 195, y: 520, radius: 38, targetId: 'player', requires: ['MAGNETIC'], minMagneticRadius: 100, label: 'FIND PACKS' }
  ],
  goalOrder: 'sequential',
  fixtures: [
    { kind: 'gate', x: 195, y: 405, w: 348, h: 16, opensAfter: 1 },
    { kind: 'wall', x: 195, y: 245, w: 22, h: 72 },
    { kind: 'gate', x: 195, y: 135, w: 348, h: 16, opensAfter: 2 }
  ],
  treasure: { x: 65, y: 551 },
  gem: { x: 65, y: 195 },
  exit: { x: 195, y: 70 },
  par: 2,
  solution: [
    { source: 'slick-snail', target: 'supply-sled', sticker: 'SLIPPERY' },
    { source: 'magnet-bot', target: 'player', sticker: 'MAGNETIC' }
  ],
  mission: {
    kind: 'delivery',
    items: [{ x: 65, y: 458 }, { x: 75, y: 263 }, { x: 303, y: 266 }],
    itemName: 'winter supply pack',
    stationLabel: 'COMMUNITY HOME',
    station: { x: 310, y: 207 },
    npc: { x: 350, y: 260, name: 'RIVKA', greeting: 'A gust scattered our winter supply packs. Could you guide the sled and bring all three packs to our community home?', thanks: 'The packs are all here. Everyone can stay warm. Thank you!' }
  }
}), LevelSchema.parse({
  number: 18,
  name: 'Jungle Mitzvah Mission',
  world: 4,
  hint: 'Make the bridge crate BIG, bounce the vine ball across the path, then give the counterweight HEAVY. Help both neighbors reach the gathering!',
  entities: [
    { id: 'player', kind: 'bandit', label: 'YOU', x: 195, y: 520, stickers: [], behavior: 'idle' },
    { id: 'big-fruit', kind: 'apple', label: 'BIG FRUIT', x: 70, y: 510, stickers: ['BIG'], behavior: 'idle' },
    { id: 'bridge-crate', kind: 'crate', label: 'BRIDGE CRATE', x: 305, y: 471, stickers: [], behavior: 'idle' },
    { id: 'bounce-frog', kind: 'frog', label: 'BOUNCE FROG', x: 72, y: 450, stickers: ['BOUNCY'], behavior: 'idle' },
    { id: 'vine-ball', kind: 'ball', label: 'VINE BALL', x: 80, y: 315, stickers: [], behavior: 'idle' },
    { id: 'weight-rock', kind: 'rock', label: 'WEIGHT ROCK', x: 315, y: 525, stickers: ['HEAVY'], behavior: 'idle' },
    { id: 'counterweight', kind: 'boulder', label: 'COUNTERWEIGHT', x: 125, y: 250, stickers: [], behavior: 'idle' }
  ],
  goals: [
    { id: 'make-bridge', x: 305, y: 471, radius: 38, targetId: 'bridge-crate', requires: ['BIG'], label: 'MAKE BRIDGE' },
    { id: 'clear-vines', x: 300, y: 315, radius: 32, targetId: 'vine-ball', requires: ['BOUNCY'], minSpeed: 100, label: 'CLEAR VINES' },
    { id: 'steady-path', x: 125, y: 250, radius: 37, targetId: 'counterweight', requires: ['HEAVY'], minMass: 10, label: 'STEADY PATH' }
  ],
  goalOrder: 'sequential',
  fixtures: [
    { kind: 'gate', x: 195, y: 400, w: 348, h: 16, opensAfter: 1 },
    { kind: 'wall', x: 195, y: 240, w: 20, h: 70 },
    { kind: 'gate', x: 195, y: 135, w: 348, h: 16, opensAfter: 3 }
  ],
  treasure: { x: 135, y: 550 },
  gem: { x: 64, y: 200 },
  exit: { x: 195, y: 70 },
  par: 3,
  solution: [
    { source: 'big-fruit', target: 'bridge-crate', sticker: 'BIG' },
    { source: 'bounce-frog', target: 'vine-ball', sticker: 'BOUNCY' },
    { source: 'weight-rock', target: 'counterweight', sticker: 'HEAVY' }
  ],
  mission: {
    kind: 'neighbors',
    people: [
      { x: 75, y: 224, name: 'AVI', greeting: 'Can you make the bridge sturdy so I can reach the gathering?', thanks: 'The bridge is ready. Thank you for helping me!', needsGoal: 0 },
      { x: 316, y: 224, name: 'MAYA', greeting: 'Please clear the vine path and steady the crossing too.', thanks: 'Now everyone can meet safely. Thank you!', needsGoal: 2 }
    ]
  }
}), LevelSchema.parse({
  number: 19,
  name: 'The Worldwide Mitzvah Machine',
  world: 4,
  hint: 'Shrink the blocking crate, borrow FLOATING to cross the canal, then make the machine stabilizer HEAVY. Gather and assemble three parts to light the celebration machine!',
  entities: [
    { id: 'player', kind: 'bandit', label: 'YOU', x: 195, y: 520, stickers: [], behavior: 'idle' },
    { id: 'blocking-crate', kind: 'crate', label: 'BLOCKING CRATE', x: 195, y: 355, stickers: [], behavior: 'idle' },
    { id: 'tiny-snail', kind: 'snail', label: 'TINY SNAIL', x: 70, y: 510, stickers: ['TINY'], behavior: 'idle' },
    { id: 'float-frog', kind: 'frog', label: 'FLOAT FROG', x: 315, y: 510, stickers: ['FLOATING'], behavior: 'idle' },
    { id: 'weight-rock', kind: 'rock', label: 'WEIGHT ROCK', x: 281, y: 465, stickers: ['HEAVY'], behavior: 'idle' },
    { id: 'machine-stabilizer', kind: 'boulder', label: 'STABILIZER', x: 85, y: 223, stickers: [], behavior: 'idle' }
  ],
  goals: [
    { id: 'clear-workshop', x: 195, y: 355, radius: 36, targetId: 'blocking-crate', requires: ['TINY'], label: 'CLEAR WORKSHOP' },
    { id: 'cross-canal', x: 195, y: 520, radius: 38, targetId: 'player', requires: ['FLOATING'], label: 'CROSS CANAL' },
    { id: 'steady-machine', x: 85, y: 223, radius: 37, targetId: 'machine-stabilizer', requires: ['HEAVY'], minMass: 10, label: 'STEADY MACHINE' }
  ],
  goalOrder: 'sequential',
  fixtures: [
    { kind: 'gate', x: 195, y: 408, w: 348, h: 16, opensAfter: 1 },
    { kind: 'wall', x: 70, y: 355, w: 140, h: 18 },
    { kind: 'wall', x: 320, y: 355, w: 140, h: 18 },
    { kind: 'hazard', x: 195, y: 290, w: 350, h: 70 },
    { kind: 'gate', x: 195, y: 135, w: 348, h: 16, opensAfter: 3 }
  ],
  treasure: { x: 140, y: 551 },
  gem: { x: 65, y: 201 },
  exit: { x: 195, y: 70 },
  par: 3,
  solution: [
    { source: 'tiny-snail', target: 'blocking-crate', sticker: 'TINY' },
    { source: 'float-frog', target: 'player', sticker: 'FLOATING' },
    { source: 'weight-rock', target: 'machine-stabilizer', sticker: 'HEAVY' }
  ],
  mission: {
    kind: 'delivery',
    assembly: true,
    items: [{ x: 65, y: 459 }, { x: 315, y: 386 }, { x: 220, y: 245 }],
    itemName: 'machine part',
    stationLabel: 'MACHINE',
    station: { x: 311, y: 205 },
    npc: { x: 350, y: 260, name: 'NOAM', greeting: 'Our celebration machine needs its three parts. Can you clear the workshop, cross the canal, and help me assemble it?', thanks: 'The machine is ready to brighten our gathering. Thank you for putting it together!' }
  }
}), LevelSchema.parse({
  number: 20,
  name: 'The Grand Mitzvah Celebration',
  world: 4,
  hint: 'Borrow FAST, bounce the celebration ball into place, and make the welcome stand HEAVY. Carry a welcome kit to both friends to bring everyone together!',
  entities: [
    { id: 'player', kind: 'bandit', label: 'YOU', x: 195, y: 520, stickers: [], behavior: 'idle' },
    { id: 'fast-bot', kind: 'robot', label: 'FAST BOT', x: 70, y: 508, stickers: ['FAST'], behavior: 'idle' },
    { id: 'bounce-frog', kind: 'frog', label: 'BOUNCE FROG', x: 316, y: 508, stickers: ['BOUNCY'], behavior: 'idle' },
    { id: 'celebration-ball', kind: 'ball', label: 'CELEBRATION BALL', x: 80, y: 320, stickers: [], behavior: 'idle' },
    { id: 'weight-rock', kind: 'rock', label: 'WEIGHT ROCK', x: 283, y: 465, stickers: ['HEAVY'], behavior: 'idle' },
    { id: 'welcome-stand', kind: 'boulder', label: 'WELCOME STAND', x: 125, y: 245, stickers: [], behavior: 'idle' }
  ],
  goals: [
    { id: 'quick-preparation', x: 195, y: 520, radius: 38, targetId: 'player', requires: ['FAST'], label: 'PREPARE FAST' },
    { id: 'balloons-in-place', x: 300, y: 320, radius: 32, targetId: 'celebration-ball', requires: ['BOUNCY'], minSpeed: 100, label: 'CELEBRATE' },
    { id: 'steady-welcome', x: 125, y: 245, radius: 37, targetId: 'welcome-stand', requires: ['HEAVY'], minMass: 10, label: 'STEADY STAND' }
  ],
  goalOrder: 'sequential',
  fixtures: [
    { kind: 'gate', x: 195, y: 408, w: 348, h: 16, opensAfter: 1 },
    { kind: 'gate', x: 195, y: 285, w: 348, h: 16, opensAfter: 2 },
    { kind: 'gate', x: 195, y: 135, w: 348, h: 16, opensAfter: 3 }
  ],
  treasure: { x: 135, y: 551 },
  gem: { x: 65, y: 201 },
  exit: { x: 195, y: 70 },
  par: 3,
  solution: [
    { source: 'fast-bot', target: 'player', sticker: 'FAST' },
    { source: 'bounce-frog', target: 'celebration-ball', sticker: 'BOUNCY' },
    { source: 'weight-rock', target: 'welcome-stand', sticker: 'HEAVY' }
  ],
  mission: {
    kind: 'deliveries',
    items: [{ x: 65, y: 455 }, { x: 318, y: 455 }],
    itemName: 'welcome kit',
    people: [
      { x: 75, y: 222, name: 'MIRIAM', greeting: 'Can you bring a welcome kit for our guests?', thanks: 'Thank you! Our guests will feel right at home.' },
      { x: 316, y: 222, name: 'YOSEF', greeting: 'Please bring a welcome kit to this side too.', thanks: 'Wonderful! Everyone can join the celebration now.' }
    ]
  }
})];

export function getLevel(number: number): Level {
  const level = LEVELS.find((item) => item.number === number);
  if (!level) throw new Error(`Level ${number} has not been released`);
  return level;
}
