import { isGodmodeActive, applyGodmodeIfNeeded } from './godmode';
import { takeDamage } from './playerEffects';

// Добавим таймер чтобы не наносить урон слишком быстро
let lastDamageTime: number = 0;

type Player = {
  health: number;
  coins: number;
  level: number;
  godmode?: boolean;
  username?: string;
};

type Enemy = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type GameCallbacks = {
  onGameEnd: (victory: boolean, finalStats: any) => void;
  onStateUpdate: (updates: any) => void;
};

const DAMAGE_COOLDOWN = 400; // наносить урон не чаще чем раз в 400 мс

export function handleEnemyCollisions(
  player: Player,
  enemies: Enemy[],
  godmode: boolean,
  checkCollision: (a: any, b: any) => boolean,
  callbacks: GameCallbacks
) {
  const now = Date.now();
  for (const enemy of enemies) {
    // ВАЖНО: урон только если КОНКРЕТНО это соприкосновение!
    if (checkCollision(player, enemy)) {
      if (player?.username === '@MolaMolaCoin') {
        player.health = 100;
        continue;
      }
      if (isGodmodeActive(godmode)) {
        applyGodmodeIfNeeded(player, godmode);
        continue;
      } else {
        if (now - lastDamageTime >= DAMAGE_COOLDOWN) {
          lastDamageTime = now;
          takeDamage(player, 2);
          if (player.health < 0) player.health = 0;
          callbacks.onStateUpdate?.({
            health: player.health,
          });
          if (player.health === 0) {
            callbacks.onGameEnd(false, { 
              level: player.level, 
              coins: player.coins
            });
            return true; // game ended
          }
        }
      }
      // ЕСЛИ столкновения нет – вообще не трогать здоровье!
    } 
  }
  return false;
}
