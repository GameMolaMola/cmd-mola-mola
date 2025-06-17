
// --- Декларация window.gameEngineInstance для TS ---
declare global {
  interface Window {
    gameEngineInstance?: any;
  }
}

import { audioManager } from './audioManager';

export function updateBullets({ bullets, enemies, swordfish, bossLucia, player, callbacks, checkCollision, canvas }: any) {
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
        
        // Звук попадания
        audioManager.playDamageSound();
        
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
      // Проверка попаданий по Swordfish
      for (let j = swordfish.length - 1; j >= 0; j--) {
        const sword = swordfish[j];
        if (checkCollision(bullet, sword)) {
          swordfish.splice(j, 1);
          bullets.splice(i, 1);
          player.coins += 5; // Swordfish дает больше монет
          
          // Звук получения монет
          audioManager.playCoinSound();
          
          callbacks.onStateUpdate();
          break;
        }
      }

      // Проверка попаданий по обычным врагам (только если не попали в Swordfish)
      if (bullets[i]) { // проверяем что пуля еще существует
        for (let j = enemies.length - 1; j >= 0; j--) {
          const enemy = enemies[j];
          if (checkCollision(bullet, enemy)) {
            enemies.splice(j, 1);
            bullets.splice(i, 1);
            player.coins += 2;
            
            // Звук получения монет
            audioManager.playCoinSound();
            
            callbacks.onStateUpdate();
            break;
          }
        }
      }
    }
  }
}
