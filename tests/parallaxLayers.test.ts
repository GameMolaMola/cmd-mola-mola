// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { loadParallaxLayers } from '../src/components/game/parallaxLayers'

describe('loadParallaxLayers', () => {
  it('provides image objects for all layers', async () => {
    const layers = await loadParallaxLayers()
    expect(layers.far).toBeDefined()
    expect(layers.mid).toBeDefined()
    expect(layers.near).toBeDefined()
    expect(typeof layers.far.src).toBe('string')
    expect(layers.far.src.length).toBeGreaterThan(0)
  })
})
