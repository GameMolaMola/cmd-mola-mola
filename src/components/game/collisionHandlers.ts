
import { isGodmodeActive, applyGodmodeIfNeeded } from './godmode';
import { takeDamage, Player } from './playerEffects'; // используем Player из playerEffects

// type Player -- убираем, используем импортируемый

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
  // Используем lastDamageTime на игроке (уникально для каждой игровой сессии)
  if (!('_lastDamageTime' in player)) player._lastDamageTime = 0;

  // НЕ даём несколько раз подряд выполнять урон и не трогаем если погиб
  if (player.health === 0) return false;

  let collided = false;
  for (const enemy of enemies) {
    if (checkCollision(player, enemy)) {
      collided = true;
      
      // Проверяем godmode двумя способами: через флаг godmode ИЛИ через username
      const isGodmodeUser = player?.username === '@MolaMolaCoin' || isGodmodeActive(godmode) || player.godmode;
      
      console.log('[collisionHandlers] Collision detected:', {
        username: player?.username,
        godmode: godmode,
        playerGodmode: player.godmode,
        isGodmodeUser: isGodmodeUser
      });
      
      if (isGodmodeUser) {
        // Принудительно устанавливаем здоровье в 100 для godmode пользователей
        player.health = 100;
        console.log('[collisionHandlers] Godmode active - health set to 100');
        continue;
      } else {
        if (now - player._lastDamageTime >= DAMAGE_COOLDOWN) {
          player._lastDamageTime = now;
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
    }
  }
  return false;
}
