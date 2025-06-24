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

export function loadImages(images: GameImages): Promise<void> {
  images.playerFrames[0].src = "/uploads/080fcc27-fe7b-448a-9661-9e1a894abab7.png"
  images.playerFrames[1].src = "/uploads/1c2ed28f-2e83-4dbd-8327-8c1f2c00c060.png"
  images.playerLeft.src = "/uploads/2d15af34-fad3-4789-80a2-b0f9d9a204a0.png"
  images.enemy.src = "/uploads/63f3c1bb-af9c-4c63-86ae-a15bc687d8a8.png"
  images.enemyLeft.src = "/uploads/64235a5a-8a4e-4fac-83fe-14e82ff1bba0.png"
  images.pizza.src = "/uploads/65338906-ef6b-4097-bcbc-73770f962827.png"
  images.brasilena.src = "/uploads/8cb50a4f-d767-4a5d-bdf6-751db3255aec.png"
  images.wine.src = "/uploads/989f5507-8b03-451b-b9c1-b0e2d1cc1aaa.png"
  images.coin.src = "/uploads/a8dae000-616d-4f8b-bce1-d8b37c9eae56.png"
  images.bossLucia.src = "/uploads/Boss%20sprite%20lucia.png"
  images.swordfishRight.src = "/uploads/swordfish-right.png"
  images.swordfishLeft.src = "/uploads/swordfish-left.png"

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
