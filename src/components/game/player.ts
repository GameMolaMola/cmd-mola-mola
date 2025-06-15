import { checkCollision } from './utils/collision';
import { isGodmodeActive } from './godmode';
import { addCoin } from './playerEffects';
import { audioManager } from './audioManager';

export function updatePlayer({
  player,
  platforms,
  coins,
  pizzas,
  brasilenas,
  wines,
  freeBrasilena,
  canvas,
  mobileControlState,
  keys,
  callbacks,
  godmode,
  bullets
}: any) {
  // Гравитация
  player.velY += 0.5;

  // Горизонтальное движение
  player.velX = 0;
  if (keys['ArrowLeft'] || keys['KeyA'] || mobileControlState.left) {
    player.velX = -player.speed;
    player.direction = -1;
  }
  if (keys['ArrowRight'] || keys['KeyD'] || mobileControlState.right) {
    player.velX = player.speed;
    player.direction = 1;
  }

  // Прыжок
  if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW'] || mobileControlState.jump) && player.grounded) {
    player.velY = player.jumpPower;
    player.grounded = false;
    
    // Звук прыжка
    audioManager.playJumpSound();
  }

  // Обновление позиции
  player.x += player.velX;
  player.y += player.velY;

  // Проверка границ экрана
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
  if (player.y < 0) player.y = 0;
  if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

  // Проверка столкновений с платформами
  player.grounded = false;
  for (const platform of platforms) {
    if (checkCollision(player, platform)) {
      // Столкновение сверху платформы
      if (player.velY > 0 && player.y + player.height - player.velY <= platform.y) {
        player.y = platform.y - player.height;
        player.velY = 0;
        player.grounded = true;
      }
      // Столкновение снизу платформы
      else if (player.velY < 0 && player.y - player.velY >= platform.y + platform.height) {
        player.y = platform.y + platform.height;
        player.velY = 0;
      }
      // Столкновение сбоку платформы
      else if (player.velX > 0) {
        player.x = platform.x - player.width;
      } else if (player.velX < 0) {
        player.x = platform.x + platform.width;
      }
    }
  }

  // Сбор монет
  for (let i = coins.length - 1; i >= 0; i--) {
    const coin = coins[i];
    if (checkCollision(player, coin)) {
      addCoin(player, 1);
      coins.splice(i, 1);
      
      // Звук сбора монеты
      audioManager.playCoinSound();
      
      callbacks.onStateUpdate();
    }
  }

  // Анимация
  player.frameTimer++;
  if (player.frameTimer >= player.frameRate) {
    player.frameTimer = 0;
    player.frame = (player.frame + 1) % 2;
  }

  // Проверка godmode
  if (isGodmodeActive(godmode) || player.username === '@MolaMolaCoin') {
    player.health = 100;
  }
}
