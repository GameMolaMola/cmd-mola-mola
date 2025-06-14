
export function generateBubbles(bubbles: any[], canvas: HTMLCanvasElement) {
  if (bubbles.length < 100) {
    bubbles.push({
      x: 8 + Math.random() * (canvas.width - 16),
      y: canvas.height + Math.random() * 20,
      radius: 1.5 + Math.random() * 5.5,
      speed: 0.7 + Math.random() * 1.3,
      drift: (Math.random() - 0.5) * 0.35,
      driftPhase: Math.random() * Math.PI * 2,
      alpha: 0.15 + Math.random() * 0.7
    });
  }
}

export function updateBubbles(bubbles: any[], canvas: HTMLCanvasElement) {
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    b.y -= b.speed;
    b.x += Math.sin(Date.now() * 0.001 + b.driftPhase) * b.drift;
    b.alpha = Math.max(0.05, b.alpha - 0.0008);
    if (b.y + b.radius < 0 || b.x < -10 || b.x > canvas.width + 10) {
      bubbles.splice(i, 1);
    }
  }
  generateBubbles(bubbles, canvas);
}

export function drawBubbles(ctx: CanvasRenderingContext2D, bubbles: any[]) {
  for (const b of bubbles) {
    ctx.save();
    ctx.globalAlpha = b.alpha;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = b.radius > 4 ? '#e0f7fa' : (Math.random() > 0.6 ? '#b9eafe' : '#d1f5fa');
    ctx.shadowColor = '#bcf3f9';
    ctx.shadowBlur = b.radius > 3 ? 8 : 2;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}
