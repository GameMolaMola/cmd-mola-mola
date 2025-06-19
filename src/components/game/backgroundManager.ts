export interface ParallaxLayer {
  canvas: HTMLCanvasElement;
  speed: number;
  x: number;
}

export class ParallaxBackground {
  private layers: ParallaxLayer[];
  private isStatic: boolean;

  constructor(layers: ParallaxLayer[], isStatic = false) {
    this.layers = layers;
    this.isStatic = isStatic;
  }

  update(delta: number) {
    if (this.isStatic) return;
    for (const layer of this.layers) {
      layer.x -= layer.speed * delta * 0.02;
      if (layer.x <= -layer.canvas.width) {
        layer.x += layer.canvas.width;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const layer of this.layers) {
      const w = layer.canvas.width;
      let x = layer.x;
      while (x < ctx.canvas.width) {
        ctx.drawImage(layer.canvas, x, 0);
        x += w;
      }
      if (x < 0) {
        ctx.drawImage(layer.canvas, x + w, 0);
      }
    }
  }
}

interface Theme {
  gradient: [string, string];
  mid: string;
  near: string;
  static?: boolean;
}

const THEMES: Record<number, Theme> = {
  1: { gradient: ['#5be3ec', '#1f7fae'], mid: '#79ffe1', near: '#d1fae5' },
  2: { gradient: ['#0e1726', '#09273a'], mid: '#334155', near: '#64748b' },
  3: { gradient: ['#071e3d', '#123a61'], mid: '#38bdf8', near: '#7dd3fc' },
  4: { gradient: ['#0a1124', '#1e3a8a'], mid: '#2dd4bf', near: '#c084fc' },
  5: { gradient: ['#151515', '#3d302a'], mid: '#a16207', near: '#fbbf24' },
  6: { gradient: ['#030712', '#065f46'], mid: '#10b981', near: '#a7f3d0' },
  7: { gradient: ['#030712', '#111827'], mid: '#6b7280', near: '#cbd5e1' },
  8: { gradient: ['#200b10', '#4b1e24'], mid: '#b91c1c', near: '#fecaca' },
  9: { gradient: ['#000000', '#1e293b'], mid: '#0f172a', near: '#94a3b8' },
  10: { gradient: ['#252525', '#000000'], mid: '#6b21a8', near: '#facc15', static: true }
};

function createGradientLayer(
  top: string,
  bottom: string,
  width: number,
  height: number
): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const gctx = c.getContext('2d')!;
  const gradient = gctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, top);
  gradient.addColorStop(1, bottom);
  gctx.fillStyle = gradient;
  gctx.fillRect(0, 0, width, height);
  return c;
}

function createShapeLayer(
  color: string,
  width: number,
  height: number,
  count: number
): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const sctx = c.getContext('2d')!;
  sctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const w = 20 + Math.random() * 60;
    const h = 20 + Math.random() * 40;
    const x = Math.random() * (width - w);
    const y = Math.random() * (height - h);
    sctx.globalAlpha = 0.5;
    sctx.fillRect(x, y, w, h);
    sctx.globalAlpha = 1;
  }
  return c;
}

export function loadBackground(
  level: number,
  width: number,
  height: number
): ParallaxBackground {
  const theme = THEMES[level] || THEMES[1];
  const layers: ParallaxLayer[] = [];
  const gradientCanvas = createGradientLayer(
    theme.gradient[0],
    theme.gradient[1],
    width,
    height
  );
  layers.push({ canvas: gradientCanvas, speed: 0, x: 0 });

  if (!theme.static) {
    const midCanvas = createShapeLayer(theme.mid, width, height, 8);
    const nearCanvas = createShapeLayer(theme.near, width, height, 12);
    layers.push({ canvas: midCanvas, speed: 0.15, x: 0 });
    layers.push({ canvas: nearCanvas, speed: 0.3, x: 0 });
  }

  return new ParallaxBackground(layers, theme.static);
}
