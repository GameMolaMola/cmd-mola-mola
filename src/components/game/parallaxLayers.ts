export interface ParallaxLayers {
  far: HTMLImageElement
  mid: HTMLImageElement
  near: HTMLImageElement
}

export type ParallaxTheme = string

const cachedLayers: Record<string, ParallaxLayers> = {}
const cachedPromises: Record<string, Promise<ParallaxLayers>> = {}

function canvasToImage(canvas: HTMLCanvasElement): HTMLImageElement {
  const img = new Image()
  img.src = canvas.toDataURL('image/png')
  return img
}

function createCanvas(): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false
  return ctx
}

function drawFarLayer(): HTMLCanvasElement {
  const ctx = createCanvas()
  const { canvas } = ctx

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#06182f')
  gradient.addColorStop(1, '#10335b')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  ctx.globalAlpha = 0.3
  ctx.fillStyle = '#183c6d'
  for (let x = 0; x < canvas.width; x += 256) {
    ctx.fillRect(x + 40, canvas.height - 260, 80, 180)
    ctx.fillRect(x + 140, canvas.height - 320, 60, 240)
    ctx.beginPath()
    ctx.arc(x + 170, canvas.height - 320, 30, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  ctx.save()
  ctx.globalAlpha = 0.5
  ctx.fillStyle = '#2ef2ff'
  for (let i = 0; i < 40; i++) {
    const bx = (i * 50) % canvas.width
    const by = 50 + ((i * 97) % (canvas.height / 2))
    ctx.fillRect(bx, by, 4, 4)
  }
  ctx.restore()

  return ctx.canvas
}

function drawMidLayer(): HTMLCanvasElement {
  const ctx = createCanvas()
  const { canvas } = ctx

  ctx.fillStyle = '#0e2950'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#1d4d7e'
  for (let x = 0; x < canvas.width; x += 128) {
    ctx.fillRect(x + 20, canvas.height - 220, 32, 140)
    ctx.fillRect(x + 60, canvas.height - 180, 24, 120)
  }

  ctx.fillStyle = '#3af2ff'
  for (let i = 0; i < 80; i++) {
    const bx = (i * 25) % canvas.width
    const by = canvas.height - 150 - (i % 5) * 20
    ctx.fillRect(bx, by, 3, 3)
  }

  return ctx.canvas
}

function drawNearLayer(): HTMLCanvasElement {
  const ctx = createCanvas()
  const { canvas } = ctx

  ctx.fillStyle = '#14375e'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#2d65a4'
  for (let x = 0; x < canvas.width; x += 64) {
    ctx.fillRect(x, canvas.height - 120, 64, 120)
  }

  ctx.fillStyle = '#66f9ff'
  for (let i = 0; i < 100; i++) {
    const bx = (i * 20) % canvas.width
    const by = canvas.height - 80 - (i % 7) * 10
    ctx.fillRect(bx, by, 4, 4)
  }

  return ctx.canvas
}

export function loadParallaxLayers(theme: ParallaxTheme = 'default'): Promise<ParallaxLayers> {
  if (cachedLayers[theme]) return Promise.resolve(cachedLayers[theme])
  if (cachedPromises[theme]) return cachedPromises[theme]

  cachedPromises[theme] = new Promise((resolve) => {
    const farCanvas = drawFarLayer()
    const midCanvas = drawMidLayer()
    const nearCanvas = drawNearLayer()

    const farImg = canvasToImage(farCanvas)
    const midImg = canvasToImage(midCanvas)
    const nearImg = canvasToImage(nearCanvas)

    const images = [farImg, midImg, nearImg]
    let loaded = 0
    const check = () => {
      loaded += 1
      if (loaded === images.length) {
        cachedLayers[theme] = { far: farImg, mid: midImg, near: nearImg }
        resolve(cachedLayers[theme])
      }
    }

    images.forEach((img) => {
      if (img.complete) {
        check()
      } else {
        img.onload = check
        img.onerror = check
      }
    })
  })

  return cachedPromises[theme]
}
