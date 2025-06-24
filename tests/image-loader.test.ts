import { describe, it, expect } from 'vitest'
import { loadImages } from '../src/components/game/imageLoader'

function createImg() {
  return { src: '', onload: undefined as any, onerror: undefined as any, complete: false } as HTMLImageElement & { onload: (() => void) | undefined; onerror: (() => void) | undefined }
}

describe('loadImages', () => {
  it('assigns src and resolves after load events', async () => {
    const images = {
      playerFrames: [createImg(), createImg()],
      playerLeft: createImg(),
      enemy: createImg(),
      enemyLeft: createImg(),
      pizza: createImg(),
      brasilena: createImg(),
      wine: createImg(),
      coin: createImg(),
      bossLucia: createImg(),
      swordfishRight: createImg(),
      swordfishLeft: createImg(),
    }

    const promise = loadImages(images as any)
    expect(images.bossLucia.src).toBe('/uploads/Boss%20sprite%20lucia.png')

    ;[
      ...images.playerFrames,
      images.playerLeft,
      images.enemy,
      images.enemyLeft,
      images.pizza,
      images.brasilena,
      images.wine,
      images.coin,
      images.bossLucia,
      images.swordfishRight,
      images.swordfishLeft,
    ].forEach((img) => {
      img.complete = true
      img.onload && img.onload()
    })

    await expect(promise).resolves.toBeUndefined()
  })
})
