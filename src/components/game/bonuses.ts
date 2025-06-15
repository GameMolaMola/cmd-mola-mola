let lastWineSpawnTime = 0;
let winePowerUpTimeout: NodeJS.Timeout | null = null;
let wineCollectedTotal = 0; // счётчик для всех раундов

// Максимум 10 — обычные уровни, 15 — при боссе
function getMaxWineCount(isBoss: boolean) {
  return isBoss ? 15 : 10;
}

const WINE_WIDTH = 21;
const WINE_HEIGHT = 64;

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
  bossLucia // добавлен для лимита вина
}: any) {
  // ВСЕГДА использовать platforms из getAllPlatforms() для корректного расчета!
  // --- Пиццы и бразильена: всё как было ---
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

  // --- ВИНО: прыжок x4, максимум X раз, на 10 сек, респавн не чаще раз в 30 сек ---
  const now = Date.now();
  const isBoss = !!bossLucia;
  const maxWine = getMaxWineCount(isBoss);

  for (let i = wines.length - 1; i >= 0; i--) {
    const wine = wines[i];
    if (checkCollision(player, wine)) {
      wines.splice(i, 1);
      // строгая логика через player.ts
      if (typeof player.activateJumpBoost === 'function') {
        player.activateJumpBoost();
      } else {
        if (!player._baseJumpPower) player._baseJumpPower = player.jumpPower ?? -15;
        if (player._jumpBoostTimeout) clearTimeout(player._jumpBoostTimeout);
        player.jumpPower = player._baseJumpPower * 4;
        player.powerUps.speedBoost = true;
        player.powerUps.speedBoostTime = 10 * 60;
        player._hasJumpBoost = true;
        player._jumpBoostTimeout = setTimeout(() => {
          player.jumpPower = player._baseJumpPower;
          player.powerUps.speedBoost = false;
          player.powerUps.speedBoostTime = 0;
          player._hasJumpBoost = false;
          player._jumpBoostTimeout = null;
        }, 10000);
      }
      wineCollectedTotal += 1; // увеличиваем общий счётчик
      lastWineSpawnTime = now;
      callbacks.onStateUpdate();
    }
  }

  // Спавним новый wine не чаще чем раз в 30 секунд, максимум maxWine на игру
  if (
    wines.length === 0 &&
    platforms &&
    platforms.length > 0 &&
    wineCollectedTotal < maxWine &&
    now - lastWineSpawnTime > 30000 // 30 сек
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
