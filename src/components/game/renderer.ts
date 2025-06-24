import { drawPixelCoral } from './drawPixelCoral';
import { drawPixelSand } from './drawPixelSand';

function isImageLoaded(img?: HTMLImageElement): img is HTMLImageElement {
  return !!img && img.complete && img.naturalWidth > 0;
}

export function renderScene(
  ctx: CanvasRenderingContext2D,
  engine: any // GameEngine instance
) {
  // Apply screen shake at the beginning
  engine.getScreenShake().applyShake(ctx);

  // Ensure alpha is reset before drawing
  ctx.globalAlpha = 1;

  // вынесем практически всё содержимое оригинального render из GameEngine
  const {
    canvas, player, images, platforms,
    staticSandLayer, bubbles, coins,
    pizzas, brasilenas, wines,
    bullets, bossLucia, enemies, swordfish
  } = engine;

  // --- Фон ---
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#084e82");
  gradient.addColorStop(0.28, "#1e3a8a");
  gradient.addColorStop(0.55, "#2d6cbb");
  gradient.addColorStop(0.77, "#60a5fa");
  gradient.addColorStop(1, "#8bf0ff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw scrolling parallax background on top of the gradient
  const layers = engine.parallaxLayers;
  if (layers && isImageLoaded(layers.far)) {
    ctx.drawImage(layers.far, 0, 0);
    ctx.drawImage(layers.mid, 0, 0);
    ctx.drawImage(layers.near, 0, 0);
  }

  // --- Пузыри ---
  engine.updateBubbles?.();
  engine.drawBubbles?.(ctx);

  // --- Динамические платформы ---
  const allPlatforms = (engine.getAllPlatforms?.() ?? engine.platforms);
  allPlatforms.forEach((platform: any) => {
    if (platform.type === 'disappearing') {
      ctx.save();
      ctx.globalAlpha = 0.68;
      ctx.fillStyle = platform.color;
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      ctx.restore();
    } else if (platform.type === 'moving') {
      ctx.save();
      ctx.shadowBlur = 16;
      ctx.shadowColor = "#a7fcb2";
      ctx.globalAlpha = 0.96;
      ctx.fillStyle = platform.color;
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      ctx.restore();
    } else if (platform.y >= engine.canvas.height - 40 - 1 && !platform.type) {
      // обычный "sand"
      if (engine.staticSandLayer) {
        ctx.drawImage(
          engine.staticSandLayer,
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
  let playerImage: HTMLImageElement | undefined;
  if (player.velX < 0 && isImageLoaded(images.playerLeft)) {
    playerImage = images.playerLeft;
  } else if (isImageLoaded(images.playerFrames?.[player.frame])) {
    playerImage = images.playerFrames[player.frame];
  } else if (isImageLoaded(images.playerFrames?.[0])) {
    playerImage = images.playerFrames[0];
  }

  if (playerImage && isImageLoaded(playerImage)) {
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
    if (isImageLoaded(image)) {
      ctx.drawImage(image, offsetX, offsetY, newWidth, newHeight);
    } else {
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(offsetX, offsetY, newWidth, newHeight);
    }
  });

  // --- Пиццы ---
  pizzas.forEach((pizza: any) => {
    const image = images.pizza;
    if (isImageLoaded(image)) {
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
      if (isImageLoaded(image)) {
        ctx.drawImage(image, 0, 0, image.width, image.height, obj.x, obj.y, obj.width, obj.height);
      } else {
        ctx.fillStyle = fallback;
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      }
    });
  });

  // --- ПУЛИ (ИСПРАВЛЕНО для лучшей видимости на мобильных) ---
  bullets.forEach((bullet: any) => {
    ctx.save();

    // Безопасное определение мобильных устройств
    const isMobile = typeof navigator !== 'undefined' &&
      /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    const bulletScale = isMobile ? 1.5 : 1;
    const scaledWidth = bullet.width * bulletScale;
    const scaledHeight = bullet.height * bulletScale;
    
    // Яркий цвет с обводкой для лучшей видимости
    ctx.fillStyle = '#ff6b35';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    // Рисуем пулю с увеличенным размером
    ctx.fillRect(
      bullet.x - (scaledWidth - bullet.width) / 2, 
      bullet.y - (scaledHeight - bullet.height) / 2, 
      scaledWidth, 
      scaledHeight
    );
    ctx.strokeRect(
      bullet.x - (scaledWidth - bullet.width) / 2, 
      bullet.y - (scaledHeight - bullet.height) / 2, 
      scaledWidth, 
      scaledHeight
    );
    
    ctx.restore();
  });

  // --- Swordfish враги ---
  swordfish.forEach((sword: any) => {
    let image: HTMLImageElement | undefined;
    if (sword.direction < 0 && isImageLoaded(images.swordfishLeft)) {
      image = images.swordfishLeft;
    } else if (isImageLoaded(images.swordfishRight)) {
      image = images.swordfishRight;
    }

    if (isImageLoaded(image)) {
      const frameWidth = image.width / 2;
      ctx.drawImage(
        image,
        sword.frame * frameWidth,
        0,
        frameWidth,
        image.height,
        sword.x,
        sword.y,
        sword.width,
        sword.height
      );
    } else {
      // Логирование только в dev-режиме
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Rendering fallback for Swordfish. Image not loaded:', image?.src || image);
      }
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(sword.x, sword.y, sword.width, sword.height);
    }
  });

  // --- Босс и обычные враги ---
  if (bossLucia) {
    const image = images.bossLucia;
    if (isImageLoaded(image)) {
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

  // Обычные враги
  if (!bossLucia) {
    enemies.forEach((enemy: any) => {
      let image: HTMLImageElement | undefined;
      if (enemy.x > player.x && isImageLoaded(images.enemyLeft)) {
        image = images.enemyLeft;
      } else if (isImageLoaded(images.enemy)) {
        image = images.enemy;
      }
      if (isImageLoaded(image)) {
        ctx.drawImage(image, enemy.x, enemy.y, enemy.width, enemy.height);
      } else {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      }
    });
  }

  // Render particle effects on top of everything else
  engine.getParticleSystem().render(ctx);

  // Reset screen shake at the end
  engine.getScreenShake().resetShake(ctx);

  // Restore default alpha in case effects changed it
  ctx.globalAlpha = 1;
}
