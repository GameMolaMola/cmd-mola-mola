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

  it('returns regular config for high non-boss levels', () => {
    const cfg = getLevelConfig(9);
    expect(cfg.boss).not.toBe(true);
    expect(cfg.enemyCount).toBeDefined();
  });

  it('falls back to boss config for level >=10', () => {
    expect(getLevelConfig(10).boss).toBe(true);
    expect(getLevelConfig(15).boss).toBe(true);
    expect(getLevelConfig(999).boss).toBe(true);
  });
});
