export interface GameImages {
  playerFrames: HTMLImageElement[]
  playerLeft: HTMLImageElement
  enemy: HTMLImageElement
  enemyLeft: HTMLImageElement
  pizza: HTMLImageElement
  brasilena: HTMLImageElement
  wine: HTMLImageElement
  coin: HTMLImageElement
  bossLucia: HTMLImageElement
  swordfishRight: HTMLImageElement
  swordfishLeft: HTMLImageElement
}

const cache = new Map<string, HTMLImageElement>()

function getCachedImage(url: string, provided: HTMLImageElement): HTMLImageElement {
  const cached = cache.get(url)
  if (cached) {
    return cached
  }
  provided.src = url
  cache.set(url, provided)
  return provided
}

export function loadImages(images: GameImages): Promise<void> {
  images.playerFrames[0] = getCachedImage(
    "/uploads/080fcc27-fe7b-448a-9661-9e1a894abab7.png",
    images.playerFrames[0]
  )
  images.playerFrames[1] = getCachedImage(
    "/uploads/1c2ed28f-2e83-4dbd-8327-8c1f2c00c060.png",
    images.playerFrames[1]
  )
  images.playerLeft = getCachedImage(
    "/uploads/2d15af34-fad3-4789-80a2-b0f9d9a204a0.png",
    images.playerLeft
  )
  images.enemy = getCachedImage(
    "/uploads/63f3c1bb-af9c-4c63-86ae-a15bc687d8a8.png",
    images.enemy
  )
  images.enemyLeft = getCachedImage(
    "/uploads/64235a5a-8a4e-4fac-83fe-14e82ff1bba0.png",
    images.enemyLeft
  )
  images.pizza = getCachedImage(
    "/uploads/65338906-ef6b-4097-bcbc-73770f962827.png",
    images.pizza
  )
  images.brasilena = getCachedImage(
    "/uploads/8cb50a4f-d767-4a5d-bdf6-751db3255aec.png",
    images.brasilena
  )
  images.wine = getCachedImage(
    "/uploads/989f5507-8b03-451b-b9c1-b0e2d1cc1aaa.png",
    images.wine
  )
  images.coin = getCachedImage(
    "/uploads/a8dae000-616d-4f8b-bce1-d8b37c9eae56.png",
    images.coin
  )
  images.bossLucia = getCachedImage(
    "/uploads/Boss%20sprite%20lucia.png",
    images.bossLucia
  )
  images.swordfishRight = getCachedImage(
    "/uploads/swordfish-right.png",
    images.swordfishRight
  )
  images.swordfishLeft = getCachedImage(
    "/uploads/swordfish-left.png",
    images.swordfishLeft
  )

  const list: HTMLImageElement[] = [
    images.playerFrames[0],
    images.playerFrames[1],
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
  ]

  return new Promise((resolve) => {
    let loaded = 0
    const check = () => {
      loaded += 1
      if (loaded === list.length) resolve()
    }

    list.forEach((img) => {
      if (img.complete) {
        check()
      } else {
        img.onload = check
        img.onerror = check
      }
    })
  })
}
