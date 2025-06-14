
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
    // УРОН больше не начисляем здесь, логику урона контролирует handleEnemyCollisions
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

    // Ограничения по полю (НЕ ДАЁМ уходить под песок)
    if (enemy.x < 0) enemy.x = 0;
    if (enemy.x + enemy.width > canvas.width) enemy.x = canvas.width - enemy.width;
    // Верх — не выходить выше canvas!
    if (enemy.y < 0) enemy.y = 0;
    // Нижняя граница: не ниже "песка" (y=canvas.height - 40)
    const sandHeight = 40;
    if (enemy.y + enemy.height > canvas.height - sandHeight) {
      enemy.y = canvas.height - sandHeight - enemy.height;
      enemy._vy = (Math.random() - 0.5) * 2; // разворачиваем движение вверх
    }

    // БОЛЬШЕ не уменьшаем здоровье игрока! Проверка столкновений только для handleEnemyCollisions
  });
}
