
import { checkCollision } from './utils/collision';
import { audioManager } from './audioManager';
import { addCoin } from './playerEffects';

export function updatePlayer({ player, platforms, coins, pizzas, brasilenas, wines, freeBrasilena, canvas, mobileControlState, keys, callbacks, godmode, bullets }: any) {
  // Get particle system from global instance
  const particleSystem = typeof window !== "undefined" && window.gameEngineInstance?.getParticleSystem?.();

  // Обработка мобильных контролов
  const leftPressed = keys.ArrowLeft || keys.KeyA || mobileControlState.left;
  const rightPressed = keys.ArrowRight || keys.KeyD || mobileControlState.right;
  const upPressed =
    keys.ArrowUp ||
    keys.KeyW ||
    keys.Space ||
    mobileControlState.jump ||
    mobileControlState.up;

  // Горизонтальное движение
  if (leftPressed) {
    player.velX = -player.speed;
    player.direction = -1;
  } else if (rightPressed) {
    player.velX = player.speed;
    player.direction = 1;
  } else {
    player.velX = 0;
  }

  // Прыжок
  if (upPressed && player.grounded) {
    player.velY = player.jumpPower;
    player.grounded = false;
    
    // Звук прыжка
    audioManager.playJumpSound();
  }

  // Гравитация
  player.velY += 0.8;

  // Обновление позиции
  player.x += player.velX;
  player.y += player.velY;

  // Проверка коллизий с платформами
  player.grounded = false;
  for (const platform of platforms) {
    if (
      player.x < platform.x + platform.width &&
      player.x + player.width > platform.x &&
      player.y + player.height > platform.y &&
      player.y < platform.y + platform.height
    ) {
      // Коллизия с платформой
      if (player.velY > 0 && player.y + player.height - player.velY <= platform.y) {
        // Приземление на платформу
        player.y = platform.y - player.height;
        player.velY = 0;
        player.grounded = true;
      } else if (player.velY < 0 && player.y - player.velY >= platform.y + platform.height) {
        // Удар головой о платформу
        player.y = platform.y + platform.height;
        player.velY = 0;
      } else if (player.velX > 0 && player.x + player.width - player.velX <= platform.x) {
        // Коллизия справа
        player.x = platform.x - player.width;
      } else if (player.velX < 0 && player.x - player.velX >= platform.x + platform.width) {
        // Коллизия слева
        player.x = platform.x + platform.width;
      }
    }
  }

  // Ограничение движения по краям экрана
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
  if (player.y < 0) player.y = 0;
  if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

  // Коллизия с монетами - используем централизованную систему
  for (let i = coins.length - 1; i >= 0; i--) {
    const coin = coins[i];
    if (checkCollision(player, coin)) {
      // Create coin collection effect
      if (particleSystem) {
        particleSystem.createCoinEffect(coin.x + coin.width / 2, coin.y + coin.height / 2);
      }

      coins.splice(i, 1);
      addCoin(player, 1);
      audioManager.playCoinSound();
      callbacks.onStateUpdate({ coins: player.coins });
    }
  }

  // Анимация игрока
  if (player.velX !== 0 || player.velY !== 0) {
    player.frameTimer += 1;
    if (player.frameTimer >= player.frameRate) {
      player.frameTimer = 0;
      player.frame = (player.frame + 1) % 2;
    }
  }

  // Обработка freeBrasilena если есть
  if (freeBrasilena && typeof freeBrasilena.update === 'function') {
    freeBrasilena.update({
      player,
      platforms,
      canvas,
      bullets,
      onCollect: () => {
        player.ammo += 20;
        audioManager.playAmmoSound();
        callbacks.onStateUpdate({ ammo: player.ammo });
      }
    });
  }
}
