export function updateEnemies({ bossLucia, enemies, player, canvas, callbacks, checkCollision, godmode }: any) {
  // Если есть босс - управляем только им
  if (bossLucia) {
    // Движение босса — плавает влево-вправо, иногда двигается к игроку
    bossLucia.x += bossLucia.direction * 2;
    if (bossLucia.x <= 0 || bossLucia.x + bossLucia.width >= canvas.width) {
      bossLucia.direction *= -1;
    }
    // Немного вверх-вниз, эффект плавания
    bossLucia.y += Math.sin(Date.now() / 500) * 0.6;

    // Босс атакует игрока (можно добавить поведение), сейчас просто контакт
    if (checkCollision(player, bossLucia)) {
      if (godmode) {
        player.health = 100;
      } else {
        player.health -= 4;
        callbacks.onStateUpdate?.({ health: player.health });
        if (player.health <= 0) {
          callbacks.onGameEnd(false, {
            level: player.level,
            coins: player.coins,
            score: player.coins * 10 + player.level * 100
          });
          return;
        }
      }
    }
    return; // Не обновлять обычных врагов
  }

  // Обычные враги
  enemies.forEach(enemy => {
    if (enemy.x > player.x) {
      enemy.x -= enemy.speed;
    } else {
      enemy.x += enemy.speed;
    }

    if (enemy.x < 0) enemy.x = 0;
    if (enemy.x + enemy.width > canvas.width) {
      enemy.x = canvas.width - enemy.width;
    }
  });
}
