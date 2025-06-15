
import { updatePlayer } from './player';
import { updateEnemies } from './enemies';
import { handleEnemyCollisions } from './collisionHandlers';
import { checkCollision } from './utils/collision';
import { handleBonuses } from './bonuses';
import { updateBullets } from './bullets';
import { updateBubbles } from './environment';

export function gameTick(engine: any) {
  updatePlayer({
    player: engine.player,
    platforms: engine.getAllPlatforms(),
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
    bullets: engine.bullets   // передаём общий массив!
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

  if (!engine.bossLucia && engine.enemies.length === 0) {
    engine.setNextLevel?.();
    return;
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
    platforms: engine.getAllPlatforms(),
    canvasHeight: engine.canvas.height,
    bossLucia: engine.bossLucia // добавим для лимита вина при боссе
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

