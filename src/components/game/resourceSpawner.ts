export type ResourceType = 'health' | 'ammo' | 'coin' | 'pizza' | 'brasilena' | 'wine';

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
  resourceWidth = 32,
  resourceHeight = 32,
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
  const { x, y } = getRandomResourcePosition({
    player,
    platforms,
    canvasWidth,
    canvasHeight,
    resourceWidth,
    resourceHeight,
  });
  const obj = { x, y, width: resourceWidth, height: resourceHeight };
  if (type === "health" || type === "pizza") arrays.pizza?.push(obj);
  else if (type === "ammo" || type === "brasilena") arrays.brasilena?.push(obj);
  else if (type === "wine") arrays.wine?.push(obj);
  else if (type === "coin") arrays.coin?.push(obj);
}
