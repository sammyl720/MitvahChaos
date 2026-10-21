import { describe, expect, it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { LevelSchema } from '../src/game/model';
import { StickerEngine, effectiveStats } from '../src/game/stickerEngine';
import { assemblePart, collectCoin, deliverGift, depositCoins, helpNeighbor, missionComplete, missionGoalCount, missionItems, spillSupplies, startMission } from '../src/game/mission';
import { findTapRoute } from '../src/game/navigation';

describe('The Runaway Pushka', () => {
  const level = LEVELS[0];
  it('has a valid original layout and a solvable sticker transfer', () => {
    expect(LEVELS).toHaveLength(15);
    expect(LevelSchema.safeParse(level).success).toBe(true);
    const engine = new StickerEngine(level.entities);
    for (const step of level.solution) expect(engine.transfer(step.source, step.target, step.sticker).ok).toBe(true);
    expect(engine.get('player')?.stickers).toContain('MAGNETIC');
    expect(effectiveStats(engine.get('player')!).magneticRadius).toBeGreaterThan(100);
  });
  it('requires a separate coin inventory and pushka deposit', () => {
    let mission = startMission(level);
    expect(missionComplete(level, mission)).toBe(false);
    missionItems(level).forEach((_, index) => { mission = collectCoin(mission, index); });
    expect(mission.carried).toBe(3);
    expect(missionComplete(level, mission)).toBe(false);
    mission = depositCoins(mission);
    expect(mission).toMatchObject({ carried: 0, deposited: 3 });
    expect(missionComplete(level, mission)).toBe(true);
    expect(collectCoin(mission, 0)).toBe(mission);
  });
  it('keeps the exit behind a gate until the magnet switch is lit', () => {
    const start = level.entities[0];
    expect(findTapRoute(start, level.exit, 18, level.fixtures, 0, [], false)).toBeNull();
    expect(findTapRoute(start, level.exit, 18, level.fixtures, 1, [], false)).not.toBeNull();
    for (const coin of missionItems(level)) expect(findTapRoute(start, coin, 18, level.fixtures, 1, [], false)).not.toBeNull();
  });
});

describe('The Great Sukkah Scramble', () => {
  const level = LEVELS[14];
  it('loads the cart, clears the passage, and steadies the support in order', () => {
    expect(LevelSchema.safeParse(level).success).toBe(true);
    const engine = new StickerEngine(level.entities);
    for (const step of level.solution) expect(engine.transfer(step.source, step.target, step.sticker).ok).toBe(true);
    expect(engine.get('supply-cart')?.stickers).toContain('BIG');
    expect(effectiveStats(engine.get('blocking-box')!).radius).toBeLessThan(18);
    expect(effectiveStats(engine.get('support-base')!).mass).toBeGreaterThanOrEqual(10);
    expect(level.goals.map(goal => goal.targetId)).toEqual(['supply-cart', 'blocking-box', 'support-base']);
  });
  it('builds walls before roof slats and opens the exit after the third switch', () => {
    const start = level.entities[0];
    const station = level.mission?.kind === 'delivery' ? level.mission.station : null;
    expect(station).not.toBeNull();
    expect(level.mission?.kind === 'delivery' && level.mission.assembly).toBe(true);
    let mission = startMission(level);
    for (let index = 0; index < 3; index++) mission = collectCoin(mission, index);
    expect(missionComplete(level, mission)).toBe(false);
    for (let count = 1; count <= 3; count++) {
      mission = assemblePart(mission);
      expect(mission.deposited).toBe(count);
    }
    expect(missionComplete(level, mission)).toBe(true);
    expect(findTapRoute(start, level.exit, 18, level.fixtures, 2, [], false)).toBeNull();
    for (const destination of [...missionItems(level), station!, level.treasure, level.exit]) {
      expect(findTapRoute(start, destination, 18, level.fixtures, 3, [], false)).not.toBeNull();
    }
  });
});

describe('The Floating Bridge', () => {
  const level = LEVELS[8];
  it('requires FLOATING on both the raft and the supply carrier', () => {
    expect(LevelSchema.safeParse(level).success).toBe(true);
    const engine = new StickerEngine(level.entities);
    for (const step of level.solution) expect(engine.transfer(step.source, step.target, step.sticker).ok).toBe(true);
    expect(effectiveStats(engine.get('supply-raft')!).canFloat).toBe(true);
    expect(effectiveStats(engine.get('player')!).canFloat).toBe(true);
    let mission = startMission(level);
    mission = collectCoin(mission, 0);
    mission = collectCoin(mission, 1);
    expect(missionComplete(level, mission)).toBe(false);
    mission = depositCoins(mission);
    expect(missionComplete(level, mission)).toBe(true);
  });
  it('makes the water a true route barrier until the player floats', () => {
    const start = level.entities[0];
    const station = level.mission?.kind === 'delivery' ? level.mission.station : null;
    expect(station).not.toBeNull();
    expect(findTapRoute(start, station!, 18, level.fixtures, 2, [], false)).toBeNull();
    expect(findTapRoute(start, station!, 18, level.fixtures, 2, [], true)).not.toBeNull();
    expect(findTapRoute(start, level.exit, 18, level.fixtures, 1, [], true)).toBeNull();
    expect(findTapRoute(start, level.exit, 18, level.fixtures, 2, [], true)).not.toBeNull();
  });
});

describe('The Great Wagon Rescue', () => {
  const level = LEVELS[9];
  it('combines buoyancy, a weighted anchor, and a fast wagon slide', () => {
    expect(LevelSchema.safeParse(level).success).toBe(true);
    const engine = new StickerEngine(level.entities);
    for (const step of level.solution) expect(engine.transfer(step.source, step.target, step.sticker).ok).toBe(true);
    const wagon = engine.get('stalled-wagon')!;
    expect(effectiveStats(wagon).canFloat).toBe(true);
    expect(effectiveStats(wagon).drag).toBeLessThan(effectiveStats({ ...wagon, stickers: ['FLOATING'] }).drag);
    expect(effectiveStats(engine.get('tow-anchor')!).mass).toBeGreaterThanOrEqual(level.goals[1].minMass!);
    let mission = startMission(level);
    mission = collectCoin(mission, 0);
    mission = collectCoin(mission, 1);
    expect(missionComplete(level, mission)).toBe(false);
    expect(missionComplete(level, depositCoins(mission))).toBe(true);
  });
  it('opens the parcel route after the anchor and the exit after rescue', () => {
    const start = level.entities[0];
    const station = level.mission?.kind === 'delivery' ? level.mission.station : null;
    expect(station).not.toBeNull();
    expect(findTapRoute(start, station!, 18, level.fixtures, 1, [], false)).toBeNull();
    expect(findTapRoute(start, station!, 18, level.fixtures, 2, [], false)).not.toBeNull();
    expect(findTapRoute(start, level.exit, 18, level.fixtures, 2, [], false)).toBeNull();
    expect(findTapRoute(start, level.exit, 18, level.fixtures, 3, [], false)).not.toBeNull();
  });
});

describe('Dreidel Disaster', () => {
  const level = LEVELS[10];
  it('gives the giant toy both properties and keeps decorations separate', () => {
    expect(LevelSchema.safeParse(level).success).toBe(true);
    const engine = new StickerEngine(level.entities);
    for (const step of level.solution) expect(engine.transfer(step.source, step.target, step.sticker).ok).toBe(true);
    const dreidel = engine.get('giant-dreidel')!;
    expect(dreidel.stickers).toEqual(['BIG', 'BOUNCY', 'SLIPPERY']);
    expect(effectiveStats(dreidel).radius).toBeGreaterThan(45);
    expect(effectiveStats(dreidel).restitution).toBeGreaterThanOrEqual(.85);
    expect(effectiveStats(dreidel).drag).toBeLessThan(100);
    let mission = startMission(level);
    mission = collectCoin(mission, 0);
    mission = collectCoin(mission, 1);
    expect(missionComplete(level, mission)).toBe(false);
    expect(missionComplete(level, depositCoins(mission))).toBe(true);
  });
  it('opens the preparation area after the first switch and exit after the second', () => {
    const start = level.entities[0];
    const station = level.mission?.kind === 'delivery' ? level.mission.station : null;
    expect(station).not.toBeNull();
    expect(findTapRoute(start, station!, 18, level.fixtures, 0, [], false)).toBeNull();
    expect(findTapRoute(start, station!, 18, level.fixtures, 1, [], false)).not.toBeNull();
    expect(findTapRoute(start, level.exit, 18, level.fixtures, 1, [], false)).toBeNull();
    expect(findTapRoute(start, level.exit, 18, level.fixtures, 2, [], false)).not.toBeNull();
  });
});

describe('The Missing Menorah Pieces', () => {
  const level = LEVELS[11];
  it('requires a small magnetic hero and three separate assembly actions', () => {
    expect(LevelSchema.safeParse(level).success).toBe(true);
    const engine = new StickerEngine(level.entities);
    for (const step of level.solution) expect(engine.transfer(step.source, step.target, step.sticker).ok).toBe(true);
    const player = engine.get('player')!;
    expect(effectiveStats(player).radius).toBeLessThan(11);
    expect(effectiveStats(player).magneticRadius).toBeGreaterThanOrEqual(100);
    let mission = startMission(level);
    for (let index = 0; index < 3; index++) mission = collectCoin(mission, index);
    expect(mission).toMatchObject({carried: 3, deposited: 0});
    mission = assemblePart(mission);
    expect(mission).toMatchObject({carried: 2, deposited: 1});
    mission = assemblePart(assemblePart(mission));
    expect(missionComplete(level, mission)).toBe(true);
    expect(assemblePart(mission)).toBe(mission);
  });
  it('makes the workshop opening physically too narrow at normal size', () => {
    const start = level.entities[0];
    const station = level.mission?.kind === 'delivery' ? level.mission.station : null;
    expect(station).not.toBeNull();
    expect(findTapRoute(start, station!, 18, level.fixtures, 2, [], false)).toBeNull();
    expect(findTapRoute(start, station!, 9.9, level.fixtures, 2, [], false)).not.toBeNull();
    expect(findTapRoute(start, level.exit, 9.9, level.fixtures, 1, [], false)).toBeNull();
    expect(findTapRoute(start, level.exit, 9.9, level.fixtures, 2, [], false)).not.toBeNull();
    expect(findTapRoute(level.treasure, level.exit, 9.9, level.fixtures, 2, level.entities.filter((entity) => entity.id !== 'player').map((entity) => ({ x: entity.x, y: entity.y, radius: effectiveStats({ kind: entity.kind, stickers: [] }).radius })), false)).not.toBeNull();
  });
});

describe('Purim Delivery Dash', () => {
  const level = LEVELS[12];
  it('uses FAST on the hero and SLIPPERY on the cart while tracking each gift recipient separately', () => {
    expect(LevelSchema.safeParse(level).success).toBe(true);
    const engine = new StickerEngine(level.entities);
    for (const step of level.solution) expect(engine.transfer(step.source, step.target, step.sticker).ok).toBe(true);
    const player = engine.get('player')!;
    expect(effectiveStats(player).speed).toBeGreaterThan(300);
    expect(effectiveStats(engine.get('courier-cart')!).drag).toBeLessThan(100);
    let mission = startMission(level);
    mission = collectCoin(collectCoin(mission, 0), 1);
    mission = deliverGift(mission, 0);
    expect(mission).toMatchObject({carried: 1, deposited: 1, served: [true, false]});
    expect(deliverGift(mission, 0)).toBe(mission);
    mission = deliverGift(mission, 1);
    expect(missionComplete(level, mission)).toBe(true);
  });
  it('opens the gift route after the fast switch and the exit after the dash', () => {
    const start = level.entities[0];
    const recipient = level.mission?.kind === 'deliveries' ? level.mission.people[0] : null;
    expect(recipient).not.toBeNull();
    expect(findTapRoute(start, recipient!, 18, level.fixtures, 0, [], false)).toBeNull();
    expect(findTapRoute(start, recipient!, 18, level.fixtures, 1, [], false)).not.toBeNull();
    expect(findTapRoute(start, level.exit, 18, level.fixtures, 1, [], false)).toBeNull();
    expect(findTapRoute(start, level.exit, 18, level.fixtures, 2, [], false)).not.toBeNull();
  });
});

describe('Matzah Mountain', () => {
  const level = LEVELS[13];
  it('moves BIG onto the cart, shrinks the box, and keeps the table coverings as inventory', () => {
    expect(LevelSchema.safeParse(level).success).toBe(true);
    const engine = new StickerEngine(level.entities);
    const originalBoxRadius = effectiveStats(engine.get('matzah-box')!).radius;
    for (const step of level.solution) expect(engine.transfer(step.source, step.target, step.sticker).ok).toBe(true);
    expect(effectiveStats(engine.get('packing-cart')!).radius).toBeGreaterThan(45);
    expect(effectiveStats(engine.get('matzah-box')!).radius).toBeLessThan(originalBoxRadius / 2);
    let mission = startMission(level);
    mission = collectCoin(collectCoin(mission, 0), 1);
    expect(missionComplete(level, mission)).toBe(false);
    expect(missionComplete(level, depositCoins(mission))).toBe(true);
  });
  it('opens a route around the shrunken box to Rachel and the exit', () => {
    const start = level.entities[0];
    const station = level.mission?.kind === 'delivery' ? level.mission.station : null;
    expect(station).not.toBeNull();
    expect(findTapRoute(start, station!, 18, level.fixtures, 0, [], false)).toBeNull();
    const obstacles = level.entities.filter((entity) => entity.id !== 'player').map((entity) => ({ x: entity.x, y: entity.y, radius: entity.id === 'matzah-box' ? 12.65 : effectiveStats({ kind: entity.kind, stickers: entity.id === 'packing-cart' ? ['BIG'] : [] }).radius }));
    expect(findTapRoute(start, station!, 18, level.fixtures, 2, obstacles, false)).not.toBeNull();
    expect(findTapRoute(start, level.exit, 18, level.fixtures, 1, obstacles, false)).toBeNull();
    expect(findTapRoute(start, level.exit, 18, level.fixtures, 2, obstacles, false)).not.toBeNull();
  });
});

describe('The Tiny Shtetl', () => {
  const level = LEVELS[7];
  it('needs a genuinely smaller player to pass through the miniature opening', () => {
    expect(LevelSchema.safeParse(level).success).toBe(true);
    const engine = new StickerEngine(level.entities);
    const player = engine.get('player')!;
    expect(findTapRoute(player, level.goals[0], effectiveStats(player).radius, level.fixtures, 0, [], false)).toBeNull();
    expect(engine.transfer('tiny-snail', 'player', 'TINY').ok).toBe(true);
    const tinyPlayer = engine.get('player')!;
    expect(findTapRoute(tinyPlayer, level.goals[0], effectiveStats(tinyPlayer).radius, level.fixtures, 0, [], false)).not.toBeNull();
    expect(engine.transfer('magnet-bot', 'model-switch', 'MAGNETIC').ok).toBe(true);
    expect(effectiveStats(engine.get('model-switch')!).magneticRadius).toBeGreaterThanOrEqual(level.goals[1].minMagneticRadius!);
  });
  it('keeps Tova and the exit behind the miniature passage and last switch', () => {
    const start = level.entities[0];
    const npc = level.mission?.kind === 'neighbors' ? level.mission.people[0] : null;
    expect(npc).not.toBeNull();
    expect(findTapRoute(start, npc!, 18, level.fixtures, 2, [], false)).toBeNull();
    expect(findTapRoute(start, npc!, 9.9, level.fixtures, 2, [], false)).not.toBeNull();
    expect(findTapRoute(start, level.exit, 9.9, level.fixtures, 1, [], false)).toBeNull();
    expect(findTapRoute(start, level.exit, 9.9, level.fixtures, 2, [], false)).not.toBeNull();
  });
});

describe('Chicken Soup Catastrophe', () => {
  const level = LEVELS[6];
  it('clears the kitchen and steadies the shelf before safe supply delivery', () => {
    expect(LevelSchema.safeParse(level).success).toBe(true);
    const engine = new StickerEngine(level.entities);
    const crateSize = effectiveStats(engine.get('kitchen-crate')!).radius;
    for (const step of level.solution) expect(engine.transfer(step.source, step.target, step.sticker).ok).toBe(true);
    expect(effectiveStats(engine.get('kitchen-crate')!).radius).toBeLessThan(crateSize);
    expect(effectiveStats(engine.get('soup-shelf')!).mass).toBeGreaterThanOrEqual(level.goals[1].minMass!);
    let mission = startMission(level);
    mission = collectCoin(mission, 0);
    expect(spillSupplies(mission).carried).toBe(0);
    expect(spillSupplies(mission).collected).toEqual([false, false]);
    mission = collectCoin(mission, 1);
    mission = depositCoins(mission);
    expect(missionComplete(level, mission)).toBe(true);
  });
  it('has a route around the spill to the kitchen after its gates open', () => {
    const start = level.entities[0];
    const station = level.mission?.kind === 'delivery' ? level.mission.station : null;
    expect(station).not.toBeNull();
    expect(findTapRoute(start, station!, 18, level.fixtures, 0, [], false)).toBeNull();
    expect(findTapRoute(start, station!, 18, level.fixtures, 1, [], false)).not.toBeNull();
    expect(findTapRoute(start, level.exit, 18, level.fixtures, 1, [], false)).toBeNull();
    expect(findTapRoute(start, level.exit, 18, level.fixtures, 2, [], false)).not.toBeNull();
  });
});

describe('Challahzilla!', () => {
  const level = LEVELS[1];
  it('has a solvable BIG transfer and a separate tablecloth delivery', () => {
    expect(LevelSchema.safeParse(level).success).toBe(true);
    const engine = new StickerEngine(level.entities);
    for (const step of level.solution) expect(engine.transfer(step.source, step.target, step.sticker).ok).toBe(true);
    expect(engine.get('bridge-crate')?.stickers).toContain('BIG');
    expect(effectiveStats(engine.get('bridge-crate')!).radius).toBeGreaterThan(35);
    let mission = startMission(level);
    expect(missionComplete(level, mission)).toBe(false);
    mission = collectCoin(mission, 0);
    expect(missionComplete(level, mission)).toBe(false);
    mission = depositCoins(mission);
    expect(missionComplete(level, mission)).toBe(true);
  });
  it('lets the player reach the tablecloth, family, treasure, and opened exit', () => {
    const start = level.entities[0];
    expect(findTapRoute(start, level.exit, 18, level.fixtures, 0, [], false)).toBeNull();
    const station = level.mission?.kind === 'delivery' ? level.mission.station : null;
    expect(station).not.toBeNull();
    for (const destination of [...missionItems(level), station!, level.treasure, level.exit]) {
      expect(findTapRoute(start, destination, 18, level.fixtures, 1, [], false)).not.toBeNull();
    }
  });
});

describe('The Speedy Shliach', () => {
  const level = LEVELS[2];
  it('requires FAST and a separate package drop-off', () => {
    expect(LevelSchema.safeParse(level).success).toBe(true);
    const engine = new StickerEngine(level.entities);
    for (const step of level.solution) expect(engine.transfer(step.source, step.target, step.sticker).ok).toBe(true);
    expect(engine.get('player')?.stickers).toContain('FAST');
    expect(effectiveStats(engine.get('player')!).speed).toBeGreaterThan(effectiveStats(level.entities[0]).speed);
    let mission = startMission(level);
    expect(missionComplete(level, mission)).toBe(false);
    mission = collectCoin(mission, 0);
    expect(missionComplete(level, mission)).toBe(false);
    mission = depositCoins(mission);
    expect(missionComplete(level, mission)).toBe(true);
  });
  it('routes through the maze when the FAST switch opens the exit', () => {
    const start = level.entities[0];
    expect(findTapRoute(start, level.exit, 18, level.fixtures, 0, [], false)).toBeNull();
    const station = level.mission?.kind === 'delivery' ? level.mission.station : null;
    expect(station).not.toBeNull();
    for (const destination of [...missionItems(level), station!, level.treasure, level.exit]) {
      expect(findTapRoute(start, destination, 18, level.fixtures, 1, [], false)).not.toBeNull();
    }
  });
});

describe('Kingston Avenue Mix-Up', () => {
  const level = LEVELS[3];
  it('requires two physical sticker changes and two separate neighbor interactions', () => {
    expect(LevelSchema.safeParse(level).success).toBe(true);
    const engine = new StickerEngine(level.entities);
    const barrierBefore = effectiveStats(engine.get('street-barrier')!).radius;
    const cartBefore = effectiveStats(engine.get('supply-cart')!).mass;
    for (const step of level.solution) expect(engine.transfer(step.source, step.target, step.sticker).ok).toBe(true);
    expect(effectiveStats(engine.get('street-barrier')!).radius).toBeLessThan(barrierBefore);
    expect(effectiveStats(engine.get('supply-cart')!).mass).toBeGreaterThan(cartBefore);
    expect(missionGoalCount(level)).toBe(2);
    let mission = startMission(level);
    mission = helpNeighbor(mission, 0);
    expect(missionComplete(level, mission)).toBe(false);
    expect(helpNeighbor(mission, 0)).toBe(mission);
    mission = helpNeighbor(mission, 1);
    expect(missionComplete(level, mission)).toBe(true);
  });
  it('opens the two street gates in stages', () => {
    const start = level.entities[0];
    const people = level.mission?.kind === 'neighbors' ? level.mission.people : [];
    expect(people).toHaveLength(2);
    expect(findTapRoute(start, people[0], 18, level.fixtures, 0, [], false)).toBeNull();
    expect(findTapRoute(start, people[0], 18, level.fixtures, 1, [], false)).not.toBeNull();
    expect(findTapRoute(start, people[1], 18, level.fixtures, 1, [], false)).toBeNull();
    expect(findTapRoute(start, people[1], 18, level.fixtures, 2, [], false)).not.toBeNull();
    expect(findTapRoute(start, level.exit, 18, level.fixtures, 2, [], false)).not.toBeNull();
  });
});

describe('The Great Challah Avalanche', () => {
  const level = LEVELS[4];
  it('has three ordered sticker solutions and a separate two item preparation task', () => {
    expect(LevelSchema.safeParse(level).success).toBe(true);
    expect(level.bossId).toBe('challah-boss');
    const engine = new StickerEngine(level.entities);
    const giantRadius = effectiveStats(engine.get('challah-boss')!).radius;
    for (const step of level.solution) expect(engine.transfer(step.source, step.target, step.sticker).ok).toBe(true);
    expect(effectiveStats(engine.get('challah-boss')!).radius).toBeLessThan(giantRadius);
    expect(engine.get('challah-boss')?.stickers).toContain('BOUNCY');
    expect(engine.get('brake-crate')?.stickers).toContain('HEAVY');
    let mission = startMission(level);
    expect(missionComplete(level, mission)).toBe(false);
    mission = collectCoin(mission, 0);
    mission = depositCoins(mission);
    expect(missionComplete(level, mission)).toBe(false);
    mission = collectCoin(mission, 1);
    mission = depositCoins(mission);
    expect(missionComplete(level, mission)).toBe(true);
  });
  it('opens the bakery and exit gates in sequence', () => {
    const start = level.entities[0];
    const station = level.mission?.kind === 'delivery' ? level.mission.station : null;
    expect(station).not.toBeNull();
    expect(findTapRoute(start, station!, 18, level.fixtures, 1, [], false)).toBeNull();
    for (const destination of [...missionItems(level), station!]) {
      expect(findTapRoute(start, destination, 18, level.fixtures, 2, [], false)).not.toBeNull();
    }
    expect(findTapRoute(start, level.exit, 18, level.fixtures, 2, [], false)).toBeNull();
    expect(findTapRoute(start, level.exit, 18, level.fixtures, 3, [], false)).not.toBeNull();
  });
});

describe('The Runaway Wagon', () => {
  const level = LEVELS[5];
  it('uses HEAVY and SLIPPERY together on an original wagon', () => {
    expect(LevelSchema.safeParse(level).success).toBe(true);
    const engine = new StickerEngine(level.entities);
    const initial = effectiveStats(engine.get('wagon')!);
    for (const step of level.solution) expect(engine.transfer(step.source, step.target, step.sticker).ok).toBe(true);
    const modified = effectiveStats(engine.get('wagon')!);
    expect(modified.mass).toBeGreaterThan(initial.mass * 3);
    expect(modified.drag).toBeLessThan(initial.drag / 5);
    expect(level.goals[1].requires).toEqual(['HEAVY', 'SLIPPERY']);
    let mission = startMission(level);
    mission = collectCoin(mission, 0);
    mission = collectCoin(mission, 1);
    expect(missionComplete(level, mission)).toBe(false);
    mission = depositCoins(mission);
    expect(missionComplete(level, mission)).toBe(true);
  });
  it('routes to the kitchen after the first gate and to the exit after the catch switch', () => {
    const start = level.entities[0];
    const station = level.mission?.kind === 'delivery' ? level.mission.station : null;
    expect(station).not.toBeNull();
    expect(findTapRoute(start, station!, 18, level.fixtures, 0, [], false)).toBeNull();
    for (const destination of [...missionItems(level), station!]) {
      expect(findTapRoute(start, destination, 18, level.fixtures, 1, [], false)).not.toBeNull();
    }
    expect(findTapRoute(start, level.exit, 18, level.fixtures, 1, [], false)).toBeNull();
    expect(findTapRoute(start, level.exit, 18, level.fixtures, 2, [], false)).not.toBeNull();
  });
});
