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

describe('setMobileControlState', () => {
  it('updates both jump and up when jump is set', () => {
    const engine = createEngine();
    engine.setMobileControlState('jump', true);
    expect((engine as any).mobileControlState.jump).toBe(true);
    expect((engine as any).mobileControlState.up).toBe(true);
  });

  it('updates both up and jump when up is set', () => {
    const engine = createEngine();
    engine.setMobileControlState('up', true);
    expect((engine as any).mobileControlState.up).toBe(true);
    expect((engine as any).mobileControlState.jump).toBe(true);
  });
});
