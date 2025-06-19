
// --- Декларация window.gameEngineInstance для TS ---
declare global {
  interface Window {
    gameEngineInstance?: any;
  }
}

import { audioManager } from './audioManager';

export function updateBullets({ bullets, enemies, swordfish, bossLucia, player, callbacks, checkCollision, canvas }: any) {
  // Get particle system and screen shake from global instance
  const particleSystem = typeof window !== "undefined" && window.gameEngineInstance?.getParticleSystem?.();
  const screenShake = typeof window !== "undefined" && window.gameEngineInstance?.getScreenShake?.();

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
        // Create explosion effect
        if (particleSystem) {
          particleSystem.createExplosion(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, 6);
        }
        
        // Screen shake for boss hit
        if (screenShake) {
          screenShake.shake(3, 150);
        }

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
          // Big explosion for boss death
          if (particleSystem) {
            particleSystem.createExplosion(bossLucia.x + bossLucia.width / 2, bossLucia.y + bossLucia.height / 2, 15);
          }
          
          // Strong screen shake for boss death
          if (screenShake) {
            screenShake.shake(8, 400);
          }

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
          // Create impact effect
          if (particleSystem) {
            particleSystem.createImpact(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2);
            particleSystem.createCoinEffect(sword.x + sword.width / 2, sword.y + sword.height / 2);
          }
          
          // Medium screen shake for Swordfish kill
          if (screenShake) {
            screenShake.shake(2, 100);
          }

          swordfish.splice(j, 1);
          bullets.splice(i, 1);
          player.coins += 5; // Swordfish дает больше монет
          
          // Звук получения монет
          audioManager.playCoinSound();

          callbacks.onStateUpdate({ coins: player.coins });
          break;
        }
      }

      // Проверка попаданий по обычным врагам (только если не попали в Swordfish)
      if (bullets[i]) { // проверяем что пуля еще существует
        for (let j = enemies.length - 1; j >= 0; j--) {
          const enemy = enemies[j];
          if (checkCollision(bullet, enemy)) {
            // Create impact effect
            if (particleSystem) {
              particleSystem.createImpact(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2);
              particleSystem.createCoinEffect(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            }
            
            // Light screen shake for enemy kill
            if (screenShake) {
              screenShake.shake(1.5, 80);
            }

            enemies.splice(j, 1);
            bullets.splice(i, 1);
            player.coins += 2;
            
            // Звук получения монет
            audioManager.playCoinSound();

            callbacks.onStateUpdate({ coins: player.coins });
            break;
          }
        }
      }
    }
  }
}
