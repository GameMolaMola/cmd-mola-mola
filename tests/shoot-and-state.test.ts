// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'

vi.mock('../src/components/game/audioManager', () => ({
  audioManager: {
    toggleMute: vi.fn(),
    isMutedState: vi.fn().mockReturnValue(false),
    playLevelMusic: vi.fn(),
    playLevelWinSound: vi.fn(),
    stopLevelMusic: vi.fn(),
    playShootSound: vi.fn(),
  },
  activateAudio: vi.fn(),
}))

vi.mock('../src/components/game/staticSandLayer', () => ({
  createStaticSandLayer: () => document.createElement('canvas'),
}))

import { GameEngine } from '../src/components/game/GameEngine'

function createEngine(opts: any = {}) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  return new GameEngine(canvas, ctx, {
    onGameEnd: () => {},
    onStateUpdate: opts.onStateUpdate || (() => {}),
    initialState: opts.initialState || {},
  })
}

describe('GameEngine shooting', () => {
  it('creates a bullet and uses muzzle flash', () => {
    const engine = createEngine()
    const flashSpy = vi.spyOn((engine as any).particleSystem, 'createMuzzleFlash')
    expect((engine as any).bullets.length).toBe(0)
    ;(engine as any).shoot()
    expect((engine as any).bullets.length).toBe(1)
    expect((engine as any).player.ammo).toBe(19)
    expect(flashSpy).toHaveBeenCalled()
  })
})

describe('GameEngine state updates', () => {
  it('emits current game state', () => {
    const onUpdate = vi.fn()
    const engine = createEngine({ onStateUpdate: onUpdate, initialState: { coins: 5 } })
    ;(engine as any).updateGameState()
    expect(onUpdate).toHaveBeenCalledWith({
      health: (engine as any).player.health,
      ammo: (engine as any).player.ammo,
      coins: (engine as any).player.coins,
      level: (engine as any).player.level,
      soundMuted: false,
    })
  })
})
