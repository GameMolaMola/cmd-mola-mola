
export function gameTick(engine: any) {
  // Это то же самое, что gameLoop из GameEngine, но без requestAnimationFrame.
  engine.updatePlayer({
    player: engine.player,
    platforms: engine.platforms,
    coins: engine.coins,
    pizzas: engine.pizzas,
    brasilenas: engine.brasilenas,
    wines: engine.wines,
    freeBrasilena: engine.freeBrasilena,
    canvas: engine.canvas,
    mobileControlState: engine.mobileControlState,
    keys: engine.keys,
    callbacks: engine.callbacks,
    godmode: engine.godmode
  });

  engine.updateEnemies({
    bossLucia: engine.bossLucia,
    enemies: engine.enemies,
    player: engine.player,
    canvas: engine.canvas,
    callbacks: engine.callbacks,
    checkCollision: engine.checkCollision,
    godmode: engine.godmode
  });

  if (!engine.bossLucia) {
    engine.handleEnemyCollisions(
      engine.player,
      engine.enemies,
      engine.godmode,
      engine.checkCollision,
      engine.callbacks
    );
  }

  engine.handleBonuses({
    player: engine.player,
    pizzas: engine.pizzas,
    brasilenas: engine.brasilenas,
    wines: engine.wines,
    freeBrasilena: engine.freeBrasilena,
    callbacks: engine.callbacks,
    checkCollision: engine.checkCollision,
    spawnBrasilenaWidth: 21,
    spawnBrasilenaHeight: 64,
    platforms: engine.platforms,
    canvasHeight: engine.canvas.height
  });

  engine.updateBullets({
    bullets: engine.bullets,
    enemies: engine.enemies,
    bossLucia: engine.bossLucia,
    player: engine.player,
    callbacks: engine.callbacks,
    checkCollision: engine.checkCollision,
    canvas: engine.canvas
  });
  engine.updateBubbles(engine.bubbles, engine.canvas);
  engine.renderer(engine.ctx, engine);
}
