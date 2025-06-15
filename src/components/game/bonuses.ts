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

import {
  activateWineJumpBoost,
  heal,
  addAmmo,
  addCoin
} from './playerEffects';
import { audioManager } from './audioManager';

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
  // --- Пиццы ---
  for (let i = pizzas.length - 1; i >= 0; i--) {
    const pizza = pizzas[i];
    if (checkCollision(player, pizza)) {
      heal(player, 20);
      pizzas.splice(i, 1);
      // Звук сбора предмета
      audioManager.playItemSound();
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
      addAmmo(player, 10);
      brasilenas.splice(i, 1);
      if (freeBrasilena) freeBrasilena.onPickup();
      // Звук сбора предмета
      audioManager.playItemSound();
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
      activateWineJumpBoost(player);
      wineCollectedTotal += 1;
      lastWineSpawnTime = now;
      // Звук сбора предмета
      audioManager.playItemSound();
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
