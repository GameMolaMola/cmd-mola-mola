
/**
 * Хелперы для динамических платформ (platformType: 'static' | 'disappearing' | 'moving')
 */
export type DynamicPlatform = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  type: 'static' | 'disappearing' | 'moving';
  created: number;
  disappearAfter?: number; // ms
  vx?: number; // speed for moving
  vy?: number;
  touched?: boolean; // for disappearing
};

export function spawnDynamicPlatform(
  canvasWidth: number,
  canvasHeight: number,
  existingPlatforms: DynamicPlatform[],
  type: 'static' | 'disappearing' | 'moving' = 'static'
): DynamicPlatform {
  const width = 80 + Math.round(Math.random() * 60);
  const height = 18 + Math.round(Math.random() * 8);
  // Высота появления: от 20% до 70% поля (Y)
  const minY = canvasHeight * 0.2;
  const maxY = canvasHeight * 0.7;
  let x = 30 + Math.random() * (canvasWidth - width - 60);
  let y = minY + Math.random() * (maxY - minY);

  // Не пересекаем близко другие платформы
  for (let tries = 0; tries < 10; tries++) {
    const collides = existingPlatforms.some(
      (p) =>
        Math.abs(p.x - x) < width + 30 &&
        Math.abs(p.y - y) < height + 15
    );
    if (!collides) break;
    x = 30 + Math.random() * (canvasWidth - width - 60);
    y = minY + Math.random() * (maxY - minY);
  }

  const now = Date.now();
  const platform: DynamicPlatform = {
    x,
    y,
    width,
    height,
    color:
      type === 'static'
        ? '#fff7a0'
        : type === 'disappearing'
        ? '#b4d8ff'
        : '#a4fcb2',
    type,
    created: now,
    disappearAfter: type === 'disappearing' ? 2200 : undefined,
    vx: type === 'moving' ? (Math.random() > 0.5 ? 1 : -1) * (1.2 + Math.random()) : 0,
    vy: 0,
    touched: false,
  };
  return platform;
}

export function updateDynamicPlatforms(
  platforms: DynamicPlatform[],
  deltaTime: number,
  canvasWidth: number,
  canvasHeight: number
) {
  // Движение и исчезновение по времени
  for (let i = platforms.length - 1; i >= 0; i--) {
    const plat = platforms[i];

    // Удаляем платформы, ушедшие за границы или истёк "lifetime"
    if (
      plat.type === 'disappearing' &&
      plat.touched &&
      Date.now() - plat.created > (plat.disappearAfter ?? 1800)
    ) {
      platforms.splice(i, 1);
      continue;
    }
    if (
      plat.type === 'moving'
    ) {
      plat.x += plat.vx ?? 0;
      // подпрыгивает по синусу:
      plat.y += Math.sin(Date.now() / 540 + plat.x / 37) * 0.2;
      // отражение от границы
      if (plat.x < 25 || plat.x + plat.width > canvasWidth - 15) {
        plat.vx = -(plat.vx ?? 1);
      }
    }
    // удалять те, что слишком долго живут (15 сек)
    if (Date.now() - plat.created > 15000) {
      platforms.splice(i, 1);
    }
  }
}
