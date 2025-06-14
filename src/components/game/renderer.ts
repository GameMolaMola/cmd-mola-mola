
import { drawPixelCoral } from './drawPixelCoral';
import { drawPixelSand } from './drawPixelSand';

export function renderScene(
  ctx: CanvasRenderingContext2D,
  game: any // GameEngine instance
) {
  // вынесем практически всё содержимое оригинального render из GameEngine
  const {
    canvas, player, images, platforms,
    staticSandLayer, bubbles, coins,
    pizzas, brasilenas, wines,
    bullets, bossLucia, enemies
  } = game;

  // --- Фон ---
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#084e82");
  gradient.addColorStop(0.28, "#1e3a8a");
  gradient.addColorStop(0.55, "#2d6cbb");
  gradient.addColorStop(0.77, "#60a5fa");
  gradient.addColorStop(1, "#8bf0ff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // --- Пузыри ---
  game.updateBubbles?.();
  game.drawBubbles?.(ctx);

  // --- Платформы ---
  platforms.forEach((platform: any) => {
    if (platform.y >= canvas.height - 40 - 1) {
      if (staticSandLayer) {
        ctx.drawImage(
          staticSandLayer,
          0, 0,
          platform.width, platform.height,
          platform.x, platform.y,
          platform.width, platform.height
        );
      } else {
        drawPixelSand(
          ctx,
          platform.x, platform.y,
          platform.width, platform.height
        );
      }
    } else {
      drawPixelCoral(
        ctx, platform.x, platform.y, platform.width, platform.height,
        ['#ea866c', '#e7b76a', '#fcf596', '#89f4fb']
      );
    }
  });

  // --- Игрок ---
  let playerImage;
  if (player.velX < 0 && images.playerLeft?.complete) {
    playerImage = images.playerLeft;
  } else if (images.playerFrames?.[player.frame]?.complete) {
    playerImage = images.playerFrames[player.frame];
  } else {
    playerImage = images.playerFrames?.[0];
  }

  if (playerImage) {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
  } else {
    ctx.fillStyle = '#3498db';
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }

  // --- Монеты ---
  coins.forEach((coin: any) => {
    const image = images.coin;
    const scale = 1.4;
    const newWidth = coin.width * scale;
    const newHeight = coin.height * scale;
    const offsetX = coin.x - (newWidth - coin.width) / 2;
    const offsetY = coin.y - (newHeight - coin.height) / 2;
    if (image?.complete) {
      ctx.drawImage(image, offsetX, offsetY, newWidth, newHeight);
    } else {
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(offsetX, offsetY, newWidth, newHeight);
    }
  });

  // --- Пиццы ---
  pizzas.forEach((pizza: any) => {
    const image = images.pizza;
    if (image?.complete) {
      ctx.drawImage(image, pizza.x, pizza.y, pizza.width, pizza.height);
    } else {
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(pizza.x, pizza.y, pizza.width, pizza.height);
    }
  });

  // --- Brasilena и Wine ---
  [brasilenas, wines].forEach((group, idx) => {
    const image = idx === 0 ? images.brasilena : images.wine;
    const fallback = idx === 0 ? '#8e44ad' : '#c0392b';
    group.forEach((obj: any) => {
      if (image?.complete) {
        ctx.drawImage(image, 0, 0, image.width, image.height, obj.x, obj.y, obj.width, obj.height);
      } else {
        ctx.fillStyle = fallback;
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      }
    });
  });

  // --- Пули ---
  ctx.fillStyle = '#f39c12';
  bullets.forEach((bullet: any) => {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });

  // --- Босс и враги ---
  if (bossLucia) {
    const image = images.bossLucia;
    if (image?.complete) {
      ctx.drawImage(image, bossLucia.x, bossLucia.y, bossLucia.width, bossLucia.height);
    } else {
      ctx.fillStyle = "#AA2424";
      ctx.fillRect(bossLucia.x, bossLucia.y, bossLucia.width, bossLucia.height);
    }
    // HP bar
    ctx.save();
    ctx.globalAlpha = 0.86;
    ctx.fillStyle = "#000";
    ctx.fillRect(bossLucia.x, bossLucia.y - 18, bossLucia.width, 10);
    ctx.fillStyle = "#fcba03";
    ctx.fillRect(
      bossLucia.x, bossLucia.y - 18,
      (bossLucia.health / (200 + (player.level - 10) * 40)) * bossLucia.width, 10
    );
    ctx.restore();
  }

  // Враги
  if (!bossLucia) {
    enemies.forEach((enemy: any) => {
      let image;
      if (enemy.x > player.x && images.enemyLeft?.complete) {
        image = images.enemyLeft;
      } else if (images.enemy?.complete) {
        image = images.enemy;
      }
      if (image) {
        ctx.drawImage(image, enemy.x, enemy.y, enemy.width, enemy.height);
      } else {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      }
    });
  }
}
