// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { loadParallaxLayers } from '../src/components/game/parallaxLayers'

describe('loadParallaxLayers', () => {
  it('provides image objects for default theme', async () => {
    const layers = await loadParallaxLayers()
    expect(layers.far).toBeDefined()
    expect(layers.mid).toBeDefined()
    expect(layers.near).toBeDefined()
    expect(typeof layers.far.src).toBe('string')
    expect(layers.far.src.length).toBeGreaterThan(0)
  })

  it('loads a different theme when requested', async () => {
    const jungle = await loadParallaxLayers('jungle')
    expect(jungle.far).toBeDefined()
    expect(jungle.mid).toBeDefined()
    expect(jungle.near).toBeDefined()
  })
})
