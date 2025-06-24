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

  it('reuses cached images on subsequent calls', async () => {
    const first = {
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

    const p1 = loadImages(first as any)
    ;[
      ...first.playerFrames,
      first.playerLeft,
      first.enemy,
      first.enemyLeft,
      first.pizza,
      first.brasilena,
      first.wine,
      first.coin,
      first.bossLucia,
      first.swordfishRight,
      first.swordfishLeft,
    ].forEach((img) => {
      img.complete = true
      img.onload && img.onload()
    })
    await expect(p1).resolves.toBeUndefined()

    const second = {
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

    const p2 = loadImages(second as any)

    expect(second.playerFrames[0]).toBe(first.playerFrames[0])
    expect(second.playerFrames[1]).toBe(first.playerFrames[1])
    expect(second.playerLeft).toBe(first.playerLeft)
    expect(second.enemy).toBe(first.enemy)
    expect(second.enemyLeft).toBe(first.enemyLeft)
    expect(second.pizza).toBe(first.pizza)
    expect(second.brasilena).toBe(first.brasilena)
    expect(second.wine).toBe(first.wine)
    expect(second.coin).toBe(first.coin)
    expect(second.bossLucia).toBe(first.bossLucia)
    expect(second.swordfishRight).toBe(first.swordfishRight)
    expect(second.swordfishLeft).toBe(first.swordfishLeft)

    await expect(p2).resolves.toBeUndefined()
  })
})
