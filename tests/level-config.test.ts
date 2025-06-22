import { describe, it, expect } from 'vitest';
import { getLevelConfig } from '../src/components/game/levels';

describe('level configuration lookup', () => {
  it('returns defined config for level 1', () => {
    const cfg = getLevelConfig(1);
    expect(cfg.enemyCount).toBe(4);
    expect(cfg.coinCount).toBe(7);
  });

it('returns level1 config for unknown or negative levels', () => {
  const cfg0 = getLevelConfig(0);
  const cfgNeg = getLevelConfig(-3);
  expect(cfg0.enemyCount).toBe(4);
  expect(cfgNeg.coinCount).toBe(7);
});
  it('falls back to boss config for level >=10', () => {
    const cfg = getLevelConfig(10);
    expect(cfg.boss).toBe(true);
  });
});
