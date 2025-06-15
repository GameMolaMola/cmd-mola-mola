import { checkCollision } from './utils/collision';
import { isGodmodeActive, applyGodmodeIfNeeded } from './godmode';
import {
  heal,
  takeDamage,
  addAmmo,
  addCoin,
  activateWineJumpBoost,
} from './playerEffects';

function takeDamage(player: any, amount: number) {
  const prev = player.health;
  player.health -= amount;
  if (player.health < 0) player.health = 0;
  console.log(`[takeDamage] from=${prev} to=${player.health}, amount=${amount}`);
}

function heal(player: any, amount: number) {
  const prev = player.health;
  player.health += amount;
  if (player.health > 100) player.health = 100;
  console.log(`[heal] from=${prev} to=${player.health}, amount=${amount}`);
}

export function updatePlayer({
  player, platforms, coins, pizzas, brasilenas, wines, freeBrasilena, canvas, mobileControlState, keys, callbacks, godmode, bullets
}: any) {
  // --- DEBUG LOGGING для треккинга положения
  console.log('[player.ts] START pos:', { x: player.x, y: player.y, grounded: player.grounded, velY: player.velY });

  let left = keys['KeyA'] || keys['ArrowLeft'] || !!mobileControlState['left'];
  let right = keys['KeyD'] || keys['ArrowRight'] || !!mobileControlState['right'];
  let jump = (keys['KeyW'] || keys['ArrowUp'] || !!mobileControlState['jump']);

  // Централизованно определяем направление
  if (left && !right) {
    player.direction = -1;
  } else if (right && !left) {
    player.direction = 1;
  } // не меняем если оба нажаты или ни один

  player.velY += 0.8;
  player.velX = 0;
  if (left) player.velX = -player.speed;
  if (right) player.velX = player.speed;

  // Анимация кадров (упрощено)
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

  // ====== Новый код для корректной поддержки движущихся платформ ======
  let platformMoveDeltaX = 0;
  let platformMoveDeltaY = 0;
  let standingOnMovingPlatform = null;
  let onMovingPlatform = false; // <- новое: стоим на движущейся платформе

  for (const platform of platforms) {
    const prevBottom = player.y + player.height - player.velY;
    const currBottom = player.y + player.height;
    const onThis =
      prevBottom <= platform.y &&
      currBottom >= platform.y &&
      player.x + player.width > platform.x + 8 &&
      player.x < platform.x + platform.width - 8 &&
      player.velY >= 0;
    if (onThis && platform.type === 'moving') {
      standingOnMovingPlatform = platform;
      onMovingPlatform = true;
      break;
    }
  }
  if (standingOnMovingPlatform) {
    platformMoveDeltaX = standingOnMovingPlatform.vx ?? 0;
    platformMoveDeltaY = Math.sin(Date.now() / 540 + standingOnMovingPlatform.x / 37) * 0.2;
  }

  // --- КОРРЕКТНЫЙ пересчет X:
  // Если игрок стоит на движущейся платформе и не двигается сам, платформа тянет его
  if (onMovingPlatform && player.velX === 0 && player.grounded) {
    player.x += platformMoveDeltaX;
  }
  player.x += player.velX;
  player.y += player.velY + platformMoveDeltaY;

  // --- Границы ---, 
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }

  // --- Детект посадки на платформу (включая пол) ---
  let landed = false;
  for (const platform of platforms) {
    const prevBottom = player.y + player.height - player.velY - (platformMoveDeltaY || 0);
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
      // Для дебага:
      console.log('[player.ts] LANDED on platform:', platform, 'player.y now', player.y);
      break;
    }
  }
  if (!landed) player.grounded = false;

  for (let i = coins.length - 1; i >= 0; i--) {
    const coin = coins[i];
    if (checkCollision(player, coin)) {
      addCoin(player, 1);
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
      heal(player, 20);
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
        width: 21,
        height: 64,
      });
    });
  }

  for (let i = brasilenas.length - 1; i >= 0; i--) {
    const brasilena = brasilenas[i];
    if (checkCollision(player, brasilena)) {
      addAmmo(player, 10);
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
      wines.splice(i, 1);
      activateWineJumpBoost(player);
      callbacks.onStateUpdate({
        health: player.health,
        ammo: player.ammo,
        coins: player.coins,
        level: player.level
      });
    }
  }

  // --- Итоговый лог ---
  console.log('[player.ts] END pos:', { x: player.x, y: player.y, grounded: player.grounded, velY: player.velY });

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
    x: direction === 1 ? player.x + player.width : player.x - 20,
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
