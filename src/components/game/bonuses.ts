let lastWineSpawnTime = 0;
let winePowerUpTimeout: NodeJS.Timeout | null = null;
let wineCollectedTotal = 0; // Счётчик вин на уровень
let perLevelWineLimitLast = 0; // Для сброса между уровнями

// Максимум 10 — обычные уровни, 15 — при боссе
function getMaxWineCount(isBoss: boolean) {
  return isBoss ? 15 : 10;
}

const WINE_WIDTH = 21;
const WINE_HEIGHT = 64;

export function resetWineOnLevelStart(isBoss: boolean) {
  wineCollectedTotal = 0;
  perLevelWineLimitLast = getMaxWineCount(isBoss);
  lastWineSpawnTime = 0;
}
export function handleBonuses({
  player,
  pizzas,
  brasilenas,
  wines,
  freeBrasilena,
  callbacks,
  checkCollision,
  spawnBrasilenaWidth = 21,
  spawnBrasilenaHeight = 64,
  platforms,
  canvasHeight,
  bossLucia // для лимита вина
}: any) {
  // Пиццы и бразилену не трогаем — оставляем прежнюю логику
  for (let i = pizzas.length - 1; i >= 0; i--) {
    const pizza = pizzas[i];
    if (checkCollision(player, pizza)) {
      if (typeof player.heal === "function") {
        player.heal(20);
      } else {
        player.health = Math.min(player.health + 20, 100);
      }
      pizzas.splice(i, 1);
      callbacks.onStateUpdate();
    }
  }

  if (freeBrasilena) {
    freeBrasilena.trigger(
      player.ammo,
      platforms || [],
      canvasHeight || 0,
      (pos: { x: number; y: number }) => {
        brasilenas.push({
          x: pos.x,
          y: pos.y,
          width: spawnBrasilenaWidth,
          height: spawnBrasilenaHeight,
        });
      }
    );
  }

  for (let i = brasilenas.length - 1; i >= 0; i--) {
    const brasilena = brasilenas[i];
    if (checkCollision(player, brasilena)) {
      player.ammo += 10;
      brasilenas.splice(i, 1);
      if (freeBrasilena) freeBrasilena.onPickup();
      callbacks.onStateUpdate();
    }
  }

  // --- ВИНО: прыжок x4, максимум X раз за уровень, на 10 сек, респавн не чаще раз в 30 сек ---
  const now = Date.now();
  const isBoss = !!bossLucia;
  const maxWine = getMaxWineCount(isBoss);

  for (let i = wines.length - 1; i >= 0; i--) {
    const wine = wines[i];
    if (checkCollision(player, wine)) {
      wines.splice(i, 1);
      // Эффект вина: включаем только если нет активного таймера
      if (!player._wineBoostTimeout) {
        player._originalJumpPower = typeof player.jumpPower === "number"
          ? player.jumpPower
          : -15;
        player.jumpPower = player._originalJumpPower * 4;
        player._hasWineJumpBoost = true;
        player._wineBoostTimeout = setTimeout(() => {
          player.jumpPower = player._originalJumpPower;
          player._hasWineJumpBoost = false;
          player._wineBoostTimeout = null;
        }, 10000);
      } else {
        // если собрали новое вино при активном бусте — только переустанавливаем таймер, не усиливаем jumpPower
        clearTimeout(player._wineBoostTimeout);
        player._wineBoostTimeout = setTimeout(() => {
          player.jumpPower = player._originalJumpPower;
          player._hasWineJumpBoost = false;
          player._wineBoostTimeout = null;
        }, 10000);
      }
      wineCollectedTotal += 1;
      lastWineSpawnTime = now;
      callbacks.onStateUpdate();
    }
  }

  // Ограниченный лимит появления вина на уровень
  const shouldSpawnMoreWine =
    wineCollectedTotal < maxWine &&
    (perLevelWineLimitLast === 0 || perLevelWineLimitLast === maxWine);

  if (
    wines.length === 0 &&
    platforms &&
    platforms.length > 0 &&
    shouldSpawnMoreWine &&
    now - lastWineSpawnTime > 30000 // 30 сек между появлениями
  ) {
    const availablePlatforms = platforms.filter(
      (p: any) => p.y < canvasHeight - 60
    );
    if (availablePlatforms.length > 0) {
      const pf = availablePlatforms[Math.floor(Math.random() * availablePlatforms.length)];
      wines.push({
        x: pf.x + 10 + Math.random() * (pf.width - 40),
        y: pf.y - WINE_HEIGHT,
        width: WINE_WIDTH,
        height: WINE_HEIGHT,
      });
      lastWineSpawnTime = now;
    }
  }
}
