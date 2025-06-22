
export function updateEnemies({ bossLucia, enemies, swordfish, player, canvas, callbacks, checkCollision, godmode }: any) {
  // Если есть босс - управляем только им
  if (bossLucia) {
    // Движение босса — плавает влево-вправо, иногда двигается к игроку
    bossLucia.x += bossLucia.direction * 2;
    if (bossLucia.x <= 0 || bossLucia.x + bossLucia.width >= canvas.width) {
      bossLucia.direction *= -1;
    }
    // Немного вверх-вниз, эффект плавания
    bossLucia.y += Math.sin(Date.now() / 500) * 0.6;

    // Босс атакует игрока: логику урона полностью контролирует внешний модуль!
    return;
  }

  // Хаотичное движение обычных рыб
  enemies.forEach(enemy => {
    // Вертикальное плавание
    if (!enemy._vy) enemy._vy = (Math.random() - 0.5) * 2;
    if (!enemy._chaosTimer || enemy._chaosTimer < Date.now()) {
      enemy._vy = (Math.random() - 0.5) * 3;
      enemy._vx = (Math.random() - 0.5) * (2 + Math.random() * 2);
      enemy._chaosTimer = Date.now() + 500 + Math.random() * 1500;
    }

    let towardPlayer = enemy.x > player.x ? -1 : 1;
    let speedBase = enemy.speed ?? 1;
    let sideMove = (enemy._vx || 0) + towardPlayer * (speedBase * (0.35 + Math.random() * 0.7));
    enemy.x += sideMove;
    enemy.y += enemy._vy || 0;

    if (enemy.x < 0) enemy.x = 0;
    if (enemy.x + enemy.width > canvas.width) enemy.x = canvas.width - enemy.width;
    if (enemy.y < 0) enemy.y = 0;

    const sandHeight = 40;
    if (enemy.y + enemy.height > canvas.height - sandHeight) {
      enemy.y = canvas.height - sandHeight - enemy.height;
      enemy._vy = (Math.random() - 0.5) * 2;
    }
    // Вся обработка урона отдельным модулем!
  });

  // Обновление Swordfish - горизонтальное движение по середине экрана
  swordfish.forEach(sword => {
    // Пропускаем обновление, если рыба вне экрана
    if (
      sword.x + sword.width < 0 ||
      sword.x > canvas.width ||
      sword.y + sword.height < 0 ||
      sword.y > canvas.height
    ) {
      return;
    }

    // Инициализация направления движения если не задано
    if (!sword.direction) {
      sword.direction = Math.random() > 0.5 ? 1 : -1;
    }

    // Горизонтальное движение
    sword.x += sword.direction * 3;

    // Смена направления при достижении границ экрана
    if (sword.x <= 0) {
      sword.x = 0;
      sword.direction = 1;
    } else if (sword.x + sword.width >= canvas.width) {
      sword.x = canvas.width - sword.width;
      sword.direction = -1;
    }

    // Небольшие вертикальные колебания для реалистичности
    if (!sword._wavePhase) sword._wavePhase = Math.random() * Math.PI * 2;
    sword._wavePhase += 0.05;
    sword.y += Math.sin(sword._wavePhase) * 0.5;

    // Анимация
    sword.frameTimer = (sword.frameTimer ?? 0) + 1;
    if (sword.frameTimer >= sword.frameRate) {
      sword.frameTimer = 0;
      sword.frame = (sword.frame + 1) % 2;
    }

    // Ограничиваем вертикальное движение
    const minY = canvas.height * 0.3;
    const maxY = canvas.height * 0.7 - sword.height;
    if (sword.y < minY) sword.y = minY;
    if (sword.y > maxY) sword.y = maxY;
  });
}
