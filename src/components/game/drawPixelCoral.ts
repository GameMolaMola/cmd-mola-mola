
/**
 * Стилизованный пиксельный коралл для платформ.
 * Он выглядит как вертикальный ствол с боковыми маленькими веточками пиксельным способом.
 */
export function drawPixelCoral(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  palette: string[] = ['#e1845c', '#e7a873', '#e8d390', '#6dd5ed']
) {
  // 1. Ствол (столб)
  const trunkWidth = Math.max(6, Math.floor(width * 0.22));
  ctx.save();

  // Основной столб
  ctx.fillStyle = palette[0];
  ctx.fillRect(x + (width - trunkWidth) / 2, y, trunkWidth, height);

  // Тени на столбе
  ctx.fillStyle = palette[1];
  for (let i = 0; i < height; i += 4) {
    ctx.fillRect(x + (width - trunkWidth) / 2 + 2, y + i, trunkWidth - 4, 2);
  }
  // Светлая линия сбоку для "объема"
  ctx.fillStyle = palette[2];
  ctx.fillRect(x + (width - trunkWidth) / 2, y, 2, height);

  // 2. Веточки: пиксельные, отходят в стороны
  ctx.fillStyle = palette[3];
  for (let i = 6; i < height - 10; i += 18) {
    // Лево
    ctx.fillRect(x + (width - trunkWidth) / 2 - 7, y + i, 7, 3);
    // Право
    ctx.fillRect(x + (width + trunkWidth) / 2, y + i + 6, 7, 3);
  }
  // Пара веток вверху
  ctx.fillRect(x + (width - trunkWidth) / 2 - 5, y + 4, 5, 2);
  ctx.fillRect(x + (width + trunkWidth) / 2, y + 2, 5, 2);

  // 3. "Макушка" из пикселей (бледно-жёлтая)
  ctx.fillStyle = palette[2];
  ctx.fillRect(x + (width - trunkWidth) / 2, y - 8, trunkWidth, 8);

  ctx.restore();
}
