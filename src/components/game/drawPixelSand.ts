
/**
 * Рисует пиксель-арт песочный слой с ракушками.
 * Опционально поддерживает любое число ракушек, выглядящих по-разному.
 */
export function drawPixelSand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number = 0 // Для псевдослучайности, если нужно одинаково отрисовывать
) {
  // Основной цвет песка
  ctx.save();

  // 1. Основной песчаный слой
  ctx.fillStyle = '#efe6c7'; // Светлый песок
  ctx.fillRect(x, y, width, height);

  // 2. Шум по песку (пятнышки и точки)
  for (let i = 0; i < Math.floor(width * height / 60); i++) {
    const px = x + Math.floor(Math.random() * width);
    const py = y + Math.floor(Math.random() * height * 0.85 + height * 0.1);
    ctx.fillStyle = i % 3 === 0 ? '#d0c09a' : (i % 5 === 0 ? '#f3eac4' : '#e6d4b2');
    ctx.fillRect(px, py, 1 + Math.random() * 2, 1 + Math.random());
  }

  // 3. Несколько ракушек (рандомный набор, простая пиксель-форма)
  const shellPalette = [
    '#e3cdac', // светлая ракушка
    '#e59a99', // розоватая
    '#aac9e6', // голубая
    '#fff7e5'  // белая
  ];
  for (let i = 0; i < Math.floor(width / 70); i++) {
    // Положение
    const sx = x + 6 + Math.round(Math.random() * (width - 24));
    const sy = y + height - (7 + Math.round(Math.random() * 7));
    ctx.save();
    ctx.globalAlpha = 0.86 + Math.random() * 0.14;
    ctx.fillStyle = shellPalette[Math.floor(Math.random() * shellPalette.length)];
    switch (Math.floor(Math.random() * 3)) {
      case 0: // Маленькая полукруглая ракушка
        ctx.beginPath();
        ctx.arc(sx, sy, 5, Math.PI, 2 * Math.PI, false);
        ctx.lineTo(sx + 5, sy + 3);
        ctx.arc(sx, sy + 3, 5, 0, Math.PI, true);
        ctx.closePath();
        ctx.fill();
        // точки-ребра
        ctx.fillStyle = '#deb288';
        for (let d = -3; d <= 3; d++) {
          ctx.fillRect(sx + d, sy + 1 + Math.abs(d), 1, 1);
        }
        break;
      case 1: // Спиралеобразная (улитка)
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.strokeStyle = '#dcc494';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, 2 * Math.PI, false);
        ctx.stroke();
        break;
      default: // Просто камешек
        ctx.beginPath();
        ctx.ellipse(sx, sy, 3 + Math.random() * 2, 1.7 + Math.random() * 1.5, Math.random() * Math.PI, 0, 2 * Math.PI);
        ctx.fill();
        break;
    }
    ctx.restore();
  }

  ctx.restore();
}
