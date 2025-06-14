
let lastWineSpawnTime = 0;
let winePowerUpTimeout: NodeJS.Timeout | null = null;

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
  canvasHeight
}: any) {
  // --- Пиццы и бразильена: всё как было ---
  for (let i = pizzas.length - 1; i >= 0; i--) {
    const pizza = pizzas[i];
    if (checkCollision(player, pizza)) {
      player.health = Math.min(player.health + 20, 100);
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

  // --- ВИНО: ускорение на 15 сек, респавн не чаще раз в 30 сек ---
  const now = Date.now();

  for (let i = wines.length - 1; i >= 0; i--) {
    const wine = wines[i];
    if (checkCollision(player, wine)) {
      // Сохраняем обычные значения если еще не были сохранены
      if (!player._baseSpeed) player._baseSpeed = player.speed ?? 5;
      if (!player._baseJump) player._baseJump = player.jumpPower ?? -15;
      // Делаем X3 boost:
      player.speed = player._baseSpeed * 3;
      player.jumpPower = player._baseJump * 3;
      wines.splice(i, 1);
      player.powerUps.speedBoost = true;
      player.powerUps.speedBoostTime = 15 * 60; // в тиках (кадр = ~16мс, 15сек = 15*60)
      player._wineBoostActive = true;
      player._wineBoostEndTime = now + 15000;

      // Если уже был таймер сброса — отменяем
      if (winePowerUpTimeout) clearTimeout(winePowerUpTimeout);

      winePowerUpTimeout = setTimeout(() => {
        // Возвращаем статы в дефолт
        player.speed = player._baseSpeed ?? 5;
        player.jumpPower = player._baseJump ?? -15;
        player.powerUps.speedBoost = false;
        player.powerUps.speedBoostTime = 0;
        player._wineBoostActive = false;
        // Не сбрасываем _baseSpeed/_baseJump — новые wine будут работать правильно
      }, 15000);

      lastWineSpawnTime = now;
      callbacks.onStateUpdate();
    }
  }

  // Спавним новый wine не чаще чем раз в 30 секунд, если на экране нет вина
  if (
    wines.length === 0 &&
    platforms &&
    platforms.length > 0 &&
    now - lastWineSpawnTime > 30000 // 30 сек
  ) {
    // Случайная платформа (кроме самой нижней)
    const availablePlatforms = platforms.filter(
      (p: any) => p.y < canvasHeight - 60
    );
    if (availablePlatforms.length > 0) {
      const pf = availablePlatforms[Math.floor(Math.random() * availablePlatforms.length)];
      wines.push({
        x: pf.x + 10 + Math.random() * (pf.width - 40),
        y: pf.y - 48,
        width: spawnBrasilenaWidth,
        height: spawnBrasilenaHeight,
      });
      lastWineSpawnTime = now;
    }
  }
}

