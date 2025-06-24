// @vitest-environment jsdom
import { it, expect, vi } from 'vitest';

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
import { ParticleSystem } from '../src/components/game/particleSystem';
import { ScreenShake } from '../src/components/game/screenShake';

it('provides particle system and screen shake via getters', () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const engine = new GameEngine(canvas, ctx, {
    onGameEnd: () => {},
    onStateUpdate: () => {},
    initialState: {},
  });

  expect(engine.getParticleSystem()).toBeInstanceOf(ParticleSystem);
  expect(engine.getScreenShake()).toBeInstanceOf(ScreenShake);
});
