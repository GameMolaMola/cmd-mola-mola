
export function updateBullets({ bullets, enemies, bossLucia, player, callbacks, checkCollision, canvas }: any) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.x += bullet.speed; // speed теперь может быть отрицательным (влево)

    // Проверяем, не ушла ли пуля за пределы (влево И/ИЛИ вправо)
    if (bullet.x > canvas.width || bullet.x + bullet.width < 0) {
      bullets.splice(i, 1);
      continue;
    }

    // Попадание по боссу
    if (bossLucia) {
      if (checkCollision(bullet, bossLucia)) {
        bossLucia.health -= 20;
        bullets.splice(i, 1);
        if (bossLucia.health <= 0) {
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
