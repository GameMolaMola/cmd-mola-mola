
import { updatePlayer } from './player';
import { updateEnemies } from './enemies';
import { handleEnemyCollisions } from './collisionHandlers';
import { checkCollision } from './utils/collision';
import { handleBonuses } from './bonuses';
import { updateBullets } from './bullets';
import { updateBubbles } from './environment';

export function gameTick(engine: any) {
  // Use standalone functions instead of engine methods.
  updatePlayer({
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
    godmode: engine.godmode,
  });

  updateEnemies({
    bossLucia: engine.bossLucia,
    enemies: engine.enemies,
    player: engine.player,
    canvas: engine.canvas,
    callbacks: engine.callbacks,
    checkCollision,
    godmode: engine.godmode,
  });

  // ---- ADD WIN CONDITION CHECK FOR REGULAR LEVELS ----
  if (!engine.bossLucia && engine.enemies.length === 0) {
    // Player has completed the level: win!
    engine.callbacks.onGameEnd(true, {
      level: engine.player.level,
      coins: engine.player.coins,
      score: (engine.player.coins ?? 0) * 10 + (engine.player.level ?? 1) * 100,
    });
    return; // Stop further processing; next frame will reset or game will stop.
  }

  if (!engine.bossLucia) {
    handleEnemyCollisions(
      engine.player,
      engine.enemies,
      engine.godmode,
      checkCollision,
      engine.callbacks
    );
  }

  handleBonuses({
    player: engine.player,
    pizzas: engine.pizzas,
    brasilenas: engine.brasilenas,
    wines: engine.wines,
    freeBrasilena: engine.freeBrasilena,
    callbacks: engine.callbacks,
    checkCollision,
    spawnBrasilenaWidth: 21,
    spawnBrasilenaHeight: 64,
    platforms: engine.platforms,
    canvasHeight: engine.canvas.height
  });

  updateBullets({
    bullets: engine.bullets,
    enemies: engine.enemies,
    bossLucia: engine.bossLucia,
    player: engine.player,
    callbacks: engine.callbacks,
    checkCollision,
    canvas: engine.canvas
  });
  updateBubbles(engine.bubbles, engine.canvas);
  engine.renderer(engine.ctx, engine);
}

