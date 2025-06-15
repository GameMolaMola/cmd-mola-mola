export type ResourceType = 'health' | 'ammo' | 'coin' | 'pizza' | 'brasilena' | 'wine';
// Строго зафиксированные размеры!
const RESOURCE_SIZES: Record<ResourceType, { width: number; height: number }> = {
  health: { width: 32, height: 32 },
  pizza: { width: 32, height: 32 },
  ammo: { width: 21, height: 64 },
  brasilena: { width: 21, height: 64 },
  coin: { width: 32, height: 32 },
  wine: { width: 21, height: 64 },
};

/**
 * Генерирует случайную, доступную для игрока позицию для ресурса с учётом платформ,
 * положения игрока и ограничений по расстоянию.
 */
export function getRandomResourcePosition({
  player,
  platforms,
  canvasWidth,
  canvasHeight,
  minDistToPlayer = 100,
  resourceWidth = 32,
  resourceHeight = 32,
}: {
  player: { x: number; y: number; width: number; height: number };
  platforms: Array<{ x: number; y: number; width: number; height: number }>;
  canvasWidth: number;
  canvasHeight: number;
  minDistToPlayer?: number;
  resourceWidth?: number;
  resourceHeight?: number;
}) {
  // ФИЛЬТР — все подходящие платформы, включая динамические!
  const suitablePlatforms = platforms.filter(p => {
    const centerX = p.x + p.width / 2;
    const centerY = p.y;
    const dist = Math.abs(centerX - (player.x + player.width/2)) + Math.abs(centerY - player.y);
    return (
      p.width > resourceWidth + 18 &&
      p.y < canvasHeight - 10 &&
      dist > minDistToPlayer
    );
  });

  if (suitablePlatforms.length === 0) {
    // fallback: почти вся область поля
    return {
      x: 40 + Math.random() * (canvasWidth - resourceWidth - 60),
      y: canvasHeight * 0.18 + Math.random() * (canvasHeight * 0.62),
    };
  }

  const pf = suitablePlatforms[Math.floor(Math.random()*suitablePlatforms.length)];
  const minX = pf.x + 8;
  const maxX = pf.x + pf.width - resourceWidth - 8;
  const x = minX + Math.random() * (maxX - minX);
  const y = pf.y - resourceHeight;
  return { x, y };
}

function isOverlap(obj: { x: number; y: number; width: number; height: number }, arr: Array<{ x: number; y: number; width: number; height: number }>) {
  for (const o of arr) {
    if (
      obj.x < o.x + o.width &&
      obj.x + obj.width > o.x &&
      obj.y < o.y + o.height &&
      obj.y + obj.height > o.y
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Универсальный спавнер ресурса: пушит {type, x, y, width, height}
 * в соответствующий массив [{...}] по типу
 */
export function spawnResourceForType({
  type,
  arrays,
  player,
  platforms,
  canvasWidth,
  canvasHeight,
  resourceWidth,
  resourceHeight,
}: {
  type: ResourceType;
  arrays: {
    health?: any[];
    ammo?: any[];
    coin?: any[];
    pizza?: any[];
    brasilena?: any[];
    wine?: any[];
  };
  player: any;
  platforms: any[];
  canvasWidth: number;
  canvasHeight: number;
  resourceWidth?: number;
  resourceHeight?: number;
}) {
  // используем константы ресурсов только!
  const { width, height } = RESOURCE_SIZES[type];

  let attempt = 0, maxAttempts = 12;
  let obj: { x: number; y: number; width: number; height: number };
  let arrs = [
    ...(arrays.coin || []),
    ...(arrays.pizza || []),
    ...(arrays.brasilena || []),
    ...(arrays.wine || [])
  ];
  do {
    const { x, y } = getRandomResourcePosition({
      player,
      platforms,
      canvasWidth,
      canvasHeight,
      resourceWidth: width,
      resourceHeight: height,
    });
    obj = { x, y, width, height };
    attempt++;
  } while (isOverlap(obj, arrs) && attempt < maxAttempts);

  if (type === "health" || type === "pizza") arrays.pizza?.push(obj);
  else if (type === "ammo" || type === "brasilena") arrays.brasilena?.push(obj);
  else if (type === "wine") arrays.wine?.push(obj);
  else if (type === "coin") arrays.coin?.push(obj);
}
