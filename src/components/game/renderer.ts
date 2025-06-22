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
  engine.screenShake.applyShake(ctx);

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
  engine.background?.draw(ctx);

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
   