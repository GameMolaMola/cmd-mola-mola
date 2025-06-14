
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
      // Не наносим урон @MolaMolaCoin
      if (player?.username === '@MolaMolaCoin') {
        player.health = 100;
      } else if (godmode) {
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

  // Хаотичное движение обычных рыб
  enemies.forEach(enemy => {
    // Вертикальное плавание (немного вверх/вниз)
    if (!enemy._vy) enemy._vy = (Math.random() - 0.5) * 2;
    if (!enemy._chaosTimer || enemy._chaosTimer < Date.now()) {
      // Раз в 0.5–2с меняем направление случайно
      enemy._vy = (Math.random() - 0.5) * 3;
      enemy._vx = (Math.random() - 0.5) * (2 + Math.random() * 2);
      enemy._chaosTimer = Date.now() + 500 + Math.random() * 1500;
    }

    // Движение к игроку + "хаос"
    let towardPlayer = enemy.x > player.x ? -1 : 1;
    let speedBase = enemy.speed ?? 1;
    let sideMove = (enemy._vx || 0) + towardPlayer * (speedBase * (0.35 + Math.random() * 0.7));
    enemy.x += sideMove;
    enemy.y += enemy._vy || 0;

    // Ограничения по полю
    if (enemy.x < 0) enemy.x = 0;
    if (enemy.x + enemy.width > canvas.width) enemy.x = canvas.width - enemy.width;
    // Не даём рыбам улетать за пределы
    if (enemy.y < 0) enemy.y = 0;
    if (enemy.y + enemy.height > canvas.height - 36) enemy.y = canvas.height - enemy.height - 2;

    if (checkCollision(player, enemy)) {
      if (player?.username === '@MolaMolaCoin') {
        player.health = 100;
      } else if (godmode) {
        player.health = 100;
      } else {
        player.health -= 2;
        callbacks.onStateUpdate?.({ health: player.health });
        if (player.health <= 0) {
          callbacks.onGameEnd(false, {
            level: player.level,
            coins: player.coins,
            score: player.coins * 10
          });
          return;
        }
      }
    }
  });
}
