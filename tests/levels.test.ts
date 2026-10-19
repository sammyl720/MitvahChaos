import { describe, expect, it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { LevelSchema } from '../src/game/model';
import { StickerEngine, effectiveStats } from '../src/game/stickerEngine';
import { collectCoin, depositCoins, missionComplete, startMission } from '../src/game/mission';
import { findTapRoute } from '../src/game/navigation';

describe('The Runaway Pushka', () => {
  const level = LEVELS[0];
  it('has a valid original layout and a solvable sticker transfer', () => {
    expect(LEVELS).toHaveLength(1);
    expect(LevelSchema.safeParse(level).success).toBe(true);
    const engine = new StickerEngine(level.entities);
    for (const step of level.solution) expect(engine.transfer(step.source, step.target, step.sticker).ok).toBe(true);
    expect(engine.get('player')?.stickers).toContain('MAGNETIC');
    expect(effectiveStats(engine.get('player')!).magneticRadius).toBeGreaterThan(100);
  });
  it('requires a separate coin inventory and pushka deposit', () => {
    let mission = startMission(level);
    expect(missionComplete(level, mission)).toBe(false);
    level.mission!.coins.forEach((_, index) => { mission = collectCoin(mission, index); });
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
    for (const coin of level.mission!.coins) expect(findTapRoute(start, coin, 18, level.fixtures, 1, [], false)).not.toBeNull();
  });
});
