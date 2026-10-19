import { expect, it } from 'vitest';
import { platformPosition } from '../src/game/platform';
import type { Fixture } from '../src/game/model';

it('moves reusable platforms back and forth within their travel range', () => {
  const fixture: Fixture = { kind: 'platform', x: 180, y: 350, w: 90, h: 24, range: 65, period: 2000 };
  expect(platformPosition(fixture, 0)).toBeCloseTo(180);
  expect(platformPosition(fixture, 500)).toBeCloseTo(245);
  expect(platformPosition(fixture, 1000)).toBeCloseTo(180);
  expect(platformPosition(fixture, 1500)).toBeCloseTo(115);
});
