// --- Декларация window.gameEngineInstance для TS ---
declare global {
  interface Window {
    gameEngineInstance?: any;
  }
}

export function updateBullets({ bullets, enemies, bossLucia, player, callbacks, checkCollision, canvas }: any) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.x += bullet.speed;

    // Проверка выхода пули за экран
    if (bullet.x > canvas.width || bullet.x + bullet.width < 0) {
      bullets.splice(i, 1);
      continue;
    }

    // Попадание по боссу
    if (bossLucia) {
      if (checkCollision(bullet, bossLucia)) {
        // Выпадение небольшого количества монет при каждом попадании если это босс-уровень
        if (player.level > 10 && typeof window !== "undefined" && window.gameEngineInstance) {
          // Безопасно вызываем специальный метод
          window.gameEngineInstance.spawnBossCoinsOnHit?.(3, bossLucia); // по 3 монеты за попадание
        }

        bossLucia.health -= 20;
        bullets.splice(i, 1);
        if (bossLucia.health <= 0) {
          // Финальный массовый дроп монет
          if (player.level > 10 && typeof window !== "undefined" && window.gameEngineInstance) {
            window.gameEngineInstance.spawnBossCoins?.();
          }
          // Победа над боссом
          player.level++;
          callbacks.onGameEnd(true, {
            level: player.level,
            coins: player.coins,
            score: player.coins * 10 + player.level * 100
          });
          return;
        }
      }
    } else {
      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        if (checkCollision(bullet, enemy)) {
          enemies.splice(j, 1);
          bullets.splice(i, 1);
          player.coins += 2;
          callbacks.onStateUpdate();
          break;
        }
      }
    }
  }
}
