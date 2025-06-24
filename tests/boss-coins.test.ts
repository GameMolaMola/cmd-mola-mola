// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';

vi.mock('../src/components/game/audioManager', () => ({
  audioManager: {
    toggleMute: vi.fn(),
    isMutedState: vi.fn().mockReturnValue(false),
    playLevelMusic: vi.fn(),
    playLevelWinSound: vi.fn(),
    stopLevelMusic: vi.fn(),
  },
  activateAudio: vi.fn(),
}));
vi.mock('../src/components/game/staticSandLayer', () => ({
  createStaticSandLayer: () => document.createElement('canvas'),
}));

import { GameEngine } from '../src/components/game/GameEngine';

function createEngine() {
  const canvas = document.createElement('canvas');
  const ctx = { imageSmoothingEnabled: false } as unknown as CanvasRenderingContext2D;
  const engine = new GameEngine(canvas, ctx, {
    onGameEnd: () => {},
    onStateUpdate: () => {},
    initialState: {},
  });
  return engine;
}

describe('boss coin spawning', () => {
  it('spawnBossCoinsOnHit pushes given number of coins', () => {
    const engine = createEngine();
    const boss = { x: 50, y: 50, width: 40, height: 40 };
    engine.spawnBossCoinsOnHit(5, boss);
    expect((engine as any).coins.length).toBe(5);
    expect((engine as any).coins.every((c: any) => c._bossCoin)).toBe(true);
  });

  it('spawnBossCoins uses internal boss', () => {
    const engine = createEngine();
    (engine as any).bossLucia = { x: 10, y: 10, width: 30, height: 30, health: 100, image: new Image(), direction: 1 };
    engine.spawnBossCoins(3);
    expect((engine as any).coins.length).toBe(3);
    expect((engine as any).coins.every((c: any) => c._bossCoin)).toBe(true);
  });
});
