import { checkCollision } from './utils/collision';
import { isGodmodeActive, applyGodmodeIfNeeded } from './godmode';

export function updatePlayer({
  player, platforms, coins, pizzas, brasilenas, wines, freeBrasilena, canvas, mobileControlState, keys, callbacks, godmode, bullets
}: any) {
  // Добавим сохранение направления (left/right)
  let left = keys['KeyA'] || keys['ArrowLeft'] || !!mobileControlState['left'];
  let right = keys['KeyD'] || keys['ArrowRight'] || !!mobileControlState['right'];
  let jump = (keys['KeyW'] || keys['ArrowUp'] || !!mobileControlState['jump']);

  // Корректно переключаем направление (1 – вправо, -1 – влево)
  if (left && !right) {
    player.direction = -1;
  } else if (right && !left) {
    player.direction = 1;
  } else if (typeof player.direction !== "number") {
    player.direction = 1; // по умолчанию вправо
  }

  player.velY += 0.8;
  player.velX = 0;
  if (left) player.velX = -player.speed;
  if (right) player.velX = player.speed;

  if (player.velX !== 0 && player.grounded) {
    player.frameTimer++;
    if (player.frameTimer >= (60 / player.frameRate)) {
      player.frame = (player.frame + 1) % 2;
      player.frameTimer = 0;
    }
  } else {
    player.frame = 0;
    player.frameTimer = 0;
  }

  if (jump && player.grounded) {
    player.velY = player.jumpPower;
    player.grounded = false;
  }

  if (mobileControlState['fire']) {
    // Стреляет в текущем направлении игрока (left/right)
    if (bullets) {
      shoot({
        player,
        bullets,
        canvas,
        updateGameState: callbacks.onStateUpdate,
        lastShotTime: player._lastShotTime ?? 0,
        SHOT_COOLDOWN: 200,
        godmode
      });
      player._lastShotTime = Date.now();
    }
    mobileControlState['fire'] = false;
  }

  player.x += player.velX;
  player.y += player.velY;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }

  let landed = false;
  for (const platform of platforms) {
    const prevBottom = player.y + player.height - player.velY;
    const currBottom = player.y + player.height;
    if (
      prevBottom <= platform.y &&
      currBottom >= platform.y &&
      player.x + player.width > platform.x + 8 &&
      player.x < platform.x + platform.width - 8 &&
      player.velY >= 0
    ) {
      player.y = platform.y - player.height;
      player.velY = 0;
      player.grounded = true;
      landed = true;
      break;
    }
  }
  if (!landed) player.grounded = false;

  for (let i = coins.length - 1; i >= 0; i--) {
    const coin = coins[i];
    if (checkCollision(player, coin)) {
      player.coins++;
      coins.splice(i, 1);
      callbacks.onStateUpdate({
        health: player.health,
        ammo: player.ammo,
        coins: player.coins,
        level: player.level
      });
    }
  }

  for (let i = pizzas.length - 1; i >= 0; i--) {
    const pizza = pizzas[i];
    if (checkCollision(player, pizza)) {
      player.health = Math.min(player.health + 20, 100);
      pizzas.splice(i, 1);
      callbacks.onStateUpdate({
        health: player.health,
        ammo: player.ammo,
        coins: player.coins,
        level: player.level
      });
    }
  }

  if (freeBrasilena) {
    freeBrasilena.trigger(player.ammo, platforms, canvas.height, (pos: any) => {
      brasilenas.push({
        x: pos.x,
        y: pos.y,
        width: 32,
        height: 32,
      });
    });
  }

  for (let i = brasilenas.length - 1; i >= 0; i--) {
    const brasilena = brasilenas[i];
    if (checkCollision(player, brasilena)) {
      player.ammo += 10;
      brasilenas.splice(i, 1);
      if (freeBrasilena) freeBrasilena.onPickup();
      callbacks.onStateUpdate({
        health: player.health,
        ammo: player.ammo,
        coins: player.coins,
        level: player.level
      });
    }
  }

  for (let i = wines.length - 1; i >= 0; i--) {
    const wine = wines[i];
    if (checkCollision(player, wine)) {
      player.powerUps.speedBoost = true;
      player.powerUps.speedBoostTime = 300;
      player.speed = 8;
      wines.splice(i, 1);
      callbacks.onStateUpdate({
        health: player.health,
        ammo: player.ammo,
        coins: player.coins,
        level: player.level
      });
    }
  }

  return { player };
}

function shoot({
  player, bullets, canvas, updateGameState, lastShotTime, SHOT_COOLDOWN, godmode
}: any) {
  const currentTime = Date.now();
  if (player.ammo <= 0 || currentTime - lastShotTime < SHOT_COOLDOWN) {
    return;
  }
  const direction = typeof player.direction === "number" ? player.direction : 1;
  bullets.push({
    x: direction === 1 ? player.x + player.width : player.x - 20, // Влево/вправо
    y: player.y + player.height / 2 - 5,
    width: 20,
    height: 10,
    speed: 10 * direction,
    direction
  });
  player.ammo--;
  lastShotTime = currentTime;

  if (isGodmodeActive(godmode)) {
    applyGodmodeIfNeeded(player, godmode);
  }
  updateGameState({
    health: player.health,
    ammo: player.ammo,
    coins: player.coins,
    level: player.level
  });
}
