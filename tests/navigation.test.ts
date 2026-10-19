import { expect, it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { findTapRoute } from '../src/game/navigation';

it('routes the player around the Crown Heights barriers after the magnet switch opens', () => {
  const level = LEVELS[0];
  const start = level.mission!.coins[0];
  const coin = level.mission!.coins[2];
  const route = findTapRoute(start, coin, 18, level.fixtures, 1, [], false);
  expect(route).not.toBeNull();
  expect(route!.length).toBeGreaterThan(1);
});
